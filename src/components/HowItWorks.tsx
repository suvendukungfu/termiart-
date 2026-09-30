import React from 'react';
import { UploadCloud, Cpu, Share2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'DROP & DECODE',
      desc: 'Drag and drop any JPG, PNG, or WEBP image. Canvas processes every pixel client-side in microseconds with zero server upload.',
      icon: <UploadCloud className="w-5 h-5 text-white" />,
    },
    {
      num: '02',
      title: 'QUANTIZE & STYLE',
      desc: 'Select from 7 distinct terminal renderers (ASCII, Half-Block, Braille, Unicode, Matrix) and 10 dynamic color moods.',
      icon: <Cpu className="w-5 h-5 text-amber-400" />,
    },
    {
      num: '03',
      title: 'EXPORT ANYWHERE',
      desc: 'Instant 1-click export to Terminal ANSI codes, Discord code blocks, clean WhatsApp/Telegram text, or Retina PNG.',
      icon: <Share2 className="w-5 h-5 text-[#00ff88]" />,
    },
  ];

  return (
    <section className="w-full py-20 border-t border-[#141824] bg-[#07090e] relative overflow-hidden">
      <div className="numeric-grid-bg absolute inset-0 opacity-15 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d1017] border border-white/10 text-[10px] font-mono text-zinc-400 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>// ARCHITECTURE</span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
              Three Steps. Zero Latency.
            </h2>
          </div>
          <p className="text-xs font-mono text-zinc-400 max-w-sm">
            Autonomous client-side processing pipeline running entirely within your browser hardware.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((s) => (
            <div
              key={s.num}
              className="p-6 rounded-2xl bg-[#0b0e14]/90 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white group-hover:scale-105 transition-transform">
                    {s.icon}
                  </div>
                  <span className="font-mono text-xs font-bold text-zinc-500 tracking-wider">
                    //{s.num}
                  </span>
                </div>
                <h3 className="font-mono text-sm font-bold text-white tracking-wider mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
                <span>PIPELINE {s.num}</span>
                <span className="text-white/80 group-hover:text-[#00ff88] transition-colors">100% IN-BROWSER ↗</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
