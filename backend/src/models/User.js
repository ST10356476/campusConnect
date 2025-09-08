const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  profile: {
    firstName: {
      type: String,
      required: [true, 'Please provide first name'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Please provide last name'],
      trim: true
    },
    avatar: {
      type: String,
      default: function() {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.email}`;
      }
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },

    // Added for the Profile screen
    location: { type: String, trim: true },
    joinedDate: { type: String }, // ISO string as used by the UI

    university: {
      type: String,
      required: [true, 'Please provide university name']
    },
    course: {
      type: String,
      required: [true, 'Please provide course/major']
    },
    year: {
      type: Number,
      required: [true, 'Please provide academic year'],
      min: 1,
      max: 8
    },
    skills: [{
      type: String,
      trim: true
    }],
    interests: [{
      type: String,
      trim: true
    }]
  },
  communities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  }],
  // Updated achievement structure to match the achievement controller
  achievements: [{

    achievementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement',
      required: true
    },
    unlocked: {
      type: Boolean,
      default: false
    },
    unlockedAt: {
      type: Date
    },
    progress: {
      type: Number,
      default: 0
    }
  }],

  achievement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  },
  earnedAt: {
    type: Date,
    default: Date.now
  }
}],

  points: {
    type: Number,
    default: 0
  },
  // Activity tracking for achievements
  stats: {
    postsCreated: { type: Number, default: 0 },
    likesReceived: { type: Number, default: 0 },
    communitiesJoined: { type: Number, default: 0 },
    repliesPosted: { type: Number, default: 0 },
    meetupsAttended: { type: Number, default: 0 },
    meetupsHosted: { type: Number, default: 0 },
    materialsUploaded: { type: Number, default: 0 }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate full name virtual
UserSchema.virtual('profile.fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Add virtual for badges (for backward compatibility)
UserSchema.virtual('badges').get(function() {
  return this.achievements.filter(a => a.unlocked).map(a => a.achievementId);
});

// Prevent model overwrite error
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);


