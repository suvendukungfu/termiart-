import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Terminal, Compass, Palette, Upload } from 'lucide-react';
import { sound } from '../utils/audio';

interface NavbarProps {
  currentTab: 'home' | 'create' | 'explore' | 'presets' | '404';
  setCurrentTab: (tab: 'home' | 'create' | 'explore' | 'presets' | '404') => void;
  onOpenUpload?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenUpload }) => {
  const [muted, setMuted] = useState(sound.isMuted());

  const handleToggleSound = () => {
    const isNowEnabled = sound.toggleMute();
    setMuted(!isNowEnabled);
  };

  const navItemClass = (tab: typeof currentTab) =>
    `px-3 py-1.5 rounded-lg text-xs font-mono tracking-wide transition-all flex items-center gap-1.5 ${
      currentTab === tab
        ? 'bg-[#181a24] text-[#00ff88] border border-[#272a38] shadow-[0_0_15px_rgba(0,255,136,0.15)]'
        : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#12141c]'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full bg-[#08080a]/85 backdrop-blur-md border-b border-[#181b24]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => {
            sound.playClick();
            setCurrentTab('home');
          }}
          className="flex items-center gap-2 group text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-[#0e1017] border border-[#232735] flex items-center justify-center group-hover:border-[#00ff88]/50 transition-colors shadow-inner">
            <span className="text-[#00ff88] font-mono text-sm font-bold">&gt;_</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm tracking-wider text-white group-hover:text-[#00ff88] transition-colors">
              TERMIART
            </span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none">
              ENGINE v2.0
            </span>
          </div>
        </button>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setCurrentTab('home');
            }}
            className={navItemClass('home')}
          >
            <span className="hidden sm:inline">Home</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setCurrentTab('create');
            }}
            className={navItemClass('create')}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Studio</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setCurrentTab('explore');
            }}
            className={navItemClass('explore')}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setCurrentTab('presets');
            }}
            className={navItemClass('presets')}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Presets</span>
          </button>
        </nav>

        {/* Actions & Sound Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            title={muted ? 'Unmute tactical audio' : 'Mute tactical audio'}
            aria-label={muted ? 'Unmute tactical audio' : 'Mute tactical audio'}
            className="w-8 h-8 rounded-lg bg-[#0e1017] border border-[#232735] flex items-center justify-center text-zinc-400 hover:text-[#00ff88] hover:border-[#2f3547] transition-all"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#00ff88]" />}
          </button>

          {onOpenUpload && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenUpload();
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#00ff88] text-black font-mono text-xs font-bold rounded-lg hover:bg-[#33ff9f] transition-all shadow-[0_0_15px_rgba(0,255,136,0.25)] active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>DROP IMAGE</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
