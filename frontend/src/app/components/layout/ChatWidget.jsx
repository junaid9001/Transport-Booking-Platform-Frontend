"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Trash2, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function ChatWidget() {
  const { isAuthenticated, user, token } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const initializedRef = useRef(false);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Handle Websocket Connection
  useEffect(() => {
    // Only connect if authenticated
    if (!isAuthenticated) {
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
        setIsConnected(false);
        return;
    }

    if (initializedRef.current) return;
    initializedRef.current = true;

    // 1. Fetch History via REST first
    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
        try {
            const res = await fetch(`${baseUrl}/chat/messages?token=${token}`, {
                credentials: "include" 
            });
            
            if (res.status === 401) {
                console.warn("[Chat] Token expired. Forcing local logout.");
                useAuthStore.getState().logout();
                useAuthStore.getState().setAuthModalOpen(true);
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
            }
        } catch (err) {
            console.error("[Chat] Error fetching history", err);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    fetchHistory().then(() => {
        // 2. Open Websocket Connection after history is loaded
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        
        // Derive WS host from API URL
        let wsHost = 'localhost:8080/api';
        try {
            const url = new URL(baseUrl);
            wsHost = url.host + url.pathname;
        } catch (e) {
            // fallback
        }

        const wsUrl = `${wsProtocol}//${wsHost}/chat/ws?token=${token}`;
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("[Chat WS] Connected");
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.action === "new_message") {
                    setMessages(prev => [...prev, data.message]);
                } else if (data.action === "message_deleted") {
                    setMessages(prev => prev.filter(m => m.id !== data.message_id));
                }
            } catch (err) {
                console.error("[Chat WS] Parse Error", err);
            }
        };

        socket.onerror = (err) => {
            console.error("[Chat WS] Error", err);
        };

        socket.onclose = () => {
            console.log("[Chat WS] Disconnected");
            setIsConnected(false);
            initializedRef.current = false;
        };
    });

    return () => {
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
        initializedRef.current = false;
    };
  }, [isAuthenticated, token]);

  if (!isAuthenticated) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    socketRef.current.send(JSON.stringify({
        action: "send",
        content: inputValue.trim()
    }));
    
    setInputValue("");
  };

  const handleDelete = (messageId) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify({
        action: "delete",
        message_id: messageId
    }));
  };

  return (
    <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[100] flex flex-col items-end">
      
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-80 md:w-96 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden mb-4 border border-slate-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 flex justify-between items-center text-white shadow-md z-10 relative">
                <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        Digital Concierge
                        {isConnected && <span className="w-2.5 h-2.5 bg-emerald-300 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" title="Connected Live"></span>}
                    </h3>
                    <p className="text-xs text-emerald-100 opacity-90 font-medium">We typically reply in minutes</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="h-96 md:h-[400px] bg-slate-50 p-4 overflow-y-auto flex flex-col gap-3">
                {isLoadingHistory ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        <span className="text-sm font-medium">Loading history...</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                        <MessageSquare className="w-12 h-12 text-slate-200" />
                        <p className="text-sm font-medium text-center px-4">No messages yet.<br/>Send us a message and our concierge will jump right in!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender === "USER";
                        return (
                            <div key={msg.id} className={`flex w-full group ${isMe ? 'justify-end' : 'justify-start'}`}>
                                {!isMe && (
                                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex justify-center items-center font-bold text-[10px] mr-2 flex-shrink-0 shadow-sm">
                                        ADM
                                    </div>
                                )}
                                
                                <div className="flex flex-col relative max-w-[75%]">
                                    <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-emerald-500 text-white rounded-tr-sm' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'}`}>
                                        {msg.content}
                                    </div>

                                    {/* Actions & Timestamps */}
                                    <div className={`flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium ${isMe ? 'justify-end' : 'justify-start ml-1'}`}>
                                        <span>{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        {isMe && (
                                            <button 
                                              onClick={() => handleDelete(msg.id)}
                                              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500"
                                              aria-label="Delete message"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100">
                <div className="relative flex items-center">
                    <input 
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-full py-2.5 pl-4 pr-12 text-sm transition-all text-slate-800"
                        disabled={!isConnected}
                    />
                    <button 
                        type="submit" 
                        disabled={!inputValue.trim() || !isConnected}
                        className="absolute right-1.5 p-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-full transition-colors shadow-sm"
                    >
                        <Send size={16} className={inputValue.trim() ? "translate-x-[1px] translate-y-[-1px]" : ""} />
                    </button>
                </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 ${isOpen ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/30'}`}
      >
        <AnimatePresence mode="wait">
            {isOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <X size={26} />
                </motion.div>
            ) : (
                <motion.div key="chat" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                    <MessageSquare size={26} />
                </motion.div>
            )}
        </AnimatePresence>
      </motion.button>

    </div>
  );
}
