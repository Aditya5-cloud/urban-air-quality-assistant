import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ResultsPanel from './ResultsPanel';

describe('ResultsPanel Component', () => {
  const mockPlan = {
    sessionId: '550e8400-e29b-41d4-a716-446655440000',
    profile: {
      city: 'Delhi',
      householdType: 'family',
      householdSize: 4,
      commute: 'car',
    },
    recommendations: {
      routines: ['Shift morning travel past 10 AM.'],
      indoorHacks: ['Set up DIY box fan filter with MERV-13.'],
      alternatives: ['Carpool with neighbors.'],
      impacts: [
        'Avoids 40% higher ground-level inversion peak.',
        'Reduces indoor PM2.5 by 50%.',
        'Cuts vehicle emissions per trip.',
      ],
    },
    metadata: {
      isMock: true,
      source: 'local-simulation',
    },
  };

  it('renders the main heading and the 3 core recommendation categories', () => {
    render(<ResultsPanel planData={mockPlan} onReset={vi.fn()} />);

    expect(screen.getByRole('heading', { level: 2, name: /Personalized Air Quality Action Plan: Delhi/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Low-Emission Daily Routines/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Indoor Air Quality Hacks/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Sustainable Alternatives/i })).toBeInTheDocument();
  });

  it('displays the direct impact callout for recommendations', () => {
    render(<ResultsPanel planData={mockPlan} onReset={vi.fn()} />);

    expect(screen.getByText(/Avoids 40% higher ground-level inversion peak/i)).toBeInTheDocument();
    expect(screen.getByText(/Reduces indoor PM2.5 by 50%/i)).toBeInTheDocument();
  });

  it('renders the shareable session link input and copy button', () => {
    render(<ResultsPanel planData={mockPlan} onReset={vi.fn()} />);

    const shareInput = screen.getByLabelText(/Shareable Session Link/i);
    expect(shareInput).toBeInTheDocument();
    expect(shareInput.value).toContain('session=550e8400-e29b-41d4-a716-446655440000');

    expect(screen.getByRole('button', { name: /Copy plan link to clipboard/i })).toBeInTheDocument();
  });

  it('calls onReset when user clicks modify intake details', async () => {
    const user = userEvent.setup();
    const handleReset = vi.fn();
    render(<ResultsPanel planData={mockPlan} onReset={handleReset} />);

    const resetBtn = screen.getByRole('button', { name: /Edit intake form and create a new plan/i });
    await user.click(resetBtn);

    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
