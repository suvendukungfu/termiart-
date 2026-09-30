import React from 'react';
import { sound } from '../utils/audio';

interface Cinematic404Props {
  onBackToHome: () => void;
}

export const Cinematic404: React.FC<Cinematic404Props> = ({ onBackToHome }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#050507] text-white flex flex-col justify-between p-8 sm:p-12 md:p-16 select-none overflow-hidden">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between">
        {/* Original TermiArt Mark */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#0b0c10] border border-[#1f232e] flex items-center justify-center">
            <span className="text-[#00ff88] font-mono text-xs font-bold">&gt;_</span>
          </div>
          <span className="font-display font-bold text-sm tracking-widest text-white">
            TERMIART
          </span>
        </div>

        <div className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">
          ERR_404_SIGNAL_LOST
        </div>
      </div>

      {/* Center Cinematic 404 Composition */}
      <div className="flex flex-col items-center justify-center text-center my-auto">
        <div className="font-mono-term text-[110px] sm:text-[160px] md:text-[220px] lg:text-[280px] font-semibold leading-none tracking-tighter text-white drop-shadow-[0_0_90px_rgba(255,255,255,0.06)] select-none">
          404
        </div>

        <div className="w-12 h-px bg-zinc-800 my-6 sm:my-8" />

        <div className="font-mono font-bold text-xs sm:text-sm md:text-base text-zinc-300 tracking-widest uppercase leading-relaxed max-w-md">
          THE SIGNAL GOT LOST. <br />
          <span className="text-[#00ff88]">THE ART DIDN'T.</span>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onBackToHome();
          }}
          className="mt-8 px-6 py-2.5 rounded-lg bg-[#0e1017] hover:bg-[#161824] border border-[#232735] hover:border-[#00ff88]/60 text-white font-mono text-xs font-semibold tracking-widest uppercase transition-all active:scale-95 shadow-lg"
        >
          RETURN TO TERMINAL
        </button>
      </div>

      {/* Bottom Minimal Technical Status */}
      <div className="w-full flex items-center justify-between text-[10px] font-mono text-zinc-600">
        <div>SYS_RECOVERY: READY</div>
        <div>TERMINAL ART INSTRUMENT</div>
      </div>
    </div>
  );
};
