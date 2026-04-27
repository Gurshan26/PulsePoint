import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import MetricCard from '../../components/MetricCard/MetricCard';

describe('MetricCard', () => {
  it('renders label and value', () => {
    render(<MetricCard label="CSAT" value="74%" />);
    expect(screen.getByText('CSAT')).toBeInTheDocument();
    expect(screen.getByText('74%')).toBeInTheDocument();
  });

  it('renders dash for null value', () => {
    render(<MetricCard label="NPS" value={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders subtitle and custom tooltip trigger', () => {
    render(<MetricCard label="CES" value="3.2" subtitle="245 responses" description="Lower is better" />);
    expect(screen.getByText('245 responses')).toBeInTheDocument();
    expect(screen.getByLabelText('Lower is better')).toBeInTheDocument();
  });

  it('shows delta when provided', () => {
    render(<MetricCard label="NPS" value="+35" delta={5} deltaDir="up" />);
    expect(screen.getByText(/Up 5/)).toBeInTheDocument();
  });
});
