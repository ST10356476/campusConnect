const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const {
  getCommunities,
  createCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityById,
  updateCommunity,
  deleteCommunity,
  getCommunityMembers,
  uploadCommunityAvatar,
  deleteCommunityAvatar,
  upload
} = require('../src/controllers/communityController');
const { getCommunityPosts } = require('../src/controllers/postController');
const { protect } = require('../src/middleware/auth');

const router = express.Router();

// Validation for community creation
const communityValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Community name must be between 3-100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10-1000 characters'),
  body('category')
    .isIn([
      'Study Group',
      'Project Team',
      'Course Discussion',
      'Research Group',
      'Hobby Club',
      'Sports',
      'Technology',
      'Arts & Culture',
      'Other'
    ])
    .withMessage('Please select a valid category'),
  body('university')
    .trim()
    .notEmpty()
    .withMessage('University is required'),
  body('maxMembers')
    .optional()
    .isInt({ min: 5, max: 500 })
    .withMessage('Max members must be between 5-500')
];

// Validation for community updates
const communityUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Community name must be between 3-100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10-1000 characters'),
  body('category')
    .optional()
    .isIn([
      'Study Group',
      'Project Team',
      'Course Discussion',
      'Research Group',
      'Hobby Club',
      'Sports',
      'Technology',
      'Arts & Culture',
      'Other'
    ])
    .withMessage('Please select a valid category'),
  body('maxMembers')
    .optional()
    .isInt({ min: 5, max: 500 })
    .withMessage('Max members must be between 5-500')
];

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
  }
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed'
    });
  }
  next(error);
};

// Community Routes
router.get('/', protect, getCommunities);
router.post('/', protect, upload.single('avatar'), handleMulterError, communityValidation, createCommunity);
router.get('/:id', protect, getCommunityById);
router.post('/:id/join', protect, joinCommunity);
router.post('/:id/leave', protect, leaveCommunity);
router.put('/:id', protect, upload.single('avatar'), handleMulterError, communityUpdateValidation, updateCommunity);
router.delete('/:id', protect, deleteCommunity);
router.get('/:id/members', protect, getCommunityMembers);

// Avatar management routes
router.post('/:id/avatar', protect, upload.single('avatar'), handleMulterError, uploadCommunityAvatar);
router.delete('/:id/avatar', protect, deleteCommunityAvatar);

// Community Posts Routes
router.get('/:id/posts', protect, getCommunityPosts);

module.exports = router;