
import React, { useState } from 'react';

const Vault: React.FC = () => {
  const [selected, setSelected] = useState<number | null>(null);
  
  const sampleQ = {
    subject: "Pathology",
    text: "A 45-year-old male presents with a long-standing history of hypertension. A renal biopsy reveals homogenous, pink, glassy thickening of the walls of the arterioles. Which of the following is the most likely diagnosis?",
    options: [
      "Hyaline arteriolosclerosis",
      "Hyperplastic arteriolosclerosis",
      "Monckeberg medial sclerosis",
      "Fibromuscular dysplasia"
    ],
    correct: 0
  };

  return (
    <div className="h-full p-10 max-w-4xl mx-auto">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Daily <span className="text-blue-400">Vault</span></h2>
          <p className="text-slate-500 text-sm">Subject: {sampleQ.subject} • QID #8921</p>
        </div>
        <div className="flex gap-2">
           <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold border border-blue-500/20">STREAK: 12 DAYS</span>
        </div>
      </div>

      <div className="glass p-10 rounded-[2.5rem] border-white/10 shadow-2xl relative">
        <p className="text-lg leading-relaxed font-medium mb-10 text-slate-200">{sampleQ.text}</p>
        
        <div className="space-y-4">
          {sampleQ.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setSelected(idx)}
              className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between group ${
                selected === idx 
                ? (idx === sampleQ.correct ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-rose-500/10 border-rose-500/40') 
                : 'clinical-card text-slate-400'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                  selected === idx ? 'bg-white/10' : 'bg-slate-800 text-slate-500'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="font-semibold text-sm">{opt}</span>
              </div>
              {selected === idx && (
                <i className={`fas ${idx === sampleQ.correct ? 'fa-check text-emerald-400' : 'fa-xmark text-rose-400'}`}></i>
              )}
            </button>
          ))}
        </div>

        {selected !== null && (
           <div className="mt-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-2 text-blue-400">
                <i className="fas fa-circle-info text-xs"></i>
                <span className="text-[10px] font-bold uppercase tracking-widest">Explaination Insight</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                {sampleQ.options[sampleQ.correct]} is correct because long-standing benign hypertension leads to protein leakage across the endothelium and increased matrix synthesis, appearing as "hyaline" under microscopy.
              </p>
           </div>
        )}
      </div>
    </div>
  );
};

export default Vault;
