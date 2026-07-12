import axios from 'axios';

/**
 * Extracts a user-friendly error message from an Axios error,
 * matching the backend Response<T> shape with fallback for network errors.
 */
export function getErrorMessage(
  error: any,
  tErrors: (key: string) => string
): string {
  if (!axios.isAxiosError(error)) {
    return tErrors('generic');
  }

  // Network / CORS issues
  if (error.message === 'Network Error' || !error.response) {
    return tErrors('network');
  }

  const data = error.response.data;
  if (data) {
    // Check for standard errors array in Response<T>
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0];
    }
    // Check for single error string
    if (typeof data.errors === 'string') {
      return data.errors;
    }
    // Check for general message field
    if (typeof data.message === 'string') {
      return data.message;
    }
  }

  return tErrors('generic');
}
