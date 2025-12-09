/**
 * API Response Types
 *
 * Standard response format from IPC communication
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Helper to unwrap API response or throw error
 */
export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new ApiError(response.error || 'Unknown error occurred');
  }

  if (response.data === undefined) {
    throw new ApiError('No data returned from API');
  }

  return response.data;
}
