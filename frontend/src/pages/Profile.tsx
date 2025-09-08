import React, { useEffect, useRef, useState } from 'react';
import {
  Edit,
  Camera,
  MapPin,
  Calendar,
  Mail,
  Users,
  BookOpen,
  Award,
  Settings,
  Plus,
  X,
} from 'lucide-react';
import type { User } from '../services/api';
import { apiService } from '../services/api';

interface ProfileProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export function Profile({ user, setUser }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);


  const uProfile: any = (user as any)?.profile ?? {};
  const displayName =
    [uProfile.firstName, uProfile.lastName].filter(Boolean).join(' ') ||
    (user as any)?.username ||
    '';
  const displayEmail = (user as any)?.email ?? '';
  const displayAvatar =
    (uProfile.avatar as string) ||
    (user as any)?.avatar ||
    (displayEmail
      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayEmail)}`
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=user`);
  const displayPoints = (user as any)?.points ?? 0;

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: displayName || '',
    bio: (uProfile.bio as string) || '',
    location: (uProfile.location as string) || '',
    interests: ((uProfile.interests as string[]) || []) as string[],
    joinedDate:
      (uProfile.joinedDate as string) || new Date().toISOString().split('T')[0],
    avatar: (uProfile.avatar as string) || '',
    email: displayEmail || '',
  });

  useEffect(() => {
    const p: any = (user as any)?.profile ?? {};
    const dn =
      [p.firstName, p.lastName].filter(Boolean).join(' ') ||
      (user as any)?.username ||
      '';
    setEditForm({
      name: dn,
      bio: (p.bio as string) || '',
      location: (p.location as string) || '',
      interests: ((p.interests as string[]) || []) as string[],
      joinedDate: (p.joinedDate as string) || new Date().toISOString().split('T')[0],
      avatar: (p.avatar as string) || '',
      email: ((user as any)?.email as string) || '',
    });
  }, [user, isEditing]);

  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const triggerAvatarPicker = () => fileInputRef.current?.click();
  const handleAvatarFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setEditForm((prev) => ({ ...prev, avatar: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  // Interests add/remove
  const [interestInput, setInterestInput] = useState('');
  const addInterest = () => {
    const v = interestInput.trim();
    if (!v) return;
    setEditForm((prev) => ({
      ...prev,
      interests: Array.from(new Set([...(prev.interests || []), v])),
    }));
    setInterestInput('');
  };
  const removeInterest = (tag: string) =>
    setEditForm((prev) => ({
      ...prev,
      interests: (prev.interests || []).filter((t) => t !== tag),
    }));

  // Save - persists to backend then trusts server response
  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) return;

    const parts = editForm.name.trim().split(/\s+/);
    const firstName = parts.shift() || '';
    const lastName = parts.join(' ');

    const payload = {
      firstName,
      lastName,
      bio: editForm.bio || undefined,
      location: editForm.location || undefined,
      interests: editForm.interests || [],
      avatar: editForm.avatar || undefined,
      joinedDate: editForm.joinedDate || undefined
    };





    try {
      const res = await apiService.updateProfile(payload);
      if (res.success && res.user) {
        setUser(res.user);
        setIsEditing(false);
      }
    } catch (e) {
      console.error('Update failed:', e);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl text-gray-900 mb-4">Create Your Profile</h1>
        <input
          type="text"
          placeholder="Your Name"
          value={editForm.name}
          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          className="border border-gray-300 rounded px-3 py-2 mb-4"
        />
        <button
          onClick={handleSaveProfile}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Profile
        </button>
      </div>
    );
  }


  const stats = [
    { label: 'Questions Asked', value: 12, icon: BookOpen },
    { label: 'Communities Joined', value: 5, icon: Users },
    { label: 'Meetups Attended', value: 8, icon: Calendar },
    { label: 'Achievement Points', value: displayPoints, icon: Award },
  ];

  const achievements = [
    { id: 1, name: 'First Question', icon: '🎯', color: 'bg-blue-100 text-blue-700' },
    { id: 2, name: 'Helpful Member', icon: '⭐', color: 'bg-yellow-100 text-yellow-700' },
    { id: 3, name: 'Early Bird', icon: '🌅', color: 'bg-orange-100 text-orange-700' },
    { id: 4, name: 'Study Buddy', icon: '👥', color: 'bg-green-100 text-green-700' },
  ];

  const recentActivity = [
    { id: 1, type: 'question', content: 'Asked: "How to optimize React rendering performance?"', community: 'React Developers', time: '2 hours ago' },
    { id: 2, type: 'meetup', content: 'Attended: Algorithm Study Group', community: 'Computer Science', time: '1 day ago' },
    { id: 3, type: 'material', content: 'Shared: Data Structures Cheat Sheet', community: 'Computer Science', time: '3 days ago' },
    { id: 4, type: 'achievement', content: 'Earned: Helpful Member badge', community: 'Achievement', time: '1 week ago' },
  ];

  const effectiveAvatar = editForm.avatar || displayAvatar;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative">
              <img
                src={effectiveAvatar}
                alt={displayName || 'User'}
                className="w-24 h-24 rounded-full object-cover"
              />
              <button
                onClick={triggerAvatarPicker}
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                aria-label="Change avatar"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFile}
              />
            </div>

            <div className="flex-1 w-full">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full text-2xl border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your name"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="A short bio"
                  />
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Location"
                  />

                  {/* Interests editor */}
                  <div>
                    <label className="text-sm text-gray-700 mb-2 block">Interests</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addInterest();
                          }
                        }}
                        className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add an interest and press Enter"
                      />
                      <button
                        onClick={addInterest}
                        type="button"
                        className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        aria-label="Add interest"
                      >
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editForm.interests.length ? (
                        editForm.interests.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeInterest(tag)}
                              className="hover:text-blue-900"
                              aria-label={`Remove ${tag}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm">No interests added yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl text-gray-900 mb-2">{displayName || 'Anonymous'}</h1>
                  <p className="text-gray-600 mb-4">{uProfile.bio || 'No bio provided yet.'}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{uProfile.location || 'Location not set'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Joined{' '}
                        {new Date(
                          uProfile.joinedDate || editForm.joinedDate
                        ).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{displayEmail || 'no-email@unknown'}</span>
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
                    disabled={!editForm.name.trim()}
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

          {/* Interests read-only */}
          {!isEditing && (
            <div className="mt-6">
              <h3 className="text-sm text-gray-700 mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {(uProfile.interests as string[])?.length ? (
                  (uProfile.interests as string[]).map((interest) => (
                    <span key={interest} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {interest}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">No interests added yet.</span>
                )}
              </div>
            </div>
          )}
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

        {/* Achievements */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl text-gray-900 mb-4">Achievements</h2>
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
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = activity.type === 'achievement' ? Award : BookOpen;
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
  );
}