import rulesData from '../data/rules.json';
import type { OCRWord, RuleResult, ComplianceReport, DeclarationRule, BoundingBox } from '../types';

export function validateRuleEngine(
  extractedText: string,
  words: OCRWord[] = [],
  context: { isImported: boolean; imageUrl?: string; imageDimensions?: { width: number; height: number } } = { isImported: false }
): ComplianceReport {
  const cleanText = extractedText.replace(/\s+/g, ' ');
  const results: RuleResult[] = [];
  const rules = rulesData.declarations as DeclarationRule[];

  // Helper to find matching word bounding boxes
  const findMatchingBboxes = (pattern: RegExp | string): BoundingBox[] => {
    const matched: BoundingBox[] = [];
    words.forEach(w => {
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

  let detectedProductName = '';
  let detectedManufacturer = '';

  // Process each declaration rule
  rules.forEach(rule => {
    let status: 'pass' | 'fail' | 'manual_review' = 'fail';
    let matchedText: string | undefined = undefined;
    let matchedBboxes: BoundingBox[] = [];
    let warning: string | undefined = undefined;
    let guidanceNote: string | undefined = undefined;

    switch (rule.id) {
      case 'MANUFACTURER_ADDRESS': {
        const mfdRegex = /(mfd|manufactured|marketed|packed|imported)\s+by[:\s]*([^\n,]+)/i;
        const pinRegex = /\b\d{6}\b/;
        const mfdMatch = cleanText.match(mfdRegex);
        const pinMatch = cleanText.match(pinRegex);

        if (mfdMatch || pinMatch) {
          status = 'pass';
          matchedText = mfdMatch ? mfdMatch[0] : (pinMatch ? `PIN Code: ${pinMatch[0]}` : 'Address found');
          detectedManufacturer = mfdMatch ? mfdMatch[2].trim() : 'Detected Manufacturer';
          
          matchedBboxes = [
            ...findMatchingBboxes(/(mfd|manufactured|marketed|packed|imported|by)/i),
            ...findMatchingBboxes(/\b\d{6}\b/)
          ];
        } else {
          status = 'fail';
        }
        break;
      }

      case 'COMMODITY_NAME': {
        // First prominent text line or line without numbers
        const lines = extractedText.split('\n').map(l => l.trim()).filter(l => l.length > 2);
        const likelyTitle = lines.find(l => !/₹|rs|mrp|\d{6}|mfd|packed|batch/i.test(l));
        
        if (likelyTitle) {
          status = 'manual_review'; // Per Rule 6(1)(b) detectionHint: mark manual review rather than hard fail
          matchedText = likelyTitle;
          detectedProductName = likelyTitle;
          matchedBboxes = findMatchingBboxes(likelyTitle.split(' ')[0] || likelyTitle);
          guidanceNote = "Generic name identified. Inspector verify exact statutory product name alignment.";
        } else {
          status = 'manual_review';
          matchedText = "Unclear from raw OCR";
          guidanceNote = "Requires officer manual verification for non-standard positioning.";
        }
        break;
      }

      case 'NET_QUANTITY': {
        const qtyRegex = /(\d+(\.\d+)?)\s?(g|gm|grams?|kg|kilograms?|ml|millilitres?|milliliters?|l|litres?|liters?|nos?|pieces?|units?)\b/i;
        const qtyMatch = cleanText.match(qtyRegex);

        if (qtyMatch) {
          status = 'pass';
          matchedText = qtyMatch[0];
          matchedBboxes = findMatchingBboxes(qtyRegex);

          const valueNum = parseFloat(qtyMatch[1]);
          const unit = qtyMatch[3].toLowerCase();

          // Calculate height guidance from fontHeightTable
          if (unit.includes('g') || unit.includes('ml') || unit.includes('l')) {
            if (valueNum <= 200 && !unit.includes('kg') && !unit.includes('l')) {
              guidanceNote = "Net Qty ≤ 200g/ml → Min statutory font height: ≥ 1.0 mm (≥ 2.0 mm if molded/blown)";
            } else if ((valueNum > 200 && valueNum <= 500) || unit.includes('kg') || unit.includes('l')) {
              guidanceNote = "Net Qty 200g-500g/ml → Min statutory font height: ≥ 2.0 mm (≥ 4.0 mm if molded/blown)";
            } else {
              guidanceNote = "Net Qty > 500g/ml → Min statutory font height: ≥ 4.0 mm (≥ 6.0 mm if molded/blown)";
            }
          } else {
            guidanceNote = "Standard count units detected → Min statutory height: ≥ 2.0 mm";
          }
        } else {
          status = 'fail';
        }
        break;
      }

      case 'MRP': {
        const mrpRegex = /(₹|rs\.?|inr|mrp)\s?[:\-]?\s?\d+(\.\d{1,2})?/i;
        const mrpMatch = cleanText.match(mrpRegex);

        if (mrpMatch) {
          status = 'pass';
          matchedText = mrpMatch[0];
          matchedBboxes = findMatchingBboxes(mrpRegex);

          const taxPhraseRegex = /inclusive\s+of\s+all\s+taxes/i;
          if (!taxPhraseRegex.test(cleanText)) {
            warning = "Soft Check Warning: Mandatory phrase 'inclusive of all taxes' not found nearby.";
          }
          guidanceNote = "Max Retail Price declaration present. Check for decimal representation accuracy.";
        } else {
          status = 'fail';
        }
        break;
      }

      case 'MFG_DATE': {
        const dateRegex1 = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s\-/]?\d{2,4}/i;
        const dateRegex2 = /\b(0[1-9]|1[0-2])[\/\-]\d{2,4}\b/;
        const dateMatch = cleanText.match(dateRegex1) || cleanText.match(dateRegex2);

        if (dateMatch) {
          status = 'pass';
          matchedText = dateMatch[0];
          matchedBboxes = [...findMatchingBboxes(dateRegex1), ...findMatchingBboxes(dateRegex2)];
        } else {
          status = 'fail';
        }
        break;
      }

      case 'CONSUMER_CARE': {
        const phoneRegex = /\b(?:\+91[\-\s]?)?[6-9]\d{9}\b/;
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        const phoneMatch = cleanText.match(phoneRegex);
        const emailMatch = cleanText.match(emailRegex);

        if (phoneMatch || emailMatch) {
          status = 'pass';
          const parts = [];
          if (phoneMatch) parts.push(`Tel: ${phoneMatch[0]}`);
          if (emailMatch) parts.push(`Email: ${emailMatch[0]}`);
          matchedText = parts.join(' | ');
          matchedBboxes = [...findMatchingBboxes(phoneRegex), ...findMatchingBboxes(emailRegex)];
        } else {
          status = 'fail';
        }
        break;
      }

      case 'COUNTRY_OF_ORIGIN': {
        if (!context.isImported) {
          status = 'pass';
          matchedText = "Not Applicable (Domestic Pack)";
          guidanceNote = "Domestic declaration exemption applies.";
        } else {
          const originRegex = /(country of origin|made in|product of)\s*[:\-]?\s*([a-zA-Z\s]+)/i;
          const originMatch = cleanText.match(originRegex);
          if (originMatch) {
            status = 'pass';
            matchedText = originMatch[0];
            matchedBboxes = findMatchingBboxes(/(made|origin|product)/i);
          } else {
            status = 'fail';
          }
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

  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const reviewCount = results.filter(r => r.status === 'manual_review').length;

  let overallStatus: 'Compliant' | 'Non-Compliant' | 'Needs Review' = 'Compliant';
  if (failCount > 0) {
    overallStatus = 'Non-Compliant';
  } else if (reviewCount > 0) {
    overallStatus = 'Needs Review';
  }

  return {
    id: `SCAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    productName: detectedProductName || "Packaged Product",
    manufacturerName: detectedManufacturer || "Packer / Manufacturer",
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
