import React from 'react';
import './ImpactComparison.css';

interface ComparisonRow {
  feature: string;
  generic: string;
  assistant: string;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    feature: 'Actionability',
    generic: 'Passive alerts: "Air quality is hazardous, avoid breathing"',
    assistant: 'Contextual protocol: specific hours, transit shifts, and safe chores',
  },
  {
    feature: 'Inversion Timing',
    generic: 'No timing nuance; assumes air is uniformly bad all 24 hours',
    assistant: 'Explains ground thermal inversion layer; schedules activity after 10:30 AM',
  },
  {
    feature: 'Indoor Air Strategy',
    generic: 'Advises purchasing expensive proprietary $300+ purifiers',
    assistant: 'Affordable DIY Corsi-Rosenthal filters (<$35), wet mopping, & door threshold sealing',
  },
  {
    feature: 'Impact Transparency',
    generic: 'Zero explanation of why advice matters or what emissions are saved',
    assistant: 'Quantified personal and community impact for every single routine suggested',
  },
  {
    feature: 'Follow-Up Questions',
    generic: 'Static screen with no conversational refinement',
    assistant: 'Multi-turn GenAI chat to adapt routines for sports, infants, or gas heating',
  },
  {
    feature: 'Data Privacy',
    generic: 'Continuous GPS tracking, mandatory account registration, ad beacons',
    assistant: '100% anonymous, zero tracking, UUID shareable sessions with 7-day auto-TTL',
  },
];

const ImpactComparison: React.FC = () => {
  return (
    <section className="comparison-section" aria-labelledby="comparison-heading">
      <div className="section-header">
        <span className="section-tag">Direct Value Advantage</span>
        <h2 id="comparison-heading" className="section-title">
          Why Traditional Weather Apps Fall Short
        </h2>
        <p className="section-subtitle">
          Seeing a red AQI number creates anxiety without providing solutions. Here is how our GenAI Assistant transforms panic into proactive protection.
        </p>
      </div>

      <div className="comparison-table-wrapper" role="region" aria-label="Feature comparison table" tabIndex={0}>
        <table className="comparison-table">
          <thead>
            <tr>
              <th scope="col" className="th-dimension">Dimension</th>
              <th scope="col" className="th-generic">Generic AQI Apps</th>
              <th scope="col" className="th-assistant">Urban Air Quality Assistant</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_DATA.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                <th scope="row" className="td-feature">{row.feature}</th>
                <td className="td-generic">
                  <span className="status-cross" aria-hidden="true">✕</span>
                  <span>{row.generic}</span>
                </td>
                <td className="td-assistant">
                  <span className="status-check" aria-hidden="true">✓</span>
                  <span>{row.assistant}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ImpactComparison;
