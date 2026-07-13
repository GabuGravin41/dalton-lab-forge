import { verifyAndDecodeToken, parseCookies } from '../_session.js';
import { uploadBinaryFile } from '../_github-api.js';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session_secret = process.env.SESSION_SECRET;
  if (!session_secret) {
    return res.status(500).json({ error: 'SESSION_SECRET environment variable is missing on the server.' });
  }

  const cookies = parseCookies(req.headers.cookie);
  const session = cookies.kio_session;

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: No active session' });
  }

  const token = verifyAndDecodeToken(session, session_secret);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
  }

  const { path, content, message } = req.body;
  if (!path) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }
  if (!content) {
    return res.status(400).json({ error: 'Missing content parameter (Base64 file data)' });
  }

  try {
    const commitMessage = message || `Upload file ${path} via Portfolio CMS`;
    const result = await uploadBinaryFile(token, path, content, commitMessage);
    return res.status(200).json({ ok: true, result });
  } catch (error: any) {
    console.error(`Binary Upload Error [${path}]:`, error);
    return res.status(500).json({ error: error.message || 'Failed to upload binary file to GitHub' });
  }
}
