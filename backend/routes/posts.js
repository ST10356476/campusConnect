const express = require('express');
const { body } = require('express-validator');
const {
  createPost,
  replyToPost,
  toggleLikePost,
  getPost
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Post validation
const postValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5-200 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10-5000 characters'),
  body('type')
    .isIn(['discussion', 'question', 'announcement', 'resource'])
    .withMessage('Invalid post type'),
  body('communityId')
    .notEmpty()
    .withMessage('Community ID is required')
];

// Routes
router.post('/', protect, postValidation, createPost);
router.get('/:id', protect, getPost);
router.post('/:id/reply', protect, replyToPost);
router.post('/:id/like', protect, toggleLikePost);

module.exports = router;