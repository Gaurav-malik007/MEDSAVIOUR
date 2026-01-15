
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../utils/audio-utils.ts';

const ClinicalLive: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  
  const audioContextRef = useRef<any>(null);
  const outputContextRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<any>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const transcriptionRef = useRef<string[]>([]);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx({ sampleRate: 16000 });
      outputContextRef.current = new AudioCtx({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            const source = audioContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e: any) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current.destination);
          },
          onmessage: async (message) => {
            if (message.serverContent?.outputTranscription) {
              transcriptionRef.current = [...transcriptionRef.current, `Mentor: ${message.serverContent.outputTranscription.text}`];
              setTranscription([...transcriptionRef.current]);
            }
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputContextRef.current) {
              const ctx = outputContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onclose: () => setIsActive(false),
          onerror: (e) => console.error(e)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } },
          systemInstruction: 'You are Senior Consultant Zephyr. Conduct a Ward Round style interaction for an MBBS student. Be professional and challenging.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (error) {
      console.error(error);
      setIsConnecting(false);
      alert("Microphone access is required for voice rounds.");
    }
  };

  const stopSession = () => {
    sessionPromiseRef.current?.then(s => s.close());
    audioContextRef.current?.close();
    outputContextRef.current?.close();
    setIsActive(false);
  };

  return (
    <div className="h-full flex flex-col p-8 lg:p-12 max-w-4xl mx-auto space-y-12">
      <div className="flex-1 flex flex-col items-center justify-center space-y-12 text-center">
        <div className={`w-64 h-64 rounded-full flex items-center justify-center transition-all duration-700 bg-emerald-500/5 border border-white/5 ${
            isActive ? 'scale-110 shadow-[0_0_80px_rgba(16,185,129,0.1)] ring-2 ring-emerald-500/20' : ''
          }`}>
             {isActive ? (
               <div className="flex items-end gap-1.5 h-12">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-1 bg-emerald-400 rounded-full animate-pulse" style={{ height: `${30 + Math.random() * 70}%` }}></div>
                  ))}
               </div>
             ) : <i className="fas fa-user-md text-6xl text-slate-800"></i>}
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-black italic">Consultant <span className="text-emerald-400">Zephyr</span></h2>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">Voice-active clinical reasoning rounds. Practice your case presentations live.</p>
        </div>

        <button
          onClick={isActive ? stopSession : startSession}
          disabled={isConnecting}
          className={`px-12 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all ${
            isActive ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
          }`}
        >
          {isConnecting ? 'Connecting...' : isActive ? 'End Rounds' : 'Start Rounds'}
        </button>
      </div>

      <div className="glass rounded-[2rem] p-6 h-32 overflow-y-auto border-white/5 font-mono text-[10px] text-slate-500 italic">
        {transcription.length === 0 ? "// Waiting for voice interaction..." : transcription.slice(-2).map((t, i) => <div key={i} className="mb-1">{t}</div>)}
      </div>
    </div>
  );
};

export default ClinicalLive;
