import { getDbPool } from './_db.js';
import { profileData, projectsData, papersData } from './_defaults.js';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

async function addDirectoryToZip(
  zip: any, 
  dirPath: string, 
  rootPath: string, 
  profile: any, 
  projects: any, 
  papers: any
) {
  const items = await fs.promises.readdir(dirPath, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    const relativePath = path.relative(rootPath, fullPath).replace(/\\/g, '/');

    // Skip unwanted workspace directories/files
    if (
      relativePath.startsWith('node_modules') ||
      relativePath.startsWith('.git') ||
      relativePath.startsWith('dist') ||
      relativePath.startsWith('.gemini') ||
      relativePath.startsWith('tmp') ||
      relativePath.startsWith('.agents') ||
      relativePath.includes('package-lock.json') ||
      relativePath.includes('.env') ||
      relativePath.startsWith('api/') // Exclude serverless API files to keep static build clean
    ) {
      continue;
    }

    if (item.isDirectory()) {
      await addDirectoryToZip(zip, fullPath, rootPath, profile, projects, papers);
    } else {
      if (relativePath === 'src/data/profile.json') {
        zip.file(relativePath, JSON.stringify(profile, null, 2));
      } else if (relativePath === 'src/data/projects.json') {
        zip.file(relativePath, JSON.stringify(projects, null, 2));
      } else if (relativePath === 'src/data/papers.json') {
        zip.file(relativePath, JSON.stringify(papers, null, 2));
      } else {
        const fileContent = await fs.promises.readFile(fullPath);
        zip.file(relativePath, fileContent);
      }
    }
  }
}

export default async function handler(req: any, res: any) {
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
  if (!username) {
    return res.status(400).json({ error: 'Username query parameter is required.' });
  }

  try {
    let profile = profileData;
    let projects = projectsData;
    let papers = papersData;

    const cleanUsername = username.trim().toLowerCase();

    if (cleanUsername !== 'dalton' && process.env.DATABASE_URL) {
      const pool = getDbPool();
      const dbResult = await pool.query(
        'SELECT profile_data, projects_data, papers_data FROM users_portfolios WHERE username = $1',
        [cleanUsername]
      );
      if (dbResult.rows.length > 0) {
        const row = dbResult.rows[0];
        profile = row.profile_data || {};
        projects = row.projects_data || [];
        papers = row.papers_data || [];
      }
    }

    if (profile.aiSettings) {
      profile.aiSettings = {
        provider: profile.aiSettings.provider,
        openrouterModel: profile.aiSettings.openrouterModel,
        openrouterKey: "",
        geminiKey: ""
      };
    }

    // Generate zip archive
    const zip = new JSZip();
    const rootPath = process.cwd();

    await addDirectoryToZip(zip, rootPath, rootPath, profile, projects, papers);

    const content = await zip.generateAsync({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=portfolio-${cleanUsername}.zip`);
    res.setHeader('Content-Length', content.length);
    
    return res.status(200).send(content);
  } catch (error: any) {
    console.error('Export ZIP error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate project archive.' });
  }
}
