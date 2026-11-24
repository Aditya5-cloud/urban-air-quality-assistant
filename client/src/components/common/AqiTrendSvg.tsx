import React, { memo } from 'react';

export interface AqiTrendSvgProps {
  hourlyAqi?: number[];
  city?: string;
}

/**
 * Native SVG 12-hour AQI Trend Visualizer.
 * Follows WCAG 2.2 Level AA Twin Representation Rule (SC 1.1.1):
 * - Visual SVG marked with aria-hidden="true" role="presentation"
 * - Paired with adjacent .sr-only structured text alternative for screen readers.
 */
function AqiTrendSvg({ hourlyAqi = [], city = 'Selected City' }: AqiTrendSvgProps): React.ReactElement | null {
  if (!hourlyAqi || hourlyAqi.length === 0) {
    return null;
  }

  const width = 360;
  const height = 90;
  const padding = 15;

  const minAqi = Math.min(...hourlyAqi);
  const maxAqi = Math.max(...hourlyAqi, 300);

  // Generate SVG path points
  const points = hourlyAqi.map((aqi, idx) => {
    const x = padding + (idx / (hourlyAqi.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((aqi - minAqi) / (maxAqi - minAqi || 1)) * (height - 2 * padding);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${(width - padding).toFixed(1)},${(height - padding).toFixed(1)} L ${padding.toFixed(1)},${(height - padding).toFixed(1)} Z`;

  return (
    <div className="aqi-trend-container" role="region" aria-label={`12-hour air quality forecast trend for ${city}`}>
      {/* 1. Screen Reader Accessible Twin Representation (WCAG SC 1.1.1) */}
      <div className="sr-only">
        <h4>12-Hour Air Quality Forecast Trend for {city}:</h4>
        <ul>
          {hourlyAqi.map((val, i) => (
            <li key={i}>
              Hour +{i + 1}: Predicted AQI {val}
            </li>
          ))}
        </ul>
        <p>Values range from a low of {minAqi} AQI to a peak of {Math.max(...hourlyAqi)} AQI.</p>
      </div>

      {/* 2. Visual Native SVG Graphic (Hidden from assistive tech) */}
      <div className="trend-svg-wrapper" aria-hidden="true">
        <div className="trend-meta-header">
          <span className="trend-title">📈 12-Hour Atmospheric AQI Trajectory</span>
          <span className="trend-range">Min: {minAqi} | Max: {Math.max(...hourlyAqi)}</span>
        </div>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="trend-svg"
          preserveAspectRatio="none"
          role="presentation"
        >
          <defs>
            <linearGradient id="aqiTrendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ea580c" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#aqiTrendGrad)" />
          <path d={pathD} fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" />
          {hourlyAqi.map((_aqi, idx) => {
            const [cx, cy] = points[idx].split(',');
            return (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r="3"
                fill="#ffffff"
                stroke="#ea580c"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default memo(AqiTrendSvg);
