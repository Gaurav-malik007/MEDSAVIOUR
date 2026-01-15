
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../utils/audio-utils';

const LiveView: React.FC = () => {
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
      // Create a new GoogleGenAI instance right before making an API call
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Live session opened');
            setIsActive(true);
            setIsConnecting(false);
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              // CRITICAL: Solely rely on sessionPromise resolves to send realtime input and avoid stale closures.
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message) => {
            // Handle Transcription
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              transcriptionRef.current = [...transcriptionRef.current, `Gemini: ${text}`];
              setTranscription([...transcriptionRef.current]);
            } else if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              transcriptionRef.current = [...transcriptionRef.current, `You: ${text}`];
              setTranscription([...transcriptionRef.current]);
            }

            // Handle Audio output using raw PCM decoding logic
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputContextRef.current) {
              const ctx = outputContextRef.current;
              // Schedule each new audio chunk to start at nextStartTime for smooth playback
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error('Live API Error:', e),
          onclose: () => {
            console.log('Live session closed');
            setIsActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: 'You are a friendly, concise, and helpful voice assistant. Keep answers brief for voice interaction.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });

      sessionPromiseRef.current = sessionPromise;
    } catch (error) {
      console.error(error);
      setIsConnecting(false);
      alert("Failed to start voice session. Please ensure microphone access is granted.");
    }
  };

  const stopSession = () => {
    // Release resources by closing the session and audio contexts
    sessionPromiseRef.current?.then(session => {
      session.close();
    });
    sessionPromiseRef.current = null;
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputContextRef.current) {
      outputContextRef.current.close();
      outputContextRef.current = null;
    }
    setIsActive(false);
  };

  return (
    <div className="h-full flex flex-col p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        <div className="relative">
          <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 bg-gradient-to-br from-green-500/20 to-emerald-600/20 ring-1 ring-white/10 ${
            isActive ? 'scale-110 shadow-[0_0_50px_rgba(16,185,129,0.3)]' : ''
          }`}>
            <div className={`w-32 h-32 rounded-full bg-slate-900 flex items-center justify-center border-2 border-white/5 ${
              isActive ? 'animate-pulse' : ''
            }`}>
              <i className={`fas ${isActive ? 'fa-waveform-lines' : 'fa-microphone'} text-5xl ${
                isActive ? 'text-green-400' : 'text-slate-600'
              }`}></i>
            </div>
            
            {/* Pulsing rings when active */}
            {isActive && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-green-500/30 animate-ping opacity-75"></div>
                <div className="absolute -inset-4 rounded-full border-2 border-green-500/10 animate-ping opacity-50 [animation-delay:0.5s]"></div>
              </>
            )}
          </div>
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            {isActive ? 'Gemini is listening...' : isConnecting ? 'Connecting...' : 'Real-time Voice Chat'}
          </h2>
          <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
            {isActive 
              ? 'Have a natural, low-latency conversation with Gemini. Speak freely.' 
              : 'Talk to Gemini as if you were on a phone call. Experience next-gen AI responsiveness.'}
          </p>
        </div>

        <button
          onClick={isActive ? stopSession : startSession}
          disabled={isConnecting}
          className={`px-12 py-5 rounded-3xl font-bold text-lg shadow-2xl transition-all flex items-center gap-3 ${
            isActive 
              ? 'bg-rose-600 hover:bg-rose-500 text-white' 
              : 'bg-green-600 hover:bg-green-500 text-white'
          } disabled:opacity-50`}
        >
          {isConnecting ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : isActive ? (
            <>
              <i className="fas fa-phone-slash"></i>
              End Conversation
            </>
          ) : (
            <>
              <i className="fas fa-phone"></i>
              Start Talking
            </>
          )}
        </button>
      </div>

      {/* Live Transcription Panel */}
      <div className="glass rounded-3xl p-6 h-64 flex flex-col border-white/5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Transcription</span>
          <div className="flex gap-1">
             <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-slate-700'}`}></div>
             <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500/60' : 'bg-slate-700'}`}></div>
             <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500/30' : 'bg-slate-700'}`}></div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 font-mono text-sm pr-2">
          {transcription.length === 0 ? (
            <p className="text-slate-700 italic">Conversational transcript will appear here...</p>
          ) : (
            transcription.slice(-10).map((line, idx) => (
              <div key={idx} className={line.startsWith('You:') ? 'text-indigo-400' : 'text-slate-300'}>
                {line}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveView;
