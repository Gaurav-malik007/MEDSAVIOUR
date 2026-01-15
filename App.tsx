
import React, { useState } from 'react';
import { ViewType } from './types.ts';
import Dashboard from './views/Dashboard.tsx';
import PulseAI from './views/PulseAI.tsx';
import MediVis from './views/MediVis.tsx';
import Vault from './views/Vault.tsx';
import NeuroCards from './views/NeuroCards.tsx';
import ClinicalLive from './views/ClinicalLive.tsx';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>(ViewType.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { id: ViewType.DASHBOARD, icon: 'fa-house-medical', label: 'Dashboard', desc: 'Study Hub', color: 'text-white' },
    { id: ViewType.PULSE_AI, icon: 'fa-brain-circuit', label: 'Pulse AI', desc: 'Case Solver', color: 'text-cyan-400' },
    { id: ViewType.LIVE_CONSULTANT, icon: 'fa-phone-volume', label: 'Live Mentor', desc: 'Voice Rounds', color: 'text-emerald-400' },
    { id: ViewType.MEDIVIS, icon: 'fa-microscope', label: 'MediVis', desc: 'Visual Learner', color: 'text-purple-400' },
    { id: ViewType.VAULT, icon: 'fa-book-medical', label: 'The Vault', desc: 'QBank 2.0', color: 'text-blue-400' },
    { id: ViewType.NEUROCARDS, icon: 'fa-bolt-lightning', label: 'NeuroCards', desc: 'Active Recall', color: 'text-amber-400' },
  ];

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`glass flex flex-col transition-all duration-500 z-50 ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl medical-gradient flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
            <i className="fas fa-stethoscope text-white text-xl"></i>
          </div>
          {isSidebarOpen && (
            <div>
              <h1 className="font-bold text-xl tracking-tighter leading-none">MED<span className="text-cyan-400">SAVIOUR</span></h1>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Clinical Academy</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
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
           <div className="glass p-4 rounded-2xl flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                <i className="fas fa-user text-xs text-slate-400"></i>
              </div>
              {isSidebarOpen && (
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate">Aspirant_2025</p>
                  <p className="text-[10px] text-emerald-400 font-bold">PRO ACCOUNT</p>
                </div>
              )}
           </div>
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
             <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                   <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                      {String.fromCharCode(64 + i)}
                   </div>
                ))}
             </div>
             <div className="h-10 w-[1px] bg-white/5"></div>
             <button className="text-xs font-bold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all">
                Sync Progress
             </button>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-950/20 via-transparent to-transparent">
          {activeView === ViewType.DASHBOARD && <Dashboard />}
          {activeView === ViewType.PULSE_AI && <PulseAI />}
          {activeView === ViewType.MEDIVIS && <MediVis />}
          {activeView === ViewType.VAULT && <Vault />}
          {activeView === ViewType.NEUROCARDS && <NeuroCards />}
          {activeView === ViewType.LIVE_CONSULTANT && <ClinicalLive />}
        </div>
      </main>
    </div>
  );
};

export default App;
