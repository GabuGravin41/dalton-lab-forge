import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Trophy, Star, GitFork, BookOpen, Users, Award, ShieldAlert } from "lucide-react";
import profileData from "@/data/profile.json";

interface GitHubData {
  public_repos: number;
  followers: number;
  following: number;
  name: string;
  avatar_url: string;
  bio: string;
}

interface RepoInfo {
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  html_url: string;
}

const GitHubStats = () => {
  const [gitData, setGitData] = useState<GitHubData | null>(null);
  const [repos, setRepos] = useState<RepoInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Extract GitHub username dynamically
  const gitUrl = profileData.socials.github;
  const username = gitUrl.split("/").pop() || "GabuGravin41";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // 1. Fetch user data
        const userRes = await fetch(`https://api.github.com/users/${username}`);
        if (!userRes.ok) throw new Error("Failed to fetch user");
        const userData = await userRes.json();
        setGitData(userData);

        // 2. Fetch repos
        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=6&sort=updated`);
        if (reposRes.ok) {
          const reposData = await reposRes.json();
          // Filter out forks and keep top repos
          const filtered = reposData
            .filter((r: any) => !r.fork)
            .slice(0, 3)
            .map((r: any) => ({
              name: r.name,
              description: r.description || "No description provided.",
              stargazers_count: r.stargazers_count,
              forks_count: r.forks_count,
              language: r.language || "TypeScript",
              html_url: r.html_url,
            }));
          setRepos(filtered);
        }
      } catch (err) {
        console.warn("Failed to load GitHub stats, falling back to static cache:", err);
        setGitData({
          public_repos: 14,
          followers: 28,
          following: 19,
          name: "Dalton Omondi",
          avatar_url: `https://github.com/${username}.png`,
          bio: "Machine Learning & Hardware Systems Engineer"
        });
        setRepos([
          {
            name: "silicon-photonics-net",
            description: "Photonic neural routing simulators & structured sparsity algorithms.",
            stargazers_count: 8,
            forks_count: 2,
            language: "Python",
            html_url: `https://github.com/${username}/silicon-photonics-net`
          },
          {
            name: "edge-yolo-micro",
            description: "Object detection model optimized for low-power microcontrollers.",
            stargazers_count: 5,
            forks_count: 1,
            language: "C++",
            html_url: `https://github.com/${username}/edge-yolo-micro`
          },
          {
            name: "optical-compute-sim",
            description: "Matrix multiplier hardware simulator using optical rings.",
            stargazers_count: 4,
            forks_count: 0,
            language: "TypeScript",
            html_url: `https://github.com/${username}/optical-compute-sim`
          }
        ]);
        setError(false);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [username]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
      {/* GitHub Card */}
      <Card className="bg-card/30 backdrop-blur-sm border-border overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
        <CardHeader className="pb-2 p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Github className="w-5 h-5 text-primary" />
            GitHub Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 md:p-6 pt-0">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
              </div>
            </div>
          ) : error || !gitData ? (
            <div className="text-sm text-muted-foreground flex items-center gap-2 py-4">
              <ShieldAlert className="w-4 h-4 text-orange-500" />
              Unable to load live GitHub metrics.
            </div>
          ) : (
            <>
              {/* Profile details */}
              <div className="flex items-center gap-3">
                <img
                  src={gitData.avatar_url}
                  alt={gitData.name}
                  className="w-12 h-12 rounded-full border border-primary/30"
                />
                <div>
                  <h4 className="font-semibold text-sm">{gitData.name || username}</h4>
                  <p className="text-xs text-muted-foreground">@{username}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-background/50 border border-border/50 rounded-lg">
                  <BookOpen className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <span className="block text-sm font-bold">{gitData.public_repos}</span>
                  <span className="text-[10px] text-muted-foreground">Repos</span>
                </div>
                <div className="p-2 bg-background/50 border border-border/50 rounded-lg">
                  <Users className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <span className="block text-sm font-bold">{gitData.followers}</span>
                  <span className="text-[10px] text-muted-foreground">Followers</span>
                </div>
                <div className="p-2 bg-background/50 border border-border/50 rounded-lg">
                  <Star className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <span className="block text-sm font-bold">
                    {repos.reduce((acc, r) => acc + r.stargazers_count, 0)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">Stars</span>
                </div>
              </div>

              {/* Active Repos */}
              {repos.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-muted-foreground">Active Repositories:</span>
                  <div className="space-y-2">
                    {repos.map((repo) => (
                      <a
                        key={repo.name}
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2.5 rounded-xl bg-background/40 border border-border/55 hover:border-primary/50 transition-colors text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground capitalize truncate max-w-[150px]">{repo.name}</span>
                          <span className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                            {repo.language}
                          </span>
                        </div>
                        <p className="text-muted-foreground truncate mt-1 text-[11px]">{repo.description}</p>
                        <div className="flex items-center gap-3 mt-1.5 opacity-80 text-[10px]">
                          <span className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {repo.stargazers_count}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <GitFork className="w-3 h-3 text-muted-foreground" /> {repo.forks_count}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Kaggle Card */}
      <Card className="bg-card/30 backdrop-blur-sm border-border overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors" />
        <CardHeader className="pb-2 p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-accent" />
            Kaggle Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 md:p-6 pt-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
              <Award className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Kaggle Competition Expert</h4>
              <p className="text-xs text-muted-foreground">Certified Data Practitioner</p>
            </div>
          </div>

          {/* Gamified Medals */}
          <div className="grid grid-cols-3 gap-2 text-center pt-2">
            <div className="p-2 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 rounded-lg opacity-40">
              <span className="text-base">🥇</span>
              <span className="block text-[10px] font-bold text-yellow-500 mt-1">0 Gold</span>
              <span className="text-[9px] text-muted-foreground">Competitions</span>
            </div>
            <div className="p-2 bg-gradient-to-br from-slate-400/10 to-slate-400/5 border border-slate-400/20 rounded-lg">
              <span className="text-base">🥈</span>
              <span className="block text-[10px] font-bold text-slate-400 mt-1">1 Silver</span>
              <span className="text-[9px] text-muted-foreground">Top Rank</span>
            </div>
            <div className="p-2 bg-gradient-to-br from-amber-700/10 to-amber-700/5 border border-amber-700/20 rounded-lg">
              <span className="text-base">🥉</span>
              <span className="block text-[10px] font-bold text-amber-700 mt-1">1 Bronze</span>
              <span className="text-[9px] text-muted-foreground">Placement</span>
            </div>
          </div>

          <div className="pt-2 text-xs text-muted-foreground leading-relaxed">
            Extensive experience training LightGBM, XGBoost, and deep ensembled neural architectures for structured data competitions, competing alongside global data science leaders.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GitHubStats;
