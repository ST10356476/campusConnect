const mongoose = require('mongoose');

const LiveSessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide session title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  },
  type: {
    type: String,
    enum: ['study', 'project', 'discussion', 'tutoring', 'other'],
    default: 'study'
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['host', 'co-host', 'participant'],
      default: 'participant'
    },
    isOnline: {
      type: Boolean,
      default: true
    }
  }],
  maxParticipants: {
    type: Number,
    default: 10,
    max: [50, 'Maximum participants cannot exceed 50']
  },
  settings: {
    allowScreenShare: {
      type: Boolean,
      default: true
    },
    allowWhiteboard: {
      type: Boolean,
      default: true
    },
    allowChat: {
      type: Boolean,
      default: true
    },
    allowVideo: {
      type: Boolean,
      default: true
    },
    allowAudio: {
      type: Boolean,
      default: true
    },
    isRecorded: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'ended'],
    default: 'waiting'
  },
  startedAt: Date,
  endedAt: Date,
  duration: Number, // in minutes
  recordingUrl: String,
  whiteboard: {
    data: String, // JSON string of whiteboard data
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastUpdatedAt: Date
  },
  chat: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: {
      type: String,
      required: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['text', 'system', 'file'],
      default: 'text'
    }
  }]
}, {
  timestamps: true
});

// Virtual for active participants count
LiveSessionSchema.virtual('activeParticipantCount').get(function() {
  return this.participants.filter(p => p.isOnline).length;
});

module.exports = mongoose.model('LiveSession', LiveSessionSchema);