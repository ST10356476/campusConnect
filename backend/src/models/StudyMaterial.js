const mongoose = require('mongoose');

const StudyMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide material title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide material description'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Please specify material type'],
    enum: [
      'Notes',
      'Presentation',
      'Assignment',
      'Project',
      'Research Paper',
      'Video',
      'Audio',
      'Book',
      'Article',
      'Other'
    ]
  },
  category: {
    type: String,
    required: [true, 'Please provide category'],
    enum: [
      'Computer Science',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'Engineering',
      'Business',
      'Literature',
      'History',
      'Psychology',
      'Other'
    ]
  },
  files: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    fileType: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  },
  tags: [{
    type: String,
    trim: true
  }],
  course: String,
  semester: String,
  year: Number,
  university: String,
  downloads: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    downloadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for download count
StudyMaterialSchema.virtual('downloadCount').get(function() {
  return this.downloads.length;
});

// Virtual for like count
StudyMaterialSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

module.exports = mongoose.model('StudyMaterial', StudyMaterialSchema);