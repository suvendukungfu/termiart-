import React from 'react';
import { sound } from '../utils/audio';

interface Cinematic404Props {
  onBackToHome: () => void;
}

export const Cinematic404: React.FC<Cinematic404Props> = ({ onBackToHome }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#08080a] text-white flex flex-col justify-between p-8 sm:p-12 md:p-16 select-none overflow-hidden">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between">
        {/* Original TermiArt Mark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0e1017] border border-[#232735] flex items-center justify-center">
            <span className="text-[#00ff88] font-mono text-sm font-bold">&gt;_</span>
          </div>
          <span className="font-display font-bold text-sm tracking-wider text-white">
            TERMIART
          </span>
        </div>

        <div className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase">
          ERR_404_PAGE_NOT_FOUND
        </div>
      </div>

      {/* Center Cinematic 404 Composition */}
      <div className="flex flex-col items-center justify-center text-center my-auto">
        <div className="font-mono-term text-[90px] sm:text-[140px] md:text-[200px] lg:text-[260px] font-semibold leading-none tracking-tighter text-white drop-shadow-[0_0_80px_rgba(255,255,255,0.08)] select-none">
          404
        </div>

        <div className="w-12 h-[1px] bg-zinc-700 my-6 sm:my-8" />

        <p className="font-sans text-xs sm:text-sm md:text-base text-zinc-400 max-w-md font-normal leading-relaxed">
          The path may be broken, but the journey isn't. Let's get you back.
        </p>

        <button
          onClick={() => {
            sound.playClick();
            onBackToHome();
          }}
          className="mt-8 px-6 py-2.5 rounded-lg bg-[#141620] hover:bg-[#1e2230] border border-[#272b3c] hover:border-[#00ff88]/50 text-white font-mono text-xs font-semibold tracking-wider transition-all active:scale-95 shadow-lg"
        >
          RETURN TO HOME
        </button>
      </div>

      {/* Bottom Minimal Technical Status */}
      <div className="w-full flex items-center justify-between text-[10px] font-mono text-zinc-600">
        <div>SYS_STATUS: READY</div>
        <div>TERMINAL ART INSTRUMENT</div>
      </div>
    </div>
  );
};
