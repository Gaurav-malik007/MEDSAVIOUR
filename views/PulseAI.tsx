
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
  const [apiError, setApiError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  // Check if API key exists on load
  useEffect(() => {
    const key = process.env.API_KEY;
    if (!key || key === "undefined" || key === "") {
      setApiError("KEY_NOT_FOUND");
    }
  }, []);

  const handleSend = async () => {
    const key = process.env.API_KEY;
    if (!key || key === "undefined") {
      setApiError("KEY_NOT_FOUND");
      return;
    }

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
    setApiError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: key });
      
      if (!chatRef.current) {
        chatRef.current = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: `You are Pulse AI, the world's leading medical education assistant for MBBS and NEET-PG.
            Current Subject: ${initialSubject}.
            Style: High-yield, clinical, concise. Use bold for key terms. Use standard clinical guidelines (Harrison's, Robbins, Bailey & Love).`,
            tools: [{ googleSearch: {} }]
          }
        });
      }

      const result = await chatRef.current.sendMessage({ message: input });
      const text = result.text;

      if (text) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: text,
          timestamp: Date.now()
        }]);
      }

      // Extract sources if available
      const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const foundSources = chunks.map((c: any) => c.web).filter(Boolean);
        setSources(foundSources.slice(0, 3));
      }

    } catch (error: any) {
      console.error("Pulse AI Connection Error:", error);
      setApiError("SERVER_SYNC_ISSUE");
    } finally {
      setIsLoading(false);
    }
  };

  if (apiError === "KEY_NOT_FOUND") {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-950/50">
        <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/20">
          <i className="fas fa-brain-circuit text-3xl text-cyan-400"></i>
        </div>
        <h2 className="text-2xl font-black italic mb-4">AI Brain Connection <span className="text-rose-500">Required</span></h2>
        <p className="text-slate-400 max-w-sm mb-8 text-sm leading-relaxed">
          Dr. Aspirant, the clinical brain is offline. This happens if the <span className="text-white font-bold underline">API_KEY</span> hasn't been synced from your Vercel settings yet.
        </p>
        <div className="glass p-6 rounded-2xl border-white/5 space-y-4 mb-8 text-left w-full max-w-md">
           <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Emergency Protocol:</h4>
           <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
             <li>Go to your <span className="text-cyan-400">Vercel Dashboard</span></li>
             <li>Settings > Environment Variables</li>
             <li>Ensure the key is named <code className="bg-white/10 px-1 rounded text-white">API_KEY</code></li>
             <li>Make sure you hit <span className="text-emerald-400">Save</span> and <span className="text-emerald-400">Redeploy</span></li>
           </ol>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-10 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-cyan-900/40 transition-all"
        >
          Re-Sync Academy Server
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-4 lg:p-8">
      <div className="flex justify-center mb-6">
        <div className="px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
          <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest tracking-widest">Active Focus: {initialSubject}</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar pb-6">
        {messages.length === 0 && (
          <div className="flex justify-start animate-in fade-in slide-in-from-left-4">
            <div className="glass max-w-[90%] p-6 rounded-[2rem] rounded-tl-none border-white/10 shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <i className="fas fa-stethoscope text-xs text-cyan-400"></i>
                <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">Academy Pulse AI</span>
              </div>
              <p className="text-[15px] leading-relaxed font-medium text-slate-200">
                Ready for clinical review. Ask me about <span className="text-cyan-400">{initialSubject}</span> clinical cases, guidelines, or high-yield MCQ concepts.
              </p>
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] p-6 rounded-[2rem] ${
              m.role === 'user' 
                ? 'bg-cyan-600 text-white rounded-tr-none shadow-xl shadow-cyan-900/20 border border-white/10' 
                : 'glass text-slate-200 rounded-tl-none border-white/10 shadow-2xl'
            }`}>
              <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{m.content}</div>
              {m.role === 'model' && sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                  {sources.map((s, idx) => (
                    <a key={idx} href={s.uri} target="_blank" className="text-[9px] font-black text-slate-500 uppercase hover:text-cyan-400 transition-colors">
                      <i className="fas fa-link mr-1"></i> {s.title || 'Source'}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
             <div className="glass px-6 py-6 rounded-[2rem] rounded-tl-none border-white/10 w-full max-w-sm space-y-4">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest animate-pulse">Syncing Database...</span>
                   <i className="fas fa-heart-pulse text-cyan-500 text-xs"></i>
                </div>
                <div className="h-8 w-full bg-slate-900/50 rounded-xl relative overflow-hidden ekg-line"></div>
             </div>
          </div>
        )}

        {apiError === "SERVER_SYNC_ISSUE" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
               <i className="fas fa-circle-exclamation text-xl"></i>
            </div>
            <div className="text-center">
               <h4 className="text-sm font-bold text-rose-500 mb-1 uppercase tracking-widest">Clinical Protocol Failure</h4>
               <p className="text-[10px] text-slate-500 uppercase tracking-widest">Connection to clinical server timed out.</p>
            </div>
            <button 
              onClick={handleSend}
              className="px-8 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 text-[9px] font-black uppercase tracking-widest rounded-xl border border-rose-500/20 transition-all"
            >
              Re-Sync AI Core
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
