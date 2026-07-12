import { verifyAndDecodeToken, parseCookies } from '../session.js';
import { readContentFile, writeContentFile, CONTENT_FILES, type ContentFileKey } from '../_github-api.js';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');

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
    return res.status(401).json({ error: 'Unauthorized: No active session' });
  }

  const token = verifyAndDecodeToken(session, session_secret);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
  }

  const { file } = req.query;
  if (!file || !CONTENT_FILES[file as ContentFileKey]) {
    return res.status(400).json({ error: `Missing or invalid file parameter. Must be one of: ${Object.keys(CONTENT_FILES).join(', ')}` });
  }

  try {
    if (req.method === 'GET') {
      const { data, sha } = await readContentFile(token, file as ContentFileKey);
      return res.status(200).json({ data, sha });
    } else if (req.method === 'PUT') {
      const { data, sha, message } = req.body;
      if (!data) {
        return res.status(400).json({ error: 'Missing data field in body' });
      }
      if (!sha) {
        return res.status(400).json({ error: 'Missing sha field in body. Git conflict protection requires the current file SHA.' });
      }

      const commitMessage = message || `Update ${file} via Portfolio CMS`;
      const newSha = await writeContentFile(token, file as ContentFileKey, data, sha, commitMessage);
      return res.status(200).json({ ok: true, sha: newSha });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error(`Content Handler Error [${req.method} ${file}]:`, error);
    return res.status(500).json({ error: error.message || 'Failed to sync content with GitHub' });
  }
}
