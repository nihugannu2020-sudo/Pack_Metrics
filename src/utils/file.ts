export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error('Unable to read image file'));
    reader.readAsDataURL(file);
  });
}

export async function stitchImages(imageUrls: string[]): Promise<string> {
  if (imageUrls.length === 0) return '';
  if (imageUrls.length === 1) return imageUrls[0];

  const images = await Promise.all(
    imageUrls.map((url) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image for stitching'));
        img.src = url;
      });
    })
  );

  const totalHeight = images.reduce((sum, img) => sum + img.height, 0);
  const maxWidth = Math.max(...images.map((img) => img.width));

  const canvas = document.createElement('canvas');
  canvas.width = maxWidth;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Fill with white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let currentY = 0;
  for (const img of images) {
    ctx.drawImage(img, 0, currentY);
    currentY += img.height;
  }

  return canvas.toDataURL('image/png');
}

export async function compressImage(dataUrl: string, maxWidth = 800, quality = 0.5): Promise<string> {
  if (!dataUrl.startsWith('data:image')) return dataUrl;
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const scale = maxWidth / img.width;
      const width = scale < 1 ? img.width * scale : img.width;
      const height = scale < 1 ? img.height * scale : img.height;
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl); // Fallback on error
    img.src = dataUrl;
  });
}
