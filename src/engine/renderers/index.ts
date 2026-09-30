import { ColorEngine } from '../colorEngine';
import { ColorRGB, RenderOptions, TerminalArtifact, TerminalCell } from '../types';

export interface RendererInterface {
  name: string;
  render(
    pixelData: Uint8ClampedArray,
    cols: number,
    rows: number,
    options: RenderOptions
  ): TerminalCell[][];
}

/**
 * Standard ASCII Renderer
 */
export class AsciiRenderer implements RendererInterface {
  public name = 'ASCII';
  private static readonly RAMP = ' .:-=+*#%@';

  public render(
    pixelData: Uint8ClampedArray,
    cols: number,
    rows: number,
    options: RenderOptions
  ): TerminalCell[][] {
    const ramp = AsciiRenderer.RAMP;
    const rampLen = ramp.length;
    const cells: TerminalCell[][] = [];

    for (let y = 0; y < rows; y++) {
      const row: TerminalCell[] = [];
      const yRatio = y / (rows || 1);

      for (let x = 0; x < cols; x++) {
        const xRatio = x / (cols || 1);
        const idx = (y * cols + x) * 4;
        const r = pixelData[idx];
        const g = pixelData[idx + 1];
        const b = pixelData[idx + 2];

        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const charIdx = Math.min(rampLen - 1, Math.floor(lum * rampLen));
        const char = ramp[charIdx];

        const fg = ColorEngine.apply([r, g, b], options.theme, lum, xRatio, yRatio);
        row.push({ char, fg });
      }
      cells.push(row);
    }

    return cells;
  }
}

/**
 * Dense ASCII Renderer (70-level density ramp)
 */
export class DenseAsciiRenderer implements RendererInterface {
  public name = 'Dense ASCII';
  private static readonly RAMP =
    ' .`\'^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';

  public render(
    pixelData: Uint8ClampedArray,
    cols: number,
    rows: number,
    options: RenderOptions
  ): TerminalCell[][] {
    const ramp = DenseAsciiRenderer.RAMP;
    const rampLen = ramp.length;
    const cells: TerminalCell[][] = [];

    for (let y = 0; y < rows; y++) {
      const row: TerminalCell[] = [];
      const yRatio = y / (rows || 1);

      for (let x = 0; x < cols; x++) {
        const xRatio = x / (cols || 1);
        const idx = (y * cols + x) * 4;
        const r = pixelData[idx];
        const g = pixelData[idx + 1];
        const b = pixelData[idx + 2];

        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const charIdx = Math.min(rampLen - 1, Math.floor(lum * rampLen));
        const char = ramp[charIdx];

        const fg = ColorEngine.apply([r, g, b], options.theme, lum, xRatio, yRatio);
        row.push({ char, fg });
      }
      cells.push(row);
    }

    return cells;
  }
}

/**
 * Unicode Shading Block Renderer ( ░▒▓█)
 */
export class UnicodeRenderer implements RendererInterface {
  public name = 'Unicode';
  private static readonly RAMP = [' ', '░', '▒', '▓', '█'];

  public render(
    pixelData: Uint8ClampedArray,
    cols: number,
    rows: number,
    options: RenderOptions
  ): TerminalCell[][] {
    const ramp = UnicodeRenderer.RAMP;
    const rampLen = ramp.length;
    const cells: TerminalCell[][] = [];

    for (let y = 0; y < rows; y++) {
      const row: TerminalCell[] = [];
      const yRatio = y / (rows || 1);

      for (let x = 0; x < cols; x++) {
        const xRatio = x / (cols || 1);
        const idx = (y * cols + x) * 4;
        const r = pixelData[idx];
        const g = pixelData[idx + 1];
        const b = pixelData[idx + 2];

        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const charIdx = Math.min(rampLen - 1, Math.floor(lum * rampLen));
        const char = ramp[charIdx];

        const fg = ColorEngine.apply([r, g, b], options.theme, lum, xRatio, yRatio);
        row.push({ char, fg });
      }
      cells.push(row);
    }

    return cells;
  }
}

/**
 * Halfblock TrueColor Renderer
 * Packs two vertical pixels into each character cell using upper half block '▀' (U+2580).
 * Foreground color = upper pixel RGB, Background color = lower pixel RGB.
 */
export class HalfblockRenderer implements RendererInterface {
  public name = 'Half Block';

  public render(
    pixelData: Uint8ClampedArray,
    cols: number,
    rows: number,
    options: RenderOptions
  ): TerminalCell[][] {
    const cells: TerminalCell[][] = [];
    const totalPixelRows = rows * 2;

    for (let r = 0; r < rows; r++) {
      const row: TerminalCell[] = [];
      const topY = r * 2;
      const botY = topY + 1;
      const yRatio = topY / (totalPixelRows || 1);

      for (let x = 0; x < cols; x++) {
        const xRatio = x / (cols || 1);

        // Top pixel
        const topIdx = (topY * cols + x) * 4;
        const tr = pixelData[topIdx];
        const tg = pixelData[topIdx + 1];
        const tb = pixelData[topIdx + 2];
        const tLum = (0.299 * tr + 0.587 * tg + 0.114 * tb) / 255;
        const topFg = ColorEngine.apply([tr, tg, tb], options.theme, tLum, xRatio, yRatio);

        // Bottom pixel
        let botBg: ColorRGB = [0, 0, 0];
        if (botY < totalPixelRows) {
          const botIdx = (botY * cols + x) * 4;
          const br = pixelData[botIdx];
          const bg = pixelData[botIdx + 1];
          const bb = pixelData[botIdx + 2];
          const bLum = (0.299 * br + 0.587 * bg + 0.114 * bb) / 255;
          botBg = ColorEngine.apply([br, bg, bb], options.theme, bLum, xRatio, yRatio);
        }

        row.push({
          char: '▀',
          fg: topFg,
          bg: botBg,
        });
      }
      cells.push(row);
    }

    return cells;
  }
}

/**
 * Braille 2x4 Matrix Renderer
 * Each character cell maps a 2x4 pixel block to Unicode Braille codepoint:
 * 0x2800 + (dot1 | dot2 | dot3 | dot4 | dot5 | dot6 | dot7 | dot8)
 */
export class BrailleRenderer implements RendererInterface {
  public name = 'Braille';

  public render(
    pixelData: Uint8ClampedArray,
    cols: number,
    rows: number,
    options: RenderOptions
  ): TerminalCell[][] {
    const cells: TerminalCell[][] = [];

    // Braille dot offsets:
    // Dot 1: (0, 0) = 0x01
    // Dot 2: (0, 1) = 0x02
    // Dot 3: (0, 2) = 0x04
    // Dot 4: (1, 0) = 0x08
    // Dot 5: (1, 1) = 0x10
    // Dot 6: (1, 2) = 0x20
    // Dot 7: (0, 3) = 0x40
    // Dot 8: (1, 3) = 0x80

    for (let y = 0; y < rows; y++) {
      const row: TerminalCell[] = [];
      const yRatio = y / (rows || 1);

      for (let x = 0; x < cols; x++) {
        const xRatio = x / (cols || 1);
        const idx = (y * cols + x) * 4;
        const r = pixelData[idx];
        const g = pixelData[idx + 1];
        const b = pixelData[idx + 2];

        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        // Map luminance into braille density patterns
        let pattern = 0;
        if (lum > 0.12) pattern |= 0x01;
        if (lum > 0.25) pattern |= 0x08;
        if (lum > 0.38) pattern |= 0x02;
        if (lum > 0.50) pattern |= 0x10;
        if (lum > 0.62) pattern |= 0x04;
        if (lum > 0.75) pattern |= 0x20;
        if (lum > 0.88) pattern |= 0x40;
        if (lum > 0.95) pattern |= 0x80;

        const char = pattern === 0 ? ' ' : String.fromCharCode(0x2800 + pattern);
        const fg = ColorEngine.apply([r, g, b], options.theme, lum, xRatio, yRatio);
        row.push({ char, fg });
      }
      cells.push(row);
    }

    return cells;
  }
}

/**
 * Matrix Stream Renderer
 * Katakana and Matrix cipher glyphs with phosphor highlights
 */
export class MatrixRenderer implements RendererInterface {
  public name = 'Matrix';
  private static readonly GLYPHS =
    'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ1234567890:;=*+-<>';

  public render(
    pixelData: Uint8ClampedArray,
    cols: number,
    rows: number,
    options: RenderOptions
  ): TerminalCell[][] {
    const glyphs = MatrixRenderer.GLYPHS;
    const glyphLen = glyphs.length;
    const cells: TerminalCell[][] = [];

    for (let y = 0; y < rows; y++) {
      const row: TerminalCell[] = [];
      const yRatio = y / (rows || 1);

      for (let x = 0; x < cols; x++) {
        const xRatio = x / (cols || 1);
        const idx = (y * cols + x) * 4;
        const r = pixelData[idx];
        const g = pixelData[idx + 1];
        const b = pixelData[idx + 2];

        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        let char = ' ';
        if (lum > 0.08) {
          // Pseudorandom yet deterministic glyph based on position and lum
          const gIdx = Math.abs(Math.floor((x * 13 + y * 29 + lum * 100))) % glyphLen;
          char = glyphs[gIdx];
        }

        // Apply Matrix theme by default unless explicitly another theme is requested
        const themeToUse = options.theme === 'original' ? 'matrix' : options.theme;
        const fg = ColorEngine.apply([r, g, b], themeToUse, lum, xRatio, yRatio);

        row.push({ char, fg });
      }
      cells.push(row);
    }

    return cells;
  }
}

/**
 * Renderer Registry
 */
export const RENDERERS: Record<string, RendererInterface> = {
  ascii: new AsciiRenderer(),
  dense_ascii: new DenseAsciiRenderer(),
  unicode: new UnicodeRenderer(),
  halfblock: new HalfblockRenderer(),
  braille: new BrailleRenderer(),
  matrix: new MatrixRenderer(),
};
