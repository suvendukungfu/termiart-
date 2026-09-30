import { TerminalArtifact, TerminalCell, ColorRGB, AnimationType } from './types';
import { ColorEngine } from './colorEngine';

export class TerminalAnimator {
  private static matrixDrops: number[] = [];
  private static readonly MATRIX_GLYPHS =
    'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ1234567890:;=*+-<>';

  /**
   * Applies animation mutation to the artifact cells for frame `t`
   */
  public static animateFrame(
    baseArtifact: TerminalArtifact,
    type: AnimationType,
    frame: number
  ): TerminalArtifact {
    if (type === 'none') return baseArtifact;

    // Check prefers-reduced-motion
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return baseArtifact;
    }

    const { width, height, cells } = baseArtifact;

    switch (type) {
      case 'matrix': {
        // Initialize or resize drops
        if (this.matrixDrops.length !== width) {
          this.matrixDrops = Array.from({ length: width }, () =>
            Math.floor(Math.random() * height)
          );
        }

        const glyphs = this.MATRIX_GLYPHS;
        const glyphLen = glyphs.length;

        const newCells: TerminalCell[][] = cells.map((row, y) =>
          row.map((cell, x) => {
            const dropY = this.matrixDrops[x];
            const dist = (y - dropY + height) % height;

            if (dist === 0) {
              // Bright leading head of the rain drop
              const gIdx = Math.floor(Math.random() * glyphLen);
              return {
                char: glyphs[gIdx],
                fg: [220, 255, 230],
                bg: cell.bg,
              };
            } else if (dist < 6) {
              // Trailing phosphor stream
              const trailLum = (6 - dist) / 6;
              const gIdx = (x * 7 + y * 13 + frame) % glyphLen;
              return {
                char: glyphs[gIdx],
                fg: [
                  Math.round(cell.fg[0] * 0.2),
                  Math.round(255 * trailLum),
                  Math.round(cell.fg[2] * 0.2),
                ],
                bg: cell.bg,
              };
            }

            return cell;
          })
        );

        // Advance drops periodically
        if (frame % 2 === 0) {
          for (let x = 0; x < width; x++) {
            if (Math.random() > 0.3) {
              this.matrixDrops[x] = (this.matrixDrops[x] + 1) % height;
            }
          }
        }

        return { ...baseArtifact, cells: newCells };
      }

      case 'cycle': {
        // Hue cycling across time
        const hueShift = (frame * 3) % 360;

        const newCells: TerminalCell[][] = cells.map((row) =>
          row.map((cell) => {
            const hsl = ColorEngine.rgbToHsl(cell.fg[0], cell.fg[1], cell.fg[2]);
            const newHue = (hsl.h + hueShift) % 360;
            const newFg = ColorEngine.hslToRgb(newHue, hsl.s, hsl.l);

            let newBg: ColorRGB | undefined = undefined;
            if (cell.bg) {
              const bgHsl = ColorEngine.rgbToHsl(cell.bg[0], cell.bg[1], cell.bg[2]);
              const newBgHue = (bgHsl.h + hueShift) % 360;
              newBg = ColorEngine.hslToRgb(newBgHue, bgHsl.s, bgHsl.l);
            }

            return {
              ...cell,
              fg: newFg,
              bg: newBg,
            };
          })
        );

        return { ...baseArtifact, cells: newCells };
      }

      case 'scanline': {
        // Sweep bar moving down the screen
        const sweepY = Math.floor((frame * 1.5) % (height + 10));

        const newCells: TerminalCell[][] = cells.map((row, y) =>
          row.map((cell) => {
            const dist = Math.abs(y - sweepY);
            if (dist <= 2) {
              const boost = (3 - dist) * 45;
              const fg: ColorRGB = [
                Math.min(255, cell.fg[0] + boost),
                Math.min(255, cell.fg[1] + boost),
                Math.min(255, cell.fg[2] + boost),
              ];
              return { ...cell, fg };
            }
            return cell;
          })
        );

        return { ...baseArtifact, cells: newCells };
      }

      case 'glitch': {
        // Subtle cyber chromatic glitch on select frames
        const isGlitchFrame = frame % 18 === 0 || frame % 19 === 0;
        if (!isGlitchFrame) return baseArtifact;

        const glitchRow = (frame * 7) % height;
        const newCells: TerminalCell[][] = cells.map((row, y) => {
          if (Math.abs(y - glitchRow) < 2) {
            // Shift row cells horizontally by 1-2
            const shift = 2;
            const shiftedRow = [...row.slice(shift), ...row.slice(0, shift)];
            return shiftedRow.map((cell) => ({
              ...cell,
              fg: [255, Math.round(cell.fg[1] * 0.4), 220] as ColorRGB,
            }));
          }
          return row;
        });

        return { ...baseArtifact, cells: newCells };
      }

      case 'flicker': {
        // CRT phosphor intensity fluctuation
        const pulse = 0.88 + Math.sin(frame * 0.4) * 0.12;

        const newCells: TerminalCell[][] = cells.map((row) =>
          row.map((cell) => ({
            ...cell,
            fg: [
              Math.round(cell.fg[0] * pulse),
              Math.round(cell.fg[1] * pulse),
              Math.round(cell.fg[2] * pulse),
            ],
          }))
        );

        return { ...baseArtifact, cells: newCells };
      }

      default:
        return baseArtifact;
    }
  }
}
