const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function getApiUrl(): string {
  // In the browser, rely on the Next.js rewrite (dev) or the production proxy
  // (Caddy) so the API stays on the same origin as the page. This keeps the
  // session cookie first-party and fixes the cross-hostname disconnect loop.
  if (typeof window !== 'undefined') {
    return '/api';
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
