import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';

const router = Router();

// GET /api/health - Health check endpoint
router.get('/health', getHealth);

export default router;

