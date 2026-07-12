import authHandler from './auth.js';
import portfolioHandler from './portfolio.js';
import saveHandler from './save.js';
import sessionHandler from './session.js';
import generateHandler from './generate.js';
import exploreHandler from './explore.js';
import uploadAvatarHandler from './upload-avatar.js';
import uploadProjectImageHandler from './upload-project-image.js';
import contactHandler from './contact.js';

// Admin handlers
import adminContentHandler from './admin/content.js';
import adminMeHandler from './admin/me.js';
import adminUploadHandler from './admin/upload.js';
import adminLoginHandler from './admin/auth/login.js';
import adminCallbackHandler from './admin/auth/callback.js';
import adminLogoutHandler from './admin/auth/logout.js';

export default async function handler(req: any, res: any) {
  // Parse the URL pathname
  const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace(/\/$/, ''); // Remove trailing slash

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

      // Admin paths
      case '/api/admin/content':
        return await adminContentHandler(req, res);
      case '/api/admin/me':
        return await adminMeHandler(req, res);
      case '/api/admin/upload':
        return await adminUploadHandler(req, res);
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
