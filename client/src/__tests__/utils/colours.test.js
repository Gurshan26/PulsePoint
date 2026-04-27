import { describe, expect, it } from 'vitest';
import { csatColour, getDataColour, npsColour, sentimentColour } from '../../utils/colours';

describe('colours', () => {
  it('maps sentiment colours', () => {
    expect(sentimentColour('positive')).toContain('positive');
    expect(sentimentColour('negative')).toContain('negative');
    expect(sentimentColour('neutral')).toContain('neutral');
    expect(sentimentColour('unknown')).toContain('neutral');
  });

  it('maps NPS and CSAT colours', () => {
    expect(npsColour(35)).toContain('positive');
    expect(npsColour(15)).toContain('neutral');
    expect(npsColour(-10)).toContain('negative');
    expect(npsColour(null)).toContain('ink');
    expect(csatColour(80)).toContain('positive');
    expect(csatColour(60)).toContain('neutral');
    expect(csatColour(30)).toContain('negative');
  });

  it('cycles data palette', () => {
    expect(typeof getDataColour(0)).toBe('string');
    expect(getDataColour(0)).not.toBe(getDataColour(1));
    expect(() => getDataColour(999)).not.toThrow();
  });
});
