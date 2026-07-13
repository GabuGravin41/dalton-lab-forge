import crypto from 'crypto';

/**
 * Sign a token using HMAC-SHA256 with the given secret.
 * Returns the base64url-encoded token concatenated with the signature.
 */
export function signToken(token: string, secret: string): string {
  const encoded = Buffer.from(token).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

/**
 * Verify signature and decode the original token.
 * Returns null if the signature is invalid.
 */
export function verifyAndDecodeToken(cookieValue: string, secret: string): string | null {
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return null;
  const [encoded, signature] = parts;
  const expectedSignature = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  if (signature !== expectedSignature) return null;
  return Buffer.from(encoded, "base64url").toString("utf8");
}

/**
 * Parse standard request Cookie header.
 */
export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    list[parts.shift()!.trim()] = decodeURIComponent(parts.join('='));
  });
  return list;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const session_secret = process.env.SESSION_SECRET;
  if (!session_secret) {
    return res.status(500).json({ error: 'SESSION_SECRET environment variable is missing on the server.' });
  }

  const cookies = parseCookies(req.headers.cookie);
  const session = cookies.kio_session;

  if (!session) {
    return res.status(200).json({ authenticated: false });
  }

  const token = verifyAndDecodeToken(session, session_secret);
  if (!token) {
    return res.status(401).json({ authenticated: false, error: 'Invalid or expired session' });
  }

  return res.status(200).json({ authenticated: true });
}
