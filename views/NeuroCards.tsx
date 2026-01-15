
import React from 'react';

const NeuroCards: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-10">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black mb-2 tracking-tighter">Neuro<span className="text-amber-400">Cards</span></h2>
        <p className="text-slate-500 font-medium">Spaced Repetition fact-checking for NEET-PG High Yields.</p>
      </div>

      <div className="w-[500px] h-[350px] group [perspective:1000px]">
        <div className="relative h-full w-full rounded-[3rem] shadow-2xl transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] cursor-pointer">
          {/* Front */}
          <div className="absolute inset-0 glass rounded-[3rem] p-12 flex flex-col items-center justify-center text-center border-white/10 border-b-4 border-b-amber-500/40">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4">Pharmacology</span>
            <p className="text-2xl font-bold leading-tight">Mechanism of action of Warfarin?</p>
            <div className="absolute bottom-10 text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">Hover to reveal</div>
          </div>
          {/* Back */}
          <div className="absolute inset-0 h-full w-full rounded-[3rem] medical-gradient p-12 flex flex-col items-center justify-center text-center text-white [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <p className="text-xl font-bold">Inhibits Vitamin K Epoxide Reductase (VKOR), preventing activation of clotting factors II, VII, IX, and X.</p>
            <div className="mt-8 flex gap-4">
               <button className="px-4 py-2 bg-white/10 rounded-full text-[10px] font-bold hover:bg-white/20">AGAIN</button>
               <button className="px-4 py-2 bg-white/10 rounded-full text-[10px] font-bold hover:bg-white/20">HARD</button>
               <button className="px-4 py-2 bg-white/10 rounded-full text-[10px] font-bold hover:bg-white/20">GOOD</button>
               <button className="px-4 py-2 bg-white/10 rounded-full text-[10px] font-bold hover:bg-white/20">EASY</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuroCards;
