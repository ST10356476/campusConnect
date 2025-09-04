import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Plus, Search, Filter, Heart, MessageCircle, Share2 } from 'lucide-react';
import { apiService, User, Community } from '../services/api';

interface CommunitiesProps {
  user: User;
}

export function Communities({ user }: CommunitiesProps) {
  const [activeTab, setActiveTab] = useState<'discover' | 'joined' | 'posts'>('discover');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedCommunities, setJoinedCommunities] = useState<Community[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Create community form
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    category: 'Study Group',
    isPrivate: false,
    maxMembers: 50,
    tags: '',
    university: user.profile?.university || '',
    course: ''
  });

  // Mock posts data (you can replace with real API later)
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
    }
  ];

  // Fetch communities from API
  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== 'all') params.category = selectedCategory;
      
      const response = await apiService.getCommunities(params);
      
      if (response.success) {
        setCommunities(response.communities || []);
        
        // Filter joined communities
        const joined = response.communities?.filter((community: Community) =>
          community.members.some(member => member.user === user.id)
        ) || [];
        setJoinedCommunities(joined);
      }
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load communities on component mount and when search/filter changes
  useEffect(() => {
    fetchCommunities();
  }, [searchTerm, selectedCategory]);

  // Create community
  const handleCreateCommunity = async () => {
    try {
      setLoading(true);
      
      const communityData = {
        ...createForm,
        tags: createForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };
      
      const response = await apiService.createCommunity(communityData);
      
      if (response.success) {
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          description: '',
          category: 'Study Group',
          isPrivate: false,
          maxMembers: 50,
          tags: '',
          university: user.profile?.university || '',
          course: ''
        });
        
        // Refresh communities
        await fetchCommunities();
      }
    } catch (error: any) {
      console.error('Failed to create community:', error);
      alert(error.message || 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  // Join community
  const handleJoinCommunity = async (communityId: string) => {
    try {
      const response = await apiService.joinCommunity(communityId);
      
      if (response.success) {
        // Refresh communities
        await fetchCommunities();
      }
    } catch (error: any) {
      console.error('Failed to join community:', error);
      alert(error.message || 'Failed to join community');
    }
  };

  // Leave community
  const handleLeaveCommunity = async (communityId: string) => {
    try {
      const response = await apiService.leaveCommunity(communityId);
      
      if (response.success) {
        // Refresh communities
        await fetchCommunities();
      }
    } catch (error: any) {
      console.error('Failed to leave community:', error);
      alert(error.message || 'Failed to leave community');
    }
  };

  // Check if user is member of community
  const isMemberOfCommunity = (community: Community) => {
    return community.members.some(member => member.user === user.id);
  };

  // Get display name for user
  const getDisplayName = (user: User) => {
    return user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.username;
  };

  const categories = [
    'Study Group',
    'Project Team',
    'Course Discussion',
    'Research Group',
    'Hobby Club',
    'Sports',
    'Technology',
    'Arts & Culture',
    'Other'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg flex-1 mr-6">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-3xl">🌍</span>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Communities</h1>
          </div>
          <p className="text-gray-700">Connect with study buddies, ask epic questions, and share your knowledge!</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center space-x-2 font-semibold shadow-lg transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Create Community</span>
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
      {activeTab !== 'posts' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'discover' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {communities.map((community) => (
            <div key={community.id} className="group bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    {community.avatar ? (
                      <img src={community.avatar} alt={community.name} className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                      '👥'
                    )}
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
                  <span>{community.memberCount} members</span>
                </div>
                
                {isMemberOfCommunity(community) ? (
                  <div className="flex space-x-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-1 shadow-lg">
                      <span>✅ Joined!</span>
                    </div>
                    <button
                      onClick={() => handleLeaveCommunity(community.id)}
                      className="text-red-600 hover:text-red-700 px-3 py-2 text-sm transition-colors"
                    >
                      Leave
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleJoinCommunity(community.id)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Join Squad
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {communities.length === 0 && !loading && (
            <div className="col-span-full text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl text-gray-900 mb-2">No communities found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or create the first community!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Community
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'joined' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {joinedCommunities.map((community) => (
            <div key={community.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                  {community.avatar ? (
                    <img src={community.avatar} alt={community.name} className="w-full h-full rounded-lg object-cover" />
                  ) : (
                    '👥'
                  )}
                </div>
                <div>
                  <h3 className="text-lg text-gray-900">{community.name}</h3>
                  <p className="text-sm text-gray-500">{community.memberCount} members</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <button onClick={() => navigate(`/communities/${community.id}`)} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  View Community
                </button>
                <button
                  onClick={() => handleLeaveCommunity(community.id)}
                  className="w-full bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Leave Community
                </button>
              </div>
            </div>
          ))}
          
          {joinedCommunities.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl text-gray-900 mb-2">No communities joined yet</h3>
              <p className="text-gray-600 mb-6">Discover and join communities to start collaborating!</p>
              <button
                onClick={() => setActiveTab('discover')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Discover Communities
              </button>
            </div>
          )}
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

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl text-gray-900 mb-6">Create Community</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Community Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  placeholder="e.g., React Study Group"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  placeholder="Describe what this community is about..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Category</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({...createForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Max Members</label>
                  <input
                    type="number"
                    value={createForm.maxMembers}
                    onChange={(e) => setCreateForm({...createForm, maxMembers: parseInt(e.target.value)})}
                    min="5"
                    max="500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">University</label>
                <input
                  type="text"
                  value={createForm.university}
                  onChange={(e) => setCreateForm({...createForm, university: e.target.value})}
                  placeholder="Your university"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Course (Optional)</label>
                <input
                  type="text"
                  value={createForm.course}
                  onChange={(e) => setCreateForm({...createForm, course: e.target.value})}
                  placeholder="Related course or subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={createForm.tags}
                  onChange={(e) => setCreateForm({...createForm, tags: e.target.value})}
                  placeholder="react, javascript, web development"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={createForm.isPrivate}
                    onChange={(e) => setCreateForm({...createForm, isPrivate: e.target.checked})}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Make this community private</span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCommunity}
                disabled={loading || !createForm.name.trim() || !createForm.description.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Community'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}