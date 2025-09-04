const mongoose = require('mongoose');

const CommunityPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post title is required'],
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
  tags: [String],
  attachments: [{
    filename: String,
    url: String,
    fileType: String
  }],
  likes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  replies: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true, maxlength: 2000 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
  }],
  isPinned: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('CommunityPost', CommunityPostSchema);