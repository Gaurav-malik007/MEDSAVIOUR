
import React from 'react';

const Dashboard: React.FC = () => {
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
        <p className="text-slate-500 font-medium">NEET-PG Exam: <span className="text-rose-400 font-bold">142 Days to go</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="glass p-6 rounded-3xl border-white/5 shadow-xl hover:border-white/10 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${s.color}`}>
                <i className={`fas ${s.icon}`}></i>
              </div>
              <span className="text-[10px] font-bold text-emerald-400">+5% vs last week</span>
            </div>
            <p className="text-2xl font-black mb-1">{s.value}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass rounded-[2.5rem] p-8 border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Performance Breakdown</h3>
            <button className="text-xs font-bold text-cyan-400 hover:underline">Full Analysis</button>
          </div>
          <div className="space-y-6">
            {[
              { subject: 'Pathology', progress: 85, color: 'bg-blue-500' },
              { subject: 'Pharmacology', progress: 40, color: 'bg-rose-500' },
              { subject: 'Medicine', progress: 65, color: 'bg-cyan-500' },
              { subject: 'Surgery', progress: 20, color: 'bg-emerald-500' },
            ].map((sub, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-slate-400">{sub.subject}</span>
                  <span>{sub.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${sub.color} transition-all duration-1000`} style={{ width: `${sub.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-[2.5rem] p-8 border-white/5 bg-gradient-to-br from-cyan-500/5 to-transparent flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6">
              <i className="fas fa-lightbulb text-cyan-400 text-xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-4 leading-tight">Case of the Hour</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 italic">
              "A 30-year-old female presents with episodic palpitations, tremors, and excessive sweating. Her blood pressure is 180/110 mmHg. What's the most likely high-yield diagnosis?"
            </p>
          </div>
          <button className="w-full py-4 medical-gradient rounded-2xl font-bold text-sm shadow-xl shadow-cyan-500/20 hover:scale-[1.02] transition-transform">
            SOLVE NOW
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
