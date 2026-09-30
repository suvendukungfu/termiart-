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
    <section className="w-full py-16 bg-[#050507]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="font-mono text-xs font-bold text-[#00ff88] uppercase tracking-wider">
              EXPERIMENTAL DIGITAL-ART ARCHIVE
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
              Terminal Art Gallery
            </h2>
          </div>
          <p className="text-xs font-mono text-zinc-500 max-w-sm">
            Curated terminal artworks. Click "Try This Style" to immediately load the specimen into your creative instrument.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl bg-[#08090d] border border-[#181a24] hover:border-[#282d3e] overflow-hidden transition-all flex flex-col justify-between shadow-xl"
            >
              {/* Image Preview Container */}
              <div className="relative h-48 bg-[#040406] p-4 flex items-center justify-center overflow-hidden border-b border-[#14161f]">
                <img
                  src={item.path}
                  alt={item.title}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 text-[10px] font-mono px-2 py-0.5 rounded bg-[#0b0c10]/90 text-[#00ff88] border border-[#1f232e] backdrop-blur-xs">
                  {item.tag}
                </span>
              </div>

              {/* Card Meta & Action */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-mono text-sm font-bold text-white group-hover:text-[#00ff88] transition-colors mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.desc}
                  </p>

                  {/* Metadata: Renderer, Theme, Dimensions */}
                  <div className="mt-4 pt-3 border-t border-[#14161f] grid grid-cols-3 gap-2 text-[10px] font-mono text-zinc-500">
                    <div>
                      <div className="text-zinc-600">RENDERER</div>
                      <div className="text-zinc-300 font-bold uppercase truncate">{item.renderer}</div>
                    </div>
                    <div>
                      <div className="text-zinc-600">THEME</div>
                      <div className="text-zinc-300 font-bold uppercase truncate">{item.theme}</div>
                    </div>
                    <div>
                      <div className="text-zinc-600">DIMENSIONS</div>
                      <div className="text-zinc-300 font-bold">{item.dimensions}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#14161f]">
                  <button
                    onClick={() => {
                      sound.playClick();
                      onSelectSample(item.path, item.renderer, item.theme);
                    }}
                    className="w-full py-2 rounded-xl bg-[#0e1017] hover:bg-[#00ff88] hover:text-black text-zinc-300 text-xs font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 border border-[#232738] hover:border-[#00ff88]"
                  >
                    <span>TRY THIS STYLE</span>
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
