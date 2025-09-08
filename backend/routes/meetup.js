const express = require('express');
const router = express.Router();
const ctrl = require('../src/controllers/meetupController');
const { protect } = require('../src/middleware/auth');
const {
  meetupJoinedMiddleware,
  meetupHostedMiddleware
} = require('../src/middleware/achievementMiddleware');

console.log('MEETUP ROUTES: mounted');

// Get all meetups
router.get('/', ctrl.getMeetups);

// Get user's meetups
router.get('/my/:userId', ctrl.getMyMeetups);

// Get specific meetup
router.get('/:id', ctrl.getMeetupById);

// Create meetup (with achievement tracking for hosting)
router.post('/', meetupHostedMiddleware, ctrl.createMeetup);

// Join meetup (with achievement tracking for attendance)
router.post('/:id/join', meetupJoinedMiddleware, ctrl.joinMeetup);

// Leave meetup
router.post('/:id/leave', ctrl.leaveMeetup);


// Delete meetup
router.delete('/:id', ctrl.deleteMeetup);

router.post('/', protect, meetupHostedMiddleware, ctrl.createMeetup);
router.post('/:id/join', protect, meetupJoinedMiddleware, ctrl.joinMeetup);

router.delete('/:id', ctrl.deleteMeetup);   

module.exports = router;