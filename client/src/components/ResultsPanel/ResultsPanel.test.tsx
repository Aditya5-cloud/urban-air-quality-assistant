import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ResultsPanel from './ResultsPanel';
import { PlanResult } from '../../types';

describe('ResultsPanel Component', () => {
  const mockPlan: PlanResult = {
    sessionId: '550e8400-e29b-41d4-a716-446655440000',
    profile: {
      city: 'Delhi',
      householdType: 'family',
      householdSize: 4,
      commute: 'car',
      healthConcern: false,
      seasonContext: 'winter_smog',
    },
    recommendations: {
      routines: ['Wait until after 10:30 AM for outdoor travel: Cold morning smog stays trapped.'],
      indoorHacks: ['Set up a simple box fan filter: Cleans smoke particles cheaply.'],
      alternatives: ['Carpool with neighbors: Cuts neighborhood exhaust.'],
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

  it('renders the clean main heading and the 3 friendly action categories', () => {
    render(<ResultsPanel planData={mockPlan} onReset={vi.fn()} />);

    expect(screen.getByRole('heading', { level: 2, name: /Clean Air Action Plan/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Outdoor Schedule & Travel/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Clean Air Inside Your Home/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Simple Everyday Habits/i })).toBeInTheDocument();
  });

  it('displays the direct payoff callout for recommendations', () => {
    render(<ResultsPanel planData={mockPlan} onReset={vi.fn()} />);

    expect(screen.getByText(/Avoids 40% higher ground-level inversion peak/i)).toBeInTheDocument();
    expect(screen.getByText(/Reduces indoor PM2.5 by 50%/i)).toBeInTheDocument();
  });

  it('confirms shareable session link section is cleanly removed', () => {
    render(<ResultsPanel planData={mockPlan} onReset={vi.fn()} />);

    expect(screen.queryByLabelText(/Shareable Session Link/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Copy plan link to clipboard/i })).not.toBeInTheDocument();
  });

  it('calls onReset when user clicks modify details', async () => {
    const user = userEvent.setup();
    const handleReset = vi.fn();
    render(<ResultsPanel planData={mockPlan} onReset={handleReset} />);

    const resetBtn = screen.getByRole('button', { name: /Edit intake form and create a new plan/i });
    await user.click(resetBtn);

    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
