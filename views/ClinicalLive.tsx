
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../utils/audio-utils.ts';

const ClinicalLive: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const transcriptionRef = useRef<string[]>([]);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
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
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are Consultant Zephyr, a world-class clinical mentor. Discuss patient cases, ask diagnostic questions, and help students reason through differential diagnoses using voice interaction.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (error) {
      console.error(error);
      setIsConnecting(false);
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
        <div className="relative">
          <div className={`w-64 h-64 rounded-full flex items-center justify-center transition-all duration-700 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-white/5 ${
            isActive ? 'scale-110 shadow-[0_0_80px_rgba(16,185,129,0.2)]' : ''
          }`}>
             {isActive ? (
               <div className="flex items-end gap-1.5 h-12">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-1.5 bg-emerald-400 rounded-full animate-waveform" style={{ animationDelay: `${i * 0.1}s`, height: `${20 + Math.random() * 80}%` }}></div>
                  ))}
               </div>
             ) : (
               <i className="fas fa-user-md text-6xl text-slate-700"></i>
             )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-black">Consultant <span className="text-emerald-400">Zephyr</span></h2>
          <p className="text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
            Start a hands-free clinical round. Discuss complex syndromes or verify your diagnostic reasoning verbally.
          </p>
        </div>

        <button
          onClick={isActive ? stopSession : startSession}
          disabled={isConnecting}
          className={`px-12 py-5 rounded-3xl font-bold text-lg shadow-2xl transition-all flex items-center gap-4 ${
            isActive ? 'bg-rose-600 text-white shadow-rose-900/20' : 'bg-emerald-600 text-white shadow-emerald-900/20'
          }`}
        >
          {isConnecting ? <i className="fas fa-spinner fa-spin"></i> : isActive ? <><i className="fas fa-phone-slash"></i> End Rounds</> : <><i className="fas fa-phone"></i> Start Clinical Rounds</>}
        </button>
      </div>

      <div className="glass rounded-[2rem] p-6 h-48 overflow-y-auto border-white/5 font-medium text-slate-400 text-sm italic">
        {transcription.length === 0 ? "Transcript will appear as you speak..." : transcription.slice(-5).map((t, i) => <div key={i} className="mb-2">{t}</div>)}
      </div>
    </div>
  );
};

export default ClinicalLive;
