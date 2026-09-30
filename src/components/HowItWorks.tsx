import React from 'react';
import { UploadCloud, Cpu, Share2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'DROP & DECODE',
      desc: 'Drag and drop any JPG, PNG, or WEBP image. Canvas processes every pixel client-side in microseconds.',
      icon: <UploadCloud className="w-5 h-5 text-[#00ff88]" />,
    },
    {
      num: '02',
      title: 'QUANTIZE & STYLE',
      desc: 'Pick a character renderer (Half-Block, ASCII, Unicode, Braille, Matrix) and mood palette (Cyberpunk, Fire, Ocean).',
      icon: <Cpu className="w-5 h-5 text-cyan-400" />,
    },
    {
      num: '03',
      title: 'EXPORT ANYWHERE',
      desc: 'Smart-copy to terminal ANSI, Discord code blocks, clean WhatsApp text, or download a crisp 2x Retina PNG.',
      icon: <Share2 className="w-5 h-5 text-purple-400" />,
    },
  ];

  return (
    <section className="w-full py-16 border-t border-[#181b24] bg-[#08080a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="font-mono text-xs font-bold text-[#00ff88] uppercase tracking-wider">
              HOW IT WORKS
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
              From Pixels to Terminal Poetry
            </h2>
          </div>
          <p className="text-xs font-mono text-zinc-500 max-w-sm">
            Hardware-accelerated client-side rendering pipeline without server processing delays.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((s) => (
            <div
              key={s.num}
              className="p-6 rounded-2xl bg-[#0d0e14] border border-[#1f232e] hover:border-[#2f3547] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-[#141620] border border-[#232735]">
                    {s.icon}
                  </div>
                  <span className="font-mono text-sm font-bold text-zinc-600">
                    {s.num}
                  </span>
                </div>
                <h3 className="font-mono text-sm font-bold text-white tracking-wide mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#181a24] text-[10px] font-mono text-zinc-600 flex items-center justify-between">
                <span>STAGE {s.num}</span>
                <span className="text-[#00ff88]">CLIENT-SIDE</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
