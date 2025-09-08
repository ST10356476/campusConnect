const CommunityPost = require('../models/CommunityPost');
const Community = require('../models/Community');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
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
      title,
      content,
      type,
      tags,
      communityId
    } = req.body;

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

    if (!isMember) {
      return res.status(403).json({ 
        success: false,
        message: 'You must be a member to create posts' 
      });
    }

    // Create the post
    const post = await CommunityPost.create({
      title: title.trim(),
      content: content.trim(),
      type: type || 'discussion',
      tags: tags || [],
      community: communityId,
      author: req.user.id,
      isPinned: false,
      isLocked: false,
      viewCount: 0
    });

    // Add post to community's posts array
    await Community.findByIdAndUpdate(communityId, {
      $push: { posts: post._id }
    });

    // Populate author details
    const populatedPost = await CommunityPost.findById(post._id)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .populate('replies.author', 'username profile.firstName profile.lastName profile.avatar');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: {
        ...populatedPost.toObject(),
        id: populatedPost._id.toString(),
        likes: [],
        isLiked: false
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
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

    // Validate post ID
    if (!postId || !postId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid post ID' 
      });
    }

    // Validate content
    if (!content || !content.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Reply content is required' 
      });
    }

    // Find the post
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Post not found' 
      });
    }

    // Check if user is member of the community
    const community = await Community.findById(post.community);
    const isMember = community.members.some(
      member => member.user.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ 
        success: false,
        message: 'You must be a member to reply' 
      });
    }

    // Check if post is locked
    if (post.isLocked) {
      return res.status(403).json({ 
        success: false,
        message: 'This post is locked' 
      });
    }

    // Add the reply
    const reply = {
      author: req.user.id,
      content: content.trim(),
      likes: [],
      createdAt: new Date()
    };

    post.replies.push(reply);
    await post.save();

    // Get updated post with populated data
    const updatedPost = await CommunityPost.findById(postId)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .populate('replies.author', 'username profile.firstName profile.lastName profile.avatar');

    // Transform the response
    const postObj = updatedPost.toObject();
    const transformedPost = {
      ...postObj,
      id: postObj._id.toString(),
      likes: postObj.likes.map(like => like.user.toString()),
      isLiked: postObj.likes.some(like => like.user.toString() === req.user.id),
      replies: postObj.replies.map(reply => ({
        ...reply,
        id: reply._id ? reply._id.toString() : undefined
      }))
    };

    res.json({
      success: true,
      message: 'Reply added successfully',
      post: transformedPost
    });
  } catch (error) {
    console.error('Reply to post error:', error);
    res.status(500).json({
      success: false,
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

    // Validate post ID
    if (!postId || !postId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid post ID' 
      });
    }

    // Find the post
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Post not found' 
      });
    }

    // Check if user is member of the community
    const community = await Community.findById(post.community);
    const isMember = community.members.some(
      member => member.user.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({ 
        success: false,
        message: 'You must be a member to like posts' 
      });
    }

    // Check if user already liked the post
    const existingLikeIndex = post.likes.findIndex(
      like => like.user.toString() === userId
    );

    let isLiked;
    if (existingLikeIndex > -1) {
      // Unlike: remove the like
      post.likes.splice(existingLikeIndex, 1);
      isLiked = false;
    } else {
      // Like: add the like
      post.likes.push({ 
        user: userId, 
        createdAt: new Date() 
      });
      isLiked = true;
    }

    await post.save();

    res.json({
      success: true,
      message: isLiked ? 'Post liked' : 'Post unliked',
      likeCount: post.likes.length,
      isLiked
    });
  } catch (error) {
    console.error('Toggle like post error:', error);
    res.status(500).json({
      success: false,
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

    // Validate post ID
    if (!postId || !postId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid post ID' 
      });
    }

    // Find and populate the post
    const post = await CommunityPost.findById(postId)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .populate('replies.author', 'username profile.firstName profile.lastName profile.avatar')
      .populate('community', 'name');

    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Post not found' 
      });
    }

    // Check if user is member of the community
    const community = await Community.findById(post.community._id);
    const isMember = community.members.some(
      member => member.user.toString() === req.user.id
    );

    if (!isMember && community.isPrivate) {
      return res.status(403).json({ 
        success: false,
        message: 'You must be a member to view this post' 
      });
    }

    // Increment view count
    post.viewCount = (post.viewCount || 0) + 1;
    await post.save();

    // Transform the response
    const postObj = post.toObject();
    const transformedPost = {
      ...postObj,
      id: postObj._id.toString(),
      likes: postObj.likes.map(like => like.user.toString()),
      isLiked: postObj.likes.some(like => like.user.toString() === req.user.id),
      replies: postObj.replies.map(reply => ({
        ...reply,
        id: reply._id ? reply._id.toString() : undefined
      }))
    };

    res.json({
      success: true,
      post: transformedPost
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching post',
      error: error.message
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (Author or Admin only)
const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;

    // Validate post ID
    if (!postId || !postId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid post ID' 
      });
    }

    // Find the post
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Post not found' 
      });
    }

    // Check if user is the author or community admin
    const community = await Community.findById(post.community);
    const isAuthor = post.author.toString() === req.user.id;
    const isAdmin = community.admins.some(
      admin => admin.toString() === req.user.id
    );

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this post'
      });
    }

    // Remove post from community's posts array
    await Community.findByIdAndUpdate(post.community, {
      $pull: { posts: post._id }
    });

    // Delete the post
    await CommunityPost.findByIdAndDelete(postId);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting post',
      error: error.message
    });
  }
};

// @desc    Pin/Unpin post
// @route   POST /api/posts/:id/pin
// @access  Private (Admin only)
const togglePinPost = async (req, res) => {
  try {
    const postId = req.params.id;

    // Validate post ID
    if (!postId || !postId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid post ID' 
      });
    }

    // Find the post
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Post not found' 
      });
    }

    // Check if user is community admin
    const community = await Community.findById(post.community);
    const isAdmin = community.admins.some(
      admin => admin.toString() === req.user.id
    );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can pin posts'
      });
    }

    // Toggle pin status
    post.isPinned = !post.isPinned;
    await post.save();

    res.json({
      success: true,
      message: post.isPinned ? 'Post pinned' : 'Post unpinned',
      isPinned: post.isPinned
    });
  } catch (error) {
    console.error('Toggle pin post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling pin',
      error: error.message
    });
  }
};

// @desc    Lock/Unlock post
// @route   POST /api/posts/:id/lock
// @access  Private (Admin only)
const toggleLockPost = async (req, res) => {
  try {
    const postId = req.params.id;

    // Validate post ID
    if (!postId || !postId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid post ID' 
      });
    }

    // Find the post
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Post not found' 
      });
    }

    // Check if user is community admin
    const community = await Community.findById(post.community);
    const isAdmin = community.admins.some(
      admin => admin.toString() === req.user.id
    );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can lock posts'
      });
    }

    // Toggle lock status
    post.isLocked = !post.isLocked;
    await post.save();

    res.json({
      success: true,
      message: post.isLocked ? 'Post locked' : 'Post unlocked',
      isLocked: post.isLocked
    });
  } catch (error) {
    console.error('Toggle lock post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling lock',
      error: error.message
    });
  }
};

module.exports = {
  createPost,
  replyToPost,
  toggleLikePost,
  getPost,
  deletePost,
  togglePinPost,
  toggleLockPost
};