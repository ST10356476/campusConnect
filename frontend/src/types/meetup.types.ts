// frontend/src/types/meetup.types.ts
export interface Meetup {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  maxAttendees: number;
  meetingLink: string;
  organizer: {
    id: string;
    name: string;
  };
  attendees: Attendee[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  isFull?: boolean;
  attendeeCount?: number;
}

export interface Attendee {
  userId: string;
  name: string;
  joinedAt: string;
}

export interface CreateMeetupData {
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  maxAttendees: number;
  meetingLink: string;
  organizer: {
    id: string;
    name: string;
  };
}

export interface JoinMeetupData {
  userId: string;
  name: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}