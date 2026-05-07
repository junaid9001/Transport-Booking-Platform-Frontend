"use client";

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Search, Phone, Video, MoreVertical, Send, Loader2, User } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function ChatManagement() {
  const { token } = useAuthStore();
  const [activeChats, setActiveChats] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Fetch users with active chats
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      // Note: This endpoint should be added to the backend
      const res = await fetch(`${baseUrl}/chat/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Assuming data is { users: [ { id, name, lastMessage, time } ] }
        setActiveChats(data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Refresh user list every 30 seconds
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // 2. Fetch messages for selected user
  const fetchMessages = async (userId) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`${baseUrl}/chat/messages?token=${token}&target_user_id=${userId}`, {
          // Note: Backend might need target_user_id support in /messages
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);
      setupWebSocket(selectedUserId);
    }
    return () => {
        if (socketRef.current) socketRef.current.close();
    }
  }, [selectedUserId]);

  const setupWebSocket = (userId) => {
    if (socketRef.current) socketRef.current.close();

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let wsHost = 'localhost:8080/api';
    try {
        const url = new URL(baseUrl);
        wsHost = url.host + url.pathname;
    } catch (e) {}

    const wsUrl = `${wsProtocol}//${wsHost}/chat/ws?token=${token}&viewing_user_id=${userId}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.action === "new_message") {
                setMessages(prev => [...prev, data.message]);
            }
        } catch (e) {}
    };
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedUserId) return;

    try {
      const res = await fetch(`${baseUrl}/chat/admin/reply/${selectedUserId}`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: inputValue.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.message]);
        setInputValue("");
      }
    } catch (err) {
      console.error("Failed to send reply:", err);
    }
  };

  const filteredChats = activeChats.filter(chat => 
    chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    chat.id?.toString().includes(searchTerm)
  );

  const selectedUser = activeChats.find(c => c.id === selectedUserId);

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Support Chat</h1>
        <p className="text-slate-500 mt-1">Manage active user support requests in real-time.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-1 overflow-hidden">
        
        {/* Sidebar - Chat List */}
        <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or ID..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-medium"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loadingUsers ? (
                <div className="p-8 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading...</div>
            ) : filteredChats.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No active conversations.</div>
            ) : filteredChats.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => setSelectedUserId(chat.id)}
                className={`p-4 flex items-center gap-4 cursor-pointer transition-colors border-b border-slate-100 last:border-0 ${
                  selectedUserId === chat.id ? 'bg-emerald-50/50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg">
                    {chat.name ? chat.name.charAt(0) : 'U'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{chat.name || `User ${chat.id}`}</h4>
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap ml-2">{chat.time}</span>
                  </div>
                  <p className="text-sm text-slate-500 truncate">{chat.lastMessage || "Click to view chat"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50">
          {!selectedUserId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 p-8 text-center">
                <MessageSquare size={48} className="opacity-20" />
                <div>
                    <h3 className="font-bold text-slate-900">Select a conversation</h3>
                    <p className="text-sm">Pick a user from the sidebar to start supporting.</p>
                </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold uppercase">
                    {selectedUser?.name ? selectedUser.name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{selectedUser?.name || `User ${selectedUserId}`}</h3>
                    <p className="text-xs text-emerald-500 font-medium">Active Session</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Phone size={20} /></button>
                  <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Video size={20} /></button>
                  <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><MoreVertical size={20} /></button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                {loadingMessages ? (
                    <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender === "ADMIN";
                        return (
                            <div key={msg.id || idx} className={`flex gap-3 max-w-[80%] ${isMe ? 'self-end flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${isMe ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                                    {isMe ? 'AD' : (selectedUser?.name?.charAt(0) || 'U')}
                                </div>
                                <div className={`flex flex-col ${isMe ? 'items-end' : ''}`}>
                                    <div className={`p-3 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-white text-slate-700 rounded-tl-sm border border-slate-200'}`}>
                                        {msg.content}
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium mt-1 block px-1">
                                        {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your reply..." 
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
                  />
                  <button 
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="p-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-full transition-colors flex-shrink-0 shadow-sm"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
