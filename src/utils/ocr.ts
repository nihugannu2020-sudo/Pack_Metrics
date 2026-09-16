import { performAdvancedOCR } from '../services/ocr/ocrPipeline';
import type { OCRWord } from '../types';

export interface OCRResult {
  text: string;
  words: OCRWord[];
  document?: { text: string; words: OCRWord[]; averageConfidence?: number };
}

export async function performOCR(
  imageSource: string | File,
  fallbackData?: { text: string; words: OCRWord[] },
  onProgress?: (progress: number, status: string) => void
): Promise<OCRResult> {
  if (onProgress) onProgress(5, 'Initializing multi-pass OCR pipeline...');

  try {
    const doc = await performAdvancedOCR(imageSource);
    const words: OCRWord[] = doc.words.map((word) => ({
      text: word.text,
      bbox: {
        x0: word.bbox.x0,
        y0: word.bbox.y0,
        x1: word.bbox.x1,
        y1: word.bbox.y1,
      },
      confidence: word.confidence,
    }));

    if (onProgress) onProgress(100, 'OCR Complete');

    const finalText = doc.text && doc.text.trim().length > 0 ? doc.text : fallbackData?.text || '';
    const finalWords = words.length > 0 ? words : fallbackData?.words || [];

    return {
      text: finalText,
      words: finalWords,
      document: {
        text: finalText,
        words: finalWords,
        averageConfidence: doc.averageConfidence,
      },
    };
  } catch (error) {
    console.warn('Advanced OCR pipeline failed; using fallback path:', error);
    if (onProgress) onProgress(100, 'Completed with pre-calculated OCR pipeline');

    if (fallbackData) {
      return fallbackData;
    }

    throw error;
  }
}
