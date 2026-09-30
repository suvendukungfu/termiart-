import React from 'react';
import { sound } from '../utils/audio';
import { RendererType, RenderOptions, ThemeType, AnimationType } from '../engine/types';
import {
  Zap,
  Terminal,
  Flame,
  Compass,
  Sparkles,
  Skull,
  Tv,
  Eye,
  Radio,
  Dices,
} from 'lucide-react';

interface PresetsSectionProps {
  onApplyPreset: (presetOptions: Partial<RenderOptions>) => void;
}

export const PresetsSection: React.FC<PresetsSectionProps> = ({ onApplyPreset }) => {
  const presets: {
    id: string;
    name: string;
    desc: string;
    renderer: RendererType;
    theme: ThemeType;
    animation?: AnimationType;
    contrast: number;
    brightness: number;
    sharpness: number;
    edgeDetect: boolean;
    invert: boolean;
    icon: React.ReactNode;
    border: string;
  }[] = [
    {
      id: 'matrix',
      name: 'MATRIX',
      desc: 'Phosphor green digital cipher rain with Japanese Katakana glyph streams.',
      renderer: 'matrix',
      theme: 'matrix',
      animation: 'matrix',
      contrast: 1.25,
      brightness: 0.0,
      sharpness: 0.0,
      edgeDetect: false,
      invert: false,
      icon: <Terminal className="w-4 h-4 text-[#00ff88]" />,
      border: 'hover:border-[#00ff88]/60',
    },
    {
      id: 'cyberpunk',
      name: 'CYBERPUNK',
      desc: 'TrueColor halfblocks with hyper-vivid electric cyan and hot magenta neon highlights.',
      renderer: 'halfblock',
      theme: 'cyberpunk',
      animation: 'none',
      contrast: 1.35,
      brightness: 0.04,
      sharpness: 0.2,
      edgeDetect: false,
      invert: false,
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
      border: 'hover:border-cyan-500/60',
    },
    {
      id: 'retro-terminal',
      name: 'RETRO TERMINAL',
      desc: 'Classic VT100 phosphor terminal green on monochrome ASCII density matrix.',
      renderer: 'ascii',
      theme: 'matrix',
      animation: 'scanline',
      contrast: 1.2,
      brightness: 0.0,
      sharpness: 0.3,
      edgeDetect: false,
      invert: false,
      icon: <Tv className="w-4 h-4 text-emerald-400" />,
      border: 'hover:border-emerald-500/60',
    },
    {
      id: 'anime',
      name: 'ANIME',
      desc: 'Cel-shaded pop tones with saturated boundaries and high graphic impact.',
      renderer: 'halfblock',
      theme: 'anime',
      animation: 'none',
      contrast: 1.25,
      brightness: 0.05,
      sharpness: 0.25,
      edgeDetect: false,
      invert: false,
      icon: <Sparkles className="w-4 h-4 text-rose-400" />,
      border: 'hover:border-rose-400/60',
    },
    {
      id: 'portrait',
      name: 'PORTRAIT',
      desc: '70-level granular Dense ASCII tuned for skin tones, silhouettes, and lighting gradients.',
      renderer: 'dense_ascii',
      theme: 'original',
      animation: 'none',
      contrast: 1.15,
      brightness: 0.0,
      sharpness: 0.2,
      edgeDetect: false,
      invert: false,
      icon: <Eye className="w-4 h-4 text-amber-300" />,
      border: 'hover:border-amber-400/60',
    },
    {
      id: 'braille',
      name: 'BRAILLE',
      desc: '2×4 subpixel dot matrix mapped to Unicode Braille patterns in deep ocean blues.',
      renderer: 'braille',
      theme: 'ocean',
      animation: 'none',
      contrast: 1.2,
      brightness: -0.05,
      sharpness: 0.1,
      edgeDetect: false,
      invert: false,
      icon: <Compass className="w-4 h-4 text-sky-400" />,
      border: 'hover:border-sky-400/60',
    },
    {
      id: 'rgb-dream',
      name: 'RGB DREAM',
      desc: 'Alphanumeric character matrix with full 24-bit TrueColor spectrum cycling.',
      renderer: 'rgb',
      theme: 'rainbow',
      animation: 'cycle',
      contrast: 1.3,
      brightness: 0.05,
      sharpness: 0.15,
      edgeDetect: false,
      invert: false,
      icon: <Radio className="w-4 h-4 text-purple-400" />,
      border: 'hover:border-purple-400/60',
    },
    {
      id: 'mono',
      name: 'MONO',
      desc: 'Minimal high-contrast monochrome shading blocks for print and clean documentation.',
      renderer: 'unicode',
      theme: 'mono',
      animation: 'none',
      contrast: 1.4,
      brightness: 0.0,
      sharpness: 0.4,
      edgeDetect: false,
      invert: false,
      icon: <Sparkles className="w-4 h-4 text-zinc-300" />,
      border: 'hover:border-zinc-400/60',
    },
    {
      id: 'glitch',
      name: 'GLITCH',
      desc: 'Cybernetic jitter with horizontal scanline displacement and inverted luminance.',
      renderer: 'matrix',
      theme: 'purple_neon',
      animation: 'glitch',
      contrast: 1.6,
      brightness: 0.1,
      sharpness: 0.5,
      edgeDetect: true,
      invert: true,
      icon: <Skull className="w-4 h-4 text-rose-500" />,
      border: 'hover:border-rose-500/80 bg-rose-950/10',
    },
    {
      id: 'random',
      name: 'RANDOM',
      desc: 'Procedural surprise recipe with randomized character engine and harmonic color balance.',
      renderer: 'halfblock',
      theme: 'random',
      animation: 'none',
      contrast: 1.3,
      brightness: 0.0,
      sharpness: 0.2,
      edgeDetect: false,
      invert: false,
      icon: <Dices className="w-4 h-4 text-amber-400" />,
      border: 'hover:border-amber-400/80',
    },
  ];

  return (
    <section className="w-full py-20 bg-[#07090e] border-t border-[#141824] relative">
      <div className="numeric-grid-bg absolute inset-0 opacity-15 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d1017] border border-white/10 text-[10px] font-mono text-zinc-400 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>// PRESET RECIPES</span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
              One-Click Terminal Aesthetics
            </h2>
          </div>
          <p className="text-xs font-mono text-zinc-400 max-w-sm">
            Immediately tune the terminal engine into 10 distinct creative aesthetics with pre-quantized parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                sound.playShift();
                onApplyPreset({
                  renderer: p.renderer,
                  theme: p.theme,
                  animation: p.animation,
                  contrast: p.contrast,
                  brightness: p.brightness,
                  sharpness: p.sharpness,
                  edgeDetect: p.edgeDetect,
                  invert: p.invert,
                });
              }}
              className={`p-4 rounded-2xl bg-[#0a0d14]/90 border border-white/10 ${p.border} text-left transition-all group flex flex-col justify-between shadow-[0_10px_25px_rgba(0,0,0,0.4)] hover:bg-[#0f1422]`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:scale-105 transition-transform text-white">
                    {p.icon}
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10 uppercase">
                    //{p.renderer}
                  </span>
                </div>
                <h3 className="font-mono text-xs font-bold text-white group-hover:text-amber-400 transition-colors mb-1 tracking-wider uppercase">
                  {p.name}
                </h3>
                <p className="text-[11px] text-zinc-400 leading-snug line-clamp-3">
                  {p.desc}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-zinc-500">
                <span>{p.theme.toUpperCase()}</span>
                <span className="text-zinc-300 group-hover:text-white transition-colors font-semibold flex items-center gap-0.5">
                  LOAD <span className="text-xs">↗</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
