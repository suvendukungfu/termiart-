import { TerminalArtifact } from '../types';

/**
 * Exports artifact as plain UTF-8 text string
 */
export function exportPlainText(artifact: TerminalArtifact): string {
  return artifact.cells.map((row) => row.map((cell) => cell.char).join('')).join('\n');
}

/**
 * Exports artifact as 24-bit TrueColor ANSI escape sequence string
 */
export function exportAnsi(artifact: TerminalArtifact): string {
  const lines: string[] = [];

  for (const row of artifact.cells) {
    let line = '';
    let lastFg = '';
    let lastBg = '';

    for (const cell of row) {
      const [fr, fg, fb] = cell.fg;
      const fgStr = `${fr};${fg};${fb}`;

      if (cell.bg) {
        const [br, bg, bb] = cell.bg;
        const bgStr = `${br};${bg};${bb}`;

        if (fgStr !== lastFg || bgStr !== lastBg) {
          line += `\x1b[38;2;${fgStr}m\x1b[48;2;${bgStr}m`;
          lastFg = fgStr;
          lastBg = bgStr;
        }
      } else {
        if (fgStr !== lastFg) {
          line += `\x1b[38;2;${fgStr}m`;
          lastFg = fgStr;
        }
      }

      line += cell.char;
    }

    line += '\x1b[0m';
    lines.push(line);
  }

  return lines.join('\n');
}

/**
 * Exports artifact as Markdown code block suitable for Discord or GitHub
 */
export function exportMarkdown(artifact: TerminalArtifact, useAnsi = true): string {
  if (useAnsi) {
    const ansi = exportAnsi(artifact);
    return `\`\`\`ansi\n${ansi}\n\`\`\``;
  }
  const text = exportPlainText(artifact);
  return `\`\`\`text\n${text}\n\`\`\``;
}

/**
 * Exports artifact as a standalone, zero-dependency HTML document
 */
export function exportHtml(artifact: TerminalArtifact): string {
  const rowsHtml: string[] = [];

  for (const row of artifact.cells) {
    let rowContent = '';
    for (const cell of row) {
      const [fr, fg, fb] = cell.fg;
      const fgStyle = `color:rgb(${fr},${fg},${fb});`;
      const bgStyle = cell.bg ? `background-color:rgb(${cell.bg[0]},${cell.bg[1]},${cell.bg[2]});` : '';

      // Escape special HTML chars
      let ch = cell.char;
      if (ch === '&') ch = '&amp;';
      else if (ch === '<') ch = '&lt;';
      else if (ch === '>') ch = '&gt;';
      else if (ch === '"') ch = '&quot;';
      else if (ch === ' ') ch = '&nbsp;';

      rowContent += `<span style="${fgStyle}${bgStyle}">${ch}</span>`;
    }
    rowsHtml.push(rowContent);
  }

  const title = `TermiArt - ${artifact.renderer.toUpperCase()} (${artifact.width}x${artifact.height})`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #08080a;
      color: #f4f4f5;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 32px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
    }
    .terminal-window {
      background: #0b0c10;
      border: 1px solid #1f232e;
      border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      overflow: hidden;
      max-width: 100%;
    }
    .terminal-header {
      background: #14161f;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid #1f232e;
    }
    .dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
    .dot-red { background: #ff5f56; }
    .dot-yellow { background: #ffbd2e; }
    .dot-green { background: #27c93f; }
    .title {
      color: #71717a;
      font-size: 12px;
      font-family: monospace;
      margin-left: auto;
      margin-right: auto;
    }
    pre {
      padding: 24px;
      font-family: "Geist Mono:SemiBold", "SF Mono", Menlo, Consolas, monospace;
      font-size: 11px;
      line-height: 1.0;
      letter-spacing: 0;
      overflow-x: auto;
      user-select: all;
    }
  </style>
</head>
<body>
  <div class="terminal-window">
    <div class="terminal-header">
      <span class="dot dot-red"></span>
      <span class="dot dot-yellow"></span>
      <span class="dot dot-green"></span>
      <span class="title">termiart — ${artifact.renderer} • ${artifact.theme} • ${artifact.width}×${artifact.height}</span>
    </div>
    <pre><code>${rowsHtml.join('\n')}</code></pre>
  </div>
</body>
</html>`;
}

/**
 * Rasterizes artifact into a crisp, high-resolution PNG image
 */
export async function exportCanvasPng(
  artifact: TerminalArtifact,
  options: {
    fontSize?: number;
    padding?: number;
    includeHeader?: boolean;
    scale?: number;
  } = {}
): Promise<Blob> {
  const fontSize = options.fontSize ?? 12;
  const padding = options.padding ?? 24;
  const includeHeader = options.includeHeader ?? true;
  const scale = options.scale ?? 2; // 2x for Retina sharpness

  // Monospace character aspect ratio typically charWidth ~ fontSize * 0.6
  // For halfblock, line height = fontSize
  const charWidth = Math.round(fontSize * 0.6);
  const charHeight = fontSize;
  const headerHeight = includeHeader ? 36 : 0;

  const contentWidth = artifact.width * charWidth;
  const contentHeight = artifact.height * charHeight;

  const totalWidth = contentWidth + padding * 2;
  const totalHeight = contentHeight + padding * 2 + headerHeight;

  const canvas = document.createElement('canvas');
  canvas.width = totalWidth * scale;
  canvas.height = totalHeight * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context for PNG export');

  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#08080a';
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  // Terminal card container
  ctx.fillStyle = '#0b0c10';
  ctx.strokeStyle = '#1f232e';
  ctx.lineWidth = 1;
  ctx.fillRect(padding / 2, padding / 2, totalWidth - padding, totalHeight - padding);
  ctx.strokeRect(padding / 2, padding / 2, totalWidth - padding, totalHeight - padding);

  // Terminal Window Header
  if (includeHeader) {
    const barY = padding / 2;
    ctx.fillStyle = '#14161f';
    ctx.fillRect(padding / 2, barY, totalWidth - padding, headerHeight);

    // Window control dots
    const dotY = barY + headerHeight / 2;
    const startX = padding / 2 + 16;
    const dots = ['#ff5f56', '#ffbd2e', '#27c93f'];
    dots.forEach((color, i) => {
      ctx.beginPath();
      ctx.arc(startX + i * 16, dotY, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });

    // Window title
    ctx.fillStyle = '#71717a';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      `termiart — ${artifact.renderer.toUpperCase()} • ${artifact.theme.toUpperCase()} (${artifact.width}×${artifact.height})`,
      totalWidth / 2,
      dotY + 4
    );
  }

  // Draw cells
  const originX = padding;
  const originY = padding + headerHeight;

  ctx.font = `600 ${fontSize}px "Geist Mono:SemiBold", "SF Mono", Menlo, monospace`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';

  for (let y = 0; y < artifact.height; y++) {
    const row = artifact.cells[y];
    if (!row) continue;

    for (let x = 0; x < artifact.width; x++) {
      const cell = row[x];
      if (!cell) continue;

      const cellX = originX + x * charWidth;
      const cellY = originY + y * charHeight;

      // Draw background if cell has custom bg (halfblock lower pixel)
      if (cell.bg) {
        ctx.fillStyle = `rgb(${cell.bg[0]},${cell.bg[1]},${cell.bg[2]})`;
        ctx.fillRect(cellX, cellY, charWidth + 0.5, charHeight + 0.5);
      }

      // Draw character
      const [r, g, b] = cell.fg;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillText(cell.char, cellX, cellY);
    }
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate PNG blob'));
    }, 'image/png');
  });
}

/**
 * Generates safe shell execution command without injection risks
 */
export function generateSafeShellCommand(artifact: TerminalArtifact): string {
  const ansi = exportAnsi(artifact);
  // Safely escape single quotes for POSIX sh/bash/zsh
  const escaped = ansi.replace(/'/g, "'\\''");
  return `printf '%b\\n' '${escaped}'`;
}
