import { getDbPool } from './_db.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const pool = getDbPool();
    const result = await pool.query(
      `SELECT username, profile_data, COALESCE(view_count, 0) as view_count, created_at
       FROM users_portfolios
       ORDER BY view_count DESC, created_at DESC
       LIMIT 50`
    );

    const portfolios = result.rows.map((row: any) => {
      const p = row.profile_data;
      return {
        username: row.username,
        name: p.name || row.username,
        roles: p.roles || [],
        bio: p.bio || '',
        theme: p.theme || 'indigo',
        views: row.view_count,
        createdAt: row.created_at
      };
    });

    // Cache at CDN for 2 minutes
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=60');
    return res.status(200).json({ portfolios });
  } catch (error: any) {
    console.error('Explore handler error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
