import React from 'react';
import { UserProfile } from '../../types';
import './LandingHero.css';

export interface LandingHeroProps {
  onSelectPreset?: ((preset: Partial<UserProfile>) => void) | null;
  onLaunchAssistant?: ((preset?: Partial<UserProfile> | null) => void) | null;
}

const LandingHero: React.FC<LandingHeroProps> = ({ onSelectPreset = null, onLaunchAssistant = null }) => {
  const handleLaunch = () => {
    if (onLaunchAssistant) {
      onLaunchAssistant();
    }
  };

  const handlePresetClick = (preset: Partial<UserProfile>) => {
    if (onSelectPreset) {
      onSelectPreset(preset);
    }
    if (onLaunchAssistant) {
      onLaunchAssistant(preset);
    }
  };

  return (
    <section className="landing-hero" aria-labelledby="hero-title">
      <div className="hero-badge-container">
        <span className="hero-badge">
          <span className="hero-badge-pulse" aria-hidden="true"></span>
          PromptWar Challenge 6 • GenAI Urban Smog Navigator
        </span>
      </div>

      <h1 id="hero-title" className="hero-headline">
        Navigate Severe Winter Smog <br />
        <span className="gradient-text">With Actionable Personal Science</span>
      </h1>

      <p className="hero-description">
        Standard weather apps report panic-inducing AQI numbers without telling you what to do.
        The <strong>Urban Air Quality Assistant</strong> translates atmospheric science into personalized low-emission daily routines,
        low-cost indoor air hacks, and sustainable family alternatives — clearly explaining the direct personal and environmental impact of your choices.
      </p>

      <div className="hero-cta-group">
        <button
          type="button"
          onClick={handleLaunch}
          className="cta-primary-btn cta-large-btn"
          aria-label="Generate Your Clean Air Plan"
        >
          Generate Your Clean Air Plan ➔
        </button>
      </div>

      {/* Preset interactive triggers for instant evaluator demo */}
      <div className="hero-presets-card" aria-label="One-click sample profiles">
        <div className="presets-label-row">
          <span className="presets-title">⚡ Instant Evaluator Demos:</span>
          <span className="presets-hint">Click any profile below to launch pre-populated assistant</span>
        </div>
        <div className="presets-grid">
          <button
            type="button"
            className="preset-pill-btn"
            onClick={() =>
              handlePresetClick({
                city: 'New Delhi',
                householdType: 'family',
                householdSize: 4,
                commute: 'car',
                healthConcern: true,
                seasonContext: 'winter_smog',
                notes: 'Two school-age children, morning carpool, gas cooking in flat.',
              })
            }
          >
            <span className="preset-icon" aria-hidden="true">👨‍👩‍👧</span>
            <div className="preset-info">
              <strong>Delhi Family Commuter</strong>
              <small>4 people • Car & Metro • Asthma context</small>
            </div>
          </button>

          <button
            type="button"
            className="preset-pill-btn"
            onClick={() =>
              handlePresetClick({
                city: 'Beijing',
                householdType: 'individual',
                householdSize: 2,
                commute: 'cycle',
                healthConcern: false,
                seasonContext: 'winter_smog',
                notes: 'Active daily bicycle commuter, 3rd floor apartment.',
              })
            }
          >
            <span className="preset-icon" aria-hidden="true">🚴‍♂️</span>
            <div className="preset-info">
              <strong>Beijing Active Commuter</strong>
              <small>2 people • Bicycle transit • Outdoor workouts</small>
            </div>
          </button>

          <button
            type="button"
            className="preset-pill-btn"
            onClick={() =>
              handlePresetClick({
                city: 'Lahore',
                householdType: 'elderly',
                householdSize: 3,
                commute: 'public',
                healthConcern: true,
                seasonContext: 'winter_smog',
                notes: 'Elderly grandparents with chronic bronchitis. Ground floor house.',
              })
            }
          >
            <span className="preset-icon" aria-hidden="true">👵</span>
            <div className="preset-info">
              <strong>Lahore Vulnerable Household</strong>
              <small>3 people • Public transit • High smog severity</small>
            </div>
          </button>
        </div>
      </div>

      {/* Impact stats row */}
      <div className="hero-stats-strip" role="region" aria-label="Key impact metrics">
        <div className="stat-card">
          <span className="stat-number">35% – 60%</span>
          <span className="stat-label">Ground PM2.5 avoidance via thermal inversion timing</span>
        </div>
        <div className="stat-divider" aria-hidden="true"></div>
        <div className="stat-card">
          <span className="stat-number">40% – 70%</span>
          <span className="stat-label">Indoor particulate reduction via DIY MERV-13 air cleaner</span>
        </div>
        <div className="stat-divider" aria-hidden="true"></div>
        <div className="stat-card">
          <span className="stat-number">100%</span>
          <span className="stat-label">Anonymous privacy by design with 7-day auto-expiring sessions</span>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
