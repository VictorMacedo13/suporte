import { headers } from 'next/headers';
import { API_BASE_URL } from './api-client';

export interface ServerSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'agent' | 'customer';
  };
  session: {
    id: string;
    expiresAt: string;
  };
}

/**
 * Recupera a sessao em Server Components, encaminhando o cookie do request.
 */
export async function getServerSession(): Promise<ServerSession | null> {
  const h = await headers();
  const cookie = h.get('cookie') ?? '';
  if (!cookie) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
      headers: { cookie },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const body = (await res.json()) as ServerSession | null;
    return body ?? null;
  } catch {
    return null;
  }
}
