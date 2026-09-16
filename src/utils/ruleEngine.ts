import rulesData from '../data/rules.json';
import { extractFieldsFromText } from '../services/compliance/fieldExtractor';
import type { OCRWord, RuleResult, ComplianceReport, DeclarationRule, BoundingBox } from '../types';

export function validateRuleEngine(
  extractedText: string,
  words: OCRWord[] = [],
  context: { isImported: boolean; imageUrl?: string; imageDimensions?: { width: number; height: number } } = { isImported: false }
): ComplianceReport {
  const cleanText = extractedText.replace(/\s+/g, ' ');
  const results: RuleResult[] = [];
  const rules = rulesData.declarations as DeclarationRule[];
  const fields = extractFieldsFromText(extractedText);

  const findMatchingBboxes = (pattern: RegExp | string): BoundingBox[] => {
    const matched: BoundingBox[] = [];
    words.forEach((w) => {
      const textToTest = w.text;
      if (typeof pattern === 'string') {
        if (textToTest.toLowerCase().includes(pattern.toLowerCase())) {
          matched.push(w.bbox);
        }
      } else if (pattern.test(textToTest)) {
        matched.push(w.bbox);
      }
    });
    return matched;
  };

  const manufacturer = fields.manufacturer.value ?? 'Packer / Manufacturer';
  const commodityName = fields.commodityName.value ?? 'Packaged Product';

  rules.forEach((rule) => {
    let status: 'pass' | 'fail' | 'manual_review' = 'fail';
    let matchedText: string | undefined;
    let matchedBboxes: BoundingBox[] = [];
    let warning: string | undefined;
    let guidanceNote: string | undefined;

    switch (rule.id) {
      case 'MANUFACTURER_ADDRESS': {
        const hasManufacturerContext = Boolean(fields.manufacturer.value);
        const hasPin = /\b\d{6}\b/.test(cleanText);
        if (hasManufacturerContext || hasPin) {
          status = hasManufacturerContext ? 'pass' : 'manual_review';
          matchedText = fields.manufacturer.value || `PIN detected: ${cleanText.match(/\b\d{6}\b/)?.[0] ?? 'unknown'}`;
          matchedBboxes = findMatchingBboxes(/(mfd|manufactured|marketed|packed|imported|by)/i);
          guidanceNote = hasManufacturerContext ? 'Contextual label and nearby text indicate manufacturer/packer/importer details.' : 'PIN alone is not sufficient; manual review required.';
        } else {
          status = 'fail';
          guidanceNote = 'No manufacturer/packer/importer declaration with sufficient contextual evidence was found.';
        }
        break;
      }
      case 'COMMODITY_NAME': {
        if (fields.commodityName.value) {
          status = 'manual_review';
          matchedText = fields.commodityName.value;
          matchedBboxes = findMatchingBboxes(fields.commodityName.value.slice(0, 12));
          guidanceNote = 'Generic name was detected; inspector confirmation is recommended when OCR positioning is uncertain.';
        } else {
          status = 'manual_review';
          matchedText = 'Unclear from raw OCR';
          guidanceNote = 'Requires officer manual verification for non-standard placement.';
        }
        break;
      }
      case 'NET_QUANTITY': {
        if (fields.netQuantity.value) {
          status = 'pass';
          matchedText = fields.netQuantity.value;
          matchedBboxes = findMatchingBboxes(/(net|quantity|qty|wt|weight|volume|unit|units|piece|pieces)/i);
          guidanceNote = 'Net quantity detected with contextual label support.';
        } else {
          status = 'fail';
          guidanceNote = 'No net quantity declaration with contextual evidence found.';
        }
        break;
      }
      case 'MRP': {
        if (fields.mrp.value) {
          status = 'pass';
          matchedText = fields.mrp.value;
          matchedBboxes = findMatchingBboxes(/(mrp|maximum|retail|price|₹|rs|inr)/i);
          if (!/inclusive\s+of\s+all\s+taxes/i.test(cleanText)) {
            warning = "Soft check: 'Inclusive of all taxes' phrase is absent from the nearby declaration text.";
          }
          guidanceNote = 'MRP was detected with contextual evidence; confirm the exact value and tax phrase during manual review.';
        } else {
          status = 'fail';
          guidanceNote = 'MRP declaration not confidently detected from OCR evidence.';
        }
        break;
      }
      case 'MFG_DATE': {
        if (fields.manufacturingDate.value) {
          status = 'pass';
          matchedText = fields.manufacturingDate.value;
          matchedBboxes = findMatchingBboxes(/(manufacture|manufactured|packed|packing|imported|jun|jan|feb|mar|apr|may|jul|aug|sep|oct|nov|dec)/i);
          guidanceNote = 'Manufacture/packing/import date detected with contextual label support.';
        } else {
          status = 'fail';
          guidanceNote = 'Manufacturing or packing month/year declaration was not confidently found.';
        }
        break;
      }
      case 'CONSUMER_CARE': {
        if (fields.consumerCarePhone.value || fields.consumerCareEmail.value) {
          status = 'pass';
          matchedText = [fields.consumerCarePhone.value, fields.consumerCareEmail.value].filter(Boolean).join(' | ');
          matchedBboxes = findMatchingBboxes(/(customer|consumer|care|complaint|contact|helpline|@|1800|\+91)/i);
          guidanceNote = 'Consumer care evidence was detected; completeness should still be reviewed with the label text.';
        } else {
          status = 'fail';
          guidanceNote = 'Consumer care phone/email not found with adequate evidence.';
        }
        break;
      }
      case 'COUNTRY_OF_ORIGIN': {
        if (!context.isImported) {
          status = 'pass';
          matchedText = 'Not applicable for domestic package';
          guidanceNote = 'Domestic package exemption applies.';
        } else if (fields.countryOfOrigin.value) {
          status = 'pass';
          matchedText = fields.countryOfOrigin.value;
          matchedBboxes = findMatchingBboxes(/(country|origin|made|china|india)/i);
          guidanceNote = 'Country of origin declaration found for imported package.';
        } else {
          status = 'fail';
          guidanceNote = 'Country of origin declaration is required for an imported package and is missing or uncertain.';
        }
        break;
      }
    }

    results.push({
      ruleId: rule.id,
      legalRef: rule.legalRef,
      title: rule.title,
      status,
      matchedText,
      matchedBboxes,
      warning,
      guidanceNote,
    });
  });

  const passCount = results.filter((r) => r.status === 'pass').length;
  const failCount = results.filter((r) => r.status === 'fail').length;
  const reviewCount = results.filter((r) => r.status === 'manual_review').length;

  let overallStatus: 'Compliant' | 'Non-Compliant' | 'Needs Review' = 'Compliant';
  if (failCount > 0) {
    overallStatus = 'Non-Compliant';
  } else if (reviewCount > 0) {
    overallStatus = 'Needs Review';
  }

  return {
    id: `SCAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    productName: commodityName,
    manufacturerName: manufacturer,
    isImported: context.isImported,
    imageUrl: context.imageUrl || '',
    imageDimensions: context.imageDimensions,
    extractedText,
    words,
    results,
    passCount,
    failCount,
    reviewCount,
    overallStatus,
  };
}
