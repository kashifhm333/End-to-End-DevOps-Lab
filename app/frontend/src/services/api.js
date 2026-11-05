/**
 * Centralized API client service.
 * Handles network requests, latency measurement, and standardized error normalization.
 */

// Fallback to localhost:5000 if VITE_API_URL is not set
const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '');

/**
 * Returns the currently configured API base URL.
 * @returns {string}
 */
export const getApiBaseUrl = () => API_BASE_URL;

/**
 * Executes a GET /api/health request to check backend status.
 * Measures response latency in milliseconds and handles network errors gracefully.
 *
 * @param {AbortSignal} [signal] Optional AbortSignal to cancel in-flight requests.
 * @returns {Promise<{
 *   success: boolean;
 *   status: number;
 *   responseTimeMs: number;
 *   data: object | null;
 *   error: string | null;
 * }>}
 */
export const checkHealth = async (signal) => {
  const endpoint = `${API_BASE_URL}/api/health`;
  const startTime = performance.now();

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      },
      signal
    });

    const endTime = performance.now();
    const responseTimeMs = Math.round(endTime - startTime);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText || 'Request failed'}`;
      try {
        const errorData = await response.json();
        if (errorData?.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {
        // Fallback to HTTP status text if response is not JSON
      }

      return {
        success: false,
        status: response.status,
        responseTimeMs,
        data: null,
        error: errorMessage
      };
    }

    const data = await response.json();
    return {
      success: true,
      status: response.status,
      responseTimeMs,
      data,
      error: null
    };
  } catch (err) {
    const endTime = performance.now();
    const responseTimeMs = Math.round(endTime - startTime);

    if (err.name === 'AbortError') {
      return {
        success: false,
        status: 0,
        responseTimeMs,
        data: null,
        error: 'Request aborted'
      };
    }

    return {
      success: false,
      status: 0,
      responseTimeMs,
      data: null,
      error: `Network error: Failed to connect to backend at ${API_BASE_URL}. Ensure the service is running and accessible.`
    };
  }
};

