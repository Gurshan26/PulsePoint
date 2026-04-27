import { describe, expect, it } from 'vitest';
import { formatDate, formatNPS, formatNumber, formatPercent, npsLabel, truncate } from '../../utils/formatters';

describe('formatters', () => {
  it('formats dates and null dates', () => {
    expect(formatDate('2026-04-10')).toBe('10 Apr 2026');
    expect(formatDate(null)).toBe('—');
  });

  it('formats NPS values', () => {
    expect(formatNPS(35)).toBe('+35');
    expect(formatNPS(-10)).toBe('-10');
    expect(formatNPS(0)).toBe('0');
    expect(formatNPS(null)).toBe('—');
  });

  it('formats percentages and numbers', () => {
    expect(formatPercent(74)).toBe('74%');
    expect(formatPercent(74.5, 1)).toBe('74.5%');
    expect(formatNumber(1234)).toBe('1,234');
  });

  it('truncates long strings', () => {
    const result = truncate('a'.repeat(200), 100);
    expect(result.length).toBeLessThanOrEqual(103);
    expect(result).toContain('...');
  });

  it('labels NPS ranges', () => {
    expect(npsLabel(60)).toBe('Excellent');
    expect(npsLabel(35)).toBe('Good');
    expect(npsLabel(15)).toBe('Fair');
    expect(npsLabel(-5)).toBe('Poor');
    expect(npsLabel(null)).toBeNull();
  });
});
