import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import SentimentBar from '../../components/SentimentBar/SentimentBar';

describe('SentimentBar', () => {
  it('renders labels and percentages', () => {
    render(<SentimentBar positive={60} neutral={25} negative={15} />);
    expect(screen.getByText(/Positive 60%/)).toBeInTheDocument();
    expect(screen.getByText(/Neutral 25%/)).toBeInTheDocument();
    expect(screen.getByText(/Negative 15%/)).toBeInTheDocument();
  });

  it('renders counts when totals are provided', () => {
    render(<SentimentBar positive={60} neutral={25} negative={15} totals={{ positive: 300, neutral: 125, negative: 75 }} />);
    expect(screen.getByText('(300)')).toBeInTheDocument();
    expect(screen.getByText('(75)')).toBeInTheDocument();
  });

  it('has chart role label', () => {
    render(<SentimentBar positive={60} neutral={25} negative={15} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', expect.stringContaining('60% positive'));
  });
});
