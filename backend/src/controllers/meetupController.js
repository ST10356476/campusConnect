// backend/src/controllers/meetupController.js
console.log('=== LOADING MEETUP CONTROLLER ===');
const Meetup = require('../models/Meetup');
console.log('✅ Meetup model loaded successfully');
console.log('=== CONTROLLER LOADED ===');

// Create a new meetup
exports.createMeetup = async (req, res) => {
  try {
    const { title, description, date, time, duration, maxAttendees, meetingLink, organizer } = req.body;

    if (!title || !description || !date || !time || !meetingLink || !organizer?.id || !organizer?.name) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const meetup = await Meetup.create({
      title,
      description,
      date,
      time,
      duration: Number(duration) || 60,
      maxAttendees: Number(maxAttendees) || 10,
      meetingLink,
      organizer,
      attendees: []
    });

    res.status(201).json({ success: true, data: meetup });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all upcoming meetups
exports.getMeetups = async (req, res) => {
  try {
    const meetups = await Meetup.find({ status: 'upcoming' }).sort({ date: 1, time: 1 });
    res.json({ success: true, count: meetups.length, data: meetups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get meetups the user organized or joined
exports.getMyMeetups = async (req, res) => {
  try {
    const { userId } = req.params;
    const meetups = await Meetup.find({
      $or: [{ 'organizer.id': userId }, { 'attendees.userId': userId }]
    }).sort({ date: 1, time: 1 });
    res.json({ success: true, count: meetups.length, data: meetups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Join a meetup
exports.joinMeetup = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, name } = req.body;

    const meetup = await Meetup.findById(id);
    if (!meetup) return res.status(404).json({ success: false, message: 'Meetup not found' });

    const already = meetup.attendees.some(a => a.userId === userId) || meetup.organizer.id === userId;
    if (already) return res.json({ success: true, data: meetup, message: 'Already joined' });

    if (meetup.attendees.length >= meetup.maxAttendees) {
      return res.status(400).json({ success: false, message: 'Meetup is full' });
    }

    meetup.attendees.push({ userId, name, joinedAt: new Date() });
    await meetup.save();

    res.json({ success: true, data: meetup, message: 'Joined meetup' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Leave a meetup
exports.leaveMeetup = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const meetup = await Meetup.findById(id);
    if (!meetup) return res.status(404).json({ success: false, message: 'Meetup not found' });

    meetup.attendees = meetup.attendees.filter(a => a.userId !== userId);
    await meetup.save();

    res.json({ success: true, data: meetup, message: 'Left meetup' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get single meetup by ID
exports.getMeetupById = async (req, res) => {
  try {
    const { id } = req.params;
    const meetup = await Meetup.findById(id);
    if (!meetup) return res.status(404).json({ success: false, message: 'Meetup not found' });
    res.json({ success: true, data: meetup });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
