import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

describe('App Root Component & Two-View Architecture', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (url.includes('/api/weather-aqi')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            success: true,
            atmospheric: {
              city: 'Delhi',
              airQuality: { pm2_5: 110, us_aqi: 220, category: 'Very Unhealthy', color: '#9333ea' },
              weather: { temperature: 20, condition: 'Clear sky', inversionRisk: 'High' },
            },
          }),
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({
          success: true,
          status: 'healthy',
        }),
      });
    }));
  });

  it('renders the brand title and main hero headline on landing view', () => {
    render(<App />);
    expect(screen.getAllByText('Urban Air Quality Assistant').length).toBeGreaterThan(0);
    const mainHeading = screen.getByRole('heading', { level: 1, name: /Navigate Severe Winter Smog/i });
    expect(mainHeading).toBeInTheDocument();
  });

  it('provides a skip to content link for accessibility', () => {
    render(<App />);
    const skipLink = screen.getByRole('link', { name: /Skip to main content/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('renders main content container with role="main"', () => {
    render(<App />);
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('id', 'main-content');
  });

  it('navigates from landing page to dedicated assistant page on CTA click', async () => {
    const user = userEvent.setup();
    render(<App />);

    // In landing view: form is NOT in the landing page
    expect(screen.queryByRole('heading', { level: 2, name: /Personal Profile Intake/i })).not.toBeInTheDocument();

    // Click CTA to open dedicated assistant view
    const ctaBtn = screen.getByRole('button', { name: /Generate Your Clean Air Plan/i });
    await user.click(ctaBtn);

    // Now in dedicated Assistant view
    expect(screen.getByRole('heading', { level: 1, name: /Clean Air Intelligence Hub/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Personal Profile Intake/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Back to overview landing page/i })).toBeInTheDocument();

    // Click back to return to landing
    const backBtn = screen.getByRole('button', { name: /Back to overview landing page/i });
    await user.click(backBtn);
    expect(screen.getByRole('heading', { level: 1, name: /Navigate Severe Winter Smog/i })).toBeInTheDocument();
  });

  it('opens dedicated assistant view when clicking an instant evaluator demo preset', async () => {
    const user = userEvent.setup();
    render(<App />);

    const presetBtn = screen.getByRole('button', { name: /Delhi Family Commuter/i });
    await user.click(presetBtn);

    // Dedicated assistant view is now active with form pre-populated
    expect(screen.getByRole('heading', { level: 1, name: /Clean Air Intelligence Hub/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('New Delhi')).toBeInTheDocument();
  });
});
