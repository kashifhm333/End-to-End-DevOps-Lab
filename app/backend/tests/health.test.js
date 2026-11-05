import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

describe('DevOps Starter Backend REST API', () => {
  describe('GET /', () => {
    it('should return service identification metadata with HTTP 200', async () => {
      const res = await request(app).get('/');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/json/);
      expect(res.body).toEqual({
        success: true,
        name: 'DevOps Starter API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          health: '/api/health'
        }
      });
    });
  });

  describe('GET /api/health', () => {
    it('should return HTTP 200 with healthy status and dynamic telemetry', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/json/);

      // Verify all required fields exist
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('service', 'devops-starter-backend');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');

      // Verify timestamp is a valid ISO date string
      const parsedDate = new Date(res.body.timestamp);
      expect(parsedDate.toISOString()).toBe(res.body.timestamp);

      // Verify uptime is a non-negative number
      expect(typeof res.body.uptime).toBe('number');
      expect(res.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Invalid routes handling', () => {
    it('should return HTTP 404 with structured JSON for nonexistent endpoints', async () => {
      const res = await request(app).get('/api/non-existent-route');

      expect(res.status).toBe(404);
      expect(res.headers['content-type']).toMatch(/json/);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.status).toBe(404);
      expect(res.body.error.message).toContain('Route not found');
    });
  });

  describe('Security and Headers', () => {
    it('should not expose x-powered-by header', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });

    it('should include helmet security headers', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBeDefined();
    });
  });
});

