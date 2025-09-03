const express = require('express');
const { body } = require('express-validator');
const {
  getMaterials,
  uploadMaterial,
  toggleLikeMaterial
} = require('../controllers/materialController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation for material upload
const materialValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3-200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10-1000 characters'),
  body('type')
    .isIn([
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
    ])
    .withMessage('Please select a valid material type'),
  body('category')
    .isIn([
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
    ])
    .withMessage('Please select a valid category')
];

// Routes
router.get('/', protect, getMaterials);
router.post('/', protect, materialValidation, uploadMaterial);
router.post('/:id/like', protect, toggleLikeMaterial);

module.exports = router;