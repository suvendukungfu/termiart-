import React, { useState } from 'react';
import { TerminalArtifact } from '../engine/types';
import {
  exportPlainText,
  exportAnsi,
  exportMarkdown,
  exportHtml,
  exportCanvasPng,
  generateSafeShellCommand,
} from '../engine/exporters';
import { sound } from '../utils/audio';
import { Check, Copy, FileText, Terminal, Code, Globe, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

interface CopyCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  artifact: TerminalArtifact | null;
}

type CopyFormat = 'text' | 'ansi' | 'markdown' | 'html' | 'image' | 'command';

export const CopyCenterModal: React.FC<CopyCenterModalProps> = ({
  isOpen,
  onClose,
  artifact,
}) => {
  const [activeCopied, setActiveCopied] = useState<CopyFormat | null>(null);
  const [isCopyingImage, setIsCopyingImage] = useState<boolean>(false);

  if (!isOpen || !artifact) return null;

  const triggerCopy = async (format: CopyFormat) => {
    sound.playCopy();
    try {
      if (format === 'text') {
        const text = exportPlainText(artifact);
        await navigator.clipboard.writeText(text);
      } else if (format === 'ansi') {
        const ansi = exportAnsi(artifact);
        await navigator.clipboard.writeText(ansi);
      } else if (format === 'markdown') {
        const md = exportMarkdown(artifact, true);
        await navigator.clipboard.writeText(md);
      } else if (format === 'html') {
        const html = exportHtml(artifact);
        await navigator.clipboard.writeText(html);
      } else if (format === 'command') {
        const cmd = generateSafeShellCommand(artifact);
        await navigator.clipboard.writeText(cmd);
      } else if (format === 'image') {
        setIsCopyingImage(true);
        const blob = await exportCanvasPng(artifact, { scale: 2 });
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setIsCopyingImage(false);
      }

      setActiveCopied(format);
      setTimeout(() => setActiveCopied(null), 2200);
    } catch (err) {
      setIsCopyingImage(false);
      console.error('Clipboard copy failed:', err);
    }
  };

  const copyOptions = [
    {
      id: 'text' as CopyFormat,
      title: 'PLAIN TEXT',
      badge: 'Universal',
      desc: 'Preserves characters and silhouettes. Universal compatibility across WhatsApp, Discord, Slack, SMS, docs.',
      note: 'Does not preserve terminal colors in standard chat windows.',
      icon: <FileText className="w-4 h-4 text-zinc-300" />,
    },
    {
      id: 'ansi' as CopyFormat,
      title: 'COPY ANSI',
      badge: 'Terminal Only',
      desc: '24-bit TrueColor escape sequences. Paste directly into iTerm2, macOS Terminal, Alacritty, Kitty, or VS Code terminal.',
      note: 'Preserves exact RGB colors in ANSI-compatible terminal emulators.',
      icon: <Terminal className="w-4 h-4 text-[#00ff88]" />,
    },
    {
      id: 'command' as CopyFormat,
      title: 'COPY SHELL COMMAND',
      badge: 'Safe POSIX',
      desc: 'Safe printf command ready to paste into any bash/zsh shell. Completely sanitized against injection.',
      note: 'Example: printf \'%b\\n\' \'\\033[38;2;...m...\'',
      icon: <Code className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'markdown' as CopyFormat,
      title: 'COPY MARKDOWN',
      badge: 'Discord / GitHub',
      desc: 'Formatted code block (```ansi ... ```). Perfectly formatted for Discord messages, GitHub comments, and READMEs.',
      note: 'Discord renders ANSI color codes inside ```ansi blocks.',
      icon: <Code className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'html' as CopyFormat,
      title: 'COPY HTML',
      badge: 'Web & Email',
      desc: 'Standalone HTML markup with inline RGB styles and dark terminal styling. Ready for web pages or rich email.',
      note: 'Zero dependencies; embeds all colors and font definitions directly.',
      icon: <Globe className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'image' as CopyFormat,
      title: 'COPY AS IMAGE',
      badge: 'Direct PNG',
      desc: 'Copies pixel-perfect rasterized PNG directly to your system clipboard. Paste into WhatsApp, Figma, Twitter, Slack.',
      note: 'Works universally as an image without formatting loss.',
      icon: <ImageIcon className="w-4 h-4 text-pink-400" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0c0d12] border border-[#232735] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#1c202d] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#00ff88] uppercase tracking-wider">
                COPY CENTER
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181a24] text-zinc-400 border border-[#272a38]">
                {artifact.renderer.toUpperCase()} • {artifact.width}×{artifact.height}
              </span>
            </div>
            <h3 className="font-display font-bold text-lg text-white mt-1">
              Select Destination Format
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

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-3">
          {copyOptions.map((opt) => {
            const isCopied = activeCopied === opt.id;
            const isLoadingThis = opt.id === 'image' && isCopyingImage;

            return (
              <div
                key={opt.id}
                className="group p-3.5 rounded-xl bg-[#10121a] border border-[#1f2330] hover:border-[#2f3547] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    {opt.icon}
                    <span className="font-mono text-xs font-bold text-white">
                      {opt.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#181a26] text-zinc-400 border border-[#232735]">
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-snug">{opt.desc}</p>
                  <p className="text-[11px] font-mono text-zinc-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-zinc-600 shrink-0" />
                    <span>{opt.note}</span>
                  </p>
                </div>

                <button
                  onClick={() => triggerCopy(opt.id)}
                  disabled={isLoadingThis}
                  className={`shrink-0 px-4 py-2 rounded-lg font-mono text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
                    isCopied
                      ? 'bg-[#00ff88] text-black shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                      : 'bg-[#181b26] text-zinc-200 border border-[#272c3d] hover:bg-[#202433] hover:text-white active:scale-95'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>COPIED!</span>
                    </>
                  ) : isLoadingThis ? (
                    <>
                      <div className="w-3 h-3 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                      <span>RASTERIZING...</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPY</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-[#090a0e] border-t border-[#1a1d26] text-[11px] font-mono text-zinc-500 flex items-center justify-between">
          <span>Format fidelity engine</span>
          <span className="text-zinc-400">Zero clipboard degradation</span>
        </div>
      </div>
    </div>
  );
};
