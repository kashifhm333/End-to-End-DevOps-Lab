import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Validates and parses environment variables.
 * Ensures the application fails fast if required configurations are invalid.
 */
function validateConfig() {
  const rawPort = process.env.PORT || '5000';
  const port = parseInt(rawPort, 10);

  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT configuration: "${rawPort}". Must be a number between 1 and 65535.`);
  }

  const validEnvironments = ['development', 'production', 'test'];
  const nodeEnv = process.env.NODE_ENV || 'development';

  if (!validEnvironments.includes(nodeEnv)) {
    throw new Error(`Invalid NODE_ENV configuration: "${nodeEnv}". Must be one of: ${validEnvironments.join(', ')}.`);
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/devops_starter';

  return Object.freeze({
    PORT: port,
    NODE_ENV: nodeEnv,
    FRONTEND_URL: frontendUrl,
    MONGODB_URI: mongodbUri,
    SERVICE_NAME: 'devops-starter-backend',
    VERSION: '1.0.0'
  });
}

export const config = validateConfig();
export default config;

