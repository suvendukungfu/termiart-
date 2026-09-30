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
  // Numeric coordinate sky matrix data matching Kernel Code reference
  const coordinateRows = [
    '90 94 97 98 97 94 89 84 76 69 59 50 41 32 24 16 11 6 4 3 3 6 11 16 24 32 41 50 59 69 76 84 89 94 97 98',
    '93 97 98 98 96 93 88 81 74 66 57 48 40 32 20 15 8 5 4 4 5 8 11 12 15 19 24 29 38 46 55 64 73 82 89 95',
    '94 96 95 93 89 84 78 70 62 53 45 38 31 25 17 12 7 5 5 6 7 9 11 14 17 21 26 30 39 49 58 68 77 85 91 96',
    '92 92 89 85 80 75 68 59 51 43 36 31 26 20 14 9 7 6 6 8 10 13 16 20 26 30 34 39 46 54 63 71 80 87 91 93',
    '89 87 84 80 76 70 64 56 48 40 33 27 22 17 12 8 7 8 9 12 15 20 25 31 37 42 46 49 53 58 66 73 80 85 88 89',
    '84 82 79 75 70 65 59 51 43 36 29 23 18 13 9 9 11 14 18 24 31 38 44 49 53 55 57 58 60 64 69 74 78 81 83 84',
    '78 76 73 69 65 60 53 46 39 32 26 20 15 12 12 15 20 28 36 44 49 52 53 53 53 54 55 56 58 61 65 69 72 74 76 77',
  ];

  return (
    <section className="relative w-full min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#07090e] border-b border-[#141824]">
      {/* 1. Ambient Numeric Coordinate Sky (Kernel Code signature) */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-25">
        <div className="numeric-grid-bg absolute inset-0 opacity-40" />
        <div className="font-mono text-[11px] sm:text-[12px] text-zinc-400 tracking-[0.28em] sm:tracking-[0.45em] leading-[2.2] sm:leading-[2.6] whitespace-nowrap pl-4 sm:pl-8 pt-4 sm:pt-6 opacity-60">
          {coordinateRows.map((row, idx) => (
            <div key={idx} className="flex justify-between w-[120%] -ml-4">
              <span>{row}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Horizon Dune Warm Atmospheric Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-96 dune-glow pointer-events-none" />
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-t from-amber-950/20 via-orange-900/10 to-transparent blur-[100px] pointer-events-none" />

      {/* 3. Center Floating Voxel / Terminal Canvas Art Piece */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 flex-1 flex flex-col justify-center items-center">
        {/* Top subtle status indicator */}
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a0d14]/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-ping" />
          <span className="text-zinc-300 font-semibold">// CLIENT ENGINE</span>
          <span className="text-zinc-600">•</span>
          <span>ZERO PYTHON RUNTIME</span>
        </div>

        {/* 3D Floating Terminal Display Stage */}
        <div className="w-full transition-all duration-500 transform hover:scale-[1.008] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] rounded-xl border border-white/10 bg-[#06080d]/90 backdrop-blur-md overflow-hidden">
          <TerminalDisplay
            artifact={artifact}
            isLoading={isLoading}
            onCopyQuick={onCopyQuick}
          />
        </div>
      </div>

      {/* 4. Bottom Hero Content: Dual-Texture Headline & Editorial Column */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 pb-12 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          {/* Left Column: Big Dual-Texture Headline (Kernel Code signature) */}
          <div className="lg:col-span-7">
            <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-[76px] tracking-tight leading-[0.98] text-white">
              <span className="block drop-shadow-sm">TURN ANY IMAGE</span>
              <span className="block text-dotted mt-1 tracking-tight">
                INTO TERMINAL ART
              </span>
            </h1>
          </div>

          {/* Right Column: Editorial Paragraph + Action CTAs */}
          <div className="lg:col-span-5 flex flex-col items-start lg:items-end justify-between gap-5 text-left lg:text-right">
            <p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed max-w-md">
              High-fidelity ASCII, block, braille, and Unicode generative art rendered 100% in-browser. Pick a mood, tune the parameters, and let the terminal do the rest.
            </p>

            {/* Pill Action Buttons with Diagonal Arrows (Kernel Code style) */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                onClick={() => {
                  sound.playClick();
                  onDropImageClick();
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 font-mono text-xs font-bold tracking-wider active:scale-95 transition-all shadow-[0_0_25px_rgba(255,255,255,0.25)]"
              >
                <span className="text-sm leading-none">↗</span>
                <span>DROP IMAGE</span>
              </button>

              <button
                onClick={() => {
                  sound.playShift();
                  onSurpriseMe();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#121622]/90 hover:bg-[#1b2133] border border-white/10 hover:border-amber-400/50 text-zinc-200 hover:text-amber-300 font-mono text-xs font-semibold active:scale-95 transition-all"
              >
                <span className="text-sm leading-none text-amber-400">↗</span>
                <span>SURPRISE ME</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onTryDemo();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#121622]/90 hover:bg-[#1b2133] border border-white/10 hover:border-[#00ff88]/50 text-zinc-200 hover:text-white font-mono text-xs font-semibold active:scale-95 transition-all"
              >
                <span className="text-sm leading-none text-[#00ff88]">↗</span>
                <span>TRY DEMO</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenStudio();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border border-white/10 hover:border-white/30 text-zinc-400 hover:text-white font-mono text-xs font-semibold active:scale-95 transition-all"
              >
                <span>STUDIO</span>
                <span className="text-xs">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
