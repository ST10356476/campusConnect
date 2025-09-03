import React, { useState } from 'react';
import { Edit, Camera, MapPin, Calendar, Mail, Users, BookOpen, Award, Settings } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  badges: string[];
  points: number;
}

interface ProfileProps {
  user: User;
  setUser: (user: User) => void;
}

export function Profile({ user, setUser }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    bio: 'Passionate learner exploring web development and computer science. Love collaborating with others and sharing knowledge!',
    location: 'San Francisco, CA',
    interests: ['React', 'JavaScript', 'Machine Learning', 'Computer Science'],
    joinedDate: '2024-01-01'
  });

  const stats = [
    { label: 'Questions Asked', value: 12, icon: BookOpen },
    { label: 'Communities Joined', value: 5, icon: Users },
    { label: 'Meetups Attended', value: 8, icon: Calendar },
    { label: 'Achievement Points', value: user.points, icon: Award }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'question',
      content: 'Asked: "How to optimize React rendering performance?"',
      community: 'React Developers',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'meetup',
      content: 'Attended: Algorithm Study Group',
      community: 'Computer Science',
      time: '1 day ago'
    },
    {
      id: 3,
      type: 'material',
      content: 'Shared: Data Structures Cheat Sheet',
      community: 'Computer Science',
      time: '3 days ago'
    },
    {
      id: 4,
      type: 'achievement',
      content: 'Earned: Helpful Member badge',
      community: 'Achievement',
      time: '1 week ago'
    }
  ];

  const achievements = [
    { id: 1, name: 'First Question', icon: '🎯', color: 'bg-blue-100 text-blue-700' },
    { id: 2, name: 'Helpful Member', icon: '⭐', color: 'bg-yellow-100 text-yellow-700' },
    { id: 3, name: 'Early Bird', icon: '🌅', color: 'bg-orange-100 text-orange-700' },
    { id: 4, name: 'Study Buddy', icon: '👥', color: 'bg-green-100 text-green-700' }
  ];

  const handleSaveProfile = () => {
    // In a real app, this would make an API call to update the profile
    setUser({
      ...user,
      name: editForm.name
    });
    setIsEditing(false);
  };

  const handleAvatarChange = () => {
    // In a real app, this would open a file picker and upload the image
    console.log('Avatar change requested');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                alt={user.name}
                className="w-24 h-24 rounded-full"
              />
              <button
                onClick={handleAvatarChange}
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="text-2xl border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Location"
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl text-gray-900 mb-2">{user.name}</h1>
                  <p className="text-gray-600 mb-4">{editForm.bio}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{editForm.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(editForm.joinedDate).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Interests */}
          <div className="mt-6">
            <h3 className="text-sm text-gray-700 mb-2">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {editForm.interests.map((interest) => (
                <span
                  key={interest}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Achievements */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl text-gray-900 mb-4">Recent Achievements</h2>
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${achievement.color}`}>
                      <span className="text-lg">{achievement.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{achievement.name}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm transition-colors">
                View All Achievements
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const getActivityIcon = () => {
                    switch (activity.type) {
                      case 'question': return BookOpen;
                      case 'meetup': return Calendar;
                      case 'material': return BookOpen;
                      case 'achievement': return Award;
                      default: return BookOpen;
                    }
                  };
                  const Icon = getActivityIcon();
                  
                  return (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.content}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">{activity.community}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Communities */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl text-gray-900 mb-4">My Communities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'React Developers', members: '2.3K', role: 'Member', avatar: '⚛️' },
                { name: 'Computer Science', members: '1.8K', role: 'Active Member', avatar: '🖥️' },
                { name: 'Mathematics', members: '980', role: 'Member', avatar: '📐' },
                { name: 'Machine Learning', members: '3.2K', role: 'New Member', avatar: '🤖' },
                { name: 'Backend Development', members: '1.6K', role: 'Member', avatar: '⚙️' }
              ].map((community, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                    {community.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{community.name}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{community.members} members</span>
                      <span>•</span>
                      <span>{community.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}