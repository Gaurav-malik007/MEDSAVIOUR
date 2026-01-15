
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { GeneratedImage } from '../types.ts';

const ImageView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          }
        }
      });

      let foundImageUrl = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          foundImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (foundImageUrl) {
        setImages(prev => [{
          id: Date.now().toString(),
          url: foundImageUrl,
          prompt,
          timestamp: Date.now()
        }, ...prev]);
        setPrompt('');
      }
    } catch (error) {
      console.error(error);
      alert("Error generating image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div className="glass p-6 rounded-3xl space-y-4 shadow-2xl border-white/5">
        <div className="flex flex-col gap-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to create in detail..."
            className="w-full h-24 bg-slate-900/50 border border-white/10 rounded-2xl p-4 text-slate-100 placeholder-slate-600 focus:border-indigo-500/50 ring-0 resize-none transition-all"
          />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase">Aspect Ratio</span>
              <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/5">
                {['1:1', '4:3', '16:9', '9:16'].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-3 py-1 text-xs rounded-lg transition-all ${
                      aspectRatio === ratio 
                        ? 'bg-indigo-600 text-white shadow-lg' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl text-sm font-bold shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center gap-2 group"
            >
              {isGenerating ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i>
                  Generating...
                </>
              ) : (
                <>
                  <i className="fas fa-wand-magic-sparkles"></i>
                  Forge Image
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {images.length === 0 && !isGenerating ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-40 space-y-4 py-20">
            <i className="fas fa-images text-6xl"></i>
            <p className="font-medium">No images generated yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
            {isGenerating && (
              <div className="aspect-square glass rounded-3xl flex items-center justify-center border-dashed border-indigo-500/30 bg-indigo-500/5 animate-pulse">
                <div className="text-indigo-400 flex flex-col items-center gap-3">
                  <i className="fas fa-sparkles text-2xl animate-spin-slow"></i>
                  <span className="text-sm font-bold uppercase tracking-widest">Processing...</span>
                </div>
              </div>
            )}
            {images.map((img) => (
              <div key={img.id} className="group relative glass rounded-3xl overflow-hidden shadow-xl border-white/5 aspect-square">
                <img src={img.url} alt={img.prompt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                  <p className="text-sm text-white line-clamp-2 mb-4 font-medium leading-relaxed">{img.prompt}</p>
                  <div className="flex gap-2">
                    <button 
                       onClick={() => {
                         const link = document.createElement('a');
                         link.href = img.url;
                         link.download = `gemini-gen-${img.id}.png`;
                         link.click();
                       }}
                       className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white transition-colors"
                    >
                      <i className="fas fa-download"></i>
                    </button>
                    <button className="flex-1 py-2.5 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-wider">
                      Edit Prompt
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageView;
