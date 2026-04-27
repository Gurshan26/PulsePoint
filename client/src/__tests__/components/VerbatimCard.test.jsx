import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import VerbatimCard from '../../components/VerbatimCard/VerbatimCard';

const POSITIVE = {
  id: 'v1',
  verbatim: 'Great service from the team today.',
  sentiment: 'positive',
  themes: '["staff helpfulness"]',
  touchpoint: 'Branch Visit',
  date: '2026-04-10',
  nps_score: 9
};

const NEGATIVE = {
  id: 'v2',
  verbatim: 'Waited 30 minutes with no update.',
  sentiment: 'negative',
  themes: '["wait times"]',
  touchpoint: 'Phone',
  date: '2026-04-09',
  nps_score: 2
};

describe('VerbatimCard', () => {
  it('renders verbatim text, sentiment, and metadata', () => {
    render(<VerbatimCard verbatim={POSITIVE} />);
    expect(screen.getByText(/"Great service from the team today\."/)).toBeInTheDocument();
    expect(screen.getByText('Positive')).toBeInTheDocument();
    expect(screen.getByText('Branch Visit')).toBeInTheDocument();
    expect(screen.getByText('staff helpfulness')).toBeInTheDocument();
  });

  it('hides themes in compact mode', () => {
    render(<VerbatimCard verbatim={POSITIVE} compact />);
    expect(screen.queryByText('staff helpfulness')).not.toBeInTheDocument();
  });

  it('renders negative sentiment and NPS', () => {
    render(<VerbatimCard verbatim={NEGATIVE} />);
    expect(screen.getByText('Negative')).toBeInTheDocument();
    expect(screen.getByText(/NPS 2/)).toBeInTheDocument();
  });

  it('handles missing and malformed themes', () => {
    expect(() => render(<VerbatimCard verbatim={{ ...NEGATIVE, themes: null }} />)).not.toThrow();
    expect(() => render(<VerbatimCard verbatim={{ ...NEGATIVE, themes: 'not-json' }} />)).not.toThrow();
  });
});
