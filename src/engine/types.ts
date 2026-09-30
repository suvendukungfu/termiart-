export type RendererType =
  | 'halfblock'
  | 'ascii'
  | 'dense_ascii'
  | 'unicode'
  | 'braille'
  | 'matrix'
  | 'rgb';

export type ThemeType =
  | 'original'
  | 'mono'
  | 'matrix'
  | 'cyberpunk'
  | 'fire'
  | 'ocean'
  | 'purple_neon'
  | 'rainbow'
  | 'anime'
  | 'random';

export type AnimationType =
  | 'none'
  | 'matrix'
  | 'cycle'
  | 'scanline'
  | 'glitch'
  | 'flicker';

export type ColorRGB = [number, number, number];

export interface TerminalCell {
  char: string;
  fg: ColorRGB;
  bg?: ColorRGB;
}

export interface TerminalArtifact {
  cells: TerminalCell[][];
  width: number;
  height: number;
  renderer: RendererType;
  theme: ThemeType;
  contrast: number;
  brightness: number;
  sharpness: number;
  gamma: number;
  edgeDetect: boolean;
  invert: boolean;
  renderTimeMs: number;
  aspectCorrection: number;
  timestamp: number;
}

export interface RenderOptions {
  width: number;
  height?: number;
  renderer: RendererType;
  theme: ThemeType;
  contrast?: number;
  brightness?: number;
  sharpness?: number;
  gamma?: number;
  edgeDetect?: boolean;
  invert?: boolean;
  density?: number;
  dither?: boolean;
  animation?: AnimationType;
  animFrame?: number;
}

export interface ImageAnalysis {
  width: number;
  height: number;
  aspectRatio: number;
  averageLuminance: number;
  isDark: boolean;
  hasColor: boolean;
}
