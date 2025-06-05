const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user',{username:1,name:1})
    response.json(blogs)
})


blogsRouter.post('/', async (request, response) => {
    try {
        const body = request.body
        const user = request.user

        // Validar que el usuario esté autenticado
        if (!user || !user.id) {
            return response.status(401).json({ error: 'Token incorrecto' })
        }

        // Validar que los campos obligatorios estén presentes
        if (!body.title || !body.url) {
            return response.status(400).json({ error: 'El titulo y la url son requeridos' })
        }

        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes || 0, // Si no se proporciona likes, se establece en 0    
            user: user.id // Asignar el ID del usuario autenticado
        })

        const result = await blog.save()
        user.blogs = user.blogs.concat(result._id)
        await user.save()
        response.status(201).json(result)
    } catch (error) {
        response.status(400).json({ error: error.message })
    }
})

blogsRouter.delete('/:id', async (request, response) => {
    try {
        const user = request.user
        const blogId = request.params.id

        // Validar que el usuario esté autenticado
        if (!user || !user.id) {
            return response.status(401).json({ error: 'Token inválido o usuario no autenticado' })
        }

        // Buscar el blog por ID
        const blog = await Blog.findById(blogId)
        if (!blog) {
            return response.status(404).json({ error: 'El blog no existe' })
        }

        // Validar que el usuario sea el propietario del blog
        if (blog.user.toString() !== user.id.toString()) {
            return response.status(403).json({ error: 'No autorizado para eliminar este blog' })
        }

        // Eliminar el blog
        await Blog.findByIdAndDelete(blogId)

        // Actualizar la lista de blogs del usuario
        user.blogs = user.blogs.filter(blogId => blogId.toString() !== blogId)
        await user.save()

        response.status(204).end()
    } catch (error) {
        console.error(error)
        response.status(500).json({ error: 'Error interno del servidor' })
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