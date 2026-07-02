const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const PRIVATE_HOST =
  /^(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})$/;

function getApiUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_API_URL;
  const { protocol, hostname } = window.location;
  if (PRIVATE_HOST.test(hostname)) {
    return `${protocol}//${hostname}:3001/api`;
  }
  return DEFAULT_API_URL;
}

export async function apiFetch(path: string, options?: RequestInit) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const headers = new Headers(options?.headers);

  if (!headers.has('Content-Type') && !(options?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${getApiUrl()}${normalizedPath}`, {
    ...options,
    credentials: 'include',
    headers,
  });
}

export async function apiUploadMedia(file: File, tenantId: string): Promise<Response> {
  const formData = new FormData();
  formData.append('file', file);
  const query = new URLSearchParams({ tenantId });
  return apiFetch(`/media/upload?${query}`, { method: 'POST', body: formData });
}

export { getApiUrl };
