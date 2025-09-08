
import React, { useEffect, useState } from 'react';
import { Upload, FileText, Download, Eye, Sparkles, BookOpen, Brain, Target, Share2, Heart } from 'lucide-react';
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  badges: string[];
  points?: number;  
}

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
  _id?: string;
  originalName?: string;
  url?: string;
  fileType?: string;
  fileSize?: number;
  summary?: string;
  flashcards?: Flashcard[];
  quiz?: Quiz[];
  createdAt?: string;
  uploadedBy?: any;
  savedBy: string[]; // Changed from optional to required
}

interface StudyMaterialsProps {
  user?: {
    _id: string;
    username: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

export default function StudyMaterials({ user }: StudyMaterialsProps) {
  const [file, setFile] = useState<File | null>(null);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<StudyMaterial[]>([]);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState<string | null>(null);
  const [loadingSave, setLoadingSave] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "saved" | "upload">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedMaterial, setExpandedMaterial] = useState<string | null>(null);
  const [currentFlashcard, setCurrentFlashcard] = useState<{ [key: string]: number }>({});
  const [showAnswer, setShowAnswer] = useState<{ [key: string]: boolean }>({});
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: { [questionIndex: number]: string } }>({});
  const [error, setError] = useState<string>("");

  // Supported file types
  const supportedFileTypes = {
    'application/pdf': { name: 'PDF', extensions: ['.pdf'] },
    'text/plain': { name: 'Text', extensions: ['.txt'] },
    'application/msword': { name: 'Word 97-2003', extensions: ['.doc'] },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { name: 'Word', extensions: ['.docx'] },
    'application/rtf': { name: 'Rich Text', extensions: ['.rtf'] },
    'text/rtf': { name: 'Rich Text', extensions: ['.rtf'] },
    'text/markdown': { name: 'Markdown', extensions: ['.md', '.markdown'] },
    'application/vnd.oasis.opendocument.text': { name: 'OpenDocument', extensions: ['.odt'] }
  };

  const getAllowedExtensions = () => {
    return Object.values(supportedFileTypes)
      .flatMap(type => type.extensions)
      .join(',');
  };

  const getFileTypeDisplayName = (mimeType: string) => {
    return supportedFileTypes[mimeType as keyof typeof supportedFileTypes]?.name || 
           mimeType?.split('/').pop()?.toUpperCase() || 'Unknown';
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const isOwner = (material: StudyMaterial) => {
    try {
      if (!user?._id || !material?.uploadedBy) return false;
      
      let uploadedById;
      if (typeof material.uploadedBy === 'string') {
        uploadedById = material.uploadedBy;
      } else if (material.uploadedBy._id) {
        uploadedById = material.uploadedBy._id;
      } else {
        return false;
      }
      
      return uploadedById.toString() === user._id.toString();
    } catch (error) {
      console.error('Error in isOwner:', error);
      return false;
    }
  };

  const isSaved = (material: StudyMaterial) => {
    try {
      if (!user?._id || !material?.savedBy) return false;
      return material.savedBy.includes(user._id);
    } catch (error) {
      console.error('Error in isSaved:', error);
      return false;
    }
  };

  const getAuthorName = (material: StudyMaterial) => {
    try {
      if (!material?.uploadedBy) return 'Unknown User';
      if (typeof material.uploadedBy === 'string') return 'Unknown User';
      
      const firstName = material.uploadedBy.profile?.firstName || 'Unknown';
      const lastName = material.uploadedBy.profile?.lastName || 'User';
      return `${firstName} ${lastName}`;
    } catch {
      return 'Unknown User';
    }
  };

  // Fetch materials on mount
  useEffect(() => {
    fetchMaterials();
  }, []);

  // Filter materials based on active tab and search query
  useEffect(() => {
    try {
      let filtered = materials;

      // Filter by tab
      if (activeTab === "saved") {
        filtered = materials.filter(material => 
          user?._id && material.savedBy?.includes(user._id)
        );
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(material => {
          try {
            const uploadedByInfo = material.uploadedBy && typeof material.uploadedBy === 'object' 
              ? material.uploadedBy 
              : null;
              
            return material.originalName?.toLowerCase().includes(query) ||
                   uploadedByInfo?.username?.toLowerCase().includes(query) ||
                   uploadedByInfo?.profile?.firstName?.toLowerCase().includes(query) ||
                   uploadedByInfo?.profile?.lastName?.toLowerCase().includes(query);
          } catch {
            return false;
          }
        });
      }

      setFilteredMaterials(filtered);
    } catch (error) {
      console.error('Error in filtering:', error);
      setFilteredMaterials(materials);
    }
  }, [materials, activeTab, searchQuery, user]);

  const fetchMaterials = async () => {
    try {
      const res = await axios.get<StudyMaterial[]>("http://localhost:5000/api/study-materials");
      console.log('Fetched materials:', res.data);
      setMaterials(res.data || []);
      setError("");
    } catch (err: any) {
      console.error("Fetch failed:", err);
      setError("Failed to fetch materials. Please check if the server is running.");
      setMaterials([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = Object.keys(supportedFileTypes);
      
      if (!allowedTypes.includes(selectedFile.type)) {
        const supportedFormats = Object.values(supportedFileTypes)
          .map(type => type.name)
          .join(', ');
        setError(`Please select a valid file. Supported formats: ${supportedFormats}`);
        return;
      }
      
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError("File size must be less than 100MB");
        return;
      }
      
      setFile(selectedFile);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first!");
      return;
    }

    if (!user) {
      setError("You must be logged in to upload materials!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoadingUpload(true);
      setError("");
      
      const token = localStorage.getItem('campus_connect_token');
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }
      
      // Updated endpoint to match backend
      const res = await axios.post("http://localhost:5000/api/study-materials/upload", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
      });
      
      setMaterials(prev => [res.data.material, ...prev]);
      setFile(null);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      setActiveTab("all");
      
    } catch (err: any) {
      console.error("Upload failed:", err);
      const errorMessage = err.response?.data?.error || err.message || "Upload failed";
      setError(errorMessage);
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleGenerate = async (id: string, type: "summary" | "flashcards" | "quiz") => {
    try {
      setLoadingGenerate(id + type);
      const token = localStorage.getItem("campus_connect_token");

      const res = await axios.post(
        `http://localhost:5000/api/study-materials/${id}/generate`,
        { type },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      setMaterials((prev) =>
        prev.map((m) => (m._id === id ? { ...m, ...res.data.material } : m))
      );
    } catch (err: any) {
      setError(`Generation failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoadingGenerate(null);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!id) {
      setError("Invalid material ID");
      return;
    }

    if (!confirm("Are you sure you want to delete this material?")) return;
    
    try {
      const token = localStorage.getItem('campus_connect_token');
      await axios.delete(`http://localhost:5000/api/study-materials/${id}`, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });
      setMaterials(prev => prev.filter(m => m._id !== id));
      setExpandedMaterial(null);
    } catch (err: any) {
      console.error("Delete failed:", err);
      const errorMessage = err.response?.data?.error || "Failed to delete material";
      setError(errorMessage);
    }
  };

  const toggleFlashcardAnswer = (materialId: string) => {
    setShowAnswer(prev => ({
      ...prev,
      [materialId]: !prev[materialId]
    }));
  };

  const nextFlashcard = (materialId: string, totalCards: number) => {
    setCurrentFlashcard(prev => ({
      ...prev,
      [materialId]: ((prev[materialId] || 0) + 1) % totalCards
    }));
    setShowAnswer(prev => ({ ...prev, [materialId]: false }));
  };

  const prevFlashcard = (materialId: string, totalCards: number) => {
    setCurrentFlashcard(prev => ({
      ...prev,
      [materialId]: ((prev[materialId] || 0) - 1 + totalCards) % totalCards
    }));
    setShowAnswer(prev => ({ ...prev, [materialId]: false }));
  };

  const handleQuizAnswer = (materialId: string, questionIndex: number, answer: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [materialId]: {
        ...prev[materialId],
        [questionIndex]: answer
      }
    }));
  };

  const getQuizScore = (materialId: string, quiz: Quiz[]) => {
    const answers = quizAnswers[materialId] || {};
    let correct = 0;
    quiz.forEach((q, index) => {
      if (answers[index] === q.answer) correct++;
    });
    return { correct, total: quiz.length };
  };

  const getDisplayMaterials = () => {
    if (activeTab === "upload") return [];
    return filteredMaterials;
  };

  const getTabCounts = () => {
    const allCount = materials.length;
    const savedCount = materials.filter(m => user?._id && m.savedBy.includes(user._id)).length;
    return { allCount, savedCount };
  };

  const { allCount, savedCount } = getTabCounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-pink-50/50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-60 h-60 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-60 h-60 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Study Materials
          </h1>
          <p className="text-gray-600 text-lg">
            Upload documents and generate AI-powered summaries, flashcards, and quizzes
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            <div className="flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              {error}
              <button 
                onClick={() => setError("")}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/50">
            <button
              className={`px-6 py-3 mx-1 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "all" 
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg" 
                  : "text-gray-600 hover:bg-purple-50"
              }`}
              onClick={() => setActiveTab("all")}
            >
              All Materials ({allCount})
            </button>

            <button
              className={`px-6 py-3 mx-1 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "upload" 
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg" 
                  : "text-gray-600 hover:bg-purple-50"
              }`}
              onClick={() => setActiveTab("upload")}
            >
              Upload Material
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {(activeTab === "all" || activeTab === "saved") && (
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search materials by name or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-4 pl-12 pr-4 bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-500"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Upload Section */}
        {activeTab === "upload" && (
          <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Upload New Study Material
            </h2>
            
            {!user && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl mb-6">
                <div className="flex items-center">
                  <span className="text-xl mr-2">🔒</span>
                  You must be logged in to upload materials.
                </div>
              </div>
            )}
            
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File (Max 100MB)
                </label>
                <div className="mb-2 text-xs text-gray-500">
                  Supported formats: Word (DOC/DOCX), Text (TXT), Rich Text (RTF), Markdown (MD), OpenDocument (ODT), PDF
                </div>
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  accept={getAllowedExtensions()}
                  disabled={!user}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              
              {file && (
                <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-purple-800">{file.name}</p>
                      <p className="text-sm text-purple-600">
                        {formatFileSize(file.size)} • {getFileTypeDisplayName(file.type)}
                      </p>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="text-purple-600 hover:text-purple-800 text-xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleUpload}
                disabled={!file || loadingUpload || !user}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {loadingUpload ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </div>
                ) : (
                  "Upload Material"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Materials List */}
        {(activeTab === "all" || activeTab === "saved") && (
          <div className="space-y-6">
            {getDisplayMaterials().length === 0 ? (
              <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50">
                <div className="text-6xl mb-4">
                  {activeTab === "saved" ? "💾" : "📚"}
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {activeTab === "saved" 
                    ? searchQuery 
                      ? "No saved materials match your search" 
                      : "No saved materials yet"
                    : searchQuery 
                      ? "No materials match your search" 
                      : "No materials yet"
                  }
                </h3>
                <p className="text-gray-500 mb-6">
                  {activeTab === "saved" 
                    ? searchQuery
                      ? "Try adjusting your search terms"
                      : "Save materials by clicking the bookmark icon on any material"
                    : searchQuery
                      ? "Try different search terms"
                      : "Upload your first document to get started!"
                  }
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setActiveTab(activeTab === "saved" ? "all" : "upload")}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                  >
                    {activeTab === "saved" ? "Browse All Materials" : "Upload Material"}
                  </button>
                )}
              </div>
            ) : (
              getDisplayMaterials().map((material, index) => {
                const materialId = material._id || `material-${index}`;
                const materialName = material.originalName || 'Unknown File';
                const materialUrl = material.url || '#';
                
                return (
                  <div key={materialId} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                    {/* Material Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <a
                            href={materialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xl font-bold text-purple-600 hover:text-purple-800 hover:underline transition-colors"
                          >
                            {materialName}
                          </a>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                            <span>{formatDate(material.createdAt || '')}</span>
                            <span>{formatFileSize(material.fileSize || 0)}</span>
                            <span>{getFileTypeDisplayName(material.fileType || '')}</span>
                            <span>By {getAuthorName(material)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          
                          <button
                            onClick={() => setExpandedMaterial(expandedMaterial === material._id ? null : material._id || null)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-4 py-2 rounded-xl font-medium transition-all"
                          >
                            {expandedMaterial === material._id ? "Collapse" : "Expand"}
                          </button>
                          
                          {/* Delete Button - Only show for owners */}
                          {user && isOwner(material) && material._id && (
                            <button
                              onClick={() => handleDeleteMaterial(material._id!)}
                              className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-xl font-medium transition-all"
                            >
                              Delete
                            </button>
                          )}
                          
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {material._id && (
                        <div className="flex flex-wrap gap-3 mt-4">
                          <button
                            onClick={() => handleGenerate(material._id!, "summary")}
                            disabled={loadingGenerate === material._id}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 text-white px-4 py-2 rounded-xl font-medium transition-all transform hover:scale-105 disabled:scale-100"
                          >
                            {loadingGenerate === material._id ? "⏳ Generating..." : "📝 Generate Summary"}
                          </button>
                          <button
                            onClick={() => handleGenerate(material._id!, "flashcards")}
                            disabled={loadingGenerate === material._id}
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-400 text-white px-4 py-2 rounded-xl font-medium transition-all transform hover:scale-105 disabled:scale-100"
                          >
                            {loadingGenerate === material._id ? "⏳ Generating..." : "🎴 Generate Flashcards"}
                          </button>
                          <button
                            onClick={() => handleGenerate(material._id!, "quiz")}
                            disabled={loadingGenerate === material._id}
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white px-4 py-2 rounded-xl font-medium transition-all transform hover:scale-105 disabled:scale-100"
                          >
                            {loadingGenerate === material._id ? "⏳ Generating..." : "❓ Generate Quiz"}
                          </button>
                        </div>
                      )}
                      
                      {!material._id && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                          <p className="text-red-600 text-sm">⚠️ This material has no ID and cannot be used for actions.</p>
                        </div>
                      )}
                    </div>

                    {/* Expanded Content */}
                    {expandedMaterial === material._id && (
                      <div className="p-6 space-y-8">
                        {/* Summary */}
                        {material.summary && (
                          <div className="bg-green-50/50 rounded-2xl p-6 border border-green-200">
                            <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                              📝 Summary
                            </h3>
                            <div className="prose prose-green max-w-none">
                              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                                {material.summary}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Flashcards */}
                        {material.flashcards && material.flashcards.length > 0 && (
                          <div className="bg-yellow-50/50 rounded-2xl p-6 border border-yellow-200">
                            <h3 className="text-xl font-bold text-yellow-800 mb-4 flex items-center">
                              🎴 Flashcards ({material.flashcards.length})
                            </h3>
                            
                            <div className="max-w-2xl mx-auto">
                              {(() => {
                                const currentIndex = currentFlashcard[material._id!] || 0;
                                const card = material.flashcards![currentIndex];
                                const isAnswerShown = showAnswer[material._id!] || false;
                                
                                return (
                                  <div className="bg-white rounded-xl shadow-lg p-6 min-h-[200px] flex flex-col justify-between">
                                    <div>
                                      <div className="text-center mb-4">
                                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                          {currentIndex + 1} / {material.flashcards!.length}
                                        </span>
                                      </div>
                                      
                                      <div className="text-center">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                          {isAnswerShown ? "Answer:" : "Question:"}
                                        </h4>
                                        <p className="text-gray-700 text-lg leading-relaxed">
                                          {isAnswerShown ? card.answer : card.question}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center mt-6">
                                      <button
                                        onClick={() => prevFlashcard(material._id!, material.flashcards!.length)}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg font-medium transition-all"
                                        disabled={material.flashcards!.length <= 1}
                                      >
                                        ← Previous
                                      </button>
                                      
                                      <button
                                        onClick={() => toggleFlashcardAnswer(material._id!)}
                                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
                                      >
                                        {isAnswerShown ? "🔄 Show Question" : "💡 Show Answer"}
                                      </button>
                                      
                                      <button
                                        onClick={() => nextFlashcard(material._id!, material.flashcards!.length)}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg font-medium transition-all"
                                        disabled={material.flashcards!.length <= 1}
                                      >
                                        Next →
                                      </button>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Quiz */}
                        {material.quiz && material.quiz.length > 0 && (
                          <div className="bg-red-50/50 rounded-2xl p-6 border border-red-200">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-xl font-bold text-red-800 flex items-center">
                                ❓ Quiz ({material.quiz.length} questions)
                              </h3>
                              {(() => {
                                const score = getQuizScore(material._id!, material.quiz!);
                                return score.total > 0 && (
                                  <div className="bg-white px-4 py-2 rounded-lg border">
                                    <span className="text-sm font-medium">
                                      Score: {score.correct}/{score.total} 
                                      <span className="text-gray-500 ml-1">
                                        ({Math.round((score.correct / score.total) * 100)}%)
                                      </span>
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                            
                            <div className="space-y-6">
                              {material.quiz.map((question, qIndex) => {
                                const userAnswer = quizAnswers[material._id!]?.[qIndex];
                                const isCorrect = userAnswer === question.answer;
                                const hasAnswered = userAnswer !== undefined;
                                
                                return (
                                  <div key={qIndex} className="bg-white rounded-xl p-6 shadow-md">
                                    <h4 className="font-semibold text-gray-800 mb-4">
                                      {qIndex + 1}. {question.question}
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {question.options.map((option, oIndex) => {
                                        let buttonClass = "w-full text-left p-3 rounded-lg border transition-all ";
                                        
                                        if (hasAnswered) {
                                          if (option === question.answer) {
                                            buttonClass += "bg-green-100 border-green-500 text-green-800 font-medium";
                                          } else if (option === userAnswer && !isCorrect) {
                                            buttonClass += "bg-red-100 border-red-500 text-red-800";
                                          } else {
                                            buttonClass += "bg-gray-50 border-gray-200 text-gray-600";
                                          }
                                        } else {
                                          buttonClass += "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-700";
                                        }
                                        
                                        return (
                                          <button
                                            key={oIndex}
                                            onClick={() => !hasAnswered && handleQuizAnswer(material._id!, qIndex, option)}
                                            className={buttonClass}
                                            disabled={hasAnswered}
                                          >
                                            <span className="font-medium mr-2">
                                              {String.fromCharCode(65 + oIndex)}.
                                            </span>
                                            {option}
                                            {hasAnswered && option === question.answer && (
                                              <span className="float-right text-green-600">✓</span>
                                            )}
                                            {hasAnswered && option === userAnswer && !isCorrect && (
                                              <span className="float-right text-red-600">✗</span>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                    
                                    {hasAnswered && (
                                      <div className="mt-3 text-sm">
                                        {isCorrect ? (
                                          <span className="text-green-600 font-medium">✅ Correct!</span>
                                        ) : (
                                          <span className="text-red-600 font-medium">
                                            ❌ Incorrect. The correct answer is: {question.answer}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}