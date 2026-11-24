/**
 * @file telemetry.ts
 * Type definitions for real-time atmospheric telemetry and air quality metrics.
 */

export type AQISeverity = 'low' | 'moderate' | 'sensitive' | 'unhealthy' | 'severe' | 'hazardous';

export type InversionSeverity = 'none' | 'moderate' | 'severe';

export interface InversionDetails {
  isInversion: boolean;
  severity: InversionSeverity;
  lapseRate: number;
  rationale: string;
  safeVentilationWindow: string;
}

export interface AirQualityData {
  pm2_5: number;
  pm10?: number | null;
  us_aqi: number;
  category: string;
  severity: AQISeverity | string;
  color: string;
  dominantPollutant?: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  inversionRisk: string;
  inversionDetails?: InversionDetails;
}

export interface ForecastData {
  hourlyAqi: number[];
  hourlyPm25: number[];
}

export interface AtmosphericData {
  city: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  timestamp?: string;
  isRealtime?: boolean;
  source?: string;
  airQuality: AirQualityData;
  weather: WeatherData;
  forecast?: ForecastData;
}
