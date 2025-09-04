const mongoose = require('mongoose');

const CommunityPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  type: {
    type: String,
    enum: ['discussion', 'question', 'announcement', 'resource'],
    default: 'discussion'
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    fileSize: Number
  }],
  likes: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  replies: [{
    author: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    content: { 
      type: String, 
      required: true, 
      maxlength: 2000 
    },
    likes: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    editedAt: {
      type: Date
    },
    isEdited: {
      type: Boolean,
      default: false
    }
  }],
  isPinned: { 
    type: Boolean, 
    default: false 
  },
  isLocked: { 
    type: Boolean, 
    default: false 
  },
  viewCount: { 
    type: Number, 
    default: 0 
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  editedAt: {
    type: Date
  },
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for like count
CommunityPostSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for reply count
CommunityPostSchema.virtual('replyCount').get(function() {
  return this.replies ? this.replies.length : 0;
});

// Index for better query performance
CommunityPostSchema.index({ community: 1, createdAt: -1 });
CommunityPostSchema.index({ community: 1, isPinned: -1, createdAt: -1 });
CommunityPostSchema.index({ community: 1, type: 1, createdAt: -1 });
CommunityPostSchema.index({ author: 1, createdAt: -1 });
CommunityPostSchema.index({ 
  title: 'text', 
  content: 'text', 
  tags: 'text' 
}, {
  weights: {
    title: 10,
    content: 5,
    tags: 1
  }
});

// Pre-save middleware to handle edited posts
CommunityPostSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.editedAt = new Date();
    this.isEdited = true;
  }
  next();
});

module.exports = mongoose.model('CommunityPost', CommunityPostSchema);