import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatWidget from './ChatWidget';

describe('ChatWidget Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          reply: 'Ensure windows are kept sealed until afternoon wind peaks.',
        }),
      })
    ));
  });

  it('renders chat widget heading and empty state suggestions', () => {
    render(<ChatWidget sessionId="550e8400-e29b-41d4-a716-446655440000" profileCity="Delhi" />);

    expect(screen.getByRole('heading', { name: /Ask Questions & Refine Your Plan/i })).toBeInTheDocument();
    expect(screen.getByText(/Example questions you can ask/i)).toBeInTheDocument();
  });

  it('sends message on form submit and displays user and assistant bubbles', async () => {
    const user = userEvent.setup();
    render(<ChatWidget sessionId="550e8400-e29b-41d4-a716-446655440000" profileCity="Delhi" />);

    const textarea = screen.getByPlaceholderText(/Type your question here/i);
    const sendButton = screen.getByRole('button', { name: /Send question/i });

    await act(async () => {
      await user.type(textarea, 'Can we exercise in the morning?');
      await user.click(sendButton);
    });

    expect(screen.getByText('Can we exercise in the morning?')).toBeInTheDocument();
    expect(screen.getByText(/Ensure windows are kept sealed/i)).toBeInTheDocument();
  });

  it('disables send button when textarea is empty', () => {
    render(<ChatWidget sessionId="550e8400-e29b-41d4-a716-446655440000" profileCity="Delhi" />);

    const sendButton = screen.getByRole('button', { name: /Send question/i });
    expect(sendButton).toBeDisabled();
  });
});
