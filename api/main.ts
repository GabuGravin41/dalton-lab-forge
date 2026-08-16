import authHandler from './_auth.js';
import portfolioHandler from './_portfolio.js';
import saveHandler from './_save.js';
import sessionHandler from './_session.js';
import generateHandler from './_generate.js';
import exploreHandler from './_explore.js';
import uploadAvatarHandler from './_upload-avatar.js';
import uploadProjectImageHandler from './_upload-project-image.js';
import contactHandler from './_contact.js';
import chatHandler from './_chat.js';
import exportHandler from './_export.js';
import liveStatsHandler from './_live-stats.js';

// Admin handlers
import adminContentHandler from './_admin/content.js';
import adminMeHandler from './_admin/me.js';
import adminUploadHandler from './_admin/upload.js';
import adminLeadsHandler from './_admin/leads.js';
import adminLoginHandler from './_admin/auth/login.js';
import adminCallbackHandler from './_admin/auth/callback.js';
import adminLogoutHandler from './_admin/auth/logout.js';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse the URL pathname or get from query string (if rewritten by Vercel)
  const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const pathParam = url.searchParams.get('path');
  const pathname = pathParam ? `/api/${pathParam}`.replace(/\/$/, '') : url.pathname.replace(/\/$/, '');

  // Manually populate req.query from URL search parameters to guarantee compatibility across Vercel environments
  const queryObj: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    queryObj[key] = value;
  });
  req.query = { ...req.query, ...queryObj };

  try {
    switch (pathname) {
      case '/api/auth':
        return await authHandler(req, res);
      case '/api/portfolio':
        return await portfolioHandler(req, res);
      case '/api/save':
        return await saveHandler(req, res);
      case '/api/session':
        return await sessionHandler(req, res);
      case '/api/generate':
        return await generateHandler(req, res);
      case '/api/explore':
        return await exploreHandler(req, res);
      case '/api/upload-avatar':
        return await uploadAvatarHandler(req, res);
      case '/api/upload-project-image':
        return await uploadProjectImageHandler(req, res);
      case '/api/contact':
        return await contactHandler(req, res);
      case '/api/chat':
        return await chatHandler(req, res);
      case '/api/export':
        return await exportHandler(req, res);
      case '/api/live-stats':
        return await liveStatsHandler(req, res);

      // GitHub Proxy to avoid rate limits (403 Forbidden)
      case '/api/github-stats': {
        const username = url.searchParams.get('username');
        if (!username) {
          return res.status(400).json({ error: 'Username query parameter is required' });
        }
        try {
          const headers: Record<string, string> = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Portfolio-GitHub-Stats-Proxy'
          };
          if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
          }

          const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
          if (!userRes.ok) {
            throw new Error(`GitHub user stats returned status ${userRes.status}`);
          }
          const userData = await userRes.json();

          const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=15&sort=updated`, { headers });
          let reposData = [];
          if (reposRes.ok) {
            reposData = await reposRes.json();
          }

          res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600, stale-while-revalidate=300');
          return res.status(200).json({ user: userData, repos: reposData });
        } catch (err: any) {
          console.error(`GitHub Stats Proxy error for @${username}:`, err);
          return res.status(500).json({ error: err.message || 'Failed to fetch GitHub stats' });
        }
      }

      // Admin paths
      case '/api/admin/content':
        return await adminContentHandler(req, res);
      case '/api/admin/me':
        return await adminMeHandler(req, res);
      case '/api/admin/upload':
        return await adminUploadHandler(req, res);
      case '/api/admin/leads':
        return await adminLeadsHandler(req, res);
      case '/api/admin/auth/login':
        return await adminLoginHandler(req, res);
      case '/api/admin/auth/callback':
        return await adminCallbackHandler(req, res);
      case '/api/admin/auth/logout':
        return await adminLogoutHandler(req, res);

      default:
        return res.status(404).json({ error: `API route not found: ${pathname}` });
    }
  } catch (err: any) {
    console.error(`Error in router for path ${pathname}:`, err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
