import { createWorker } from 'tesseract.js';
import type { OCRPassResult, OCRPassType, OCRWord } from './types';

export async function runTesseractPass(
  imageSource: string,
  passType: OCRPassType,
  passId: string,
  psm: number
): Promise<OCRPassResult> {
  const worker = await createWorker(['eng', 'hin']);

  try {
    const result = await (worker as any).recognize(imageSource, { psm });
    const words: OCRWord[] = ((result?.data?.words ?? []) as Array<Record<string, any>>).map((word, index) => ({
      text: String(word.text ?? '').trim(),
      confidence: Number(word.confidence ?? 0),
      bbox: {
        x0: Number(word.bbox?.x0 ?? 0),
        y0: Number(word.bbox?.y0 ?? 0),
        x1: Number(word.bbox?.x1 ?? 0),
        y1: Number(word.bbox?.y1 ?? 0),
      },
      page: Number(word.page ?? 1),
      line: Number(word.line ?? index),
      block: Number(word.block ?? 1),
      passId,
      rawText: String(word.text ?? '').trim(),
      normalizedText: String(word.text ?? '').trim(),
    })).filter((word) => word.text.length > 0);

    const lines = ((result?.data?.lines ?? []) as Array<Record<string, any>>).map((line, index) => ({
      text: String(line.text ?? '').trim(),
      confidence: Number(line.confidence ?? 0),
      bbox: {
        x0: Number(line.bbox?.x0 ?? 0),
        y0: Number(line.bbox?.y0 ?? 0),
        x1: Number(line.bbox?.x1 ?? 0),
        y1: Number(line.bbox?.y1 ?? 0),
      },
      page: Number(line.page ?? 1),
      passId,
    })).filter((line) => line.text.length > 0);

    const blocks = ((result?.data?.blocks ?? []) as Array<Record<string, any>>).map((block, index) => ({
      text: String(block.text ?? '').trim(),
      confidence: Number(block.confidence ?? 0),
      bbox: {
        x0: Number(block.bbox?.x0 ?? 0),
        y0: Number(block.bbox?.y0 ?? 0),
        x1: Number(block.bbox?.x1 ?? 0),
        y1: Number(block.bbox?.y1 ?? 0),
      },
      page: Number(block.page ?? 1),
      passId,
    })).filter((block) => block.text.length > 0);

    return {
      id: passId,
      type: passType,
      confidence: Number(result?.data?.confidence ?? 0),
      text: String(result?.data?.text ?? '').trim(),
      words,
      lines,
      blocks,
      imageWidth: Number(result?.data?.imageWidth ?? 0),
      imageHeight: Number(result?.data?.imageHeight ?? 0),
      source: imageSource,
    };
  } finally {
    await worker.terminate();
  }
}
