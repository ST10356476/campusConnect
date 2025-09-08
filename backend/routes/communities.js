const express = require('express');
const { body } = require('express-validator');
const {
  getCommunities,
  createCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityById,
  updateCommunity,
  deleteCommunity,
  getCommunityMembers,
  getCommunityPosts
} = require('../src/controllers/communityController');
const { protect } = require('../src/middleware/auth');
const { communityJoinedMiddleware } = require('../src/middleware/achievementMiddleware');

const router = express.Router();

// Community validation
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
    .withMessage('Invalid community category'),
  body('university')
    .trim()
    .notEmpty()
    .withMessage('University is required')
];

// Routes
router.get('/', protect, getCommunities);
router.post('/', protect, communityValidation, createCommunity);
router.get('/:id', protect, getCommunityById);
router.post('/:id/join', protect, communityJoinedMiddleware, joinCommunity);
router.put('/:id', protect, updateCommunity);
router.delete('/:id', protect, deleteCommunity);
router.post('/:id/join', protect, joinCommunity);
router.post('/:id/leave', protect, leaveCommunity);
router.get('/:id/members', protect, getCommunityMembers);
router.get('/:id/posts', protect, getCommunityPosts);

module.exports = router;