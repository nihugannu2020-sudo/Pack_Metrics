export interface LegalRuleRecord {
  id: string;
  rule: string;
  field: string;
  description: string;
  legalSource: string;
  sourceURL: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  applicability: string;
  requiredEvidence: string[];
  exemptions?: string[];
  validationLogic?: string;
}

export const legalRuleIndex: LegalRuleRecord[] = [
  {
    id: 'RULE_6_1_A',
    rule: '6(1)(a)',
    field: 'MANUFACTURER_PACKER_IMPORTER',
    description: 'Name and complete address of manufacturer, packer or importer.',
    legalSource: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    sourceURL: 'https://consumeraffairs.gov.in/pages/legal-metrology-act',
    effectiveFrom: '2011-01-01',
    effectiveTo: null,
    applicability: 'Packaged commodities',
    requiredEvidence: ['responsible_entity', 'address'],
    exemptions: [],
    validationLogic: 'Require a company/entity name and nearby address evidence; a six-digit PIN alone is insufficient.'
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
    applicability: 'Packaged commodities',
    requiredEvidence: ['commodity_name'],
    exemptions: [],
    validationLogic: 'Use ML declaration classification and nearby OCR context; mark uncertain cases for manual review.'
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
    applicability: 'Packaged commodities',
    requiredEvidence: ['numeric_value', 'unit_symbol_or_name'],
    exemptions: [],
    validationLogic: 'The value must be numeric and appear with an associated unit such as g, kg, ml, L, unit, pieces or nos.'
  },
  {
    id: 'RULE_6_1_D',
    rule: '6(1)(d)',
    field: 'MFG_DATE',
    description: 'Month and year of manufacture or packing or import.',
    legalSource: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    sourceURL: 'https://consumeraffairs.gov.in/pages/legal-metrology-act',
    effectiveFrom: '2011-01-01',
    effectiveTo: null,
    applicability: 'Packaged commodities except where specific exemptions apply',
    requiredEvidence: ['month_or_year', 'manufacture_or_packing_context'],
    exemptions: ['bidi', 'incense sticks', 'domestic LPG cylinders (14.2kg or 5kg)'],
    validationLogic: 'A month/year string is valid only when associated with manufacture, packing or import context.'
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
    applicability: 'Packaged commodities',
    requiredEvidence: ['currency_symbol_or_keyword', 'numeric_amount'],
    exemptions: [],
    validationLogic: 'Require evidence from nearby OCR text; do not interpret every number as an MRP declaration.'
  },
  {
    id: 'RULE_6_1_F',
    rule: '6(1)(f)',
    field: 'CONSUMER_CARE',
    description: 'Name, address and phone/email for consumer grievances.',
    legalSource: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    sourceURL: 'https://consumeraffairs.gov.in/pages/legal-metrology-act',
    effectiveFrom: '2011-01-01',
    effectiveTo: null,
    applicability: 'Packaged commodities',
    requiredEvidence: ['phone_or_email', 'grievance_context'],
    exemptions: [],
    validationLogic: 'Accept a complaint phone or email only when near care/contact wording.'
  }
];

export const legalRuleLookup = Object.fromEntries(
  legalRuleIndex.map((rule) => [rule.id, rule])
);
