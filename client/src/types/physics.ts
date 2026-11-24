/**
 * @file physics.ts
 * Type definitions for environmental physics calculations, CADR room sizing, and transit exposure.
 */

export interface BreakpointRange {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
  category: string;
  color: string;
}

export interface CommuteConfig {
  label: string;
  speedKmH: number;
  breathingRate: number;
  protection: number;
  co2PerKm: number;
}

export interface CommuteComparisonOption {
  mode: string;
  label: string;
  durationMinutes: number;
  inhaledDoseUg: number;
  co2Kg: number;
  healthRisk: string;
  isRecommended: boolean;
}

export interface InversionRiskAssessment {
  isInversion: boolean;
  severity: 'none' | 'moderate' | 'severe';
  lapseRate: number;
  rationale: string;
  safeVentilationWindow: string;
}

export interface CommunityOffsetResult {
  totalCo2Kg: number;
  totalPm25Grams: number;
}
