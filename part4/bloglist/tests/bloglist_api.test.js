const { test, describe, beforeEach, after } = require('node:test')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const assert = require('node:assert')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('./test_helper')
const api = supertest(app)


beforeEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })
    const savedUser = await user.save()

    // Actualizar los valores iniciales de los blogs con el ID del usuario recién creado
    const blogsWithUser = helper.initialBlogs.map(blog => ({
        ...blog,
        user: savedUser._id // Asociar el blog al usuario recién creado
    }))
    console.log('Blogs iniciales con usuario:', blogsWithUser)
    await Blog.insertMany(blogsWithUser)
})

describe('GET /api/blogs', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('unique identifier property of blog posts is named id', async () => {
        const response = await api.get('/api/blogs')

        response.body.forEach(blog => {
            assert(blog.id !== undefined, 'Expected blog to have an id property')
            assert(blog._id === undefined, 'Expected blog not to have an _id property')
        })
    })
})

describe('POST /api/blogs', () => {
    let token

    beforeEach(async () => {
        const user = await User.findOne({ username: 'root' })
        const userForToken = { username: user.username, id: user._id }
        token = jwt.sign(userForToken, process.env.SECRET)
    })

    test('a valid blog can be added', async () => {
        const newBlog = {
            title: "New Blog Post",
            author: "Test Author",
            url: "http://example.com/blog",
            likes: 3
        }

        const blogsAtStart = await api.get('/api/blogs')

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await api.get('/api/blogs')
        assert.strictEqual(blogsAtEnd.body.length, blogsAtStart.body.length + 1)

        const titles = blogsAtEnd.body.map(blog => blog.title)
        assert(titles.includes(newBlog.title), 'New blog title not found in the database')
    })

    test('if likes property is missing, it defaults to 0', async () => {
        const newBlog = {
            title: "Blog without likes",
            author: "No Likes Author",
            url: "http://example.com/nolikes"
        }

        const response = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        assert.strictEqual(response.body.likes, 0, 'Expected likes to default to 0')
    })

    test('if title or url is missing, responds with 400 Bad Request', async () => {
        const blogWithoutTitle = {
            author: "Author Test",
            url: "http://example.com/notitle",
            likes: 4
        }

        const blogWithoutUrl = {
            title: "No URL Blog",
            author: "Author Test",
            likes: 4
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(blogWithoutTitle)
            .expect(400)

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(blogWithoutUrl)
            .expect(400)
    })

    test('fails with 401 Unauthorized if no token is provided', async () => {
        const newBlog = {
            title: "Unauthorized Blog",
            author: "No Token Author",
            url: "http://example.com/unauthorized",
            likes: 0
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await api.get('/api/blogs')
        const titles = blogsAtEnd.body.map(blog => blog.title)
        assert(!titles.includes(newBlog.title), 'Unauthorized blog should not be added to the database')
    })
})

describe('DELETE /api/blogs/:id', () => {
    let token

    beforeEach(async () => {
        const user = await User.findOne({ username: 'root' })
        const userForToken = { username: user.username, id: user._id }
        token = jwt.sign(userForToken, process.env.SECRET)
    })

    test('a blog can be deleted', async () => {
        const blogsAtStart = await api.get('/api/blogs')
        const blogToDelete = blogsAtStart.body[0] // Seleccionar el primer blog

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)

        const blogsAtEnd = await api.get('/api/blogs')

        assert.strictEqual(blogsAtEnd.body.length, blogsAtStart.body.length - 1)

        const ids = blogsAtEnd.body.map(blog => blog.id)
        assert(!ids.includes(blogToDelete.id), 'Deleted blog ID should not exist in the database')
    })
})

describe('PUT /api/blogs/:id', () => {
    test('a blog\'s likes can be updated', async () => {
        const blogsAtStart = await api.get('/api/blogs')
        const blogToUpdate = blogsAtStart.body[0] // Seleccionar el primer blog

        const updatedLikes = { likes: blogToUpdate.likes + 10 }

        const response = await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(updatedLikes)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        assert.strictEqual(response.body.likes, updatedLikes.likes, 'Likes were not updated correctly')

        const blogsAtEnd = await api.get('/api/blogs')
        const updatedBlog = blogsAtEnd.body.find(blog => blog.id === blogToUpdate.id)

        assert.strictEqual(updatedBlog.likes, updatedLikes.likes, 'Updated blog does not have the correct number of likes')
    })
})

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
      await User.deleteMany({})
  
      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash })
  
      await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()
    
        const newUser = {
          username: 'mluukkai',
          name: 'Matti Luukkainen',
          password: 'salainen',
        }
    
        await api
          .post('/api/users')
          .send(newUser)
          .expect(201)
          .expect('Content-Type', /application\/json/)
    
        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
    
        const usernames = usersAtEnd.map(u => u.username)
        assert(usernames.includes(newUser.username))
      })
    })  

after(async () => {
    await mongoose.connection.close()
})