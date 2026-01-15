
import React, { useState } from 'react';
import { ViewType, Subject } from './types.ts';
import Dashboard from './views/Dashboard.tsx';
import PulseAI from './views/PulseAI.tsx';
import MediVis from './views/MediVis.tsx';
import Vault from './views/Vault.tsx';
import NeuroCards from './views/NeuroCards.tsx';
import ClinicalLive from './views/ClinicalLive.tsx';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>(ViewType.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [globalSubject, setGlobalSubject] = useState<Subject>(Subject.PATHOLOGY);

  const navItems = [
    { id: ViewType.DASHBOARD, icon: 'fa-house-medical', label: 'Dashboard', desc: 'Strategy Center', color: 'text-white' },
    { id: ViewType.PULSE_AI, icon: 'fa-brain-circuit', label: 'Pulse AI', desc: 'Clinical Brain', color: 'text-cyan-400' },
    { id: ViewType.LIVE_CONSULTANT, icon: 'fa-phone-volume', label: 'Live Mentor', desc: 'Voice Rounds', color: 'text-emerald-400' },
    { id: ViewType.MEDIVIS, icon: 'fa-microscope', label: 'MediVis', desc: 'Visual Anatomy', color: 'text-purple-400' },
    { id: ViewType.VAULT, icon: 'fa-book-medical', label: 'The Vault', desc: 'Adaptive QBank', color: 'text-blue-400' },
    { id: ViewType.NEUROCARDS, icon: 'fa-bolt-lightning', label: 'NeuroCards', desc: 'Flash Recall', color: 'text-amber-400' },
  ];

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`glass flex flex-col transition-all duration-500 z-50 ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl medical-gradient flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
            <i className="fas fa-user-md text-white text-xl"></i>
          </div>
          {isSidebarOpen && (
            <div>
              <h1 className="font-bold text-xl tracking-tighter leading-none">MED<span className="text-cyan-400">SAVIOUR</span></h1>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">PRO ACADEMY</span>
            </div>
          )}
        </div>

        <div className="px-6 mb-4">
          {isSidebarOpen && (
            <div className="glass p-3 rounded-2xl border-cyan-500/20">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Current Context</p>
              <select 
                value={globalSubject}
                onChange={(e) => setGlobalSubject(e.target.value as Subject)}
                className="w-full bg-slate-900 border-none rounded-lg py-1 px-2 text-xs font-bold text-cyan-400 outline-none cursor-pointer"
              >
                {Object.values(Subject).filter(s => s !== Subject.ALL).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
                activeView === item.id 
                ? 'bg-cyan-500/10 text-white border border-cyan-500/20 shadow-xl shadow-cyan-500/5' 
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
              }`}
            >
              <i className={`fas ${item.icon} text-xl w-6 ${activeView === item.id ? item.color : 'group-hover:' + item.color}`}></i>
              {isSidebarOpen && (
                <div className="text-left">
                  <p className="font-bold text-sm">{item.label}</p>
                  <p className="text-[10px] opacity-50 font-medium">{item.desc}</p>
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full p-2 rounded-xl hover:bg-white/5 transition-colors text-slate-600 flex items-center justify-center"
          >
            <i className={`fas ${isSidebarOpen ? 'fa-angle-left' : 'fa-angle-right'}`}></i>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col overflow-hidden">
        <header className="h-20 flex items-center px-10 justify-between bg-slate-950/20 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
              Module / {navItems.find(i => i.id === activeView)?.label}
            </span>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <i className="fas fa-fire text-emerald-400 text-xs"></i>
                <span className="text-xs font-black text-emerald-400">14 DAY STREAK</span>
             </div>
             <div className="h-8 w-[1px] bg-white/5"></div>
             <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-cyan-400">
                DR
             </div>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-950/10 via-transparent to-transparent">
          {activeView === ViewType.DASHBOARD && <Dashboard subject={globalSubject} />}
          {activeView === ViewType.PULSE_AI && <PulseAI initialSubject={globalSubject} />}
          {activeView === ViewType.MEDIVIS && <MediVis initialSubject={globalSubject} />}
          {activeView === ViewType.VAULT && <Vault initialSubject={globalSubject} />}
          {activeView === ViewType.NEUROCARDS && <NeuroCards initialSubject={globalSubject} />}
          {activeView === ViewType.LIVE_CONSULTANT && <ClinicalLive />}
        </div>
      </main>
    </div>
  );
};

export default App;
