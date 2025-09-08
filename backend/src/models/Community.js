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
    url: { 
      type: String, 
      default: 'https://via.placeholder.com/200x200?text=Community' 
    },
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
      type: mongoose.Schema.Types.ObjectId,  // Fixed: Changed from Object to ObjectId
      ref: 'User',
      required: true
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
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    allowPosts: { 
      type: Boolean, 
      default: true 
    },
    requireApproval: { 
      type: Boolean, 
      default: false 
    },
    allowFiles: { 
      type: Boolean, 
      default: true 
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for member count
CommunitySchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Indexes for better query performance
CommunitySchema.index({ name: 'text', description: 'text' });
CommunitySchema.index({ category: 1, isActive: 1 });
CommunitySchema.index({ university: 1 });
CommunitySchema.index({ creator: 1 });
CommunitySchema.index({ 'members.user': 1 });

// Ensure creator is added to admins and members on save
CommunitySchema.pre('save', function(next) {
  if (this.isNew && this.creator) {
    // Add creator to admins
    if (!this.admins.includes(this.creator)) {
      this.admins.push(this.creator);
    }
    
    // Add creator to members if not already present
    const isCreatorMember = this.members.some(member => 
      member.user.toString() === this.creator.toString()
    );
    
    if (!isCreatorMember) {
      this.members.push({
        user: this.creator,
        role: 'moderator',
        joinedAt: new Date()
      });
    }
  }
  next();
});

module.exports = mongoose.model('Community', CommunitySchema);