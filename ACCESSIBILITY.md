# Accessibility Standards & WCAG 2.2 AA Compliance — Urban Air Quality Assistant

> **Standard:** WCAG 2.2 Level AA Full Compliance  
> **Evaluation Pillar:** Pillar 5 (Accessibility & Inclusivity)  
> **Repository:** Urban Air Quality Assistant  

---

## 1. Compliance Baseline & Core Principles

The Urban Air Quality Assistant is built from the ground up to comply with **WCAG 2.2 Level AA**, ensuring barrier-free access for users of all abilities, including vulnerable populations, elderly citizens, and screen reader users navigating environmental smog emergencies:

- **Perceivable:** Visual graphics have structured auditory/textual alternatives; high-contrast tokens guarantee legibility.
- **Operable:** Complete keyboard traversability without mouse dependency or keyboard traps.
- **Understandable:** Predictable navigation, explicit form labels, and clear status announcements.
- **Robust:** Strict semantic HTML5 landmarks compatible with modern assistive technologies.

---

## 2. Semantic HTML & Landmark Structure

The DOM tree is organized into semantic HTML5 landmark tags with descriptive `aria-label` attributes:
- `<header role="banner">`: Navigation bar with live atmospheric region and accessibility controls.
- `<main role="main">`: Primary application workspace.
- `<section>`: Explicit section landmarks (`aria-labelledby="results-main-heading"`, `aria-labelledby="intake-form-heading"`, `aria-labelledby="chat-heading"`).
- `<form>`: Accessible form controls with paired `<label for="...">` associations and explicit helper texts.

---

## 3. The "Twin Representation" Rule for Data Visualizations

Visual diagrams and SVGs are inaccessible to screen readers without structured text counterparts. The Urban Air Quality Assistant enforces the **Twin Representation Rule** (WCAG SC 1.1.1 Non-text Content):

### A. 12-Hour AQI Trend Curve (`AqiTrendSvg.jsx`)
```jsx
{/* 1. Screen Reader Text Twin (WCAG SC 1.1.1) */}
<div className="sr-only">
  <h4>12-Hour Air Quality Forecast Trend for {city}:</h4>
  <ul>
    {hourlyAqi.map((val, i) => (
      <li key={i}>Hour +{i + 1}: Predicted AQI {val}</li>
    ))}
  </ul>
</div>

{/* 2. Visual Graphic Twin (Marked aria-hidden="true") */}
<div className="trend-svg-wrapper" aria-hidden="true">
  <svg viewBox="0 0 360 90" role="presentation" className="trend-svg">
    {/* Render SVG path and points */}
  </svg>
</div>
```

---

## 4. Keyboard Navigation & Visible Focus Indicators

1. **High-Contrast Focus Outlines (`client/src/index.css`):**
   ```css
   /* WCAG SC 2.4.7 Focus Visible */
   :focus-visible {
     outline: 3px solid var(--color-focus);
     outline-offset: 2px;
   }
   ```
2. **Skip-to-Content Link (`Navbar.jsx`):**
   A dedicated skip-link enables keyboard users to immediately bypass the header and jump directly to the clean air recommendations or intake form.
3. **High-Contrast Mode Toggle:**
   A dedicated header toggle button activates the `a11y-contrast` mode, elevating text and border contrast ratios beyond 7:1 (meeting WCAG AAA contrast criteria).
