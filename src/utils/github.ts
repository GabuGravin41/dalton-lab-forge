export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

/**
 * Fetch a file from GitHub repository
 */
export const fetchFileFromGitHub = async (config: GitHubConfig, path: string) => {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `token ${config.token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  // Clean base64 string and decode it (handling UTF-8)
  const base64 = data.content.replace(/\s/g, "");
  const decodedContent = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );

  return {
    sha: data.sha,
    content: decodedContent,
  };
};

/**
 * Commit text content to GitHub repository
 */
export const commitFileToGitHub = async (
  config: GitHubConfig,
  path: string,
  content: string,
  commitMessage: string
) => {
  // 1. Fetch file to get current SHA if it exists
  const existing = await fetchFileFromGitHub(config, path);
  const sha = existing?.sha;

  // 2. Encode to base64 supporting UTF-8 characters
  const base64Content = btoa(
    encodeURIComponent(content).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );

  const body: { message: string; content: string; branch: string; sha?: string } = {
    message: commitMessage,
    content: base64Content,
    branch: config.branch,
  };

  if (sha) {
    body.sha = sha;
  }

  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${config.token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorDetails.message || `Failed to commit file: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Upload a binary file (like a PDF) to GitHub from browser using Base64 string
 */
export const uploadBinaryFileToGitHub = async (
  config: GitHubConfig,
  path: string,
  base64Data: string, // Pure base64 without data:application/pdf;base64, prefix
  commitMessage: string
) => {
  // 1. Fetch file to get current SHA if it exists
  const existing = await fetchFileFromGitHub(config, path);
  const sha = existing?.sha;

  const body: { message: string; content: string; branch: string; sha?: string } = {
    message: commitMessage,
    content: base64Data,
    branch: config.branch,
  };

  if (sha) {
    body.sha = sha;
  }

  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${config.token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorDetails.message || `Failed to upload binary file: ${response.statusText}`);
  }

  return await response.json();
};
