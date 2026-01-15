
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { GeneratedVideo } from '../types.ts';

const VideoView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isKeySelected, setIsKeySelected] = useState(false);
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const aistudio = (window as any).aistudio;

  useEffect(() => {
    checkKeyStatus();
  }, []);

  const checkKeyStatus = async () => {
    if (aistudio) {
      const hasKey = await aistudio.hasSelectedApiKey();
      setIsKeySelected(hasKey);
    }
  };

  const handleSelectKey = async () => {
    if (aistudio) {
      await aistudio.openSelectKey();
      setIsKeySelected(true);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setStatusMessage('Initiating video sequence...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      setStatusMessage('Directing AI actors...');
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
        setStatusMessage(prev => prev === 'Directing AI actors...' ? 'Rendering cinematic frames...' : 'Polishing visuals...');
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const videoBlob = await response.blob();
        const videoUrl = URL.createObjectURL(videoBlob);

        setVideos(prev => [{
          id: Date.now().toString(),
          url: videoUrl,
          prompt,
          timestamp: Date.now()
        }, ...prev]);
        setPrompt('');
      }
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('Requested entity was not found')) {
        setIsKeySelected(false);
      } else {
        alert("Generation failed. Check your API key limits.");
      }
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  if (!isKeySelected) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 bg-pink-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-key text-3xl text-pink-400"></i>
          </div>
          <h2 className="text-2xl font-bold">Veo Access Required</h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Generating medical video simulations with Veo requires a specific paid project key from Google AI Studio.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleSelectKey}
              className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-2xl shadow-xl shadow-pink-500/20 transition-all"
            >
              Select Project Key
            </button>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[10px] text-slate-500 hover:underline uppercase tracking-widest font-bold">
              View Billing Setup
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div className="glass p-6 rounded-3xl space-y-4 shadow-2xl border-white/5">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe a clinical procedure or anatomical animation..."
          className="w-full h-20 bg-slate-900/50 border border-white/10 rounded-2xl p-4 text-slate-100 placeholder-slate-600 focus:border-pink-500/50 ring-0 resize-none"
        />
        <div className="flex justify-between items-center">
           <div className="flex gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
             <span>HD 720p</span>
             <span>16:9 Cinema</span>
           </div>
           <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="px-8 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-pink-500/20 transition-all disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Create Simulation'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isGenerating && (
          <div className="glass rounded-3xl p-12 flex flex-col items-center justify-center space-y-4 border-dashed border-pink-500/30 mb-8">
            <div className="w-10 h-10 border-4 border-pink-500/10 border-t-pink-500 rounded-full animate-spin"></div>
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-widest">{statusMessage}</h3>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
          {videos.map((vid) => (
            <div key={vid.id} className="glass rounded-3xl overflow-hidden shadow-2xl border-white/5 flex flex-col">
              <video src={vid.url} controls className="w-full aspect-video bg-black" />
              <div className="p-5">
                <p className="text-xs text-slate-400 italic">"{vid.prompt}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoView;
