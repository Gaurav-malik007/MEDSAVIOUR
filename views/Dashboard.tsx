
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide a 15-word clinical case vignette for ${subject}. High-yield for NEET-PG.`,
        config: { temperature: 0.8 }
      });
      setCaseText(response.text || "Diagnostic stream interrupted.");
      setIsApiHealthy(true);
    } catch (e) {
      console.error("Dashboard Sync Error:", e);
      setCaseText("System offline. Please check your Pro subscription or environment settings.");
      setIsApiHealthy(false);
    } finally {
      setIsLoadingCase(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [subject]);

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-12 space-y-10 custom-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-4xl font-black tracking-tighter italic">DR. <span className="text-cyan-400">ASPIRANT</span></h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            NEET-PG 2025 Prediction Core
          </p>
        </div>
        
        <div className="glass px-6 py-4 rounded-2xl flex gap-10 border-white/5">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">AI Brain</span>
            <span className={`text-[10px] font-black ${isApiHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isApiHealthy === null ? 'SYNCING...' : isApiHealthy ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Database</span>
            <span className="text-[10px] font-black text-cyan-400">STABLE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'QBank Rank', value: '#1,240', sub: 'Top 2%', icon: 'fa-trophy', color: 'text-amber-400' },
          { label: 'High-Yield Mastery', value: '82%', sub: 'Target 90%', icon: 'fa-bolt', color: 'text-cyan-400' },
          { label: 'Weak Areas', value: '4', sub: 'Needs Review', icon: 'fa-heart-crack', color: 'text-rose-400' },
          { label: 'Study Streak', value: '14d', sub: 'Consistent', icon: 'fa-fire', color: 'text-orange-400' },
        ].map((s, idx) => (
          <div key={idx} className="glass p-6 rounded-[2rem] border-white/5 shadow-xl hover:translate-y-[-4px] transition-all cursor-pointer group">
            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 ${s.color}`}>
              <i className={`fas ${s.icon} text-lg`}></i>
            </div>
            <p className="text-2xl font-black mb-1 italic">{s.value}</p>
            <div className="flex justify-between items-center">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
               <span className="text-[8px] font-black text-slate-600 uppercase">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        <div className="lg:col-span-2 glass rounded-[2.5rem] p-8 border-white/5 relative overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black italic">Subject Performance</h3>
            <span className="text-[10px] font-black text-slate-600 uppercase">Real-time Analytics</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
            {[
              { label: 'Path', val: 92, color: 'from-cyan-500' },
              { label: 'Pharm', val: 78, color: 'from-purple-500' },
              { label: 'Micro', val: 65, color: 'from-rose-500' },
              { label: 'Med', val: 84, color: 'from-emerald-500' },
            ].map((sub, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl border border-white/5">
                <div className="relative w-20 h-20 flex items-center justify-center mb-4">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="36" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/>
                    <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="6" strokeDasharray={226} strokeDashoffset={226 - (226 * sub.val) / 100} className={`text-cyan-500 transition-all duration-1000`}/>
                  </svg>
                  <span className="absolute text-sm font-black">{sub.val}%</span>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{sub.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-[2.5rem] p-8 border-white/5 bg-gradient-to-br from-cyan-500/5 to-transparent flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6">
              <i className="fas fa-stethoscope text-cyan-400"></i>
            </div>
            <h3 className="text-2xl font-black mb-4 italic">High-Yield Case</h3>
            <div className="min-h-[120px]">
              {isLoadingCase ? (
                <div className="space-y-4">
                  <div className="h-2 bg-slate-800 rounded w-full animate-pulse"></div>
                  <div className="h-2 bg-slate-800 rounded w-4/5 animate-pulse"></div>
                  <div className="h-2 bg-slate-800 rounded w-3/5 animate-pulse"></div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 leading-relaxed font-medium italic">"{caseText}"</p>
              )}
            </div>
          </div>
          <button 
            onClick={fetchCase}
            className="w-full py-4 medical-gradient rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all mt-8"
          >
            REFRESH CLINICAL DATA
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
