import { getDbPool } from './db.js';
import profileData from '../src/data/profile.json' assert { type: 'json' };
import projectsData from '../src/data/projects.json' assert { type: 'json' };
import papersData from '../src/data/papers.json' assert { type: 'json' };

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.query;

  // Fallback to Dalton's profile if no user is specified
  if (!username || username === 'dalton') {
    return res.status(200).json({
      username: 'dalton',
      profile: profileData,
      projects: projectsData,
      papers: papersData
    });
  }

  const cleanUsername = username.trim().toLowerCase();

  try {
    const pool = getDbPool();
    const result = await pool.query(
      'SELECT profile_data, projects_data, papers_data, view_count FROM users_portfolios WHERE username = $1',
      [cleanUsername]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Portfolio for user '${cleanUsername}' not found` });
    }

    const row = result.rows[0];

    // Fire-and-forget view count increment — never blocks the response
    pool.query(
      'UPDATE users_portfolios SET view_count = COALESCE(view_count, 0) + 1 WHERE username = $1',
      [cleanUsername]
    ).catch(() => {/* ignore silently */});

    // Cache publicly for 60s at the CDN edge, stale-while-revalidate for 30s more
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

    return res.status(200).json({
      username: cleanUsername,
      profile: row.profile_data,
      projects: row.projects_data,
      papers: row.papers_data,
      views: (row.view_count || 0) + 1
    });
  } catch (error: any) {
    console.error('Portfolio handler error:', error);
    // Graceful fallback for local development if database variables are missing
    if (!process.env.DATABASE_URL) {
      return res.status(200).json({
        username: 'dalton',
        profile: profileData,
        projects: projectsData,
        papers: papersData,
        localDev: true
      });
    }
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}

