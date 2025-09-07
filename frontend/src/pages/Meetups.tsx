import React, { useState } from 'react';
import { Calendar, Clock, Users, MapPin, Plus, Video, ExternalLink, Bell } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  badges: string[];
  points: number;
}

interface MeetupsProps {
  user: User;
}

export function Meetups({ user }: MeetupsProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'my-meetups' | 'create'>('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [meetupForm, setMeetupForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    type: 'online',
    location: '',
    community: '',
    maxAttendees: '10'
  });

  const upcomingMeetups = [
    {
      id: 1,
      title: 'React Hooks Deep Dive',
      description: 'Comprehensive session on useState, useEffect, custom hooks, and performance optimization',
      date: '2024-01-15',
      time: '18:00',
      duration: 90,
      type: 'online',
      organizer: 'Sarah Chen',
      organizerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      community: 'React Developers',
      attendees: 12,
      maxAttendees: 15,
      isJoined: true,
      topics: ['React', 'Hooks', 'Performance']
    },
    {
      id: 2,
      title: 'Algorithm Study Group',
      description: 'Weekly problem-solving session focusing on leetcode medium problems',
      date: '2024-01-16',
      time: '14:00',
      duration: 120,
      type: 'online',
      organizer: 'Mike Johnson',
      organizerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      community: 'Computer Science',
      attendees: 8,
      maxAttendees: 12,
      isJoined: false,
      topics: ['Algorithms', 'Problem Solving', 'LeetCode']
    },
    {
      id: 3,
      title: 'Database Design Workshop',
      description: 'Hands-on workshop covering normalization, indexing, and query optimization',
      date: '2024-01-18',
      time: '16:00',
      duration: 180,
      type: 'hybrid',
      location: 'Tech Hub, Downtown',
      organizer: 'Alex Rodriguez',
      organizerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      community: 'Backend Development',
      attendees: 15,
      maxAttendees: 20,
      isJoined: true,
      topics: ['Database', 'SQL', 'Optimization']
    },
    {
      id: 4,
      title: 'Machine Learning Paper Review',
      description: 'Discussion of recent ML papers and their practical applications',
      date: '2024-01-20',
      time: '19:00',
      duration: 75,
      type: 'online',
      organizer: 'Emily Davis',
      organizerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
      community: 'Machine Learning',
      attendees: 6,
      maxAttendees: 10,
      isJoined: false,
      topics: ['Machine Learning', 'Research', 'Papers']
    }
  ];

  const myMeetups = upcomingMeetups.filter(m => m.isJoined || m.organizer === user.name);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleJoinMeetup = (meetupId: number) => {
    // In a real app, this would make an API call
    console.log(`Joining meetup ${meetupId}`);
  };

  const handleCreateMeetup = () => {
    // In a real app, this would make an API call
    console.log('Creating meetup:', meetupForm);
    setShowCreateModal(false);
    setMeetupForm({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: '60',
      type: 'online',
      location: '',
      community: '',
      maxAttendees: '10'
    });
  };

  const addToCalendar = (meetup: any) => {
    // Generate calendar event
    const startDate = new Date(`${meetup.date}T${meetup.time}`);
    const endDate = new Date(startDate.getTime() + meetup.duration * 60000);
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(meetup.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(meetup.description)}`;
    
    window.open(calendarUrl, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Study Meetups</h1>
          <p className="text-gray-600">Join study sessions and collaborate with peers</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Meetup</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'upcoming', label: 'Upcoming Meetups', count: upcomingMeetups.length },
            { id: 'my-meetups', label: 'My Meetups', count: myMeetups.length },
            { id: 'create', label: 'Quick Create' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} {tab.count && `(${tab.count})`}
            </button>
          ))}
        </nav>
      </div>

      {/* Upcoming Meetups */}
      {activeTab === 'upcoming' && (
        <div className="space-y-6">
          {upcomingMeetups.map((meetup) => (
            <div key={meetup.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl text-gray-900 mb-2">{meetup.title}</h3>
                      <p className="text-gray-600 mb-3">{meetup.description}</p>
                    </div>
                    {meetup.isJoined && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        Joined
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{formatDate(meetup.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{formatTime(meetup.time)} ({meetup.duration}min)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{meetup.attendees}/{meetup.maxAttendees} attendees</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      {meetup.type === 'online' ? (
                        <Video className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                      <span className="text-sm">
                        {meetup.type === 'online' ? 'Online' : meetup.location || 'In-person'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <img
                        src={meetup.organizerAvatar}
                        alt={meetup.organizer}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-gray-600">Hosted by {meetup.organizer}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">{meetup.community}</span>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    {meetup.topics.map((topic) => (
                      <span key={topic} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col space-y-3 lg:w-48">
                  {meetup.isJoined ? (
                    <>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                        <Video className="w-4 h-4" />
                        <span>Join Session</span>
                      </button>
                      <button
                        onClick={() => addToCalendar(meetup)}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Add to Calendar</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleJoinMeetup(meetup.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Join Meetup
                      </button>
                      <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                        <Bell className="w-4 h-4" />
                        <span>Remind Me</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Meetups */}
      {activeTab === 'my-meetups' && (
        <div className="space-y-6">
          {myMeetups.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl text-gray-900 mb-2">No meetups yet</h3>
              <p className="text-gray-600 mb-6">Join your first meetup or create one</p>
              <button
                onClick={() => setActiveTab('upcoming')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Meetups
              </button>
            </div>
          ) : (
            myMeetups.map((meetup) => (
              <div key={meetup.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg text-gray-900 mb-2">{meetup.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span>{formatDate(meetup.date)} at {formatTime(meetup.time)}</span>
                      <span>•</span>
                      <span>{meetup.attendees} attendees</span>
                      <span>•</span>
                      <span>{meetup.community}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {meetup.topics.map((topic) => (
                        <span key={topic} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {meetup.organizer === user.name && (
                      <button className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded transition-colors">
                        Edit
                      </button>
                    )}
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Quick Create */}
      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl text-gray-900 mb-6">Create Study Meetup</h2>
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Meetup Title</label>
                <input
                  type="text"
                  value={meetupForm.title}
                  onChange={(e) => setMeetupForm({...meetupForm, title: e.target.value})}
                  placeholder="e.g., React Hooks Deep Dive"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Description</label>
                <textarea
                  value={meetupForm.description}
                  onChange={(e) => setMeetupForm({...meetupForm, description: e.target.value})}
                  placeholder="Describe what you'll cover in this session..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={meetupForm.date}
                    onChange={(e) => setMeetupForm({...meetupForm, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={meetupForm.time}
                    onChange={(e) => setMeetupForm({...meetupForm, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Duration (minutes)</label>
                  <select
                    value={meetupForm.duration}
                    onChange={(e) => setMeetupForm({...meetupForm, duration: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                    <option value="180">3 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Max Attendees</label>
                  <input
                    type="number"
                    value={meetupForm.maxAttendees}
                    onChange={(e) => setMeetupForm({...meetupForm, maxAttendees: e.target.value})}
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="online"
                      checked={meetupForm.type === 'online'}
                      onChange={(e) => setMeetupForm({...meetupForm, type: e.target.value})}
                      className="text-blue-600"
                    />
                    <span>Online</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="in-person"
                      checked={meetupForm.type === 'in-person'}
                      onChange={(e) => setMeetupForm({...meetupForm, type: e.target.value})}
                      className="text-blue-600"
                    />
                    <span>In-person</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="hybrid"
                      checked={meetupForm.type === 'hybrid'}
                      onChange={(e) => setMeetupForm({...meetupForm, type: e.target.value})}
                      className="text-blue-600"
                    />
                    <span>Hybrid</span>
                  </label>
                </div>
              </div>

              {meetupForm.type !== 'online' && (
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={meetupForm.location}
                    onChange={(e) => setMeetupForm({...meetupForm, location: e.target.value})}
                    placeholder="Enter the meeting location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleCreateMeetup}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Meetup
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Meetup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <h2 className="text-2xl text-gray-900 mb-6">Create Study Meetup</h2>
            {/* Same form as in the create tab */}
            <div className="flex items-center justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMeetup}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Meetup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}