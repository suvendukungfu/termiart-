import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { TerminalArtifact } from '../engine/types';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Eye, Check, Copy, Radio } from 'lucide-react';
import { sound } from '../utils/audio';

export interface TerminalDisplayHandle {
  toggleFullscreen: () => void;
}

interface TerminalDisplayProps {
  artifact: TerminalArtifact | null;
  isLoading?: boolean;
  onCopyQuick?: () => void;
  scanlinesEnabled?: boolean;
  isAnimating?: boolean;
  animationType?: string;
}

export const TerminalDisplay = forwardRef<TerminalDisplayHandle, TerminalDisplayProps>(
  (
    {
      artifact,
      isLoading = false,
      onCopyQuick,
      scanlinesEnabled = true,
      isAnimating = false,
      animationType = 'matrix',
    },
    ref
  ) => {
    const [fontSize, setFontSize] = useState<number>(10);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [showScanlines, setShowScanlines] = useState<boolean>(scanlinesEnabled);
    const [copiedQuick, setCopiedQuick] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-adjust font size based on artifact width
    useEffect(() => {
      if (artifact && artifact.width > 0) {
        if (artifact.width > 140) setFontSize(7.5);
        else if (artifact.width > 100) setFontSize(9);
        else if (artifact.width > 70) setFontSize(10);
        else setFontSize(12);
      }
    }, [artifact?.width]);

    const toggleFullscreen = () => {
      sound.playClick();
      if (!containerRef.current) return;
      if (!document.fullscreenElement) {
        containerRef.current
          .requestFullscreen()
          .then(() => setIsFullscreen(true))
          .catch(() => {});
      } else {
        document
          .exitFullscreen()
          .then(() => setIsFullscreen(false))
          .catch(() => {});
      }
    };

    useImperativeHandle(ref, () => ({
      toggleFullscreen,
    }));

    const handleQuickCopy = () => {
      sound.playCopy();
      if (onCopyQuick) {
        onCopyQuick();
      }
      setCopiedQuick(true);
      setTimeout(() => setCopiedQuick(false), 2000);
    };

    if (!artifact && !isLoading) {
      return (
        <div className="w-full h-96 rounded-2xl bg-[#08090d] border border-[#181a24] flex flex-col items-center justify-center p-8 text-center shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-[#0e1017] border border-[#232735] flex items-center justify-center text-zinc-500 mb-4">
            <span className="font-mono text-xl text-[#00ff88]">&gt;_</span>
          </div>
          <p className="font-mono text-sm text-zinc-300 mb-1">Awaiting image stream</p>
          <p className="font-mono text-xs text-zinc-500">
            Drop an image or click "Try Demo" to generate terminal art.
          </p>
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className={`relative w-full rounded-2xl bg-[#050507] border border-[#181a24] overflow-hidden flex flex-col shadow-2xl transition-all ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : ''
        }`}
      >
        {/* Terminal Title Bar */}
        <div className="h-10 bg-[#0a0c12] border-b border-[#181a24] px-4 flex items-center justify-between select-none">
          {/* macOS window dots */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] opacity-80 hover:opacity-100 transition-opacity" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] opacity-80 hover:opacity-100 transition-opacity" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] opacity-80 hover:opacity-100 transition-opacity" />
            <span className="ml-3 text-[11px] font-mono text-zinc-400 hidden sm:inline">
              termiart://stage
            </span>
          </div>

          {/* Live Technical Metadata */}
          {artifact && (
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider">
              {isAnimating ? (
                <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-500/40 flex items-center gap-1 animate-pulse">
                  <Radio className="w-3 h-3 text-rose-400" />
                  <span>{animationType.toUpperCase()} ANIM</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-[#10121a] text-[#00ff88] border border-[#1f2333]">
                  {artifact.renderer.toUpperCase()}
                </span>
              )}
              <span className="px-2 py-0.5 rounded bg-[#10121a] text-cyan-400 border border-[#1f2333] hidden md:inline">
                {artifact.theme.toUpperCase()}
              </span>
              <span className="text-zinc-500 hidden sm:inline">
                {artifact.width} × {artifact.height}
              </span>
              <span className="text-zinc-600 hidden lg:inline">{artifact.renderTimeMs}ms</span>
            </div>
          )}

          {/* Quick controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                sound.playClick();
                setFontSize((prev) => Math.max(5.5, prev - 1));
              }}
              title="Decrease font size"
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-[#141620]"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="text-[10px] font-mono text-zinc-500 px-1 w-6 text-center">
              {fontSize}px
            </span>

            <button
              onClick={() => {
                sound.playClick();
                setFontSize((prev) => Math.min(22, prev + 1));
              }}
              title="Increase font size"
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-[#141620]"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setShowScanlines((prev) => !prev);
              }}
              title="Toggle CRT Scanlines"
              className={`p-1 rounded text-xs transition-colors ${
                showScanlines ? 'text-[#00ff88] bg-[#141620]' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {onCopyQuick && (
              <button
                onClick={handleQuickCopy}
                title="Quick Copy Plain Text"
                className="p-1 rounded text-zinc-400 hover:text-[#00ff88] hover:bg-[#141620] transition-colors ml-1"
              >
                {copiedQuick ? <Check className="w-3.5 h-3.5 text-[#00ff88]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-[#141620] ml-1"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Main Terminal Viewport */}
        <div className="relative flex-1 bg-[#050507] overflow-auto p-4 sm:p-6 flex items-center justify-center min-h-85 max-h-[78vh]">
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-[#050507]/90 backdrop-blur-xs z-30 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#00ff88] border-t-transparent animate-spin" />
              <div className="font-mono text-xs text-[#00ff88] tracking-widest uppercase animate-pulse">
                ANALYZING PIXELS &amp; RENDERING...
              </div>
            </div>
          )}

          {/* Scanlines overlay */}
          {showScanlines && <div className="absolute inset-0 terminal-scanlines z-10 pointer-events-none" />}

          {/* Terminal Text Pre */}
          {artifact && (
            <pre
              className="font-mono-term inline-block leading-none tracking-normal select-all m-auto transition-transform"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: artifact.renderer === 'halfblock' ? '1.0' : '1.1',
                letterSpacing: '0px',
              }}
            >
              {artifact.cells.map((row, rIdx) => (
                <div key={rIdx} className="whitespace-pre">
                  {row.map((cell, cIdx) => {
                    const fgStyle = `rgb(${cell.fg[0]},${cell.fg[1]},${cell.fg[2]})`;
                    const bgStyle = cell.bg
                      ? `rgb(${cell.bg[0]},${cell.bg[1]},${cell.bg[2]})`
                      : undefined;
                    return (
                      <span
                        key={cIdx}
                        style={{
                          color: fgStyle,
                          backgroundColor: bgStyle,
                        }}
                      >
                        {cell.char}
                      </span>
                    );
                  })}
                </div>
              ))}
            </pre>
          )}
        </div>

        {/* Subtle Bottom Status Bar */}
        <div className="h-7 bg-[#0a0c12] border-t border-[#161822] px-4 flex items-center justify-between text-[10px] font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
            <span>OUTPUT: UTF-8 / TRUECOLOR</span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span>CLIENT-SIDE ENGINE</span>
            <span>•</span>
            <span>100% PRIVATE</span>
          </div>
        </div>
      </div>
    );
  }
);
