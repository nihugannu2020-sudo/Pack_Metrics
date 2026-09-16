import { describe, expect, it } from 'vitest';
import { getApplicableLegalRules, LEGAL_RULES } from '../ruleRegistry';

describe('legal rule registry', () => {
  it('keeps the official rule set and dates in a machine-readable structure', () => {
    expect(LEGAL_RULES.length).toBeGreaterThan(0);
    expect(LEGAL_RULES[0]).toMatchObject({
      id: expect.any(String),
      field: expect.any(String),
      legalSource: expect.any(String),
      effectiveFrom: expect.any(String),
    });
  });

  it('applies the effective-date rule for the inspection date', () => {
    const applicable = getApplicableLegalRules('2026-09-16');
    expect(applicable.some((rule) => rule.field === 'MRP')).toBe(true);
    expect(applicable.some((rule) => rule.field === 'COUNTRY_OF_ORIGIN')).toBe(true);
  });

  it('does not apply future amendments before their commencement date', () => {
    const applicable = getApplicableLegalRules('2026-09-16');
    const futureRules = applicable.filter((rule) => rule.id === 'RULE_2027_GENERAL_FOURTH_AMENDMENT');
    expect(futureRules).toHaveLength(0);
  });
});
