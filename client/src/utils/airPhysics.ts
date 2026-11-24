/**
 * @file airPhysics.ts
 * Pure, side-effect-free environmental physics and air quality compute engine.
 * Implements EPA linear piecewise interpolation, ASHRAE 4-5 ACH ventilation standards,
 * single-compartment particle clearance decay kinetics, inhaled microgram dose calculations,
 * and boundary-layer thermal inversion lapse rate modeling.
 */

import type {
  BreakpointRange,
  CommuteConfig,
  CommuteComparisonOption,
  InversionRiskAssessment,
  CommunityOffsetResult,
} from '../types';

/**
 * Validates that a value is a finite number.
 * @throws {TypeError} If not a finite number
 */
export function assertFiniteNumber(val: unknown, name: string): asserts val is number {
  if (typeof val !== 'number' || !Number.isFinite(val)) {
    throw new TypeError(`Expected ${name} to be a finite number, received: ${val}`);
  }
}

/**
 * Validates that a value is strictly positive (> 0).
 * @throws {RangeError} If not strictly positive
 */
export function assertPositive(val: number, name: string): void {
  assertFiniteNumber(val, name);
  if (val <= 0) {
    throw new RangeError(`Expected ${name} to be strictly positive (> 0), received: ${val}`);
  }
}

/**
 * EPA Breakpoint definitions for PM2.5 (24-hour average, ug/m3).
 */
export const PM25_BREAKPOINTS: readonly BreakpointRange[] = [
  { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50, category: 'Good', color: '#15803d' },
  { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100, category: 'Moderate', color: '#ca8a04' },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150, category: 'Unhealthy for Sensitive Groups', color: '#ea580c' },
  { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200, category: 'Unhealthy', color: '#dc2626' },
  { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300, category: 'Very Unhealthy', color: '#9333ea' },
  { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500, category: 'Hazardous', color: '#7f1d1d' },
];

/**
 * Calculates US AQI from PM2.5 concentration using EPA linear piecewise interpolation:
 * I = [(I_high - I_low) / (C_high - C_low)] * (C - C_low) + I_low
 */
export function calculatePM25AQI(pm25: number): number {
  assertFiniteNumber(pm25, 'pm25');
  if (pm25 < 0) {
    throw new RangeError(`PM2.5 concentration cannot be negative, received: ${pm25}`);
  }

  // Cap at EPA upper bound
  const clamped = Math.min(pm25, 500.4);

  for (const bp of PM25_BREAKPOINTS) {
    if (clamped <= bp.cHigh) {
      const aqi =
        ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (clamped - bp.cLow) + bp.iLow;
      return Math.round(aqi);
    }
  }

  return 500;
}

/**
 * Returns EPA category and severity metadata for a given AQI value.
 */
export function getAQICategory(aqi: number): { category: string; severity: string; color: string } {
  assertFiniteNumber(aqi, 'aqi');
  if (aqi < 0) {
    throw new RangeError(`AQI cannot be negative, received: ${aqi}`);
  }

  if (aqi <= 50) return { category: 'Good', severity: 'low', color: '#15803d' };
  if (aqi <= 100) return { category: 'Moderate', severity: 'moderate', color: '#ca8a04' };
  if (aqi <= 150) return { category: 'Unhealthy for Sensitive Groups', severity: 'sensitive', color: '#ea580c' };
  if (aqi <= 200) return { category: 'Unhealthy', severity: 'unhealthy', color: '#dc2626' };
  if (aqi <= 300) return { category: 'Very Unhealthy', severity: 'severe', color: '#9333ea' };
  return { category: 'Hazardous', severity: 'hazardous', color: '#7f1d1d' };
}

/**
 * Calculates room volume in cubic meters.
 */
export function calculateRoomVolume(areaSqM: number, heightM: number): number {
  assertPositive(areaSqM, 'areaSqM');
  assertPositive(heightM, 'heightM');
  return Math.round(areaSqM * heightM * 100) / 100;
}

/**
 * Calculates required Clean Air Delivery Rate (CADR in m3/h) to achieve target Air Changes per Hour (ACH).
 * Standard ASHRAE recommends at least 4 to 5 ACH for severe winter smog and wildfire events.
 */
export function calculateRequiredCADR(volumeM3: number, desiredACH = 4): number {
  assertPositive(volumeM3, 'volumeM3');
  assertPositive(desiredACH, 'desiredACH');
  return Math.round(volumeM3 * desiredACH);
}

/**
 * Estimates time (in minutes) required to reduce indoor airborne particulate by target efficiency (default 80%).
 * Uses single-compartment mass balance first-order decay:
 * t = (-ln(1 - efficiency) * V / CADR) * 60
 */
export function estimatePurificationTime(
  volumeM3: number,
  cadrM3H: number,
  targetEfficiency = 0.8
): number {
  assertPositive(volumeM3, 'volumeM3');
  assertPositive(cadrM3H, 'cadrM3H');
  assertFiniteNumber(targetEfficiency, 'targetEfficiency');

  if (targetEfficiency <= 0 || targetEfficiency >= 1) {
    throw new RangeError(
      `Target efficiency must be strictly between 0 and 1, received: ${targetEfficiency}`
    );
  }

  const hours = (-Math.log(1 - targetEfficiency) * volumeM3) / cadrM3H;
  return Math.max(1, Math.round(hours * 60));
}

/**
 * Calculates inhaled PM2.5 exposure dose in micrograms (ug).
 * Formula: Dose = Concentration (ug/m3) * Time (hours) * BreathingRate (m3/h) * (1 - InfiltrationProtection)
 */
export function calculateExposureDose(
  pm25UgM3: number,
  durationHours: number,
  breathingRateM3H: number,
  protectionFactor = 0
): number {
  assertFiniteNumber(pm25UgM3, 'pm25UgM3');
  assertFiniteNumber(durationHours, 'durationHours');
  assertFiniteNumber(breathingRateM3H, 'breathingRateM3H');
  assertFiniteNumber(protectionFactor, 'protectionFactor');

  if (pm25UgM3 < 0) throw new RangeError(`PM2.5 cannot be negative: ${pm25UgM3}`);
  if (durationHours < 0) throw new RangeError(`Duration cannot be negative: ${durationHours}`);
  if (breathingRateM3H < 0) throw new RangeError(`Breathing rate cannot be negative: ${breathingRateM3H}`);
  if (protectionFactor < 0 || protectionFactor > 1) {
    throw new RangeError(`Protection factor must be between 0 and 1: ${protectionFactor}`);
  }

  const dose = pm25UgM3 * durationHours * breathingRateM3H * (1 - protectionFactor);
  return Math.round(dose * 10) / 10;
}

/**
 * Commute transit configurations for exposure dose and emission comparisons.
 */
export const COMMUTE_MODES: Record<string, CommuteConfig> = {
  metro: { label: 'Underground Metro', speedKmH: 35, breathingRate: 0.6, protection: 0.75, co2PerKm: 0.02 },
  bus: { label: 'AC Electric / City Bus', speedKmH: 20, breathingRate: 0.6, protection: 0.6, co2PerKm: 0.05 },
  car: { label: 'Gasoline Car (Cabin Sealed)', speedKmH: 25, breathingRate: 0.5, protection: 0.65, co2PerKm: 0.19 },
  cycling: { label: 'Bicycle / E-Bike', speedKmH: 15, breathingRate: 2.2, protection: 0.0, co2PerKm: 0.0 },
  walking: { label: 'Walking Pedestrian', speedKmH: 5, breathingRate: 1.2, protection: 0.0, co2PerKm: 0.0 },
};

/**
 * Computes multi-modal commute trade-offs for a given travel distance and ambient air quality index.
 */
export function calculateMultiModalCommute(
  distanceKm: number,
  ambientAQI: number
): CommuteComparisonOption[] {
  assertPositive(distanceKm, 'distanceKm');
  assertFiniteNumber(ambientAQI, 'ambientAQI');
  if (ambientAQI < 0) throw new RangeError(`AQI cannot be negative: ${ambientAQI}`);

  const estimatedPM25 = Math.max(5, (ambientAQI / 500) * 250);

  return Object.entries(COMMUTE_MODES).map(([key, cfg]) => {
    const durationHours = distanceKm / cfg.speedKmH;
    const durationMinutes = Math.max(1, Math.round(durationHours * 60));
    const dose = calculateExposureDose(estimatedPM25, durationHours, cfg.breathingRate, cfg.protection);
    const co2 = Math.round(distanceKm * cfg.co2PerKm * 100) / 100;

    let healthRisk = 'Low';
    if (dose > 60) healthRisk = 'Severe (Alveolar Deposition)';
    else if (dose > 30) healthRisk = 'Moderate';
    else if (dose > 10) healthRisk = 'Low-Moderate';

    const isRecommended =
      (key === 'metro' && ambientAQI > 100) ||
      (key === 'cycling' && ambientAQI <= 50) ||
      (key === 'walking' && ambientAQI <= 50 && distanceKm <= 3) ||
      (key === 'bus' && ambientAQI > 50 && ambientAQI <= 150);

    return {
      mode: key,
      label: cfg.label,
      durationMinutes,
      inhaledDoseUg: dose,
      co2Kg: co2,
      healthRisk,
      isRecommended,
    };
  });
}

/**
 * Evaluates meteorological conditions for winter thermal inversion risk.
 * Atmospheric inversion occurs when cold surface air is trapped beneath a warmer boundary layer with low wind.
 */
export function evaluateInversionRisk(
  tempSurfaceC: number,
  tempAloftC: number,
  windSpeedKmh: number
): InversionRiskAssessment {
  assertFiniteNumber(tempSurfaceC, 'tempSurfaceC');
  assertFiniteNumber(tempAloftC, 'tempAloftC');
  assertFiniteNumber(windSpeedKmh, 'windSpeedKmh');

  const lapseRate = Math.round((tempAloftC - tempSurfaceC) * 10) / 10;

  if (lapseRate > 2.0 && windSpeedKmh < 6) {
    return {
      isInversion: true,
      severity: 'severe',
      lapseRate,
      rationale: `Strong thermal inversion cap (+${lapseRate}°C aloft) and stagnant winds (${windSpeedKmh} km/h) trap vehicular and smoke emissions at street breathing level.`,
      safeVentilationWindow: '1:00 PM – 3:30 PM (Midday solar radiation breaks boundary cap)',
    };
  }

  if (lapseRate > 0 && windSpeedKmh < 12) {
    return {
      isInversion: true,
      severity: 'moderate',
      lapseRate,
      rationale: `Mild thermal inversion (+${lapseRate}°C aloft) with calm winds (${windSpeedKmh} km/h). Particulate matter concentrates near ground level during morning hours.`,
      safeVentilationWindow: '11:30 AM – 4:00 PM (Optimal atmospheric mixing)',
    };
  }

  return {
    isInversion: false,
    severity: 'none',
    lapseRate,
    rationale: `Normal vertical adiabatic lapse rate with active air mixing (${windSpeedKmh} km/h winds). Favorable atmospheric dispersion.`,
    safeVentilationWindow: 'Open windows freely during daytime hours (10:00 AM – 5:00 PM)',
  };
}

/**
 * Community emission offset weights for neighborhood pledges.
 */
export const PLEDGE_WEIGHTS: Record<string, { label: string; co2Kg: number; pm25Grams: number }> = {
  carpool: { label: 'Carpooling / Metro Commute', co2Kg: 4.8, pm25Grams: 22 },
  cleanHeating: { label: 'Electric Heating Switch (No Open Flame)', co2Kg: 12.0, pm25Grams: 140 },
  dampMopping: { label: 'Damp Mopping (Anti-Resuspension)', co2Kg: 1.5, pm25Grams: 85 },
  zeroWasteBurn: { label: 'Zero Leaf / Waste Burning', co2Kg: 6.2, pm25Grams: 110 },
  vulnerableCheck: { label: 'Vulnerable Neighbor Wellness Check', co2Kg: 0.5, pm25Grams: 5 },
};

/**
 * Computes collective community carbon and particulate emission offset.
 */
export function calculateCommunityOffset(
  pledgeCounts: Record<string, number> | null | undefined
): CommunityOffsetResult {
  if (!pledgeCounts || typeof pledgeCounts !== 'object') {
    return { totalCo2Kg: 0, totalPm25Grams: 0 };
  }

  let totalCo2Kg = 0;
  let totalPm25Grams = 0;

  for (const [key, count] of Object.entries(pledgeCounts)) {
    if (typeof count === 'number' && count > 0 && PLEDGE_WEIGHTS[key]) {
      totalCo2Kg += count * PLEDGE_WEIGHTS[key].co2Kg;
      totalPm25Grams += count * PLEDGE_WEIGHTS[key].pm25Grams;
    }
  }

  return {
    totalCo2Kg: Math.round(totalCo2Kg * 10) / 10,
    totalPm25Grams: Math.round(totalPm25Grams * 10) / 10,
  };
}
