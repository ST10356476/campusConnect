const express = require('express');
const router = express.Router();
const { getUserAchievements } = require('../src/controllers/achievementController');
const { protect } = require('../src/middleware/auth');

// @route   GET /api/achievements
// @desc    Get user achievements
// @access  Private
router.get('/', protect, getUserAchievements);

module.exports = router;