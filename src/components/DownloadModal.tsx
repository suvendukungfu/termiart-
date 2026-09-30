import React, { useState } from 'react';
import { TerminalArtifact } from '../engine/types';
import {
  exportPlainText,
  exportAnsi,
  exportHtml,
  exportCanvasPng,
} from '../engine/exporters';
import { sound } from '../utils/audio';
import { Download, FileText, Terminal, Globe, Image as ImageIcon, X } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  artifact: TerminalArtifact | null;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  artifact,
}) => {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  if (!isOpen || !artifact) return null;

  const downloadFile = (content: string | Blob, filename: string, type: string) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async (format: 'txt' | 'ans' | 'html' | 'png') => {
    sound.playClick();
    setDownloadingFormat(format);
    const baseName = `termiart-${artifact.renderer}-${artifact.theme}-${Date.now()}`;

    try {
      if (format === 'txt') {
        const text = exportPlainText(artifact);
        downloadFile(text, `${baseName}.txt`, 'text/plain;charset=utf-8');
      } else if (format === 'ans') {
        const ansi = exportAnsi(artifact);
        downloadFile(ansi, `${baseName}.ans`, 'text/plain;charset=utf-8');
      } else if (format === 'html') {
        const html = exportHtml(artifact);
        downloadFile(html, `${baseName}.html`, 'text/html;charset=utf-8');
      } else if (format === 'png') {
        const blob = await exportCanvasPng(artifact, { scale: 2 });
        downloadFile(blob, `${baseName}.png`, 'image/png');
      }
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const options = [
    {
      id: 'png' as const,
      title: 'PNG IMAGE (.png)',
      badge: 'High-Res 2x Retina',
      desc: 'Pixel-perfect rasterized terminal card. Beautiful on all mobile screens and platforms.',
      icon: <ImageIcon className="w-5 h-5 text-pink-400" />,
    },
    {
      id: 'ans' as const,
      title: 'ANSI ARTWORK (.ans)',
      badge: 'Terminal Standard',
      desc: 'Contains 24-bit TrueColor escape sequences. View in terminal via "cat file.ans" or iTerm2.',
      icon: <Terminal className="w-5 h-5 text-[#00ff88]" />,
    },
    {
      id: 'html' as const,
      title: 'STANDALONE HTML (.html)',
      badge: 'Web Ready',
      desc: 'Self-contained webpage with embedded monospace font, inline RGB styles, and dark canvas.',
      icon: <Globe className="w-5 h-5 text-purple-400" />,
    },
    {
      id: 'txt' as const,
      title: 'PLAIN TEXT (.txt)',
      badge: 'UTF-8 Monospace',
      desc: 'Clean Unicode and ASCII characters without escape sequences. Universal text compatibility.',
      icon: <FileText className="w-5 h-5 text-zinc-300" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0c0d12] border border-[#232735] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#1c202d] flex items-center justify-between">
          <div>
            <span className="font-mono text-xs font-bold text-[#00ff88] uppercase tracking-wider">
              EXPORT FILE
            </span>
            <h3 className="font-display font-bold text-lg text-white mt-0.5">
              Download Terminal Artifact
            </h3>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-[#14161f] border border-[#232735] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {options.map((opt) => {
            const isLoading = downloadingFormat === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleDownload(opt.id)}
                disabled={isLoading}
                className="w-full p-4 rounded-xl bg-[#10121a] border border-[#1f2330] hover:border-[#2f3547] transition-all flex items-center justify-between gap-4 text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#181a26] border border-[#242938] shrink-0 mt-0.5">
                    {opt.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white group-hover:text-[#00ff88] transition-colors">
                        {opt.title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#181a26] text-zinc-400 border border-[#232735]">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-snug">{opt.desc}</p>
                  </div>
                </div>

                <div className="shrink-0 px-3 py-1.5 rounded-lg bg-[#181a26] border border-[#272b3c] text-zinc-300 group-hover:text-[#00ff88] group-hover:border-[#00ff88]/40 transition-colors flex items-center gap-1.5 text-xs font-mono">
                  {isLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>SAVE</span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
