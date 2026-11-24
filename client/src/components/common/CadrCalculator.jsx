import React, { useState, useMemo, memo } from 'react';
import {
  calculateRoomVolume,
  calculateRequiredCADR,
  estimatePurificationTime,
} from '../../utils/airPhysics';

function CadrCalculator() {
  const [area, setArea] = useState(16); // 16 m2 default bedroom
  const [height, setHeight] = useState(2.8); // 2.8m ceiling
  const [hasPurifier] = useState(true);
  const [purifierCadr] = useState(250); // 250 m3/h typical

  const volume = useMemo(() => calculateRoomVolume(area, height), [area, height]);
  const requiredCadr = useMemo(() => calculateRequiredCADR(volume, 4), [volume]);
  const effectiveCadr = hasPurifier ? purifierCadr : 30; // 30 m3/h natural draft baseline
  const clearanceTimeMins = useMemo(
    () => estimatePurificationTime(volume, effectiveCadr, 0.8),
    [volume, effectiveCadr]
  );

  return (
    <div className="cadr-calculator-box" role="region" aria-label="Indoor Room CADR and Clean Air Calculator">
      <div className="cadr-calc-header">
        <h4 className="cadr-calc-title">
          <span aria-hidden="true">📐</span> Room CADR & Purification Time Calculator
        </h4>
        <span className="cadr-calc-badge">ASHRAE 4 ACH Standard</span>
      </div>

      <p className="cadr-calc-desc">
        Calculate the exact Clean Air Delivery Rate (CADR) required to maintain safe indoor air for your room size during severe smog.
      </p>

      <div className="cadr-controls-grid">
        <div className="cadr-control-item">
          <label htmlFor="room-area-slider" className="cadr-label">
            Floor Area: <strong className="cadr-val-highlight">{area} m²</strong> (~{(area * 10.76).toFixed(0)} sq ft)
          </label>
          <input
            id="room-area-slider"
            type="range"
            min="6"
            max="60"
            step="1"
            value={area}
            onChange={(e) => setArea(Number(e.target.value))}
            className="cadr-slider"
            aria-valuemin={6}
            aria-valuemax={60}
            aria-valuenow={area}
          />
        </div>

        <div className="cadr-control-item">
          <label htmlFor="room-height-slider" className="cadr-label">
            Ceiling Height: <strong className="cadr-val-highlight">{height} m</strong>
          </label>
          <input
            id="room-height-slider"
            type="range"
            min="2.2"
            max="4.0"
            step="0.1"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="cadr-slider"
            aria-valuemin={2.2}
            aria-valuemax={4.0}
            aria-valuenow={height}
          />
        </div>
      </div>

      <div className="cadr-results-summary">
        <div className="cadr-stat-tile">
          <span className="stat-tile-label">Room Air Volume</span>
          <span className="stat-tile-val">{volume} m³</span>
        </div>
        <div className="cadr-stat-tile">
          <span className="stat-tile-label">Required CADR (4 ACH)</span>
          <span className="stat-tile-val text-orange">{requiredCadr} m³/h</span>
        </div>
        <div className="cadr-stat-tile">
          <span className="stat-tile-label">80% Smoke Clearance Time</span>
          <span className="stat-tile-val text-green">{clearanceTimeMins} mins</span>
        </div>
      </div>

      {/* DIY Corsi-Rosenthal Box Blueprint Strip */}
      <div className="cr-box-recommendation" role="note">
        <span className="cr-box-icon" aria-hidden="true">📦</span>
        <div className="cr-box-text">
          <strong>DIY Corsi-Rosenthal Recommendation:</strong> A \$35 DIY box fan + MERV-13 filter provides <strong>~350 m³/h CADR</strong>, sufficient to purify a <strong>{Math.floor(350 / (height * 4))} m²</strong> room in under <strong>18 minutes</strong>.
        </div>
      </div>
    </div>
  );
}

export default memo(CadrCalculator);
