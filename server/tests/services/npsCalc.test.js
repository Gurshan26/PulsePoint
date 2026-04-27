import { describe, it, expect } from 'vitest';
import { calculateNPS, calculateCSAT, calculateCES, classifyNPS, npsChange } from '../../src/services/npsCalc';

describe('classifyNPS', () => {
  it('classifies promoters', () => {
    expect(classifyNPS(9)).toBe('promoter');
    expect(classifyNPS(10)).toBe('promoter');
  });

  it('classifies passives', () => {
    expect(classifyNPS(7)).toBe('passive');
    expect(classifyNPS(8)).toBe('passive');
  });

  it('classifies detractors', () => {
    for (let i = 0; i <= 6; i++) expect(classifyNPS(i)).toBe('detractor');
  });
});

describe('calculateNPS', () => {
  it('returns null for no valid scores', () => {
    expect(calculateNPS([])).toBeNull();
    expect(calculateNPS(null)).toBeNull();
  });

  it('calculates NPS correctly', () => {
    const result = calculateNPS([10, 10, 9, 9, 9, 7, 8, 7, 3, 5]);
    expect(result.score).toBe(30);
    expect(result.promoters).toBe(5);
    expect(result.passives).toBe(3);
    expect(result.detractors).toBe(2);
    expect(result.total).toBe(10);
  });

  it('handles extreme values and filters invalid scores', () => {
    expect(calculateNPS([10, 10, 9]).score).toBe(100);
    expect(calculateNPS([0, 1, 2]).score).toBe(-100);
    expect(calculateNPS([10, null, undefined, 1]).total).toBe(2);
  });
});

describe('calculateCSAT', () => {
  it('counts 4 and 5 as satisfied', () => {
    expect(calculateCSAT([5, 4, 3, 2, 1]).score).toBe(40);
  });

  it('calculates average and rejects out-of-range values', () => {
    const result = calculateCSAT([5, 6, 4]);
    expect(result.total).toBe(2);
    expect(result.average).toBe(4.5);
  });
});

describe('calculateCES', () => {
  it('calculates average and low-effort percentage', () => {
    const result = calculateCES([1, 2, 3, 5, 6, 7]);
    expect(result.average).toBe(4);
    expect(result.lowEffortPct).toBe(50);
  });

  it('rejects invalid values', () => {
    expect(calculateCES([2, 8, 3]).total).toBe(2);
  });
});

describe('npsChange', () => {
  it('calculates change and null cases', () => {
    expect(npsChange(35, 28)).toBe(7);
    expect(npsChange(10, 30)).toBe(-20);
    expect(npsChange(null, 30)).toBeNull();
  });
});
