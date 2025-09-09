import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, Share, Users, MessageCircle, Code, Palette, Hand, Square, Circle, ArrowRight, Type, Eraser } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  badges: string[];
  points: number;
}

interface LiveSessionProps {
  user: User;
}

export function LiveSession({ user }: LiveSessionProps) {
  const { sessionId } = useParams();
  const [activeTab, setActiveTab] = useState<'whiteboard' | 'code' | 'chat'>('whiteboard');
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [selectedTool, setSelectedTool] = useState<'pen' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'eraser'>('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const [code, setCode] = useState(`// Welcome to the collaborative code editor!
// Try writing some code here

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));

// React component example
const WelcomeMessage = ({ name }) => {
  return (
    <div className="welcome">
      <h1>Hello, {name}!</h1>
      <p>Welcome to our study session.</p>
    </div>
  );
};`);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      user: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      message: 'Welcome everyone to our React study session!',
      time: '10:30 AM'
    },
    {
      id: 2,
      user: 'Mike Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      message: 'Thanks for organizing this. Looking forward to learning about hooks.',
      time: '10:31 AM'
    },
    {
      id: 3,
      user: user.name,
      avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
      message: 'Great to be here! 👋',
      time: '10:32 AM'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const participants = [
    { name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', isHost: true, isOnline: true },
    { name: 'Mike Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', isHost: false, isOnline: true },
    { name: user.name, avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`, isHost: false, isOnline: true },
    { name: 'Emily Davis', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily', isHost: false, isOnline: true },
    { name: 'Alex Rodriguez', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', isHost: false, isOnline: false }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set up drawing context
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === 'eraser') return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (selectedTool === 'pen') {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: chatMessages.length + 1,
      user: user.name,
      avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
      message: newMessage,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages([...chatMessages, message]);
    setNewMessage('');
  };

  const tools = [
    { id: 'pen', icon: Palette, label: 'Pen' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl text-white">React Hooks Deep Dive</h1>
            <p className="text-gray-400 text-sm">Session ID: {sessionId}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3 rounded-full transition-colors ${
                  isMicOn ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-full transition-colors ${
                  isVideoOn ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <button className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">
                <Share className="w-5 h-5" />
              </button>
            </div>

            {/* Leave button */}
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              Leave Session
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="bg-gray-800 border-b border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'whiteboard', label: 'Whiteboard', icon: Palette },
                { id: 'code', label: 'Code Editor', icon: Code },
                { id: 'chat', label: 'Chat', icon: MessageCircle }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 transition-colors flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 bg-gray-900 p-6">
            {activeTab === 'whiteboard' && (
              <div className="h-full flex flex-col">
                {/* Toolbar */}
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {tools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <button
                            key={tool.id}
                            onClick={() => setSelectedTool(tool.id as any)}
                            className={`p-2 rounded-lg transition-colors ${
                              selectedTool === tool.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                            title={tool.label}
                          >
                            <Icon className="w-4 h-4" />
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={clearCanvas}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 bg-white rounded-lg overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="h-full">
                <div className="bg-gray-800 rounded-lg p-4 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">Language:</span>
                      <select className="bg-gray-700 text-white px-3 py-1 rounded border-none outline-none">
                        <option>JavaScript</option>
                        <option>Python</option>
                        <option>Java</option>
                        <option>C++</option>
                      </select>
                    </div>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                      Run Code
                    </button>
                  </div>
                  
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-[calc(100%-60px)] bg-gray-900 text-gray-100 p-4 rounded border-none outline-none resize-none font-mono text-sm"
                    placeholder="Start coding together..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="h-full flex flex-col">
                {/* Messages */}
                <div className="flex-1 bg-gray-800 rounded-lg p-4 mb-4 overflow-y-auto">
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div key={message.id} className="flex items-start space-x-3">
                        <img
                          src={message.avatar}
                          alt={message.user}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-white text-sm">{message.user}</span>
                            <span className="text-gray-400 text-xs">{message.time}</span>
                          </div>
                          <p className="text-gray-300 text-sm">{message.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg border-none outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-400" />
              <h3 className="text-white">Participants ({participants.filter(p => p.isOnline).length})</h3>
            </div>
          </div>
          
          <div className="p-4">
            <div className="space-y-3">
              {participants.map((participant, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${
                      participant.isOnline ? 'bg-green-400' : 'bg-gray-500'
                    }`}></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-sm">{participant.name}</span>
                      {participant.isHost && (
                        <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">Host</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs">
                      {participant.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                  {participant.isOnline && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Raise Hand */}
          <div className="p-4 border-t border-gray-700">
            <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2">
              <Hand className="w-4 h-4" />
              <span>Raise Hand</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}