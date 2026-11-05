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
 * Executes a GET /api/health request to check backend and database status.
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

/**
 * Retrieves records from MongoDB via GET /api/items.
 *
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ success: boolean; data: Array<object>; error: string | null }>}
 */
export const fetchItems = async (signal) => {
  const endpoint = `${API_BASE_URL}/api/items`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      },
      signal
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        data: [],
        error: result?.error?.message || `HTTP ${response.status}: Failed to fetch records`
      };
    }

    return {
      success: true,
      data: result.data || [],
      error: null
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { success: false, data: [], error: 'Request aborted' };
    }
    return {
      success: false,
      data: [],
      error: `Network error: Failed to reach ${endpoint}`
    };
  }
};

/**
 * Creates a new record in MongoDB via POST /api/items.
 *
 * @param {{ title: string; description?: string }} payload
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ success: boolean; data: object | null; error: string | null }>}
 */
export const createItem = async (payload, signal) => {
  const endpoint = `${API_BASE_URL}/api/items`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload),
      signal
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: result?.error?.message || `HTTP ${response.status}: Failed to create record`
      };
    }

    return {
      success: true,
      data: result.data,
      error: null
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { success: false, data: null, error: 'Request aborted' };
    }
    return {
      success: false,
      data: null,
      error: `Network error: Failed to reach ${endpoint}`
    };
  }
};

/**
 * Deletes a record from MongoDB via DELETE /api/items/:id.
 *
 * @param {string} id
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ success: boolean; error: string | null }>}
 */
export const deleteItem = async (id, signal) => {
  const endpoint = `${API_BASE_URL}/api/items/${id}`;

  try {
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json'
      },
      signal
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result?.error?.message || `HTTP ${response.status}: Failed to delete record`
      };
    }

    return {
      success: true,
      error: null
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { success: false, error: 'Request aborted' };
    }
    return {
      success: false,
      error: `Network error: Failed to reach ${endpoint}`
    };
  }
};
