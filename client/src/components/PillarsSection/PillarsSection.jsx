import React from 'react';
import './PillarsSection.css';

function PillarsSection() {
  return (
    <section id="pillars" className="pillars-section" aria-labelledby="pillars-heading">
      <div className="section-header">
        <span className="section-tag">Science-Grounded Framework</span>
        <h2 id="pillars-heading" className="section-title">
          Three Pillars of Winter Smog Protection
        </h2>
        <p className="section-subtitle">
          Instead of vague alerts, our GenAI assistant targets the specific atmospheric mechanics of winter air pollution:
          thermal inversion stagnation, indoor particulate resuspension, and neighborhood emission sources.
        </p>
      </div>

      <div className="pillars-grid">
        {/* Pillar 1 */}
        <article className="pillar-card" aria-labelledby="pillar-1-title">
          <div className="pillar-header">
            <span className="pillar-icon" aria-hidden="true">🌿</span>
            <div className="pillar-number">Pillar 01</div>
          </div>
          <h3 id="pillar-1-title" className="pillar-title">Low-Emission Daily Routines</h3>
          <p className="pillar-body">
            During winter nights, the ground rapidly cools, creating a <em>thermal inversion layer</em> that traps hazardous vehicle exhaust and smoke below warmer air until late morning.
          </p>
          <ul className="pillar-feature-list">
            <li><strong>Thermal Inversion Timing:</strong> Reschedule outdoor errands and workouts past 10:30 AM when atmospheric mixing disperses surface toxins.</li>
            <li><strong>Shielded Commute Corridors:</strong> Route active transit through tree-buffered residential greenways rather than multi-lane truck arterials.</li>
            <li><strong>Cold-Start Trip Chaining:</strong> Combine short engine errands into a single warmed cycle to eliminate peak particulate spikes.</li>
          </ul>
          <div className="pillar-impact-box">
            <span className="pillar-impact-label">Direct Impact:</span>
            <span className="pillar-impact-value">Avoids 35%–60% higher ground-level particulate concentrations during morning stagnation.</span>
          </div>
        </article>

        {/* Pillar 2 */}
        <article className="pillar-card" aria-labelledby="pillar-2-title">
          <div className="pillar-header">
            <span className="pillar-icon" aria-hidden="true">🏠</span>
            <div className="pillar-number">Pillar 02</div>
          </div>
          <h3 id="pillar-2-title" className="pillar-title">Indoor Air Quality Hacks</h3>
          <p className="pillar-body">
            Indoor air during smog episodes can be 2–5x worse than outdoor air due to indoor cooking, combustion, and resuspended dust from dry sweeping.
          </p>
          <ul className="pillar-feature-list">
            <li><strong>Damp Mopping Protocol:</strong> Replace dry brooms with wet microfiber mopping to capture settled PM2.5 without launching it airborne.</li>
            <li><strong>DIY Corsi-Rosenthal Filtration:</strong> Assemble an affordable box fan with a MERV-13 filter (under $35) matching $300 commercial HEPA purifiers.</li>
            <li><strong>Clean Air Sanctuary:</strong> Seal drafty bedroom door thresholds with rolled moist towels to establish an unpolluted sleeping zone for children & elderly.</li>
          </ul>
          <div className="pillar-impact-box">
            <span className="pillar-impact-label">Direct Impact:</span>
            <span className="pillar-impact-value">Lowers indoor PM2.5 levels by 40%–70% at minimal cost without expensive proprietary appliances.</span>
          </div>
        </article>

        {/* Pillar 3 */}
        <article className="pillar-card" aria-labelledby="pillar-3-title">
          <div className="pillar-header">
            <span className="pillar-icon" aria-hidden="true">♻️</span>
            <div className="pillar-number">Pillar 03</div>
          </div>
          <h3 id="pillar-3-title" className="pillar-title">Sustainable Alternatives</h3>
          <p className="pillar-body">
            Long-term resilience requires replacing everyday high-emission household habits with practical, clean alternatives that fit your community budget.
          </p>
          <ul className="pillar-feature-list">
            <li><strong>Clean Heating Transition:</strong> Swap open-coil and kerosene flame heaters for localized ceramic electric radiant units.</li>
            <li><strong>Neighborhood Transit Pools:</strong> Coordinate school run carpooling or electric bus passes to remove 2–4 single-occupant cars from local streets.</li>
            <li><strong>Non-Chemical Freshening:</strong> Replace synthetic aerosol sprays with citrus-cinnamon simmer pots, avoiding toxic secondary organic aerosol reactions.</li>
          </ul>
          <div className="pillar-impact-box">
            <span className="pillar-impact-label">Direct Impact:</span>
            <span className="pillar-impact-value">Eliminates localized nitrogen dioxide (NO2) buildup and reduces neighborhood emissions.</span>
          </div>
        </article>
      </div>
    </section>
  );
}

export default PillarsSection;
