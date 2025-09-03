const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/config');

const socketHandler = (io) => {
  // Middleware for socket authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected`);

    // Join user to their personal room
    socket.join(`user_${socket.user._id}`);

    // Join user to their community rooms
    socket.user.communities.forEach(communityId => {
      socket.join(`community_${communityId}`);
    });

    // Handle joining a community room
    socket.on('join_community', (communityId) => {
      socket.join(`community_${communityId}`);
      console.log(`${socket.user.username} joined community ${communityId}`);
    });

    // Handle leaving a community room
    socket.on('leave_community', (communityId) => {
      socket.leave(`community_${communityId}`);
      console.log(`${socket.user.username} left community ${communityId}`);
    });

    // Handle live study session events
    socket.on('join_study_session', (sessionId) => {
      socket.join(`session_${sessionId}`);
      socket.to(`session_${sessionId}`).emit('user_joined_session', {
        userId: socket.user._id,
        username: socket.user.username,
        profile: socket.user.profile
      });
      console.log(`${socket.user.username} joined study session ${sessionId}`);
    });

    socket.on('leave_study_session', (sessionId) => {
      socket.leave(`session_${sessionId}`);
      socket.to(`session_${sessionId}`).emit('user_left_session', {
        userId: socket.user._id,
        username: socket.user.username
      });
      console.log(`${socket.user.username} left study session ${sessionId}`);
    });

    // Handle real-time chat messages
    socket.on('send_message', (data) => {
      const { type, targetId, message, sessionId } = data;
      
      const messageData = {
        id: Date.now(),
        userId: socket.user._id,
        username: socket.user.username,
        profile: socket.user.profile,
        message,
        timestamp: new Date(),
        type: 'message'
      };

      if (type === 'community') {
        socket.to(`community_${targetId}`).emit('new_message', messageData);
      } else if (type === 'session') {
        socket.to(`session_${sessionId}`).emit('new_message', messageData);
      }
    });

    // Handle screen sharing
    socket.on('start_screen_share', (sessionId) => {
      socket.to(`session_${sessionId}`).emit('screen_share_started', {
        userId: socket.user._id,
        username: socket.user.username
      });
    });

    socket.on('stop_screen_share', (sessionId) => {
      socket.to(`session_${sessionId}`).emit('screen_share_stopped', {
        userId: socket.user._id,
        username: socket.user.username
      });
    });

    // Handle collaborative whiteboard events
    socket.on('whiteboard_draw', (data) => {
      const { sessionId, drawData } = data;
      socket.to(`session_${sessionId}`).emit('whiteboard_update', {
        userId: socket.user._id,
        drawData
      });
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { type, targetId } = data;
      if (type === 'community') {
        socket.to(`community_${targetId}`).emit('user_typing', {
          userId: socket.user._id,
          username: socket.user.username
        });
      }
    });

    socket.on('typing_stop', (data) => {
      const { type, targetId } = data;
      if (type === 'community') {
        socket.to(`community_${targetId}`).emit('user_stop_typing', {
          userId: socket.user._id
        });
      }
    });

    // Handle voice/video call signaling
    socket.on('call_user', (data) => {
      const { targetUserId, offer, sessionId } = data;
      socket.to(`user_${targetUserId}`).emit('incoming_call', {
        from: socket.user._id,
        fromUsername: socket.user.username,
        offer,
        sessionId
      });
    });

    socket.on('answer_call', (data) => {
      const { targetUserId, answer } = data;
      socket.to(`user_${targetUserId}`).emit('call_answered', {
        from: socket.user._id,
        answer
      });
    });

    socket.on('ice_candidate', (data) => {
      const { targetUserId, candidate } = data;
      socket.to(`user_${targetUserId}`).emit('ice_candidate', {
        from: socket.user._id,
        candidate
      });
    });

    socket.on('end_call', (data) => {
      const { targetUserId } = data;
      socket.to(`user_${targetUserId}`).emit('call_ended', {
        from: socket.user._id
      });
    });

    // Handle notifications
    socket.on('send_notification', (data) => {
      const { targetUserId, notification } = data;
      socket.to(`user_${targetUserId}`).emit('new_notification', {
        ...notification,
        from: {
          id: socket.user._id,
          username: socket.user.username,
          profile: socket.user.profile
        },
        timestamp: new Date()
      });
    });

    // Handle user status updates
    socket.on('update_status', (status) => {
      // Broadcast to all communities the user is part of
      socket.user.communities.forEach(communityId => {
        socket.to(`community_${communityId}`).emit('user_status_update', {
          userId: socket.user._id,
          status
        });
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.username} disconnected`);
      
      // Notify communities about user going offline
      socket.user.communities.forEach(communityId => {
        socket.to(`community_${communityId}`).emit('user_offline', {
          userId: socket.user._id,
          username: socket.user.username
        });
      });
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

module.exports = socketHandler;