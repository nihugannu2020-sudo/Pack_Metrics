import { generatePreprocessedVariants } from './preprocessing';
import { runTesseractPass } from './tesseractProvider';
import { mergeOCRPasses } from './ocrFusion';
import { normalizeOCRText } from './textNormalization';
import type { OCRDocument, OCRPassType } from './types';

export async function performAdvancedOCR(imageSource: string | File): Promise<OCRDocument> {
  const variants = await generatePreprocessedVariants(imageSource);
  const passes = [] as Awaited<ReturnType<typeof runTesseractPass>>[];

  for (let index = 0; index < variants.length; index += 1) {
    const variant = variants[index];
    const passType: OCRPassType = variant.type;
    const passId = `${passType}-${index + 1}`;
    const psm = passType === 'sparse' || passType === 'original' ? 11 : passType === 'declaration' ? 4 : 6;

    const result = await runTesseractPass(variant.imageSource, passType, passId, psm);
    passes.push(result);
  }

  const mergedDocument = mergeOCRPasses(passes);
  const normalizedText = normalizeOCRText(mergedDocument.text);

  return {
    ...mergedDocument,
    text: normalizedText,
  };
}
