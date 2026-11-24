import React, { useState, useMemo, memo } from 'react';
import { calculateCommunityOffset, PLEDGE_WEIGHTS } from '../../utils/airPhysics';

function CommunityPledges() {
  const [pledges, setPledges] = useState({
    carpool: 12,
    cleanHeating: 6,
    dampMopping: 25,
    zeroWasteBurn: 14,
    vulnerableCheck: 18,
  });

  const [userJoined, setUserJoined] = useState({
    carpool: false,
    cleanHeating: false,
    dampMopping: true,
    zeroWasteBurn: true,
    vulnerableCheck: false,
  });

  const offsets = useMemo(() => calculateCommunityOffset(pledges), [pledges]);

  const toggleUserPledge = (key) => {
    const isNowJoined = !userJoined[key];
    setUserJoined((prev) => ({ ...prev, [key]: isNowJoined }));
    setPledges((prev) => ({
      ...prev,
      [key]: prev[key] + (isNowJoined ? 1 : -1),
    }));
  };

  return (
    <div className="community-pledges-box" role="region" aria-label="Community Clean Air Pledges and Smog Abatement">
      <div className="pledges-header">
        <h4 className="pledges-title">
          <span aria-hidden="true">🤝</span> Collective Neighborhood Smog Mitigation Pledges
        </h4>
        <span className="pledges-badge">Collective Action</span>
      </div>

      <p className="pledges-desc">
        Join your neighborhood&apos;s clean air pledges. Collective micro-actions lower surface particulate matter and prevent dangerous stagnation peaks.
      </p>

      {/* Collective Impact KPI Banner */}
      <div className="pledges-impact-banner">
        <div className="impact-kpi-item">
          <span className="kpi-label">Collective CO2 Averted</span>
          <span className="kpi-value text-green">{offsets.totalCo2Kg} kg</span>
        </div>
        <div className="impact-kpi-divider" aria-hidden="true" />
        <div className="impact-kpi-item">
          <span className="kpi-label">Toxic PM2.5 Prevented</span>
          <span className="kpi-value text-orange">{offsets.totalPm25Grams} g</span>
        </div>
      </div>

      {/* Pledges List */}
      <div className="pledges-list-grid">
        {Object.entries(PLEDGE_WEIGHTS).map(([key, item]) => {
          const isJoined = userJoined[key];
          const count = pledges[key];

          return (
            <div key={key} className={`pledge-item-card ${isJoined ? 'pledge-active' : ''}`}>
              <div className="pledge-info">
                <span className="pledge-name">{item.label}</span>
                <span className="pledge-metrics">
                  Avoids ~{item.co2Kg} kg CO2 & {item.pm25Grams} g PM2.5 per family
                </span>
                <span className="pledge-count">
                  👥 <strong>{count}</strong> local families participating
                </span>
              </div>

              <button
                type="button"
                className={`pledge-toggle-btn ${isJoined ? 'joined' : ''}`}
                onClick={() => toggleUserPledge(key)}
                aria-pressed={isJoined}
              >
                {isJoined ? '✓ Joined Pledge' : '+ Take Pledge'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(CommunityPledges);
