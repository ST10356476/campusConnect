const express = require('express');
const { body } = require('express-validator');
const {
  createPost,
  replyToPost,
  toggleLikePost,
  getPost
} = require('../src/controllers/postController');
const { protect } = require('../src/middleware/auth');
const {
  postCreatedMiddleware,
  replyCreatedMiddleware,
  likeMiddleware
} = require('../src/middleware/achievementMiddleware');

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

// Reply validation
const replyValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Reply content must be between 1-2000 characters')
];

// Post Routes with Achievement Tracking
router.post('/', protect, postCreatedMiddleware, postValidation, createPost);
router.get('/:id', protect, getPost);
router.post('/:id/reply', protect, replyCreatedMiddleware, replyValidation, replyToPost);
router.post('/:id/like', protect, likeMiddleware, toggleLikePost);

module.exports = router;