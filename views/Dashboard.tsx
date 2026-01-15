
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Subject } from '../types.ts';

interface DashboardProps {
  subject: Subject;
}

const Dashboard: React.FC<DashboardProps> = ({ subject }) => {
  const [caseText, setCaseText] = useState("Loading clinical data...");
  const [isLoadingCase, setIsLoadingCase] = useState(true);

  const fetchCase = async () => {
    setIsLoadingCase(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a ultra-short clinical vignette for ${subject}. Just the case presentation, max 20 words. High-yield.`,
        config: { temperature: 0.8 }
      });
      setCaseText(response.text || "Diagnostic data unavailable.");
    } catch (e) {
      setCaseText("Patient presents with classic clinical findings. Advise on management.");
    } finally {
      setIsLoadingCase(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [subject]);

  const stats = [
    { label: 'MCQs Solved', value: '4,120', icon: 'fa-check-double', color: 'text-blue-400' },
    { label: 'Global Rank', value: '#1,284', icon: 'fa-medal', color: 'text-amber-400' },
    { label: 'Weakness', value: 'Cardiology', icon: 'fa-heart-pulse', color: 'text-rose-400' },
    { label: 'Daily Goal', value: '85%', icon: 'fa-bullseye', color: 'text-emerald-400' },
  ];

  return (
    <div className="h-full overflow-y-auto p-8 lg:p-12 space-y-10 custom-scrollbar">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tighter">Welcome back, <span className="text-cyan-400">Future Consultant</span></h2>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Targeting: NEET-PG / INI-CET 2025</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="glass p-6 rounded-3xl border-white/5 shadow-xl hover:bg-white/[0.02] transition-all group">
            <div className="flex justify-between items-center mb-4">
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${s.color}`}>
                <i className={`fas ${s.icon}`}></i>
              </div>
              <i className="fas fa-arrow-right text-[10px] text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"></i>
            </div>
            <p className="text-2xl font-black mb-1">{s.value}</p>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass rounded-[2.5rem] p-8 border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black">Subject Proficiency</h3>
            <button onClick={fetchCase} className="text-[10px] font-black uppercase text-cyan-400 hover:underline">Refresh Strategy</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-6">
              {[
                { label: 'Pathology', val: 92, color: 'bg-emerald-500' },
                { label: 'Physiology', val: 78, color: 'bg-blue-500' },
                { label: 'Anatomy', val: 65, color: 'bg-amber-500' },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>{item.label}</span>
                    <span>{item.val}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="glass bg-white/[0.02] p-6 rounded-[2rem] border-white/5 flex flex-col justify-center text-center">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Priority Focus</p>
              <h4 className="text-lg font-black text-slate-200">Pharmacokinetics</h4>
              <p className="text-[10px] text-slate-500 mt-2 font-medium">Predicted high weightage in upcoming INI-CET rounds.</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-[2.5rem] p-8 border-white/5 bg-gradient-to-br from-cyan-500/10 to-transparent flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
             <i className="fas fa-stethoscope text-[15rem]"></i>
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6">
              <i className="fas fa-bolt-lightning text-cyan-400"></i>
            </div>
            <h3 className="text-2xl font-black mb-4 leading-tight">Vignette of the Day</h3>
            <div className="min-h-[100px]">
              {isLoadingCase ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 bg-slate-800 rounded-full w-3/4"></div>
                  <div className="h-3 bg-slate-800 rounded-full w-1/2"></div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 leading-relaxed italic font-medium">"{caseText}"</p>
              )}
            </div>
          </div>
          <button className="relative z-10 w-full py-4 medical-gradient rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-cyan-500/20 active:scale-95 transition-all mt-6">
            ENTER CLINICAL VAULT
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
