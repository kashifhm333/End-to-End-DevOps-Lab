import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';

const router = Router();

// GET /health - Health check endpoint
router.get('/health', getHealth);

export default router;