import { verifyAndDecodeToken, parseCookies } from '../session.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session_secret = process.env.SESSION_SECRET;
  if (!session_secret) {
    return res.status(500).json({ error: 'SESSION_SECRET environment variable is missing on the server.' });
  }

  const cookies = parseCookies(req.headers.cookie);
  const session = cookies.kio_session;

  if (!session) {
    return res.status(200).json({ authenticated: false });
  }

  const token = verifyAndDecodeToken(session, session_secret);
  if (!token) {
    return res.status(401).json({ authenticated: false, error: 'Invalid or expired session' });
  }

  try {
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

    const userData = (await userRes.json()) as any;
    
    // Check if the environment also specifies GITHUB_REPO. If so, return it for front-end visual feedback
    const targetRepo = process.env.GITHUB_REPO || "GabuGravin41/dalton-lab-forge";

    return res.status(200).json({
      authenticated: true,
      login: userData.login,
      avatar_url: userData.avatar_url,
      name: userData.name,
      targetRepo,
    });
  } catch (error: any) {
    console.error('Get User Profile Error:', error);
    return res.status(500).json({ authenticated: false, error: error.message });
  }
}
