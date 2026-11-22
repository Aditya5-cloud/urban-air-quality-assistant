import React, { useState, useEffect } from 'react';
import IntakeForm from '../IntakeForm/IntakeForm';
import ResultsPanel from '../ResultsPanel/ResultsPanel';
import ChatWidget from '../ChatWidget/ChatWidget';
import './AssistantDashboard.css';

function AssistantDashboard({
  planResult,
  isLoading,
  apiError,
  selectedPreset,
  onSubmitForm,
  onResetPlan,
  onBackToLanding,
  onSelectPreset,
}) {
  const currentCity = planResult?.profile?.city || selectedPreset?.city || 'Delhi';
  const [liveAtmospheric, setLiveAtmospheric] = useState(planResult?.atmospheric || null);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);

  // Fetch real-time live atmospheric data when city changes or mounts
  useEffect(() => {
    let isCancelled = false;

    if (planResult?.atmospheric) {
      setLiveAtmospheric(planResult.atmospheric);
      return;
    }

    const fetchLiveWeather = async () => {
      setIsFetchingWeather(true);
      try {
        const res = await fetch(`/api/weather-aqi?city=${encodeURIComponent(currentCity)}`);
        const data = await res.json();
        if (!isCancelled && data.success && data.atmospheric) {
          setLiveAtmospheric(data.atmospheric);
        }
      } catch (err) {
        console.warn('Weather fetch warning:', err);
      } finally {
        if (!isCancelled) setIsFetchingWeather(false);
      }
    };

    fetchLiveWeather();

    return () => {
      isCancelled = true;
    };
  }, [currentCity, planResult]);

  const aqiCategory = liveAtmospheric?.airQuality?.category || 'Moderate';
  const aqiColor = liveAtmospheric?.airQuality?.color || '#ca8a04';
  const usAqi = liveAtmospheric?.airQuality?.us_aqi ?? '—';
  const pm25 = liveAtmospheric?.airQuality?.pm2_5 ?? '—';
  const temp = liveAtmospheric?.weather?.temperature ?? '—';
  const condition = liveAtmospheric?.weather?.condition || 'Winter Weather';
  const inversionRisk = liveAtmospheric?.weather?.inversionRisk || 'Active Smog Stagnation';

  return (
    <div className="assistant-dashboard" role="region" aria-label="Urban Air Quality Interactive Workspace">
      {/* Top Controls & Real-time Live Atmospheric Ribbon */}
      <div className="dashboard-top-bar">
        <div className="dashboard-nav-group">
          <button
            type="button"
            className="back-btn"
            onClick={onBackToLanding}
            aria-label="Back to overview landing page"
          >
            ← Back to Overview
          </button>
          <div className="dashboard-title-area">
            <h1 className="dashboard-page-title">Clean Air Intelligence Hub</h1>
            <span className="live-pulse-badge" aria-label="Real-time Open-Meteo connection live">
              <span className="pulse-dot" aria-hidden="true"></span>
              Live Open-Meteo Feed
            </span>
          </div>
        </div>

        {/* Real-time Weather & AQI Metrics Card */}
        <div className="live-atmospheric-card" aria-label={`Real-time atmospheric conditions for ${currentCity}`}>
          <div className="atmospheric-stat-item">
            <span className="stat-label">Location</span>
            <span className="stat-value location-val">📍 {currentCity}</span>
          </div>

          <div className="atmospheric-stat-item">
            <span className="stat-label">Weather</span>
            <span className="stat-value">
              ⛅ {isFetchingWeather ? 'Updating...' : `${temp}°C • ${condition}`}
            </span>
          </div>

          <div className="atmospheric-stat-item">
            <span className="stat-label">PM2.5 Level</span>
            <span className="stat-value">🍃 {pm25} µg/m³</span>
          </div>

          <div className="atmospheric-stat-item aqi-badge-container">
            <span className="stat-label">US AQI</span>
            <span
              className="aqi-chip"
              style={{ backgroundColor: aqiColor }}
              title={`AQI: ${usAqi} (${aqiCategory})`}
            >
              {usAqi} • {aqiCategory}
            </span>
          </div>

          <div className="atmospheric-stat-item inversion-stat">
            <span className="stat-label">Inversion Stagnation Risk</span>
            <span className="stat-value inversion-val" title={inversionRisk}>
              ⚠️ {inversionRisk.includes('High') ? 'High Inversion Risk' : 'Standard Dispersion'}
            </span>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="dashboard-error-banner" role="alert" aria-live="assertive">
          <span className="error-icon" aria-hidden="true">⚠️</span>
          <span>{apiError}</span>
        </div>
      )}

      {/* Viewport-Aligned 2-Column Split Workspace */}
      <div className="dashboard-viewport-grid">
        {/* Left Column: Intake Form OR Generated Clean Air Plan */}
        <section
          className="dashboard-left-panel"
          aria-labelledby={planResult ? 'plan-heading' : 'intake-form-heading'}
        >
          {!planResult ? (
            <div className="form-wrapper-card">
              <div className="panel-header-compact">
                <span className="compact-tag">Step 1 of 2</span>
                <h2 className="panel-title-compact">Personal Profile Intake</h2>
                <p className="panel-desc-compact">
                  Configure your household context to calibrate low-emission timing and indoor filtration.
                </p>
              </div>

              <IntakeForm
                onSubmit={onSubmitForm}
                isLoading={isLoading}
                presetData={selectedPreset}
              />
            </div>
          ) : (
            <div className="plan-wrapper-card">
              <ResultsPanel planData={planResult} onReset={onResetPlan} />
            </div>
          )}
        </section>

        {/* Right Column: AI Chat Specialized Exclusively in Urban Air Quality */}
        <section className="dashboard-right-panel" aria-labelledby="chat-heading">
          {planResult ? (
            <ChatWidget
              sessionId={planResult.sessionId}
              initialHistory={planResult.chatHistory || []}
              profileCity={planResult.profile?.city}
            />
          ) : (
            <div className="chat-intro-placeholder">
              <div className="chat-intro-card">
                <div className="chat-intro-badge">
                  <span className="guardrail-icon" aria-hidden="true">🛡️</span>
                  Strict Domain-Guarded AI Assistant
                </div>

                <h3 className="chat-intro-title">Ready to Navigate Winter Smog</h3>
                <p className="chat-intro-text">
                  This GenAI assistant is strictly specialized in winter smog navigation, DIY indoor filtration,
                  low-emission routines, and respiratory health. Non-air-quality questions are systematically declined.
                </p>

                <div className="chat-intro-preview">
                  <p className="preview-label">💡 Questions you can ask once your plan generates:</p>
                  <ul className="preview-list">
                    <li>&ldquo;How can I build a DIY Corsi-Rosenthal MERV-13 filter box for under $35?&rdquo;</li>
                    <li>&ldquo;When is the morning thermal inversion layer expected to clear?&rdquo;</li>
                    <li>&ldquo;How can we protect young children during morning school commutes?&rdquo;</li>
                    <li>&ldquo;Which indoor plants help reduce particulates alongside ventilation?&rdquo;</li>
                  </ul>
                </div>

                <div className="chat-intro-action">
                  <p className="quick-start-text">⚡ Want instant evaluation results? Click a preset:</p>
                  <div className="quick-start-presets">
                    <button
                      type="button"
                      className="quick-preset-btn"
                      onClick={() =>
                        onSelectPreset({
                          city: 'Delhi',
                          householdType: 'family',
                          householdSize: 4,
                          commute: 'car',
                          healthConcern: true,
                          seasonContext: 'winter_smog',
                          notes: 'Two school-age children, morning carpool, gas cooking in flat.',
                        })
                      }
                    >
                      👨‍👩‍👧 Load Delhi Family
                    </button>
                    <button
                      type="button"
                      className="quick-preset-btn"
                      onClick={() =>
                        onSelectPreset({
                          city: 'Beijing',
                          householdType: 'individual',
                          householdSize: 2,
                          commute: 'cycle',
                          healthConcern: false,
                          seasonContext: 'winter_smog',
                          notes: 'Active daily bicycle commuter, 3rd floor apartment.',
                        })
                      }
                    >
                      🚴‍♂️ Load Beijing Cyclist
                    </button>
                    <button
                      type="button"
                      className="quick-preset-btn"
                      onClick={() =>
                        onSelectPreset({
                          city: 'Lahore',
                          householdType: 'elderly',
                          householdSize: 3,
                          commute: 'public',
                          healthConcern: true,
                          seasonContext: 'winter_smog',
                          notes: 'Elderly parent with COPD, high sensitivity to wood smoke.',
                        })
                      }
                    >
                      🧓 Load Lahore Senior
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AssistantDashboard;
