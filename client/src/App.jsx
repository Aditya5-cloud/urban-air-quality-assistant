import React, { useState, useEffect } from 'react';
import IntakeForm from './components/IntakeForm/IntakeForm';
import './App.css';

function App() {
  const [serverHealth, setServerHealth] = useState({ status: 'checking', message: 'Connecting to backend...' });
  const [isLoading, setIsLoading] = useState(false);
  const [planResult, setPlanResult] = useState(null);
  const [apiError, setApiError] = useState(null);

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

  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || `Server returned error (${response.status})`);
      }

      setPlanResult(data);
    } catch (err) {
      setApiError(err.message || 'Failed to generate air quality plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

        {apiError && (
          <div className="error-banner" role="alert" aria-live="assertive">
            <p className="error-title">⚠️ Error Generating Guidance</p>
            <p>{apiError}</p>
          </div>
        )}

        <IntakeForm onSubmit={handleFormSubmit} isLoading={isLoading} />

        {planResult && (
          <section className="results-preview" aria-labelledby="results-preview-heading">
            <div className="results-preview-header">
              <h3 id="results-preview-heading">Plan Generated for {planResult.profile.city}</h3>
              <span className="session-tag">Session ID: {planResult.sessionId.slice(0, 8)}...</span>
            </div>
            <p className="plan-summary-note">
              Routines ({planResult.recommendations.routines.length}) • Indoor Hacks ({planResult.recommendations.indoorHacks.length}) • Sustainable Alternatives ({planResult.recommendations.alternatives.length})
            </p>
          </section>
        )}
      </main>

      <footer className="app-footer" role="contentinfo">
        <p>Urban Air Quality Assistant — Built for PromptWar Challenge 6</p>
        <p className="footer-subtext">Evidence-based advice powered by Google Gemini GenAI</p>
      </footer>
    </div>
  );
}

export default App;
