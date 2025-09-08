// src/middleware/achievementMiddleware.js
const { checkAchievements } = require('../controllers/achievementController');

// Middleware to automatically check achievements after certain actions
const achievementMiddleware = (eventType, getEventData = () => ({})) => {
  return async (req, res, next) => {
    // Store the original json method
    const originalJson = res.json;
    
    // Override the json method to check achievements after successful response
    res.json = function(body) {
      // Only check achievements for successful responses and authenticated users
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user && (req.user._id || req.user.id)) {
        // Check achievements asynchronously (don't wait for it)
        setImmediate(async () => {
          try {
            const userId = req.user._id || req.user.id;
            const eventData = getEventData(req, res, body);
            const newlyUnlocked = await checkAchievements(userId, eventType, eventData);
            
            if (newlyUnlocked && newlyUnlocked.length > 0) {
              console.log(`🏆 User ${userId} unlocked achievements:`, newlyUnlocked.map(a => a.name));
              // You could emit socket events here for real-time notifications
            }
          } catch (error) {
            console.error('Achievement check error:', error);
          }
        });
      }
      
      // Call the original json method
      return originalJson.call(this, body);
    };
    
    next();
  };
};

// Specific middleware functions for different events
const postCreatedMiddleware = achievementMiddleware('post_created');

const replyCreatedMiddleware = achievementMiddleware('reply_created');

const communityJoinedMiddleware = achievementMiddleware('community_joined');

const meetupJoinedMiddleware = achievementMiddleware('meetup_attended', (req, res, body) => {
  // Extract meetup data from response
  const meetup = body.data;
  if (!meetup) return {};
  
  // Check if it's a study meetup and if it's in the morning
  const startTime = meetup.startAt || meetup.time;
  let isMorningMeetup = false;
  
  if (startTime) {
    try {
      const date = new Date(startTime);
      isMorningMeetup = date.getHours() < 12;
    } catch (e) {
      // If time parsing fails, check the time string
      if (typeof startTime === 'string' && startTime.includes(':')) {
        const hour = parseInt(startTime.split(':')[0]);
        isMorningMeetup = hour < 12;
      }
    }
  }
  
  return {
    meetupType: meetup.type || 'general',
    isStudyMeetup: meetup.type === 'study' || meetup.title?.toLowerCase().includes('study'),
    isMorningMeetup,
    morningMeetupCount: isMorningMeetup ? 1 : 0
  };
});

const meetupHostedMiddleware = achievementMiddleware('meetup_hosted', (req, res, body) => {
  const meetup = body.data;
  return {
    meetupType: meetup?.type || 'general',
    status: meetup?.status || 'active'
  };
});

// Special middleware for like functionality
const likeMiddleware = async (req, res, next) => {
  // Store original json method
  const originalJson = res.json;
  
  res.json = function(body) {
    // Check if this was a successful like operation
    if (res.statusCode >= 200 && res.statusCode < 300 && body.success !== false && req.user) {
      setImmediate(async () => {
        try {
          // Get the post to find the author
          const CommunityPost = require('../models/CommunityPost');
          const post = await CommunityPost.findById(req.params.id).populate('author');
          
          if (post && post.author && body.isLiked) {
            // Only trigger achievement if this was actually adding a like
            const userId = req.user._id || req.user.id;
            const authorId = post.author._id || post.author.id;
            
            // Don't award achievement for liking your own post
            if (userId.toString() !== authorId.toString()) {
              await checkAchievements(authorId.toString(), 'like_received');
            }
          }
        } catch (error) {
          console.error('Like achievement check error:', error);
        }
      });
    }
    
    return originalJson.call(this, body);
  };
  
  next();
};

module.exports = {
  achievementMiddleware,
  postCreatedMiddleware,
  replyCreatedMiddleware,
  communityJoinedMiddleware,
  meetupJoinedMiddleware,
  meetupHostedMiddleware,
  likeMiddleware
};

module.exports = {
  achievementMiddleware,
  postCreatedMiddleware,
  replyCreatedMiddleware,
  communityJoinedMiddleware,
  meetupJoinedMiddleware,
  meetupHostedMiddleware,
  likeMiddleware
};