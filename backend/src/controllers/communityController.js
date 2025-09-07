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

    console.log('Get communities request:', { category, university, search, page, limit, sortBy });

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

    console.log('Found ' + communities.length + ' communities');

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

    console.log('Create community request:', { 
      name, 
      description: description.substring(0, 50) + '...', 
      category, 
      isPrivate, 
      maxMembers, 
      tags, 
      university, 
      course,
      userId: req.user.id 
    });

    // Check if community with same name exists for this user
    const existingCommunity = await Community.findOne({
      name: { $regex: new RegExp('^' + name + '$', 'i') },
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

    console.log('Community created successfully:', community._id);

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
    console.log('Join community user:', req.user && req.user.id);

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

    console.log('User joined community successfully:', { userId: req.user.id, communityId });

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
    console.log('Leave community request:', { params: req.params, userId: req.user.id });
    
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

    // Check if user is actually a member
    const isMember = community.members.some(
      member => member.user.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this community'
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

    console.log('User left community successfully:', { userId: req.user.id, communityId });

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

// @desc    Get community by ID
// @route   GET /api/communities/:id
// @access  Private
const getCommunityById = async (req, res) => {
  try {
    const communityId = req.params.id || req.params.communityId;

    console.log('Get community by ID:', { communityId, userId: req.user.id });

    if (!communityId || !communityId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid community ID' 
      });
    }

    const community = await Community.findById(communityId)
      .populate('creator', 'username profile.firstName profile.lastName profile.avatar')
      .populate('members.user', 'username profile.firstName profile.lastName profile.avatar');

    if (!community) {
      return res.status(404).json({ 
        success: false,
        message: 'Community not found' 
      });
    }

    // Check if user is a member - robust checking
    const isMember = community.members.some(
      member => {
        const memberUserId = member.user._id ? member.user._id.toString() : member.user.toString();
        return memberUserId === req.user.id;
      }
    );

    console.log('Community membership check:', {
      userId: req.user.id,
      members: community.members.map(m => ({
        userId: m.user._id ? m.user._id.toString() : m.user.toString(),
        role: m.role
      })),
      isMember
    });

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

// @desc    Update community
// @route   PUT /api/communities/:id
// @access  Private
const updateCommunity = async (req, res) => {
  try {
    const communityId = req.params.id;
    const {
      name,
      description,
      category,
      isPrivate,
      maxMembers,
      tags,
      course
    } = req.body;

    console.log('Update community request:', { communityId, userId: req.user.id });

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

    // Check if user is creator or admin
    const isCreator = community.creator.toString() === req.user.id;
    const isAdmin = community.admins.some(admin => admin.toString() === req.user.id);

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only community creators and admins can update community settings'
      });
    }

    // Update fields if provided
    if (name) community.name = name;
    if (description) community.description = description;
    if (category) community.category = category;
    if (typeof isPrivate === 'boolean') community.isPrivate = isPrivate;
    if (maxMembers) community.maxMembers = maxMembers;
    if (tags) community.tags = tags;
    if (course) community.course = course;

    await community.save();

    const updatedCommunity = await Community.findById(communityId)
      .populate('creator', 'username profile.firstName profile.lastName profile.avatar')
      .populate('members.user', 'username profile.firstName profile.lastName profile.avatar');

    console.log('Community updated successfully:', communityId);

    res.json({
      success: true,
      message: 'Community updated successfully',
      community: {
        ...updatedCommunity.toObject(),
        id: updatedCommunity._id.toString(),
        memberCount: updatedCommunity.members.length
      }
    });
  } catch (error) {
    console.error('Update community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating community',
      error: error.message
    });
  }
};

// @desc    Delete community
// @route   DELETE /api/communities/:id
// @access  Private
const deleteCommunity = async (req, res) => {
  try {
    const communityId = req.params.id;

    console.log('Delete community request:', { communityId, userId: req.user.id });

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

    // Only creator can delete community
    if (community.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the community creator can delete the community'
      });
    }

    // Remove community from all members communities list
    await User.updateMany(
      { communities: community._id },
      { $pull: { communities: community._id } }
    );

    // Delete the community
    await Community.findByIdAndDelete(communityId);

    console.log('Community deleted successfully:', communityId);

    res.json({
      success: true,
      message: 'Community deleted successfully'
    });
  } catch (error) {
    console.error('Delete community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting community',
      error: error.message
    });
  }
};

// @desc    Get community members
// @route   GET /api/communities/:id/members
// @access  Private
const getCommunityMembers = async (req, res) => {
  try {
    const communityId = req.params.id;
    const { page = 1, limit = 20 } = req.query;

    console.log('Get community members:', { communityId, userId: req.user.id });

    if (!communityId || !communityId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid community ID' 
      });
    }

    const community = await Community.findById(communityId)
      .populate({
        path: 'members.user',
        select: 'username profile.firstName profile.lastName profile.avatar profile.university profile.course'
      });

    if (!community) {
      return res.status(404).json({ 
        success: false,
        message: 'Community not found' 
      });
    }

    // Check if user is a member
    const isMember = community.members.some(
      member => {
        const memberUserId = member.user._id ? member.user._id.toString() : member.user.toString();
        return memberUserId === req.user.id;
      }
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member to view community members'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalMembers = community.members.length;
    const paginatedMembers = community.members
      .slice(skip, skip + parseInt(limit))
      .map(member => ({
        ...member.toObject(),
        user: {
          ...member.user.toObject(),
          id: member.user._id.toString()
        }
      }));

    res.json({
      success: true,
      members: paginatedMembers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMembers / parseInt(limit)),
        totalMembers,
        hasMore: skip + paginatedMembers.length < totalMembers
      }
    });
  } catch (error) {
    console.error('Get community members error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching community members',
      error: error.message
    });
  }
};

module.exports = {
  getCommunities,
  createCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityById,
  updateCommunity,
  deleteCommunity,
  getCommunityMembers
};