
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Subject } from '../types.ts';

interface DashboardProps {
  subject: Subject;
}

const Dashboard: React.FC<DashboardProps> = ({ subject }) => {
  const [caseText, setCaseText] = useState("Awaiting clinical sync...");
  const [isLoadingCase, setIsLoadingCase] = useState(true);
  const [isApiHealthy, setIsApiHealthy] = useState<boolean | null>(null);

  const fetchCase = async () => {
    setIsLoadingCase(true);
    try {
      // Create instance inside to ensure it gets injected env vars correctly
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide a 15-word high-yield clinical case vignette for ${subject}.`,
        config: { temperature: 0.9 }
      });
      setCaseText(response.text || "Diagnostic stream interrupted.");
      setIsApiHealthy(true);
    } catch (e) {
      console.error("Dashboard Sync Error:", e);
      setCaseText("Connection to Clinical Core unavailable. Verify Environment Configuration.");
      setIsApiHealthy(false);
    } finally {
      setIsLoadingCase(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [subject]);

  const vitals = [
    { label: 'AI Diagnostic Core', status: isApiHealthy === null ? 'SYNCING' : isApiHealthy ? 'ONLINE' : 'OFFLINE', color: isApiHealthy ? 'text-emerald-400' : 'text-rose-400' },
    { label: 'Cloud Database', status: 'STABLE', color: 'text-emerald-400' },
    { label: 'Grounding Engine', status: 'READY', color: 'text-cyan-400' },
  ];

  return (
    <div className="h-full overflow-y-auto p-8 lg:p-12 space-y-10 custom-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black tracking-tighter">Dr. <span className="text-cyan-400">Aspirant's</span> HQ</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            NEET-PG / INI-CET 2025 Prediction Engine
          </p>
        </div>
        
        <div className="glass px-6 py-4 rounded-2xl flex gap-8 border-white/5">
          {vitals.map((v, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{v.label}</span>
              <span className={`text-[10px] font-black ${v.color}`}>{v.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'QBank Progress', value: '4,120', sub: '+12 today', icon: 'fa-check-double', color: 'text-blue-400' },
          { label: 'Flashcard Mastery', value: '88%', sub: 'Advanced', icon: 'fa-bolt', color: 'text-amber-400' },
          { label: 'Clinical Accuracy', value: '72%', sub: 'Pathology Focus', icon: 'fa-stethoscope', color: 'text-emerald-400' },
          { label: 'Study Hours', value: '142h', sub: 'This month', icon: 'fa-clock', color: 'text-purple-400' },
        ].map((s, idx) => (
          <div key={idx} className="glass p-6 rounded-3xl border-white/5 shadow-xl hover:border-cyan-500/20 transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${s.color}`}>
                <i className={`fas ${s.icon}`}></i>
              </div>
              <span className="text-[10px] font-black text-slate-600 uppercase">{s.sub}</span>
            </div>
            <p className="text-2xl font-black mb-1">{s.value}</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        <div className="lg:col-span-2 glass rounded-[2.5rem] p-8 border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black italic">Performance Analytics</h3>
            <div className="flex gap-4">
              <span className="text-[10px] font-black text-slate-500 uppercase">Trend: Upward</span>
            </div>
          </div>
          <div className="space-y-6">
            {[
              { label: 'Anatomy', val: 45, color: 'bg-rose-500' },
              { label: 'Physiology', val: 75, color: 'bg-emerald-500' },
              { label: 'Biochemistry', val: 60, color: 'bg-blue-500' },
              { label: 'Pathology', val: 90, color: 'bg-cyan-500' },
            ].map((sub, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>{sub.label}</span>
                  <span>{sub.val}% Accuracy</span>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${sub.color} transition-all duration-1000`} style={{ width: `${sub.val}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-[2.5rem] p-8 border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent flex flex-col justify-between group relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6">
              <i className="fas fa-user-doctor text-emerald-400"></i>
            </div>
            <h3 className="text-2xl font-black mb-4 leading-tight italic">Case Challenge</h3>
            <div className="min-h-[100px]">
              {isLoadingCase ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-2 bg-slate-800 rounded w-full"></div>
                  <div className="h-2 bg-slate-800 rounded w-5/6"></div>
                  <div className="h-2 bg-slate-800 rounded w-4/6"></div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 leading-relaxed font-medium italic">"{caseText}"</p>
              )}
            </div>
          </div>
          <button 
            onClick={fetchCase}
            className="relative z-10 w-full py-4 medical-gradient rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all mt-6"
          >
            REFRESH CLINICAL DATA
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
