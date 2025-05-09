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

blogsRouter.delete('/:id',async (req,res) => {
    try {
    const {id} = req.params
    const deletedBlog = await Blog.findByIdAndDelete(id)
    if(!deletedBlog) {
        return res.status(404).json({error:'blog not found'})
    }
    res.status(204).end()
} catch (error) {
 res.status(400).json({error:error.message})       
}
})

blogsRouter.put('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { likes } = req.body

        // Validar que se envíen los datos necesarios
        if (likes === undefined) {
            return res.status(400).json({ error: 'likes field is required' })
        }

        // Actualizar el blog
        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            { likes },
            { new: true, runValidators: true } // Retorna el documento actualizado y aplica validaciones
        )

        if (!updatedBlog) {
            return res.status(404).json({ error: 'blog not found' })
        }

        res.status(200).json(updatedBlog)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

module.exports = blogsRouter