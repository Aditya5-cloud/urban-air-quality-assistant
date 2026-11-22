import React, { useState, useEffect } from 'react';
import Navbar from './components/Navigation/Navbar';
import LandingHero from './components/LandingHero/LandingHero';
import FAQSection from './components/FAQSection/FAQSection';
import AssistantDashboard from './components/AssistantDashboard/AssistantDashboard';
import './App.css';

function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'assistant'
  const [isLoading, setIsLoading] = useState(false);
  const [planResult, setPlanResult] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);

  // Check health and detect shareable session in URL (?session=<uuid>)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlSessionId = params.get('session');
      if (urlSessionId) {
        setIsLoading(true);
        setView('assistant');
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
    setSelectedPreset(null);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', window.location.pathname);
    }
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
  };

  const handleLaunchAssistant = (preset = null) => {
    if (preset) {
      setSelectedPreset(preset);
    }
    setView('assistant');
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToLanding = () => {
    setView('landing');
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="app-container">
      {/* Clean Accessible Navigation Bar with Real-time Indicators */}
      <Navbar
        currentView={view}
        onNavigateToGenerator={() => handleLaunchAssistant()}
        onNavigateToLanding={handleBackToLanding}
      />

      <main id="main-content" className="app-main-content" role="main" tabIndex="-1">
        {view === 'landing' ? (
          <div className="landing-view-wrapper">
            {/* Focused Hero Section with 1-Click Preset Demos */}
            <LandingHero
              onSelectPreset={handlePresetSelect}
              onLaunchAssistant={(preset) => handleLaunchAssistant(preset)}
            />

            {/* FAQ Section */}
            <FAQSection />
          </div>
        ) : (
          <div className="assistant-view-wrapper">
            {/* Viewport-aligned Dedicated Interactive Assistant Workspace */}
            <AssistantDashboard
              planResult={planResult}
              isLoading={isLoading}
              apiError={apiError}
              selectedPreset={selectedPreset}
              onSubmitForm={handleFormSubmit}
              onResetPlan={handleReset}
              onBackToLanding={handleBackToLanding}
              onSelectPreset={(preset) => {
                setSelectedPreset(preset);
                handleFormSubmit(preset);
              }}
            />
          </div>
        )}
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
            © 2026 Urban Air Quality Assistant. Powered by Open-Meteo & Google Gemini 2.0 Flash.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
