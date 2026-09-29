import axios, {
  AxiosHeaders,
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { env } from './env';
import type { ApiErrorEnvelope } from '../types/api';
import { ApiError, friendlyMessage } from './apiError';
import { isDevToken } from '@/features/auth/devAuth';

const TOKEN_KEY = 'blastix_admin_token';

/**
 * Callback invoked when the API reports 401 (invalid/expired session). The auth
 * layer registers this to clear session state; keeping it as a registered
 * handler avoids a circular dependency between the client and the auth store,
 * and keeps navigation out of the transport layer (no redirect loops).
 */
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable — ignore */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable — ignore */
  }
}

/** Request interceptor: attach the admin JWT as a Bearer token when present. */
export function attachAuth(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const token = getToken();
  if (token) {
    config.headers = AxiosHeaders.from(config.headers);
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
}

/**
 * Response interceptor: unwrap the `{ status, data }` envelope so callers get
 * the payload directly. An `{ status: 'error' }` body (returned with a 2xx)
 * is turned into a thrown Error.
 */
export function unwrapResponse(response: AxiosResponse): AxiosResponse {
  const body = response.data;
  if (body && typeof body === 'object' && 'status' in body) {
    if (body.status === 'success') {
      response.data = body.data;
      return response;
    }
    if (body.status === 'error') {
      throw new Error((body as ApiErrorEnvelope).message || 'Request failed');
    }
  }
  return response;
}

/**
 * Error interceptor: on 401 clear the token and notify the auth layer; always
 * reject with a typed {@link ApiError} carrying the status and a user-safe
 * message (the backend's own message when present, else a friendly fallback).
 */
export function handleError(error: AxiosError): Promise<never> {
  const status = error.response?.status;
  const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
  const isNetwork = !error.response;

  if (status === 401) {
    // A DEV-ONLY bypass session isn't backed by a real token, so a 401 from the
    // backend is expected and must not tear down the local UI-review session.
    // In production `isDevToken` is always false, so this is normal 401 handling.
    if (!isDevToken(getToken())) {
      clearToken();
      onUnauthorized?.();
    }
  }

  const data = error.response?.data as ApiErrorEnvelope | undefined;
  const backendMessage =
    data && typeof data === 'object' && typeof data.message === 'string' ? data.message : undefined;
  const message = backendMessage ?? friendlyMessage(status, { isNetwork, isTimeout });

  return Promise.reject(new ApiError(message, { status, isNetwork, isTimeout }));
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(attachAuth);
apiClient.interceptors.response.use(unwrapResponse, handleError);
