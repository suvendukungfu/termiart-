import React, { useRef, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, ShieldCheck, Sparkles, FolderOpen } from 'lucide-react';
import { sound } from '../utils/audio';

interface ImageSourcePanelProps {
  currentImage: File | Blob | string | null;
  imagePreviewUrl: string | null;
  onSelectImage: (file: File | string) => void;
  onTryDemo: () => void;
}

export const ImageSourcePanel: React.FC<ImageSourcePanelProps> = ({
  currentImage,
  imagePreviewUrl,
  onSelectImage,
  onTryDemo,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Paste image directly from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          sound.playClick();
          onSelectImage(file);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onSelectImage]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        sound.playClick();
        onSelectImage(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      sound.playClick();
      onSelectImage(e.target.files[0]);
    }
  };

  const samples = [
    { id: 'anime', label: 'Anime Hero', path: '/samples/anime.png' },
    { id: 'portrait', label: 'Portrait', path: '/samples/portrait.png' },
    { id: 'landscape', label: 'Landscape', path: '/samples/landscape.png' },
    { id: 'architecture', label: 'Cyber City', path: '/samples/architecture.png' },
    { id: 'animals', label: 'Wildlife', path: '/samples/animals.png' },
    { id: 'logo', label: 'Neon Mark', path: '/samples/logo.png' },
  ];

  return (
    <div className="w-full bg-[#0b0c10] border border-[#1f232e] rounded-xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono font-bold text-zinc-400 tracking-wider">
          SOURCE IMAGE
        </label>
        <div className="flex items-center gap-1 text-[10px] font-mono text-[#00ff88]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>LOCAL ONLY</span>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Dropzone / Preview */}
      {imagePreviewUrl ? (
        <div className="relative group rounded-xl overflow-hidden border border-[#232735] bg-[#08080a] flex flex-col items-center justify-center min-h-45">
          <img
            src={imagePreviewUrl}
            alt="Source uploaded"
            className="w-full h-44 object-contain bg-zinc-950/60 p-2"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-[#00ff88] text-black font-mono text-xs font-bold flex items-center gap-1.5 shadow-lg"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>REPLACE</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 min-h-40 ${
            isDragging
              ? 'border-[#00ff88] bg-[#00ff88]/5 scale-[0.99]'
              : 'border-[#262b3a] hover:border-[#383f54] bg-[#0e1017]'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-[#141620] border border-[#232735] flex items-center justify-center text-zinc-400 group-hover:text-white">
            <Upload className="w-5 h-5 text-[#00ff88]" />
          </div>
          <div>
            <div className="font-mono text-xs font-bold text-white tracking-wide">
              DROP IMAGE HERE
            </div>
            <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
              or click to browse • Paste (Cmd+V)
            </div>
          </div>
          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mt-1">
            PNG • JPG • JPEG • WEBP
          </span>
        </div>
      )}

      {/* Quick Specimen Presets */}
      <div>
        <div className="text-[11px] font-mono text-zinc-400 mb-2 flex items-center justify-between">
          <span>TRY SAMPLE SPECIMENS:</span>
          <button
            onClick={onTryDemo}
            className="text-[10px] text-[#00ff88] hover:underline flex items-center gap-1 font-mono"
          >
            <Sparkles className="w-3 h-3" />
            <span>Auto Pick</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {samples.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                sound.playClick();
                onSelectImage(s.path);
              }}
              className="px-2 py-1.5 rounded-lg bg-[#12141c] border border-[#1e222e] hover:border-[#2f3547] text-left text-zinc-300 hover:text-white text-[11px] font-mono transition-colors truncate"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-[10px] font-mono text-zinc-600 flex items-center justify-center gap-1 pt-1 border-t border-[#181b24]">
        <span>No server uploads. Entirely in-browser.</span>
      </div>
    </div>
  );
};
