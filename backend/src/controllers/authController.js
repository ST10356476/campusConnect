const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { validationResult } = require('express-validator');




const register = async (req, res) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      username,
      email,
      password,
      firstName,
      lastName,
      university,
      course,
      year
    } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });




    if (existingUser) {
      return res.status(400).json({
        message:
          existingUser.email === email
            ? 'User with this email already exists'
            : 'Username already taken'
      });
    }


    const user = await User.create({
      username,
      email,
      password,
      profile: {
        firstName,
        lastName,
        university,
        course,
        year
      }
    });


    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        points: user.points,
        communities: user.communities,
        achievements: user.achievements,
        isVerified: user.isVerified,
        lastActive: user.lastActive
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;


    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });


    }


    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });


    }


    user.lastActive = new Date();
    await user.save();


    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        points: user.points,
        communities: user.communities,
        achievements: user.achievements,
        isVerified: user.isVerified,
        lastActive: user.lastActive
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('communities', 'name avatar')
      .populate('achievements', 'title description');

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        points: user.points,
        communities: user.communities,
        achievements: user.achievements,
        isVerified: user.isVerified,
        lastActive: user.lastActive
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Server error getting user data',
      error: error.message
    });
  }
};

// @desc    Update current user's profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const body = req.body || {};

    // If UI sends a single "name", split to first + last
    if (body.name && !body.firstName && !body.lastName) {
      const parts = String(body.name).trim().split(/\s+/);
      body.firstName = parts.shift() || '';
      body.lastName = parts.join(' ');
    }

    // Only fields that exist in your schema
    const allowed = [
      'firstName',
      'lastName',
      'avatar',
      'bio',
      'location',   // included and supported by model below
      'joinedDate', // included and supported by model below
      'university',
      'course',
      'year',
      'skills',
      'interests'
    ];

    const set = {};
    for (const key of allowed) {
      if (body[key] !== undefined) {
        set[`profile.${key}`] = body[key];
      }
    }

    // Optional username update via profile screen
    if (body.username !== undefined) {
      set.username = body.username;
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $set: set },
      { new: true }
    )
      .populate('communities', 'name avatar')
      .populate('achievements', 'title description');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated',
      user: {
        id: updated._id,
        username: updated.username,
        email: updated.email,
        profile: updated.profile,
        points: updated.points,
        communities: updated.communities,
        achievements: updated.achievements,
        isVerified: updated.isVerified,
        lastActive: updated.lastActive
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};