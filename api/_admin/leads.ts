import { verifyAndDecodeToken, parseCookies } from '../_session.js';
import { getDbPool } from '../_db.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');

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

  try {
    // Resolve user from GitHub token
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Portfolio-CMS',
      },
    });

    if (!userRes.ok) {
      throw new Error(`GitHub API error: ${userRes.statusText}`);
    }

    const userData = await userRes.json() as any;
    const username = userData.login.toLowerCase();

    const pool = getDbPool();

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Lead ID is required' });
      }

      const result = await pool.query(
        'SELECT profile_data FROM users_portfolios WHERE username = $1',
        [username]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }

      const profile = result.rows[0].profile_data || {};
      if (profile.leads) {
        profile.leads = profile.leads.filter((l: any) => l.id !== id);
      }

      await pool.query(
        'UPDATE users_portfolios SET profile_data = $1 WHERE username = $2',
        [JSON.stringify(profile), username]
      );

      return res.status(200).json({ ok: true });
    } else if (req.method === 'GET') {
      const result = await pool.query(
        'SELECT profile_data FROM users_portfolios WHERE username = $1',
        [username]
      );

      if (result.rows.length === 0) {
        return res.status(200).json({ leads: [] });
      }

      return res.status(200).json({ leads: result.rows[0].profile_data?.leads || [] });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Leads endpoint error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
