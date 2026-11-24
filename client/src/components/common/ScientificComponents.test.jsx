import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AqiTrendSvg from './AqiTrendSvg';
import CadrCalculator from './CadrCalculator';
import CommuteComparison from './CommuteComparison';
import CommunityPledges from './CommunityPledges';

describe('Scientific & Accessible Components Suite', () => {
  describe('AqiTrendSvg (WCAG SC 1.1.1 Twin Representation)', () => {
    it('renders accessible screen-reader twin list and hides SVG visually', () => {
      const hourlyAqi = [180, 210, 240, 220, 190, 160];
      const { container } = render(<AqiTrendSvg hourlyAqi={hourlyAqi} city="Delhi" />);

      // Verify screen-reader text twin
      const srHeader = screen.getByText(/12-Hour Air Quality Forecast Trend for Delhi/i);
      expect(srHeader).toBeInTheDocument();
      expect(screen.getByText(/Hour \+1: Predicted AQI 180/i)).toBeInTheDocument();
      expect(screen.getByText(/Hour \+3: Predicted AQI 240/i)).toBeInTheDocument();

      // Verify visual graphic is aria-hidden
      const svgWrapper = container.querySelector('[aria-hidden="true"]');
      expect(svgWrapper).toBeInTheDocument();
      const svgEl = container.querySelector('svg');
      expect(svgEl).toHaveAttribute('role', 'presentation');
    });

    it('returns null gracefully when hourly data is empty', () => {
      const { container } = render(<AqiTrendSvg hourlyAqi={[]} city="Delhi" />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('CadrCalculator (Indoor CADR & Clearance Kinetics)', () => {
    it('renders room volume, required CADR, and estimates purification time', () => {
      render(<CadrCalculator />);

      expect(screen.getByText(/Room CADR & Purification Time Calculator/i)).toBeInTheDocument();
      expect(screen.getByText(/Floor Area:/i)).toBeInTheDocument();
      expect(screen.getByText(/ASHRAE 4 ACH Standard/i)).toBeInTheDocument();
      expect(screen.getByText(/DIY Corsi-Rosenthal Recommendation/i)).toBeInTheDocument();

      // Test sliding room area
      const areaSlider = screen.getByLabelText(/Floor Area:/i);
      fireEvent.change(areaSlider, { target: { value: '25' } });
      expect(screen.getByText(/25 m²/i)).toBeInTheDocument();
    });
  });

  describe('CommuteComparison (Multi-Modal Exposure & Inhaled Dose)', () => {
    it('renders commute modes and compares inhaled PM2.5 dose', () => {
      render(<CommuteComparison currentAqi={240} />);

      expect(screen.getByText(/Commute Inhaled PM2.5 Dose & Transit Trade-offs/i)).toBeInTheDocument();
      expect(screen.getByText(/Underground Metro/i)).toBeInTheDocument();
      expect(screen.getByText(/Bicycle \/ E-Bike/i)).toBeInTheDocument();
      expect(screen.getByText(/Gasoline Car/i)).toBeInTheDocument();

      // Metro should have recommended badge for high AQI
      expect(screen.getByText(/⭐ Recommended/i)).toBeInTheDocument();

      // Distance buttons toggle
      const btn15km = screen.getByRole('button', { name: '15 km' });
      fireEvent.click(btn15km);
      expect(btn15km).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('CommunityPledges (Collective Action & Offset Counter)', () => {
    it('renders pledge categories and updates collective offsets on participation toggle', () => {
      render(<CommunityPledges />);

      expect(screen.getByText(/Collective Neighborhood Smog Mitigation Pledges/i)).toBeInTheDocument();
      expect(screen.getByText(/Collective CO2 Averted/i)).toBeInTheDocument();
      expect(screen.getByText(/Toxic PM2.5 Prevented/i)).toBeInTheDocument();

      const carpoolBtn = screen.getAllByRole('button', { name: /\+ Take Pledge|✓ Joined Pledge/i })[0];
      const initialText = carpoolBtn.textContent;

      fireEvent.click(carpoolBtn);
      expect(carpoolBtn.textContent).not.toBe(initialText);
    });
  });
});
