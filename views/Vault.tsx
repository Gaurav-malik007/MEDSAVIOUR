
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Question, Subject } from '../types.ts';

const Vault: React.FC = () => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [currentSubject, setCurrentSubject] = useState<Subject>(Subject.PATHOLOGY);

  const fetchQuestion = async () => {
    setIsLoading(true);
    setSelected(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a high-yield clinical MCQ for NEET-PG/INI-CET on the subject: ${currentSubject}. 
                  Focus on clinical integration and multi-system pathology.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              text: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                minItems: 4,
                maxItems: 4
              },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              difficulty: { type: Type.STRING }
            },
            required: ["subject", "text", "options", "correctIndex", "explanation", "difficulty"]
          }
        }
      });

      const data = JSON.parse(response.text);
      setQuestion(data);
    } catch (e) {
      console.error("Failed to fetch MCQ", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [currentSubject]);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === question?.correctIndex) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    }
    setScore(prev => ({ ...prev, total: prev.total + 1 }));
  };

  return (
    <div className="h-full p-6 lg:p-10 max-w-4xl mx-auto flex flex-col">
      <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">The <span className="text-blue-400">Vault</span></h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Active QBank Session</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={currentSubject}
            onChange={(e) => setCurrentSubject(e.target.value as Subject)}
            className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-slate-300 focus:ring-0 outline-none"
          >
            {Object.values(Subject).filter(s => s !== Subject.ALL).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="glass px-4 py-2 rounded-xl border-white/5 flex items-center gap-3">
             <span className="text-[10px] font-black text-slate-500">SCORE</span>
             <span className="text-sm font-black text-emerald-400">{score.correct}/{score.total}</span>
          </div>
        </div>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="h-96 glass rounded-[2.5rem] flex flex-col items-center justify-center gap-4 border-dashed border-blue-500/20">
             <div className="w-12 h-12 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
             <p className="text-xs font-black text-blue-500 animate-pulse tracking-widest">EXTRACTING HIGH-YIELD DATA...</p>
          </div>
        ) : question && (
          <div className="glass p-8 lg:p-12 rounded-[2.5rem] border-white/10 shadow-2xl animate-in fade-in zoom-in duration-500">
            <div className="flex items-center gap-2 mb-8">
               <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-black rounded-lg uppercase tracking-widest border border-blue-500/20">
                 {question.difficulty}
               </span>
               <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{question.subject}</span>
            </div>

            <p className="text-xl leading-relaxed font-bold mb-10 text-slate-100">{question.text}</p>
            
            <div className="grid gap-4">
              {question.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                    selected === null 
                      ? 'border-white/5 bg-white/5 hover:border-blue-500/30 hover:bg-blue-500/5' 
                      : idx === question.correctIndex
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                        : selected === idx 
                          ? 'border-rose-500/50 bg-rose-500/10 text-rose-400'
                          : 'border-white/5 opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      selected === idx ? 'bg-white/10' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-bold text-sm">{opt}</span>
                  </div>
                  {selected !== null && idx === question.correctIndex && <i className="fas fa-check-circle"></i>}
                  {selected === idx && idx !== question.correctIndex && <i className="fas fa-circle-xmark"></i>}
                </button>
              ))}
            </div>

            {selected !== null && (
              <div className="mt-10 p-8 rounded-3xl bg-blue-500/5 border border-blue-500/10 animate-in slide-in-from-top-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <i className="fas fa-microscope text-blue-400 text-xs"></i>
                  </div>
                  <h4 className="font-black text-xs uppercase tracking-[0.2em] text-blue-400">Clinical Insight</h4>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">{question.explanation}</p>
                <button 
                  onClick={fetchQuestion}
                  className="mt-8 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-900/40 transition-all flex items-center justify-center gap-2"
                >
                  Next Question <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Vault;
