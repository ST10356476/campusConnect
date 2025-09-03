const Community = require('../models/Community');
const User = require('../models/User');
const { validationResult } = require('express-validator');

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

    const total = await Community.countDocuments(query);

    res.json({
      success: true,
      communities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalCommunities: total,
        hasMore: skip + communities.length < total
      }
    });
  } catch (error) {
    console.error('Get communities error:', error);
    res.status(500).json({
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
      name: { $regex: `^${name}$`, $options: 'i' },
      creator: req.user.id
    });

    if (existingCommunity) {
      return res.status(400).json({
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
      course
    });

    // Add community to user's communities
    await User.findByIdAndUpdate(req.user.id, {
      $push: { communities: community._id }
    });

    const populatedCommunity = await Community.findById(community._id)
      .populate('creator', 'username profile.firstName profile.lastName profile.avatar')
      .populate('members.user', 'username profile.firstName profile.lastName profile.avatar');

    res.status(201).json({
      success: true,
      message: 'Community created successfully',
      community: populatedCommunity
    });
  } catch (error) {
    console.error('Create community error:', error);
    res.status(500).json({
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
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is already a member
    const isMember = community.members.some(
      member => member.user.toString() === req.user.id
    );

    if (isMember) {
      return res.status(400).json({ message: 'You are already a member of this community' });
    }

    // Check if community is full
    if (community.members.length >= community.maxMembers) {
      return res.status(400).json({ message: 'Community is full' });
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

    res.json({
      success: true,
      message: 'Successfully joined community',
      community: updatedCommunity
    });
  } catch (error) {
    console.error('Join community error:', error);
    res.status(500).json({
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
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is the creator
    if (community.creator.toString() === req.user.id) {
      return res.status(400).json({
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
      message: 'Server error leaving community',
      error: error.message
    });
  }
};

module.exports = {
  getCommunities,
  createCommunity,
  joinCommunity,
  leaveCommunity
};