
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Message } from '../types.ts';

const PulseAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', content: "Dr. Aspirant, I'm Pulse AI. I am now grounded with real-time Google Search to provide the latest 2024-25 medical guidelines. Ask me anything.", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<{title: string, uri: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setSources([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [...messages, userMessage].map(m => ({ role: m.role, parts: [{ text: m.content }] })),
        config: {
          systemInstruction: "You are Pulse AI. Use the search tool to verify the LATEST medical guidelines (GEMA, GOLD, GINA, AHA/ACC) for 2024-2025. Be precise, cite sources, and prioritize high-yield exam points.",
          tools: [{ googleSearch: {} }]
        }
      });

      // Extract Grounding sources
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
        const extractedSources = groundingChunks
          .map((chunk: any) => chunk.web)
          .filter((web: any) => web && web.uri)
          .slice(0, 3);
        setSources(extractedSources);
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text || "Diagnostic error. Please rephrase.",
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-6 lg:p-10">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-6 rounded-[2rem] ${
              m.role === 'user' 
                ? 'bg-cyan-600 text-white rounded-tr-none shadow-xl shadow-cyan-900/20' 
                : 'glass text-slate-200 rounded-tl-none border-white/10 shadow-2xl'
            }`}>
              {m.role === 'model' && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded bg-cyan-500/20 flex items-center justify-center">
                    <i className="fas fa-brain text-[10px] text-cyan-400"></i>
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">Grounded Pulse AI</span>
                </div>
              )}
              <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{m.content}</div>
              
              {m.role === 'model' && sources.length > 0 && messages[messages.length-1].id === m.id && (
                <div className="mt-4 pt-4 border-t border-white/10">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Evidence Sources</p>
                   <div className="flex flex-wrap gap-2">
                     {sources.map((s, i) => (
                       <a key={i} href={s.uri} target="_blank" className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-cyan-400 transition-all border border-white/5 truncate max-w-[150px]">
                         <i className="fas fa-link mr-1 opacity-50"></i> {s.title || 'Source'}
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
               <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
               </div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Searching Medical Databases...</span>
             </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="glass p-3 rounded-[2rem] flex items-center gap-3 shadow-2xl border-white/5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about 2024 Asthma guidelines or a clinical case..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-600 px-5 text-sm font-medium"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-12 h-12 rounded-2xl bg-cyan-600 hover:bg-cyan-500 transition-all flex items-center justify-center disabled:opacity-30"
          >
            <i className="fas fa-paper-plane text-white text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PulseAI;
