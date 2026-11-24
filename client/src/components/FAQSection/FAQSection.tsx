import React from 'react';
import './FAQSection.css';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    question: 'What is a winter thermal inversion, and why is morning air the most hazardous?',
    answer:
      'Normally, air near the ground is warmed by the sun and rises, carrying pollutants away into the upper atmosphere. During cold, clear winter nights, the ground radiates heat into space very quickly, cooling the ground-level air. A layer of warmer air forms above this cold air, acting like a lid. Vehicle emissions, biomass smoke, and industrial particulates get trapped at human breathing level (thermal inversion). When the sun warms the ground after 10:00–11:00 AM, the inversion breaks and the air begins to circulate.',
  },
  {
    question: 'How can a DIY Corsi-Rosenthal box match commercial HEPA purifiers?',
    answer:
      'A Corsi-Rosenthal box consists of a standard 20-inch box fan taped to one or more MERV-13 furnace filters. Tested extensively by university aerosol researchers (including UC Davis and EPA), its high Clean Air Delivery Rate (CADR) often exceeds commercial units because the large filter surface area allows massive volumes of air to pass through with very low resistance. It removes over 85% of PM2.5 particulates in a typical room within 30 minutes, costing under $35 compared to $300–$500 commercial devices.',
  },
  {
    question: 'Why does wet mopping protect against PM2.5 while dry sweeping causes harm?',
    answer:
      'Fine particulate matter (PM2.5) settles onto indoor floors overnight. Traditional dry sweeping with brooms acts like a leaf blower at the microscopic level: it resuspends settled toxic particulates into the breathing zone for hours. Using damp microfiber mops and cloths captures the particles in moisture, removing them permanently down the drain without generating airborne dust clouds.',
  },
  {
    question: 'How does Generative AI ensure the advice is tailored and not generic?',
    answer:
      'The assistant inputs your specific urban area, household structure (e.g. toddlers, asthmatic elderly, or active adults), commute type (carpool, bicycle, metro), and home constraints into a domain-constrained Gemini 2.0 Flash prompt. The system instructions explicitly enforce actionable timing adaptations, localized substitute behaviors, and direct impact explanations for your exact situation, rather than static generic tips.',
  },
  {
    question: 'Is any private data or location tracked?',
    answer:
      'No. Privacy is a core requirement of this challenge. We do not require accounts, logins, email addresses, or precise GPS tracking. All recommendations are stored under an anonymous UUID session key with an automated 7-day MongoDB TTL (Time-To-Live) index that automatically deletes all data upon expiration.',
  },
];

const FAQSection: React.FC = () => {
  return (
    <section id="faq" className="faq-section" aria-labelledby="faq-heading">
      <div className="section-header">
        <span className="section-tag">Science & Evidence</span>
        <h2 id="faq-heading" className="section-title">
          Frequently Asked Questions
        </h2>
        <p className="section-subtitle">
          Key atmospheric, health, and privacy questions answered with peer-reviewed aerosol science.
        </p>
      </div>

      <div className="faq-accordion-group">
        {FAQ_LIST.map((faq, index) => (
          <details key={index} className="faq-item">
            <summary className="faq-question">
              <span>{faq.question}</span>
              <span className="faq-toggle-icon" aria-hidden="true">+</span>
            </summary>
            <div className="faq-answer">
              <p>{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
