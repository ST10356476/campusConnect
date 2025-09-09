import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    this.token = token;
    
    this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token }
    });

    this.socket.on('connect', () => {
  // Connected to server
    });

    this.socket.on('disconnect', () => {
  // Disconnected from server
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Community methods
  joinCommunity(communityId: string) {
    this.socket?.emit('join_community', communityId);
  }

  leaveCommunity(communityId: string) {
    this.socket?.emit('leave_community', communityId);
  }

  sendMessage(data: {
    type: 'community' | 'session';
    targetId: string;
    message: string;
    sessionId?: string;
  }) {
    this.socket?.emit('send_message', data);
  }

  // Study session methods
  joinStudySession(sessionId: string) {
    this.socket?.emit('join_study_session', sessionId);
  }

  leaveStudySession(sessionId: string) {
    this.socket?.emit('leave_study_session', sessionId);
  }

  // Typing indicators
  startTyping(type: 'community', targetId: string) {
    this.socket?.emit('typing_start', { type, targetId });
  }

  stopTyping(type: 'community', targetId: string) {
    this.socket?.emit('typing_stop', { type, targetId });
  }

  // Event listeners
  onMessage(callback: (data: any) => void) {
    this.socket?.on('new_message', callback);
  }

  onUserJoined(callback: (data: any) => void) {
    this.socket?.on('user_joined_session', callback);
  }

  onUserLeft(callback: (data: any) => void) {
    this.socket?.on('user_left_session', callback);
  }

  onTyping(callback: (data: any) => void) {
    this.socket?.on('user_typing', callback);
  }

  onStopTyping(callback: (data: any) => void) {
    this.socket?.on('user_stop_typing', callback);
  }

  // Remove listeners
  removeAllListeners() {
    this.socket?.removeAllListeners();
  }
}

export const webSocketService = new WebSocketService();