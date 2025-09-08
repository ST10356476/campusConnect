const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  badge: {
    type: String,
    required: true
  },
  criteria: {
    type: {
      type: String,
      enum: ['posts', 'likes', 'communities', 'replies', 'custom'],
      required: true
    },
    value: {
      type: Number,
      required: true
    }
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Achievement || mongoose.model('Achievement', AchievementSchema);