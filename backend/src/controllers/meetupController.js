console.log('=== LOADING MEETUP CONTROLLER ===');
const Meetup = require('../models/Meetup');
console.log('✅ Meetup model loaded successfully');
console.log('=== CONTROLLER LOADED ===');

// helper: build Date from strings like "2025-09-11" + "14:30"
function computeStartAt(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  // Node parses "YYYY-MM-DDTHH:mm:00" as local time, which is fine for now
  const d = new Date(`${dateStr}T${timeStr}:00`);
  return isNaN(d.getTime()) ? null : d;
}

// helper: for legacy docs with no startAt
function ensureStartAt(doc) {
  if (!doc.startAt) {
    const computed = computeStartAt(doc.date, doc.time);
    if (computed) doc.startAt = computed;
  }
  return doc;
}

// Create a new meetup
exports.createMeetup = async (req, res) => {
  try {
    const { title, description, date, time, duration, maxAttendees, meetingLink, organizer } = req.body;

    if (!title || !description || !date || !time || !meetingLink || !organizer?.id || !organizer?.name) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const startAt = computeStartAt(date, time);

    const meetup = await Meetup.create({
      title,
      description,
      date,
      time,
      startAt,                                   // save it
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

// Get all upcoming meetups (hide anything older than now - 3h)
exports.getMeetups = async (req, res) => {
  try {
    const cutoff = new Date(Date.now() - 3 * 60 * 60 * 1000);

    // get likely upcoming then filter in JS to support legacy docs without startAt
    const raw = await Meetup.find({ status: { $ne: 'cancelled' } }).sort({ startAt: 1, date: 1, time: 1 });

    const list = raw
      .map(m => ensureStartAt(m))
      .filter(m => !m.startAt || m.startAt >= cutoff); // if a doc still has no startAt, keep it visible

    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get meetups that user has joined or organized (also hide older than now - 3h)
exports.getMyMeetups = async (req, res) => {
  try {
    const { userId } = req.params;
    const cutoff = new Date(Date.now() - 3 * 60 * 60 * 1000);

    const raw = await Meetup.find({
      $or: [{ 'organizer.id': userId }, { 'attendees.userId': userId }]
    }).sort({ startAt: 1, date: 1, time: 1 });

    const list = raw
      .map(m => ensureStartAt(m))
      .filter(m => !m.startAt || m.startAt >= cutoff);

    res.json({ success: true, count: list.length, data: list });
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
    res.json({ success: true, data: ensureStartAt(meetup) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete a meetup (only organizer)
exports.deleteMeetup = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // in real life use auth middleware

    const meetup = await Meetup.findById(id);
    if (!meetup) return res.status(404).json({ success: false, message: 'Meetup not found' });

    if (meetup.organizer.id !== userId) {
      return res.status(403).json({ success: false, message: 'Only the organizer can delete this meetup' });
    }

    await Meetup.findByIdAndDelete(id);
    res.json({ success: true, message: 'Meetup deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
