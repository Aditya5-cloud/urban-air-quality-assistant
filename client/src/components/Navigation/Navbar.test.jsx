import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Navbar from './Navbar';

describe('Navbar Component', () => {
  it('renders brand title, skip link, and weather/air quality indicators', () => {
    render(<Navbar onNavigateToGenerator={vi.fn()} />);

    expect(screen.getByText(/Urban Air Quality Assistant/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Skip to main content/i })).toBeInTheDocument();
    expect(screen.getByText('Weather Condition')).toBeInTheDocument();
    expect(screen.getByText('Winter Stagnation')).toBeInTheDocument();
    expect(screen.getByText('Air Quality')).toBeInTheDocument();
    expect(screen.getByText('PM2.5 Adaptive AI')).toBeInTheDocument();
  });

  it('renders the Get Plan button and handles click', async () => {
    const user = userEvent.setup();
    const handleNavigate = vi.fn();
    render(<Navbar onNavigateToGenerator={handleNavigate} />);

    const getPlanBtn = screen.getByRole('button', { name: /Jump to plan generator/i });
    expect(getPlanBtn).toBeInTheDocument();

    await user.click(getPlanBtn);
    expect(handleNavigate).toHaveBeenCalledTimes(1);
  });
});
