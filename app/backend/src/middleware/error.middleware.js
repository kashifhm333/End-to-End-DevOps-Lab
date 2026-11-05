import config from '../config/config.js';

/**
 * 404 Not Found Middleware
 * Intercepts requests that do not match any defined routes and returns standard JSON.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
      status: 404
    }
  });
};

/**
 * Centralized Error Handling Middleware
 * Ensures all unexpected server errors return clean JSON without exposing sensitive data in production.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const isDevelopment = config.NODE_ENV === 'development';

  // In production, mask 500 error messages to prevent data/stack leaks
  const message = (config.NODE_ENV === 'production' && statusCode === 500)
    ? 'Internal Server Error'
    : err.message || 'An unexpected error occurred';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      status: statusCode,
      ...(isDevelopment && { stack: err.stack })
    }
  });
};

