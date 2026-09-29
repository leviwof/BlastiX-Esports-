import { describe, it, expect, beforeEach } from 'vitest';
import { AxiosHeaders, type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { attachAuth, unwrapResponse, handleError, getToken, setToken, clearToken } from './apiClient';

function makeConfig(): InternalAxiosRequestConfig {
  return { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
}

describe('apiClient interceptors', () => {
  beforeEach(() => clearToken());

  it('unwraps a success envelope to its data payload', () => {
    const res = { data: { status: 'success', data: { id: '1', title: 'Cup' } } } as AxiosResponse;
    const out = unwrapResponse(res);
    expect(out.data).toEqual({ id: '1', title: 'Cup' });
  });

  it('throws with the backend message on an error envelope', () => {
    const res = { data: { status: 'error', message: 'Nope' } } as AxiosResponse;
    expect(() => unwrapResponse(res)).toThrow('Nope');
  });

  it('attaches a Bearer header when a token is stored', () => {
    setToken('tok_123');
    const out = attachAuth(makeConfig());
    expect(AxiosHeaders.from(out.headers).get('Authorization')).toBe('Bearer tok_123');
  });

  it('does not attach a Bearer header when no token is stored', () => {
    const out = attachAuth(makeConfig());
    expect(AxiosHeaders.from(out.headers).get('Authorization')).toBeFalsy();
  });

  it('clears the stored token on a 401 and rejects with the message', async () => {
    setToken('tok_123');
    const err = {
      response: { status: 401, data: { status: 'error', message: 'Unauthorized' } },
      message: 'Request failed with status code 401',
      isAxiosError: true,
    } as AxiosError;
    await expect(handleError(err)).rejects.toThrow('Unauthorized');
    expect(getToken()).toBeNull();
  });
});
