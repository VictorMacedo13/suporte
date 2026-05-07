const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiClientOptions extends RequestInit {
  /** Cookies para SSR (Next server components). */
  cookieHeader?: string;
}

async function request<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.cookieHeader) {
    headers.set('cookie', options.cookieHeader);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const code = (isJson && (body as { code?: string }).code) || 'API_ERROR';
    const message =
      (isJson && (body as { message?: string }).message) || `Erro ${res.status}`;
    throw new ApiError(res.status, code, message, body);
  }

  return body as T;
}

export const apiClient = {
  get: <T>(path: string, opts?: ApiClientOptions) => request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: ApiClientOptions) =>
    request<T>(path, {
      ...opts,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown, opts?: ApiClientOptions) =>
    request<T>(path, {
      ...opts,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string, opts?: ApiClientOptions) =>
    request<T>(path, { ...opts, method: 'DELETE' }),
};

export const API_BASE_URL = API_BASE;
