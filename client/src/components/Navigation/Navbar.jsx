import React from 'react';
import './Navbar.css';

function Navbar({ onNavigateToGenerator }) {
  const handleGeneratorClick = (e) => {
    e.preventDefault();
    if (onNavigateToGenerator) {
      onNavigateToGenerator();
    } else {
      const el = document.getElementById('plan-generator');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="navbar-header" role="banner">
      <div className="navbar-container">
        <a href="#main-content" className="skip-link">Skip to main content</a>

        <div className="navbar-brand">
          <span className="navbar-logo" aria-hidden="true">🍃</span>
          <div className="brand-text">
            <span className="brand-title">Urban Air Quality Assistant</span>
            <span className="brand-tag">PromptWar Challenge 6</span>
          </div>
        </div>

        {/* Header Weather & Air Quality Status Badges */}
        <div className="header-indicators" role="region" aria-label="Current atmospheric indicators">
          <div className="indicator-badge weather-badge" title="Seasonal winter atmospheric condition">
            <span className="indicator-icon" aria-hidden="true">⛅</span>
            <div className="indicator-text">
              <span className="indicator-title">Weather Condition</span>
              <span className="indicator-val">Winter Stagnation</span>
            </div>
          </div>

          <div className="indicator-badge aqi-badge" title="Urban air quality focus">
            <span className="indicator-icon" aria-hidden="true">🍃</span>
            <div className="indicator-text">
              <span className="indicator-title">Air Quality</span>
              <span className="indicator-val">PM2.5 Adaptive AI</span>
            </div>
          </div>

          <a
            href="#plan-generator"
            onClick={handleGeneratorClick}
            className="header-cta-btn"
            aria-label="Jump to plan generator"
          >
            Get Plan ➔
          </a>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
