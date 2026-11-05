import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server.js';
import Item from '../src/models/item.model.js';

describe('MongoDB Items REST API', () => {
  describe('When MongoDB is disconnected', () => {
    beforeEach(() => {
      // Ensure readyState is 0 (disconnected)
      vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(0);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('GET /api/items should return 503 Service Unavailable', async () => {
      const res = await request(app).get('/api/items');

      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Database unavailable');
    });

    it('POST /api/items should return 503 Service Unavailable', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({ title: 'Test Record' });

      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Database unavailable');
    });

    it('DELETE /api/items/:id should return 503 Service Unavailable', async () => {
      const res = await request(app).delete('/api/items/507f1f77bcf86cd799439011');

      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Database unavailable');
    });
  });

  describe('When MongoDB is connected', () => {
    beforeEach(() => {
      // Mock readyState as 1 (connected)
      vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(1);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('POST /api/items should reject requests missing title with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({ description: 'No title' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Title is required');
    });

    it('DELETE /api/items/:id should reject invalid ObjectId format with 400 Bad Request', async () => {
      const res = await request(app).delete('/api/items/not-a-valid-id');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Invalid item ID format');
    });

    it('GET /api/items should return 200 with list of records', async () => {
      const mockItems = [
        {
          _id: '507f1f77bcf86cd799439011',
          title: 'Docker Deployment Note',
          description: 'Testing containerization',
          createdAt: new Date().toISOString()
        }
      ];

      vi.spyOn(Item, 'find').mockReturnValue({
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue(mockItems)
        })
      });

      const res = await request(app).get('/api/items');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].title).toBe('Docker Deployment Note');
    });

    it('POST /api/items should create and return 201 with new record', async () => {
      const mockNewItem = {
        _id: '507f1f77bcf86cd799439012',
        title: 'Kubernetes Pod Config',
        description: 'Testing k8s rollout',
        createdAt: new Date().toISOString()
      };

      vi.spyOn(Item, 'create').mockResolvedValue(mockNewItem);

      const res = await request(app)
        .post('/api/items')
        .send({ title: 'Kubernetes Pod Config', description: 'Testing k8s rollout' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Kubernetes Pod Config');
    });

    it('DELETE /api/items/:id should return 200 on successful deletion', async () => {
      vi.spyOn(Item, 'findByIdAndDelete').mockResolvedValue({
        _id: '507f1f77bcf86cd799439011'
      });

      const res = await request(app).delete('/api/items/507f1f77bcf86cd799439011');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Record deleted');
    });

    it('DELETE /api/items/:id should return 404 if item does not exist', async () => {
      vi.spyOn(Item, 'findByIdAndDelete').mockResolvedValue(null);

      const res = await request(app).delete('/api/items/507f1f77bcf86cd799439011');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Item not found');
    });
  });
});
