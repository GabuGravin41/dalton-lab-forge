import { getDbPool } from './_db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// Max 2MB avatar upload (base64 encoded, so ~2.7MB raw string)
const MAX_SIZE_BYTES = 2.8 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET is not set.' });
  }

  // Authenticate
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization required' });
  }

  let decoded: any;
  try {
    decoded = jwt.verify(authHeader.slice(7), JWT_SECRET as string);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { dataUrl, mimeType } = req.body;
  if (dataUrl === "") {
    try {
      const pool = getDbPool();
      await pool.query(
        `UPDATE users_portfolios
         SET profile_data = jsonb_set(profile_data, '{avatarUrl}', '""'::jsonb)
         WHERE username = $1`,
        [decoded.username]
      );
      return res.status(200).json({ avatarUrl: "", message: 'Avatar removed successfully' });
    } catch (error: any) {
      console.error('Avatar remove error:', error);
      return res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  if (!dataUrl || !mimeType) {
    return res.status(400).json({ error: 'dataUrl and mimeType are required' });
  }

  if (!ALLOWED_TYPES.includes(mimeType)) {
    return res.status(400).json({ error: 'Only JPEG, PNG, WebP, or GIF images are allowed' });
  }

  // Strip the data URL prefix to get raw base64
  const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;

  if (Buffer.byteLength(base64Data, 'base64') > MAX_SIZE_BYTES) {
    return res.status(413).json({ error: 'Image too large. Maximum size is 2MB.' });
  }

  try {
    const pool = getDbPool();
    // Store the full data URL in profile_data.avatarUrl
    await pool.query(
      `UPDATE users_portfolios
       SET profile_data = jsonb_set(profile_data, '{avatarUrl}', $1::jsonb)
       WHERE username = $2`,
      [JSON.stringify(dataUrl), decoded.username]
    );

    return res.status(200).json({ avatarUrl: dataUrl, message: 'Avatar updated successfully' });
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
