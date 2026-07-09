const { prisma } = require('../config/db');

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public or Admin
const getBlogs = async (req, res) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

// @desc    Create a blog post
// @route   POST /api/blogs
// @access  Admin
const createBlog = async (req, res) => {
  try {
    const { title, category, body } = req.body;

    if (!title || !category || !body) {
      return res.status(400).json({ message: 'Title, category, and body are required' });
    }

    // Generate slug from title
    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Handle slug collision
    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const grads = ['var(--grad-lav)', 'var(--grad-mint)', 'var(--grad-rose)', 'var(--grad-peach)', 'linear-gradient(135deg,var(--blue),var(--blue-d))'];
    const blogCount = await prisma.blog.count();

    const newBlog = await prisma.blog.create({
      data: {
        title,
        slug,
        category,
        body,
        grad: grads[blogCount % grads.length]
      }
    });

    res.status(201).json(newBlog);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create blog post.' });
  }
};

// @desc    Update a blog post
// @route   PUT /api/blogs/:id
// @access  Admin
const updateBlog = async (req, res) => {
  try {
    const { title, category, body } = req.body;
    const blog = await prisma.blog.findUnique({ where: { id: req.params.id } });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const updatedBlog = await prisma.blog.update({
      where: { id: req.params.id },
      data: {
        title: title || blog.title,
        category: category || blog.category,
        body: body || blog.body
      }
    });

    res.json(updatedBlog);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update blog post.' });
  }
};

// @desc    Delete a blog post
// @route   DELETE /api/blogs/:id
// @access  Admin
const deleteBlog = async (req, res) => {
  try {
    const blog = await prisma.blog.findUnique({ where: { id: req.params.id } });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    await prisma.blog.delete({ where: { id: req.params.id } });
    res.json({ message: 'Blog removed' });
  } catch (error) {
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

module.exports = { getBlogs, createBlog, updateBlog, deleteBlog };
