/**
 * GitHub repository inspector for Portfolio AI Project Importer.
 * Extracts relevant repository metadata and key files without downloading full tarballs.
 */

export interface GitHubRepoAnalysis {
  owner: string;
  repo: string;
  name: string;
  fullName: string;
  description: string;
  homepage: string;
  htmlUrl: string;
  defaultBranch: string;
  topics: string[];
  languages: string[];
  stars: number;
  forks: number;
  license?: string;
  createdAt: string;
  updatedAt: string;
  files: {
    readme?: string;
    packageJson?: Record<string, unknown>;
    requirementsTxt?: string;
    pyprojectToml?: string;
    cargoToml?: string;
    goMod?: string;
    directoryTree: string[];
  };
}

/**
 * Parses a GitHub URL into { owner, repo }.
 * Supports formats like:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo/
 * - github.com/owner/repo
 * - owner/repo
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  if (!url || typeof url !== "string") return null;
  const cleaned = url.trim().replace(/\/+$/, "");

  // Match github.com/owner/repo
  const githubMatch = cleaned.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^/\s]+)\/([^/\s]+)/i);
  if (githubMatch && githubMatch[1] && githubMatch[2]) {
    const owner = githubMatch[1];
    let repo = githubMatch[2];
    if (repo.endsWith(".git")) repo = repo.slice(0, -4);
    return { owner, repo };
  }

  // Match simple owner/repo pattern
  const simpleMatch = cleaned.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (simpleMatch && simpleMatch[1] && simpleMatch[2]) {
    let repo = simpleMatch[2];
    if (repo.endsWith(".git")) repo = repo.slice(0, -4);
    return { owner: simpleMatch[1], repo };
  }

  return null;
}

/**
 * Fetches relevant metadata and key files for a public GitHub repository.
 */
export async function fetchGitHubRepoDetails(
  owner: string,
  repo: string,
): Promise<GitHubRepoAnalysis> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "DevDen-Portfolio-AI-Importer",
  };

  // If a server-side GITHUB_TOKEN exists, attach it to avoid unauthenticated rate limits (60 req/hr)
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  // 1. Fetch main repo details
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers,
    cache: "no-store",
  });

  if (repoRes.status === 404) {
    throw new Error(
      `Repository "${owner}/${repo}" was not found or is private without authorized access.`,
    );
  }

  if (repoRes.status === 403) {
    const rateLimitRemaining = repoRes.headers.get("x-ratelimit-remaining");
    if (rateLimitRemaining === "0") {
      throw new Error(
        "GitHub API rate limit reached. Please wait a moment or configure GITHUB_TOKEN.",
      );
    }
    throw new Error("Access to this repository was forbidden by GitHub API.");
  }

  if (!repoRes.ok) {
    throw new Error(`GitHub API request failed with HTTP ${repoRes.status}.`);
  }

  const repoData = await repoRes.json();
  const defaultBranch = repoData.default_branch || "main";

  // 2. Fetch languages breakdown
  let languagesList: string[] = [];
  try {
    const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
      headers,
      cache: "no-store",
    });
    if (langRes.ok) {
      const langData = (await langRes.json()) as Record<string, number>;
      languagesList = Object.keys(langData).slice(0, 8);
    }
  } catch {
    // Non-fatal if languages fail
  }

  // 3. Helper to fetch raw content of a file
  const fetchRawFile = async (filePath: string, maxLength = 20000): Promise<string | null> => {
    try {
      const res = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${filePath}`,
        {
          headers: { "User-Agent": "DevDen-Portfolio-AI-Importer" },
          cache: "no-store",
        },
      );
      if (res.ok) {
        const text = await res.text();
        return text.length > maxLength ? text.slice(0, maxLength) + "\n...[truncated]" : text;
      }
    } catch {
      // Ignore
    }
    return null;
  };

  // 4. Fetch README
  let readmeText: string | undefined;
  const commonReadmeNames = ["README.md", "readme.md", "README", "readme.markdown"];
  for (const name of commonReadmeNames) {
    const content = await fetchRawFile(name, 25000);
    if (content) {
      readmeText = content;
      break;
    }
  }

  // 5. Fetch package.json
  let packageJsonData: Record<string, unknown> | undefined;
  const packageJsonRaw = await fetchRawFile("package.json", 10000);
  if (packageJsonRaw) {
    try {
      packageJsonData = JSON.parse(packageJsonRaw);
    } catch {
      // Non-fatal
    }
  }

  // 6. Fetch requirements.txt / pyproject.toml / go.mod / Cargo.toml if relevant
  const requirementsTxt = (await fetchRawFile("requirements.txt", 4000)) || undefined;
  const pyprojectToml = (await fetchRawFile("pyproject.toml", 4000)) || undefined;
  const cargoToml = (await fetchRawFile("Cargo.toml", 4000)) || undefined;
  const goMod = (await fetchRawFile("go.mod", 4000)) || undefined;

  // 7. Fetch top-level file and directory tree
  let directoryTree: string[] = [];
  try {
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
      { headers, cache: "no-store" },
    );
    if (treeRes.ok) {
      const treeData = await treeRes.json();
      if (Array.isArray(treeData.tree)) {
        directoryTree = treeData.tree
          .filter(
            (item: { path: string }) =>
              !item.path.startsWith(".git/") &&
              !item.path.includes("node_modules/") &&
              !item.path.includes("dist/") &&
              !item.path.includes(".next/"),
          )
          .map((item: { path: string }) => item.path)
          .slice(0, 45);
      }
    }
  } catch {
    // Non-fatal
  }

  return {
    owner,
    repo,
    name: repoData.name || repo,
    fullName: repoData.full_name || `${owner}/${repo}`,
    description: repoData.description || "",
    homepage: repoData.homepage || "",
    htmlUrl: repoData.html_url || `https://github.com/${owner}/${repo}`,
    defaultBranch,
    topics: Array.isArray(repoData.topics) ? repoData.topics : [],
    languages: languagesList,
    stars: repoData.stargazers_count || 0,
    forks: repoData.forks_count || 0,
    license: repoData.license?.spdx_id || repoData.license?.name,
    createdAt: repoData.created_at || "",
    updatedAt: repoData.updated_at || "",
    files: {
      readme: readmeText,
      packageJson: packageJsonData,
      requirementsTxt,
      pyprojectToml,
      cargoToml,
      goMod,
      directoryTree,
    },
  };
}
