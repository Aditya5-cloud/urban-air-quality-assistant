import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PillarsSection from './PillarsSection';

describe('PillarsSection Component', () => {
  it('renders section title and all 3 core protection pillars', () => {
    render(<PillarsSection />);

    expect(screen.getByRole('heading', { level: 2, name: /Three Pillars of Winter Smog Protection/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Low-Emission Daily Routines/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Indoor Air Quality Hacks/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Sustainable Alternatives/i })).toBeInTheDocument();
  });

  it('renders direct impact explanation boxes for each pillar', () => {
    render(<PillarsSection />);

    const impactLabels = screen.getAllByText(/Direct Impact:/i);
    expect(impactLabels.length).toBe(3);
    expect(screen.getByText(/Avoids 35%–60% higher ground-level particulate concentrations/i)).toBeInTheDocument();
    expect(screen.getByText(/Lowers indoor PM2.5 levels by 40%–70%/i)).toBeInTheDocument();
  });
});
