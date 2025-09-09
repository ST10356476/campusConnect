const mongoose = require('mongoose');
const Achievement = require('../models/Achievement');
const User = require('../models/User');

// Get all achievements for a user
const getUserAchievements = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
  // Getting achievements for user
    
    // Get user with their achievement progress
    const user = await User.findById(userId).populate('achievements.achievementId');
    
    if (!user) {
  // User not found
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

  // User found
  // User achievements count

    // Get all available achievements
    const allAchievements = await Achievement.find({});
  // Total achievements in database
    
    if (allAchievements.length === 0) {
  // No achievements found in database, initializing
      await initializeAchievements();
      const newAchievements = await Achievement.find({});
  // Achievements initialized
    }

    // Map achievements with user progress
    const achievementsWithProgress = allAchievements.map(achievement => {
      const userProgress = user.achievements.find(
        ua => ua.achievementId && ua.achievementId._id.toString() === achievement._id.toString()
      );
      
      return {
        ...achievement.toObject(),
        unlocked: userProgress ? userProgress.unlocked : false,
        unlockedAt: userProgress ? userProgress.unlockedAt : null,
        progress: userProgress ? userProgress.progress : 0
      };
    });

    // Calculate stats
    const unlockedCount = achievementsWithProgress.filter(a => a.unlocked).length;
    const totalCount = allAchievements.length;
    const completionRate = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Stats calculated

    res.json({
      success: true,
      data: {
        achievements: achievementsWithProgress,
        stats: {
          unlockedCount,
          totalCount,
          completionRate
        }
      }
    });
  } catch (error) {
    console.error('❌ Get user achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching achievements'
    });
  }
};

// Check and unlock achievements for a user
const checkAchievements = async (userId, eventType, eventData = {}) => {
  try {
    const user = await User.findById(userId).populate('achievements.achievementId');
    if (!user) return;

    const allAchievements = await Achievement.find({});
    const newlyUnlocked = [];

    for (const achievement of allAchievements) {
      // Skip if already unlocked
      const userAchievement = user.achievements.find(
        ua => ua.achievementId._id.toString() === achievement._id.toString()
      );
      
      if (userAchievement && userAchievement.unlocked) continue;

      let shouldUnlock = false;
      let newProgress = userAchievement ? userAchievement.progress : 0;

      // Check achievement criteria based on event type
      switch (achievement.criteria.type) {
        case 'posts':
          if (eventType === 'post_created') {
            newProgress = await getUserPostCount(userId);
            shouldUnlock = newProgress >= achievement.criteria.value;
          }
          break;

        case 'likes':
          if (eventType === 'like_received') {
            newProgress = await getUserLikeCount(userId);
            shouldUnlock = newProgress >= achievement.criteria.value;
          }
          break;

        case 'communities':
          if (eventType === 'community_joined') {
            newProgress = await getUserCommunityCount(userId);
            shouldUnlock = newProgress >= achievement.criteria.value;
          }
          break;

        case 'replies':
          if (eventType === 'reply_created') {
            newProgress = await getUserReplyCount(userId);
            shouldUnlock = newProgress >= achievement.criteria.value;
          }
          break;

        case 'custom':
          // Handle custom achievements based on achievement name
          const result = await handleCustomAchievement(achievement, userId, eventType, eventData);
          newProgress = result.progress;
          shouldUnlock = result.shouldUnlock;
          break;
      }

      // Update or create user achievement progress
      if (userAchievement) {
        userAchievement.progress = newProgress;
        if (shouldUnlock && !userAchievement.unlocked) {
          userAchievement.unlocked = true;
          userAchievement.unlockedAt = new Date();
          newlyUnlocked.push(achievement);
        }
      } else {
        user.achievements.push({
          achievementId: achievement._id,
          progress: newProgress,
          unlocked: shouldUnlock,
          unlockedAt: shouldUnlock ? new Date() : null
        });
        if (shouldUnlock) {
          newlyUnlocked.push(achievement);
        }
      }
    }

    await user.save();
    return newlyUnlocked;
  } catch (error) {
    console.error('Check achievements error:', error);
    return [];
  }
};

// Helper functions to get user stats
const getUserPostCount = async (userId) => {
  const CommunityPost = require('../models/CommunityPost');
  return await CommunityPost.countDocuments({ author: userId });
};

const getUserLikeCount = async (userId) => {
  const CommunityPost = require('../models/CommunityPost');
  const posts = await CommunityPost.find({ author: userId });
  return posts.reduce((total, post) => total + (post.likes ? post.likes.length : 0), 0);
};

const getUserCommunityCount = async (userId) => {
  const User = require('../models/User');
  const user = await User.findById(userId);
  return user.communities ? user.communities.length : 0;
};

const getUserReplyCount = async (userId) => {
  const CommunityPost = require('../models/CommunityPost');
  const posts = await CommunityPost.find({});
  let replyCount = 0;
  
  posts.forEach(post => {
    if (post.comments) {
      replyCount += post.comments.filter(comment => 
        comment.author.toString() === userId.toString()
      ).length;
    }
  });
  
  return replyCount;
};

// Handle custom achievements
const handleCustomAchievement = async (achievement, userId, eventType, eventData) => {
  let progress = 0;
  let shouldUnlock = false;

  switch (achievement.name) {
    case 'Study Buddy':
      if (eventType === 'meetup_attended') {
        const Meetup = require('../models/Meetup');
        progress = await Meetup.countDocuments({ 
          attendees: userId,
          type: 'study'
        });
        shouldUnlock = progress >= achievement.criteria.value;
      }
      break;

    case 'Community Leader':
      if (eventType === 'meetup_hosted') {
        const Meetup = require('../models/Meetup');
        progress = await Meetup.countDocuments({ 
          host: userId,
          status: 'completed'
        });
        shouldUnlock = progress >= achievement.criteria.value;
      }
      break;

    case 'Early Bird':
      if (eventType === 'morning_meetup_attended') {
        // Track morning meetups specifically
        progress = eventData.morningMeetupCount || 0;
        shouldUnlock = progress >= achievement.criteria.value;
      }
      break;

    case 'Knowledge Sharer':
      if (eventType === 'material_uploaded') {
        // Count uploaded materials
        progress = eventData.materialCount || 0;
        shouldUnlock = progress >= achievement.criteria.value;
      }
      break;

    case 'Master Learner':
      // This was points-based, now base it on total achievements unlocked
      if (eventType === 'achievement_unlocked') {
        const User = require('../models/User');
        const user = await User.findById(userId);
        progress = user.achievements.filter(a => a.unlocked).length;
        shouldUnlock = progress >= achievement.criteria.value;
      }
      break;

    case 'Discussion Starter':
      if (eventType === 'discussion_started') {
        progress = await getUserPostCount(userId);
        shouldUnlock = progress >= achievement.criteria.value;
      }
      break;
  }

  return { progress, shouldUnlock };
};

// Initialize default achievements
const initializeAchievements = async () => {
  try {
    const existingCount = await Achievement.countDocuments();
    if (existingCount > 0) return;

    const defaultAchievements = [
      {
        name: 'First Question',
        description: 'Posted your first question to the community',
        icon: 'MessageSquare',
        badge: 'first-question',
        criteria: { type: 'posts', value: 1 },
        rarity: 'common'
      },
      {
        name: 'Helpful Member',
        description: 'Received 10 likes on your answers',
        icon: 'Star',
        badge: 'helpful-member',
        criteria: { type: 'likes', value: 10 },
        rarity: 'common'
      },
      {
        name: 'Study Buddy',
        description: 'Attended 5 study meetups',
        icon: 'Users',
        badge: 'study-buddy',
        criteria: { type: 'custom', value: 5 },
        rarity: 'uncommon'
      },
      {
        name: 'Knowledge Sharer',
        description: 'Uploaded 10 study materials',
        icon: 'BookOpen',
        badge: 'knowledge-sharer',
        criteria: { type: 'custom', value: 10 },
        rarity: 'uncommon'
      },
      {
        name: 'Community Leader',
        description: 'Hosted 3 successful study sessions',
        icon: 'Trophy',
        badge: 'community-leader',
        criteria: { type: 'custom', value: 3 },
        rarity: 'rare'
      },
      {
        name: 'Master Learner',
        description: 'Unlocked 10 achievements',
        icon: 'Award',
        badge: 'master-learner',
        criteria: { type: 'custom', value: 10 },
        rarity: 'legendary'
      },
      {
        name: 'Early Bird',
        description: 'Joined 5 morning study sessions',
        icon: 'Calendar',
        badge: 'early-bird',
        criteria: { type: 'custom', value: 5 },
        rarity: 'common'
      },
      {
        name: 'Discussion Starter',
        description: 'Started 20 discussions across communities',
        icon: 'MessageSquare',
        badge: 'discussion-starter',
        criteria: { type: 'posts', value: 20 },
        rarity: 'uncommon'
      }
    ];

    await Achievement.insertMany(defaultAchievements);
  // Default achievements initialized
  } catch (error) {
    console.error('Error initializing achievements:', error);
  }
};

module.exports = {
  getUserAchievements,
  checkAchievements,
  initializeAchievements
};