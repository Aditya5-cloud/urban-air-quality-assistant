import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import IntakeForm from './IntakeForm';

describe('IntakeForm Component', () => {
  it('renders all required form sections and accessible labels', () => {
    render(<IntakeForm onSubmit={vi.fn()} isLoading={false} />);

    expect(screen.getByRole('heading', { name: /Tell Us About Your Household & Commute/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/City \/ Urban Area/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Household Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Residents/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Primary Way You Travel for Work \/ School/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Vulnerable health conditions present/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Lifestyle Notes or Home Constraints/i)).toBeInTheDocument();
  });

  it('shows accessible error alert when submitting with empty city', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<IntakeForm onSubmit={handleSubmit} isLoading={false} />);

    const submitBtn = screen.getByRole('button', { name: /Generate personalized air quality plan/i });
    await act(async () => {
      await user.click(submitBtn);
    });

    const errorAlert = screen.getByRole('alert');
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent(/Please enter a valid city name/i);
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with formatted data when valid city is provided', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<IntakeForm onSubmit={handleSubmit} isLoading={false} />);

    const cityInput = screen.getByLabelText(/City \/ Urban Area/i);
    const submitBtn = screen.getByRole('button', { name: /Generate personalized air quality plan/i });

    await act(async () => {
      await user.type(cityInput, 'New Delhi');
      await user.click(submitBtn);
    });

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    const submitted = handleSubmit.mock.calls[0][0];
    expect(submitted.city).toBe('New Delhi');
    expect(submitted.householdType).toBe('family');
    expect(submitted.householdSize).toBe(4);
    expect(submitted.commute).toBe('public');
  });

  it('disables submit button and form controls while loading', () => {
    render(<IntakeForm onSubmit={vi.fn()} isLoading={true} />);

    const cityInput = screen.getByLabelText(/City \/ Urban Area/i);
    expect(cityInput).toBeDisabled();

    const submitBtn = screen.getByRole('button');
    expect(submitBtn).toBeDisabled();
    expect(screen.getByText(/Analyzing Smog Patterns & Generating Plan/i)).toBeInTheDocument();
  });
});
