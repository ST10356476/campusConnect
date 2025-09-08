import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Calendar, Award, Plus, MessageSquare, FileText } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  badge?: string;
  badges: string[];
  points?: number;  // Optional
}

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  const recentActivity = [
    {
      id: 1,
      type: 'question',
      title: 'How does React state management work?',
      time: '2 hours ago',
      community: 'React Developers'
    },
    {
      id: 2,
      type: 'meetup',
      title: 'JavaScript Study Session',
      time: 'Tomorrow at 3 PM',
      community: 'Web Development'
    },
    {
      id: 3,
      type: 'material',
      title: 'Data Structures Cheat Sheet',
      time: '1 day ago',
      community: 'Computer Science'
    },
    {
      id: 4,
      type: 'achievement',
      title: 'First Question Posted',
      time: '2 days ago',
      community: 'Achievement Unlocked'
    }
  ];

  const upcomingMeetups = [
    {
      id: 1,
      title: 'React Hooks Deep Dive',
      time: 'Today at 6 PM',
      attendees: 12,
      community: 'React Developers'
    },
    {
      id: 2,
      title: 'Algorithm Study Group',
      time: 'Tomorrow at 2 PM',
      attendees: 8,
      community: 'Computer Science'
    },
    {
      id: 3,
      title: 'Database Design Workshop',
      time: 'Friday at 4 PM',
      attendees: 15,
      community: 'Backend Development'
    }
  ];

  const quickStats = [
    { label: 'Questions Asked', value: 12, icon: MessageSquare, color: 'blue' },
    { label: 'Study Sessions', value: 5, icon: Calendar, color: 'green' },
    { label: 'Materials Shared', value: 8, icon: FileText, color: 'purple' },
    { label: 'Achievement Points', value: user.points, icon: Award, color: 'yellow' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-10">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">👋</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Hey {user.name}! 🌟
              </h1>
              <p className="text-gray-600 text-lg">Ready to level up your learning game today?</p>
              <p className="text-gray-600 text-lg">Check out a quick overview of what's happening and enjoy learning.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          const gradientClasses = {
            blue: 'from-blue-500 to-cyan-500',
            green: 'from-green-500 to-emerald-500',
            purple: 'from-purple-500 to-pink-500',
            yellow: 'from-yellow-500 to-orange-500'
          };
          const bgClasses = {
            blue: 'from-blue-50 to-cyan-50',
            green: 'from-green-50 to-emerald-50',
            purple: 'from-purple-50 to-pink-50',
            yellow: 'from-yellow-50 to-orange-50'
          };
          
          return (
            <div key={index} className={`bg-gradient-to-br ${bgClasses[stat.color as keyof typeof bgClasses]} p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm font-medium text-gray-700">{stat.label}</p>
                </div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradientClasses[stat.color as keyof typeof gradientClasses]} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-6">
              <span className="text-xl">⚡</span>
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            </div>
            <div className="space-y-4">
              <Link
                to="/communities"
                className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl hover:from-blue-100 hover:to-cyan-100 transition-all duration-300 group hover:shadow-md transform hover:scale-[1.02]"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <span className="text-xl">❓</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Ask a Question</p>
                  <p className="text-xs text-gray-600">Get help from study buddies</p>
                </div>
              </Link>
              
              <Link
                to="/materials"
                className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300 group hover:shadow-md transform hover:scale-[1.02]"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <span className="text-xl">📚</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Upload Materials</p>
                  <p className="text-xs text-gray-600">Share your awesome notes</p>
                </div>
              </Link>
              
              <Link
                to="/meetups"
                className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl hover:from-purple-100 hover:to-pink-100 transition-all duration-300 group hover:shadow-md transform hover:scale-[1.02]"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <span className="text-xl">📅</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Schedule Meetup</p>
                  <p className="text-xs text-gray-600">Plan epic study sessions</p>
                </div>
              </Link>
              
              <Link
                to="/communities"
                className="flex items-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl hover:from-yellow-100 hover:to-orange-100 transition-all duration-300 group hover:shadow-md transform hover:scale-[1.02]"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <span className="text-xl">👥</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Join Community</p>
                  <p className="text-xs text-gray-600">Find your study squad</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Activity */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-xl">📈</span>
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              </div>
              <Link to="/communities" className="text-purple-600 hover:text-purple-700 font-medium text-sm hover:underline">
                See all activity →
              </Link>
            </div>
            
            <div className="space-y-3">
              {recentActivity.map((activity) => {
                const getEmoji = () => {
                  switch (activity.type) {
                    case 'question': return '❓';
                    case 'meetup': return '📅';
                    case 'material': return '📚';
                    case 'achievement': return '🏆';
                    default: return '💬';
                  }
                };
                
                return (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 hover:bg-white/40 rounded-xl transition-all duration-200 hover:shadow-sm border border-transparent hover:border-white/30">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">{getEmoji()}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs font-medium text-purple-600">{activity.community}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Meetups */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🚀</span>
                <h2 className="text-xl font-bold text-gray-900">Upcoming Meetups</h2>
              </div>
              <Link to="/meetups" className="text-purple-600 hover:text-purple-700 font-medium text-sm hover:underline">
                See all meetups →
              </Link>
            </div>
            
            <div className="space-y-4">
              {upcomingMeetups.map((meetup) => (
                <div key={meetup.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-white/40 to-white/20 border border-white/30 rounded-2xl hover:from-white/60 hover:to-white/40 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{meetup.title}</h3>
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">⏰ {meetup.time}</span>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">👥 {meetup.attendees}</span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">🎯 {meetup.community}</span>
                    </div>
                  </div>
                  <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg">
                    Join 🎉
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}