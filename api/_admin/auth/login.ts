import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client_id = process.env.GITHUB_CLIENT_ID;
  if (!client_id) {
    return res.status(500).json({ error: 'GITHUB_CLIENT_ID environment variable is missing' });
  }

  const state = crypto.randomUUID();
  
  // Set security cookie for state
  res.setHeader('Set-Cookie', `kio_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600; Secure`);

  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo&state=${state}`;
  
  res.writeHead(302, { Location: redirectUrl });
  res.end();
}
