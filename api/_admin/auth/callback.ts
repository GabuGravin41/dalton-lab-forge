import { signToken, parseCookies } from '../../_session.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, state } = req.query;
  const cookies = parseCookies(req.headers.cookie);
  const storedState = cookies.kio_oauth_state;

  if (!state || state !== storedState) {
    return res.status(400).send('OAuth state mismatch. Potential CSRF attack.');
  }

  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;
  const session_secret = process.env.SESSION_SECRET;

  if (!client_id || !client_secret || !session_secret) {
    return res.status(500).json({ error: 'OAuth environment variables GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, or SESSION_SECRET are not configured on the backend.' });
  }

  try {
    // Exchange the authorization code for a GitHub token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code,
      }),
    });

    const tokenData = (await tokenRes.json()) as any;
    if (!tokenData.access_token) {
      return res.status(400).json({ error: tokenData.error_description || 'Failed to exchange OAuth code' });
    }

    const signedToken = signToken(tokenData.access_token, session_secret);
    
    // Clear oauth state cookie and set the signed session cookie
    res.setHeader('Set-Cookie', [
      `kio_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`,
      `kio_session=${signedToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800; Secure`
    ]);

    // Redirect user back to Admin Page
    res.writeHead(302, { Location: '/admin' });
    res.end();
  } catch (error: any) {
    console.error('OAuth Callback Error:', error);
    return res.status(500).send(`OAuth callback error: ${error.message}`);
  }
}
