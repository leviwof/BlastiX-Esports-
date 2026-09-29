/**
 * Normalized API error used across the app. The backend returns
 * `{ status: 'error', message }` with a matching HTTP status code; this wraps
 * that (or a transport failure) into a single typed error with a user-safe
 * message so components never surface raw Axios internals.
 */
export class ApiError extends Error {
  /** HTTP status code, or undefined for network/timeout failures. */
  readonly status?: number;
  /** No response was received (DNS, offline, CORS, connection refused). */
  readonly isNetwork: boolean;
  /** The request exceeded its timeout. */
  readonly isTimeout: boolean;

  constructor(
    message: string,
    opts: { status?: number; isNetwork?: boolean; isTimeout?: boolean } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = opts.status;
    this.isNetwork = opts.isNetwork ?? false;
    this.isTimeout = opts.isTimeout ?? false;
  }

  /** 401 — session missing/expired/invalid. Handled distinctly from other errors. */
  get isAuthError(): boolean {
    return this.status === 401;
  }

  /** 403 — authenticated but not allowed (e.g. non-admin). */
  get isForbidden(): boolean {
    return this.status === 403;
  }
}

/** A user-safe fallback message for a status code when the backend gives none. */
export function friendlyMessage(
  status: number | undefined,
  { isNetwork = false, isTimeout = false }: { isNetwork?: boolean; isTimeout?: boolean } = {},
): string {
  if (isTimeout) return 'The request timed out. Please try again.';
  if (isNetwork || status === undefined) {
    return 'Unable to reach the server. Check your connection and try again.';
  }
  switch (status) {
    case 400:
      return 'The request was invalid. Please check your input and try again.';
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This action conflicts with the current state. Refresh and try again.';
    case 422:
      return 'Some of the information provided was invalid.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    default:
      return status >= 500
        ? 'The server ran into a problem. Please try again in a moment.'
        : 'Something went wrong. Please try again.';
  }
}

/**
 * Extract a user-safe message from any thrown value. API rejections are already
 * {@link ApiError}s with a friendly message; anything else falls back to a
 * generic line so raw internals never surface to the user.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Please try again.';
}
