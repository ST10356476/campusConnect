import React, { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
} from '../components/ui/alert-dialog';
import { Link } from 'react-router-dom';
import { MessageSquare, Calendar, FileText, Zap, Rocket, TrendingUp, Sparkles } from 'lucide-react';
import { apiService, User as ApiUser, Meetup, CommunityPost, Achievement } from '../services/api';

interface DashboardProps {
  user: ApiUser;
}

export function Dashboard({ user }: DashboardProps) {
  // Welcome modal state (must be inside component)
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Show welcome modal for first-time users
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('campusconnect_welcome');
      if (!seen) {
        setShowWelcome(true);
        localStorage.setItem('campusconnect_welcome', '1');
      }
    }
  }, []);

  const [recentMeetups, setRecentMeetups] = useState<Meetup[]>([]);
  const [recentPosts, setRecentPosts] = useState<CommunityPost[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugOpen, setDebugOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation trigger
    setIsVisible(true);
    
    async function fetchData() {
      setLoading(true);
      try {
  // User object loaded
        
        // Fetch recent meetups
        const meetupsRes = await apiService.getMeetups({ sortBy: 'dateTime.start:desc', limit: 3 });
  // Meetups API response loaded
        
        let meetupsArr: Meetup[] = [];
        if (meetupsRes && meetupsRes.success && Array.isArray(meetupsRes.meetups)) {
          meetupsArr = meetupsRes.meetups;
        } else if (Array.isArray(meetupsRes)) {
          meetupsArr = meetupsRes;
        } else {
          console.warn('No valid meetups found in API response:', meetupsRes);
        }
        setRecentMeetups(meetupsArr);

        // Fetch posts from joined communities
        let posts: CommunityPost[] = [];
        if (user.communities && Array.isArray(user.communities) && user.communities.length > 0) {
          // User communities loaded
          
          const validCommunityIds = user.communities
            .map((c: any) => (typeof c === 'string' ? c : c?.id || c?._id || ''))
            .filter((id: string) => typeof id === 'string' && id.trim().length > 0);
            
          for (const communityId of validCommunityIds) {
            try {
              const postsRes = await apiService.getCommunityPosts(communityId, { 
                limit: 3, 
                sortBy: 'createdAt:desc' 
              });
              // Posts for community loaded
              
              if (postsRes && postsRes.success && Array.isArray(postsRes.posts)) {
                posts = posts.concat(postsRes.posts);
              }
            } catch (err) {
              console.warn('Skipping invalid community ID:', communityId, err);
            }
          }
          
          posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          posts = posts.slice(0, 3);
        } else {
          // No user communities found or user.communities is empty
        }
        setRecentPosts(posts);

        // Fetch achievements
        const achievementsRes = await apiService.getAchievements();
  // Achievements API response loaded
        
        let achievementsArr: Achievement[] = [];
        if (achievementsRes && achievementsRes.success && achievementsRes.data && Array.isArray(achievementsRes.data.achievements)) {
          achievementsArr = achievementsRes.data.achievements;
        }
        
        const unlocked = achievementsArr.filter((a: Achievement) => a.unlocked && a.unlockedAt);
        unlocked.sort((a: Achievement, b: Achievement) => 
          new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
        );
        setRecentAchievements(unlocked.slice(0, 3));
        
      } catch (err) {
        console.error('Dashboard fetchData error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <>
  <div className="container mx-auto px-4 py-8">
      {/* Welcome Header with enhanced animation */}
      <div className={`mb-10 transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/5 rounded-full"></div>
            <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/8 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="flex items-center space-x-4 mb-4 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
              <span className="text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>👋</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-purple-600 flex items-center">
                Hey {user.name}! 
                <Sparkles className="w-6 h-6 ml-2 text-yellow-300 animate-pulse" />
              </h1>
              <p className="text-gray-600 text-lg mt-2">Ready to level up your learning game today?</p>
              <div className="flex items-center mt-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-ping"></div>
                <p className="text-purple-600 text-sm">Active now</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content: Recent Activity + Upcoming Meetups */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Activity with enhanced animations */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg p-6 transform transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              </div>
              <Link to="/communities" className="text-purple-600 hover:text-purple-700 font-medium text-sm hover:underline flex items-center group">
                See all activity 
                <Zap className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8 space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              ) : (
                <>
                  {/* Posts */}
                  {recentPosts.length === 0 && (
                    <div className="text-center py-8 transform hover:scale-105 transition-transform duration-300">
                      <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <MessageSquare className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm mb-4">No recent posts found.</p>
                      <Link 
                        to="/communities" 
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                      >
                        Join a community to see activity
                      </Link>
                    </div>
                  )}
                  {recentPosts.slice(0, 5).map((activity, index) => {
                    const postTime = new Date(activity.createdAt).toLocaleString();
                    // Show author username instead of community
                    let authorName = '';
                    if (activity.author && typeof activity.author === 'object') {
                      authorName = activity.author.username;
                    } else if (typeof activity.author === 'string') {
                      authorName = activity.author;
                    }
                    return (
                      <div 
                        key={activity.id || index} 
                        className="flex items-start space-x-4 p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl transition-all duration-300 hover:shadow-md hover:border-purple-200/50 border border-transparent transform hover:-translate-y-0.5"
                        style={{ transitionDelay: `${index * 100}ms` }}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-lg">💬</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">{authorName}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{postTime}</span>
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0 mt-2 animate-pulse"></div>
                      </div>
                    );
                  })}
                  
                  {/* Achievements */}
                  {recentAchievements.length === 0 && recentPosts.length === 0 && (
                    <div className="text-gray-500 text-sm text-center py-4">No recent achievements found.</div>
                  )}
                  {recentAchievements.slice(0, 5).map((activity, index) => {
                    const unlockedTime = activity.unlockedAt ? new Date(activity.unlockedAt).toLocaleString() : '';
                    return (
                      <div 
                        key={activity._id || index} 
                        className="flex items-start space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl transition-all duration-300 hover:shadow-md border border-yellow-100/50 transform hover:-translate-y-0.5"
                        style={{ transitionDelay: `${index * 100}ms` }}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-lg">🏆</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-full">Achievement Unlocked</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{unlockedTime}</span>
                          </div>
                        </div>
                        <Sparkles className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-2 animate-pulse" />
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* Upcoming Meetups with enhanced animations */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg p-6 transform transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Upcoming Meetups</h2>
              </div>
              <Link to="/meetups" className="text-purple-600 hover:text-purple-700 font-medium text-sm hover:underline flex items-center group">
                See all meetups
                <Zap className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentMeetups.length === 0 && !loading && (
                <div className="text-center py-8 transform hover:scale-105 transition-transform duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm mb-4">No upcoming meetups found.</p>
                  <Link 
                    to="/meetups" 
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                  >
                    Schedule your first meetup
                  </Link>
                </div>
              )}
              {recentMeetups.slice(0, 5).map((meetup, index) => {
                const startTime = meetup.dateTime && meetup.dateTime.start ? new Date(meetup.dateTime.start).toLocaleString() : '';
                let communityName = '';
                if (typeof meetup.community === 'string') {
                  communityName = meetup.community;
                } else if (meetup.community && 'name' in meetup.community) {
                  communityName = meetup.community.name;
                }
                return (
                  <div 
                    key={meetup.id || index} 
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-100/50 rounded-2xl transition-all duration-300 hover:shadow-md hover:border-blue-200/50 transform hover:-translate-y-0.5"
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{meetup.title}</h3>
                      <div className="flex items-center space-x-3 text-xs">
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {startTime}
                        </span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium flex items-center">
                          <span className="w-3 h-3 mr-1">👥</span>
                          {meetup.attendees?.length ?? 0}
                        </span>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          {communityName}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions with enhanced animations */}
        <div className="transform transition-all duration-700 delay-300" style={{ transform: isVisible ? 'translateY(0) rotate(0)' : 'translateY(20px) rotate(1deg)', opacity: isVisible ? 1 : 0 }}>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            </div>
            <div className="space-y-4">
              {[
                { 
                  to: "/communities", 
                  label: "Ask a Question", 
                  description: "Get help from study buddies",
                  icon: "❓",
                  color: "from-blue-500 to-cyan-500",
                  bgColor: "from-blue-50 to-cyan-50",
                  hoverColor: "from-blue-100 to-cyan-100"
                },
                { 
                  to: "/materials", 
                  label: "Upload Materials", 
                  description: "Share your awesome notes",
                  icon: "📚",
                  color: "from-green-500 to-emerald-500",
                  bgColor: "from-green-50 to-emerald-50",
                  hoverColor: "from-green-100 to-emerald-100"
                },
                { 
                  to: "/meetups", 
                  label: "Schedule Meetup", 
                  description: "Plan epic study sessions",
                  icon: "📅",
                  color: "from-purple-500 to-pink-500",
                  bgColor: "from-purple-50 to-pink-50",
                  hoverColor: "from-purple-100 to-pink-100"
                },
                { 
                  to: "/communities", 
                  label: "Join Community", 
                  description: "Find your study squad",
                  icon: "👥",
                  color: "from-yellow-500 to-orange-500",
                  bgColor: "from-yellow-50 to-orange-50",
                  hoverColor: "from-yellow-100 to-orange-100"
                }
              ].map((action, index) => (
                <Link
                  key={action.label || index}
                  to={action.to}
                  className={`flex items-center p-4 bg-gradient-to-r ${action.bgColor} rounded-2xl hover:${action.hoverColor} transition-all duration-300 group hover:shadow-md transform hover:scale-[1.02] border border-transparent hover:border-white/30`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shadow-md`}>
                    <span className="text-xl">{action.icon}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{action.label}</p>
                    <p className="text-xs text-gray-600">{action.description}</p>
                  </div>
                  <Zap className="w-4 h-4 ml-auto text-gray-400 group-hover:text-yellow-500 transform group-hover:scale-125 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}


