import { describe, expect, it } from 'vitest';
import { normalizeOCRText } from '../textNormalization';
import { extractFieldsFromText } from '../../compliance/fieldExtractor';

describe('OCR normalization and field extraction', () => {
  it('normalizes manufactured by variants', () => {
    expect(normalizeOCRText('Manufacturedby')).toContain('Manufactured by');
    expect(normalizeOCRText('Imported,Marketed&CustomerCareby')).toContain('Imported, Marketed & Customer Care by');
  });

  it('extracts MRP from currency and spacing variants', () => {
    const text = 'Maximum Retail Price 9 999.00';
    const fields = extractFieldsFromText(text);
    expect(fields.mrp.value).not.toBeNull();
  });

  it('extracts consumer care phone and email', () => {
    const text = 'Customer Care 1800-102-0525 India_csupport@harman.com';
    const fields = extractFieldsFromText(text);
    expect(fields.consumerCarePhone.value).toContain('1800');
    expect(fields.consumerCareEmail.value).toContain('@');
  });

  it('extracts net quantity and creation date', () => {
    const text = 'Net Quantity 1 Unit Month & Year of Manufacture June 2026';
    const fields = extractFieldsFromText(text);
    expect(fields.netQuantity.value).toContain('Net Quantity');
    expect(fields.manufacturingDate.value).toContain('June');
  });

  it('rejects battery capacity as net quantity', () => {
    const text = '5000 mAh';
    const fields = extractFieldsFromText(text);
    expect(fields.netQuantity.value).toBeNull();
  });
});
