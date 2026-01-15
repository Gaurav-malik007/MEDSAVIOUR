
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Flashcard, Subject } from '../types.ts';

const NeuroCards: React.FC = () => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState<Subject>(Subject.PHARMACOLOGY);

  const generateCards = async () => {
    setIsLoading(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate 5 high-yield "Spaced Repetition" flashcards for NEET-PG aspirants on the subject: ${subject}. 
                  The 'front' should be a question or concept, and 'back' should be a concise, one-sentence high-yield fact.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING },
                back: { type: Type.STRING },
                subject: { type: Type.STRING },
                highYieldPoint: { type: Type.STRING }
              },
              required: ["front", "back", "subject", "highYieldPoint"]
            }
          }
        }
      });
      setCards(JSON.parse(response.text));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateCards();
  }, [subject]);

  return (
    <div className="h-full flex flex-col items-center p-8 lg:p-12 space-y-12">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black tracking-tighter italic">Neuro<span className="text-amber-400">Cards</span></h2>
        <div className="flex items-center justify-center gap-4">
          <select 
            value={subject}
            onChange={(e) => setSubject(e.target.value as Subject)}
            className="bg-transparent border-none text-slate-500 font-bold text-xs uppercase tracking-widest focus:ring-0 cursor-pointer hover:text-amber-400 transition-colors"
          >
            {Object.values(Subject).filter(s => s !== Subject.ALL).map(s => (
              <option key={s} value={s} className="bg-slate-900">{s}</option>
            ))}
          </select>
          <div className="h-1 w-1 rounded-full bg-slate-700"></div>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
            {cards.length > 0 ? `${currentIndex + 1} / ${cards.length}` : '0 / 0'}
          </span>
        </div>
      </div>

      <div className="w-full max-w-lg flex flex-col gap-10">
        {isLoading ? (
          <div className="aspect-[4/3] glass rounded-[3rem] flex flex-col items-center justify-center gap-4 border-dashed border-amber-500/20">
             <div className="w-10 h-10 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin"></div>
             <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Synapsing neurons...</p>
          </div>
        ) : cards.length > 0 && (
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="aspect-[4/3] w-full cursor-pointer [perspective:1000px] group"
          >
            <div className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
              {/* Front */}
              <div className="absolute inset-0 glass rounded-[3rem] p-12 flex flex-col items-center justify-center text-center border-white/5 shadow-2xl [backface-visibility:hidden]">
                 <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-6 px-3 py-1 bg-amber-500/10 rounded-lg">
                   {cards[currentIndex].subject}
                 </span>
                 <p className="text-2xl font-black leading-tight text-slate-100">{cards[currentIndex].front}</p>
                 <div className="absolute bottom-10 flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                    <i className="fas fa-repeat"></i> Click to flip
                 </div>
              </div>
              {/* Back */}
              <div className="absolute inset-0 medical-gradient rounded-[3rem] p-12 flex flex-col items-center justify-center text-center text-white [transform:rotateY(180deg)] [backface-visibility:hidden] shadow-2xl shadow-emerald-500/20">
                 <p className="text-xl font-bold leading-relaxed">{cards[currentIndex].back}</p>
                 <div className="mt-8 pt-8 border-t border-white/20 w-full">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">High-Yield Pearl</p>
                    <p className="text-sm font-medium italic">"{cards[currentIndex].highYieldPoint}"</p>
                 </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center px-4">
           <button 
             onClick={() => {
                setCurrentIndex(prev => Math.max(0, prev - 1));
                setIsFlipped(false);
             }}
             disabled={currentIndex === 0}
             className="w-14 h-14 rounded-full glass border-white/5 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-20 transition-all"
           >
             <i className="fas fa-chevron-left"></i>
           </button>
           
           <div className="flex gap-2">
             <button onClick={generateCards} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                Shuffle Deck
             </button>
           </div>

           <button 
             onClick={() => {
                if (currentIndex < cards.length - 1) {
                  setCurrentIndex(prev => prev + 1);
                  setIsFlipped(false);
                }
             }}
             disabled={currentIndex === cards.length - 1}
             className="w-14 h-14 rounded-full medical-gradient flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 disabled:opacity-20 transition-all"
           >
             <i className="fas fa-chevron-right"></i>
           </button>
        </div>
      </div>
    </div>
  );
};

export default NeuroCards;
