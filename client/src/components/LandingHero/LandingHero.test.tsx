import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import LandingHero from './LandingHero';

describe('LandingHero Component', () => {
  it('renders hero headline, badge, and primary CTA button', () => {
    render(<LandingHero onSelectPreset={vi.fn()} />);

    expect(screen.getByRole('heading', { level: 1, name: /Navigate Severe Winter Smog/i })).toBeInTheDocument();
    expect(screen.getByText(/PromptWar Challenge 6 • GenAI Urban Smog Navigator/i)).toBeInTheDocument();

    const ctaBtn = screen.getByRole('button', { name: /Generate Your Clean Air Plan/i });
    expect(ctaBtn).toBeInTheDocument();

    // Verify 'Explore 3 Protection Pillars' has been removed
    expect(screen.queryByRole('button', { name: /Explore 3 Protection Pillars/i })).not.toBeInTheDocument();
  });

  it('renders evaluator preset demo buttons and triggers onSelectPreset', async () => {
    const user = userEvent.setup();
    const handleSelectPreset = vi.fn();
    render(<LandingHero onSelectPreset={handleSelectPreset} />);

    const delhiPresetBtn = screen.getByRole('button', { name: /Delhi Family Commuter/i });
    expect(delhiPresetBtn).toBeInTheDocument();

    await user.click(delhiPresetBtn);
    expect(handleSelectPreset).toHaveBeenCalledTimes(1);
    const firstCall = handleSelectPreset.mock.calls[0][0];
    expect(firstCall.city).toBe('New Delhi');
  });

  it('displays key impact metrics and statistics', () => {
    render(<LandingHero onSelectPreset={vi.fn()} />);

    expect(screen.getByText('35% – 60%')).toBeInTheDocument();
    expect(screen.getByText('40% – 70%')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
