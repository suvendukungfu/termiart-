import { ColorRGB, ThemeType } from './types';

export class ColorEngine {
  private static randomPaletteCache: ColorRGB[] | null = null;

  public static resetRandomPalette(): void {
    const hue1 = Math.floor(Math.random() * 360);
    const hue2 = (hue1 + 60 + Math.floor(Math.random() * 120)) % 360;
    this.randomPaletteCache = [
      this.hslToRgb(hue1, 0.9, 0.2),
      this.hslToRgb(hue1, 0.95, 0.5),
      this.hslToRgb(hue2, 0.9, 0.7),
      this.hslToRgb(hue2, 0.8, 0.9),
    ];
  }

  public static apply(
    rgb: ColorRGB,
    theme: ThemeType,
    normalizedLuminance: number,
    xRatio: number = 0,
    yRatio: number = 0
  ): ColorRGB {
    const [r, g, b] = rgb;
    const lum = Math.max(0, Math.min(1, normalizedLuminance));

    switch (theme) {
      case 'original':
        return [r, g, b];

      case 'mono': {
        const v = Math.round(lum * 255);
        return [v, v, v];
      }

      case 'matrix': {
        const v = Math.round(lum * 255);
        // Deep matrix green with phosphor glow on highlights
        const green = Math.min(255, Math.round(v * 1.15 + (v > 180 ? 40 : 0)));
        const red = v > 220 ? Math.round((v - 220) * 4) : Math.round(v * 0.08);
        const blue = v > 200 ? Math.round((v - 200) * 3) : Math.round(v * 0.15);
        return [red, green, blue];
      }

      case 'cyberpunk': {
        // Neon cyan (0, 229, 255) to electric magenta (255, 0, 128) and yellow (255, 235, 0)
        if (lum < 0.2) {
          const t = lum / 0.2;
          return this.lerpRgb([10, 10, 28], [50, 10, 80], t);
        } else if (lum < 0.5) {
          const t = (lum - 0.2) / 0.3;
          return this.lerpRgb([50, 10, 80], [255, 0, 128], t);
        } else if (lum < 0.8) {
          const t = (lum - 0.5) / 0.3;
          return this.lerpRgb([255, 0, 128], [0, 229, 255], t);
        } else {
          const t = (lum - 0.8) / 0.2;
          return this.lerpRgb([0, 229, 255], [255, 255, 180], t);
        }
      }

      case 'fire': {
        // Dark crimson -> flame red -> fiery orange -> bright yellow -> white hot
        if (lum < 0.25) {
          const t = lum / 0.25;
          return this.lerpRgb([20, 0, 0], [160, 15, 0], t);
        } else if (lum < 0.55) {
          const t = (lum - 0.25) / 0.3;
          return this.lerpRgb([160, 15, 0], [255, 100, 0], t);
        } else if (lum < 0.85) {
          const t = (lum - 0.55) / 0.3;
          return this.lerpRgb([255, 100, 0], [255, 225, 60], t);
        } else {
          const t = (lum - 0.85) / 0.15;
          return this.lerpRgb([255, 225, 60], [255, 255, 240], t);
        }
      }

      case 'ocean': {
        // Mariana trench navy -> deep azure -> bioluminescent turquoise -> foam white
        if (lum < 0.3) {
          const t = lum / 0.3;
          return this.lerpRgb([4, 12, 35], [0, 65, 120], t);
        } else if (lum < 0.65) {
          const t = (lum - 0.3) / 0.35;
          return this.lerpRgb([0, 65, 120], [0, 200, 210], t);
        } else if (lum < 0.9) {
          const t = (lum - 0.65) / 0.25;
          return this.lerpRgb([0, 200, 210], [120, 255, 235], t);
        } else {
          const t = (lum - 0.9) / 0.1;
          return this.lerpRgb([120, 255, 235], [240, 255, 255], t);
        }
      }

      case 'purple_neon': {
        // Deep obsidian -> neon violet -> hot magenta -> soft lavender glow
        if (lum < 0.3) {
          const t = lum / 0.3;
          return this.lerpRgb([15, 5, 30], [110, 0, 190], t);
        } else if (lum < 0.7) {
          const t = (lum - 0.3) / 0.4;
          return this.lerpRgb([110, 0, 190], [225, 40, 240], t);
        } else {
          const t = (lum - 0.7) / 0.3;
          return this.lerpRgb([225, 40, 240], [255, 220, 255], t);
        }
      }

      case 'rainbow': {
        // Hue mapped by coordinates + luminance
        const hue = ((xRatio * 0.6 + yRatio * 0.4 + lum * 0.5) % 1.0) * 360;
        return this.hslToRgb(hue, 0.9, 0.15 + lum * 0.7);
      }

      case 'anime': {
        // Cel-shaded pop art: saturate RGB and quantize into discrete stylized bands
        const hsl = this.rgbToHsl(r, g, b);
        const sat = Math.min(1.0, hsl.s * 1.45 + 0.1);
        let light = hsl.l;
        if (light < 0.2) light = 0.12;
        else if (light < 0.45) light = 0.35;
        else if (light < 0.75) light = 0.65;
        else light = 0.92;
        return this.hslToRgb(hsl.h, sat, light);
      }

      case 'random': {
        if (!this.randomPaletteCache) {
          this.resetRandomPalette();
        }
        const pal = this.randomPaletteCache!;
        const idx = Math.min(pal.length - 1, Math.floor(lum * pal.length));
        return pal[idx];
      }

      default:
        return [r, g, b];
    }
  }

  private static lerpRgb(a: ColorRGB, b: ColorRGB, t: number): ColorRGB {
    const clamped = Math.max(0, Math.min(1, t));
    return [
      Math.round(a[0] + (b[0] - a[0]) * clamped),
      Math.round(a[1] + (b[1] - a[1]) * clamped),
      Math.round(a[2] + (b[2] - a[2]) * clamped),
    ];
  }

  public static hslToRgb(h: number, s: number, l: number): ColorRGB {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const hp = (h % 360) / 60;
    const x = c * (1 - Math.abs((hp % 2) - 1));
    let r1 = 0, g1 = 0, b1 = 0;
    if (hp >= 0 && hp < 1) [r1, g1, b1] = [c, x, 0];
    else if (hp >= 1 && hp < 2) [r1, g1, b1] = [x, c, 0];
    else if (hp >= 2 && hp < 3) [r1, g1, b1] = [0, c, x];
    else if (hp >= 3 && hp < 4) [r1, g1, b1] = [0, x, c];
    else if (hp >= 4 && hp < 5) [r1, g1, b1] = [x, 0, c];
    else if (hp >= 5 && hp < 6) [r1, g1, b1] = [c, 0, x];
    const m = l - c / 2;
    return [
      Math.round((r1 + m) * 255),
      Math.round((g1 + m) * 255),
      Math.round((b1 + m) * 255),
    ];
  }

  public static rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const delta = max - min;
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (delta !== 0) {
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
      if (max === rNorm) {
        h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) * 60;
      } else if (max === gNorm) {
        h = ((bNorm - rNorm) / delta + 2) * 60;
      } else {
        h = ((rNorm - gNorm) / delta + 4) * 60;
      }
    }
    return { h, s, l };
  }
}
