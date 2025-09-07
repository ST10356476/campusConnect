const Community = require('../models/Community');
const User = require('../models/User');
const { validationResult } = require('express-validator');

const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/communities');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `community-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Only allow image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Helper function to delete old avatar file
const deleteOldAvatar = async (avatarPath) => {
  if (avatarPath) {
    try {
      const fullPath = path.join(__dirname, '../uploads/communities', path.basename(avatarPath));
      await fs.unlink(fullPath);
      console.log('Old avatar deleted:', fullPath);
    } catch (error) {
      console.error('Error deleting old avatar:', error);
    }
  }
};


// @desc    Get all communities
// @route   GET /api/communities
// @access  Private
const getCommunities = async (req, res) => {
  try {
    const {
      category,
      university,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt'
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (university) {
      query.university = { $regex: university, $options: 'i' };
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const communities = await Community.find(query)
      .populate('creator', 'username profile.firstName profile.lastName profile.avatar')
      .populate('members.user', 'username profile.firstName profile.lastName profile.avatar')
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Transform communities to include id field and memberCount
    const transformedCommunities = communities.map(community => ({
      ...community.toObject(),
      id: community._id.toString(),
      memberCount: community.members.length
    }));

    const total = await Community.countDocuments(query);

    res.json({
      success: true,
      communities: transformedCommunities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalCommunities: total,
        hasMore: skip + transformedCommunities.length < total
      }
    });
  } catch (error) {
    console.error('Get communities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching communities',
      error: error.message
    });
  }
};

// @desc    Create new community
// @route   POST /api/communities
// @access  Private
const createCommunity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      category,
      isPrivate,
      maxMembers,
      tags,
      university,
      course
    } = req.body;

    // Check if community with same name exists for this user
    const existingCommunity = await Community.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      creator: req.user.id
    });

    if (existingCommunity) {
      return res.status(400).json({
        success: false,
        message: 'You already have a community with this name'
      });
    }

    const community = await Community.create({
      name,
      description,
      category,
      isPrivate: isPrivate || false,
      maxMembers: maxMembers || 50,
      creator: req.user.id,
      admins: [req.user.id],
      members: [{
        user: req.user.id,
        joinedAt: new Date(),
        role: 'moderator'
      }],
      tags: tags || [],
      university,
      course,
      isActive: true
    });

    // Add community to user's communities
    await User.findByIdAndUpdate(req.user.id, {
      $push: { communities: community._id }
    });

    const populatedCommunity = await Community.findById(community._id)
      .populate('creator', 'username profile.firstName profile.lastName profile.avatar')
      .populate('members.user', 'username profile.firstName profile.lastName profile.avatar');

    // Transform response to include id and memberCount
    res.status(201).json({
      success: true,
      message: 'Community created successfully',
      community: {
        ...populatedCommunity.toObject(),
        id: populatedCommunity._id.toString(),
        memberCount: populatedCommunity.members.length
      }
    });
  } catch (error) {
    console.error('Create community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating community',
      error: error.message
    });
  }
};

// @desc    Join community
// @route   POST /api/communities/:id/join
// @access  Private
const joinCommunity = async (req, res) => {
  try {
    // Debug logging
    console.log('Join community params:', req.params);
    console.log('Join community body:', req.body);
    console.log('Join community user:', req.user?.id);

    // Get community ID from params or body
    const communityId = req.params.id || req.params.communityId || req.body.communityId;

    // Validate community ID
    if (!communityId) {
      console.error('No community ID provided');
      return res.status(400).json({ 
        success: false,
        message: 'Community ID is required' 
      });
    }

    if (communityId === 'undefined' || communityId === 'null') {
      console.error('Invalid community ID:', communityId);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid community ID' 
      });
    }

    // Validate ObjectId format
    if (!communityId.match(/^[0-9a-fA-F]{24}$/)) {
      console.error('Invalid ObjectId format:', communityId);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid community ID format' 
      });
    }

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ 
        success: false,
        message: 'Community not found' 
      });
    }

    // Check if user is already a member
    const isMember = community.members.some(
      member => member.user.toString() === req.user.id
    );

    if (isMember) {
      return res.status(400).json({ 
        success: false,
        message: 'You are already a member of this community' 
      });
    }

    // Check if community is full
    if (community.members.length >= community.maxMembers) {
      return res.status(400).json({ 
        success: false,
        message: 'Community is full' 
      });
    }

    // Add user to community
    community.members.push({
      user: req.user.id,
      joinedAt: new Date(),
      role: 'member'
    });

    await community.save();

    // Add community to user's communities
    await User.findByIdAndUpdate(req.user.id, {
      $push: { communities: community._id }
    });

    const updatedCommunity = await Community.findById(community._id)
      .populate('creator', 'username profile.firstName profile.lastName profile.avatar')
      .populate('members.user', 'username profile.firstName profile.lastName profile.avatar');

    // Transform the response to include id and memberCount
    res.json({
      success: true,
      message: 'Successfully joined community',
      community: {
        ...updatedCommunity.toObject(),
        id: updatedCommunity._id.toString(),
        memberCount: updatedCommunity.members.length
      }
    });
  } catch (error) {
    console.error('Join community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error joining community',
      error: error.message
    });
  }
};

// @desc    Leave community
// @route   POST /api/communities/:id/leave
// @access  Private
const leaveCommunity = async (req, res) => {
  try {
    // Debug logging
    console.log('Leave community params:', req.params);
    
    const communityId = req.params.id || req.params.communityId || req.body.communityId;

    if (!communityId || !communityId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid community ID' 
      });
    }

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ 
        success: false,
        message: 'Community not found' 
      });
    }

    // Check if user is the creator
    if (community.creator.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Community creator cannot leave. Please transfer ownership or delete the community.'
      });
    }

    // Remove user from community members
    community.members = community.members.filter(
      member => member.user.toString() !== req.user.id
    );

    // Remove from admins if present
    community.admins = community.admins.filter(
      admin => admin.toString() !== req.user.id
    );

    await community.save();

    // Remove community from user's communities
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { communities: community._id }
    });

    res.json({
      success: true,
      message: 'Successfully left community'
    });
  } catch (error) {
    console.error('Leave community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error leaving community',
      error: error.message
    });
  }
};

// @desc    Get community
// @route   GET /api/communities/:id
// @access  Private
const getCommunityById = async (req, res) => {
  try {
    const communityId = req.params.id || req.params.communityId;

    if (!communityId || !communityId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid community ID' 
      });
    }

    const community = await Community.findById(communityId)
      .populate('creator', 'username profile.firstName profile.lastName profile.avatar')
      .populate('members.user', 'username profile.firstName profile.lastName profile.avatar')
      .populate('posts');

    if (!community) {
      return res.status(404).json({ 
        success: false,
        message: 'Community not found' 
      });
    }

    // Check if user is a member
    const isMember = community.members.some(
      member => member.user._id.toString() === req.user.id
    );

    res.json({
      success: true,
      community: {
        ...community.toObject(),
        id: community._id.toString(),
        memberCount: community.members.length,
        isMember
      }
    });
  } catch (error) {
    console.error('Get community by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching community',
      error: error.message
    });
  }
};

module.exports = {
  getCommunities,
  createCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityById
};