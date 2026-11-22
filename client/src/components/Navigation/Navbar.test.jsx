import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Navbar from './Navbar';

describe('Navbar Component', () => {
  const mockAtmospheric = {
    city: 'Delhi',
    airQuality: {
      pm2_5: 117.6,
      pm10: 119,
      us_aqi: 229,
      category: 'Very Unhealthy',
      color: '#9333ea',
    },
    weather: {
      temperature: 22,
      condition: 'Clear sky',
      inversionRisk: 'High (Thermal Inversion Stagnation Active)',
    },
  };

  it('renders brand title and real-time live atmospheric card in header', () => {
    render(
      <Navbar
        currentView="landing"
        atmospheric={mockAtmospheric}
        currentCity="Delhi"
        onNavigateToGenerator={vi.fn()}
      />
    );

    expect(screen.getByText(/Urban Air Quality Assistant/i)).toBeInTheDocument();

    // Verify live atmospheric card in header
    expect(screen.getByText('Delhi')).toBeInTheDocument();
    expect(screen.getByText(/22°C • Clear sky/i)).toBeInTheDocument();
    expect(screen.getByText(/PM2.5: 117.6 µg\/m³/i)).toBeInTheDocument();
    expect(screen.getByText(/AQI 229 • Very Unhealthy/i)).toBeInTheDocument();
    expect(screen.getByText(/High Inversion/i)).toBeInTheDocument();
  });

  it('renders the Get Plan button on landing view and handles click', async () => {
    const user = userEvent.setup();
    const handleNavigate = vi.fn();
    render(
      <Navbar
        currentView="landing"
        atmospheric={mockAtmospheric}
        currentCity="Delhi"
        onNavigateToGenerator={handleNavigate}
      />
    );

    const getPlanBtn = screen.getByRole('button', { name: /Jump to plan generator/i });
    expect(getPlanBtn).toBeInTheDocument();

    await user.click(getPlanBtn);
    expect(handleNavigate).toHaveBeenCalledTimes(1);
  });

  it('does not render the Get Plan CTA button when in assistant view', () => {
    render(
      <Navbar
        currentView="assistant"
        atmospheric={mockAtmospheric}
        currentCity="Delhi"
        onNavigateToGenerator={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /Jump to plan generator/i })).not.toBeInTheDocument();
    expect(screen.getByText('Delhi')).toBeInTheDocument();
  });
});
