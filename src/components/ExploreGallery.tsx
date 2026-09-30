import React from 'react';
import { sound } from '../utils/audio';
import { ArrowUpRight } from 'lucide-react';
import { RendererType, ThemeType } from '../engine/types';

interface ExploreGalleryProps {
  onSelectSample: (path: string, renderer: RendererType, theme: ThemeType) => void;
}

export const ExploreGallery: React.FC<ExploreGalleryProps> = ({ onSelectSample }) => {
  const items = [
    {
      id: 'anime',
      title: 'Neon Anime Hero',
      path: '/samples/anime.png',
      renderer: 'halfblock' as RendererType,
      theme: 'cyberpunk' as ThemeType,
      dimensions: '100 × 56',
      tag: 'Stylized 24-bit',
      desc: 'High vibrance cyber tones mapped into truecolor halfblocks with razor sharpness.',
    },
    {
      id: 'portrait',
      title: 'Studio Monolith',
      path: '/samples/portrait.png',
      renderer: 'dense_ascii' as RendererType,
      theme: 'original' as ThemeType,
      dimensions: '90 × 45',
      tag: 'Micro Detail',
      desc: '70-level ASCII density capturing skin tones, silhouettes, and lighting nuances.',
    },
    {
      id: 'landscape',
      title: 'Solar Mountain Sunset',
      path: '/samples/landscape.png',
      renderer: 'halfblock' as RendererType,
      theme: 'fire' as ThemeType,
      dimensions: '110 × 55',
      tag: 'Flame Gradient',
      desc: '5-stop thermodynamic color ramp mapped across horizon luminance contours.',
    },
    {
      id: 'architecture',
      title: 'Cyber City Facade',
      path: '/samples/architecture.png',
      renderer: 'matrix' as RendererType,
      theme: 'matrix' as ThemeType,
      dimensions: '95 × 48',
      tag: 'Cipher Rain',
      desc: 'Japanese Katakana characters rendering structural glass and neon grids.',
    },
    {
      id: 'animals',
      title: 'Deep Abyss Fauna',
      path: '/samples/animals.png',
      renderer: 'braille' as RendererType,
      theme: 'ocean' as ThemeType,
      dimensions: '100 × 50',
      tag: 'Subpixel Dots',
      desc: '2×4 Unicode Braille dot matrix preserving micro-textures and subtle contrast.',
    },
    {
      id: 'logo',
      title: 'Neon Glyph Terminal',
      path: '/samples/logo.png',
      renderer: 'unicode' as RendererType,
      theme: 'purple_neon' as ThemeType,
      dimensions: '80 × 40',
      tag: 'Block Shading',
      desc: 'Extended Unicode blocks ░▒▓█ with electric violet glow and clean boundaries.',
    },
  ];

  return (
    <section className="w-full py-20 bg-[#06080d] border-t border-[#141824] relative">
      <div className="numeric-grid-bg absolute inset-0 opacity-15 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d1017] border border-white/10 text-[10px] font-mono text-zinc-400 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>// ARCHIVE</span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
              Curated Specimen Gallery
            </h2>
          </div>
          <p className="text-xs font-mono text-zinc-400 max-w-sm">
            Inspect verified terminal specimens. Click any specimen to instantly initialize the creative studio parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl bg-[#090c14]/90 border border-white/10 hover:border-white/25 overflow-hidden transition-all flex flex-col justify-between shadow-[0_15px_35px_rgba(0,0,0,0.5)]"
            >
              {/* Image Preview Container */}
              <div className="relative h-48 bg-[#04060a] p-4 flex items-center justify-center overflow-hidden border-b border-white/5">
                <img
                  src={item.path}
                  alt={item.title}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#090c14]/90 text-white border border-white/10 backdrop-blur-md">
                  {item.tag}
                </span>
              </div>

              {/* Card Meta & Action */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-mono text-sm font-bold text-white group-hover:text-amber-400 transition-colors mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.desc}
                  </p>

                  {/* Metadata: Renderer, Theme, Dimensions */}
                  <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-3 gap-2 text-[10px] font-mono text-zinc-500">
                    <div>
                      <div className="text-zinc-600">//RENDERER</div>
                      <div className="text-zinc-300 font-bold uppercase truncate">{item.renderer}</div>
                    </div>
                    <div>
                      <div className="text-zinc-600">//THEME</div>
                      <div className="text-zinc-300 font-bold uppercase truncate">{item.theme}</div>
                    </div>
                    <div>
                      <div className="text-zinc-600">//GRID</div>
                      <div className="text-zinc-300 font-bold">{item.dimensions}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5">
                  <button
                    onClick={() => {
                      sound.playClick();
                      onSelectSample(item.path, item.renderer, item.theme);
                    }}
                    className="w-full py-2.5 rounded-full bg-white/5 hover:bg-white text-zinc-300 hover:text-black text-xs font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 border border-white/10 hover:border-white shadow-sm"
                  >
                    <span className="text-sm leading-none">↗</span>
                    <span>LOAD SPECIMEN</span>
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
