import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FAQSection from './FAQSection';

describe('FAQSection Component', () => {
  it('renders FAQ section title and questions', () => {
    render(<FAQSection />);

    expect(screen.getByRole('heading', { level: 2, name: /Frequently Asked Questions/i })).toBeInTheDocument();
    expect(screen.getByText(/What is a winter thermal inversion/i)).toBeInTheDocument();
    expect(screen.getByText(/How can a DIY Corsi-Rosenthal box match commercial HEPA purifiers/i)).toBeInTheDocument();
    expect(screen.getByText(/Why does wet mopping protect against PM2.5/i)).toBeInTheDocument();
    expect(screen.getByText(/Is any private data or location tracked/i)).toBeInTheDocument();
  });
});
