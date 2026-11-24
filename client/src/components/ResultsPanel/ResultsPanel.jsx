import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import RecommendCard from './RecommendCard';
import './ResultsPanel.css';

function ResultsPanel({ planData = null, onReset }) {
  const headingRef = useRef(null);

  useEffect(() => {
    // Focus without scrolling the page
    if (headingRef.current && typeof headingRef.current.focus === 'function') {
      headingRef.current.focus({ preventScroll: true });
    }
  }, []);

  if (!planData || !planData.recommendations) {
    return null;
  }

  const { profile, recommendations, metadata } = planData;
  const { routines, indoorHacks, alternatives, impacts } = recommendations;

  const isLiveAi = metadata && !metadata.isMock;

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
          </div>
          <h2 id="results-main-heading" ref={headingRef} tabIndex="-1" className="results-heading">
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

      {/* Quick Summary Highlights Strip */}
      <div className="plan-quick-summary-strip" role="region" aria-label="Key plan takeaways">
        <div className="summary-pill">
          <span className="summary-pill-icon" aria-hidden="true">⏰</span>
          <div className="summary-pill-content">
            <span className="summary-pill-label">Best Outdoor Hours</span>
            <span className="summary-pill-val">10:30 AM – 4:30 PM (Sun warms air)</span>
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

        <RecommendCard
          title="Clean Air Inside Your Home"
          subtitle="Easy, low-cost steps to purify your rooms"
          icon="🏠"
          items={indoorHacks}
          impacts={impacts && impacts[1] ? [impacts[1]] : []}
          categoryClass="category-indoor"
        />

        <RecommendCard
          title="Simple Everyday Habits"
          subtitle="Smart lifestyle switches that protect everyone"
          icon="💡"
          items={alternatives}
          impacts={impacts && impacts[2] ? [impacts[2]] : []}
          categoryClass="category-alternatives"
        />
      </div>
    </section>
  );
}

ResultsPanel.propTypes = {
  planData: PropTypes.shape({
    sessionId: PropTypes.string,
    profile: PropTypes.shape({
      city: PropTypes.string.isRequired,
      householdType: PropTypes.string.isRequired,
      householdSize: PropTypes.number.isRequired,
    }).isRequired,
    recommendations: PropTypes.shape({
      routines: PropTypes.arrayOf(PropTypes.string).isRequired,
      indoorHacks: PropTypes.arrayOf(PropTypes.string).isRequired,
      alternatives: PropTypes.arrayOf(PropTypes.string).isRequired,
      impacts: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
    metadata: PropTypes.shape({
      isMock: PropTypes.bool,
      source: PropTypes.string,
      model: PropTypes.string,
    }),
  }),
  onReset: PropTypes.func.isRequired,
};

export default ResultsPanel;
