import React from 'react';
import { sound } from '../utils/audio';

interface FooterProps {
  onOpen404: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpen404 }) => {
  return (
    <footer className="w-full bg-[#08080a] border-t border-[#181b24] py-12 text-zinc-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#0e1017] border border-[#232735] flex items-center justify-center">
            <span className="text-[#00ff88] font-mono text-xs font-bold">&gt;_</span>
          </div>
          <span className="font-display font-bold text-sm tracking-wider text-white">
            TERMIART
          </span>
          <span className="text-[10px] font-mono text-zinc-600">v2.0</span>
        </div>

        <div className="text-xs font-mono text-center sm:text-left">
          <span>Client-Side Terminal Art Platform • </span>
          <span className="text-[#00ff88]">Your image never leaves your device</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <button
            onClick={() => {
              sound.playClick();
              onOpen404();
            }}
            className="hover:text-zinc-300 transition-colors"
          >
            404 View
          </button>
          <span>•</span>
          <a
            href="https://github.com/suvendukungfu/termiart-"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#00ff88] transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};
