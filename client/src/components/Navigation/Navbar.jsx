import React, { useState } from 'react';
import './Navbar.css';

function Navbar({ serverHealth, onNavigateToGenerator }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleGeneratorClick = (e) => {
    e.preventDefault();
    closeMenu();
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

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="mobile-toggle-btn"
          onClick={toggleMenu}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-controls="primary-navigation"
        >
          <span className="hamburger-icon" aria-hidden="true">
            {mobileMenuOpen ? '✕' : '☰'}
          </span>
        </button>

        {/* Navigation links & Status badge */}
        <nav
          id="primary-navigation"
          className={`navbar-nav ${mobileMenuOpen ? 'nav-open' : ''}`}
          role="navigation"
          aria-label="Main Navigation"
        >
          <ul className="nav-links">
            <li>
              <a href="#pillars" onClick={closeMenu} className="nav-link">
                3 Pillars
              </a>
            </li>
            <li>
              <a href="#comparison" onClick={closeMenu} className="nav-link">
                Why Us
              </a>
            </li>
            <li>
              <a href="#faq" onClick={closeMenu} className="nav-link">
                FAQ
              </a>
            </li>
            <li>
              <a
                href="#plan-generator"
                onClick={handleGeneratorClick}
                className="nav-link-cta"
              >
                Get Plan ➔
              </a>
            </li>
          </ul>

          <div className="nav-status-wrapper">
            <span
              className={`nav-status-pill status-${serverHealth.status}`}
              role="status"
              aria-live="polite"
              title={serverHealth.message}
            >
              <span className="status-dot" aria-hidden="true"></span>
              {serverHealth.status === 'online' ? 'System Online' : 'Connecting...'}
            </span>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
