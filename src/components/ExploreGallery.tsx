import React from 'react';
import { sound } from '../utils/audio';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { RendererType, ThemeType } from '../engine/types';

interface ExploreGalleryProps {
  onSelectSample: (path: string, renderer: RendererType, theme: ThemeType) => void;
}

export const ExploreGallery: React.FC<ExploreGalleryProps> = ({ onSelectSample }) => {
  const items = [
    {
      id: 'anime',
      title: 'Anime Pop Art',
      path: '/samples/anime.png',
      renderer: 'halfblock' as RendererType,
      theme: 'cyberpunk' as ThemeType,
      tag: 'Stylized 24-bit',
      desc: 'High vibrance cyber tones mapped into truecolor halfblocks.',
    },
    {
      id: 'portrait',
      title: 'Studio Portrait',
      path: '/samples/portrait.png',
      renderer: 'dense_ascii' as RendererType,
      theme: 'original' as ThemeType,
      tag: 'Micro Detail',
      desc: '70-level ASCII density capturing skin tones and subtle lighting.',
    },
    {
      id: 'landscape',
      title: 'Cyber Mountain Sunset',
      path: '/samples/landscape.png',
      renderer: 'halfblock' as RendererType,
      theme: 'fire' as ThemeType,
      tag: 'Flame Gradient',
      desc: '5-stop thermodynamic color ramp mapped across horizon luminance.',
    },
    {
      id: 'architecture',
      title: 'Monolithic City',
      path: '/samples/architecture.png',
      renderer: 'matrix' as RendererType,
      theme: 'matrix' as ThemeType,
      tag: 'Cipher Rain',
      desc: 'Japanese Katakana characters rendering structural facades.',
    },
    {
      id: 'animals',
      title: 'Wildlife Gaze',
      path: '/samples/animals.png',
      renderer: 'braille' as RendererType,
      theme: 'ocean' as ThemeType,
      tag: 'Subpixel Dots',
      desc: '2×4 Unicode braille dot matrix preserving micro-textures.',
    },
    {
      id: 'logo',
      title: 'Neon Glyph',
      path: '/samples/logo.png',
      renderer: 'unicode' as RendererType,
      theme: 'purple_neon' as ThemeType,
      tag: 'Block Shading',
      desc: 'Extended Unicode blocks ░▒▓█ with electric violet glow.',
    },
  ];

  return (
    <section className="w-full py-16 bg-[#08080a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="font-mono text-xs font-bold text-[#00ff88] uppercase tracking-wider">
              EXPLORE SPECIMENS
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
              Curated Terminal Artifacts
            </h2>
          </div>
          <p className="text-xs font-mono text-zinc-500 max-w-sm">
            Click any specimen to load its image and creative parameters into the studio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl bg-[#0d0e14] border border-[#1f232e] hover:border-[#2f3547] overflow-hidden transition-all flex flex-col"
            >
              {/* Image Thumbnail Container */}
              <div className="relative h-48 bg-[#090a0f] p-4 flex items-center justify-center overflow-hidden border-b border-[#181b24]">
                <img
                  src={item.path}
                  alt={item.title}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 text-[10px] font-mono px-2 py-0.5 rounded bg-[#141620]/90 text-[#00ff88] border border-[#232735] backdrop-blur-xs">
                  {item.tag}
                </span>
              </div>

              {/* Card Meta & Action */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-mono text-sm font-bold text-white group-hover:text-[#00ff88] transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {item.renderer}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#181b24] flex items-center justify-between">
                  <div className="text-[10px] font-mono text-zinc-500">
                    MOOD: <span className="text-zinc-300">{item.theme.toUpperCase()}</span>
                  </div>

                  <button
                    onClick={() => {
                      sound.playClick();
                      onSelectSample(item.path, item.renderer, item.theme);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#141622] hover:bg-[#00ff88] hover:text-black text-zinc-300 text-xs font-mono font-semibold transition-all flex items-center gap-1 active:scale-95 border border-[#232738] hover:border-[#00ff88]"
                  >
                    <span>LOAD</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
