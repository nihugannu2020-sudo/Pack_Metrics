import { normalizeOCRText, normalizeCurrencyValue, collapseOCRSpacing } from '../ocr/textNormalization';
import type { ExtractedField, FieldEvidence } from '../ocr/types';

const buildField = (
  value: string | null,
  confidence: number,
  source: string,
  rawText: string,
  evidenceText: string,
  boundingBoxes: Array<{ x0: number; y0: number; x1: number; y1: number }>,
  extractionMethod: ExtractedField['extractionMethod']
): ExtractedField => ({
  value,
  confidence,
  source,
  rawText,
  normalizedText: normalizeOCRText(rawText || value || ''),
  boundingBoxes,
  evidenceText,
  extractionMethod,
});

export function extractFieldsFromText(text: string): Record<string, ExtractedField> {
  const normalized = normalizeOCRText(text);

  const fields: Record<string, ExtractedField> = {};

  const mrpRegex = /(?:maximum\s+retail\s+price|m\.r\.p\.|mrp|retail\s+sale\s+price|(?:₹|rs\.?|inr))[^\d]{0,20}(\d(?:[\d\s,\.]*\d))/i;
  const mrpMatch = normalized.match(mrpRegex) || normalized.match(/(?:\d\s+\d{3}(?:[.,]\d{2})|\d{3,}(?:[.,]\d{2})|\d\s*[,\.]\s*\d{3}(?:[.,]\d{2})?)/);
  const mrpValue = mrpMatch ? collapseOCRSpacing(mrpMatch[1] || mrpMatch[0]).replace(/[^0-9,\.\s]/g, '') : null;
  fields.mrp = buildField(
    mrpValue ? `₹${mrpValue.trim()}` : null,
    mrpMatch ? 0.82 : 0.25,
    'ocr',
    mrpMatch ? mrpMatch[0] : '',
    mrpMatch ? mrpMatch[0] : 'No MRP match',
    [],
    mrpMatch ? 'context' : 'regex'
  );

  const manufacturerMatch = normalized.match(/(?:manufactured\s*by|mfd\s*by|packed\s*by|packaged\s*by|imported\s*by|imported,\s*marketed\s*&\s*customer\s*care\s*by|marketed\s*by)[^\n]{0,120}/i);
  fields.manufacturer = buildField(
    manufacturerMatch ? manufacturerMatch[0].replace(/^(?:manufactured|mfd|packed|packaged|imported|marketed)\s*by\s*/i, '').trim() : null,
    manufacturerMatch ? 0.76 : 0.2,
    'ocr',
    manufacturerMatch ? manufacturerMatch[0] : '',
    manufacturerMatch ? manufacturerMatch[0] : 'No manufacturer match',
    [],
    manufacturerMatch ? 'context' : 'regex'
  );

  const netQtyMatch = normalized.match(/(?:net\s*(?:quantity|qty|content|wt|weight|volume)|quantity)\s*[:\-]?\s*\d+\s*(?:unit|units|pc|pcs|piece|pieces|g|gm|kg|ml|l|nos)\b/i) || normalized.match(/\b\d+\s*(?:unit|units|pc|pcs|piece|pieces|g|gm|kg|ml|l|nos)\b/i);
  fields.netQuantity = buildField(
    netQtyMatch ? netQtyMatch[0] : null,
    netQtyMatch ? 0.8 : 0.15,
    'ocr',
    netQtyMatch ? netQtyMatch[0] : '',
    netQtyMatch ? netQtyMatch[0] : 'No net quantity match',
    [],
    netQtyMatch ? 'context' : 'regex'
  );

  const monthRegex = /(?:month\s*(?:and|&)\s*year\s*of\s*manufacture|month\s*&\s*year\s*of\s*manufacture|manufactured\s*[:\-]?|packed\s*[:\-]?|packing\s*[:\-]?|imported\s*[:\-]?)[^\n]{0,80}(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|\d{1,2}[\/\-.]\d{2,4}|\d{4})/i;
  const manufacturingDateMatch = normalized.match(monthRegex) || normalized.match(/(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|\d{1,2}[\/\-.]\d{2,4})/i);
  fields.manufacturingDate = buildField(
    manufacturingDateMatch ? manufacturingDateMatch[0] : null,
    manufacturingDateMatch ? 0.74 : 0.17,
    'ocr',
    manufacturingDateMatch ? manufacturingDateMatch[0] : '',
    manufacturingDateMatch ? manufacturingDateMatch[0] : 'No manufacturing date match',
    [],
    manufacturingDateMatch ? 'context' : 'regex'
  );

  const phoneMatch = normalized.match(/(?:\+?91[\s-]?)?(?:1800[\s-]?\d{3}[\s-]?\d{4}|[6-9]\d{9})/i);
  fields.consumerCarePhone = buildField(
    phoneMatch ? phoneMatch[0] : null,
    phoneMatch ? 0.86 : 0.12,
    'ocr',
    phoneMatch ? phoneMatch[0] : '',
    phoneMatch ? phoneMatch[0] : 'No phone match',
    [],
    phoneMatch ? 'regex' : 'context'
  );

  const emailMatch = normalized.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  fields.consumerCareEmail = buildField(
    emailMatch ? emailMatch[0] : null,
    emailMatch ? 0.87 : 0.12,
    'ocr',
    emailMatch ? emailMatch[0] : '',
    emailMatch ? emailMatch[0] : 'No email match',
    [],
    emailMatch ? 'regex' : 'context'
  );

  const countryMatch = normalized.match(/(?:country\s+of\s+origin|made\s+in|product\s+of)\s*[:\-]?\s*([A-Z][A-Za-z\s]+)/i);
  fields.countryOfOrigin = buildField(
    countryMatch ? countryMatch[1] || countryMatch[0] : null,
    countryMatch ? 0.75 : 0.1,
    'ocr',
    countryMatch ? countryMatch[0] : '',
    countryMatch ? countryMatch[0] : 'No country of origin match',
    [],
    countryMatch ? 'context' : 'regex'
  );

  const commodityName = normalized.match(/generic\s+name\s*[:\-]?\s*([A-Za-z0-9&\s-]+)/i)?.[1] || normalized.match(/product\s+description\s*[:\-]?\s*([A-Za-z0-9&\s-]+)/i)?.[1] || normalized.match(/\b(?:headphones|earphones|speaker|charger|toothbrush|milk|tea|wafers|rice|oil|soap|detergent|powder)\b/i)?.[0];
  fields.commodityName = buildField(
    commodityName ? commodityName.trim() : null,
    commodityName ? 0.7 : 0.17,
    'ocr',
    commodityName || '',
    commodityName || 'No commodity name match',
    [],
    commodityName ? 'context' : 'regex'
  );

  return fields;
}

export function detectMRPContext(text: string): { mrpValue: string | null; mrpCurrency: string | null; mrpRaw: string | null; taxInclusivePhrase: string | null; mrpEvidenceBBox: Array<{ x0: number; y0: number; x1: number; y1: number }> } {
  const normalized = normalizeOCRText(text);
  const match = normalized.match(/(?:maximum\s+retail\s+price|mrp|retail\s+sale\s+price|₹|rs\.?|inr)[^\d]{0,20}(\d[\d\s,\.]+)/i);
  const raw = match ? match[0] : null;
  const value = match ? normalizeCurrencyValue(match[1]) : null;
  const currency = /₹|rs|inr/i.test(normalized) ? (/[₹]/.test(normalized) ? 'INR' : 'Rs') : 'INR';
  const taxPhrase = /inclusive\s+of\s+all\s+taxes/i.test(normalized) ? 'Inclusive of all taxes' : null;

  return {
    mrpValue: value,
    mrpCurrency: currency,
    mrpRaw: raw,
    taxInclusivePhrase: taxPhrase,
    mrpEvidenceBBox: [],
  };
}
