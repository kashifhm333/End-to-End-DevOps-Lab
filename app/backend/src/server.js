import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import config from './config/config.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import healthRoutes from './routes/health.routes.js';
import itemRoutes from './routes/item.routes.js';
import { getRoot } from './controllers/health.controller.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

// Initialize Express application
export const app = express();

// Disable Express fingerprinting
app.disable('x-powered-by');

// Security Headers with Helmet
app.use(helmet());

// CORS Configuration
const allowedOrigins = [
  config.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:30081'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, or same-origin)
      // or matching explicit allowedOrigins or any localhost/127.0.0.1 port
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost(:[0-9]+)?$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1(:[0-9]+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true
  })
);

// Body Parsing
app.use(express.json());

// Root Service Identification Endpoint
app.get('/', getRoot);

// Mount API Routes
app.use('/api', healthRoutes);
app.use('/api', itemRoutes);

// Catch-all 404 handler for undefined routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

// Start server if not running in test mode
let server;
if (process.env.NODE_ENV !== 'test') {
  // Connect to MongoDB
  connectDatabase();

  server = app.listen(config.PORT, () => {
    console.log(`[DevOps Starter Backend] Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
    console.log(`[DevOps Starter Backend] Health check endpoint: http://localhost:${config.PORT}/api/health`);
    console.log(`[DevOps Starter Backend] MongoDB items endpoint: http://localhost:${config.PORT}/api/items`);
  });

  // Graceful shutdown
  const handleShutdown = async (signal) => {
    console.log(`\n[DevOps Starter Backend] ${signal} signal received: closing HTTP server and database connection`);
    await disconnectDatabase();
    if (server) {
      server.close(() => {
        console.log('[DevOps Starter Backend] HTTP server closed cleanly');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

export default app;
