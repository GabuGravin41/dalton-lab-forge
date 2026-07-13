import jwt from 'jsonwebtoken';
import { getDbPool } from './_db.js';

const JWT_SECRET = process.env.JWT_SECRET;

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

  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET is not set.' });
  }

  // Extract JWT token from headers
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Access token missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { username } = decoded;

    const { profile, projects, papers } = req.body;

    if (!profile || !projects || !papers) {
      return res.status(400).json({ error: 'Profile, projects, and papers data structures are required' });
    }

    const pool = getDbPool();
    const result = await pool.query(
      `UPDATE users_portfolios 
       SET profile_data = $1, projects_data = $2, papers_data = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE username = $4`,
      [JSON.stringify(profile), JSON.stringify(projects), JSON.stringify(papers), username]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Portfolio record for user '${username}' not found` });
    }

    return res.status(200).json({ message: 'Portfolio published successfully!' });
  } catch (error: any) {
    console.error('Save handler error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Session has expired or is invalid. Please log in again.' });
    }
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
