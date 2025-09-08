import React, { useState, useEffect } from 'react';
import { Trophy, Star, Target, Users, MessageSquare, Calendar, BookOpen, Award, Lock } from 'lucide-react';

interface Achievement {
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

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AchievementsProps {
  user: User;
}

export function Achievements({ user }: AchievementsProps) {
  const [activeCategory, setActiveCategory] = useState('all' as 'all' | 'community' | 'learning' | 'participation');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    unlockedCount: 0,
    totalCount: 0,
    completionRate: 0
  });

  // Map achievement names to categories
  const getCategory = (achievementName: string): string => {
    const categoryMap: Record<string, string> = {
      'First Question': 'community',
      'Helpful Member': 'community',
      'Discussion Starter': 'community',
      'Study Buddy': 'participation',
      'Community Leader': 'participation',
      'Early Bird': 'participation',
      'Knowledge Sharer': 'learning',
      'Master Learner': 'learning'
    };
    return categoryMap[achievementName] || 'community';
  };

  // Map icon names to components
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      'MessageSquare': MessageSquare,
      'Star': Star,
      'Users': Users,
      'BookOpen': BookOpen,
      'Trophy': Trophy,
      'Award': Award,
      'Calendar': Calendar
    };
    return iconMap[iconName] || MessageSquare;
  };

  // Map achievement names to colors
  const getAchievementColor = (achievementName: string): string => {
    const colorMap: Record<string, string> = {
      'First Question': 'blue',
      'Helpful Member': 'yellow',
      'Study Buddy': 'green',
      'Knowledge Sharer': 'purple',
      'Community Leader': 'orange',
      'Master Learner': 'red',
      'Early Bird': 'indigo',
      'Discussion Starter': 'pink'
    };
    return colorMap[achievementName] || 'blue';
  };

  // Fetch achievements from backend
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const { apiService } = await import('../../services/api');
        const response = await apiService.getAchievements();
        
        if (response.success) {
          setAchievements(response.data.achievements);
          setStats(response.data.stats);
        } else {
          console.error('Failed to fetch achievements');
        }
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  // Group achievements by category
  const achievementsByCategory = achievements.reduce((acc, achievement) => {
    const category = getCategory(achievement.name);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categories = [
    { id: 'all', label: 'All Achievements', count: achievements.length },
    { id: 'community', label: 'Community', count: achievementsByCategory.community || 0 },
    { id: 'learning', label: 'Learning', count: achievementsByCategory.learning || 0 },
    { id: 'participation', label: 'Participation', count: achievementsByCategory.participation || 0 }
  ];

  const filteredAchievements = activeCategory === 'all' 
    ? achievements 
    : achievements.filter(a => getCategory(a.name) === activeCategory);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'uncommon': return 'text-green-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getColorClasses = (color: string, unlocked: boolean) => {
    if (!unlocked) {
      return 'bg-gray-100 text-gray-400';
    }
    
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      pink: 'bg-pink-100 text-pink-600'
    };
    
    return colorMap[color] || 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl text-gray-900 mb-2">Achievements</h1>
        <p className="text-gray-600">Track your progress and unlock badges as you learn</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl text-gray-900">{stats.unlockedCount}/{stats.totalCount}</p>
              <p className="text-sm text-gray-600">Achievements Unlocked</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl text-gray-900">{stats.unlockedCount}</p>
              <p className="text-sm text-gray-600">Badges Earned</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl text-gray-900">{stats.completionRate}%</p>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id as any)}
              className={`py-4 px-1 border-b-2 transition-colors ${
                activeCategory === category.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => {
          const IconComponent = getIconComponent(achievement.icon);
          const color = getAchievementColor(achievement.name);
          const colorClasses = getColorClasses(color, achievement.unlocked);
          
          return (
            <div
              key={achievement._id}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md ${
                achievement.unlocked ? 'border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses}`}>
                  {achievement.unlocked ? (
                    <IconComponent className="w-6 h-6" />
                  ) : (
                    <Lock className="w-6 h-6" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-lg ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                      {achievement.name}
                    </h3>
                    <span className={`text-xs uppercase tracking-wide ${getRarityColor(achievement.rarity)}`}>
                      {achievement.rarity}
                    </span>
                  </div>
                  
                  <p className={`text-sm mb-4 ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                    {achievement.description}
                  </p>

                  {achievement.unlocked ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-green-100 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full w-full"></div>
                      </div>
                      <span className="text-xs text-green-600 whitespace-nowrap">
                        Unlocked {achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="text-gray-600">
                          {achievement.progress}/{achievement.criteria.value}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min((achievement.progress / achievement.criteria.value) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {achievement.criteria.value - achievement.progress} more to unlock
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Achievements */}
      <div className="mt-12">
        <h2 className="text-2xl text-gray-900 mb-6">Recent Achievements</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            {achievements
              .filter(a => a.unlocked)
              .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
              .slice(0, 3)
              .map((achievement) => {
                const IconComponent = getIconComponent(achievement.icon);
                const color = getAchievementColor(achievement.name);
                const colorClasses = getColorClasses(color, true);
                
                return (
                  <div key={achievement._id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900">{achievement.name}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-600">Badge Earned</p>
                      <p className="text-xs text-gray-500">
                        {achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            {achievements.filter(a => a.unlocked).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No achievements unlocked yet</p>
                <p className="text-sm">Start participating to earn your first badge!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Achievement Tips */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg text-blue-900 mb-4">💡 Achievement Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="flex items-start space-x-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
            <span>Join communities and ask questions to unlock community achievements</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
            <span>Attend study meetups regularly to earn participation badges</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
            <span>Share study materials to help others and earn learning achievements</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
            <span>Host study sessions to become a community leader</span>
          </div>
        </div>
      </div>
    </div>
  );
}