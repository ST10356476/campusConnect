/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface User {
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
  id: string;
  name: string;
  description: string;
  avatar: string;
  category: string;
  isPrivate: boolean;
  maxMembers: number;
  creator: string;
  members: Array<{
    user: string;
    joinedAt: string;
    role: string;
  }>;
  memberCount: number;
  tags: string[];
  university: string;
  course?: string;
  isActive: boolean;
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

  async request(endpoint: string, options: RequestInit = {}) {
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

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  // Auth
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
    if (response.token) this.setToken(response.token);
    return response;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.token) this.setToken(response.token);
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

  // Communities
  async getCommunities(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/communities?${queryString}`);
  }

  async createCommunity(communityData: any) {
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

  async joinCommunity(communityId: string) {
    return this.request(`/communities/${communityId}/join`, {
      method: 'POST',
    });
  }

  async leaveCommunity(communityId: string) {
    return this.request(`/communities/${communityId}/leave`, {
      method: 'POST',
    });
  }

  async getCommunityById(communityId: string) {
    return this.request(`/communities/${communityId}`);
  }

  async getCommunityPosts(communityId: string, params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/communities/${communityId}/posts?${queryString}`);
  }

  async createCommunityPost(postData: any) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async replyToPost(postId: string, replyData: any) {
    return this.request(`/posts/${postId}/reply`, {
      method: 'POST',
      body: JSON.stringify(replyData),
    });
  }

  async likePost(postId: string) {
    return this.request(`/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async updateCommunity(communityId: string, updateData: any) {
    return this.request(`/communities/${communityId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteCommunity(communityId: string) {
    return this.request(`/communities/${communityId}`, {
      method: 'DELETE',
    });
  }

  // Materials
  async getMaterials(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/materials?${queryString}`);
  }

  async uploadMaterial(materialData: any) {
    return this.request('/materials', {
      method: 'POST',
      body: JSON.stringify(materialData),
    });
  }

  async likeMaterial(materialId: string) {
    return this.request(`/materials/${materialId}/like`, {
      method: 'POST',
    });
  }

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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }
}

export const apiService = new ApiService();