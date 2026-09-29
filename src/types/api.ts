/** Standard success envelope returned by the BlastX backend. */
export interface ApiEnvelope<T> {
  status: 'success';
  data: T;
}

/** Standard error envelope returned by the BlastX backend. */
export interface ApiErrorEnvelope {
  status: 'error';
  message: string;
}

export type ApiResponse<T> = ApiEnvelope<T> | ApiErrorEnvelope;

/** Shape of `data` for paginated list endpoints (e.g. GET /tournaments). */
export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}
