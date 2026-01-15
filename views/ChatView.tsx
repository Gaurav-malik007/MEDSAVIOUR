
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Message } from '../types';

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', content: "Hello! I'm Gemini, your high-performance creative assistant. How can I help you today?", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Always create a fresh instance with process.env.API_KEY directly before use
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages, userMessage].map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        })),
        config: {
          temperature: 0.7,
          topP: 0.95,
        }
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text || "I couldn't generate a response.",
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: "Sorry, I encountered an error processing your request.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 lg:p-8">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4"
      >
        {messages.map((m) => (
          <div 
            key={m.id} 
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] px-5 py-3 rounded-2xl ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/10' 
                : 'glass text-slate-200 rounded-tl-none border-white/5 shadow-xl'
            }`}>
              <div className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</div>
              <div className="text-[10px] mt-2 opacity-40 uppercase font-bold tracking-tighter">
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass px-5 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 pb-4 pt-2 bg-transparent">
        <div className="glass p-2 rounded-2xl flex items-center gap-2 shadow-2xl ring-1 ring-white/10">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your prompt here..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-500 px-4 py-2"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <i className="fas fa-paper-plane text-white group-hover:translate-x-0.5 transition-transform"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
