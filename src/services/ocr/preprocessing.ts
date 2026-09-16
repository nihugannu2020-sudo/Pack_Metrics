import type { OCRPassType, PreprocessedVariant } from './types';

const makeCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const loadImage = (source: string | File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = typeof source === 'string' ? source : URL.createObjectURL(source);
  });

export async function generatePreprocessedVariants(source: string | File): Promise<PreprocessedVariant[]> {
  const image = await loadImage(source);
  const originalWidth = image.naturalWidth || image.width;
  const originalHeight = image.naturalHeight || image.height;

  const variants: PreprocessedVariant[] = [
    { id: 'original', type: 'original', imageSource: typeof source === 'string' ? source : URL.createObjectURL(source), width: originalWidth, height: originalHeight, label: 'Original' },
  ];

  const canvas = makeCanvas(originalWidth, originalHeight);
  const ctx = canvas.getContext('2d');
  if (!ctx) return variants;

  const render = (sourceId: string, type: OCRPassType, processor: (ctx: CanvasRenderingContext2D, image: HTMLImageElement) => void): string => {
    const tempCanvas = makeCanvas(originalWidth, originalHeight);
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return sourceId;
    tempCtx.drawImage(image, 0, 0, originalWidth, originalHeight);
    processor(tempCtx, image);
    return tempCanvas.toDataURL('image/png');
  };

  const originalData = canvas.toDataURL('image/png');
  variants.push({ id: 'upscaled', type: 'upscaled', imageSource: render(originalData, 'upscaled', (c) => {
    const scaled = makeCanvas(originalWidth * 2, originalHeight * 2);
    const scaledCtx = scaled.getContext('2d');
    if (!scaledCtx) return;
    scaledCtx.drawImage(image, 0, 0, scaled.width, scaled.height);
    c.drawImage(scaled, 0, 0);
  }), width: originalWidth * 2, height: originalHeight * 2, label: '2x Upscale' });

  variants.push({ id: 'grayscale', type: 'grayscale', imageSource: render(originalData, 'grayscale', (c) => {
    const imageData = c.getImageData(0, 0, originalWidth, originalHeight);
    const data = imageData.data;
    for (let index = 0; index < data.length; index += 4) {
      const avg = (data[index] + data[index + 1] + data[index + 2]) / 3;
      data[index] = avg;
      data[index + 1] = avg;
      data[index + 2] = avg;
    }
    c.putImageData(imageData, 0, 0);
  }), width: originalWidth, height: originalHeight, label: 'Grayscale' });

  variants.push({ id: 'contrast', type: 'contrast', imageSource: render(originalData, 'contrast', (c) => {
    const imageData = c.getImageData(0, 0, originalWidth, originalHeight);
    const data = imageData.data;
    for (let index = 0; index < data.length; index += 4) {
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const contrast = 1.35;
      const adjusted = ((r - 128) * contrast + 128);
      const adjustedG = ((g - 128) * contrast + 128);
      const adjustedB = ((b - 128) * contrast + 128);
      data[index] = Math.min(255, Math.max(0, adjusted));
      data[index + 1] = Math.min(255, Math.max(0, adjustedG));
      data[index + 2] = Math.min(255, Math.max(0, adjustedB));
    }
    c.putImageData(imageData, 0, 0);
  }), width: originalWidth, height: originalHeight, label: 'Contrast Enhanced' });

  variants.push({ id: 'threshold', type: 'threshold', imageSource: render(originalData, 'threshold', (c) => {
    const imageData = c.getImageData(0, 0, originalWidth, originalHeight);
    const data = imageData.data;
    for (let index = 0; index < data.length; index += 4) {
      const luminance = (data[index] + data[index + 1] + data[index + 2]) / 3;
      const value = luminance > 160 ? 255 : 0;
      data[index] = value;
      data[index + 1] = value;
      data[index + 2] = value;
    }
    c.putImageData(imageData, 0, 0);
  }), width: originalWidth, height: originalHeight, label: 'Adaptive Threshold' });

  if (typeof source !== 'string') {
    const objectUrl = URL.createObjectURL(source);
    variants.push({ id: 'declaration', type: 'declaration', imageSource: objectUrl, width: originalWidth, height: originalHeight, label: 'Declaration Crop' });
  }

  return variants;
}
