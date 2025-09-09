export interface ApiError {
  type: 'network' | 'auth' | 'rate_limit' | 'server' | 'unknown';
  message: string;
  retryable: boolean;
  retryAfter?: number;
}

export const handleApiError = (error: any, response?: Response): ApiError => {
  // Network errors
  if (!response) {
    return {
      type: 'network',
      message: 'Network connection failed. Please check your internet connection.',
      retryable: true
    };
  }

  // Rate limiting
  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
    return {
      type: 'rate_limit',
      message: `Too many requests. Please wait ${Math.ceil(retryAfter / 60)} minutes before trying again.`,
      retryable: true,
      retryAfter: retryAfter * 1000
    };
  }

  // Authentication errors
  if (response.status === 401 || response.status === 403) {
    return {
      type: 'auth',
      message: 'Authentication failed. Please log in again.',
      retryable: false
    };
  }

  // Server errors
  if (response.status >= 500) {
    return {
      type: 'server',
      message: 'AI service is temporarily unavailable. Please try again later.',
      retryable: true
    };
  }

  // Client errors
  if (response.status >= 400) {
    return {
      type: 'server',
      message: 'Invalid request. Please try rephrasing your message.',
      retryable: false
    };
  }

  return {
    type: 'unknown',
    message: 'An unexpected error occurred. Please try again.',
    retryable: true
  };
};