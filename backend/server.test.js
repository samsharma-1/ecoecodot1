process.env.DB_PATH = ':memory:';
process.env.RATE_LIMIT_PER_MINUTE = '1000';

const request = require('supertest');
const {
  app,
  calculateEmission,
  summarizeActivities,
  validateActivity,
} = require('./server');

describe('EcoTrack AI Backend API', () => {
  it('calculates emissions by category', () => {
    expect(calculateEmission('transport', 10)).toBeCloseTo(3.0);
    expect(calculateEmission('energy', 10)).toBeCloseTo(3.6);
    expect(calculateEmission('diet', 2)).toBeCloseTo(5.0);
    expect(calculateEmission('waste', 4)).toBeCloseTo(3.0);
  });

  it('validates activity payloads', () => {
    expect(validateActivity({ category: 'transport', amount: 5, date: '2026-06-08' }).error).toBeUndefined();
    expect(validateActivity({ category: 'unknown', amount: 5, date: '2026-06-08' }).error).toBeTruthy();
    expect(validateActivity({ category: 'transport', amount: -1, date: '2026-06-08' }).error).toBeTruthy();
  });

  it('logs activity and returns dashboard summary', async () => {
    const create = await request(app)
      .post('/api/activities')
      .send({
        category: 'transport',
        amount: 10,
        date: '2026-06-08',
      });

    expect(create.statusCode).toEqual(201);
    expect(create.body.co2e_added).toBeCloseTo(3.0);

    const summary = await request(app).get('/api/summary');
    expect(summary.statusCode).toEqual(200);
    expect(summary.body.insights.totalEmissions).toBeGreaterThanOrEqual(3);
    expect(summary.body.insights.topRecommendation).toContain('trip');
  });

  it('rejects invalid activities', async () => {
    const res = await request(app)
      .post('/api/activities')
      .send({ category: 'transport', amount: 0, date: '2026-06-08' });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBeTruthy();
  });

  it('returns deterministic chat guidance without an API key', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'How can I improve my score?' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.reply).toContain('carbon score');
  });

  it('summarizes projected emissions and achievements', () => {
    const insights = summarizeActivities(
      [
        { category: 'transport', amount: 10, co2e: 3, date: '2026-06-01' },
        { category: 'energy', amount: 10, co2e: 3.6, date: '2026-06-02' },
        { category: 'diet', amount: 2, co2e: 5, date: '2026-06-03' },
      ],
      [
        { date: '2026-06-01', total_CO2e: 3 },
        { date: '2026-06-02', total_CO2e: 3.6 },
        { date: '2026-06-03', total_CO2e: 5 },
      ]
    );

    expect(insights.monthlyProjection).toBeGreaterThan(100);
    expect(insights.achievements).toContain('Eco Starter');
  });
});
