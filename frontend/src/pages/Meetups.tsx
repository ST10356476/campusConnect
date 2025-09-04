// src/pages/Meetups.tsx
import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Users, Video, Plus } from 'lucide-react';

type Meetup = {
  _id: string;
  title: string;
  description: string;
  date: string;   // yyyy-mm-dd
  time: string;   // HH:mm
  duration: number;
  maxAttendees: number;
  meetingLink: string;
  organizer: { id: string; name: string };
  attendees: Array<{ userId: string; name: string; joinedAt: string }>;
};

interface MeetupsProps {
  // Your app passes the real logged-in user here. We accept any shape and normalize below.
  user: any;
}

const API_BASE_URL = 'http://localhost:5000/api';

// Convert whatever your user object looks like into { id, name }
function getOrganizer(u: any): { id: string | null; name: string | null } {
  const id =
    u?.id ??
    u?._id ??
    u?.userId ??
    u?.uid ??
    null;

  // try several fields to get a human display name
  const fullName = [u?.firstName, u?.lastName].filter(Boolean).join(' ').trim();
  const emailName = typeof u?.email === 'string' ? u.email.split('@')[0] : '';

  const name =
  u?.name ??
  u?.username ??
  (fullName.length ? fullName : null) ??
  (emailName.length ? emailName : null) ??
  null;

  return { id, name };
}

export function Meetups({ user }: MeetupsProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'my-meetups'>('upcoming');
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [myMeetups, setMyMeetups] = useState<Meetup[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    maxAttendees: 10,
    meetingLink: ''
  });

  useEffect(() => {
    loadMeetups();
    loadMyMeetups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMeetups = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/meetups`);
      const data = await res.json();
      if (data.success) setMeetups(data.data);
      else {
        setMeetups([]);
        setPageError(data.message || 'Failed to load meetups');
      }
    } catch (e: any) {
      setMeetups([]);
      setPageError(e.message || 'Failed to load meetups');
    } finally {
      setLoading(false);
    }
  };

  const loadMyMeetups = async () => {
    try {
      const organizer = getOrganizer(user);
      if (!organizer.id) return;
      const res = await fetch(`${API_BASE_URL}/meetups/my/${organizer.id}`);
      const data = await res.json();
      if (data.success) setMyMeetups(data.data);
      else setMyMeetups([]);
    } catch {
      setMyMeetups([]);
    }
  };

  const createMeetup = async () => {
    try {
      setModalError('');
      setPageError('');

      const { title, description, date, time, meetingLink } = formData;
      if (!title || !description || !date || !time || !meetingLink) {
        setModalError('Please fill in all required fields');
        return;
      }

      const organizer = getOrganizer(user);
      if (!organizer.id || !organizer.name) {
        setModalError('Your account is missing id or display name. Re-login or complete your profile.');
        return;
      }

      setLoading(true);

      const body = {
        ...formData,
        duration: Number(formData.duration) || 60,
        maxAttendees: Number(formData.maxAttendees) || 10,
        organizer
      };

      const res = await fetch(`${API_BASE_URL}/meetups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!data.success) {
        setModalError(data.message || 'Failed to create meetup');
        return;
      }

      // success
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: 60,
        maxAttendees: 10,
        meetingLink: ''
      });
      setShowModal(false);
      setActiveTab('my-meetups');
      await loadMeetups();
      await loadMyMeetups();
    } catch (e: any) {
      setModalError(e.message || 'Failed to create meetup');
    } finally {
      setLoading(false);
    }
  };

  const joinMeetup = async (id: string) => {
    try {
      setPageError('');
      setLoading(true);

      const organizer = getOrganizer(user);
      const res = await fetch(`${API_BASE_URL}/meetups/${id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: organizer.id, name: organizer.name })
      });
      const data = await res.json();
      if (!data.success) {
        setPageError(data.message || 'Failed to join meetup');
      }
      await loadMeetups();
      await loadMyMeetups();
    } catch (e: any) {
      setPageError(e.message || 'Failed to join meetup');
    } finally {
      setLoading(false);
    }
  };

  const isJoined = (m: Meetup) => {
    const organizer = getOrganizer(user);
    return (
      m.organizer.id === organizer.id ||
      m.attendees.some(a => a.userId === organizer.id)
    );
  };

  const joinSession = (link: string) => window.open(link, '_blank');

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const formatTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Study Meetups</h1>
          <p className="text-gray-600">Join study sessions and collaborate with peers</p>
        </div>
        <button
          onClick={() => { setModalError(''); setShowModal(true); }}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Meetup</span>
        </button>
      </div>

      {/* Page-level error */}
      {pageError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {pageError}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-4 px-1 border-b-2 transition-colors ${
              activeTab === 'upcoming' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Upcoming Meetups ({meetups.length})
          </button>
          <button
            onClick={() => setActiveTab('my-meetups')}
            className={`py-4 px-1 border-b-2 transition-colors ${
              activeTab === 'my-meetups' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Meetups ({myMeetups.length})
          </button>
        </nav>
      </div>

      {/* Upcoming */}
      {activeTab === 'upcoming' && (
        <div className="space-y-6">
          {loading && <div className="text-center">Loading...</div>}
          {!loading && meetups.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl text-gray-900 mb-2">No upcoming meetups</h3>
              <p className="text-gray-600 mb-6">Be the first to create one</p>
              <button
                onClick={() => { setModalError(''); setShowModal(true); }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Meetup
              </button>
            </div>
          )}

          {meetups.map(m => (
            <div key={m._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl text-gray-900 mb-2">{m.title}</h3>
                      <p className="text-gray-600 mb-3">{m.description}</p>
                    </div>
                    {isJoined(m) && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">Joined</span>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{formatDate(m.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{formatTime(m.time)} ({m.duration}min)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{m.attendees.length}/{m.maxAttendees} attendees</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">Hosted by {m.organizer.name}</div>
                </div>

                <div className="flex flex-col space-y-3 lg:w-48">
                  {isJoined(m) ? (
                    <button
                      onClick={() => joinSession(m.meetingLink)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Session</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => joinMeetup(m._id)}
                      disabled={loading || m.attendees.length >= m.maxAttendees}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    >
                      {m.attendees.length >= m.maxAttendees ? 'Full' : 'Join Meetup'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My meetups */}
      {activeTab === 'my-meetups' && (
        <div className="space-y-6">
          {myMeetups.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl text-gray-900 mb-2">No meetups yet</h3>
              <p className="text-gray-600 mb-6">Join your first meetup or create one</p>
              <button
                onClick={() => setActiveTab('upcoming')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-4"
              >
                Browse Meetups
              </button>
              <button
                onClick={() => { setModalError(''); setShowModal(true); }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Meetup
              </button>
            </div>
          ) : (
            myMeetups.map(m => (
              <div key={m._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg text-gray-900 mb-2">{m.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span>{formatDate(m.date)} at {formatTime(m.time)}</span>
                      <span>•</span>
                      <span>{m.attendees.length} attendees</span>
                    </div>
                    <p className="text-gray-600">{m.description}</p>
                  </div>
                  <button
                    onClick={() => joinSession(m.meetingLink)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Session</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-2xl text-gray-900 mb-6">Create Study Meetup</h2>

            <form onSubmit={(e) => { e.preventDefault(); createMeetup(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., React Study Session"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what you will cover..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (min)</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Attendees</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={formData.maxAttendees}
                    onChange={(e) => setFormData({ ...formData, maxAttendees: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Link *</label>
                <input
                  type="url"
                  required
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/... or https://zoom.us/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {modalError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {modalError}
                </div>
              )}

              <div className="flex items-center justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setModalError(''); }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {loading ? 'Creating...' : 'Create Meetup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
