import config from '../config/config.js';

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
      health: '/api/health'
    }
  });
};

/**
 * Controller for application health check endpoint.
 * Returns dynamic timestamp, real process uptime, and service status.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getHealth = (req, res) => {
  const uptimeSeconds = parseFloat(process.uptime().toFixed(2));

  res.status(200).json({
    success: true,
    status: 'healthy',
    service: config.SERVICE_NAME,
    timestamp: new Date().toISOString(),
    uptime: uptimeSeconds
  });
};

