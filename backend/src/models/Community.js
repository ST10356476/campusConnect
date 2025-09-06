const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide community name'],
    trim: true,
    maxlength: [100, 'Community name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide community description'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  avatar: {
  filename: String,
  originalName: String,
  url: { type: String, default: 'https://via.placeholder.com/200x200?text=Community' },
  fileType: String,
  fileSize: Number,
  uploadedAt: Date
},
  category: {
    type: String,
    required: [true, 'Please provide community category'],
    enum: [
      'Study Group',
      'Project Team',
      'Course Discussion',
      'Research Group',
      'Hobby Club',
      'Sports',
      'Technology',
      'Arts & Culture',
      'Other'
    ]
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  maxMembers: {
    type: Number,
    default: 50,
    max: [500, 'Maximum members cannot exceed 500']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
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
      enum: ['member', 'moderator'],
      default: 'member'
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],

  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityPost'
  }],
  university: {
    type: String,
    required: [true, 'Please provide university']
  },
  course: String,
  course: String,
  isActive: {
    type: Boolean,
    default: true
  },


  settings: {
    allowPosts: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    allowFiles: { type: Boolean, default: true }
  }  
  }  
}, {
  timestamps: true
  timestamps: true
});

// Virtual for member count
CommunitySchema.virtual('memberCount').get(function() {
  return this.members.length;
  return this.members.length;
});

module.exports = mongoose.model('Community', CommunitySchema);