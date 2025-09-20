// Image Compositor Service
// Handles overlaying generated images onto the disc base

export interface CompositorOptions {
  discBaseImage?: HTMLImageElement;
  generatedImage?: HTMLImageElement;
  outputSize?: number;
}

class ImageCompositor {
  private defaultDiscBase: string = '/disc-bg-new.png'; // You'll add this to public folder
  private defaultOutputSize: number = 300;

  /**
   * Load image from URL or file
   */
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Create canvas and get context
   */
  private createCanvas(size: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    return { canvas, ctx };
  }

  /**
   * Draw circular mask on canvas
   */
  private drawCircularMask(
    ctx: CanvasRenderingContext2D, 
    image: HTMLImageElement, 
    size: number, 
    centerX: number, 
    centerY: number, 
    radius: number
  ): void {
    // Save context state
    ctx.save();
    
    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.clip();
    
    // Draw the image
    ctx.drawImage(image, 0, 0, size, size);
    
    // Restore context state
    ctx.restore();
  }

  /**
   * Composite generated image onto disc base
   */
  async compositeDiscCover(
    generatedImageUrl: string,
    options: CompositorOptions = {}
  ): Promise<string> {
    const outputSize = options.outputSize || this.defaultOutputSize;
    const { canvas, ctx } = this.createCanvas(outputSize);

    try {
      // Load the generated image
      const generatedImage = await this.loadImage(generatedImageUrl);
      
      // Load disc base image (fallback to solid disc if not available)
      let discBaseImage: HTMLImageElement;
      
      try {
        discBaseImage = await this.loadImage(this.defaultDiscBase);
      } catch (error) {
        console.warn('Disc base image not found, creating solid disc');
        discBaseImage = this.createSolidDisc(outputSize);
      }

      // Draw disc base
      ctx.drawImage(discBaseImage, 0, 0, outputSize, outputSize);

      // Calculate disc area (excluding center hole)
      const centerX = outputSize / 2;
      const centerY = outputSize / 2;
      const outerRadius = (outputSize * 0.4); // 80% of half size
      const innerRadius = (outputSize * 0.08); // 16% of half size (center hole)

      // Create a temporary canvas for the generated image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = outputSize;
      tempCanvas.height = outputSize;
      const tempCtx = tempCanvas.getContext('2d')!;

      // Draw generated image on temp canvas
      tempCtx.drawImage(generatedImage, 0, 0, outputSize, outputSize);

      // Create circular mask for the disc area
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
      ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI, true); // Inner hole (counter-clockwise)
      ctx.clip();

      // Draw the generated image with circular mask
      ctx.drawImage(tempCanvas, 0, 0);

      ctx.restore();

      // Return the composite image as data URL
      return canvas.toDataURL('image/png');

    } catch (error) {
      console.error('Error compositing disc cover:', error);
      throw error;
    }
  }

  /**
   * Create a solid disc as fallback when disc base image is not available
   */
  private createSolidDisc(size: number): HTMLImageElement {
    const { canvas, ctx } = this.createCanvas(size);
    
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size * 0.4;
    const innerRadius = size * 0.08;

    // Draw disc background (light gray)
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, size, size);

    // Draw disc (darker gray)
    ctx.fillStyle = '#888888';
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Draw center hole (white)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Add some disc texture
    ctx.fillStyle = '#666666';
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * 2 * Math.PI;
      const x = centerX + Math.cos(angle) * (outerRadius * 0.7);
      const y = centerY + Math.sin(angle) * (outerRadius * 0.7);
      ctx.fillRect(x, y, 1, 1);
    }

    // Convert canvas to image
    const img = new Image();
    img.src = canvas.toDataURL('image/png');
    return img;
  }

  /**
   * Download the composite image
   */
  downloadImage(dataUrl: string, filename: string = 'playlist-cover.png'): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Get image as blob for further processing
   */
  async getImageBlob(dataUrl: string): Promise<Blob> {
    const response = await fetch(dataUrl);
    return response.blob();
  }
}

export default new ImageCompositor();
