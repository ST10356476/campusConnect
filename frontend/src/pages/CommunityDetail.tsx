import React, { useState, useEffect } from 'react';
import * as Avatar from '@radix-ui/react-avatar';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  MessageCircle, 
  Plus, 
  Pin, 
  Lock, 
  Heart, 
  Reply,
  Search,
  HelpCircle,
  Megaphone,
  BookOpen
} from 'lucide-react';
import { apiService, User, Community, CommunityPost } from '../services/api';

interface CommunityDetailProps {
  user: User;
}

export function CommunityDetail({ user }: CommunityDetailProps) {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  // Create post form
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    type: 'discussion' as 'discussion' | 'question' | 'announcement' | 'resource',
    tags: ''
  });

  // Reply form
  const [replyForm, setReplyForm] = useState({
    content: '',
    postId: ''
  });

  useEffect(() => {
    if (communityId) {
      fetchCommunityDetails();
    }
  }, [communityId]);

  useEffect(() => {
    if (communityId) {
      fetchCommunityPosts();
    }
  }, [communityId, searchTerm, filterType, sortBy]);

  const fetchCommunityDetails = async () => {
    try {
      const response = await apiService.getCommunityById(communityId!);
      if (response.success) {
        setCommunity(response.community);
      }
    } catch (error) {
      console.error('Failed to fetch community details:', error);
    }
  };

  const fetchCommunityPosts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCommunityPosts(communityId!, {
        search: searchTerm,
        type: filterType !== 'all' ? filterType : undefined,
        sortBy
      });
      
      if (response.success) {
        setPosts(response.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch community posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    try {
      const postData = {
        title: postForm.title,
        content: postForm.content,
        type: postForm.type,
        communityId: communityId!,
        tags: postForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      const response = await apiService.createCommunityPost(postData);
      
      if (response.success) {
        setShowCreatePost(false);
        setPostForm({ title: '', content: '', type: 'discussion', tags: '' });
        // Only update posts state directly to avoid double-fetch
        setPosts(prev => [response.post, ...prev]);
      }
    } catch (error: any) {
      console.error('Failed to create post:', error);
      alert(error.message || 'Failed to create post');
    }
  };

  const handleReply = async (postId: string) => {
    try {
      if (!replyForm.content.trim()) return;
      
      const response = await apiService.replyToPost(postId, { content: replyForm.content });
      
      if (response.success) {
        setReplyForm({ content: '', postId: '' });
        await fetchCommunityPosts();
      }
    } catch (error: any) {
      console.error('Failed to reply:', error);
      alert(error.message || 'Failed to reply');
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await apiService.likePost(postId);
      await fetchCommunityPosts();
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleJoinCommunity = async () => {
    if (!communityId) return;
    
    try {
      const response = await apiService.joinCommunity(communityId);
      if (response.success) {
        await fetchCommunityDetails();
        await fetchCommunityPosts();
      }
    } catch (error: any) {
      console.error('Failed to join community:', error);
      alert(error.message || 'Failed to join community');
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'question': return HelpCircle;
      case 'announcement': return Megaphone;
      case 'resource': return BookOpen;
      default: return MessageCircle;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'question': return 'bg-blue-100 text-blue-700';
      case 'announcement': return 'bg-yellow-100 text-yellow-700';
      case 'resource': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  // Check if user is a member - handle different data structures
  const isMember = community?.isMember || 
    community?.members?.some(member => {
      const memberId = typeof member.user === 'string' 
        ? member.user 
        : (member.user as any)?._id || (member.user as any)?.id;
      return memberId === user.id || memberId === user._id;
    });

  // Get creator name - handle different data structures
  const getCreatorName = () => {
    if (!community?.creator) return 'Unknown';
    
    if (typeof community.creator === 'string') {
      return 'Community Creator';
    }
    
    const creator = community.creator as any;
    if (creator.profile) {
      return `${creator.profile.firstName} ${creator.profile.lastName}`;
    }
    
    return creator.username || 'Community Creator';
  };

  // Check if post is liked by user
  const isPostLiked = (post: CommunityPost) => {
    return post.likes?.some(
      (like: any) =>
        (typeof like === 'string' && (like === user.id || like === user._id)) ||
        (typeof like === 'object' && (like.user === user.id || like.user === user._id))
    );
  };

  if (loading && !community) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-gray-900 mb-4">Community not found</h2>
          <button
            onClick={() => navigate('/communities')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Communities
          </button>
        </div>
      </div>
    );
  }

  return (
  <div className="container mx-auto px-4 py-8 min-w-0 overflow-x-hidden">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/communities')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Communities</span>
        </button>

        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-8 min-w-0">
          <div className="flex flex-col md:flex-row items-start md:space-x-6 min-w-0 w-full">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center text-3xl min-w-0">
              <Avatar.Root className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center text-3xl min-w-0">
                <Avatar.Image
                  src={community && community.avatar ? community.avatar : undefined}
                  alt={community && community.name ? community.name : 'Community'}
                  className="w-full h-full rounded-2xl object-cover"
                />
                <Avatar.Fallback
                  delayMs={100}
                  className="block w-full h-full flex items-center justify-center font-bold text-purple-600"
                >
                  {community && community.name && typeof community.name === 'string' && community.name.trim().length > 0
                    ? community.name.trim().split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
                    : 'CC'}
                </Avatar.Fallback>
              </Avatar.Root>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900">{community.name}</h1>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                  {community.category}
                </span>
              </div>
              
              <p className="text-gray-700 mb-4 leading-relaxed">{community.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 min-w-0">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{community.memberCount} members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>{posts.length} posts</span>
                </div>
                <span>Created by {getCreatorName()}</span>
              </div>
            </div>

            {isMember && (
              <button
                onClick={() => setShowCreatePost(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>New Post</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {!isMember ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8 text-center">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Join this community to participate</h3>
          <p className="text-yellow-700 mb-4">You need to be a member to view posts and discussions</p>
          <button
            onClick={handleJoinCommunity}
            className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Join Community
          </button>
        </div>
      ) : (
        <>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8 min-w-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Posts</option>
              <option value="discussion">Discussions</option>
              <option value="question">Questions</option>
              <option value="announcement">Announcements</option>
              <option value="resource">Resources</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="latest">Latest</option>
              <option value="popular">Most Popular</option>
              <option value="replies">Most Replies</option>
            </select>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-2xl">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-6">Be the first to start a discussion!</p>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create First Post
                </button>
              </div>
            ) : (
              posts.map((post) => {
                const TypeIcon = getPostTypeIcon(post.type);
                const postLiked = isPostLiked(post);
                
                return (
                  <div key={post.id} className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <img
                        src={post.author?.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                        alt={post.author?.username || 'User'}
                        className="w-12 h-12 rounded-full ring-2 ring-purple-200"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-semibold text-gray-900">
                            {post.author?.profile ? 
                              `${post.author.profile.firstName} ${post.author.profile.lastName}` : 
                              post.author?.username || 'Anonymous'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getPostTypeColor(post.type)}`}>
                            <TypeIcon className="w-3 h-3" />
                            <span>{post.type}</span>
                          </span>
                          <span className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</span>
                          {post.isPinned && <Pin className="w-4 h-4 text-yellow-600" />}
                          {post.isLocked && <Lock className="w-4 h-4 text-red-600" />}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                        <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>
                        
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex items-center space-x-2 mb-4">
                            {post.tags.map((tag) => (
                              <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-6">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <Heart className={`w-5 h-5 ${postLiked ? 'fill-red-500 text-red-500' : ''}`} />
                            <span>{post.likes?.length || 0}</span>
                          </button>
                          
                          <button
                            onClick={() => setSelectedPost(selectedPost?.id === post.id ? null : post)}
                            className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
                          >
                            <Reply className="w-5 h-5" />
                            <span>{post.replies?.length || 0} replies</span>
                          </button>
                          
                          <span className="text-gray-500 text-sm">{post.viewCount || 0} views</span>
                        </div>

                        {/* Replies Section */}
                        {selectedPost?.id === post.id && (
                          <div className="mt-6 border-t border-gray-200 pt-6">
                            <div className="space-y-4 mb-6">
                              {post.replies && post.replies.map((reply) => (
                                <div key={reply.id || reply._id} className="flex items-start space-x-3 bg-gray-50 rounded-lg p-4">
                                  <img
                                    src={reply.author?.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=reply'}
                                    alt={reply.author?.username || 'User'}
                                    className="w-8 h-8 rounded-full"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="font-medium text-sm">
                                        {reply.author?.profile ? 
                                          `${reply.author.profile.firstName} ${reply.author.profile.lastName}` : 
                                          reply.author?.username || 'Anonymous'}
                                      </span>
                                      <span className="text-xs text-gray-500">{formatTimeAgo(reply.createdAt)}</span>
                                    </div>
                                    <p className="text-sm text-gray-700">{reply.content}</p>
                                  </div>
                                </div>
                              ))}
                              {(!post.replies || post.replies.length === 0) && (
                                <p className="text-gray-500 text-sm text-center py-4">No replies yet. Be the first to reply!</p>
                              )}
                            </div>
                            
                            {!post.isLocked && (
                              <div className="flex space-x-3">
                                <img
                                  src={user.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                                  alt={user.username}
                                  className="w-8 h-8 rounded-full"
                                />
                                <div className="flex-1 flex space-x-2">
                                  <input
                                    type="text"
                                    placeholder="Write a reply..."
                                    value={replyForm.postId === post.id ? replyForm.content : ''}
                                    onChange={(e) => setReplyForm({ content: e.target.value, postId: post.id })}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter' && replyForm.content.trim()) {
                                        handleReply(post.id);
                                      }
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  />
                                  <button
                                    onClick={() => handleReply(post.id)}
                                    disabled={!replyForm.content.trim() || replyForm.postId !== post.id}
                                    className="bg-purple-600 text-gray-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            )}
                            {post.isLocked && (
                              <p className="text-gray-500 text-sm text-center py-4">This post is locked and cannot receive new replies.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl text-gray-900 mb-6">Create New Post</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Post Type</label>
                <select
                  value={postForm.type}
                  onChange={(e) => setPostForm({...postForm, type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="discussion">Discussion</option>
                  <option value="question">Question</option>
                  <option value="resource">Resource</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={postForm.title}
                  onChange={(e) => setPostForm({...postForm, title: e.target.value})}
                  placeholder="What's this about?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Content</label>
                <textarea
                  value={postForm.content}
                  onChange={(e) => setPostForm({...postForm, content: e.target.value})}
                  placeholder="Share your thoughts..."
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={postForm.tags}
                  onChange={(e) => setPostForm({...postForm, tags: e.target.value})}
                  placeholder="react, javascript, help"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowCreatePost(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={!postForm.title.trim() || !postForm.content.trim()}
                className="bg-purple-600 text-gray-600 px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}