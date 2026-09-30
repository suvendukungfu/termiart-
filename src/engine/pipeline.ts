import { ImageProcessor } from './imageProcessor';
import { RENDERERS } from './renderers';
import { RenderOptions, TerminalArtifact } from './types';

export class ArtPipeline {
  /**
   * Executes the full terminal art pipeline from image source to TerminalArtifact
   */
  public static async render(
    source: File | Blob | string,
    options: RenderOptions
  ): Promise<TerminalArtifact> {
    const startTime = performance.now();

    // 1. Decode & load image
    const img = await ImageProcessor.loadImage(source);

    // 2. Determine target grid dimensions
    const { cols, rows } = ImageProcessor.calculateDimensions(
      img,
      options.width,
      options.renderer,
      options.height
    );

    // 3. Process pixel buffer with image adjustments
    const { data } = ImageProcessor.processPixels(img, cols, rows, options);

    // 4. Select and run renderer
    const renderer = RENDERERS[options.renderer] || RENDERERS['halfblock'];
    const cells = renderer.render(data, cols, rows, options);

    const renderTimeMs = Math.round((performance.now() - startTime) * 10) / 10;

    return {
      cells,
      width: cols,
      height: rows,
      renderer: options.renderer,
      theme: options.theme,
      contrast: options.contrast ?? 1.0,
      brightness: options.brightness ?? 0.0,
      sharpness: options.sharpness ?? 0.0,
      gamma: options.gamma ?? 1.0,
      edgeDetect: options.edgeDetect ?? false,
      invert: options.invert ?? false,
      renderTimeMs,
      aspectCorrection: options.renderer === 'halfblock' ? 1.0 : 0.5,
      timestamp: Date.now(),
    };
  }
}
