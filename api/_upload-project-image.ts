import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('FATAL: JWT_SECRET environment variable is not set.');

const MAX_SIZE_BYTES = 2.8 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Authenticate
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization required' });
  }

  try {
    jwt.verify(authHeader.slice(7), JWT_SECRET as string);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { dataUrl, mimeType } = req.body;
  if (!dataUrl || !mimeType) {
    return res.status(400).json({ error: 'dataUrl and mimeType are required' });
  }

  if (!ALLOWED_TYPES.includes(mimeType)) {
    return res.status(400).json({ error: 'Only JPEG, PNG, WebP, or GIF images are allowed' });
  }

  const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;

  if (Buffer.byteLength(base64Data, 'base64') > MAX_SIZE_BYTES) {
    return res.status(413).json({ error: 'Image too large. Maximum size is 2MB.' });
  }

  // We return the data URL directly since we store base64 in database fields.
  // This avoids requiring external Blob storage (S3/Vercel Blob) and keeps Neon Postgres as the single source of truth.
  return res.status(200).json({ imageUrl: dataUrl, message: 'Image uploaded successfully' });
}
