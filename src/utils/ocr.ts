import { API } from '../services/api';
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
  if (onProgress) onProgress(10, 'Sending image to AI OCR backend...');

  try {
    // If it's a File, we need to convert it to Data URL first
    let imageUrl = '';
    if (typeof imageSource === 'string') {
      imageUrl = imageSource;
    } else {
      const reader = new FileReader();
      imageUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(imageSource);
      });
    }

    if (onProgress) onProgress(50, 'Extracting text using AI model...');
    
    const backendResult = await API.runOCR(imageUrl);

    if (onProgress) onProgress(100, 'AI OCR Complete');

    return {
      text: backendResult.text,
      words: backendResult.words || [],
    };
  } catch (error) {
    console.error('AI OCR pipeline error:', error);
    if (onProgress) onProgress(100, 'Error: Fallback to synthetic data');

    if (fallbackData) {
      return { text: fallbackData.text, words: fallbackData.words };
    }

    throw error;
  }
}
