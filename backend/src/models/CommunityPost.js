const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [2000, 'Reply content cannot exceed 2000 characters']
  },
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CommunityPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide post title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide post content'],
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
  replies: [ReplySchema],
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
CommunityPostSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

CommunityPostSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Indexes
CommunityPostSchema.index({ community: 1, createdAt: -1 });
CommunityPostSchema.index({ author: 1 });
CommunityPostSchema.index({ type: 1 });
CommunityPostSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('CommunityPost', CommunityPostSchema);