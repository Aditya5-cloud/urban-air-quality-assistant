const request = require('supertest');
const app = require('../app');

describe('Weather & Air Quality Real-Time API Endpoint', () => {
  jest.setTimeout(15000);

  it('GET /api/weather-aqi returns 200 with atmospheric data for valid city', async () => {
    const res = await request(app).get('/api/weather-aqi?city=Delhi');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('atmospheric');

    const { atmospheric } = res.body;
    expect(atmospheric).toHaveProperty('city');
    expect(atmospheric).toHaveProperty('airQuality');
    expect(atmospheric.airQuality).toHaveProperty('pm2_5');
    expect(atmospheric.airQuality).toHaveProperty('us_aqi');
    expect(atmospheric.airQuality).toHaveProperty('category');
    expect(atmospheric).toHaveProperty('weather');
    expect(atmospheric.weather).toHaveProperty('temperature');
    expect(atmospheric.weather).toHaveProperty('condition');
    expect(atmospheric.weather).toHaveProperty('inversionRisk');
  });

  it('GET /api/weather-aqi returns 422 when city parameter is missing', async () => {
    const res = await request(app).get('/api/weather-aqi');

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    const cityError = res.body.error.details.find((d) => d.path === 'city');
    expect(cityError).toBeDefined();
  });

  it('GET /api/weather-aqi returns 422 when city is too short', async () => {
    const res = await request(app).get('/api/weather-aqi?city=X');

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
