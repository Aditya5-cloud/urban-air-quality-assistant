import React, { useState, useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import { calculateMultiModalCommute } from '../../utils/airPhysics';

function CommuteComparison({ currentAqi = 190 }) {
  const [distanceKm, setDistanceKm] = useState(10);

  const commuteOptions = useMemo(
    () => calculateMultiModalCommute(distanceKm, currentAqi),
    [distanceKm, currentAqi]
  );

  return (
    <div className="commute-comparison-box" role="region" aria-label="Multi-Modal Commute Exposure Comparison">
      <div className="commute-comp-header">
        <h4 className="commute-comp-title">
          <span aria-hidden="true">🚇</span> Commute Inhaled PM2.5 Dose & Transit Trade-offs
        </h4>
        <span className="commute-comp-badge">Ambient AQI: {currentAqi}</span>
      </div>

      <p className="commute-comp-desc">
        Compare your body&apos;s physical particulate intake across transit modes. Vigorous outdoor exercise during thermal inversions deposits toxic soot deep into alveolar lung tissue.
      </p>

      {/* Distance Preset Selector */}
      <div className="commute-distance-selector">
        <span className="distance-label">One-Way Commute Distance:</span>
        <div className="distance-buttons-group">
          {[5, 10, 15, 20].map((dist) => (
            <button
              key={dist}
              type="button"
              className={`distance-btn ${distanceKm === dist ? 'active' : ''}`}
              onClick={() => setDistanceKm(dist)}
              aria-pressed={distanceKm === dist}
            >
              {dist} km
            </button>
          ))}
        </div>
      </div>

      {/* Transit Mode Cards / Table */}
      <div className="commute-modes-grid">
        {commuteOptions.map((opt) => (
          <div
            key={opt.mode}
            className={`commute-mode-card ${opt.isRecommended ? 'recommended-mode' : ''}`}
          >
            <div className="mode-card-header">
              <span className="mode-name">{opt.label}</span>
              {opt.isRecommended && <span className="rec-badge">⭐ Recommended</span>}
            </div>

            <div className="mode-stats-row">
              <div className="mode-stat">
                <span className="stat-label">Inhaled PM2.5:</span>
                <span className={`stat-val ${opt.inhaledDoseUg > 40 ? 'text-danger' : 'text-safe'}`}>
                  {opt.inhaledDoseUg} µg
                </span>
              </div>
              <div className="mode-stat">
                <span className="stat-label">Duration:</span>
                <span className="stat-val">{opt.durationMinutes} min</span>
              </div>
              <div className="mode-stat">
                <span className="stat-label">CO2 Footprint:</span>
                <span className="stat-val">{opt.co2Kg} kg</span>
              </div>
            </div>

            <div className="mode-health-risk">
              <span className="risk-indicator-label">Health Exposure Rating:</span>
              <strong className={opt.inhaledDoseUg > 40 ? 'text-danger' : 'text-neutral'}>
                {opt.healthRisk}
              </strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

CommuteComparison.propTypes = {
  currentAqi: PropTypes.number,
};

export default memo(CommuteComparison);
