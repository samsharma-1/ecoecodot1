const request = require('supertest');
const app = require('./server');

describe('EcoTrack AI Backend API', () => {
  it('should calculate emissions correctly for transport', async () => {
    const res = await request(app)
      .post('/api/activities')
      .send({
        category: 'transport',
        amount: 10,
        date: '2026-06-08'
      });
      
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('co2e_added');
    expect(res.body.co2e_added).toBeCloseTo(3.0); // 10 miles * 0.30 kg/mi
  });

  it('should calculate emissions correctly for energy', async () => {
    const res = await request(app)
      .post('/api/activities')
      .send({
        category: 'energy',
        amount: 10,
        date: '2026-06-08'
      });
      
    expect(res.statusCode).toEqual(201);
    expect(res.body.co2e_added).toBeCloseTo(3.6); // 10 kWh * 0.36 kg/kWh
  });
});
