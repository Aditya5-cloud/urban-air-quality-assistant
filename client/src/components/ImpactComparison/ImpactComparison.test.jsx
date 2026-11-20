import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ImpactComparison from './ImpactComparison';

describe('ImpactComparison Component', () => {
  it('renders comparison heading and table headers', () => {
    render(<ImpactComparison />);

    expect(screen.getByRole('heading', { level: 2, name: /Why Traditional Weather Apps Fall Short/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Dimension/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Generic AQI Apps/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Urban Air Quality Assistant/i })).toBeInTheDocument();
  });

  it('renders all key comparison dimensions', () => {
    render(<ImpactComparison />);

    expect(screen.getByRole('rowheader', { name: /Actionability/i })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: /Inversion Timing/i })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: /Indoor Air Strategy/i })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: /Impact Transparency/i })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: /Follow-Up Questions/i })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: /Data Privacy/i })).toBeInTheDocument();
  });
});
