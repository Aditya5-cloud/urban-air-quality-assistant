import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [serverHealth, setServerHealth] = useState({ status: 'checking', message: 'Connecting to backend...' });

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.status === 'healthy') {
          setServerHealth({
            status: 'online',
            message: `Backend online (${data.services.database === 'connected' ? 'DB Connected' : 'DB Offline - Fallback Active'})`,
            db: data.services.database,
          });
        } else {
          setServerHealth({ status: 'degraded', message: 'Backend returned degraded status' });
        }
      })
      .catch((err) => {
        setServerHealth({ status: 'offline', message: `Backend unreachable (${err.message})` });
      });
  }, []);

  return (
    <div className="app-container">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <header className="app-header" role="banner">
        <div className="header-content">
          <div className="logo-group">
            <span className="logo-icon" aria-hidden="true">🍃</span>
            <div>
              <h1 className="app-title">Urban Air Quality Assistant</h1>
              <p className="app-tagline">Personalized routines, indoor hacks, and sustainable actions for winter smog</p>
            </div>
          </div>
          <div className="status-badge-container">
            <span
              className={`status-pill status-${serverHealth.status}`}
              role="status"
              aria-live="polite"
            >
              <span className="status-dot" aria-hidden="true"></span>
              {serverHealth.message}
            </span>
          </div>
        </div>
      </header>

      <main id="main-content" className="app-main" role="main" tabIndex="-1">
        <section className="intro-card" aria-labelledby="intro-heading">
          <h2 id="intro-heading">Navigate Urban Smog with Confidence</h2>
          <p>
            Winter smog in dense urban areas poses serious health risks to families and communities.
            This GenAI-powered assistant analyzes your household profile and daily commute to deliver actionable,
            low-emission routines and indoor air quality hacks — explaining the direct personal and environmental impact of your choices.
          </p>
        </section>

        {/* Dynamic components will be rendered here in subsequent chunks */}
        <section className="placeholder-container" aria-label="Assistant workspace">
          <div className="placeholder-notice">
            <p className="placeholder-title">Foundation Stage Ready</p>
            <p className="placeholder-desc">
              The MERN foundation is established. The intake form, AI recommendation pipeline, results visualization, and follow-up chat will be incrementally integrated.
            </p>
          </div>
        </section>
      </main>

      <footer className="app-footer" role="contentinfo">
        <p>Urban Air Quality Assistant — Built for PromptWar Challenge 6</p>
        <p className="footer-subtext">Evidence-based advice powered by Google Gemini GenAI</p>
      </footer>
    </div>
  );
}

export default App;
