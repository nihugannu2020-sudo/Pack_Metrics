export type UserRole = 'inspector' | 'manufacturer' | 'admin';

export interface BoundingBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface OCRWord {
  text: string;
  bbox: BoundingBox;
  confidence: number;
}

export interface DeclarationRule {
  id: string;
  legalRef: string;
  title: string;
  required: boolean | string;
  detectionHint: string;
  regexHints: string[];
  exemptions?: string[];
  softCheckPhrase?: string;
}

export interface RuleResult {
  ruleId: string;
  legalRef: string;
  title: string;
  status: 'pass' | 'fail' | 'manual_review';
  matchedText?: string;
  matchedBboxes: BoundingBox[];
  guidanceNote?: string;
  warning?: string;
  details?: string;
  aiExplanation?: string;
}

export interface ComplianceReport {
  id: string;
  timestamp: string;
  productName: string;
  manufacturerName: string;
  isImported: boolean;
  imageUrl: string;
  imageUrls?: string[];
  imageDimensions?: { width: number; height: number };
  extractedText: string;
  words: OCRWord[];
  results: RuleResult[];
  passCount: number;
  failCount: number;
  reviewCount: number;
  overallStatus: 'Compliant' | 'Non-Compliant' | 'Needs Review';
  submittedBy?: string;
  submittedByRole?: UserRole;
  reviewStatus?: 'draft' | 'submitted' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface LegalNotice {
  id: string;
  noticeNumber: string;
  scanId: string;
  date: string;
  manufacturerName: string;
  manufacturerAddress: string;
  productName: string;
  violations: { legalRef: string; title: string; matchedText?: string }[];
  status: 'Open' | 'Acknowledged' | 'Dismissed';
  issuedBy: string;
}

export interface SampleLabelPreset {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badgeText: string;
  badgeType: 'pass' | 'fail' | 'warning';
  config: {
    productName: string;
    manufacturer: string;
    address: string;
    pin: string;
    netQty: string;
    mrp: string;
    inclusiveOfTaxes: boolean;
    mfgDate: string;
    consumerCarePhone: string;
    consumerCareEmail: string;
    countryOfOrigin?: string;
    isImported: boolean;
    bilingualHindi?: string;
    style: 'standard' | 'bilingual' | 'ecommerce' | 'missing_mrp' | 'missing_care_mfg';
  };
}
