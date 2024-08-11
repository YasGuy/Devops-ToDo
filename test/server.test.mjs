import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';

describe('Basic Server Tests', () => {
  it('should return OK for health check', async () => {
    const res = await request(app).get('/health');
    expect(res.status).to.equal(200);
    expect(res.text).to.equal('OK');
  });

  it('should return metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).to.equal(200);
    expect(res.headers['content-type']).to.match(/text\/plain/);
    expect(res.text).to.include('app_up');
  });

  it('should simulate failure', async () => {
    const res = await request(app).get('/fail');
    expect(res.status).to.equal(500);
    expect(res.text).to.equal('Simulated failure');
  });
});
