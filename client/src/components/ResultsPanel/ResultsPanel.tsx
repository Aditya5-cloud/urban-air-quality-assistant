import React, { useEffect, useRef, memo } from 'react';
import RecommendCard from './RecommendCard';
import AqiTrendSvg from '../common/AqiTrendSvg';
import CadrCalculator from '../common/CadrCalculator';
import CommuteComparison from '../common/CommuteComparison';
import CommunityPledges from '../common/CommunityPledges';
import type { PlanResult } from '../../types';
import './ResultsPanel.css';

export interface ResultsPanelProps {
  planData?: PlanResult | null;
  onReset: () => void;
}

function ResultsPanel({ planData = null, onReset }: ResultsPanelProps): React.ReactElement | null {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    // Focus without scrolling the page
    if (headingRef.current && typeof headingRef.current.focus === 'function') {
      headingRef.current.focus({ preventScroll: true });
    }
  }, []);

  if (!planData || !planData.recommendations) {
    return null;
  }

  const { profile, recommendations, metadata, atmospheric } = planData;
  const { routines, indoorHacks, alternatives, impacts } = recommendations;

  const isLiveAi = metadata && !metadata.isMock;
  const inversionInfo = atmospheric?.weather?.inversionDetails;
  const currentAqi = atmospheric?.airQuality?.us_aqi ?? 190;
  const hourlyAqi = atmospheric?.forecast?.hourlyAqi || [];

  return (
    <section className="results-panel" aria-labelledby="results-main-heading">
      {/* Top Banner with Clear Title and Edit Action */}
      <div className="results-banner">
        <div className="results-banner-main">
          <div className="results-badge-group">
            <span className="results-badge" aria-hidden="true">
              {isLiveAi ? '✨ Gemini AI Active' : 'Plan Ready'}
            </span>
            <span className="results-city-tag">📍 {profile.city}</span>
            {inversionInfo?.isInversion && (
              <span className="results-badge text-orange" style={{ background: '#fff7ed', color: '#c2410c' }}>
                ⚠️ Thermal Inversion Active
              </span>
            )}
          </div>
          <h2 id="results-main-heading" ref={headingRef} tabIndex={-1} className="results-heading">
            Clean Air Action Plan
          </h2>
          <p className="results-subheading">
            Simple, practical everyday steps tailored for your {profile.householdType} of {profile.householdSize}.
          </p>
        </div>

        <div className="results-banner-actions">
          <button
            type="button"
            onClick={onReset}
            className="reset-button"
            aria-label="Edit intake form and create a new plan"
          >
            ← Modify Details
          </button>
        </div>
      </div>

      {/* Atmospheric Inversion Risk Advisory (When Present) */}
      {inversionInfo?.isInversion && (
        <div className="inversion-alert-strip" role="alert" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.5rem 0.75rem', marginBottom: '0.625rem', fontSize: '0.75rem', color: '#92400e', display: 'flex', alignItems: 'flex-start', gap: '0.4rem', lineHeight: '1.35' }}>
          <span aria-hidden="true">🌡️</span>
          <div>
            <strong>Atmospheric Inversion Alert:</strong> {inversionInfo.rationale}{' '}
            <span>Optimal solar ventilation window: <strong>{inversionInfo.safeVentilationWindow}</strong></span>
          </div>
        </div>
      )}

      {/* Quick Summary Highlights Strip */}
      <div className="plan-quick-summary-strip" role="region" aria-label="Key plan takeaways">
        <div className="summary-pill">
          <span className="summary-pill-icon" aria-hidden="true">⏰</span>
          <div className="summary-pill-content">
            <span className="summary-pill-label">Best Outdoor Hours</span>
            <span className="summary-pill-val">
              {inversionInfo?.isInversion ? '1:00 PM – 3:30 PM (Sun breaks inversion)' : '10:30 AM – 4:30 PM (Sun warms air)'}
            </span>
          </div>
        </div>

        <div className="summary-pill">
          <span className="summary-pill-icon" aria-hidden="true">🧹</span>
          <div className="summary-pill-content">
            <span className="summary-pill-label">Top Cleaning Rule</span>
            <span className="summary-pill-val">Damp mopping only (No dry brooms)</span>
          </div>
        </div>

        <div className="summary-pill">
          <span className="summary-pill-icon" aria-hidden="true">🛡️</span>
          <div className="summary-pill-content">
            <span className="summary-pill-label">Family Health Benefit</span>
            <span className="summary-pill-val">Cuts daily smog breathing by ~50%</span>
          </div>
        </div>
      </div>

      {/* 12-Hour Atmospheric AQI Trajectory (Native SVG with WCAG Twin Readout) */}
      {hourlyAqi.length > 0 && (
        <AqiTrendSvg hourlyAqi={hourlyAqi} city={profile.city} />
      )}

      {metadata?.isMock && (
        <div className="simulation-notice" role="note" aria-label="Simulation notice">
          <span className="notice-icon" aria-hidden="true">ℹ️</span>
          <span>
            Displaying offline scientific guidance. (Add your <code>GEMINI_API_KEY</code> in <code>.env</code> for live real-time Gemini generation).
          </span>
        </div>
      )}

      {/* Three Clean Action Cards */}
      <div className="cards-grid">
        <RecommendCard
          title="Outdoor Schedule & Travel"
          subtitle="When and how to go out safely"
          icon="🌅"
          items={routines}
          impacts={impacts && impacts[0] ? [impacts[0]] : []}
          categoryClass="category-routines"
        />

        <div className="pillar-column-wrapper">
          <RecommendCard
            title="Clean Air Inside Your Home"
            subtitle="Easy, low-cost steps to purify your rooms"
            icon="🏠"
            items={indoorHacks}
            impacts={impacts && impacts[1] ? [impacts[1]] : []}
            categoryClass="category-indoor"
          />
          {/* Interactive Room CADR Calculator */}
          <CadrCalculator />
        </div>

        <div className="pillar-column-wrapper">
          <RecommendCard
            title="Simple Everyday Habits"
            subtitle="Smart lifestyle switches that protect everyone"
            icon="💡"
            items={alternatives}
            impacts={impacts && impacts[2] ? [impacts[2]] : []}
            categoryClass="category-alternatives"
          />
          {/* Interactive Commute Inhaled Dose Comparison */}
          <CommuteComparison currentAqi={currentAqi} />
        </div>
      </div>

      {/* Pillar 4: Community Action & Collective Neighborhood Pledges */}
      <CommunityPledges />
    </section>
  );
}

export default memo(ResultsPanel);
