/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface User {
  _id: string;
  id: string;
  username: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    fullName?: string;
    avatar: string;
    bio?: string;
    university: string;
    course: string;
    year: number;
    skills?: string[];
    interests?: string[];
    location?: string;
    joinedDate?: string;
  };
  points: number; // Keep this for backward compatibility - will always be 0
  communities: string[];
  achievements: string[];
  isVerified: boolean;
  lastActive: string;
  name: string;
  badges: string[];
}

export interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  badge: string;
  criteria: {
    type: string;
    value: number;
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
}

export interface AchievementStats {
  unlockedCount: number;
  totalCount: number;
  completionRate: number;
}

export interface Community {
  _id?: string;
  id: string;
  name: string;
  description: string;
  avatar?: string;
  category: string;
  isPrivate: boolean;
  maxMembers: number;
  creator: string | User;
  members: Array<{
    user: string | User;
    joinedAt: string;
    role: string;
  }>;
  memberCount: number;
  tags: string[];
  university: string;
  course?: string;
  isActive: boolean;
  isMember?: boolean;
}

export interface CommunityPost {
  _id?: string;
  id: string;
  title: string;
  content: string;
  author: {
    _id?: string;
    id?: string;
    username: string;
    profile: {
      firstName: string;
      lastName: string;
      avatar: string;
    };
  };
  type: 'discussion' | 'question' | 'announcement' | 'resource';
  tags: string[];
  likes: string[] | Array<{ user: string; createdAt: string }>;
  replies: Array<{
    _id?: string;
    id?: string;
    author: {
      _id?: string;
      id?: string;
      username: string;
      profile: {
        firstName: string;
        lastName: string;
        avatar: string;
      };
    };
    content: string;
    likes: string[];
    createdAt: string;
  }>;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  createdAt: string;
  community: string | Community;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  uploader: {
    id: string;
    username: string;
    profile: {
      firstName: string;
      lastName: string;
      avatar: string;
    };
  };
  community?: {
    id: string;
    name: string;
    avatar: string;
  };
  files: Array<{
    filename: string;
    originalName: string;
    url: string;
    fileType: string;
    fileSize: number;
  }>;
  tags: string[];
  course?: string;
  semester?: string;
  year?: number;
  university?: string;
  downloadCount: number;
  likeCount: number;
  likes: string[];
  isPublic: boolean;
  createdAt: string;
}

export interface Meetup {
  _id: string;
  id: string;
  title: string;
  description: string;
  type: string;
  location: {
    type: string;
    venue?: string;
    address?: string;
    meetingLink?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  dateTime: {
    start: Date;
    end: Date;
  };
  maxAttendees?: number;
  community?: string | Community;
  tags?: string[];
  requirements?: string;
  isPublic?: boolean;
  recurring?: {
    isRecurring: boolean;
    pattern?: string;
    endDate?: Date;
  };
  attendees: string[];
  host: string | User;
  status: string;
  createdAt: string;
}

class ApiService {
  private baseURL = API_BASE_URL;
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (token) {
      localStorage.setItem('campus_connect_token', token);
    } else {
      localStorage.removeItem('campus_connect_token');
    }
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('campus_connect_token');
    }
    return this.token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    university: string;
    course: string;
    year: number;
  }) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getProfile(): Promise<{ success: boolean; user: User }> {
    const response = await this.request('/auth/me');
    
    // Ensure backward compatibility by adding points field if missing
    if (response.success && response.user) {
      response.user.points = response.user.points || 0;
    }
    
    return response;
  }

  async updateProfile(profileData: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Achievements
  async getAchievements(): Promise<{ 
    success: boolean; 
    data: { 
      achievements: Achievement[]; 
      stats: AchievementStats;
    }
  }> {
    return this.request('/achievements');
  }

  // Community methods
  async getCommunities(params?: {
    category?: string;
    university?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  }): Promise<{
    success: boolean;
    communities: Community[];
    pagination: any;
  }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/communities?${queryString}` : '/communities';
    
    return this.request(endpoint);
  }

  async createCommunity(communityData: {
    name: string;
    description: string;
    category: string;
    isPrivate?: boolean;
    maxMembers?: number;
    tags: string[];
    university: string;
    course?: string;
  }): Promise<{ success: boolean; community: Community; message: string }> {
    return this.request('/communities', {
      method: 'POST',
      body: JSON.stringify(communityData),
    });
  }

  async createCommunityWithImage(formData: FormData) {
    const token = this.getToken();
    const response = await fetch(`${this.baseURL}/communities`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    return data;
  }

  async updateCommunityWithImage(communityId: string, formData: FormData) {
    const token = this.getToken();
    const response = await fetch(`${this.baseURL}/communities/${communityId}`, {
      method: 'PUT',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    return data;
  }

  async uploadCommunityAvatar(communityId: string, file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = this.getToken();
    const response = await fetch(`${this.baseURL}/communities/${communityId}/avatar`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    return data;
  }

  async deleteCommunityAvatar(communityId: string) {
    return this.request(`/communities/${communityId}/avatar`, {
      method: 'DELETE',
    });
  }

  async getCommunityById(communityId: string): Promise<{
    success: boolean;
    community: Community;
  }> {
    return this.request(`/communities/${communityId}`);
  }

  async joinCommunity(communityId: string): Promise<{
    success: boolean;
    community: Community;
    message: string;
  }> {
    return this.request(`/communities/${communityId}/join`, {
      method: 'POST',
    });
  }

  async leaveCommunity(communityId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request(`/communities/${communityId}/leave`, {
      method: 'POST',
    });
  }

  async updateCommunity(communityId: string, updateData: {
    name?: string;
    description?: string;
    category?: string;
    isPrivate?: boolean;
    maxMembers?: number;
    tags?: string[];
    course?: string;
  }): Promise<{
    success: boolean;
    community: Community;
    message: string;
  }> {
    return this.request(`/communities/${communityId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteCommunity(communityId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request(`/communities/${communityId}`, {
      method: 'DELETE',
    });
  }

  async getCommunityMembers(communityId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    members: any[];
    pagination: any;
  }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `/communities/${communityId}/members?${queryString}` 
      : `/communities/${communityId}/members`;
    
    return this.request(endpoint);
  }

  // Community Post methods
  async getCommunityPosts(communityId: string, params?: {
    search?: string;
    type?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    posts: CommunityPost[];
    pagination: any;
  }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `/communities/${communityId}/posts?${queryString}` 
      : `/communities/${communityId}/posts`;
    
    return this.request(endpoint);
  }

  async createCommunityPost(postData: {
    title: string;
    content: string;
    type: 'discussion' | 'question' | 'announcement' | 'resource';
    tags: string[];
    communityId: string;
  }): Promise<{
    success: boolean;
    post: CommunityPost;
    message: string;
  }> {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async getPost(postId: string): Promise<{
    success: boolean;
    post: CommunityPost;
  }> {
    return this.request(`/posts/${postId}`);
  }

  async replyToPost(postId: string, replyData: {
    content: string;
  }): Promise<{
    success: boolean;
    post: CommunityPost;
    message: string;
  }> {
    return this.request(`/posts/${postId}/reply`, {
      method: 'POST',
      body: JSON.stringify(replyData),
    });
  }

  async likePost(postId: string): Promise<{
    success: boolean;
    likeCount: number;
    isLiked: boolean;
    message: string;
  }> {
    return this.request(`/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async deletePost(postId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request(`/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  async pinPost(postId: string): Promise<{
    success: boolean;
    isPinned: boolean;
    message: string;
  }> {
    return this.request(`/posts/${postId}/pin`, {
      method: 'POST',
    });
  }

  async lockPost(postId: string): Promise<{
    success: boolean;
    isLocked: boolean;
    message: string;
  }> {
    return this.request(`/posts/${postId}/lock`, {
      method: 'POST',
    });
  }

  // Study Materials methods
  async getStudyMaterials(params?: any): Promise<{
    success: boolean;
    materials: StudyMaterial[];
    pagination: any;
  }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/materials?${queryString}` : '/materials';
    
    return this.request(endpoint);
  }

  async uploadStudyMaterial(formData: FormData): Promise<{
    success: boolean;
    material: StudyMaterial;
    message: string;
  }> {
    const token = this.getToken();
    const response = await fetch(`${this.baseURL}/materials`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  async downloadMaterial(materialId: string): Promise<{
    success: boolean;
    url: string;
  }> {
    return this.request(`/materials/${materialId}/download`);
  }

  async likeMaterial(materialId: string): Promise<{
    success: boolean;
    likeCount: number;
    isLiked: boolean;
  }> {
    return this.request(`/materials/${materialId}/like`, {
      method: 'POST',
    });
  }

  async deleteMaterial(materialId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request(`/materials/${materialId}`, {
      method: 'DELETE',
    });
  }

  // Meetup methods
  async getMeetups(params?: {
    type?: string;
    status?: string;
    community?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  }): Promise<{
    success: boolean;
    meetups: Meetup[];
    pagination: any;
  }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/meetups?${queryString}` : '/meetups';
    
    return this.request(endpoint);
  }

  async createMeetup(meetupData: {
    title: string;
    description: string;
    type: string;
    location: {
      type: string;
      venue?: string;
      address?: string;
      meetingLink?: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    dateTime: {
      start: Date;
      end: Date;
    };
    maxAttendees?: number;
    community?: string;
    tags?: string[];
    requirements?: string;
    isPublic?: boolean;
    recurring?: {
      isRecurring: boolean;
      pattern?: string;
      endDate?: Date;
    };
  }): Promise<{
    success: boolean;
    meetup: Meetup;
    message: string;
  }> {
    return this.request('/meetups', {
      method: 'POST',
      body: JSON.stringify(meetupData),
    });
  }

  async joinMeetup(meetupId: string): Promise<{
    success: boolean;
    meetup: Meetup;
    message: string;
  }> {
    return this.request(`/meetups/${meetupId}/join`, {
      method: 'POST',
    });
  }

  async leaveMeetup(meetupId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request(`/meetups/${meetupId}/leave`, {
      method: 'POST',
    });
  }

  async getMeetupById(meetupId: string): Promise<{
    success: boolean;
    meetup: Meetup;
  }> {
    return this.request(`/meetups/${meetupId}`);
  }

  async updateMeetup(meetupId: string, updateData: any): Promise<{
    success: boolean;
    meetup: Meetup;
    message: string;
  }> {
    return this.request(`/meetups/${meetupId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteMeetup(meetupId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request(`/meetups/${meetupId}`, {
      method: 'DELETE',
    });
  }

  // File upload utility
  async uploadFile(file: File, endpoint: string) {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getToken();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    return data;
  }
}

export const apiService = new ApiService();