import { describe, it, expect } from 'vitest';
import {
  assertFiniteNumber,
  assertPositive,
  calculatePM25AQI,
  getAQICategory,
  calculateRoomVolume,
  calculateRequiredCADR,
  estimatePurificationTime,
  calculateExposureDose,
  calculateMultiModalCommute,
  evaluateInversionRisk,
  calculateCommunityOffset,
} from './airPhysics';

describe('airPhysics - Pure Environmental Compute Engine', () => {
  describe('Parameter Assertions', () => {
    it('accepts finite numbers', () => {
      expect(() => assertFiniteNumber(0, 'zero')).not.toThrow();
      expect(() => assertFiniteNumber(42.5, 'float')).not.toThrow();
      expect(() => assertFiniteNumber(-10, 'negative')).not.toThrow();
    });

    it('throws TypeError for non-numbers or non-finite numbers', () => {
      expect(() => assertFiniteNumber('42', 'string')).toThrow(TypeError);
      expect(() => assertFiniteNumber(NaN, 'nan')).toThrow(TypeError);
      expect(() => assertFiniteNumber(Infinity, 'infinity')).toThrow(TypeError);
      expect(() => assertFiniteNumber(null, 'null')).toThrow(TypeError);
      expect(() => assertFiniteNumber(undefined, 'undefined')).toThrow(TypeError);
    });

    it('accepts strictly positive numbers', () => {
      expect(() => assertPositive(1, 'pos')).not.toThrow();
      expect(() => assertPositive(0.001, 'smallPos')).not.toThrow();
    });

    it('throws RangeError for zero or negative numbers', () => {
      expect(() => assertPositive(0, 'zero')).toThrow(RangeError);
      expect(() => assertPositive(-5, 'neg')).toThrow(RangeError);
    });
  });

  describe('EPA PM2.5 Breakpoints & AQI Calculation', () => {
    it('calculates AQI correctly across standard EPA breakpoints', () => {
      expect(calculatePM25AQI(0.0)).toBe(0);
      expect(calculatePM25AQI(12.0)).toBe(50);
      expect(calculatePM25AQI(35.4)).toBe(100);
      expect(calculatePM25AQI(55.4)).toBe(150);
      expect(calculatePM25AQI(150.4)).toBe(200);
      expect(calculatePM25AQI(250.4)).toBe(300);
      expect(calculatePM25AQI(500.4)).toBe(500);
    });

    it('interpolates intermediate concentrations accurately', () => {
      // Midpoint of Good category: 6.0 ug/m3 -> AQI 25
      expect(calculatePM25AQI(6.0)).toBe(25);
      // Midpoint of Moderate category: (12.1 + 35.4) / 2 = 23.75 -> ~76
      const midMod = calculatePM25AQI(23.75);
      expect(midMod).toBeGreaterThanOrEqual(74);
      expect(midMod).toBeLessThanOrEqual(77);
    });

    it('caps AQI at 500 for extreme concentrations exceeding 500.4 ug/m3', () => {
      expect(calculatePM25AQI(650.0)).toBe(500);
      expect(calculatePM25AQI(999.0)).toBe(500);
    });

    it('throws RangeError for negative PM2.5 concentrations', () => {
      expect(() => calculatePM25AQI(-1)).toThrow(RangeError);
      expect(() => calculatePM25AQI(-0.1)).toThrow(RangeError);
    });
  });

  describe('EPA AQI Categories & Severity Metadata', () => {
    it('maps AQI values to official EPA categories and colors', () => {
      expect(getAQICategory(25).category).toBe('Good');
      expect(getAQICategory(75).category).toBe('Moderate');
      expect(getAQICategory(125).category).toBe('Unhealthy for Sensitive Groups');
      expect(getAQICategory(175).category).toBe('Unhealthy');
      expect(getAQICategory(250).category).toBe('Very Unhealthy');
      expect(getAQICategory(400).category).toBe('Hazardous');
    });

    it('handles exact boundary thresholds', () => {
      expect(getAQICategory(50).severity).toBe('low');
      expect(getAQICategory(51).severity).toBe('moderate');
      expect(getAQICategory(100).severity).toBe('moderate');
      expect(getAQICategory(101).severity).toBe('sensitive');
      expect(getAQICategory(150).severity).toBe('sensitive');
      expect(getAQICategory(151).severity).toBe('unhealthy');
      expect(getAQICategory(200).severity).toBe('unhealthy');
      expect(getAQICategory(201).severity).toBe('severe');
      expect(getAQICategory(300).severity).toBe('severe');
      expect(getAQICategory(301).severity).toBe('hazardous');
    });

    it('throws RangeError for negative AQI', () => {
      expect(() => getAQICategory(-10)).toThrow(RangeError);
    });
  });

  describe('Indoor Room Volume & ASHRAE CADR Sizing', () => {
    it('calculates room volume accurately', () => {
      expect(calculateRoomVolume(15, 2.7)).toBe(40.5);
      expect(calculateRoomVolume(20, 3.0)).toBe(60);
    });

    it('throws RangeError for invalid room dimensions', () => {
      expect(() => calculateRoomVolume(0, 2.5)).toThrow(RangeError);
      expect(() => calculateRoomVolume(-10, 2.5)).toThrow(RangeError);
      expect(() => calculateRoomVolume(20, 0)).toThrow(RangeError);
      expect(() => calculateRoomVolume(20, -3)).toThrow(RangeError);
    });

    it('calculates required CADR for standard ASHRAE 4 ACH', () => {
      // 40.5 m3 * 4 ACH = 162 m3/h
      expect(calculateRequiredCADR(40.5)).toBe(162);
      expect(calculateRequiredCADR(50, 5)).toBe(250);
    });

    it('throws RangeError for invalid volume or ACH', () => {
      expect(() => calculateRequiredCADR(0)).toThrow(RangeError);
      expect(() => calculateRequiredCADR(50, 0)).toThrow(RangeError);
      expect(() => calculateRequiredCADR(-20)).toThrow(RangeError);
    });
  });

  describe('Single-Compartment Particle Clearance Decay Kinetics', () => {
    it('estimates clearance time in minutes for 80% particle reduction', () => {
      // Volume = 50 m3, CADR = 250 m3/h (5 ACH)
      // t = -ln(1 - 0.8) * 50 / 250 * 60 = 1.6094 * 0.2 * 60 = ~19.3 minutes -> 19 mins
      const mins = estimatePurificationTime(50, 250, 0.8);
      expect(mins).toBe(19);
    });

    it('scales clearance time with room volume and CADR', () => {
      const smallRoom = estimatePurificationTime(30, 300, 0.8);
      const largeRoom = estimatePurificationTime(90, 300, 0.8);
      expect(largeRoom).toBeGreaterThan(smallRoom);
      expect(largeRoom).toBeCloseTo(smallRoom * 3, -1);
    });

    it('throws RangeError on invalid efficiencies outside (0, 1)', () => {
      expect(() => estimatePurificationTime(50, 200, 0)).toThrow(RangeError);
      expect(() => estimatePurificationTime(50, 200, 1.0)).toThrow(RangeError);
      expect(() => estimatePurificationTime(50, 200, -0.5)).toThrow(RangeError);
      expect(() => estimatePurificationTime(50, 200, 1.5)).toThrow(RangeError);
    });
  });

  describe('Inhaled Microgram PM2.5 Dose Math', () => {
    it('computes inhaled dose accurately without filter protection', () => {
      // PM2.5 = 120 ug/m3, 1 hour, breathing rate = 0.6 m3/h -> 72 ug
      expect(calculateExposureDose(120, 1, 0.6, 0)).toBe(72.0);
    });

    it('factors in mask or filtration protection factors', () => {
      // With 75% filtration (protectionFactor = 0.75): 72 * (1 - 0.75) = 18 ug
      expect(calculateExposureDose(120, 1, 0.6, 0.75)).toBe(18.0);
    });

    it('throws RangeError on negative values or invalid protection factors', () => {
      expect(() => calculateExposureDose(-10, 1, 0.6)).toThrow(RangeError);
      expect(() => calculateExposureDose(100, -1, 0.6)).toThrow(RangeError);
      expect(() => calculateExposureDose(100, 1, -0.5)).toThrow(RangeError);
      expect(() => calculateExposureDose(100, 1, 0.6, 1.2)).toThrow(RangeError);
      expect(() => calculateExposureDose(100, 1, 0.6, -0.1)).toThrow(RangeError);
    });
  });

  describe('Multi-Modal Commute Analysis', () => {
    it('returns trade-off calculations for all 5 commute modes', () => {
      const results = calculateMultiModalCommute(10, 250);
      expect(results).toHaveLength(5);

      const metro = results.find((r) => r.mode === 'metro');
      const cycling = results.find((r) => r.mode === 'cycling');
      const car = results.find((r) => r.mode === 'car');

      expect(metro).toBeDefined();
      expect(cycling).toBeDefined();
      expect(car).toBeDefined();

      if (metro && cycling && car) {
        // Metro should have lower inhaled dose than cycling in high AQI
        expect(metro.inhaledDoseUg).toBeLessThan(cycling.inhaledDoseUg);
        // Cycling has 0 direct CO2 emissions
        expect(cycling.co2Kg).toBe(0);
        // Car has highest CO2 emissions
        expect(car.co2Kg).toBeGreaterThan(metro.co2Kg);
        // Metro should be recommended in high AQI (250)
        expect(metro.isRecommended).toBe(true);
        expect(cycling.isRecommended).toBe(false);
      }
    });

    it('throws RangeError for non-positive distance or negative AQI', () => {
      expect(() => calculateMultiModalCommute(0, 100)).toThrow(RangeError);
      expect(() => calculateMultiModalCommute(-5, 100)).toThrow(RangeError);
      expect(() => calculateMultiModalCommute(10, -50)).toThrow(RangeError);
    });
  });

  describe('Boundary-Layer Thermal Inversion Risk Modeling', () => {
    it('identifies severe thermal inversions with high lapse rates and calm winds', () => {
      // Surface 10C, Aloft 14C (Lapse rate = +4C), Wind = 3 km/h
      const result = evaluateInversionRisk(10, 14, 3);
      expect(result.isInversion).toBe(true);
      expect(result.severity).toBe('severe');
      expect(result.lapseRate).toBe(4);
      expect(result.safeVentilationWindow).toContain('1:00 PM');
    });

    it('identifies moderate thermal inversions', () => {
      // Surface 12C, Aloft 13.5C (Lapse rate = +1.5C), Wind = 8 km/h
      const result = evaluateInversionRisk(12, 13.5, 8);
      expect(result.isInversion).toBe(true);
      expect(result.severity).toBe('moderate');
      expect(result.lapseRate).toBe(1.5);
    });

    it('identifies normal atmospheric mixing when no thermal inversion is present', () => {
      // Surface 20C, Aloft 15C (Lapse rate = -5C), Wind = 15 km/h
      const result = evaluateInversionRisk(20, 15, 15);
      expect(result.isInversion).toBe(false);
      expect(result.severity).toBe('none');
      expect(result.lapseRate).toBe(-5);
      expect(result.rationale).toContain('Favorable atmospheric dispersion');
    });
  });

  describe('Community Smog Mitigation Pledges & Offsets', () => {
    it('aggregates carbon and particulate reductions from pledge participation', () => {
      const counts = {
        carpool: 10,
        cleanHeating: 5,
        dampMopping: 20,
        zeroWasteBurn: 8,
        vulnerableCheck: 15,
      };

      const result = calculateCommunityOffset(counts);
      // carpool: 10 * 4.8 = 48 CO2, 220g PM2.5
      // cleanHeating: 5 * 12 = 60 CO2, 700g PM2.5
      // dampMopping: 20 * 1.5 = 30 CO2, 1700g PM2.5
      // zeroWasteBurn: 8 * 6.2 = 49.6 CO2, 880g PM2.5
      // vulnerableCheck: 15 * 0.5 = 7.5 CO2, 75g PM2.5
      // Total CO2 = 48 + 60 + 30 + 49.6 + 7.5 = 195.1 kg
      // Total PM2.5 = 220 + 700 + 1700 + 880 + 75 = 3575 g
      expect(result.totalCo2Kg).toBe(195.1);
      expect(result.totalPm25Grams).toBe(3575);
    });

    it('returns zero for empty or invalid pledge counts', () => {
      expect(calculateCommunityOffset({})).toEqual({ totalCo2Kg: 0, totalPm25Grams: 0 });
      expect(calculateCommunityOffset(null)).toEqual({ totalCo2Kg: 0, totalPm25Grams: 0 });
      expect(calculateCommunityOffset(undefined)).toEqual({ totalCo2Kg: 0, totalPm25Grams: 0 });
    });
  });
});
