const express = require('express');
const router = express.Router();
const { getBlogs, createBlog, updateBlog, deleteBlog } = require('../controllers/blogController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/')
  .get(getBlogs)
  .post(protect, restrictTo('Admin'), createBlog);

router.route('/:id')
  .put(protect, restrictTo('Admin'), updateBlog)
  .delete(protect, restrictTo('Admin'), deleteBlog);

module.exports = router;
