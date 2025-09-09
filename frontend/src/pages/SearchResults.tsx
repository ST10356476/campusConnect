import React, { useEffect, useState, useContext } from "react";
import { Navbar } from "../components/ui/Navbar";
import { AuthContext, AuthContextType } from "../App";
import { useSearchParams, Link } from "react-router-dom";
import { Calendar, Clock, Users, Video, BookOpen, Users as UsersIcon, CalendarDays, FileText, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

type Attendee = { userId?: string; name?: string };

interface SearchResult {
  id: string;
  type: "material" | "meetup" | "community";
  name: string;
  description?: string;
  memberCount?: number;
  category?: string;
  university?: string;
  avatar?: string;
  attendees?: Attendee[];
  maxAttendees?: number;
  meetingLink?: string;
  organizer?: { id?: string; name?: string };
  date?: string;
  time?: string;
  duration?: number;
  url?: string;
  fileType?: string;
  fileSize?: number;
  summary?: string;
  uploadedBy?: any;
  status?: string;
}

export default function SearchResults() {
  const auth = useContext(AuthContext) as AuthContextType;
  const user = auth?.user;
  const onLogout = auth?.logout || (() => {});
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<{
    materials: SearchResult[];
    meetups: SearchResult[];
    communities: SearchResult[];
  }>({ materials: [], meetups: [], communities: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Track which card is expanded per section
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;
    
    const fetchResults = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `http://localhost:5000/api/search?q=${encodeURIComponent(query)}`,
          { credentials: "include" }
        );
        
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}: ${await res.text()}`);
        }
        
        const data = await res.json();
        
        // Transform the data to match frontend expectations
        const transformedData = {
          materials: data.materials.map((m: any) => ({
            id: m._id || m.id,
            type: "material",
            name: m.filename || m.originalName || m.name,
            description: m.description,
            url: m.url,
            fileType: m.fileType,
            fileSize: m.fileSize,
            summary: m.summary,
            uploadedBy: m.uploadedBy,
          })),
          meetups: data.meetups.map((m: any) => ({
            id: m._id || m.id,
            type: "meetup",
            name: m.title || m.name,
            description: m.description,
            date: m.date,
            time: m.time,
            maxAttendees: m.maxAttendees,
            attendees: m.attendees,
            organizer: m.organizer,
            meetingLink: m.meetingLink,
            duration: m.duration,
            status: m.status,
          })),
          communities: data.communities.map((c: any) => ({
            id: c._id || c.id,
            type: "community",
            name: c.name,
            description: c.description,
            category: c.category,
            memberCount: c.memberCount,
            university: c.university,
            avatar: c.avatar?.url || c.avatar,
          })),
        };
        
        setResults(transformedData);
      } catch (err: any) {
        console.error("Search error:", err);
        setError(err.message || "Failed to fetch search results");
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [query]);

  if (!user) return null;
  if (!query) return <><Navbar user={user} onLogout={onLogout} /><div className="p-6 mt-20">Type something to search.</div></>;

  if (loading) return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching for "{query}"...</p>
        </div>
      </div>
    </>
  );

  // Card for each type
  const MaterialCard = (item: SearchResult) => {
    const isExpanded = expandedCard === item.id;
    
    return (
      <div key={item.id} className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all">
        <div className="flex items-start gap-3 mb-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <BookOpen className="text-purple-600 w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
            {item.fileType && (
              <p className="text-sm text-gray-500 mt-1 capitalize">{item.fileType} • {item.fileSize ? `${(item.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}</p>
            )}
          </div>
          <button
            onClick={() => setExpandedCard(isExpanded ? null : item.id)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600 animate-fade-in">
            {item.summary && (
              <div className="mb-2">
                <p className="font-medium text-gray-800">Summary</p>
                <p className="mt-1">{item.summary}</p>
              </div>
            )}
            {item.description && (
              <div className="mb-2">
                <p className="font-medium text-gray-800">Description</p>
                <p className="mt-1">{item.description}</p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 flex gap-2">
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ExternalLink size={14} />
              Open File
            </a>
          )}
          <Link 
            to={`/study-materials/${item.id}`}
            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg text-center font-medium hover:bg-purple-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    );
  };

  const CommunityCard = (item: SearchResult) => (
    <div key={item.id} className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all">
      <div className="flex items-start gap-3 mb-4">
        <div className="bg-blue-100 p-2 rounded-lg">
          <UsersIcon className="text-blue-600 w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
          {item.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {item.category && (
          <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">
            {item.category}
          </span>
        )}
        {item.university && (
          <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">
            {item.university}
          </span>
        )}
        {typeof item.memberCount === "number" && (
          <span className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full">
            {item.memberCount} members
          </span>
        )}
      </div>
      
      <Link 
        to={`/communities/${item.id}`}
        className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors"
      >
        View Community
      </Link>
    </div>
  );

  const MeetupCard = (item: SearchResult) => {
    const formatTime = (timeStr: string) => {
      if (!timeStr) return '';
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
    };
    
    return (
      <div key={item.id} className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all">
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-green-100 p-2 rounded-lg">
            <CalendarDays className="text-green-600 w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
            {item.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          {item.date && item.time && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar size={14} className="mr-2" />
              <span>{item.date} at {formatTime(item.time)}</span>
              {item.duration && <span className="ml-2">({item.duration} min)</span>}
            </div>
          )}
          
          {item.organizer?.name && (
            <div className="flex items-center text-sm text-gray-600">
              <Users size={14} className="mr-2" />
              <span>Hosted by {item.organizer.name}</span>
            </div>
          )}
          
          {item.status && (
            <div className="inline-flex items-center bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">
              {item.status}
            </div>
          )}
        </div>
        
        {item.meetingLink ? (
          <a
            href={item.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-green-600 text-white px-4 py-2 rounded-lg text-center font-medium hover:bg-green-700 transition-colors"
          >
            Join Session
          </a>
        ) : (
          <button
            onClick={async () => {
              try {
                const res = await fetch(
                  `http://localhost:5000/api/meetups/${item.id}/join`,
                  { method: "POST", credentials: "include" }
                );
                if (res.ok) {
                  // Show success notification to user
                } else {
                  // Show failure notification to user
                }
              } catch {
                // Show error notification to user
              }
            }}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors"
          >
            Join Meetup
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
              {error}
            </div>
          )}
          
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Search Results for <span className="text-purple-600">"{query}"</span>
            </h1>
            <p className="text-gray-600">
              Found {results.communities.length + results.meetups.length + results.materials.length} results
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Communities Section */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <UsersIcon className="text-blue-600 w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Communities</h2>
                  <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {results.communities.length}
                  </span>
                </div>
                
                {results.communities.length === 0 ? (
                  <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
                    <UsersIcon className="mx-auto text-gray-300 w-10 h-10 mb-3" />
                    <p className="text-gray-500">No communities found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.communities.map(CommunityCard)}
                  </div>
                )}
              </div>
            </div>

            {/* Meetups Section */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <CalendarDays className="text-green-600 w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Meetups</h2>
                  <span className="ml-2 bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {results.meetups.length}
                  </span>
                </div>
                
                {results.meetups.length === 0 ? (
                  <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
                    <CalendarDays className="mx-auto text-gray-300 w-10 h-10 mb-3" />
                    <p className="text-gray-500">No meetups found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.meetups.map(MeetupCard)}
                  </div>
                )}
              </div>
            </div>

            {/* Materials Section */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <BookOpen className="text-purple-600 w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Materials</h2>
                  <span className="ml-2 bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {results.materials.length}
                  </span>
                </div>
                
                {results.materials.length === 0 ? (
                  <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
                    <BookOpen className="mx-auto text-gray-300 w-10 h-10 mb-3" />
                    <p className="text-gray-500">No materials found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.materials.map(MaterialCard)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}