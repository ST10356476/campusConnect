// frontend/src/services/meetups.service.ts
import { Meetup, CreateMeetupData, JoinMeetupData, ApiResponse } from '../types/meetup.types';

const API_BASE_URL = 'http://localhost:5000/api'; // Change this to your backend URL

class MeetupService {
  // Create a new meetup
  async createMeetup(meetupData: CreateMeetupData): Promise<ApiResponse<Meetup>> {
    try {
      const response = await fetch(`${API_BASE_URL}/meetups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetupData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating meetup:', error);
      throw error;
    }
  }

  // Get all upcoming meetups
  async getAllMeetups(): Promise<ApiResponse<Meetup[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/meetups`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching meetups:', error);
      throw error;
    }
  }

  // Get user's meetups (organized or joined)
  async getMyMeetups(userId: string): Promise<ApiResponse<Meetup[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/meetups/my/${userId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching my meetups:', error);
      throw error;
    }
  }

  // Get single meetup by ID
  async getMeetupById(meetupId: string): Promise<ApiResponse<Meetup>> {
    try {
      const response = await fetch(`${API_BASE_URL}/meetups/${meetupId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching meetup:', error);
      throw error;
    }
  }

  // Join a meetup
  async joinMeetup(meetupId: string, userData: JoinMeetupData): Promise<ApiResponse<Meetup>> {
    try {
      const response = await fetch(`${API_BASE_URL}/meetups/${meetupId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error joining meetup:', error);
      throw error;
    }
  }

  // Leave a meetup
  async leaveMeetup(meetupId: string, userId: string): Promise<ApiResponse<Meetup>> {
    try {
      const response = await fetch(`${API_BASE_URL}/meetups/${meetupId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error leaving meetup:', error);
      throw error;
    }
  }
}

export const meetupService = new MeetupService();
export default meetupService;