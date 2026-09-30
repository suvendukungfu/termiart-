import { ImageAnalysis, RenderOptions } from './types';

export class ImageProcessor {
  /**
   * Safely loads an image from a File, Blob, or URL into an HTMLImageElement
   */
  public static loadImage(source: File | Blob | string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      let objectUrl: string | null = null;
      if (source instanceof Blob) {
        objectUrl = URL.createObjectURL(source);
        img.src = objectUrl;
      } else {
        img.src = source;
      }

      img.onload = () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
        resolve(img);
      };

      img.onerror = (err) => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
        reject(new Error('Failed to load image file: ' + err));
      };
    });
  }

  /**
   * Analyzes basic image metrics
   */
  public static analyze(img: HTMLImageElement): ImageAnalysis {
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    const aspectRatio = width / (height || 1);

    return {
      width,
      height,
      aspectRatio,
      averageLuminance: 0.5,
      isDark: false,
      hasColor: true,
    };
  }

  /**
   * Calculates target character dimensions given desired column width and renderer type
   */
  public static calculateDimensions(
    img: HTMLImageElement,
    targetCols: number,
    renderer: string,
    forcedHeight?: number
  ): { cols: number; rows: number } {
    const imgWidth = img.naturalWidth || img.width;
    const imgHeight = img.naturalHeight || img.height;
    const aspect = imgWidth / (imgHeight || 1);

    const cols = Math.max(10, Math.min(300, targetCols));

    if (forcedHeight && forcedHeight > 0) {
      return { cols, rows: forcedHeight };
    }

    // Terminal aspect correction factor:
    // Regular characters: font cell height is ~2x width -> factor 0.5
    // Halfblock: 2 pixels per cell vertically -> factor 1.0 (twice the vertical resolution)
    // Braille: 2x4 dot matrix -> factor 0.5
    const charAspect = renderer === 'halfblock' ? 1.0 : 0.5;
    const rows = Math.max(5, Math.round(cols / aspect * charAspect));

    return { cols, rows };
  }

  /**
   * Samples and filters image pixels onto an offscreen canvas
   */
  public static processPixels(
    img: HTMLImageElement,
    cols: number,
    rows: number,
    options: RenderOptions
  ): {
    data: Uint8ClampedArray;
    cols: number;
    rows: number;
  } {
    // For halfblock, we need 2 vertical pixels per row
    const pixelHeight = options.renderer === 'halfblock' ? rows * 2 : rows;
    const pixelWidth = cols;

    const canvas = document.createElement('canvas');
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      throw new Error('Canvas 2D context creation failed');
    }

    // Use high quality image smoothing for downsampling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, pixelWidth, pixelHeight);

    const imageData = ctx.getImageData(0, 0, pixelWidth, pixelHeight);
    const data = imageData.data;

    // Apply filters: Contrast, Brightness, Sharpness, Gamma, Invert
    const contrast = options.contrast ?? 1.0;
    const brightness = options.brightness ?? 0.0;
    const gamma = options.gamma ?? 1.0;
    const invert = options.invert ?? false;
    const sharpness = options.sharpness ?? 0.0;
    const edgeDetect = options.edgeDetect ?? false;

    // Step 1: Pixel level color adjustments
    const contrastFactor = (259 * (contrast * 128 + 128)) / (128 * (259 - contrast * 128));

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Invert
      if (invert) {
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
      }

      // Brightness
      if (brightness !== 0) {
        const bOffset = brightness * 128;
        r = Math.min(255, Math.max(0, r + bOffset));
        g = Math.min(255, Math.max(0, g + bOffset));
        b = Math.min(255, Math.max(0, b + bOffset));
      }

      // Contrast
      if (contrast !== 1.0) {
        r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128));
        g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128));
        b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128));
      }

      // Gamma
      if (gamma !== 1.0 && gamma > 0.01) {
        const invGamma = 1.0 / gamma;
        r = Math.min(255, Math.max(0, Math.pow(r / 255, invGamma) * 255));
        g = Math.min(255, Math.max(0, Math.pow(g / 255, invGamma) * 255));
        b = Math.min(255, Math.max(0, Math.pow(b / 255, invGamma) * 255));
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    // Step 2: Edge detection (Sobel) if enabled
    if (edgeDetect) {
      this.applySobelFilter(data, pixelWidth, pixelHeight);
    } else if (sharpness > 0) {
      this.applySharpen(data, pixelWidth, pixelHeight, sharpness);
    }

    return {
      data,
      cols: pixelWidth,
      rows: options.renderer === 'halfblock' ? rows : pixelHeight,
    };
  }

  private static applySobelFilter(data: Uint8ClampedArray, width: number, height: number): void {
    const copy = new Uint8ClampedArray(data);
    const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let xSum = 0;
        let ySum = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const lum = 0.299 * copy[idx] + 0.587 * copy[idx + 1] + 0.114 * copy[idx + 2];
            const kIdx = (ky + 1) * 3 + (kx + 1);
            xSum += lum * gx[kIdx];
            ySum += lum * gy[kIdx];
          }
        }

        const mag = Math.min(255, Math.sqrt(xSum * xSum + ySum * ySum));
        const outIdx = (y * width + x) * 4;
        data[outIdx] = mag;
        data[outIdx + 1] = mag;
        data[outIdx + 2] = mag;
      }
    }
  }

  private static applySharpen(data: Uint8ClampedArray, width: number, height: number, amount: number): void {
    const copy = new Uint8ClampedArray(data);
    const strength = Math.min(1.0, amount);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        for (let c = 0; c < 3; c++) {
          const center = copy[idx + c];
          const top = copy[((y - 1) * width + x) * 4 + c];
          const bottom = copy[((y + 1) * width + x) * 4 + c];
          const left = copy[(y * width + (x - 1)) * 4 + c];
          const right = copy[(y * width + (x + 1)) * 4 + c];

          const sharpVal = center * 5 - (top + bottom + left + right);
          data[idx + c] = Math.min(255, Math.max(0, center + (sharpVal - center) * strength));
        }
      }
    }
  }
}
