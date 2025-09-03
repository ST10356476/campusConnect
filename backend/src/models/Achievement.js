const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide achievement title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide achievement description'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  icon: {
    type: String,
    default: '🏆'
  },
  category: {
    type: String,
    required: [true, 'Please specify achievement category'],
    enum: [
      'Community',
      'Learning',
      'Sharing',
      'Social',
      'Milestone',
      'Special'
    ]
  },
  points: {
    type: Number,
    required: [true, 'Please specify points value'],
    min: [5, 'Minimum points is 5'],
    max: [1000, 'Maximum points is 1000']
  },
  criteria: {
    type: {
      type: String,
      enum: [
        'communities_joined',
        'materials_uploaded',
        'materials_downloaded',
        'meetups_organized',
        'meetups_attended',
        'likes_received',
        'days_active',
        'study_hours',
        'special'
      ],
      required: true
    },
    target: {
      type: Number,
      required: function() {
        return this.criteria.type !== 'special';
      }
    },
    timeframe: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'lifetime'],
      default: 'lifetime'
    }
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Achievement', AchievementSchema);