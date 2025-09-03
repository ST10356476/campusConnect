const mongoose = require('mongoose');

const MeetupSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide meetup title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide meetup description'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Please specify meetup type'],
    enum: [
      'Study Session',
      'Project Discussion',
      'Workshop',
      'Tutorial',
      'Exam Prep',
      'Networking',
      'Social',
      'Other'
    ]
  },
  location: {
    type: {
      type: String,
      enum: ['online', 'physical', 'hybrid'],
      required: true
    },
    venue: {
      type: String,
      required: function() {
        return this.location.type === 'physical' || this.location.type === 'hybrid';
      }
    },
    address: String,
    meetingLink: {
      type: String,
      required: function() {
        return this.location.type === 'online' || this.location.type === 'hybrid';
      }
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  dateTime: {
    start: {
      type: Date,
      required: [true, 'Please provide start date and time']
    },
    end: {
      type: Date,
      required: [true, 'Please provide end date and time']
    }
  },
  maxAttendees: {
    type: Number,
    default: 20,
    max: [200, 'Maximum attendees cannot exceed 200']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled'],
      default: 'registered'
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  requirements: {
    type: String,
    maxlength: [500, 'Requirements cannot exceed 500 characters']
  },
  materials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyMaterial'
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: function() {
        return this.recurring.isRecurring;
      }
    },
    endDate: {
      type: Date,
      required: function() {
        return this.recurring.isRecurring;
      }
    }
  }
}, {
  timestamps: true
});

// Virtual for attendee count
MeetupSchema.virtual('attendeeCount').get(function() {
  return this.attendees.filter(attendee => attendee.status === 'registered').length;
});

// Check if meetup is full
MeetupSchema.virtual('isFull').get(function() {
  return this.attendeeCount >= this.maxAttendees;
});

module.exports = mongoose.model('Meetup', MeetupSchema);
