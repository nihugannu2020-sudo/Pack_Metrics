import { describe, expect, it } from 'vitest';
import { extractFieldsFromText } from '../fieldExtractor';

describe('field extraction service', () => {
  it('handles MRP with ₹', () => {
    const fields = extractFieldsFromText('Maximum Retail Price ₹9,999.00 Inclusive of all Taxes');
    expect(fields.mrp.value).toContain('9');
  });

  it('handles MRP with Rs', () => {
    const fields = extractFieldsFromText('MRP Rs 9,999.00');
    expect(fields.mrp.value).not.toBeNull();
  });

  it('handles the JBL-style declaration block', () => {
    const fields = extractFieldsFromText('Generic Name: Headphones Net Quantity 1 Unit Maximum Retail Price ₹ 9,999.00 Inclusive of all Taxes Month & Year of Manufacture June 2026 Country of Origin CHINA');
    expect(fields.commodityName.value).toContain('Headphones');
    expect(fields.netQuantity.value).toContain('1');
    expect(fields.countryOfOrigin.value).toContain('CHINA');
  });

  it('detects imported marketing customer care pattern', () => {
    const fields = extractFieldsFromText('Imported, Marketed & Customer Care by Harman International');
    expect(fields.manufacturer.value).toContain('Harman');
  });
});
