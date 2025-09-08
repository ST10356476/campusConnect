import React, { useState } from 'react';
import { Upload, FileText, Download, Eye, Sparkles, BookOpen, Brain, Target, Share2, Heart } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  badges: string[];
  points?: number;  
}

interface StudyMaterialsProps {
  user: User;
}

export function StudyMaterials({ user }: StudyMaterialsProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'my-materials' | 'upload'>('browse');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summaryResult, setSummaryResult] = useState<any>(null);

  const materials = [
    {
      id: 1,
      title: 'React Hooks Complete Guide',
      description: 'Comprehensive guide covering useState, useEffect, custom hooks, and advanced patterns',
      type: 'PDF',
      size: '2.5 MB',
      author: 'Sarah Chen',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      uploadedAt: '2 days ago',
      downloads: 234,
      likes: 45,
      community: 'React Developers',
      tags: ['react', 'hooks', 'frontend'],
      hasAISummary: true
    },
    {
      id: 2,
      title: 'Data Structures Cheat Sheet',
      description: 'Quick reference for arrays, linked lists, trees, graphs, and their time complexities',
      type: 'PDF',
      size: '1.8 MB',
      author: 'Mike Johnson',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      uploadedAt: '1 week ago',
      downloads: 567,
      likes: 89,
      community: 'Computer Science',
      tags: ['algorithms', 'data-structures', 'computer-science'],
      hasAISummary: true
    },
    {
      id: 3,
      title: 'Machine Learning Mathematics',
      description: 'Linear algebra, calculus, and statistics fundamentals for ML',
      type: 'DOC',
      size: '3.2 MB',
      author: 'Emily Davis',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
      uploadedAt: '3 days ago',
      downloads: 156,
      likes: 32,
      community: 'Machine Learning',
      tags: ['machine-learning', 'mathematics', 'linear-algebra'],
      hasAISummary: false
    },
    {
      id: 4,
      title: 'Database Design Principles',
      description: 'Normalization, indexing, query optimization, and NoSQL vs SQL comparison',
      type: 'PDF',
      size: '4.1 MB',
      author: 'Alex Rodriguez',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      uploadedAt: '5 days ago',
      downloads: 298,
      likes: 67,
      community: 'Backend Development',
      tags: ['database', 'sql', 'backend'],
      hasAISummary: true
    }
  ];

  const myMaterials = materials.filter(m => m.author === user.name);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleProcessFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setSummaryResult({
        keyPoints: [
          'React hooks provide a way to use state and lifecycle features in functional components',
          'useState is used for managing component state',
          'useEffect handles side effects and lifecycle events',
          'Custom hooks allow for reusable stateful logic',
          'useContext provides a way to consume context values'
        ],
        flashcards: [
          {
            front: 'What is the purpose of useState hook?',
            back: 'useState allows functional components to have local state'
          },
          {
            front: 'When does useEffect run?',
            back: 'useEffect runs after the component renders and can be configured to run on specific dependencies'
          },
          {
            front: 'How do you create a custom hook?',
            back: 'Custom hooks are JavaScript functions that start with "use" and can call other hooks'
          }
        ],
        quiz: [
          {
            question: 'Which hook is used for managing component state?',
            options: ['useEffect', 'useState', 'useContext', 'useReducer'],
            correct: 1
          },
          {
            question: 'What happens when useEffect has an empty dependency array?',
            options: ['Runs on every render', 'Runs only once', 'Never runs', 'Runs on state change'],
            correct: 1
          }
        ]
      });
      setIsProcessing(false);
    }, 3000);
  };

  const renderSummaryResults = () => {
    if (!summaryResult) return null;

    return (
      <div className="mt-6 space-y-6">
        {/* Key Points */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg text-blue-900">Key Points</h3>
          </div>
          <ul className="space-y-2">
            {summaryResult.keyPoints.map((point: string, index: number) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-blue-800">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Flashcards */}
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-5 h-5 text-green-600" />
            <h3 className="text-lg text-green-900">Generated Flashcards</h3>
          </div>
          <div className="grid gap-4">
            {summaryResult.flashcards.map((card: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-green-200">
                <div className="mb-2">
                  <span className="text-sm text-green-600">Question:</span>
                  <p className="text-green-900">{card.front}</p>
                </div>
                <div>
                  <span className="text-sm text-green-600">Answer:</span>
                  <p className="text-green-900">{card.back}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz */}
        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg text-purple-900">Practice Quiz</h3>
          </div>
          <div className="space-y-4">
            {summaryResult.quiz.map((question: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-purple-200">
                <p className="text-purple-900 mb-3">{question.question}</p>
                <div className="space-y-2">
                  {question.options.map((option: string, optIndex: number) => (
                    <label key={optIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        className="text-purple-600"
                      />
                      <span className="text-purple-800">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl text-gray-900 mb-2">Study Materials</h1>
        <p className="text-gray-600">Share, discover, and enhance your learning resources with AI</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'browse', label: 'Browse Materials', count: materials.length },
            { id: 'my-materials', label: 'My Materials', count: myMaterials.length },
            { id: 'upload', label: 'Upload & Analyze' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} {tab.count && `(${tab.count})`}
            </button>
          ))}
        </nav>
      </div>

      {/* Browse Materials */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {materials.map((material) => (
            <div key={material.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg text-gray-900">{material.title}</h3>
                        {material.hasAISummary && (
                          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                            <Sparkles className="w-3 h-3" />
                            <span>AI Enhanced</span>
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{material.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span>{material.type} • {material.size}</span>
                        <span>•</span>
                        <span>by {material.author}</span>
                        <span>•</span>
                        <span>{material.uploadedAt}</span>
                        <span>•</span>
                        <span>{material.community}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-4">
                        {material.tags.map((tag) => (
                          <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
                          <Download className="w-4 h-4" />
                          <span className="text-sm">{material.downloads}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">{material.likes}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
                          <Share2 className="w-4 h-4" />
                          <span className="text-sm">Share</span>
                        </button>
                        {material.hasAISummary && (
                          <button className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm">View AI Summary</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Materials */}
      {activeTab === 'my-materials' && (
        <div className="space-y-6">
          {myMaterials.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl text-gray-900 mb-2">No materials yet</h3>
              <p className="text-gray-600 mb-6">Upload your first study material to get started</p>
              <button
                onClick={() => setActiveTab('upload')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload Material
              </button>
            </div>
          ) : (
            myMaterials.map((material) => (
              <div key={material.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Similar structure to browse materials but with edit/delete options */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg text-gray-900 mb-2">{material.title}</h3>
                    <p className="text-gray-600 mb-3">{material.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{material.downloads} downloads</span>
                      <span>•</span>
                      <span>{material.likes} likes</span>
                      <span>•</span>
                      <span>{material.uploadedAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded transition-colors">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-700 px-3 py-1 rounded transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Upload & Analyze */}
      {activeTab === 'upload' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl text-gray-900 mb-2">Upload Study Material</h2>
              <p className="text-gray-600">Upload PDFs, documents, or text files for AI-powered analysis</p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  PDF, DOC, DOCX, TXT up to 10MB
                </p>
              </label>
            </div>

            {selectedFile && (
              <div className="mt-6">
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg text-gray-900 mb-4">AI Analysis Options</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      <span className="text-gray-700">Generate key points summary</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      <span className="text-gray-700">Create flashcards</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      <span className="text-gray-700">Generate practice quiz</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleProcessFile}
                  disabled={isProcessing}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Analyze with AI</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {renderSummaryResults()}
          </div>
        </div>
      )}
    </div>
  );
}