import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Navbar from './Navbar';

describe('Navbar Component', () => {
  const mockServerHealth = {
    status: 'online',
    message: 'Backend online (DB Connected)',
  };

  it('renders brand title, skip link, and navigation anchors', () => {
    render(<Navbar serverHealth={mockServerHealth} onNavigateToGenerator={vi.fn()} />);

    expect(screen.getByText(/Urban Air Quality Assistant/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Skip to main content/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /3 Pillars/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Why Us/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /FAQ/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Get Plan/i })).toBeInTheDocument();
  });

  it('displays the system online badge', () => {
    render(<Navbar serverHealth={mockServerHealth} onNavigateToGenerator={vi.fn()} />);

    expect(screen.getByText('System Online')).toBeInTheDocument();
  });

  it('toggles mobile menu on button click', async () => {
    const user = userEvent.setup();
    render(<Navbar serverHealth={mockServerHealth} onNavigateToGenerator={vi.fn()} />);

    const toggleBtn = screen.getByRole('button', { name: /Open navigation menu/i });
    expect(toggleBtn).toBeInTheDocument();

    await act(async () => {
      await user.click(toggleBtn);
    });
    expect(screen.getByRole('button', { name: /Close navigation menu/i })).toBeInTheDocument();
  });
});
