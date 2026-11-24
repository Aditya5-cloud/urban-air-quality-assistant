import React, { useState, useEffect } from 'react';
import Navbar from './components/Navigation/Navbar';
import LandingHero from './components/LandingHero/LandingHero';
import FAQSection from './components/FAQSection/FAQSection';
import AssistantDashboard from './components/AssistantDashboard/AssistantDashboard';
import { PlanResult, AtmosphericData, UserProfile } from './types';
import './App.css';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'assistant'>('landing');
  const [isLoading, setIsLoading] = useState(false);
  const [planResult, setPlanResult] = useState<PlanResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<Partial<UserProfile> | null>(null);
  const [currentCity, setCurrentCity] = useState('Delhi');
  const [liveAtmospheric, setLiveAtmospheric] = useState<AtmosphericData | null>(null);

  // Fetch real-time live atmospheric conditions for the active city
  useEffect(() => {
    let isCancelled = false;

    if (planResult?.atmospheric) {
      setLiveAtmospheric(planResult.atmospheric);
      return;
    }

    const fetchLiveWeather = async () => {
      try {
        const res = await fetch(`/api/weather-aqi?city=${encodeURIComponent(currentCity)}`);
        const data = await res.json();
        if (!isCancelled && data.success && data.atmospheric) {
          setLiveAtmospheric(data.atmospheric);
        }
      } catch (err: unknown) {
        console.warn('Atmospheric fetch warning:', err);
      }
    };

    fetchLiveWeather();

    return () => {
      isCancelled = true;
    };
  }, [currentCity, planResult]);

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
              if (data.session.profile?.city) {
                setCurrentCity(data.session.profile.city);
              }
            } else {
              setApiError('Session link not found or has expired. You can generate a fresh plan below.');
            }
          })
          .catch((err: Error) => {
            setApiError(`Could not load session (${err.message}).`);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    }
  }, []);

  const handleFormSubmit = async (formData: UserProfile) => {
    setIsLoading(true);
    setApiError(null);
    if (formData.city) {
      setCurrentCity(formData.city);
    }

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
      if (data.atmospheric) {
        setLiveAtmospheric(data.atmospheric);
      }

      // Update URL query string without reloading page
      if (typeof window !== 'undefined' && data.sessionId) {
        const newUrl = `${window.location.pathname}?session=${data.sessionId}`;
        window.history.pushState({ sessionId: data.sessionId }, '', newUrl);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate air quality plan. Please try again.';
      setApiError(errorMsg);
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

  const handleLaunchAssistant = (preset: Partial<UserProfile> | null = null) => {
    if (preset) {
      setSelectedPreset(preset);
      if (preset.city) setCurrentCity(preset.city);
    }
    setView('assistant');
  };

  const handleBackToLanding = () => {
    setView('landing');
  };

  return (
    <div className={`app-container ${view === 'assistant' ? 'assistant-mode' : ''}`}>
      {/* Clean Accessible Navigation Bar with Real-time Indicators in Header */}
      <Navbar
        currentView={view}
        atmospheric={liveAtmospheric}
        currentCity={currentCity}
        onNavigateToGenerator={() => handleLaunchAssistant()}
        onNavigateToLanding={handleBackToLanding}
      />

      <main id="main-content" className="app-main-content" role="main" tabIndex={-1}>
        {view === 'landing' ? (
          <div className="landing-view-wrapper">
            {/* Focused Hero Section with 1-Click Preset Demos */}
            <LandingHero
              onSelectPreset={(preset) => {
                setSelectedPreset(preset);
                if (preset?.city) setCurrentCity(preset.city);
              }}
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
              onSelectPreset={(preset) => {
                setSelectedPreset(preset);
                if (preset?.city) setCurrentCity(preset.city);
                handleFormSubmit(preset as UserProfile);
              }}
            />
          </div>
        )}
      </main>

      {/* Clean, Simple Footer shown only on Landing View to guarantee zero scroll on Assistant */}
      {view === 'landing' && (
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
      )}
    </div>
  );
};

export default App;
