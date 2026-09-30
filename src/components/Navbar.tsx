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
    `px-3 py-1.5 text-xs font-mono tracking-widest uppercase transition-all ${
      currentTab === tab
        ? 'text-[#00ff88] font-bold border-b border-[#00ff88]'
        : 'text-zinc-400 hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full bg-[#050507]/90 backdrop-blur-md border-b border-[#14161f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Left: Brand */}
        <button
          onClick={() => {
            sound.playClick();
            setCurrentTab('home');
          }}
          className="flex items-center gap-2.5 group text-left"
        >
          <div className="w-7 h-7 rounded bg-[#0b0c10] border border-[#1f232e] flex items-center justify-center group-hover:border-[#00ff88]/60 transition-colors">
            <span className="text-[#00ff88] font-mono text-xs font-bold">&gt;_</span>
          </div>
          <span className="font-display font-bold text-sm tracking-widest text-white group-hover:text-[#00ff88] transition-colors">
            TERMIART
          </span>
        </button>

        {/* Center: Minimal Navigation */}
        <nav className="flex items-center gap-4 sm:gap-8">
          <button
            onClick={() => {
              sound.playClick();
              setCurrentTab('create');
            }}
            className={navLinkClass('create')}
          >
            CREATE
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setCurrentTab('explore');
            }}
            className={navLinkClass('explore')}
          >
            EXPLORE
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setCurrentTab('presets');
            }}
            className={navLinkClass('presets')}
          >
            PRESETS
          </button>
        </nav>

        {/* Right: RANDOMIZE & Sound Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onRandomize && (
            <button
              onClick={() => {
                sound.playShift();
                onRandomize();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e1017] hover:bg-[#161824] border border-[#232735] hover:border-amber-400/60 text-zinc-300 hover:text-amber-300 font-mono text-xs font-semibold tracking-wider transition-all active:scale-95 shadow-sm"
              title="Surprise me with randomized creative parameters"
            >
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">RANDOMIZE</span>
            </button>
          )}

          <button
            onClick={handleToggleSound}
            title={muted ? 'Unmute tactical audio' : 'Mute tactical audio'}
            aria-label={muted ? 'Unmute tactical audio' : 'Mute tactical audio'}
            className="w-8 h-8 rounded-lg bg-[#0e1017] border border-[#232735] flex items-center justify-center text-zinc-400 hover:text-[#00ff88] hover:border-[#2f3547] transition-all"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#00ff88]" />}
          </button>
        </div>
      </div>
    </header>
  );
};
