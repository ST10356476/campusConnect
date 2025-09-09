import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Calendar, Clock, Users, Video } from "lucide-react";

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
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<{
    materials: SearchResult[];
    meetups: SearchResult[];
    communities: SearchResult[];
  }>({ materials: [], meetups: [], communities: [] });
  const [loading, setLoading] = useState(false);

  // Track which card is expanded per section
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/search?q=${encodeURIComponent(query)}`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  if (!query) return <div className="p-6 mt-20">Type something to search.</div>;
  if (loading) return <div className="p-6 mt-20">Loading...</div>;

  const renderCard = (item: SearchResult) => {
    const expanded = expandedCard === item.id;

    return (
      <li
        key={item.id}
        className="bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        {/* Header */}
        <div
          className="flex justify-between items-center"
          onClick={() =>
            setExpandedCard(expanded ? null : item.id)
          }
        >
          <div className="font-bold text-gray-900">{item.name}</div>
          <div className="text-gray-500 text-sm">{expanded ? "▲" : "▼"}</div>
        </div>

        {/* Expandable Content */}
        <div
          className={`overflow-hidden transition-all duration-300 mt-2 text-sm text-gray-700 ${
            expanded ? "max-h-96" : "max-h-0"
          }`}
        >
          {item.description && <p className="mt-1">{item.description}</p>}
          {item.summary && (
            <p className="mt-1 text-gray-500">Summary: {item.summary}</p>
          )}
          {item.fileType && <p className="mt-1 text-gray-500">Type: {item.fileType}</p>}
          {typeof item.fileSize === "number" && (
            <p className="mt-1 text-gray-500">Size: {(item.fileSize / 1024).toFixed(2)} KB</p>
          )}
          {item.category && <p className="mt-1 text-purple-600">{item.category}</p>}
          {item.university && <p className="mt-1 text-gray-500">University: {item.university}</p>}
          {typeof item.memberCount === "number" && (
            <p className="mt-1 text-gray-500">{item.memberCount} members</p>
          )}
          {item.date && item.time && (
            <p className="mt-1 text-gray-500">
              {item.date} at {item.time} {item.duration ? `(${item.duration}min)` : ""}
            </p>
          )}
          {item.organizer?.name && <p className="mt-1 text-gray-500">Hosted by {item.organizer.name}</p>}
          {item.status && <p className="mt-1 text-gray-500">Status: {item.status}</p>}

          {/* Actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                Open
              </a>
            )}
            {item.type === "material" && (
              <Link
                to={`/materials/${item.id}`}
                className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
              >
                View Page
              </Link>
            )}
            {item.type === "community" && (
              <Link
                to={`/communities/${item.id}`}
                className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
              >
                View Page
              </Link>
            )}
            {item.type === "community" && (
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `http://localhost:5000/api/communities/${item.id}/join`,
                      { method: "POST", credentials: "include" }
                    );
                    if (res.ok) alert("Joined community!");
                    else alert("Failed to join.");
                  } catch {
                    alert("Error joining community.");
                  }
                }}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
              >
                Join
              </button>
            )}
            {item.type === "meetup" && (
              <>
                {item.meetingLink ? (
                  <button
                    onClick={() => window.open(item.meetingLink, "_blank")}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                  >
                    Join Session
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(
                          `http://localhost:5000/api/meetups/${item.id}/join`,
                          { method: "POST", credentials: "include" }
                        );
                        if (res.ok) alert("Joined meetup!");
                        else alert("Failed to join.");
                      } catch {
                        alert("Error joining meetup.");
                      }
                    }}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    Join Meetup
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="p-6 mt-20 space-y-10">
      <section>
        <h3 className="text-xl font-semibold mb-4">Communities ({results.communities.length})</h3>
        {results.communities.length === 0 ? <p>No communities found</p> : (
          <ul className="space-y-3">
            {results.communities.map(renderCard)}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4">Meetups ({results.meetups.length})</h3>
        {results.meetups.length === 0 ? <p>No meetups found</p> : (
          <ul className="space-y-3">
            {results.meetups.map(renderCard)}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4">Materials ({results.materials.length})</h3>
        {results.materials.length === 0 ? <p>No materials found</p> : (
          <ul className="space-y-3">
            {results.materials.map(renderCard)}
          </ul>
        )}
      </section>
    </div>
  );
}
