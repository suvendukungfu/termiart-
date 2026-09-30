import React from 'react';
import { sound } from '../utils/audio';
import { RendererType, RenderOptions, ThemeType } from '../engine/types';
import { Zap, Terminal, Flame, Compass, Sparkles, Skull } from 'lucide-react';

interface PresetsSectionProps {
  onApplyPreset: (presetOptions: Partial<RenderOptions>) => void;
}

export const PresetsSection: React.FC<PresetsSectionProps> = ({ onApplyPreset }) => {
  const presets = [
    {
      id: 'cyberpunk-hacker',
      name: 'Cyberpunk Hacker',
      desc: 'TrueColor halfblocks with vivid electric cyan & magenta neon highlights.',
      renderer: 'halfblock' as RendererType,
      theme: 'cyberpunk' as ThemeType,
      contrast: 1.3,
      brightness: 0.05,
      sharpness: 0.2,
      edgeDetect: false,
      invert: false,
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
      border: 'hover:border-cyan-500/50',
    },
    {
      id: 'the-matrix',
      name: 'The Matrix Stream',
      desc: 'Phosphor green digital rain using Katakana glyphs & matrix ciphers.',
      renderer: 'matrix' as RendererType,
      theme: 'matrix' as ThemeType,
      contrast: 1.2,
      brightness: 0.0,
      sharpness: 0.0,
      edgeDetect: false,
      invert: false,
      icon: <Terminal className="w-4 h-4 text-[#00ff88]" />,
      border: 'hover:border-[#00ff88]/50',
    },
    {
      id: 'solar-flare',
      name: 'Solar Flare',
      desc: 'Thermodynamic 5-stop flame gradient with 70-character dense ASCII detail.',
      renderer: 'dense_ascii' as RendererType,
      theme: 'fire' as ThemeType,
      contrast: 1.4,
      brightness: 0.1,
      sharpness: 0.3,
      edgeDetect: false,
      invert: false,
      icon: <Flame className="w-4 h-4 text-amber-400" />,
      border: 'hover:border-amber-500/50',
    },
    {
      id: 'mariana-abyss',
      name: 'Mariana Abyss',
      desc: 'Subpixel Braille dots submerged in bioluminescent oceanic blues and teal.',
      renderer: 'braille' as RendererType,
      theme: 'ocean' as ThemeType,
      contrast: 1.1,
      brightness: -0.05,
      sharpness: 0.1,
      edgeDetect: false,
      invert: false,
      icon: <Compass className="w-4 h-4 text-sky-400" />,
      border: 'hover:border-sky-500/50',
    },
    {
      id: 'vintage-ascii',
      name: 'Vintage VT100',
      desc: 'Classic monochrome ASCII ramp simulating vintage CRT amber/green terminals.',
      renderer: 'ascii' as RendererType,
      theme: 'mono' as ThemeType,
      contrast: 1.2,
      brightness: 0.0,
      sharpness: 0.4,
      edgeDetect: false,
      invert: false,
      icon: <Sparkles className="w-4 h-4 text-zinc-300" />,
      border: 'hover:border-zinc-400/50',
    },
    {
      id: 'chaos-mode',
      name: 'MAKE IT CHAOS',
      desc: 'Edge-detected, inverted, hyper-saturated experimental procedural visual glitch.',
      renderer: 'matrix' as RendererType,
      theme: 'random' as ThemeType,
      contrast: 1.8,
      brightness: 0.2,
      sharpness: 0.8,
      edgeDetect: true,
      invert: true,
      icon: <Skull className="w-4 h-4 text-rose-500" />,
      border: 'hover:border-rose-500/80 bg-rose-950/10',
    },
  ];

  return (
    <section className="w-full py-16 bg-[#08080a] border-t border-[#181b24]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="font-mono text-xs font-bold text-[#00ff88] uppercase tracking-wider">
              STYLE PRESETS
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
              Curated Mood Recipes
            </h2>
          </div>
          <p className="text-xs font-mono text-zinc-500 max-w-sm">
            Select an aesthetic preset to instantly tune the rendering engine.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                sound.playShift();
                onApplyPreset({
                  renderer: p.renderer,
                  theme: p.theme,
                  contrast: p.contrast,
                  brightness: p.brightness,
                  sharpness: p.sharpness,
                  edgeDetect: p.edgeDetect,
                  invert: p.invert,
                });
              }}
              className={`p-5 rounded-2xl bg-[#0d0e14] border border-[#1f232e] ${p.border} text-left transition-all group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-[#141622] border border-[#232738] group-hover:scale-105 transition-transform">
                    {p.icon}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161824] text-zinc-400 border border-[#25293a]">
                    {p.renderer}
                  </span>
                </div>
                <h3 className="font-mono text-sm font-bold text-white group-hover:text-[#00ff88] transition-colors mb-1">
                  {p.name}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {p.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#181b24] flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>MOOD: {p.theme.toUpperCase()}</span>
                <span className="text-zinc-300 group-hover:text-[#00ff88] transition-colors">
                  APPLY RECIPE →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
