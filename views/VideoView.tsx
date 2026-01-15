
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { GeneratedVideo } from '../types.ts';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Restore 'readonly' modifier to match global environment declarations and avoid modifier mismatch error
    readonly aistudio: AIStudio;
  }
}

const VideoView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isKeySelected, setIsKeySelected] = useState(false);
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    checkKeyStatus();
  }, []);

  const checkKeyStatus = async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setIsKeySelected(hasKey);
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setIsKeySelected(true);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setStatusMessage('Initiating video sequence...');

    try {
      // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key from the dialog.
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
        // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
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
      // Reset the key selection state if the request fails with "Requested entity was not found."
      if (error.message?.includes('Requested entity was not found')) {
        setIsKeySelected(false);
        alert("API Key session expired. Please re-select your key.");
      } else {
        alert("Video generation failed. Ensure your selected API key has Veo access.");
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
          <p className="text-slate-400 leading-relaxed">
            Generating video with Veo requires a specific paid API key. Please select a project from your Google AI Studio account.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleSelectKey}
              className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-2xl shadow-xl shadow-pink-500/20 transition-all"
            >
              Select API Key
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              className="text-xs text-slate-500 hover:underline"
            >
              Learn more about billing & quotas
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div className="glass p-6 rounded-3xl space-y-4 shadow-2xl">
        <div className="flex flex-col gap-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A cinematic drone shot of a neon-lit cyberpunk city in the rain..."
            className="w-full h-20 bg-slate-900/50 border border-white/10 rounded-2xl p-4 text-slate-100 placeholder-slate-600 focus:border-pink-500/50 ring-0 resize-none"
          />
          <div className="flex justify-between items-center">
             <div className="flex gap-4 text-xs font-medium text-slate-500">
               <span className="flex items-center gap-1"><i className="fas fa-check-circle text-green-500"></i> 720p HD</span>
               <span className="flex items-center gap-1"><i className="fas fa-check-circle text-green-500"></i> Cinematic 16:9</span>
             </div>
             <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-8 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 rounded-2xl text-sm font-bold shadow-xl shadow-pink-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i>
                  Generating...
                </>
              ) : (
                <>
                  <i className="fas fa-film"></i>
                  Create Video
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isGenerating && (
          <div className="glass rounded-3xl p-12 flex flex-col items-center justify-center space-y-6 mb-8 border-dashed border-pink-500/30">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
              <i className="fas fa-clapperboard absolute inset-0 flex items-center justify-center text-pink-400"></i>
            </div>
            <div className="text-center">
               <h3 className="font-bold text-lg text-slate-200">{statusMessage}</h3>
               <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">This usually takes 1-2 minutes</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
          {videos.map((vid) => (
            <div key={vid.id} className="glass rounded-3xl overflow-hidden shadow-2xl border-white/5 flex flex-col">
              <video 
                src={vid.url} 
                controls 
                className="w-full aspect-video bg-black"
                poster="https://picsum.photos/1280/720?blur=5"
              />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <p className="text-sm text-slate-300 line-clamp-2 italic">"{vid.prompt}"</p>
                <div className="mt-4 flex justify-between items-center border-t border-white/5 pt-4">
                   <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Veo Generation</span>
                   <a 
                    href={vid.url} 
                    download={`veo-video-${vid.id}.mp4`}
                    className="text-pink-400 hover:text-pink-300 text-sm font-bold"
                   >
                     Download MP4
                   </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoView;
