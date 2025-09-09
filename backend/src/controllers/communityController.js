const Community = require('../models/Community');
const User = require('../models/User');
const CommunityPost = require('../models/CommunityPost');
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

    // Transform communities
    const transformedCommunities = communities.map(community => ({
      ...community.toObject(),
      id: community._id.toString(),
      memberCount: community.members.length,
      isMember: community.members.some(member => 
        member.user && member.user._id && member.user._id.toString() === req.user.id
      )
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

    // Check if community with same name exists
    const existingCommunity = await Community.findOne({
      name: { $regex: new RegExp('^' + name + '$', 'i') }
    });

    if (existingCommunity) {
      return res.status(400).json({
        success: false,
        message: 'A community with this name already exists'
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
    const communityId = req.params.id;

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
    const communityId = req.params.id;

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
    const communityId = req.params.id;

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

// @desc    Update community
// @route   PUT /api/communities/:id
// @access  Private (Creator/Admin only)
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
    if (course !== undefined) community.course = course;

    await community.save();

    const updatedCommunity = await Community.findById(communityId)
      .populate('creator', 'username profile.firstName profile.lastName profile.avatar')
      .populate('members.user', 'username profile.firstName profile.lastName profile.avatar');

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
// @access  Private (Creator only)
const deleteCommunity = async (req, res) => {
  try {
    const communityId = req.params.id;

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

    // Remove community from all members
    await User.updateMany(
      { communities: community._id },
      { $pull: { communities: community._id } }
    );

    // Delete all posts in this community
    await CommunityPost.deleteMany({ community: communityId });

    // Delete the community
    await Community.findByIdAndDelete(communityId);

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
      member => member.user._id.toString() === req.user.id
    );

    if (!isMember && community.isPrivate) {
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

// @desc    Get posts for a community
// @route   GET /api/communities/:id/posts
// @access  Private
const getCommunityPosts = async (req, res) => {
  try {
    const { id: communityId } = req.params;
    const {
      search,
      type,
      sortBy = 'createdAt',
      page = 1,
      limit = 20
    } = req.query;

    // Validate community ID
    if (!communityId || !communityId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid community ID' 
      });
    }

    // Check if community exists
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ 
        success: false,
        message: 'Community not found' 
      });
    }

    // Check if user is a member
    const isMember = community.members.some(
      member => member.user.toString() === req.user.id
    );

    if (!isMember && community.isPrivate) {
      return res.status(403).json({ 
        success: false,
        message: 'You must be a member to view posts' 
      });
    }

    // Build query
    const query = { community: communityId };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'popular':
        sortOptions = { 'likes.length': -1, createdAt: -1 };
        break;
      case 'replies':
        sortOptions = { 'replies.length': -1, createdAt: -1 };
        break;
      default:
        sortOptions = { isPinned: -1, createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const posts = await CommunityPost.find(query)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .populate('replies.author', 'username profile.firstName profile.lastName profile.avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CommunityPost.countDocuments(query);

    // Transform posts
    const transformedPosts = posts.map(post => {
      const postObj = post.toObject();
      return {
        ...postObj,
        id: postObj._id.toString(),
        likes: postObj.likes.map(like => like.user.toString()),
        isLiked: postObj.likes.some(like => like.user.toString() === req.user.id),
        replies: postObj.replies.map(reply => ({
          ...reply,
          id: reply._id ? reply._id.toString() : undefined
        }))
      };
    });

    res.json({
      success: true,
      posts: transformedPosts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPosts: total,
        hasMore: skip + posts.length < total
      }
    });
  } catch (error) {
    console.error('Get community posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching posts',
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
  getCommunityMembers,
  getCommunityPosts
};