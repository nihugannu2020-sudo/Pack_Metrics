export type RuleField =
  | 'MANUFACTURER'
  | 'PACKER'
  | 'IMPORTER'
  | 'ADDRESS'
  | 'COUNTRY_OF_ORIGIN'
  | 'COMMODITY_NAME'
  | 'NET_QUANTITY'
  | 'MRP'
  | 'MFG_DATE'
  | 'PACKING_DATE'
  | 'IMPORT_DATE'
  | 'CONSUMER_CARE'
  | 'PHONE'
  | 'EMAIL'
  | 'BEST_BEFORE'
  | 'USE_BY'
  | 'DIMENSIONS'
  | 'UNIT_SALE_PRICE';

export interface LegalRule {
  id: string;
  rule: string;
  field: RuleField;
  description: string;
  legalSource: string;
  sourceURL: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  applicability: string;
  requiredEvidence: string[];
  exemptions?: string[];
  validationLogic?: string;
  legacyVersion?: string | null;
}

export const LEGAL_RULES: LegalRule[] = [
  {
    id: 'RULE_6_1_A',
    rule: '6(1)(a)',
    field: 'MANUFACTURER',
    description: 'Name and complete address of the manufacturer, packer or importer.',
    legalSource: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    sourceURL: 'https://consumeraffairs.gov.in/pages/legal-metrology-act',
    effectiveFrom: '2011-01-01',
    effectiveTo: null,
    applicability: 'Applicable to packaged commodities.',
    requiredEvidence: ['responsible_entity', 'address'],
    validationLogic: 'The OCR label must show a company/entity name and nearby address evidence; PIN alone is not sufficient.',
  },
  {
    id: 'RULE_6_1_B',
    rule: '6(1)(b)',
    field: 'COMMODITY_NAME',
    description: 'Common or generic name of the commodity.',
    legalSource: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    sourceURL: 'https://consumeraffairs.gov.in/pages/legal-metrology-act',
    effectiveFrom: '2011-01-01',
    effectiveTo: null,
    applicability: 'Applicable to packaged commodities.',
    requiredEvidence: ['commodity_name'],
    validationLogic: 'Use ML candidate classification with human confirmation when OCR quality is uncertain.',
  },
  {
    id: 'RULE_6_1_C',
    rule: '6(1)(c)',
    field: 'NET_QUANTITY',
    description: 'Net quantity in standard units.',
    legalSource: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    sourceURL: 'https://consumeraffairs.gov.in/pages/legal-metrology-act',
    effectiveFrom: '2011-01-01',
    effectiveTo: null,
    applicability: 'Applicable to packaged commodities.',
    requiredEvidence: ['numeric_value', 'unit_symbol_or_name'],
    validationLogic: 'Require numeric quantity plus unit evidence such as g, kg, ml, L, unit, piece, or nos.',
  },
  {
    id: 'RULE_6_1_D',
    rule: '6(1)(d)',
    field: 'MFG_DATE',
    description: 'Month and year of manufacture, packing or import.',
    legalSource: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    sourceURL: 'https://consumeraffairs.gov.in/pages/legal-metrology-act',
    effectiveFrom: '2011-01-01',
    effectiveTo: null,
    applicability: 'Applicable to packaged commodities unless exempted by rule-specific notifications.',
    requiredEvidence: ['month_or_year', 'context_of_mfg_or_packing_or_import'],
    exemptions: ['bidi', 'incense sticks', 'domestic LPG cylinders (14.2kg or 5kg)'],
    validationLogic: 'Accept month/year or date strings when placed in manufacturing/packing/import context.',
  },
  {
    id: 'RULE_6_1_E',
    rule: '6(1)(e)',
    field: 'MRP',
    description: 'Maximum Retail Price inclusive of all taxes.',
    legalSource: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    sourceURL: 'https://consumeraffairs.gov.in/pages/legal-metrology-act',
    effectiveFrom: '2011-01-01',
    effectiveTo: null,
    applicability: 'Applicable to packaged commodities.',
    requiredEvidence: ['currency_symbol_or_keyword', 'amount'],
    validationLogic: 'The candidate value must be near MRP, price or INR/₹ text and should be treated as evidence-first, not legal truth.',
  },
  {
    id: 'RULE_6_1_IMPORT_ORIGIN',
    rule: '6(1)',
    field: 'COUNTRY_OF_ORIGIN',
    description: 'Country of origin or assembly declaration for imported goods.',
    legalSource: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    sourceURL: 'https://consumeraffairs.gov.in/pages/legal-metrology-act',
    effectiveFrom: '2011-01-01',
    effectiveTo: null,
    applicability: 'Applicable to imported packaged commodities only.',
    requiredEvidence: ['country_name'],
    validationLogic: 'Only required when imported, and must be supported by visible import context and country text.',
  },
  {
    id: 'RULE_6_1_F',
    rule: '6(1)(f)',
    field: 'CONSUMER_CARE',
    description: 'Details of the person or office responsible for consumer complaint and grievance redressal.',
    legalSource: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    sourceURL: 'https://consumeraffairs.gov.in/pages/legal-metrology-act',
    effectiveFrom: '2011-01-01',
    effectiveTo: null,
    applicability: 'Applicable to packaged commodities when consumer care details are shown.',
    requiredEvidence: ['complaint_email_or_phone', 'organisation_name'],
    validationLogic: 'Accept phone and email candidate values when shown in complaint-care context.',
  },
  {
    id: 'RULE_2027_GENERAL_FOURTH_AMENDMENT',
    rule: 'General Amendment Rules, 2027',
    field: 'ADDRESS',
    description: 'Future amendment placeholder for a general rules filing that has not yet commenced for the current inspection date.',
    legalSource: 'Legal Metrology (General) Rules, 2011',
    sourceURL: 'https://consumeraffairs.gov.in/pages/legal-metrology-act',
    effectiveFrom: '2027-07-01',
    effectiveTo: null,
    applicability: 'Only after the amendment commencement date.',
    requiredEvidence: ['documented_amendment'],
    validationLogic: 'The amendment is ignored before its effectiveFrom date.',
    legacyVersion: '2026-12-31',
  },
];

export function getApplicableLegalRules(inspectionDate: string): LegalRule[] {
  const date = new Date(inspectionDate);
  if (Number.isNaN(date.getTime())) {
    return LEGAL_RULES;
  }

  return LEGAL_RULES.filter((rule) => {
    const start = new Date(rule.effectiveFrom);
    const end = rule.effectiveTo ? new Date(rule.effectiveTo) : null;
    const effective = start <= date && (!end || date <= end);
    return effective;
  });
}
