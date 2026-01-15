
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Message } from '../types.ts';

interface PulseAIProps {
  initialSubject: string;
}

const PulseAI: React.FC<PulseAIProps> = ({ initialSubject }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<{title: string, uri: string}[]>([]);
  const [apiError, setApiError] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: input, 
      timestamp: Date.now() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setSources([]);
    setApiError(false);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const apiHistory = messages
        .concat(userMessage)
        .map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: apiHistory,
        config: {
          systemInstruction: `You are Pulse AI, the world's most advanced medical education consultant for MBBS students and NEET-PG/INI-CET aspirants. Focus: ${initialSubject}. Use search for latest guidelines. Use standard medical abbreviations. Be concise and prioritize exam-relevant 'must-know' points.`,
          tools: [{ googleSearch: {} }]
        }
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
        const extractedSources = groundingChunks
          .map((chunk: any) => chunk.web)
          .filter((web: any) => web && web.uri)
          .slice(0, 3);
        setSources(extractedSources);
      }

      const modelText = response.text;
      if (modelText) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: modelText,
          timestamp: Date.now()
        }]);
      }
    } catch (error: any) {
      console.error("Pulse AI Sync Error:", error);
      setApiError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-4 lg:p-8">
      {/* Subject Badge */}
      <div className="flex justify-center mb-6">
        <div className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
          <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Active Focus: {initialSubject}</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar pb-6">
        {/* Welcome Message */}
        <div className="flex justify-start">
          <div className="glass max-w-[90%] p-6 rounded-[2rem] rounded-tl-none border-white/10 shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <i className="fas fa-stethoscope text-[10px] text-cyan-400"></i>
              </div>
              <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">Consultant Pulse AI</span>
            </div>
            <p className="text-[15px] leading-relaxed font-medium text-slate-200">
              Dr. Aspirant, I'm ready for rounds. Ask me anything about <span className="text-cyan-400 font-bold">{initialSubject}</span> clinical cases or the latest guidelines.
            </p>
          </div>
        </div>

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] p-6 rounded-[2rem] ${
              m.role === 'user' 
                ? 'bg-cyan-600 text-white rounded-tr-none shadow-xl shadow-cyan-900/20 border border-white/10' 
                : 'glass text-slate-200 rounded-tl-none border-white/10 shadow-2xl'
            }`}>
              <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{m.content}</div>
              
              {m.role === 'model' && sources.length > 0 && (
                <div className="mt-5 pt-4 border-t border-white/5 space-y-3">
                   <div className="flex flex-wrap gap-2">
                     {sources.map((s, i) => (
                       <a key={i} href={s.uri} target="_blank" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-[9px] font-bold text-slate-400 transition-all border border-white/5 flex items-center gap-2">
                         <i className="fas fa-link text-[8px]"></i> 
                         <span className="truncate max-w-[100px]">{s.title || 'Ref'}</span>
                       </a>
                     ))}
                   </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
             <div className="glass px-6 py-6 rounded-[2rem] rounded-tl-none border-white/10 w-full max-w-sm space-y-4">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest animate-pulse">Consulting Database...</span>
                   <i className="fas fa-heart-pulse text-cyan-500 text-xs"></i>
                </div>
                <div className="h-8 w-full bg-slate-900/50 rounded-xl relative overflow-hidden ekg-line"></div>
             </div>
          </div>
        )}

        {apiError && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
               <i className="fas fa-plug-circle-xmark text-xl"></i>
            </div>
            <div className="text-center">
               <h4 className="text-sm font-bold text-rose-500 mb-1">Clinical Core Unavailable</h4>
               <p className="text-xs text-slate-500 max-w-[240px]">The AI consultant is currently offline. Please reconnect to the academy server.</p>
            </div>
            <button 
              onClick={handleSend}
              className="px-6 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-rose-500/20 transition-all"
            >
              Sync Connection
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 sticky bottom-0">
        <div className="glass p-2 rounded-[2.5rem] flex items-center gap-2 shadow-2xl border-white/10 ring-4 ring-cyan-500/5 focus-within:ring-cyan-500/20 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Search symptoms, drugs or guidelines..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-600 px-6 text-sm font-medium"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-12 h-12 rounded-[1.5rem] bg-cyan-600 hover:bg-cyan-500 transition-all flex items-center justify-center disabled:opacity-30 shadow-lg shadow-cyan-900/40"
          >
            <i className="fas fa-location-arrow text-white text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PulseAI;
