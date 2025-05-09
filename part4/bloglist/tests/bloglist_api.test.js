const { test, describe, beforeEach, after } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const assert = require('node:assert')

const api = supertest(app)

const initialBlogs = [
    {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7
    },
    {
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5
    },
    {
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12
    }
]

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(initialBlogs)
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
            .send(blogWithoutTitle)
            .expect(400)

        await api
            .post('/api/blogs')
            .send(blogWithoutUrl)
            .expect(400)
    })
})

describe('DELETE /api/blogs/:id', () => {
    test('a blog can be deleted', async () => {
        const blogsAtStart = await api.get('/api/blogs')
        const blogToDelete = blogsAtStart.body[0] // Seleccionar el primer blog

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
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

after(async () => {
    await mongoose.connection.close()
})