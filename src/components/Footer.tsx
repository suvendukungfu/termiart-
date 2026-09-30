import React from 'react';
import { sound } from '../utils/audio';

interface FooterProps {
  onOpen404: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpen404 }) => {
  return (
    <footer className="w-full bg-[#05070c] border-t border-[#141824] py-12 text-zinc-500 relative">
      <div className="numeric-grid-bg absolute inset-0 opacity-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-[#00ff88] font-mono text-[10px] font-bold">&gt;</span>
          </div>
          <span className="font-display font-bold text-xs tracking-wider text-white">
            TERMIART
          </span>
          <span className="text-[10px] font-mono text-zinc-600">// v2.4</span>
        </div>

        <div className="text-xs font-mono text-center sm:text-left text-zinc-400">
          <span>Client-Side Generative Terminal Engine • </span>
          <span className="text-white/80">Zero Cloud Upload</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <button
            onClick={() => {
              sound.playClick();
              onOpen404();
            }}
            className="hover:text-white transition-colors"
          >
            //404
          </button>
          <span className="text-zinc-700">•</span>
          <a
            href="https://github.com/suvendukungfu/termiart-"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <span>GitHub</span>
            <span className="text-xs">↗</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
