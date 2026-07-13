import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDbPool } from './_db.js';
import { profileData, projectsData, papersData } from './_defaults.js';

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

  const { username, passcode, seedProfile, seedProjects, seedPapers } = req.body;

  if (!username || !passcode) {
    return res.status(400).json({ error: 'Username and passcode are required' });
  }

  const cleanUsername = username.trim().toLowerCase();
  if (cleanUsername.length < 3 || cleanUsername.length > 20 || !/^[a-z0-9_-]+$/.test(cleanUsername)) {
    return res.status(400).json({ error: 'Username must be 3-20 characters and contain only alphanumeric characters, underscores, or dashes.' });
  }

  if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set.');
    return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET is not set. Please add it in Vercel project settings.' });
  }

  try {
    const pool = getDbPool();
    const queryResult = await pool.query(
      'SELECT id, password_hash FROM users_portfolios WHERE username = $1',
      [cleanUsername]
    );

    if (queryResult.rows.length === 0) {
      // 1. Register new user
      const passwordHash = await bcrypt.hash(passcode, 10);
      
      // Use cloned seed data if provided, otherwise fall back to Dalton's defaults
      const capitalized = cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);
      const baseProfile = seedProfile && typeof seedProfile === 'object' ? seedProfile : profileData;

      // ALWAYS reset name and socials so cloners never inherit someone else's identity
      const customProfile = {
        ...baseProfile,
        name: capitalized,
        socials: {
          github: `https://github.com/${cleanUsername}`,
          linkedin: '',
          email: `${cleanUsername}@example.com`,
          twitter: '',
          instagram: '',
        }
      };

      const initialProjects = Array.isArray(seedProjects) ? seedProjects : projectsData;
      const initialPapers = Array.isArray(seedPapers) ? seedPapers : papersData;

      await pool.query(
        `INSERT INTO users_portfolios (username, password_hash, profile_data, projects_data, papers_data) 
         VALUES ($1, $2, $3, $4, $5)`,
        [cleanUsername, passwordHash, JSON.stringify(customProfile), JSON.stringify(initialProjects), JSON.stringify(initialPapers)]
      );

      const token = jwt.sign({ username: cleanUsername }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        message: 'Registration successful',
        username: cleanUsername,
        token
      });
    } else {
      // 2. Login existing user
      const user = queryResult.rows[0];
      const valid = await bcrypt.compare(passcode, user.password_hash);
      
      if (!valid) {
        return res.status(401).json({ error: 'Invalid passcode for this username' });
      }

      const token = jwt.sign({ username: cleanUsername }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(200).json({
        message: 'Login successful',
        username: cleanUsername,
        token
      });
    }
  } catch (error: any) {
    console.error('Auth handler error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
