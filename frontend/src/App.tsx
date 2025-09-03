import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/ui/Navbar';
import { AuthModal } from './components/auth/AuthModal';
import { Dashboard } from './pages/Dashboard';
import { Communities } from './pages/Communities';
import { StudyMaterials } from './pages/StudyMaterials';
import { Profile } from './pages/Profile';
import { Meetups } from './pages/Meetups';
import { Achievements } from './components/profile/Achievements';
import { LiveSession } from './components/live-session/LiveSession';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  badges: string[];
  points: number;
}

function App() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('campusPlatformUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (email: string, password: string) => {
    // Mock login - in real app this would call Supabase auth
    const mockUser: User = {
      id: '1',
      name: email.split('@')[0],
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      badges: ['newcomer'],
      points: 100
    };
    setUser(mockUser);
    localStorage.setItem('campusPlatformUser', JSON.stringify(mockUser));
    setShowAuthModal(false);
  };

  const handleSignup = (name: string, email: string, password: string) => {
    // Mock signup
    const mockUser: User = {
      id: '1',
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      badges: ['newcomer'],
      points: 0
    };
    setUser(mockUser);
    localStorage.setItem('campusPlatformUser', JSON.stringify(mockUser));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('campusPlatformUser');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-10 blur-3xl"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="text-center max-w-5xl mx-auto">
            {/* Hero Section */}
            <div className="mb-16">
              <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg border border-white/50">
                <span className="text-2xl mr-2">🚀</span>
                <span className="text-sm font-medium text-gray-700">Your learning journey starts here!</span>
              </div>
              
              <h1 className="text-6xl lg:text-7xl mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                CampusConnect
              </h1>
              <p className="text-xl lg:text-2xl text-gray-700 mb-12 leading-relaxed max-w-3xl mx-auto">
                Level up your learning with <span className="font-semibold text-purple-600">AI-powered tools</span>, 
                connect with study buddies, and turn knowledge into achievements! 🎓✨
              </p>
            </div>
            
            {/* Feature Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Study Squads</h3>
                <p className="text-gray-600">Find your tribe! Join communities and study with like-minded peers</p>
              </div>
              
              <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Smart Notes</h3>
                <p className="text-gray-600">AI magic turns your docs into flashcards, quizzes, and summaries!</p>
              </div>
              
              <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Study Sessions</h3>
                <p className="text-gray-600">Schedule epic study meetups with real-time collaboration tools</p>
              </div>
              
              <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Level Up</h3>
                <p className="text-gray-600">Earn badges, unlock achievements, and track your learning progress!</p>
              </div>
            </div>

            {/* Social Proof */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 mb-12 border border-white/50">
              <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">10K+</div>
                  <div className="text-gray-600">Active Learners</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">50K+</div>
                  <div className="text-gray-600">Study Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">100K+</div>
                  <div className="text-gray-600">Materials Shared</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">1M+</div>
                  <div className="text-gray-600">AI Summaries</div>
                </div>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setIsLogin(false);
                  setShowAuthModal(true);
                }}
                className="group relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-2xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-xl"
              >
                <span className="flex items-center justify-center">
                  🌟 Start Your Journey
                </span>
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button
                onClick={() => {
                  setIsLogin(true);
                  setShowAuthModal(true);
                }}
                className="group bg-white/80 backdrop-blur-sm text-purple-700 px-10 py-4 rounded-2xl font-semibold text-lg border-2 border-purple-200 hover:bg-white hover:border-purple-300 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <span className="flex items-center justify-center">
                  👋 Welcome Back
                </span>
              </button>
            </div>

            {/* Demo hint */}
            <div className="mt-8 inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-3 border border-blue-200">
              <span className="text-sm text-gray-700">
                💡 <strong>Try it now:</strong> Use demo@campusconnect.com / demo123 to explore!
              </span>
            </div>
          </div>
        </div>
        
        {showAuthModal && (
          <AuthModal
            isLogin={isLogin}
            onClose={() => setShowAuthModal(false)}
            onLogin={handleLogin}
            onSignup={handleSignup}
            onToggleMode={() => setIsLogin(!isLogin)}
          />
        )}
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-pink-50/50 relative">
        {/* Background decorations for app */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-60 h-60 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-60 h-60 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full opacity-30 blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <Navbar user={user} onLogout={handleLogout} />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/communities" element={<Communities user={user} />} />
              <Route path="/materials" element={<StudyMaterials user={user} />} />
              <Route path="/meetups" element={<Meetups user={user} />} />
              <Route path="/achievements" element={<Achievements user={user} />} />
              <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
              <Route path="/live/:sessionId" element={<LiveSession user={user} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;