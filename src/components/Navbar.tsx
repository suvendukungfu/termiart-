import React, { useState } from 'react';
import { Volume2, VolumeX, Dices } from 'lucide-react';
import { sound } from '../utils/audio';

interface NavbarProps {
  currentTab: 'home' | 'create' | 'explore' | 'presets' | '404';
  setCurrentTab: (tab: 'home' | 'create' | 'explore' | 'presets' | '404') => void;
  onRandomize?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onRandomize,
}) => {
  const [muted, setMuted] = useState(sound.isMuted());

  const handleToggleSound = () => {
    const isNowEnabled = sound.toggleMute();
    setMuted(!isNowEnabled);
  };

  const navLinkClass = (tab: typeof currentTab) =>
    `px-3 py-1 text-xs font-mono tracking-wider transition-all rounded-full ${
      currentTab === tab
        ? 'bg-white/10 text-white font-bold'
        : 'text-zinc-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <header className="sticky top-3 z-50 w-full px-4 sm:px-6 pointer-events-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 pointer-events-auto">
        {/* Left: Brand Badge */}
        <button
          onClick={() => {
            sound.playClick();
            setCurrentTab('home');
          }}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0a0d14]/80 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all group"
        >
          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#00ff88]/20 transition-colors">
            <span className="text-[#00ff88] font-mono text-[10px] font-bold">&gt;</span>
          </div>
          <span className="font-display font-bold text-xs tracking-wider text-white">
            TERMIART
          </span>
          <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">// v2.4</span>
        </button>

        {/* Center: Kernel-Code Floating Nav Pill */}
        <nav className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#0a0d14]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <button
            onClick={() => {
              sound.playClick();
              setCurrentTab('home');
            }}
            className={navLinkClass('home')}
          >
            //Home
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setCurrentTab('create');
            }}
            className={navLinkClass('create')}
          >
            //Studio
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setCurrentTab('explore');
            }}
            className={navLinkClass('explore')}
          >
            //Explore
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setCurrentTab('presets');
            }}
            className={navLinkClass('presets')}
          >
            //Presets
          </button>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {onRandomize && (
            <button
              onClick={() => {
                sound.playShift();
                onRandomize();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-black hover:bg-zinc-200 font-mono text-xs font-bold tracking-wide transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              title="Surprise me with randomized creative parameters"
            >
              <span className="text-sm leading-none">↗</span>
              <span>SURPRISE ME</span>
            </button>
          )}

          <button
            onClick={handleToggleSound}
            title={muted ? 'Unmute tactical audio' : 'Mute tactical audio'}
            aria-label={muted ? 'Unmute tactical audio' : 'Mute tactical audio'}
            className="w-8 h-8 rounded-full bg-[#0a0d14]/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/20 transition-all"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#00ff88]" />}
          </button>
        </div>
      </div>
    </header>
  );
};
