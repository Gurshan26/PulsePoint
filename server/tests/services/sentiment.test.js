import { describe, it, expect } from 'vitest';
import { keywordSentiment } from '../../src/services/sentiment';

describe('keywordSentiment', () => {
  it('classifies positive text', () => {
    expect(keywordSentiment('The staff were great and very helpful').sentiment).toBe('positive');
  });

  it('classifies negative text', () => {
    expect(keywordSentiment('Terrible experience, everything was broken').sentiment).toBe('negative');
  });

  it('classifies neutral text', () => {
    expect(keywordSentiment('The service was okay I suppose').sentiment).toBe('neutral');
  });

  it('returns bounded confidence and handles empty strings', () => {
    const result = keywordSentiment('Good experience');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(() => keywordSentiment('')).not.toThrow();
  });

  it('is case insensitive', () => {
    expect(keywordSentiment('GREAT SERVICE').sentiment).toBe('positive');
  });
});
