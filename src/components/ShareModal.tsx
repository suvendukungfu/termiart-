import React, { useState } from 'react';
import { TerminalArtifact } from '../engine/types';
import {
  exportPlainText,
  exportAnsi,
  exportMarkdown,
  exportHtml,
  exportCanvasPng,
} from '../engine/exporters';
import { sound } from '../utils/audio';
import {
  Share2,
  Download,
  Copy,
  Check,
  X,
  MessageCircle,
  Send,
  Mail,
  Hash,
  AlertTriangle,
} from 'lucide-react';

const TwitterIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  artifact: TerminalArtifact | null;
}

type PlatformTab = 'whatsapp' | 'discord' | 'slack' | 'telegram' | 'email' | 'x' | 'webshare';

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  artifact,
}) => {
  const [activePlatform, setActivePlatform] = useState<PlatformTab>('whatsapp');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  if (!isOpen || !artifact) return null;

  const triggerCopy = async (key: string, content: string) => {
    sound.playCopy();
    try {
      await navigator.clipboard.writeText(content);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadPng = async () => {
    sound.playClick();
    setIsDownloading(true);
    try {
      const blob = await exportCanvasPng(artifact, { scale: 2 });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `termiart-${artifact.renderer}-${artifact.theme}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PNG download failed', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNativeShare = async () => {
    sound.playClick();
    if (navigator.share) {
      try {
        const blob = await exportCanvasPng(artifact, { scale: 2 });
        const file = new File([blob], `termiart-${artifact.renderer}.png`, { type: 'image/png' });
        await navigator.share({
          title: 'TermiArt Artwork',
          text: `Check out this terminal artwork created with TermiArt (${artifact.renderer.toUpperCase()})`,
          files: [file],
        });
      } catch (err) {
        // Fallback to text share if file share fails
        try {
          await navigator.share({
            title: 'TermiArt Artwork',
            text: exportPlainText(artifact),
          });
        } catch (_) {}
      }
    } else {
      handleDownloadPng();
    }
  };

  const platforms = [
    { id: 'whatsapp' as PlatformTab, label: 'WhatsApp', icon: <MessageCircle className="w-4 h-4 text-emerald-400" /> },
    { id: 'discord' as PlatformTab, label: 'Discord', icon: <Hash className="w-4 h-4 text-indigo-400" /> },
    { id: 'slack' as PlatformTab, label: 'Slack', icon: <MessageCircle className="w-4 h-4 text-amber-400" /> },
    { id: 'telegram' as PlatformTab, label: 'Telegram', icon: <Send className="w-4 h-4 text-sky-400" /> },
    { id: 'email' as PlatformTab, label: 'Email', icon: <Mail className="w-4 h-4 text-rose-400" /> },
    { id: 'x' as PlatformTab, label: 'X (Twitter)', icon: <TwitterIcon className="w-4 h-4 text-zinc-300" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0c0d12] border border-[#232735] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#1c202d] flex items-center justify-between">
          <div>
            <span className="font-mono text-xs font-bold text-[#00ff88] uppercase tracking-wider">
              UNIVERSAL SHARING
            </span>
            <h3 className="font-display font-bold text-lg text-white mt-0.5">
              Share Terminal Artwork
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

        {/* Platform Selector Tabs */}
        <div className="flex border-b border-[#1c202d] bg-[#090a0e] overflow-x-auto p-1.5 gap-1">
          {platforms.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                sound.playClick();
                setActivePlatform(p.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                activePlatform === p.id
                  ? 'bg-[#181a24] text-white border border-[#282d3e]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#12141c]'
              }`}
            >
              {p.icon}
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Platform Details & Action Panel */}
        <div className="p-6 space-y-4">
          {activePlatform === 'whatsapp' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  WhatsApp does not parse ANSI terminal colors. For best results on WhatsApp, send the rendered PNG image or plain monospace text.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadPng}
                  disabled={isDownloading}
                  className="p-3.5 rounded-xl bg-[#141622] border border-[#272b3c] hover:border-[#00ff88]/50 text-left transition-all group"
                >
                  <div className="font-mono text-xs font-bold text-white group-hover:text-[#00ff88] flex items-center justify-between">
                    <span>DOWNLOAD PNG</span>
                    <Download className="w-4 h-4 text-zinc-400 group-hover:text-[#00ff88]" />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">High-res rendered terminal PNG to attach in chat</p>
                </button>

                <button
                  onClick={() => triggerCopy('wa-text', exportPlainText(artifact))}
                  className="p-3.5 rounded-xl bg-[#141622] border border-[#272b3c] hover:border-[#00ff88]/50 text-left transition-all group"
                >
                  <div className="font-mono text-xs font-bold text-white group-hover:text-[#00ff88] flex items-center justify-between">
                    <span>{copiedKey === 'wa-text' ? 'COPIED!' : 'COPY CLEAN TEXT'}</span>
                    {copiedKey === 'wa-text' ? <Check className="w-4 h-4 text-[#00ff88]" /> : <Copy className="w-4 h-4 text-zinc-400 group-hover:text-[#00ff88]" />}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">Monospace UTF-8 characters for text messages</p>
                </button>
              </div>
            </div>
          )}

          {activePlatform === 'discord' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                Discord supports 24-bit color inside <code className="text-indigo-300">```ansi</code> code blocks. You can copy the code block directly!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => triggerCopy('disc-ansi', exportMarkdown(artifact, true))}
                  className="p-3.5 rounded-xl bg-[#141622] border border-[#272b3c] hover:border-indigo-400/50 text-left transition-all group"
                >
                  <div className="font-mono text-xs font-bold text-white group-hover:text-indigo-400 flex items-center justify-between">
                    <span>{copiedKey === 'disc-ansi' ? 'COPIED CODE BLOCK!' : 'COPY ANSI BLOCK'}</span>
                    {copiedKey === 'disc-ansi' ? <Check className="w-4 h-4 text-indigo-400" /> : <Copy className="w-4 h-4 text-zinc-400 group-hover:text-indigo-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">Formatted with ```ansi syntax for colored rendering</p>
                </button>

                <button
                  onClick={handleDownloadPng}
                  disabled={isDownloading}
                  className="p-3.5 rounded-xl bg-[#141622] border border-[#272b3c] hover:border-indigo-400/50 text-left transition-all group"
                >
                  <div className="font-mono text-xs font-bold text-white group-hover:text-indigo-400 flex items-center justify-between">
                    <span>DOWNLOAD PNG</span>
                    <Download className="w-4 h-4 text-zinc-400 group-hover:text-indigo-400" />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">Drop image directly into Discord channels</p>
                </button>
              </div>
            </div>
          )}

          {activePlatform === 'slack' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                Slack supports code blocks and image attachments.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => triggerCopy('slack-md', exportMarkdown(artifact, false))}
                  className="p-3.5 rounded-xl bg-[#141622] border border-[#272b3c] hover:border-amber-400/50 text-left transition-all group"
                >
                  <div className="font-mono text-xs font-bold text-white group-hover:text-amber-400 flex items-center justify-between">
                    <span>{copiedKey === 'slack-md' ? 'COPIED!' : 'COPY CODE BLOCK'}</span>
                    {copiedKey === 'slack-md' ? <Check className="w-4 h-4 text-amber-400" /> : <Copy className="w-4 h-4 text-zinc-400 group-hover:text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">Standard Markdown code block for Slack snippets</p>
                </button>

                <button
                  onClick={handleDownloadPng}
                  disabled={isDownloading}
                  className="p-3.5 rounded-xl bg-[#141622] border border-[#272b3c] hover:border-amber-400/50 text-left transition-all group"
                >
                  <div className="font-mono text-xs font-bold text-white group-hover:text-amber-400 flex items-center justify-between">
                    <span>DOWNLOAD PNG</span>
                    <Download className="w-4 h-4 text-zinc-400 group-hover:text-amber-400" />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">Upload to Slack channels or direct messages</p>
                </button>
              </div>
            </div>
          )}

          {activePlatform === 'telegram' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                Send as crisp PNG or copy formatted text for Telegram.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadPng}
                  disabled={isDownloading}
                  className="p-3.5 rounded-xl bg-[#141622] border border-[#272b3c] hover:border-sky-400/50 text-left transition-all group"
                >
                  <div className="font-mono text-xs font-bold text-white group-hover:text-sky-400 flex items-center justify-between">
                    <span>DOWNLOAD PNG</span>
                    <Download className="w-4 h-4 text-zinc-400 group-hover:text-sky-400" />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">Send as photo or uncompressed document</p>
                </button>

                <button
                  onClick={() => triggerCopy('tg-text', exportPlainText(artifact))}
                  className="p-3.5 rounded-xl bg-[#141622] border border-[#272b3c] hover:border-sky-400/50 text-left transition-all group"
                >
                  <div className="font-mono text-xs font-bold text-white group-hover:text-sky-400 flex items-center justify-between">
                    <span>{copiedKey === 'tg-text' ? 'COPIED!' : 'COPY TEXT'}</span>
                    {copiedKey === 'tg-text' ? <Check className="w-4 h-4 text-sky-400" /> : <Copy className="w-4 h-4 text-zinc-400 group-hover:text-sky-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">Monospace character art for chats</p>
                </button>
              </div>
            </div>
          )}

          {activePlatform === 'email' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                Email supports styled HTML with embedded inline colors.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => triggerCopy('email-html', exportHtml(artifact))}
                  className="p-3.5 rounded-xl bg-[#141622] border border-[#272b3c] hover:border-rose-400/50 text-left transition-all group"
                >
                  <div className="font-mono text-xs font-bold text-white group-hover:text-rose-400 flex items-center justify-between">
                    <span>{copiedKey === 'email-html' ? 'COPIED HTML!' : 'COPY HTML'}</span>
                    {copiedKey === 'email-html' ? <Check className="w-4 h-4 text-rose-400" /> : <Copy className="w-4 h-4 text-zinc-400 group-hover:text-rose-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">Inline styled spans preserve exact RGB in HTML emails</p>
                </button>

                <button
                  onClick={handleDownloadPng}
                  disabled={isDownloading}
                  className="p-3.5 rounded-xl bg-[#141622] border border-[#272b3c] hover:border-rose-400/50 text-left transition-all group"
                >
                  <div className="font-mono text-xs font-bold text-white group-hover:text-rose-400 flex items-center justify-between">
                    <span>DOWNLOAD PNG</span>
                    <Download className="w-4 h-4 text-zinc-400 group-hover:text-rose-400" />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">Attach PNG to email message</p>
                </button>
              </div>
            </div>
          )}

          {activePlatform === 'x' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                X / Twitter renders images beautifully with high contrast.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadPng}
                  disabled={isDownloading}
                  className="p-3.5 rounded-xl bg-[#141622] border border-[#272b3c] hover:border-zinc-300/50 text-left transition-all group"
                >
                  <div className="font-mono text-xs font-bold text-white group-hover:text-white flex items-center justify-between">
                    <span>DOWNLOAD PNG</span>
                    <Download className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">Upload directly to tweet</p>
                </button>

                <button
                  onClick={() => triggerCopy('x-cap', `Terminal artwork created with @TermiArt (${artifact.renderer.toUpperCase()}) #ASCIIart #TerminalArt #CreativeCoding`)}
                  className="p-3.5 rounded-xl bg-[#141622] border border-[#272b3c] hover:border-zinc-300/50 text-left transition-all group"
                >
                  <div className="font-mono text-xs font-bold text-white group-hover:text-white flex items-center justify-between">
                    <span>{copiedKey === 'x-cap' ? 'COPIED CAPTION!' : 'COPY CAPTION'}</span>
                    {copiedKey === 'x-cap' ? <Check className="w-4 h-4 text-[#00ff88]" /> : <Copy className="w-4 h-4 text-zinc-400 group-hover:text-white" />}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">Copy ready-to-post hashtags & caption</p>
                </button>
              </div>
            </div>
          )}

          {/* Native Web Share button */}
          <div className="pt-2 border-t border-[#1a1d28]">
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 rounded-xl bg-[#00ff88] text-black font-mono text-xs font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-[#33ff9f] active:scale-98 transition-all shadow-[0_0_20px_rgba(0,255,136,0.25)]"
            >
              <Share2 className="w-4 h-4" />
              <span>SYSTEM SHARE DIALOG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
