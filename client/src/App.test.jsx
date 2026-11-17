import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

describe('App Root Component', () => {
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

  it('renders the header and application title', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { level: 1, name: /Urban Air Quality Assistant/i });
    expect(heading).toBeInTheDocument();
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
});
