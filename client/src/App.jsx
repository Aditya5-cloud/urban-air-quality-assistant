import React, { useState, useEffect } from 'react';
import IntakeForm from './components/IntakeForm/IntakeForm';
import ResultsPanel from './components/ResultsPanel/ResultsPanel';
import ChatWidget from './components/ChatWidget/ChatWidget';
import './App.css';

function App() {
  const [serverHealth, setServerHealth] = useState({ status: 'checking', message: 'Connecting to backend...' });
  const [isLoading, setIsLoading] = useState(false);
  const [planResult, setPlanResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Check health and detect shareable session in URL (?session=<uuid>)
  useEffect(() => {
    // 1. Backend health check
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

    // 2. Session URL parameter check (?session=<id>)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlSessionId = params.get('session');
      if (urlSessionId) {
        setIsLoading(true);
        fetch(`/api/session/${encodeURIComponent(urlSessionId)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.session) {
              setPlanResult({
                sessionId: data.session.id,
                profile: data.session.profile,
                recommendations: data.session.recommendations,
                chatHistory: data.session.chatHistory || [],
              });
            } else {
              setApiError('Session link not found or has expired. You can generate a fresh plan below.');
            }
          })
          .catch((err) => {
            setApiError(`Could not load session (${err.message}).`);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    }
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

      // Update URL query string without reloading page
      if (typeof window !== 'undefined' && data.sessionId) {
        const newUrl = `${window.location.pathname}?session=${data.sessionId}`;
        window.history.pushState({ sessionId: data.sessionId }, '', newUrl);
      }
    } catch (err) {
      setApiError(err.message || 'Failed to generate air quality plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPlanResult(null);
    setApiError(null);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', window.location.pathname);
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
            <p className="error-title">⚠️ Notice</p>
            <p>{apiError}</p>
          </div>
        )}

        {!planResult ? (
          <IntakeForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        ) : (
          <>
            <ResultsPanel planData={planResult} onReset={handleReset} />
            <ChatWidget
              sessionId={planResult.sessionId}
              initialHistory={planResult.chatHistory || []}
              profileCity={planResult.profile?.city}
            />
          </>
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
