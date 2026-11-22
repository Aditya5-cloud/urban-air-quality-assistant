import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

describe('App Root Component & Streamlined Landing Page', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          success: true,
          status: 'healthy',
          services: { database: 'connected' }
        }),
      })
    ));
  });

  it('renders the brand title and main hero headline', () => {
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

  it('renders the plan generator workspace and FAQ section', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 2, name: /Generate Your Clean Air Plan/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Frequently Asked Questions/i })).toBeInTheDocument();
  });

  it('confirms 3 pillars and why-us sections are cleanly removed from the main flow', () => {
    render(<App />);
    expect(screen.queryByRole('heading', { level: 2, name: /Three Pillars of Winter Smog Protection/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: /Why Traditional Weather Apps Fall Short/i })).not.toBeInTheDocument();
  });
});
