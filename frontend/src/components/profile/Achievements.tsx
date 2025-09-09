import React, { useState } from 'react';
import { Trophy, Star, Target, Users, MessageSquare, Calendar, BookOpen, Award, Lock } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  badges: string[];
  points: number;
}

interface AchievementsProps {
  user: User;
}

export function Achievements({ user }: AchievementsProps) {
  const [activeCategory, setActiveCategory] = useState('all' as 'all' | 'community' | 'learning' | 'participation');

  const achievements = [
    {
      id: 'first-question',
      title: 'First Question',
      description: 'Posted your first question to the community',
      icon: MessageSquare,
      category: 'community',
      points: 10,
      unlocked: true,
      unlockedAt: '2024-01-10',
      color: 'blue',
      rarity: 'common'
    },
    {
      id: 'helpful-member',
      title: 'Helpful Member',
      description: 'Received 10 likes on your answers',
      icon: Star,
      category: 'community',
      points: 25,
      unlocked: true,
      unlockedAt: '2024-01-12',
      color: 'yellow',
      rarity: 'common'
    },
    {
      id: 'study-buddy',
      title: 'Study Buddy',
      description: 'Attended 5 study meetups',
      icon: Users,
      category: 'participation',
      points: 50,
      unlocked: false,
      progress: 3,
      target: 5,
      color: 'green',
      rarity: 'uncommon'
    },
    {
      id: 'knowledge-sharer',
      title: 'Knowledge Sharer',
      description: 'Uploaded 10 study materials',
      icon: BookOpen,
      category: 'learning',
      points: 75,
      unlocked: false,
      progress: 8,
      target: 10,
      color: 'purple',
      rarity: 'uncommon'
    },
    {
      id: 'community-leader',
      title: 'Community Leader',
      description: 'Hosted 3 successful study sessions',
      icon: Trophy,
      category: 'participation',
      points: 100,
      unlocked: false,
      progress: 1,
      target: 3,
      color: 'orange',
      rarity: 'rare'
    },
    {
      id: 'master-learner',
      title: 'Master Learner',
      description: 'Earned 1000 achievement points',
      icon: Award,
      category: 'learning',
      points: 200,
      unlocked: false,
      progress: 100,
      target: 1000,
      color: 'red',
      rarity: 'legendary'
    },
    {
      id: 'early-bird',
      title: 'Early Bird',
      description: 'Joined 5 morning study sessions',
      icon: Calendar,
      category: 'participation',
      points: 30,
      unlocked: true,
      unlockedAt: '2024-01-08',
      color: 'indigo',
      rarity: 'common'
    },
    {
      id: 'discussion-starter',
      title: 'Discussion Starter',
      description: 'Started 20 discussions across communities',
      icon: MessageSquare,
      category: 'community',
      points: 60,
      unlocked: false,
      progress: 12,
      target: 20,
      color: 'pink',
      rarity: 'uncommon'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Achievements', count: achievements.length },
    { id: 'community', label: 'Community', count: achievements.filter(a => a.category === 'community').length },
    { id: 'learning', label: 'Learning', count: achievements.filter(a => a.category === 'learning').length },
    { id: 'participation', label: 'Participation', count: achievements.filter(a => a.category === 'participation').length }
  ];

  const filteredAchievements = activeCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === activeCategory);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'uncommon': return 'text-green-600';
      case 'rare': return 'text-blue-600';
      case 'legendary': return 'text-purple-600';
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
              <p className="text-2xl text-gray-900">{unlockedCount}/{achievements.length}</p>
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
              <p className="text-2xl text-gray-900">{totalPoints}</p>
              <p className="text-sm text-gray-600">Total Points</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl text-gray-900">{Math.round((unlockedCount / achievements.length) * 100)}%</p>
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
          const Icon = achievement.icon;
          const colorClasses = getColorClasses(achievement.color, achievement.unlocked);
          
          return (
            <div
              key={achievement.id}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md ${
                achievement.unlocked ? 'border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses}`}>
                  {achievement.unlocked ? (
                    <Icon className="w-6 h-6" />
                  ) : (
                    <Lock className="w-6 h-6" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-lg ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                      {achievement.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs uppercase tracking-wide ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </span>
                      <span className={`text-sm ${achievement.unlocked ? 'text-blue-600' : 'text-gray-400'}`}>
                        {achievement.points} pts
                      </span>
                    </div>
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
                        Unlocked {new Date(achievement.unlockedAt!).toLocaleDateString()}
                      </span>
                    </div>
                  ) : achievement.progress !== undefined ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="text-gray-600">
                          {achievement.progress}/{achievement.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min((achievement.progress! / achievement.target!) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {achievement.target! - achievement.progress!} more to unlock
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-300 h-2 rounded-full w-0"></div>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">Not started</span>
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
                const Icon = achievement.icon;
                const colorClasses = getColorClasses(achievement.color, true);
                
                return (
                  <div key={achievement.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-600">+{achievement.points} pts</p>
                      <p className="text-xs text-gray-500">
                        {new Date(achievement.unlockedAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
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