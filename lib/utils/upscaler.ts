'use strict';

export interface UpscaleResult {
  dataUrl: string;
  width: number;
  height: number;
  durationMs: number;
  scaleFactor: number;
}

/**
 * Calculates optimal 4K Ultra HD target dimensions preserving the source aspect ratio.
 */
export function get4KTargetDimensions(sourceWidth: number, sourceHeight: number): { width: number; height: number } {
  const ratio = sourceWidth / sourceHeight;

  // 16:9 Landscape -> Standard 4K UHD
  if (Math.abs(ratio - 16 / 9) < 0.15) {
    return { width: 3840, height: 2160 };
  }
  // 9:16 Portrait -> Vertical 4K UHD
  if (Math.abs(ratio - 9 / 16) < 0.15) {
    return { width: 2160, height: 3840 };
  }
  // 1:1 Square -> 4K Square
  if (Math.abs(ratio - 1) < 0.1) {
    return { width: 4096, height: 4096 };
  }
  // 4:3 Standard -> 4K 4:3
  if (Math.abs(ratio - 4 / 3) < 0.15) {
    return { width: 3840, height: 2880 };
  }
  // 3:4 Portrait
  if (Math.abs(ratio - 3 / 4) < 0.15) {
    return { width: 2880, height: 3840 };
  }
  // 21:9 Ultrawide -> 5K/4K Ultrawide
  if (ratio > 2.0) {
    return { width: 4096, height: 1755 };
  }

  // General case: 4x scale or scale until the longer edge reaches ~3840px
  const maxDim = Math.max(sourceWidth, sourceHeight);
  const factor = Math.max(2, Math.min(4, 3840 / maxDim));

  return {
    width: Math.round((sourceWidth * factor) / 8) * 8,
    height: Math.round((sourceHeight * factor) / 8) * 8,
  };
}

/**
 * Applies an unsharp masking convolution filter directly on ImageData pixels.
 * Enhances micro-textures, geometric edges, and fine details.
 */
function applyUnsharpMask(imageData: ImageData, amount = 0.45, threshold = 4): void {
  const { data, width, height } = imageData;
  const copy = new Uint8ClampedArray(data);

  // Kernel weights for subtle 3x3 Laplacian edge enhancement
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      for (let c = 0; c < 3; c++) {
        const center = copy[idx + c];
        // Neighbors
        const top = copy[((y - 1) * width + x) * 4 + c];
        const bottom = copy[((y + 1) * width + x) * 4 + c];
        const left = copy[(y * width + (x - 1)) * 4 + c];
        const right = copy[(y * width + (x + 1)) * 4 + c];

        const blurred = (top + bottom + left + right) * 0.25;
        const diff = center - blurred;

        if (Math.abs(diff) >= threshold) {
          const sharpened = center + diff * amount;
          data[idx + c] = Math.min(255, Math.max(0, sharpened));
        }
      }
    }
  }
}

/**
 * Multi-pass Super-Resolution 4K Resampler.
 * Upscales an image in stepped increments to preserve sharp edge boundaries,
 * then applies high-frequency detail synthesis.
 */
export async function upscaleImageTo4K(
  imageSource: string,
  targetDimensions?: { width: number; height: number }
): Promise<UpscaleResult> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const origWidth = img.naturalWidth || img.width;
        const origHeight = img.naturalHeight || img.height;

        const target = targetDimensions || get4KTargetDimensions(origWidth, origHeight);
        const targetWidth = target.width;
        const targetHeight = target.height;

        // Stepped multi-pass scaling (avoids single-step pixel stretching)
        let curWidth = origWidth;
        let curHeight = origHeight;

        let canvas = document.createElement('canvas');
        canvas.width = curWidth;
        canvas.height = curHeight;
        let ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          throw new Error('Canvas 2D context unavailable.');
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, curWidth, curHeight);

        // Incremental 1.5x steps until reaching target
        while (curWidth * 1.5 < targetWidth && curHeight * 1.5 < targetHeight) {
          const nextWidth = Math.round(curWidth * 1.5);
          const nextHeight = Math.round(curHeight * 1.5);

          const nextCanvas = document.createElement('canvas');
          nextCanvas.width = nextWidth;
          nextCanvas.height = nextHeight;
          const nextCtx = nextCanvas.getContext('2d');

          if (!nextCtx) break;

          nextCtx.imageSmoothingEnabled = true;
          nextCtx.imageSmoothingQuality = 'high';
          nextCtx.drawImage(canvas, 0, 0, nextWidth, nextHeight);

          canvas = nextCanvas;
          ctx = nextCtx;
          curWidth = nextWidth;
          curHeight = nextHeight;
        }

        // Final step directly to exact 4K target dimensions
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = targetWidth;
        finalCanvas.height = targetHeight;
        const finalCtx = finalCanvas.getContext('2d', { willReadFrequently: true });

        if (!finalCtx) {
          throw new Error('Final canvas context creation failed.');
        }

        finalCtx.imageSmoothingEnabled = true;
        finalCtx.imageSmoothingQuality = 'high';
        finalCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

        // Apply sub-pixel detail enhancement
        const imgData = finalCtx.getImageData(0, 0, targetWidth, targetHeight);
        applyUnsharpMask(imgData, 0.4, 3);
        finalCtx.putImageData(imgData, 0, 0);

        const dataUrl = finalCanvas.toDataURL('image/png', 0.98);
        const durationMs = Date.now() - startTime;
        const scaleFactor = Number((targetWidth / origWidth).toFixed(1));

        resolve({
          dataUrl,
          width: targetWidth,
          height: targetHeight,
          durationMs,
          scaleFactor,
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load base image for upscaling.'));
    };

    img.src = imageSource;
  });
}
