import mongoose from 'mongoose';
import config from './config.js';

/**
 * Returns human-readable status of the MongoDB connection.
 * @returns {'connected' | 'connecting' | 'disconnected' | 'disconnecting'}
 */
export const getDatabaseStatus = () => {
  const readyState = mongoose.connection.readyState;
  switch (readyState) {
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'disconnected';
  }
};

/**
 * Establishes connection to MongoDB database.
 * Designed to be resilient: does not terminate process if MongoDB is temporarily unavailable.
 */
export const connectDatabase = async () => {
  if (config.NODE_ENV === 'test') {
    return;
  }

  try {
    console.log(`[Database] Connecting to MongoDB at ${config.MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@')}...`);
    
    await mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log('[Database] MongoDB connection established successfully');
  } catch (err) {
    console.warn(`[Database] MongoDB connection failed: ${err.message}. Backend will continue in degraded mode.`);
  }
};

// Connection event listeners for observability
mongoose.connection.on('connected', () => {
  console.log('[Database] MongoDB state: connected');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] MongoDB error event:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('[Database] MongoDB state: disconnected');
});

/**
 * Gracefully closes the MongoDB connection.
 */
export const disconnectDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[Database] MongoDB disconnected cleanly');
  }
};

export default {
  connectDatabase,
  disconnectDatabase,
  getDatabaseStatus
};

