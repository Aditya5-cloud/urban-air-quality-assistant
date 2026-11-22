import React, { useState, useEffect } from 'react';
import Navbar from './components/Navigation/Navbar';
import LandingHero from './components/LandingHero/LandingHero';
import IntakeForm from './components/IntakeForm/IntakeForm';
import ResultsPanel from './components/ResultsPanel/ResultsPanel';
import ChatWidget from './components/ChatWidget/ChatWidget';
import FAQSection from './components/FAQSection/FAQSection';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [planResult, setPlanResult] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);

  // Check health and detect shareable session in URL (?session=<uuid>)
  useEffect(() => {
    // Session URL parameter check (?session=<id>)
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

      // Smooth scroll into results view
      setTimeout(() => {
        const resultsEl = document.getElementById('plan-results-anchor');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err) {
      setApiError(err.message || 'Failed to generate air quality plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPlanResult(null);
    setApiError(null);
    setSelectedPreset(null);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', window.location.pathname);
    }
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
  };

  return (
    <div className="app-container">
      {/* Clean Accessible Navigation Bar with Weather & AQI Indicators */}
      <Navbar
        onNavigateToGenerator={() => {
          const el = document.getElementById('plan-generator');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <main id="main-content" className="app-main-landing" role="main" tabIndex="-1">
        {/* Focused Hero Section with 1-Click Preset Demos */}
        <LandingHero onSelectPreset={handlePresetSelect} />

        {/* Interactive Workspace / Generator */}
        <section id="plan-generator" className="generator-section" aria-labelledby="generator-heading">
          <div className="generator-container">
            <div className="section-header">
              <span className="section-tag">Interactive Assistant</span>
              <h2 id="generator-heading" className="section-title">
                {planResult ? 'Your Customized Clean Air Plan' : 'Generate Your Clean Air Plan'}
              </h2>
              <p className="section-subtitle">
                {planResult
                  ? 'Review your personalized low-emission routines, indoor hacks, and ask clarifying questions below.'
                  : 'Tell the assistant about your urban area, household structure, and commute to receive evidence-based guidance in seconds.'}
              </p>
            </div>

            {apiError && (
              <div className="error-banner" role="alert" aria-live="assertive">
                <p className="error-title">⚠️ Notice</p>
                <p>{apiError}</p>
              </div>
            )}

            <div id="plan-results-anchor">
              {!planResult ? (
                <IntakeForm
                  onSubmit={handleFormSubmit}
                  isLoading={isLoading}
                  presetData={selectedPreset}
                />
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
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection />
      </main>

      {/* Clean, Simple Footer */}
      <footer className="simple-footer" role="contentinfo">
        <div className="simple-footer-content">
          <div className="simple-footer-brand">
            <span className="logo-icon" aria-hidden="true">🍃</span>
            <span className="simple-footer-title">Urban Air Quality Assistant</span>
          </div>
          <p className="simple-footer-tagline">
            PromptWar Challenge 6 • GenAI-Powered Winter Smog Navigation • Privacy by Design (Zero PII)
          </p>
          <p className="simple-footer-copy">
            © 2026 Urban Air Quality Assistant. Powered by Google Gemini 2.0 Flash.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
