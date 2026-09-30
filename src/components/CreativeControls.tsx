import React, { useState } from 'react';
import { RendererType, RenderOptions, ThemeType } from '../engine/types';
import { sound } from '../utils/audio';
import {
  Sparkles,
  RefreshCw,
  Copy,
  Share2,
  Download,
  Sliders,
  ChevronDown,
  ChevronUp,
  Dices,
} from 'lucide-react';

interface CreativeControlsProps {
  options: RenderOptions;
  onChangeOptions: (newOptions: RenderOptions) => void;
  onGenerate: () => void;
  onSurpriseMe: () => void;
  onOpenCopyCenter: () => void;
  onOpenShareModal: () => void;
  onOpenDownloadModal: () => void;
  isRendering?: boolean;
}

export const CreativeControls: React.FC<CreativeControlsProps> = ({
  options,
  onChangeOptions,
  onGenerate,
  onSurpriseMe,
  onOpenCopyCenter,
  onOpenShareModal,
  onOpenDownloadModal,
  isRendering = false,
}) => {
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const renderers: { id: RendererType; label: string; desc: string }[] = [
    { id: 'halfblock', label: 'Half Block', desc: 'TrueColor 2x resolution' },
    { id: 'ascii', label: 'ASCII', desc: 'Standard classic ramp' },
    { id: 'dense_ascii', label: 'Dense', desc: '70-char micro detail' },
    { id: 'unicode', label: 'Unicode', desc: 'Shading blocks ░▒▓█' },
    { id: 'braille', label: 'Braille', desc: '2×4 subpixel dots' },
    { id: 'matrix', label: 'Matrix', desc: 'Cipher & Katakana' },
  ];

  const themes: { id: ThemeType; label: string; dotColor: string }[] = [
    { id: 'original', label: 'Original RGB', dotColor: 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500' },
    { id: 'cyberpunk', label: 'Cyberpunk', dotColor: 'bg-gradient-to-r from-cyan-400 to-pink-500' },
    { id: 'matrix', label: 'Matrix Phosphor', dotColor: 'bg-[#00ff66]' },
    { id: 'fire', label: 'Fire Flame', dotColor: 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-300' },
    { id: 'ocean', label: 'Deep Ocean', dotColor: 'bg-gradient-to-r from-blue-700 via-teal-400 to-emerald-200' },
    { id: 'purple_neon', label: 'Purple Neon', dotColor: 'bg-gradient-to-r from-purple-600 to-pink-400' },
    { id: 'rainbow', label: 'Rainbow', dotColor: 'bg-gradient-to-r from-red-400 via-yellow-400 to-purple-400' },
    { id: 'anime', label: 'Anime Cel', dotColor: 'bg-gradient-to-r from-amber-400 to-rose-400' },
    { id: 'mono', label: 'Monochrome', dotColor: 'bg-zinc-400' },
    { id: 'random', label: 'Surprise Palette', dotColor: 'bg-gradient-to-r from-emerald-400 to-indigo-500' },
  ];

  const updateOption = <K extends keyof RenderOptions>(key: K, value: RenderOptions[K]) => {
    sound.playClick();
    onChangeOptions({ ...options, [key]: value });
  };

  return (
    <div className="w-full bg-[#0b0c10] border border-[#1f232e] rounded-xl p-4 sm:p-5 flex flex-col gap-5 shadow-xl">
      {/* Primary Action Toolbar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button
          onClick={() => {
            sound.playClick();
            onGenerate();
          }}
          disabled={isRendering}
          className="col-span-2 sm:col-span-2 py-2.5 px-4 rounded-xl bg-[#00ff88] text-black font-mono text-xs font-bold tracking-wider hover:bg-[#33ff9f] active:scale-95 transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] flex items-center justify-center gap-2"
        >
          {isRendering ? (
            <RefreshCw className="w-4 h-4 animate-spin text-black" />
          ) : (
            <Sparkles className="w-4 h-4 text-black" />
          )}
          <span>{isRendering ? 'RENDERING...' : 'GENERATE'}</span>
        </button>

        <button
          onClick={() => {
            sound.playShift();
            onSurpriseMe();
          }}
          className="py-2.5 px-3 rounded-xl bg-[#141620] border border-[#272a3a] text-zinc-200 font-mono text-xs font-semibold hover:border-amber-400/60 hover:text-amber-300 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          title="Randomize renderer, theme, and contrast"
        >
          <Dices className="w-4 h-4 text-amber-400" />
          <span>SURPRISE</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenCopyCenter();
          }}
          className="py-2.5 px-3 rounded-xl bg-[#141620] border border-[#272a3a] text-zinc-200 font-mono text-xs font-semibold hover:border-[#00ff88]/60 hover:text-[#00ff88] active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <Copy className="w-4 h-4 text-[#00ff88]" />
          <span>COPY</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenDownloadModal();
          }}
          className="py-2.5 px-3 rounded-xl bg-[#141620] border border-[#272a3a] text-zinc-200 font-mono text-xs font-semibold hover:border-cyan-400/60 hover:text-cyan-300 active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>EXPORT</span>
        </button>
      </div>

      {/* Style / Renderer Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-mono font-bold text-zinc-400 tracking-wider">
            CHARACTER ENGINE
          </label>
          <span className="text-[10px] font-mono text-zinc-500">6 Renderers</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {renderers.map((r) => {
            const active = options.renderer === r.id;
            return (
              <button
                key={r.id}
                onClick={() => updateOption('renderer', r.id)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  active
                    ? 'bg-[#181b28] border-[#00ff88] text-white shadow-[0_0_12px_rgba(0,255,136,0.15)]'
                    : 'bg-[#10121a] border-[#1d212d] text-zinc-400 hover:text-zinc-200 hover:border-[#2a2f42]'
                }`}
              >
                <div className="font-mono text-xs font-semibold flex items-center justify-between">
                  <span>{r.label}</span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{r.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mood / Color Theme Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-mono font-bold text-zinc-400 tracking-wider">
            COLOR PALETTE &amp; MOOD
          </label>
          <span className="text-[10px] font-mono text-zinc-500">10 Palettes</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {themes.map((t) => {
            const active = options.theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => updateOption('theme', t.id)}
                className={`px-2.5 py-2 rounded-lg border text-left transition-all flex items-center gap-2 ${
                  active
                    ? 'bg-[#181b28] border-[#00ff88] text-white'
                    : 'bg-[#10121a] border-[#1d212d] text-zinc-400 hover:text-zinc-200 hover:border-[#2a2f42]'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${t.dotColor}`} />
                <span className="font-mono text-[11px] truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resolution & Density Slider */}
      <div>
        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
          <span className="text-zinc-400 font-bold">GRID COLUMNS (WIDTH)</span>
          <span className="text-[#00ff88] font-bold">{options.width} cols</span>
        </div>
        <input
          type="range"
          min="30"
          max="160"
          step="5"
          value={options.width}
          onChange={(e) => updateOption('width', parseInt(e.target.value, 10))}
          className="w-full accent-[#00ff88] h-1.5 bg-[#181b26] rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] font-mono text-zinc-600 mt-1">
          <span>Compact (30)</span>
          <span>Balanced (90)</span>
          <span>Ultra Detail (160)</span>
        </div>
      </div>

      {/* Advanced Adjustments Toggle */}
      <div className="border-t border-[#181b24] pt-3">
        <button
          onClick={() => {
            sound.playClick();
            setShowAdvanced(!showAdvanced);
          }}
          className="w-full flex items-center justify-between text-xs font-mono text-zinc-400 hover:text-zinc-200 py-1"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-zinc-500" />
            <span>FINE CONTROLS (CONTRAST, BRIGHTNESS, EDGES)</span>
          </div>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-[#181b24]/60">
            {/* Contrast */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-zinc-400">Contrast</span>
                <span className="text-zinc-300">{options.contrast ?? 1.0}x</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.2"
                step="0.1"
                value={options.contrast ?? 1.0}
                onChange={(e) => updateOption('contrast', parseFloat(e.target.value))}
                className="w-full accent-[#00ff88] h-1.5 bg-[#181b26] rounded-lg cursor-pointer"
              />
            </div>

            {/* Brightness */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-zinc-400">Brightness</span>
                <span className="text-zinc-300">
                  {Math.round((options.brightness ?? 0) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="-0.8"
                max="0.8"
                step="0.05"
                value={options.brightness ?? 0}
                onChange={(e) => updateOption('brightness', parseFloat(e.target.value))}
                className="w-full accent-[#00ff88] h-1.5 bg-[#181b26] rounded-lg cursor-pointer"
              />
            </div>

            {/* Sharpness */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-zinc-400">Sharpness</span>
                <span className="text-zinc-300">
                  {Math.round((options.sharpness ?? 0) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1.0"
                step="0.1"
                value={options.sharpness ?? 0}
                onChange={(e) => updateOption('sharpness', parseFloat(e.target.value))}
                className="w-full accent-[#00ff88] h-1.5 bg-[#181b26] rounded-lg cursor-pointer"
              />
            </div>

            {/* Gamma */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-zinc-400">Gamma</span>
                <span className="text-zinc-300">{options.gamma ?? 1.0}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={options.gamma ?? 1.0}
                onChange={(e) => updateOption('gamma', parseFloat(e.target.value))}
                className="w-full accent-[#00ff88] h-1.5 bg-[#181b26] rounded-lg cursor-pointer"
              />
            </div>

            {/* Toggle switches */}
            <div className="col-span-1 sm:col-span-2 flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-zinc-300 select-none">
                <input
                  type="checkbox"
                  checked={options.edgeDetect ?? false}
                  onChange={(e) => updateOption('edgeDetect', e.target.checked)}
                  className="rounded border-[#2a2f42] text-[#00ff88] focus:ring-0"
                />
                <span>Sobel Edge Detection</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-zinc-300 select-none">
                <input
                  type="checkbox"
                  checked={options.invert ?? false}
                  onChange={(e) => updateOption('invert', e.target.checked)}
                  className="rounded border-[#2a2f42] text-[#00ff88] focus:ring-0"
                />
                <span>Invert Luminance</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
