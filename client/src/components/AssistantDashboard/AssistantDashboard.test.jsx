import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import AssistantDashboard from './AssistantDashboard';

describe('AssistantDashboard Component', () => {
  it('confirms top bar, back button, and feed badge are cleanly removed from dashboard body', async () => {
    await act(async () => {
      render(
        <AssistantDashboard
          planResult={null}
          isLoading={false}
          apiError={null}
          selectedPreset={null}
          onSubmitForm={vi.fn()}
          onResetPlan={vi.fn()}
          onSelectPreset={vi.fn()}
        />
      );
    });

    // Confirms back button, Clean Air Intelligence Hub title, and Live Open-Meteo badge are removed
    expect(screen.queryByRole('button', { name: /Back to overview/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1, name: /Clean Air Intelligence Hub/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Live Open-Meteo Feed/i)).not.toBeInTheDocument();

    // The interactive workspace region is active
    expect(screen.getByRole('region', { name: /Urban Air Quality Interactive Workspace/i })).toBeInTheDocument();
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
          onSelectPreset={vi.fn()}
        />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: /Tell Us About Your Household & Commute/i })).toBeInTheDocument();
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
          onSelectPreset={vi.fn()}
        />
      );
    });

    expect(screen.getByRole('heading', { level: 2, name: /Clean Air Action Plan/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Ask Questions & Refine Your Plan/i })).toBeInTheDocument();
  });

  it('calls onSelectPreset when quick demo preset is clicked', async () => {
    const onSelect = vi.fn();
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
          onSelectPreset={onSelect}
        />
      );
    });

    const presetBtn = screen.getByRole('button', { name: /Load Delhi Family/i });
    await user.click(presetBtn);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0].city).toBe('Delhi');
  });
});
