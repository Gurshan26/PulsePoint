import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NPSGauge from '../../components/NPSGauge/NPSGauge';

HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  scale: vi.fn(),
  setTransform: vi.fn()
}));

describe('NPSGauge', () => {
  it('renders label and positive score', () => {
    render(<NPSGauge score={35} promoterPct={55} detractorPct={20} total={200} />);
    expect(screen.getByText('Net Promoter Score')).toBeInTheDocument();
    expect(screen.getByText('+35')).toBeInTheDocument();
  });

  it('renders negative score without plus sign', () => {
    render(<NPSGauge score={-10} promoterPct={20} detractorPct={40} total={100} />);
    expect(screen.getByText('-10')).toBeInTheDocument();
  });

  it('renders dash for null score and breakdown labels', () => {
    render(<NPSGauge score={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('Promoters')).toBeInTheDocument();
    expect(screen.getByText('Passives')).toBeInTheDocument();
    expect(screen.getByText('Detractors')).toBeInTheDocument();
  });

  it('shows total response count and canvas', () => {
    render(<NPSGauge score={35} promoterPct={55} detractorPct={20} total={200} />);
    expect(screen.getByText(/200/)).toBeInTheDocument();
    expect(document.querySelector('canvas')).toBeInTheDocument();
  });
});
