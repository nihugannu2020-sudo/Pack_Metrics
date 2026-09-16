import type { OCRDocument, OCRPassResult } from './types';

export function mergeOCRPasses(passes: OCRPassResult[]): OCRDocument {
  const words = passes.flatMap((pass) => pass.words.map((word) => ({ ...word, passId: pass.id }))); 
  const lines = passes.flatMap((pass) => pass.lines.map((line) => ({ ...line, passId: pass.id })));
  const blocks = passes.flatMap((pass) => pass.blocks.map((block) => ({ ...block, passId: pass.id })));
  const text = passes.map((pass) => pass.text).filter(Boolean).join('\n');
  const averageConfidence = passes.length
    ? passes.reduce((total, pass) => total + (pass.confidence || 0), 0) / passes.length
    : 0;

  return {
    text,
    words,
    lines,
    blocks,
    imageWidth: passes[0]?.imageWidth ?? 0,
    imageHeight: passes[0]?.imageHeight ?? 0,
    passes,
    averageConfidence,
  };
}
