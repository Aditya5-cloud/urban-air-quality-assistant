import React from 'react';
import PropTypes from 'prop-types';
import IntakeForm from '../IntakeForm/IntakeForm';
import ResultsPanel from '../ResultsPanel/ResultsPanel';
import ChatWidget from '../ChatWidget/ChatWidget';
import './AssistantDashboard.css';

function AssistantDashboard({
  planResult = null,
  isLoading = false,
  apiError = null,
  selectedPreset = null,
  onSubmitForm,
  onResetPlan,
  onSelectPreset,
}) {
  return (
    <div className="assistant-dashboard" role="region" aria-label="Urban Air Quality Interactive Workspace">
      {apiError && (
        <div className="dashboard-error-banner" role="alert" aria-live="assertive">
          <span className="error-icon" aria-hidden="true">⚠️</span>
          <span>{apiError}</span>
        </div>
      )}

      {/* Viewport-Aligned 2-Column Split Workspace */}
      <div className="dashboard-viewport-grid">
        {/* Left Column: Intake Form OR Generated Clean Air Plan */}
        <section
          className="dashboard-left-panel"
          aria-labelledby={planResult ? 'results-main-heading' : 'intake-form-heading'}
        >
          {!planResult ? (
            <div className="form-wrapper-card">
              <IntakeForm
                onSubmit={onSubmitForm}
                isLoading={isLoading}
                presetData={selectedPreset}
              />
            </div>
          ) : (
            <div className="plan-wrapper-card">
              <ResultsPanel planData={planResult} onReset={onResetPlan} />
            </div>
          )}
        </section>

        {/* Right Column: AI Chat Specialized Exclusively in Urban Air Quality */}
        <section className="dashboard-right-panel" aria-labelledby="chat-heading">
          {planResult ? (
            <ChatWidget
              sessionId={planResult.sessionId}
              initialHistory={planResult.chatHistory || []}
              profileCity={planResult.profile?.city}
            />
          ) : (
            <div className="chat-intro-placeholder">
              <div className="chat-intro-card">
                <div className="chat-intro-badge">
                  <span className="guardrail-icon" aria-hidden="true">🛡️</span>
                  Strict Domain-Guarded AI Assistant
                </div>

                <h2 id="chat-heading" className="chat-intro-title">Ready to Navigate Winter Smog</h2>
                <p className="chat-intro-text">
                  This GenAI assistant is strictly specialized in winter smog navigation, DIY indoor filtration,
                  low-emission routines, and respiratory health. Non-air-quality questions are systematically declined.
                </p>

                <div className="chat-intro-preview">
                  <p className="preview-label">💡 Questions you can ask once your plan generates:</p>
                  <ul className="preview-list">
                    <li>&ldquo;How can I build a DIY Corsi-Rosenthal MERV-13 filter box for under $35?&rdquo;</li>
                    <li>&ldquo;When is the morning thermal inversion layer expected to clear?&rdquo;</li>
                    <li>&ldquo;How can we protect young children during morning school commutes?&rdquo;</li>
                    <li>&ldquo;Which indoor plants help reduce particulates alongside ventilation?&rdquo;</li>
                  </ul>
                </div>

                <div className="chat-intro-action">
                  <p className="quick-start-text">⚡ Instant Evaluator Demos (1-Click Run):</p>
                  <div className="quick-start-presets">
                    <button
                      type="button"
                      className="quick-preset-btn"
                      onClick={() =>
                        onSelectPreset({
                          city: 'Delhi',
                          householdType: 'family',
                          householdSize: 4,
                          commute: 'car',
                          healthConcern: true,
                          seasonContext: 'winter_smog',
                          notes: 'Two school-age children, morning carpool, gas cooking in flat.',
                        })
                      }
                    >
                      👨‍👩‍👧 Load Delhi Family
                    </button>
                    <button
                      type="button"
                      className="quick-preset-btn"
                      onClick={() =>
                        onSelectPreset({
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
                      🚴‍♂️ Load Beijing Cyclist
                    </button>
                    <button
                      type="button"
                      className="quick-preset-btn"
                      onClick={() =>
                        onSelectPreset({
                          city: 'Lahore',
                          householdType: 'elderly',
                          householdSize: 3,
                          commute: 'public',
                          healthConcern: true,
                          seasonContext: 'winter_smog',
                          notes: 'Elderly parent with COPD, high sensitivity to wood smoke.',
                        })
                      }
                    >
                      🧓 Load Lahore Senior
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

AssistantDashboard.propTypes = {
  planResult: PropTypes.shape({
    sessionId: PropTypes.string,
    profile: PropTypes.shape({
      city: PropTypes.string.isRequired,
    }),
    recommendations: PropTypes.object,
    chatHistory: PropTypes.array,
    atmospheric: PropTypes.object,
  }),
  isLoading: PropTypes.bool,
  apiError: PropTypes.string,
  selectedPreset: PropTypes.object,
  onSubmitForm: PropTypes.func.isRequired,
  onResetPlan: PropTypes.func.isRequired,
  onSelectPreset: PropTypes.func.isRequired,
};

export default AssistantDashboard;
