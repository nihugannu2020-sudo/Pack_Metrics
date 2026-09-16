import { describe, expect, it } from 'vitest';
import { classifyDeclaration, DECLARATION_CLASSES } from '../declarationClassifier';

describe('declaration classifier', () => {
  it('recognizes an MRP declaration without confusing it with a technical specification', () => {
    const prediction = classifyDeclaration('Maximum Retail Price ₹9,999.00 Inclusive of all Taxes');
    expect(prediction.label).toBe('MRP');
    expect(prediction.confidence).toBeGreaterThan(0.7);
  });

  it('recognizes a technical specification as a non-legal field', () => {
    const prediction = classifyDeclaration('Bluetooth 5.3');
    expect(prediction.label).toBe('TECHNICAL_SPECIFICATION');
  });

  it('identifies a manufacturer declaration from nearby label text', () => {
    const prediction = classifyDeclaration('Manufactured by Harman International India Pvt Ltd');
    expect(prediction.label).toBe('MANUFACTURER');
  });

  it('uses an explicit class list for the legal declaration taxonomy', () => {
    expect(DECLARATION_CLASSES).toContain('MRP');
    expect(DECLARATION_CLASSES).toContain('MANUFACTURER');
    expect(DECLARATION_CLASSES).toContain('TECHNICAL_SPECIFICATION');
  });
});
