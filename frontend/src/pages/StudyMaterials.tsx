import React, { useState, useEffect } from "react";
import axios from "axios";

interface Flashcard {
  question: string;
  answer: string;
}

interface Quiz {
  question: string;
  options: string[];
  answer: string;
}

interface StudyMaterial {
  _id: string;
  originalName: string;
  url: string;
  fileType: string;
  fileSize: number;
  summary: string;
  flashcards: Flashcard[];
  quiz: Quiz[];
}

export default function StudyMaterials() {
  const [file, setFile] = useState<File | null>(null);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "your" | "upload">("all");

  // Fetch materials on mount
  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await axios.get<StudyMaterial[]>("http://localhost:5000/api/study-materials");
      setMaterials(res.data);
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Select a file first!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoadingUpload(true);
      const res = await axios.post("http://localhost:5000/api/study-materials", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMaterials(prev => [...prev, res.data.material]);
      setFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Check console for details.");
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleGenerate = async (id: string, type: "summary" | "flashcards" | "quiz") => {
    try {
      setLoadingGenerate(id);
      const res = await axios.post(`http://localhost:5000/api/study-materials/${id}/generate`, { type });
      setMaterials(prev => prev.map(m => (m._id === id ? res.data.material : m)));
    } catch (err: any) {
      console.error("Generation failed:", err.response?.data || err.message);
      alert("Generation failed. Check console for details.");
    } finally {
      setLoadingGenerate(null);
    }
  };

  // Dummy filter for "Your Materials" (replace with real user logic if needed)
  const yourMaterials = materials.filter(m => m.originalName.toLowerCase().includes("your"));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Bar */}
      <div className="flex justify-center mb-6">
        <button
          className={`px-6 py-2 mx-2 rounded-t-lg font-semibold ${
            activeTab === "all" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-blue-100"
          }`}
          onClick={() => setActiveTab("all")}
        >
          All Materials
        </button>
        <button
          className={`px-6 py-2 mx-2 rounded-t-lg font-semibold ${
            activeTab === "your" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-blue-100"
          }`}
          onClick={() => setActiveTab("your")}
        >
          Your Materials
        </button>
        <button
          className={`px-6 py-2 mx-2 rounded-t-lg font-semibold ${
            activeTab === "upload" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-blue-100"
          }`}
          onClick={() => setActiveTab("upload")}
        >
          Upload Material
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4 text-center">Study Materials</h1>

        {/* Upload Section */}
        {activeTab === "upload" && (
          <div className="mb-8 p-4 border rounded shadow-sm bg-white">
            <h2 className="text-xl font-semibold mb-2">Upload New Material</h2>
            <div className="flex items-center space-x-3">
              <input type="file" onChange={handleFileChange} className="border p-1 rounded" />
              <button
                onClick={handleUpload}
                disabled={loadingUpload}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                {loadingUpload ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        )}

        {/* Materials List */}
        <div className="space-y-6">
          {(activeTab === "all" ? materials : activeTab === "your" ? yourMaterials : []).map(m => (
            <div key={m._id} className="border rounded p-4 shadow-sm bg-white">
              <a
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-semibold text-lg hover:underline"
              >
                {m.originalName}
              </a>

              {/* Action Buttons */}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => handleGenerate(m._id, "summary")}
                  disabled={loadingGenerate === m._id}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  {loadingGenerate === m._id ? "Generating..." : "Generate Summary"}
                </button>
                <button
                  onClick={() => handleGenerate(m._id, "flashcards")}
                  disabled={loadingGenerate === m._id}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  {loadingGenerate === m._id ? "Generating..." : "Generate Flashcards"}
                </button>
                <button
                  onClick={() => handleGenerate(m._id, "quiz")}
                  disabled={loadingGenerate === m._id}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  {loadingGenerate === m._id ? "Generating..." : "Generate Quiz"}
                </button>
              </div>

              {/* Display Summary */}
              {m.summary && (
                <div className="mt-4">
                  <h3 className="font-semibold">Summary:</h3>
                  <ul className="list-disc ml-5 whitespace-pre-line">{m.summary}</ul>
                </div>
              )}

              {/* Display Flashcards */}
              {m.flashcards.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold">Flashcards:</h3>
                  <ul className="list-disc ml-5">
                    {m.flashcards.map((f, i) => (
                      <li key={i}>
                        <strong>Q:</strong> {f.question} <br />
                        <strong>A:</strong> {f.answer}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Display Quiz */}
              {m.quiz.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold">Quiz:</h3>
                  <ul className="list-disc ml-5">
                    {m.quiz.map((q, i) => (
                      <li key={i}>
                        <strong>Q:</strong> {q.question} <br />
                        <strong>Options:</strong> {q.options.join(", ")} <br />
                        <strong>Answer:</strong> {q.answer}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
