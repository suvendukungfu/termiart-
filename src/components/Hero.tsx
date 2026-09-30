import React, { useRef } from 'react';
import { TerminalDisplay } from './TerminalDisplay';
import { TerminalArtifact } from '../engine/types';
import { sound } from '../utils/audio';
import { Upload, Dices, Play, Sparkles, ArrowRight } from 'lucide-react';

interface HeroProps {
  artifact: TerminalArtifact | null;
  isLoading: boolean;
  onDropImageClick: () => void;
  onSurpriseMe: () => void;
  onTryDemo: () => void;
  onOpenStudio: () => void;
  onCopyQuick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  artifact,
  isLoading,
  onDropImageClick,
  onSurpriseMe,
  onTryDemo,
  onOpenStudio,
  onCopyQuick,
}) => {
  return (
    <section className="relative w-full pt-8 pb-16 flex flex-col items-center justify-center overflow-hidden">
      {/* Subtle ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#00ff88]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex flex-col items-center">
        {/* Technical Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12141c] border border-[#232735] text-[11px] font-mono text-zinc-400 mb-6 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-ping" />
          <span className="text-zinc-300 font-semibold">100% IN-BROWSER</span>
          <span className="text-zinc-600">•</span>
          <span>ZERO PYTHON RUNTIME NEEDED</span>
        </div>

        {/* Main Hero Typography */}
        <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-center text-white leading-[1.05] max-w-4xl">
          TURN ANY IMAGE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] via-cyan-400 to-[#bf5af2]">
            INTO TERMINAL ART.
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base md:text-lg text-zinc-400 text-center max-w-xl font-normal leading-relaxed">
          Upload an image. Pick a mood. Let the terminal do the rest.
        </p>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => {
              sound.playClick();
              onDropImageClick();
            }}
            className="px-6 py-3 rounded-xl bg-[#00ff88] text-black font-mono text-xs sm:text-sm font-bold tracking-wider hover:bg-[#33ff9f] active:scale-95 transition-all shadow-[0_0_25px_rgba(0,255,136,0.35)] flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-black" />
            <span>DROP IMAGE</span>
          </button>

          <button
            onClick={() => {
              sound.playShift();
              onSurpriseMe();
            }}
            className="px-5 py-3 rounded-xl bg-[#12141c] border border-[#262b3a] hover:border-amber-400/60 text-zinc-200 hover:text-amber-300 font-mono text-xs sm:text-sm font-semibold active:scale-95 transition-all flex items-center gap-2"
          >
            <Dices className="w-4 h-4 text-amber-400" />
            <span>SURPRISE ME</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onTryDemo();
            }}
            className="px-5 py-3 rounded-xl bg-[#12141c] border border-[#262b3a] hover:border-[#00ff88]/50 text-zinc-300 hover:text-white font-mono text-xs sm:text-sm font-semibold active:scale-95 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#00ff88]" />
            <span>TRY DEMO</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenStudio();
            }}
            className="px-5 py-3 rounded-xl bg-transparent border border-zinc-700 hover:border-zinc-400 text-zinc-400 hover:text-white font-mono text-xs sm:text-sm font-semibold active:scale-95 transition-all flex items-center gap-2"
          >
            <span>STUDIO</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Artwork - The Primary Visual Object */}
        <div className="mt-12 w-full max-w-5xl">
          <TerminalDisplay
            artifact={artifact}
            isLoading={isLoading}
            onCopyQuick={onCopyQuick}
          />
        </div>
      </div>
    </section>
  );
};
