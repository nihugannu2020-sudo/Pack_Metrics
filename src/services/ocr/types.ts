export interface BoundingBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface OCRWord {
  text: string;
  confidence: number;
  bbox: BoundingBox;
  page: number;
  line: number;
  block: number;
  passId: string;
  rawText?: string;
  normalizedText?: string;
}

export interface OCRLine {
  text: string;
  confidence: number;
  bbox: BoundingBox;
  page: number;
  passId: string;
}

export interface OCRBlock {
  text: string;
  confidence: number;
  bbox: BoundingBox;
  page: number;
  passId: string;
}

export type OCRPassType =
  | 'original'
  | 'upscaled'
  | 'grayscale'
  | 'contrast'
  | 'threshold'
  | 'deskew'
  | 'declaration'
  | 'sparse'
  | 'block';

export interface OCRPassResult {
  id: string;
  type: OCRPassType;
  confidence: number;
  text: string;
  words: OCRWord[];
  lines: OCRLine[];
  blocks: OCRBlock[];
  imageWidth: number;
  imageHeight: number;
  source: string;
}

export interface OCRDocument {
  text: string;
  words: OCRWord[];
  lines: OCRLine[];
  blocks: OCRBlock[];
  imageWidth: number;
  imageHeight: number;
  passes: OCRPassResult[];
  averageConfidence: number;
}

export interface PreprocessedVariant {
  id: string;
  type: OCRPassType;
  imageSource: string;
  width: number;
  height: number;
  label: string;
}

export interface FieldEvidence {
  value: string | null;
  confidence: number;
  source: string;
  rawText: string;
  normalizedText: string;
  boundingBoxes: BoundingBox[];
  evidenceText: string;
  extractionMethod: 'regex' | 'context' | 'spatial' | 'OCR' | 'AI_VERIFIED' | 'multi_pass_consensus';
}

export interface ExtractedField {
  value: string | null;
  confidence: number;
  source: string;
  rawText: string;
  normalizedText: string;
  boundingBoxes: BoundingBox[];
  evidenceText: string;
  extractionMethod: 'regex' | 'context' | 'spatial' | 'OCR' | 'AI_VERIFIED' | 'multi_pass_consensus';
}
