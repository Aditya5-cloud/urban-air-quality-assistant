import React, { useState } from 'react';
import './IntakeForm.css';

const DEFAULT_FORM_DATA = {
  city: '',
  householdType: 'family',
  householdSize: 4,
  commute: 'public',
  healthConcern: false,
  seasonContext: 'winter_smog',
  notes: '',
};

function IntakeForm({ onSubmit, isLoading, presetData }) {
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState({});

  // Sync external preset if provided
  React.useEffect(() => {
    if (presetData) {
      setFormData((prev) => ({
        ...prev,
        ...presetData,
      }));
      setErrors({});
    }
  }, [presetData]);

  const loadPreset = (preset) => {
    setFormData({
      ...DEFAULT_FORM_DATA,
      ...preset,
    });
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.city.trim() || formData.city.trim().length < 2) {
      newErrors.city = 'Please enter a valid city name (at least 2 letters).';
    }
    if (formData.householdSize < 1 || formData.householdSize > 15) {
      newErrors.householdSize = 'Household size must be between 1 and 15 people.';
    }
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Notes cannot exceed 500 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear field-specific error on change
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        householdSize: parseInt(formData.householdSize, 10),
      });
    }
  };

  return (
    <form
      className="intake-form"
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="intake-form-heading"
      aria-busy={isLoading}
    >
      <div className="form-header">
        <h2 id="intake-form-heading" className="form-title">
          Tell Us About Your Household & Commute
        </h2>
        <p className="form-subtitle">
          Your details remain private and are only used to tailor low-emission routines and indoor air hacks.
        </p>

        <div className="preset-quick-bar" aria-label="Sample test presets">
          <span className="preset-label">Quick presets for evaluators:</span>
          <div className="preset-buttons">
            <button
              type="button"
              className="preset-btn"
              onClick={() =>
                loadPreset({
                  city: 'New Delhi',
                  householdType: 'family',
                  householdSize: 4,
                  commute: 'car',
                  healthConcern: true,
                  seasonContext: 'winter_smog',
                  notes: 'Two school-age children, morning carpool, gas cooking in flat.',
                })
              }
              aria-label="Load sample Delhi Family preset"
            >
              👨‍👩‍👧 New Delhi Family
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={() =>
                loadPreset({
                  city: 'Beijing',
                  householdType: 'individual',
                  householdSize: 2,
                  commute: 'cycle',
                  healthConcern: false,
                  seasonContext: 'winter_smog',
                  notes: 'Active daily bicycle commuter, 3rd floor apartment.',
                })
              }
              aria-label="Load sample Active Commuter preset"
            >
              🚴‍♂️ Active Commuter
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={() =>
                loadPreset({
                  city: 'Lahore',
                  householdType: 'elderly',
                  householdSize: 3,
                  commute: 'public',
                  healthConcern: true,
                  seasonContext: 'winter_smog',
                  notes: 'Elderly grandparents with chronic bronchitis. Ground floor house.',
                })
              }
              aria-label="Load sample Vulnerable Elderly preset"
            >
              👵 Vulnerable Elderly
            </button>
          </div>
        </div>
      </div>

      {/* Fieldset: Location & Living Setup */}
      <fieldset className="form-section">
        <legend className="section-legend">1. Location & Household</legend>

        <div className="form-row">
          <div className="form-group flex-1">
            <label htmlFor="city-input" className="form-label">
              City / Urban Area <span className="required-marker" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </label>
            <input
              id="city-input"
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. New Delhi, Beijing, Lahore, Tehran"
              className={`form-input ${errors.city ? 'input-error' : ''}`}
              aria-required="true"
              aria-invalid={Boolean(errors.city)}
              aria-describedby={errors.city ? 'city-error' : 'city-hint'}
              disabled={isLoading}
            />
            <span id="city-hint" className="field-hint">City where you live or commute daily</span>
            {errors.city && (
              <span id="city-error" className="field-error" role="alert">
                {errors.city}
              </span>
            )}
          </div>

          <div className="form-group flex-1">
            <label htmlFor="householdType-select" className="form-label">
              Household Type <span className="required-marker" aria-hidden="true">*</span>
            </label>
            <select
              id="householdType-select"
              name="householdType"
              value={formData.householdType}
              onChange={handleChange}
              className="form-select"
              disabled={isLoading}
            >
              <option value="family">Family with Children</option>
              <option value="elderly">Household with Elderly</option>
              <option value="individual">Working Professional / Individual</option>
              <option value="student">Student / Shared Flat</option>
            </select>
          </div>

          <div className="form-group w-32">
            <label htmlFor="householdSize-input" className="form-label">
              Residents <span className="required-marker" aria-hidden="true">*</span>
            </label>
            <input
              id="householdSize-input"
              type="number"
              name="householdSize"
              min="1"
              max="15"
              value={formData.householdSize}
              onChange={handleChange}
              className={`form-input ${errors.householdSize ? 'input-error' : ''}`}
              aria-required="true"
              aria-invalid={Boolean(errors.householdSize)}
              aria-describedby={errors.householdSize ? 'size-error' : undefined}
              disabled={isLoading}
            />
            {errors.householdSize && (
              <span id="size-error" className="field-error" role="alert">
                {errors.householdSize}
              </span>
            )}
          </div>
        </div>
      </fieldset>

      {/* Fieldset: Commute & Daily Exposure */}
      <fieldset className="form-section">
        <legend className="section-legend">2. Daily Commute & Transit</legend>

        <div className="form-group">
          <label htmlFor="commute-select" className="form-label">
            Primary Way You Travel for Work / School
          </label>
          <select
            id="commute-select"
            name="commute"
            value={formData.commute}
            onChange={handleChange}
            className="form-select"
            disabled={isLoading}
          >
            <option value="public">Metro, Bus, or Light Rail (Public Transit)</option>
            <option value="car">Private Car or Motorbike (Personal Vehicle)</option>
            <option value="walk">Walking or Cycling (Active Transit)</option>
            <option value="mixed">Mixed (Walking + Public Transit)</option>
            <option value="wfh">Work from Home / Minimal Daily Commute</option>
          </select>
          <span className="field-hint">Helps the assistant optimize travel timing and low-emission alternatives</span>
        </div>
      </fieldset>

      {/* Fieldset: Smog Context & Health */}
      <fieldset className="form-section">
        <legend className="section-legend">3. Smog Context & Health Protection</legend>

        <div className="form-row items-center">
          <div className="form-group flex-1">
            <label htmlFor="seasonContext-select" className="form-label">
              Current Pollution Severity
            </label>
            <select
              id="seasonContext-select"
              name="seasonContext"
              value={formData.seasonContext}
              onChange={handleChange}
              className="form-select"
              disabled={isLoading}
            >
              <option value="winter_smog">Severe Winter Smog (Thermal Inversion & Stagnation)</option>
              <option value="high_pollution">High Urban Particulate Levels (AQI 200+)</option>
              <option value="general">Moderate Pollution / Preventative Planning</option>
            </select>
          </div>

          <div className="form-group checkbox-group flex-1">
            <label className="checkbox-label" htmlFor="healthConcern-checkbox">
              <input
                id="healthConcern-checkbox"
                type="checkbox"
                name="healthConcern"
                checked={formData.healthConcern}
                onChange={handleChange}
                className="form-checkbox"
                disabled={isLoading}
              />
              <span className="checkbox-text">
                <strong>Vulnerable health conditions present</strong>
                <span className="checkbox-subtext">Asthma, bronchitis, cardiovascular conditions, pregnancy, or infants</span>
              </span>
            </label>
          </div>
        </div>
      </fieldset>

      {/* Fieldset: Optional Context */}
      <fieldset className="form-section">
        <legend className="section-legend">4. Specific Needs or Constraints (Optional)</legend>
        <div className="form-group">
          <label htmlFor="notes-textarea" className="form-label">
            Lifestyle Notes or Home Constraints
          </label>
          <textarea
            id="notes-textarea"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            maxLength={500}
            rows={3}
            placeholder="e.g. Ground-floor apartment near busy road, electric stove, gas heater, outdoor school sport sessions at 8 AM"
            className="form-textarea"
            aria-describedby="notes-counter"
            disabled={isLoading}
          />
          <div id="notes-counter" className="char-counter" aria-live="polite">
            {formData.notes.length} / 500 characters
          </div>
        </div>
      </fieldset>

      {/* Submit Action */}
      <div className="form-actions">
        <button
          type="submit"
          className="submit-button"
          disabled={isLoading}
          aria-label={isLoading ? 'Generating personalized air quality plan' : 'Generate personalized air quality plan'}
        >
          {isLoading ? (
            <span className="button-loading-content">
              <span className="loading-spinner" aria-hidden="true"></span>
              Analyzing Smog Patterns & Generating Plan...
            </span>
          ) : (
            'Generate My Air Quality Plan ➔'
          )}
        </button>
      </div>
    </form>
  );
}

export default IntakeForm;
