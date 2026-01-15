
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Message } from '../types.ts';

const PulseAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', content: "Dr. Aspirant, I'm Pulse AI. Give me a clinical scenario, a pathology concept, or a drug mechanism, and let's break it down together.", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [...messages, userMessage].map(m => ({ role: m.role, parts: [{ text: m.content }] })),
        config: {
          systemInstruction: "You are Pulse AI, a senior medical consultant for MBBS students and NEET-PG aspirants. Your goal is to explain medical concepts using pathophysiology, high-yield clinical pearls, and memorable mnemonics. Always prioritize evidence-based medicine and simplify complex mechanisms (e.g., the RAAS system or coagulation cascade).",
          temperature: 0.8,
          thinkingConfig: { thinkingBudget: 2000 }
        }
      });

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
            <div className={`max-w-[80%] p-6 rounded-3xl ${
              m.role === 'user' 
                ? 'bg-cyan-600 text-white rounded-tr-none shadow-xl shadow-cyan-900/20' 
                : 'glass text-slate-200 rounded-tl-none border-white/10 shadow-2xl'
            }`}>
              {m.role === 'model' && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded bg-cyan-500/20 flex items-center justify-center">
                    <i className="fas fa-brain text-[10px] text-cyan-400"></i>
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">Pulse AI Consultant</span>
                </div>
              )}
              <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{m.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="glass px-6 py-4 rounded-3xl rounded-tl-none flex items-center gap-3">
               <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
               </div>
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reasoning...</span>
             </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="glass p-3 rounded-3xl flex items-center gap-3 shadow-2xl ring-1 ring-white/5 border-white/5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe a clinical symptom or ask a mechanism..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-600 px-5 text-sm font-medium"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-12 h-12 rounded-2xl bg-cyan-600 hover:bg-cyan-500 transition-all flex items-center justify-center disabled:opacity-30 shadow-lg shadow-cyan-600/20"
          >
            <i className="fas fa-arrow-up text-white"></i>
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-600 mt-4 uppercase tracking-widest font-bold">
          AI generated explanations should be cross-referenced with Standard Textbooks (Harrison/Bailey & Love).
        </p>
      </div>
    </div>
  );
};

export default PulseAI;
