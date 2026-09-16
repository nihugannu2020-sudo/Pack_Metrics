export const DECLARATION_CLASSES = [
  'MANUFACTURER',
  'PACKER',
  'IMPORTER',
  'ADDRESS',
  'COUNTRY_OF_ORIGIN',
  'COMMODITY_NAME',
  'NET_QUANTITY',
  'MRP',
  'MFG_DATE',
  'PACKING_DATE',
  'IMPORT_DATE',
  'CONSUMER_CARE',
  'PHONE',
  'EMAIL',
  'BEST_BEFORE',
  'USE_BY',
  'DIMENSIONS',
  'UNIT_SALE_PRICE',
  'TECHNICAL_SPECIFICATION',
  'MODEL_NUMBER',
  'SERIAL_NUMBER',
  'EAN_BARCODE',
  'MARKETING_TEXT',
  'WARRANTY',
  'WEBSITE',
  'RANDOM_NUMBER',
  'OTHER',
] as const;

export type DeclarationLabel = (typeof DECLARATION_CLASSES)[number];

export interface ClassificationResult {
  label: DeclarationLabel;
  confidence: number;
  evidence: string;
}

const RULE_PATTERNS: Array<{ pattern: RegExp; label: DeclarationLabel; confidence: number }> = [
  { pattern: /maximum\s+retail\s+price|mrp\s*[:\-]?\s*₹|mrp\s*[:\-]?\s*rs/i, label: 'MRP', confidence: 0.98 },
  { pattern: /manufactured\s+by|mfd\s*by|packed\s+by|imported\s+by|marketed\s+by/i, label: 'MANUFACTURER', confidence: 0.94 },
  { pattern: /country\s+of\s+origin|made\s+in|product\s+of/i, label: 'COUNTRY_OF_ORIGIN', confidence: 0.91 },
  { pattern: /net\s+quantity|net\s+wt|net\s+content|qty|quantity\s*[:\-]/i, label: 'NET_QUANTITY', confidence: 0.95 },
  { pattern: /month\s*(and|&)\s*year\s*of\s*manufacture|mfg\s*date|manufactured\s*on|packed\s*on|imported\s*on/i, label: 'MFG_DATE', confidence: 0.9 },
  { pattern: /customer\s+care|consumer\s+care|helpline|complaint|grievance/i, label: 'CONSUMER_CARE', confidence: 0.92 },
  { pattern: /bluetooth|wifi|5\.3|processor|battery|mAh|ram|rom|screen/i, label: 'TECHNICAL_SPECIFICATION', confidence: 0.96 },
  { pattern: /model\s*[:\-]?\s*[a-z0-9]+|model\s+number/i, label: 'MODEL_NUMBER', confidence: 0.88 },
  { pattern: /serial\s*number|s\/n|sn\s*[:\-]?/i, label: 'SERIAL_NUMBER', confidence: 0.9 },
  { pattern: /ean|barcode|upc|isbn/i, label: 'EAN_BARCODE', confidence: 0.94 },
  { pattern: /warranty|guarantee/i, label: 'WARRANTY', confidence: 0.89 },
  { pattern: /https?:\/\/|www\./i, label: 'WEBSITE', confidence: 0.96 },
  { pattern: /\b\d{6,}\b/, label: 'RANDOM_NUMBER', confidence: 0.7 },
];

export function classifyDeclaration(rawText: string): ClassificationResult {
  const text = (rawText || '').trim();
  if (!text) {
    return { label: 'OTHER', confidence: 0.1, evidence: '' };
  }

  const match = RULE_PATTERNS.find(({ pattern }) => pattern.test(text));
  if (match) {
    return {
      label: match.label,
      confidence: match.confidence,
      evidence: text,
    };
  }

  if (/\b[a-z]+\s+\d+(?:\.\d+)?\b/i.test(text)) {
    return { label: 'TECHNICAL_SPECIFICATION', confidence: 0.74, evidence: text };
  }

  return { label: 'OTHER', confidence: 0.48, evidence: text };
}
