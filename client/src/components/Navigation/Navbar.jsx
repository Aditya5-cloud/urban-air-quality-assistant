import React, { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import './Navbar.css';

function Navbar({
  currentView = 'landing',
  atmospheric = null,
  currentCity = 'Delhi',
  onNavigateToGenerator = null,
  onNavigateToLanding = null,
}) {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('a11y-contrast');
    } else {
      document.documentElement.classList.remove('a11y-contrast');
    }
  }, [highContrast]);

  const handleCtaClick = (e) => {
    e.preventDefault();
    if (currentView === 'assistant') {
      if (onNavigateToLanding) onNavigateToLanding();
    } else {
      if (onNavigateToGenerator) onNavigateToGenerator();
    }
  };

  const cityName = atmospheric?.city || currentCity || 'Delhi';
  const temp = atmospheric?.weather?.temperature ?? 22;
  const condition = atmospheric?.weather?.condition || 'Clear sky';
  const pm25 = atmospheric?.airQuality?.pm2_5 ?? 117.6;
  const usAqi = atmospheric?.airQuality?.us_aqi ?? 229;
  const aqiCategory = atmospheric?.airQuality?.category || 'Very Unhealthy';
  const aqiColor = atmospheric?.airQuality?.color || '#9333ea';
  const inversionRisk = atmospheric?.weather?.inversionRisk || 'High Inversion Risk';

  return (
    <header className="navbar-header" role="banner">
      {/* WCAG SC 2.4.1 Skip Link */}
      <a href="#results-main-heading" className="skip-link">
        Skip to main content
      </a>

      <div className="navbar-container">
        <div
          className="navbar-brand"
          onClick={() => onNavigateToLanding && onNavigateToLanding()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onNavigateToLanding) onNavigateToLanding();
          }}
          style={{ cursor: 'pointer' }}
          aria-label="Urban Air Quality Assistant Home"
        >
          <span className="navbar-logo" aria-hidden="true">🍃</span>
          <div className="brand-text">
            <span className="brand-title">Urban Air Quality Assistant</span>
            <span className="brand-tag">PromptWar Challenge 6</span>
          </div>
        </div>

        {/* Real-time Atmospheric Card in Header */}
        <div
          className="header-atmospheric-card"
          role="region"
          aria-label={`Real-time atmospheric conditions for ${cityName}`}
        >
          <div className="header-stat-badge location-badge" title={`Monitored Location: ${cityName}`}>
            <span className="stat-icon" aria-hidden="true">📍</span>
            <span className="stat-text location-name">{cityName}</span>
          </div>

          <div className="header-stat-badge weather-badge" title="Live Temperature & Weather Condition">
            <span className="stat-icon" aria-hidden="true">⛅</span>
            <span className="stat-text">{temp}°C • {condition}</span>
          </div>

          <div className="header-stat-badge pm-badge" title="Real-time PM2.5 Concentration">
            <span className="stat-icon" aria-hidden="true">🍃</span>
            <span className="stat-text">PM2.5: {pm25} µg/m³</span>
          </div>

          <div className="header-stat-badge aqi-badge" title={`US AQI: ${usAqi} (${aqiCategory})`}>
            <span className="header-aqi-chip" style={{ backgroundColor: aqiColor }}>
              AQI {usAqi} • {aqiCategory}
            </span>
          </div>

          <div className="header-stat-badge inversion-badge" title={inversionRisk}>
            <span className="inversion-text">
              ⚠️ {inversionRisk.includes('High') ? 'High Inversion' : 'Normal Dispersion'}
            </span>
          </div>
        </div>

        {/* Accessibility & Action Controls */}
        <div className="navbar-a11y-controls">
          <button
            type="button"
            className={`a11y-toggle-btn ${highContrast ? 'active' : ''}`}
            onClick={() => setHighContrast(!highContrast)}
            aria-pressed={highContrast}
            aria-label="Toggle high contrast display mode"
            title="Toggle WCAG High Contrast"
          >
            <span aria-hidden="true">👁️</span>
            <span>{highContrast ? 'High Contrast On' : 'Contrast'}</span>
          </button>

          {/* CTA Button on Landing View */}
          {currentView === 'landing' && (
            <button
              type="button"
              onClick={handleCtaClick}
              className="header-cta-btn"
              aria-label="Jump to plan generator"
            >
              Get Plan ➔
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

Navbar.propTypes = {
  currentView: PropTypes.oneOf(['landing', 'assistant']),
  atmospheric: PropTypes.shape({
    city: PropTypes.string,
    weather: PropTypes.shape({
      temperature: PropTypes.number,
      condition: PropTypes.string,
      inversionRisk: PropTypes.string,
    }),
    airQuality: PropTypes.shape({
      pm2_5: PropTypes.number,
      us_aqi: PropTypes.number,
      category: PropTypes.string,
      color: PropTypes.string,
    }),
  }),
  currentCity: PropTypes.string,
  onNavigateToGenerator: PropTypes.func,
  onNavigateToLanding: PropTypes.func,
};

export default memo(Navbar);
