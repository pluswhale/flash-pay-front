import { AxiosError } from 'axios'
import type { ApiError } from '../types/api'

/**
 * Extract a human-readable message from any thrown error.
 * Handles: Axios API errors, plain Error, and unknown shapes.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError | undefined

    if (!apiError) return 'Network error. Please check your connection.'

    const { message } = apiError

    if (typeof message === 'string') return message

    // Validation errors: { field: ['msg1', 'msg2'] }
    if (typeof message === 'object') {
      return Object.values(message).flat().join(', ')
    }
  }

  if (error instanceof Error) return error.message

  return 'An unexpected error occurred.'
}

/**
 * Returns the HTTP status code from an Axios error, or null.
 */
export function getStatusCode(error: unknown): number | null {
  if (error instanceof AxiosError) return error.response?.status ?? null
  return null
}

/**
 * Returns true if the error is a 401 Unauthorized response.
 */
export function isUnauthorized(error: unknown): boolean {
  return getStatusCode(error) === 401
}

/**
 * Returns true if the error is a 403 Forbidden response.
 */
export function isForbidden(error: unknown): boolean {
  return getStatusCode(error) === 403
}
