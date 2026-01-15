
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

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
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
            systemInstruction: `You are Pulse AI, the medical assistant for MBBS and NEET-PG. Current Focus: ${initialSubject}. High-yield only.`,
            tools: [{ googleSearch: {} }]
          }
        });
      }

      const result = await chatRef.current.sendMessage({ message: input });
      if (result.text) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: result.text,
          timestamp: Date.now()
        }]);
      }

      const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) setSources(chunks.map((c: any) => c.web).filter(Boolean).slice(0, 3));
    } catch (error) {
      setApiError("SERVER_SYNC_ISSUE");
    } finally {
      setIsLoading(false);
    }
  };

  if (apiError === "KEY_NOT_FOUND") {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/20">
          <i className="fas fa-brain-circuit text-2xl text-cyan-400"></i>
        </div>
        <h2 className="text-xl font-black mb-2">Sync Required</h2>
        <p className="text-slate-500 text-xs mb-8">Please add your API_KEY to Vercel Settings and Redeploy.</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-cyan-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl">Re-Sync Academy</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-4 lg:p-8">
      <div className="flex justify-center mb-6">
        <div className="px-4 py-1 bg-cyan-500/5 border border-cyan-500/10 rounded-full">
          <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest">Context: {initialSubject}</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-6">
        {messages.length === 0 && (
          <div className="glass p-6 rounded-3xl border-white/5 max-w-[90%]">
            <p className="text-sm font-medium text-slate-300">Welcome, Dr. Aspirant. Ask me anything about <span className="text-cyan-400">{initialSubject}</span>.</p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-3xl ${m.role === 'user' ? 'bg-cyan-600 text-white' : 'glass text-slate-200 border-white/5'}`}>
              <div className="text-sm font-medium leading-relaxed">{m.content}</div>
              {m.role === 'model' && sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                  {sources.map((s, idx) => (
                    <a key={idx} href={s.uri} target="_blank" className="text-[9px] font-black text-slate-500 uppercase hover:text-cyan-400">Ref: {s.title || 'Source'}</a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-[10px] font-black text-cyan-500 uppercase tracking-widest animate-pulse ml-4">Analyzing Data...</div>}
      </div>

      <div className="mt-4 sticky bottom-0">
        <div className="glass p-2 rounded-3xl flex items-center gap-2 border-white/10">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Clinical query..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-600 px-4 text-sm font-medium"
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()} className="w-10 h-10 rounded-2xl bg-cyan-600 flex items-center justify-center disabled:opacity-20"><i className="fas fa-arrow-up text-white text-xs"></i></button>
        </div>
      </div>
    </div>
  );
};

export default PulseAI;
