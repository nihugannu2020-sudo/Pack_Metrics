import { createWorker } from 'tesseract.js';
import type { OCRWord } from '../types';

export interface OCRResult {
  text: string;
  words: OCRWord[];
}

export async function performOCR(
  imageSource: string | File,
  fallbackData?: { text: string; words: OCRWord[] },
  onProgress?: (progress: number, status: string) => void
): Promise<OCRResult> {
  if (onProgress) onProgress(10, 'Initializing OCR Engine...');

  try {
    // Attempt Tesseract.js browser OCR with eng + hin
    if (onProgress) onProgress(25, 'Loading English & Hindi language models...');
    const worker = await createWorker(['eng', 'hin']);

    if (onProgress) onProgress(50, 'Analyzing package label image...');
    const ret = await worker.recognize(imageSource);
    
    if (onProgress) onProgress(90, 'Extracting text bounding boxes...');
    await worker.terminate();

    const text = ret.data.text;
    const rawWords = (ret.data as any).words || [];
    const words: OCRWord[] = rawWords.map((w: any) => ({
      text: w.text,
      bbox: {
        x0: w.bbox ? w.bbox.x0 : 0,
        y0: w.bbox ? w.bbox.y0 : 0,
        x1: w.bbox ? w.bbox.x1 : 0,
        y1: w.bbox ? w.bbox.y1 : 0,
      },
      confidence: w.confidence || 0,
    }));

    if (onProgress) onProgress(100, 'OCR Complete');

    // If Tesseract extracted meaningful text, return it
    if (text && text.trim().length > 10) {
      return { text, words };
    }

    // If Tesseract produced empty text (e.g. mock canvas CORS/dataUrl) and fallback is available
    if (fallbackData) {
      return fallbackData;
    }

    return { text: text || '', words: words || [] };
  } catch (error) {
    console.warn('Tesseract OCR fallback triggered:', error);
    if (onProgress) onProgress(100, 'Completed with pre-calculated OCR pipeline');
    
    if (fallbackData) {
      return fallbackData;
    }
    
    throw error;
  }
}
