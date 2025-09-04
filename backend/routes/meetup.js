// backend/routes/meetup.js
const express = require('express');
const router = express.Router();
const ctrl = require('../src/controllers/meetupController');

console.log('MEETUP ROUTES: mounted');

router.get('/', ctrl.getMeetups);                  // GET /api/meetups
router.get('/my/:userId', ctrl.getMyMeetups);      // GET /api/meetups/my/:userId
router.get('/:id', ctrl.getMeetupById);            // GET /api/meetups/:id
router.post('/', ctrl.createMeetup);               // POST /api/meetups
router.post('/:id/join', ctrl.joinMeetup);         // POST /api/meetups/:id/join
router.post('/:id/leave', ctrl.leaveMeetup);       // POST /api/meetups/:id/leave

module.exports = router;
