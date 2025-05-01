// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
    return 1
    }

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    return blogs.length === 0
        ? undefined
        : blogs.reduce((prev, current) => {
            return (prev.likes > current.likes) ? prev : current
        })
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) {
        return undefined
    }
    const authorCount = blogs.reduce((acc, blog) => {
        acc[blog.author] = (acc[blog.author] || 0) + 1
        return acc
    }, {})

    const mostBlogsAuthor = Object.keys(authorCount).reduce((a, b) => authorCount[a] > authorCount[b] ? a : b)
    return { author: mostBlogsAuthor, blogs: authorCount[mostBlogsAuthor] }
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) {
        return undefined
    }
    const authorLikes = blogs.reduce((acc, blog) => {
        acc[blog.author] = (acc[blog.author] || 0) + blog.likes
        return acc
    }, {})

    const mostLikesAuthor = Object.keys(authorLikes).reduce((a, b) => authorLikes[a] > authorLikes[b] ? a : b)
    return { author: mostLikesAuthor, likes: authorLikes[mostLikesAuthor] }
}



module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}