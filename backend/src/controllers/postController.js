const CommunityPost = require('../models/CommunityPost');
const Community = require('../models/Community');
const User = require('../models/User');
const { validationResult } = require('express-validator');

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

    // Check if community exists and user is a member
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const isMember = community.members.some(
      member => member.user.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You must be a member to view posts' });
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

    // Transform posts to include id field
    const transformedPosts = posts.map(post => ({
      ...post.toObject(),
      id: post._id.toString(),
      replies: post.replies.map(reply => ({
        ...reply.toObject(),
        id: reply._id.toString()
      }))
    }));

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
      message: 'Server error fetching posts',
      error: error.message
    });
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      content,
      type,
      tags,
      communityId
    } = req.body;

    // Check if community exists and user is a member
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const isMember = community.members.some(
      member => member.user.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You must be a member to create posts' });
    }

    const post = await CommunityPost.create({
      title,
      content,
      type: type || 'discussion',
      tags: tags || [],
      community: communityId,
      author: req.user.id
    });

    // Add post to community's posts array
    await Community.findByIdAndUpdate(communityId, {
      $push: { posts: post._id }
    });

    const populatedPost = await CommunityPost.findById(post._id)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .populate('replies.author', 'username profile.firstName profile.lastName profile.avatar');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: {
        ...populatedPost.toObject(),
        id: populatedPost._id.toString()
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      message: 'Server error creating post',
      error: error.message
    });
  }
};

// @desc    Reply to post
// @route   POST /api/posts/:id/reply
// @access  Private
const replyToPost = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Reply content is required' });
    }

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is member of the community
    const community = await Community.findById(post.community);
    const isMember = community.members.some(
      member => member.user.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You must be a member to reply' });
    }

    // Check if post is locked
    if (post.isLocked) {
      return res.status(403).json({ message: 'This post is locked' });
    }

    const reply = {
      author: req.user.id,
      content: content.trim(),
      createdAt: new Date()
    };

    post.replies.push(reply);
    await post.save();

    const updatedPost = await CommunityPost.findById(postId)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .populate('replies.author', 'username profile.firstName profile.lastName profile.avatar');

    res.json({
      success: true,
      message: 'Reply added successfully',
      post: {
        ...updatedPost.toObject(),
        id: updatedPost._id.toString(),
        replies: updatedPost.replies.map(reply => ({
          ...reply.toObject(),
          id: reply._id.toString()
        }))
      }
    });
  } catch (error) {
    console.error('Reply to post error:', error);
    res.status(500).json({
      message: 'Server error adding reply',
      error: error.message
    });
  }
};

// @desc    Like/Unlike post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is member of the community
    const community = await Community.findById(post.community);
    const isMember = community.members.some(
      member => member.user.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You must be a member to like posts' });
    }

    const existingLike = post.likes.find(like => like.user.toString() === userId);

    if (existingLike) {
      // Unlike
      post.likes = post.likes.filter(like => like.user.toString() !== userId);
    } else {
      // Like
      post.likes.push({ user: userId, createdAt: new Date() });
    }

    await post.save();

    res.json({
      success: true,
      message: existingLike ? 'Post unliked' : 'Post liked',
      likeCount: post.likes.length,
      isLiked: !existingLike
    });
  } catch (error) {
    console.error('Toggle like post error:', error);
    res.status(500).json({
      message: 'Server error toggling like',
      error: error.message
    });
  }
};

// @desc    Get single post with replies
// @route   GET /api/posts/:id
// @access  Private
const getPost = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await CommunityPost.findById(postId)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .populate('replies.author', 'username profile.firstName profile.lastName profile.avatar')
      .populate('community', 'name');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is member of the community
    const community = await Community.findById(post.community._id);
    const isMember = community.members.some(
      member => member.user.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You must be a member to view this post' });
    }

    // Increment view count
    post.viewCount = (post.viewCount || 0) + 1;
    await post.save();

    res.json({
      success: true,
      post: {
        ...post.toObject(),
        id: post._id.toString(),
        replies: post.replies.map(reply => ({
          ...reply.toObject(),
          id: reply._id.toString()
        }))
      }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      message: 'Server error fetching post',
      error: error.message
    });
  }
};

module.exports = {
  getCommunityPosts,
  createPost,
  replyToPost,
  toggleLikePost,
  getPost
};