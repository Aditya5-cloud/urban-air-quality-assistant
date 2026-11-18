import React, { useEffect, useRef } from 'react';
import RecommendCard from './RecommendCard';
import ShareLink from '../common/ShareLink';
import './ResultsPanel.css';

function ResultsPanel({ planData, onReset }) {
  const headingRef = useRef(null);

  useEffect(() => {
    // Focus management: Shift focus to the results heading so screen readers announce it
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, []);

  if (!planData || !planData.recommendations) {
    return null;
  }

  const { profile, recommendations, sessionId, metadata } = planData;
  const { routines, indoorHacks, alternatives, impacts } = recommendations;

  return (
    <section className="results-panel" aria-labelledby="results-main-heading">
      <div className="results-banner">
        <div className="results-banner-main">
          <span className="results-badge" aria-hidden="true">Plan Ready</span>
          <h2 id="results-main-heading" ref={headingRef} tabIndex="-1" className="results-heading">
            Personalized Air Quality Action Plan: {profile.city}
          </h2>
          <p className="results-subheading">
            Tailored specifically for a {profile.householdType} of {profile.householdSize} with {profile.commute} commute.
          </p>
        </div>
        <div className="results-banner-actions">
          <button
            type="button"
            onClick={onReset}
            className="reset-button"
            aria-label="Edit intake form and create a new plan"
          >
            ← Modify Intake Details
          </button>
        </div>
      </div>

      {metadata?.isMock && (
        <div className="simulation-notice" role="note" aria-label="Simulation notice">
          <span className="notice-icon" aria-hidden="true">ℹ️</span>
          <span>
            Displaying scientifically-grounded local simulation advice. (Set <code>GEMINI_API_KEY</code> in <code>.env</code> to enable live Gemini Flash generation).
          </span>
        </div>
      )}

      {/* Grid of the 3 core recommendation categories */}
      <div className="cards-grid">
        <RecommendCard
          title="Low-Emission Daily Routines"
          icon="🌿"
          items={routines}
          impacts={impacts ? [impacts[0]] : []}
          categoryClass="category-routines"
        />

        <RecommendCard
          title="Indoor Air Quality Hacks"
          icon="🏠"
          items={indoorHacks}
          impacts={impacts ? [impacts[1]] : []}
          categoryClass="category-indoor"
        />

        <RecommendCard
          title="Sustainable Alternatives"
          icon="♻️"
          items={alternatives}
          impacts={impacts ? [impacts[2]] : []}
          categoryClass="category-alternatives"
        />
      </div>

      {/* Shareable Link Component */}
      {sessionId && <ShareLink sessionId={sessionId} />}
    </section>
  );
}

export default ResultsPanel;
