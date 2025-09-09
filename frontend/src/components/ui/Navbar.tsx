import React, { useState, useEffect } from "react";
import { API_BASE_URL } from '../../services/api';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Bell, Search, Menu, X } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  badges: string[];
  points: number;
}

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

interface SearchResult {
  id: string;
  type: "material" | "meetup" | "community";
  name: string;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/communities", label: "Communities" },
    { path: "/materials", label: "Study Materials" },
    { path: "/meetups", label: "Meetups" },
    { path: "/achievements", label: "Achievements" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // --------------------- SEARCH ---------------------
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const fetchResults = async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/search?q=${encodeURIComponent(query)}`,
          { credentials: "include" }
        );
        
        if (!res.ok) throw new Error("HTTP error " + res.status);
        const data = await res.json();

        // Transform the data to match frontend expectations
        const flattened: SearchResult[] = [
          ...(data.materials || []).map((m: any) => ({
            id: m._id || m.id,
            type: "material",
            name: m.filename || m.originalName || m.name,
          })),
          ...(data.meetups || []).map((m: any) => ({
            id: m._id || m.id,
            type: "meetup",
            name: m.title || m.name,
          })),
          ...(data.communities || []).map((c: any) => ({
            id: c._id || c.id,
            type: "community",
            name: c.name,
          })),
        ];

        setResults(flattened);
        setShowDropdown(flattened.length > 0);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
        setShowDropdown(false);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query)}`);
        setShowDropdown(false);
        setQuery("");
      }
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-white/20 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden bg-white">
              <img src="/campusconnectlogo.png" alt="Campus Connect Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Campus Connect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/60 hover:shadow-sm"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Search & User */}
          <div className="flex items-center space-x-4 relative">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-4 py-2 bg-white/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm transition-all w-64"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                </div>
              )}
              {showDropdown && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto z-50">
                  {results.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setShowDropdown(false);
                        setQuery("");
                        // Navigate to correct page
                        if (r.type === "material") navigate(`/materials/${r.id}`);
                        else if (r.type === "meetup") navigate(`/meetups/${r.id}`);
                        else if (r.type === "community") navigate(`/communities/${r.id}`);
                      }}
                      className="p-3 hover:bg-gray-100 cursor-pointer flex items-center"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{r.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/60 transition-all duration-200 hover:shadow-sm">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                  alt={user.name}
                  className="w-9 h-9 rounded-full ring-2 ring-purple-200"
                />
              </button>
              <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-3">
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-xl"
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/achievements"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-xl"
                  >
                    Achievements
                  </Link>
                  <button
                    onClick={onLogout}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-red-50 rounded-xl mt-2"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-gray-600"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="py-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-sm transition-colors ${
                    isActive(item.path)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-gray-100 py-2">
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 rounded-xl"
              >
                My Profile
              </Link>
              <Link
                to="/achievements"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 rounded-xl"
              >
                My Achievements
              </Link>
              <button
                onClick={() => { setIsMobileMenuOpen(false); onLogout(); }}
                className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 rounded-xl mt-2"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}