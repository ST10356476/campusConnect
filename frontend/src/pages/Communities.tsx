import React, { useState } from 'react';
import { Users, MessageSquare, Plus, Search, Filter, Heart, MessageCircle, Share2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  badges: string[];
  points: number;
}

interface CommunitiesProps {
  user: User;
}

export function Communities({ user }: CommunitiesProps) {
  const [activeTab, setActiveTab] = useState<'discover' | 'joined' | 'posts'>('discover');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionContent, setQuestionContent] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');

  const communities = [
    {
      id: 1,
      name: 'React Developers',
      description: 'Everything about React.js, hooks, and modern frontend development',
      members: 2340,
      category: 'Web Development',
      isJoined: true,
      avatar: '⚛️'
    },
    {
      id: 2,
      name: 'Computer Science',
      description: 'Algorithms, data structures, and theoretical computer science',
      members: 1890,
      category: 'Academic',
      isJoined: true,
      avatar: '🖥️'
    },
    {
      id: 3,
      name: 'Machine Learning',
      description: 'ML algorithms, neural networks, and AI applications',
      members: 3200,
      category: 'Technology',
      isJoined: false,
      avatar: '🤖'
    },
    {
      id: 4,
      name: 'Backend Development',
      description: 'Server-side programming, databases, and system design',
      members: 1650,
      category: 'Web Development',
      isJoined: false,
      avatar: '⚙️'
    },
    {
      id: 5,
      name: 'Mathematics',
      description: 'Pure and applied mathematics, statistics, and problem solving',
      members: 980,
      category: 'Academic',
      isJoined: true,
      avatar: '📐'
    },
    {
      id: 6,
      name: 'Mobile Development',
      description: 'iOS, Android, React Native, and cross-platform development',
      members: 1420,
      category: 'Mobile',
      isJoined: false,
      avatar: '📱'
    }
  ];

  const posts = [
    {
      id: 1,
      title: 'How to optimize React rendering performance?',
      content: 'I\'m working on a large React app and noticing some performance issues. What are the best practices for optimizing rendering?',
      author: 'Sarah Chen',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      community: 'React Developers',
      timeAgo: '2 hours ago',
      likes: 12,
      comments: 8,
      tags: ['react', 'performance', 'optimization']
    },
    {
      id: 2,
      title: 'Best resources for learning algorithms?',
      content: 'Starting my journey into competitive programming. What are your recommended resources for learning algorithms and data structures?',
      author: 'Mike Johnson',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      community: 'Computer Science',
      timeAgo: '4 hours ago',
      likes: 25,
      comments: 15,
      tags: ['algorithms', 'learning', 'resources']
    },
    {
      id: 3,
      title: 'Understanding neural network backpropagation',
      content: 'Can someone explain backpropagation in simple terms? I understand the concept but struggle with the mathematical implementation.',
      author: 'Emily Davis',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
      community: 'Machine Learning',
      timeAgo: '6 hours ago',
      likes: 18,
      comments: 12,
      tags: ['neural-networks', 'backpropagation', 'mathematics']
    }
  ];

  const handleJoinCommunity = (communityId: number) => {
    // In a real app, this would make an API call to join the community
    console.log(`Joining community ${communityId}`);
  };

  const handlePostQuestion = () => {
    if (!questionTitle.trim() || !questionContent.trim() || !selectedCommunity) {
      return;
    }

    // In a real app, this would make an API call to post the question
    console.log('Posting question:', {
      title: questionTitle,
      content: questionContent,
      community: selectedCommunity
    });

    setShowQuestionModal(false);
    setQuestionTitle('');
    setQuestionContent('');
    setSelectedCommunity('');
  };

  const joinedCommunities = communities.filter(c => c.isJoined);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg flex-1 mr-6">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-3xl">🌍</span>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Communities</h1>
          </div>
          <p className="text-gray-700">Connect with study buddies, ask epic questions, and share your knowledge! 🚀</p>
        </div>
        <button
          onClick={() => setShowQuestionModal(true)}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center space-x-2 font-semibold shadow-lg transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Ask Question ✨</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'discover', label: 'Discover', count: communities.length },
            { id: 'joined', label: 'My Communities', count: joinedCommunities.length },
            { id: 'posts', label: 'Recent Posts', count: posts.length }
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
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'posts' ? 'posts' : 'communities'}...`}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'discover' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {communities.map((community) => (
            <div key={community.id} className="group bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    {community.avatar}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{community.name}</h3>
                    <p className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">{community.category}</p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 text-sm mb-6 leading-relaxed">{community.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-600 bg-gray-100 px-3 py-2 rounded-xl">
                  <Users className="w-4 h-4" />
                  <span>{community.members.toLocaleString()} members</span>
                </div>
                
                {community.isJoined ? (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-1 shadow-lg">
                    <span>✅ Joined!</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleJoinCommunity(community.id)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Join Squad 🎯
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'joined' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {joinedCommunities.map((community) => (
            <div key={community.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                  {community.avatar}
                </div>
                <div>
                  <h3 className="text-lg text-gray-900">{community.name}</h3>
                  <p className="text-sm text-gray-500">{community.members.toLocaleString()} members</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  View Community
                </button>
                <button
                  onClick={() => {
                    setSelectedCommunity(community.name);
                    setShowQuestionModal(true);
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Ask Question
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="space-y-8">
          {posts.map((post) => (
            <div key={post.id} className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <img
                    src={post.authorAvatar}
                    alt={post.author}
                    className="w-12 h-12 rounded-full ring-3 ring-purple-200"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="font-semibold text-gray-900">{post.author}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">{post.community}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500">{post.timeAgo}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">{post.content}</p>
                  
                  <div className="flex items-center space-x-3 mb-6">
                    {post.tags.map((tag) => (
                      <span key={tag} className="bg-gradient-to-r from-blue-100 to-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-8">
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-all duration-200 transform hover:scale-105">
                      <div className="p-2 rounded-full hover:bg-red-50">
                        <Heart className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{post.likes} likes</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-all duration-200 transform hover:scale-105">
                      <div className="p-2 rounded-full hover:bg-blue-50">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{post.comments} replies</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-all duration-200 transform hover:scale-105">
                      <div className="p-2 rounded-full hover:bg-green-50">
                        <Share2 className="w-5 h-5" />
                      </div>
                      <span className="font-medium">Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl text-gray-900 mb-6">Ask a Question</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Community</label>
                <select
                  value={selectedCommunity}
                  onChange={(e) => setSelectedCommunity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a community</option>
                  {joinedCommunities.map((community) => (
                    <option key={community.id} value={community.name}>
                      {community.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-2">Question Title</label>
                <input
                  type="text"
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  placeholder="What's your question?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-2">Description</label>
                <textarea
                  value={questionContent}
                  onChange={(e) => setQuestionContent(e.target.value)}
                  placeholder="Provide more details about your question..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowQuestionModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePostQuestion}
                disabled={!questionTitle.trim() || !questionContent.trim() || !selectedCommunity}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}