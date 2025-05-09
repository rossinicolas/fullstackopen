const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})


blogsRouter.post('/', async (request, response) => {
    try {
        const blogData = {
            ...request.body,
            likes: request.body.likes === undefined ? 0 : request.body.likes
        }
        if (!blogData.title || !blogData.url) {
            return response.status(400).json({ error: 'title and url are required' })
        }
        const blog = new Blog(blogData)
        const result = await blog.save()
        response.status(201).json(result)
    } catch (error) {
        response.status(400).json({ error: error.message })
    }
})

module.exports = blogsRouter