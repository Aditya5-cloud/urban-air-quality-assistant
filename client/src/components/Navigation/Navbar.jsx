import React from 'react';
import './Navbar.css';

function Navbar({ currentView = 'landing', onNavigateToGenerator, onNavigateToLanding }) {
  const handleCtaClick = (e) => {
    e.preventDefault();
    if (currentView === 'assistant') {
      if (onNavigateToLanding) onNavigateToLanding();
    } else {
      if (onNavigateToGenerator) onNavigateToGenerator();
    }
  };

  return (
    <header className="navbar-header" role="banner">
      <div className="navbar-container">
        <a href="#main-content" className="skip-link">Skip to main content</a>

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

          <button
            type="button"
            onClick={handleCtaClick}
            className="header-cta-btn"
            aria-label="Jump to plan generator"
          >
            {currentView === 'assistant' ? '← Overview' : 'Get Plan ➔'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
