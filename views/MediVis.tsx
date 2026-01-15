
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

const MediVis: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);

  const handleForge = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `High-quality medical illustration, anatomical diagram style, professional medical textbook quality, 4k: ${prompt}` }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part?.inlineData) setGeneratedImg(`data:image/png;base64,${part.inlineData.data}`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 max-w-6xl mx-auto gap-8">
      <div className="glass p-8 rounded-[2rem] border-white/5 shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">Medi<span className="text-emerald-400">Vis</span> Visualizer</h2>
        <p className="text-slate-500 text-sm mb-6">Convert complex descriptions into high-yield medical diagrams.</p>
        
        <div className="flex gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Cross section of the heart showing mitral valve stenosis..."
            className="flex-1 bg-slate-900/80 border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium focus:border-emerald-500/30 ring-0 transition-all"
          />
          <button
            onClick={handleForge}
            disabled={isGenerating || !prompt.trim()}
            className="px-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-900/20 transition-all disabled:opacity-30 flex items-center gap-2"
          >
            {isGenerating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
            Visualize
          </button>
        </div>
      </div>

      <div className="flex-1 glass rounded-[2.5rem] overflow-hidden relative flex items-center justify-center border-dashed border-emerald-500/20 bg-emerald-500/[0.02]">
        {generatedImg ? (
          <div className="w-full h-full p-4">
             <img src={generatedImg} alt="Medical Diagram" className="w-full h-full object-contain rounded-3xl" />
             <div className="absolute bottom-8 right-8 flex gap-2">
                <button className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all">
                   <i className="fas fa-download"></i>
                </button>
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 opacity-20">
            <i className="fas fa-lungs text-8xl"></i>
            <p className="font-bold uppercase tracking-widest text-sm">Waiting for visual request</p>
          </div>
        )}
        
        {isGenerating && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md flex flex-col items-center justify-center gap-6">
             <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
             <p className="text-emerald-400 font-bold tracking-widest animate-pulse">RENDERING ANATOMY...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediVis;
