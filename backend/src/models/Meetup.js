const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name:   { type: String, required: true },
  joinedAt: { type: Date, default: Date.now }
}, { _id: false });

const meetupSchema = new mongoose.Schema({
  title:        { type: String, required: [true, 'Please provide meetup title'], trim: true, maxlength: 200 },
  description:  { type: String, required: [true, 'Please provide meetup description'], maxlength: 1000 },
  date:         { type: String, required: [true, 'Please provide meetup date'] },   // yyyy-mm-dd
  time:         { type: String, required: [true, 'Please provide meetup time'] },   // HH:mm (24h)
  startAt:      { type: Date },                                                     // NEW: derived from date+time
  duration:     { type: Number, default: 60 },
  maxAttendees: { type: Number, required: [true, 'Please provide max attendees'], min: 1, max: 500 },
  meetingLink:  { type: String, required: [true, 'Please provide meeting link'] },
  organizer: {
    id:   { type: String, required: true },
    name: { type: String, required: true }
  },
  attendees: { type: [attendeeSchema], default: [] },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' }
}, { timestamps: true });

module.exports = mongoose.model('Meetup', meetupSchema);