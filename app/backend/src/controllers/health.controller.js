import config from '../config/config.js';
import { getDatabaseStatus } from '../config/db.js';

/**
 * Controller for root service identification endpoint.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getRoot = (req, res) => {
  res.status(200).json({
    success: true,
    name: 'DevOps Starter API',
    version: config.VERSION,
    status: 'running',
    endpoints: {
      health: '/api/health',
      items: '/api/items'
    }
  });
};

/**
 * Controller for application health check endpoint.
 * Returns dynamic timestamp, real process uptime, database status, and service health.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getHealth = (req, res) => {
  const uptimeSeconds = parseFloat(process.uptime().toFixed(2));
  const dbStatus = getDatabaseStatus();

  res.status(200).json({
    success: true,
    status: 'healthy',
    service: config.SERVICE_NAME,
    timestamp: new Date().toISOString(),
    uptime: uptimeSeconds,
    database: {
      status: dbStatus,
      type: 'mongodb'
    }
  });
};
