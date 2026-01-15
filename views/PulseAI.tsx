
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Message } from '../types.ts';

interface PulseAIProps {
  initialSubject: string;
}

const PulseAI: React.FC<PulseAIProps> = ({ initialSubject }) => {
  // Use a separate state for the UI-only greeting to keep API history clean
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<{title: string, uri: string}[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
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
    setApiError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // CRITICAL: Filter to ensure we only send alternating user/model turns starting with user
      const apiHistory = messages
        .concat(userMessage)
        .filter(m => m.role === 'user' || m.role === 'model')
        .map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: apiHistory,
        config: {
          systemInstruction: `You are Pulse AI, a high-yield medical consultant. Focus: ${initialSubject}. Use search for latest medical guidelines. Be concise, use professional medical terminology (MBBS/PG level).`,
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
      } else {
        throw new Error("Empty response from AI core.");
      }
    } catch (error: any) {
      console.error("Pulse AI Core Error:", error);
      let errorMsg = "Unable to reach Clinical Core.";
      if (!process.env.API_KEY) {
        errorMsg = "API_KEY missing in Vercel environment variables.";
      } else if (error.message?.includes("400")) {
        errorMsg = "Request format error. Initializing protocol reset...";
      }
      setApiError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-6 lg:p-10">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar pb-6">
        {/* Static Greeting */}
        <div className="flex justify-start">
          <div className="glass max-w-[85%] p-6 rounded-[2rem] rounded-tl-none border-white/10 shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <i className="fas fa-brain-circuit text-[10px] text-cyan-400"></i>
              </div>
              <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">Grounded Pulse AI</span>
            </div>
            <p className="text-[15px] leading-relaxed font-medium text-slate-200">
              Dr. Aspirant, I'm Pulse AI. I am now grounded with real-time Google Search to provide the latest 2024-25 medical guidelines. Ask me anything.
            </p>
          </div>
        </div>

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-6 rounded-[2rem] ${
              m.role === 'user' 
                ? 'bg-cyan-600 text-white rounded-tr-none shadow-xl shadow-cyan-900/20' 
                : 'glass text-slate-200 rounded-tl-none border-white/10 shadow-2xl'
            }`}>
              <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{m.content}</div>
              
              {m.role === 'model' && sources.length > 0 && (
                <div className="mt-5 pt-4 border-t border-white/5 space-y-3">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Evidence Grounding</p>
                   <div className="flex flex-wrap gap-2">
                     {sources.map((s, i) => (
                       <a key={i} href={s.uri} target="_blank" className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-xl text-[10px] font-bold text-cyan-400 transition-all border border-cyan-500/10 flex items-center gap-2">
                         <i className="fas fa-file-medical text-[8px] opacity-70"></i> 
                         <span className="truncate max-w-[120px]">{s.title || 'Source'}</span>
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
             <div className="glass px-6 py-4 rounded-[2rem] rounded-tl-none flex items-center gap-4">
               <div className="flex gap-1.5">
                 <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
               </div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Consulting Medical Databases...</span>
             </div>
          </div>
        )}

        {apiError && (
          <div className="flex justify-center p-4">
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl px-6 py-3 flex items-center gap-3">
              <i className="fas fa-triangle-exclamation text-rose-500 text-xs"></i>
              <p className="text-[11px] font-black text-rose-500 uppercase tracking-widest">{apiError}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="glass p-2 rounded-[2.5rem] flex items-center gap-2 shadow-2xl border-white/10 ring-4 ring-cyan-500/5 focus-within:ring-cyan-500/20 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about 2024 Asthma guidelines or a clinical case..."
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
