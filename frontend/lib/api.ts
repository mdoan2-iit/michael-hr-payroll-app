const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {}

export async function api<T = any>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers }, cache: 'no-store' });
  } catch {
    throw new ApiError(`Can't reach the API at ${BASE}. Check that the backend is running.`);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = Array.isArray(body.message) ? body.message.join('. ') : body.message;
    throw new ApiError(msg || `Request failed (${res.status})`);
  }
  return res.json();
}

export const post = <T = any>(p: string, body?: unknown) => api<T>(p, { method: 'POST', body: JSON.stringify(body ?? {}) });
export const patch = <T = any>(p: string, body: unknown) => api<T>(p, { method: 'PATCH', body: JSON.stringify(body) });
export const del = <T = any>(p: string) => api<T>(p, { method: 'DELETE' });
export const fullName = (e?: { firstName: string; lastName: string } | null) => (e ? `${e.firstName} ${e.lastName}` : '-');
