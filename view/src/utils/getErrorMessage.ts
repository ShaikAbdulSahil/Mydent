/**
 * Extract a user-friendly error message from an Axios error or generic error.
 *
 * Priority:
 * 1. error.response.data.message  (server-provided)
 * 2. error._friendlyMessage       (set by axios interceptor)
 * 3. Fallback string
 */
export function getErrorMessage(error: any, fallback = 'Something went wrong. Please try again.'): string {
    if (!error) return fallback;

    // Server-provided message (most specific)
    const serverMsg = error?.response?.data?.message;
    if (serverMsg) {
        if (Array.isArray(serverMsg)) return serverMsg.join('. ');
        if (typeof serverMsg === 'string') return serverMsg;
    }

    // Friendly message added by axios interceptor
    if (error._friendlyMessage) return error._friendlyMessage;

    // Axios timeout
    if (error.code === 'ECONNABORTED') {
        return 'Request timed out. Please check your connection and try again.';
    }

    // No network response
    if (error.message === 'Network Error' || !error.response) {
        return 'Unable to connect. Please check your internet connection.';
    }

    return fallback;
}
