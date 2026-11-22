import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AssistantDashboard from './AssistantDashboard';

describe('AssistantDashboard Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          success: true,
          atmospheric: {
            city: 'Delhi',
            airQuality: { pm2_5: 115, us_aqi: 225, category: 'Very Unhealthy', color: '#9333ea' },
            weather: { temperature: 21, condition: 'Clear sky', inversionRisk: 'High (Active)' },
          },
        }),
      })
    ));
  });

  it('renders top atmospheric ribbon and back button', async () => {
    await act(async () => {
      render(
        <AssistantDashboard
          planResult={null}
          isLoading={false}
          apiError={null}
          selectedPreset={null}
          onSubmitForm={vi.fn()}
          onResetPlan={vi.fn()}
          onBackToLanding={vi.fn()}
          onSelectPreset={vi.fn()}
        />
      );
    });

    expect(screen.getByRole('heading', { level: 1, name: /Clean Air Intelligence Hub/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Back to overview landing page/i })).toBeInTheDocument();
    expect(screen.getByText(/Live Open-Meteo Feed/i)).toBeInTheDocument();
  });

  it('renders intake form on left and domain-guarded intro on right when no plan exists', async () => {
    await act(async () => {
      render(
        <AssistantDashboard
          planResult={null}
          isLoading={false}
          apiError={null}
          selectedPreset={null}
          onSubmitForm={vi.fn()}
          onResetPlan={vi.fn()}
          onBackToLanding={vi.fn()}
          onSelectPreset={vi.fn()}
        />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: /Personal Profile Intake/i })).toBeInTheDocument();
    expect(screen.getByText(/Strict Domain-Guarded AI Assistant/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Load Delhi Family/i })).toBeInTheDocument();
  });

  it('renders results panel and active chat widget when planResult is present', async () => {
    const mockPlan = {
      sessionId: '123e4567-e89b-12d3-a456-426614174000',
      profile: {
        city: 'Delhi',
        householdType: 'family',
        householdSize: 4,
        commute: 'car',
        healthConcern: true,
        seasonContext: 'winter_smog',
      },
      recommendations: {
        routines: ['Shift morning routine past 10 AM'],
        indoorHacks: ['Build DIY Corsi-Rosenthal box filter'],
        alternatives: ['Use induction cooking over gas'],
        impacts: ['Reduces PM2.5 exposure by 50%'],
      },
      chatHistory: [],
    };

    await act(async () => {
      render(
        <AssistantDashboard
          planResult={mockPlan}
          isLoading={false}
          apiError={null}
          selectedPreset={null}
          onSubmitForm={vi.fn()}
          onResetPlan={vi.fn()}
          onBackToLanding={vi.fn()}
          onSelectPreset={vi.fn()}
        />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: /Personalized Air Quality Action Plan: Delhi/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Ask Questions & Refine Your Plan/i })).toBeInTheDocument();
  });

  it('calls onBackToLanding when back button is clicked', async () => {
    const onBack = vi.fn();
    const user = userEvent.setup();

    await act(async () => {
      render(
        <AssistantDashboard
          planResult={null}
          isLoading={false}
          apiError={null}
          selectedPreset={null}
          onSubmitForm={vi.fn()}
          onResetPlan={vi.fn()}
          onBackToLanding={onBack}
          onSelectPreset={vi.fn()}
        />
      );
    });

    const backBtn = screen.getByRole('button', { name: /Back to overview landing page/i });
    await user.click(backBtn);
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
