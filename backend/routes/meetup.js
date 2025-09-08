const express = require('express');
const router = express.Router();
const ctrl = require('../src/controllers/meetupController');

console.log('MEETUP ROUTES: mounted');

router.get('/', ctrl.getMeetups);
router.get('/my/:userId', ctrl.getMyMeetups);
router.get('/:id', ctrl.getMeetupById);
router.post('/', ctrl.createMeetup);
router.post('/:id/join', ctrl.joinMeetup);
router.post('/:id/leave', ctrl.leaveMeetup);
router.delete('/:id', ctrl.deleteMeetup);   
module.exports = router;