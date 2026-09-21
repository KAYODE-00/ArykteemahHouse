// Lightweight signed-cookie admin session. Uses Web Crypto (crypto.subtle),
// which is available both in Next.js middleware (Edge runtime) and in
// regular Node API routes, so the same code verifies a session everywhere.

export const ADMIN_COOKIE_NAME = 'arh_admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      'ADMIN_SESSION_SECRET is not set. Add a long random string to your environment.'
    );
  }
  return secret;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return toBase64Url(new Uint8Array(sig));
}

export async function createAdminSessionCookieValue(): Promise<string> {
  const payload = `admin.${Date.now()}`;
  const signature = await hmac(payload, getSecret());
  return `${payload}.${signature}`;
}

export async function isValidAdminSessionCookie(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  const lastDot = value.lastIndexOf('.');
  if (lastDot === -1) return false;
  const payload = value.slice(0, lastDot);
  const signature = value.slice(lastDot + 1);
  if (!payload.startsWith('admin.')) return false;
  try {
    const expected = await hmac(payload, getSecret());
    if (expected.length !== signature.length) return false;
    // constant-time-ish compare
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    if (diff !== 0) return false;
    const issuedAt = Number(payload.split('.')[1]);
    if (!issuedAt) return false;
    return Date.now() - issuedAt < SESSION_MAX_AGE_SECONDS * 1000;
  } catch {
    return false;
  }
}

export const ADMIN_COOKIE_MAX_AGE = SESSION_MAX_AGE_SECONDS;

export function checkAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error('ADMIN_PASSWORD is not set in the environment.');
  }
  return password === expected;
}
