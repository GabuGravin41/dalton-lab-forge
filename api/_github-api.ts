export const CONTENT_FILES = {
  profile: "src/data/profile.json",
  projects: "src/data/projects.json",
  papers: "src/data/papers.json",
} as const;

export type ContentFileKey = keyof typeof CONTENT_FILES;

const REPO = process.env.GITHUB_REPO || "GabuGravin41/dalton-lab-forge";
const BRANCH = process.env.GITHUB_BRANCH || "main";

/**
 * Fetch a JSON content file from GitHub repository
 */
export async function readContentFile(token: string, fileKey: ContentFileKey) {
  const path = CONTENT_FILES[fileKey];
  if (!path) throw new Error(`Unknown file key: ${fileKey}`);

  const url = `https://api.github.com/repos/${REPO}/contents/${path}?ref=${BRANCH}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Portfolio-CMS",
    }
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`File not found: ${path}`);
    }
    throw new Error(`GitHub fetch failed: ${res.statusText}`);
  }

  const fileData = (await res.json()) as any;
  
  // GitHub returns base64 encoded content
  const base64 = fileData.content.replace(/\s/g, "");
  const decoded = Buffer.from(base64, "base64").toString("utf8");
  return { data: JSON.parse(decoded), sha: fileData.sha };
}

/**
 * Commit a JSON content file to GitHub repository
 */
export async function writeContentFile(
  token: string,
  fileKey: ContentFileKey,
  data: any,
  sha: string,
  message: string
) {
  const path = CONTENT_FILES[fileKey];
  if (!path) throw new Error(`Unknown file key: ${fileKey}`);

  const content = Buffer.from(JSON.stringify(data, null, 2) + "\n").toString("base64");

  const url = `https://api.github.com/repos/${REPO}/contents/${path}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "User-Agent": "Portfolio-CMS",
    },
    body: JSON.stringify({
      message,
      content,
      sha,
      branch: BRANCH,
    })
  });

  if (!res.ok) {
    const errorDetails = (await res.json().catch(() => ({ message: res.statusText }))) as any;
    throw new Error(errorDetails.message || `GitHub write failed: ${res.statusText}`);
  }

  const result = (await res.json()) as any;
  return result.content.sha;
}

/**
 * Upload a binary file (e.g. PDF) to GitHub, checking for existing SHA first if needed
 */
export async function uploadBinaryFile(
  token: string,
  path: string,
  base64Data: string,
  message: string
) {
  // First attempt to get the SHA if the file already exists
  const getUrl = `https://api.github.com/repos/${REPO}/contents/${path}?ref=${BRANCH}`;
  let sha: string | undefined = undefined;

  try {
    const getRes = await fetch(getUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Portfolio-CMS",
      }
    });
    if (getRes.ok) {
      const fileData = (await getRes.json()) as any;
      sha = fileData.sha;
    }
  } catch (err) {
    // If it fails (e.g. 404), file is new, proceed with sha = undefined
    console.log(`Checking existing file at ${path} failed or not found, assuming new file.`);
  }

  const url = `https://api.github.com/repos/${REPO}/contents/${path}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "User-Agent": "Portfolio-CMS",
    },
    body: JSON.stringify({
      message,
      content: base64Data,
      sha,
      branch: BRANCH,
    })
  });

  if (!res.ok) {
    const errorDetails = (await res.json().catch(() => ({ message: res.statusText }))) as any;
    throw new Error(errorDetails.message || `GitHub binary upload failed: ${res.statusText}`);
  }

  return await res.json();
}
