
const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);


  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include' // Envía y guarda cookies
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail ?? `Error HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export interface User {
  id: string;
  username: string;
  role: 'student' | 'teacher' | 'admin';
  active: boolean;
}



export async function loginRequest(username: string, password: string) {
  return apiRequest<User>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}