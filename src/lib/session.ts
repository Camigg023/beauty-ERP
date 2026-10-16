export const SESSION_COOKIE = 'beauty_erp_session';
const enc = new TextEncoder();

function getSessionSecret() {
  return process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET;
}

function toB64Url(bytes: Uint8Array) {
  let s = '';
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64Url(str: string) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (str.length % 4)) % 4);
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

function hmacKey(secret: string) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function createSessionToken(email: string): Promise<string> {
  const secret = getSessionSecret();
  if (!secret) throw new Error('BETTER_AUTH_SECRET o AUTH_SECRET no configurado');
  const payload = toB64Url(enc.encode(JSON.stringify({ sub: email, exp: Date.now() + 7 * 24 * 3600 * 1000 })));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(payload));
  return `${payload}.${toB64Url(new Uint8Array(sig))}`;
}

export async function verifySessionToken(token?: string): Promise<boolean> {
  const secret = getSessionSecret();
  if (!secret || !token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  try {
    const ok = await crypto.subtle.verify('HMAC', await hmacKey(secret), fromB64Url(sig), enc.encode(payload));
    if (!ok) return false;
    const { exp } = JSON.parse(new TextDecoder().decode(fromB64Url(payload)));
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}