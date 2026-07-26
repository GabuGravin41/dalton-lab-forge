import { getDbPool } from './_db.js';
import { profileData, projectsData, papersData } from './_defaults.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

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

  const { username, domain } = req.query;

  // Fallback to Dalton's profile if no user is specified and no domain is specified
  if ((!username && !domain) || username === 'dalton') {
    return res.status(200).json({
      username: 'dalton',
      profile: profileData,
      projects: projectsData,
      papers: papersData
    });
  }

  try {
    const pool = getDbPool();
    let result;
    let cleanUsername = '';

    if (domain) {
      const cleanDomain = domain.trim().toLowerCase().replace(/^www\./, '');
      result = await pool.query(
        "SELECT username, profile_data, projects_data, papers_data, view_count FROM users_portfolios WHERE profile_data->>'customDomain' = $1 OR profile_data->>'customDomain' = $2",
        [cleanDomain, `www.${cleanDomain}`]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: `Portfolio for domain '${cleanDomain}' not found` });
      }
      cleanUsername = result.rows[0].username;
    } else {
      cleanUsername = username.trim().toLowerCase();
      result = await pool.query(
        'SELECT profile_data, projects_data, papers_data, view_count FROM users_portfolios WHERE username = $1',
        [cleanUsername]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: `Portfolio for user '${cleanUsername}' not found` });
      }
    }

    const row = result.rows[0];

    // Fire-and-forget view count increment — never blocks the response
    pool.query(
      'UPDATE users_portfolios SET view_count = COALESCE(view_count, 0) + 1 WHERE username = $1',
      [cleanUsername]
    ).catch(() => {/* ignore silently */});

    // Validate if the request is from the owner of this portfolio
    let isOwner = false;
    const authHeader = req.headers['authorization'];
    if (authHeader?.startsWith('Bearer ') && JWT_SECRET) {
      try {
        const token = authHeader.slice(7);
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded && decoded.username === cleanUsername) {
          isOwner = true;
        }
      } catch (e) {
        // Ignored, treated as not owner
      }
    }

    const profile = row.profile_data || {};
    if (!isOwner && profile.aiSettings) {
      // Strip sensitive API keys from public visitor response
      profile.aiSettings = {
        provider: profile.aiSettings.provider,
        openrouterModel: profile.aiSettings.openrouterModel,
        openrouterKey: profile.aiSettings.openrouterKey ? "configured" : "",
        geminiKey: profile.aiSettings.geminiKey ? "configured" : ""
      };
    }

    // Cache publicly for 60s at the CDN edge, stale-while-revalidate for 30s more
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

    return res.status(200).json({
      username: cleanUsername,
      profile,
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

