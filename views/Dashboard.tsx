
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

const Dashboard: React.FC = () => {
  const [caseText, setCaseText] = useState("Loading today's high-yield case...");
  const [isLoadingCase, setIsLoadingCase] = useState(true);

  const fetchCase = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Generate a very short 2-sentence clinical case vignette for a medical student dashboard. Make it challenging and high-yield.',
        config: { temperature: 1 }
      });
      setCaseText(response.text || "Ready for rounds?");
    } catch (e) {
      setCaseText("Patient presenting with classic findings. Ready for rounds?");
    } finally {
      setIsLoadingCase(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, []);

  const stats = [
    { label: 'Total MCQs', value: '1,284', icon: 'fa-check-double', color: 'text-blue-400' },
    { label: 'Accuracy', value: '72%', icon: 'fa-bullseye', color: 'text-emerald-400' },
    { label: 'Current Streak', value: '14 Days', icon: 'fa-fire', color: 'text-amber-500' },
    { label: 'Avg Time/Q', value: '45s', icon: 'fa-clock', color: 'text-purple-400' },
  ];

  return (
    <div className="h-full overflow-y-auto p-8 lg:p-12 space-y-10 custom-scrollbar">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tighter">Welcome back, <span className="text-cyan-400">Dr. Aspirant</span></h2>
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">AI Clinical Sync: Online</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="glass p-6 rounded-3xl border-white/5 shadow-xl hover:border-white/10 transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${s.color}`}>
                <i className={`fas ${s.icon}`}></i>
              </div>
              <span className="text-[10px] font-bold text-emerald-400">+5% vs last week</span>
            </div>
            <p className="text-2xl font-black mb-1">{s.value}</p>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass rounded-[2.5rem] p-8 border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black">Performance Breakdown</h3>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded bg-blue-500"></span>
              <span className="text-[10px] font-bold text-slate-500">Weak Topics</span>
            </div>
          </div>
          <div className="space-y-6">
            {[
              { subject: 'Pathology', progress: 85, color: 'bg-blue-500' },
              { subject: 'Pharmacology', progress: 40, color: 'bg-rose-500' },
              { subject: 'General Medicine', progress: 65, color: 'bg-cyan-500' },
              { subject: 'Surgery', progress: 20, color: 'bg-emerald-500' },
            ].map((sub, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-500">{sub.subject}</span>
                  <span className="text-slate-400">{sub.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
                  <div className={`h-full ${sub.color} transition-all duration-1000`} style={{ width: `${sub.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-[2.5rem] p-8 border-white/5 bg-gradient-to-br from-cyan-500/5 to-transparent flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
             <i className="fas fa-stethoscope text-9xl"></i>
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6">
              <i className="fas fa-bolt-lightning text-cyan-400"></i>
            </div>
            <h3 className="text-2xl font-black mb-4 leading-tight italic">Case of the Hour</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 font-medium">
              {isLoadingCase ? "Syncing clinical data..." : `"${caseText}"`}
            </p>
          </div>
          <button className="relative z-10 w-full py-4 medical-gradient rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all">
            SOLVE IN VAULT
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
