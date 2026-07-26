import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { Sparkles, Copy, Eye, ArrowRight, Search, Loader2, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface PortfolioCard {
  username: string;
  name: string;
  roles: string[];
  bio: string;
  theme: string;
  views: number;
  createdAt: string;
}

const themeAccents: Record<string, { dot: string; glow: string; badge: string }> = {
  indigo:   { dot: "bg-indigo-500",  glow: "shadow-indigo-500/20",  badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  emerald:  { dot: "bg-emerald-500", glow: "shadow-emerald-500/20", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  rose:     { dot: "bg-rose-500",    glow: "shadow-rose-500/20",    badge: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  cyberpunk:{ dot: "bg-fuchsia-500", glow: "shadow-fuchsia-500/20", badge: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20" },
  steel:    { dot: "bg-slate-400",   glow: "shadow-slate-400/20",   badge: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  "teal-gold": { dot: "bg-teal-500", glow: "shadow-teal-500/20", badge: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
};

const Explore = () => {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState<PortfolioCard[]>([]);
  const [filtered, setFiltered] = useState<PortfolioCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/explore")
      .then(r => r.json())
      .then(data => {
        setPortfolios(data.portfolios || []);
        setFiltered(data.portfolios || []);
      })
      .catch(() => toast.error("Could not load portfolios."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(
      !q
        ? portfolios
        : portfolios.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.username.toLowerCase().includes(q) ||
            p.roles.some(r => r.toLowerCase().includes(q)) ||
            p.bio.toLowerCase().includes(q)
          )
    );
  }, [query, portfolios]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-24 md:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* Hero header */}
          <div className="text-center space-y-4 py-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-semibold mb-2">
              <Users className="w-3.5 h-3.5" /> Community Portfolios
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Explore Portfolios
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
              Discover what others have built. Click any portfolio to view it live, or clone it as your starting template.
            </p>

            {/* Search */}
            <div className="relative max-w-sm mx-auto mt-4">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, role, or skill..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-card/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          {/* Stats bar */}
          {!loading && (
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-primary" />{portfolios.length} portfolios</span>
              <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-accent" />{portfolios.reduce((s, p) => s + (p.views || 0), 0).toLocaleString()} total views</span>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm">Loading portfolios...</p>
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-20 space-y-4">
              <div className="text-5xl">🔍</div>
              <h3 className="text-lg font-bold">{query ? "No results found" : "No portfolios yet!"}</h3>
              <p className="text-sm text-muted-foreground">
                {query ? `Try a different search term.` : `Be the first to forge your portfolio.`}
              </p>
              <Link to="/forge">
                <Button className="mt-2 bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  <Sparkles className="w-4 h-4 mr-2" /> Forge Yours Free
                </Button>
              </Link>
            </div>
          )}

          {/* Grid */}
          {!loading && filtered.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((p) => {
                const accent = themeAccents[p.theme] || themeAccents.indigo;
                return (
                  <div
                    key={p.username}
                    className={`group relative bg-card/40 backdrop-blur-sm border border-border rounded-2xl p-5 flex flex-col gap-4 hover:border-primary/40 hover:shadow-xl ${accent.glow} transition-all duration-300 cursor-pointer`}
                    onClick={() => navigate(`/u/${p.username}`)}
                  >
                    {/* Theme dot */}
                    <div className={`absolute top-4 right-4 w-2.5 h-2.5 rounded-full ${accent.dot} shadow-sm`} />

                    {/* Avatar initial */}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-extrabold border ${accent.badge} flex-shrink-0`}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-foreground truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">@{p.username}</div>
                      </div>
                    </div>

                    {/* Roles */}
                    {p.roles.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {p.roles.slice(0, 3).map(r => (
                          <span key={r} className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${accent.badge}`}>{r}</span>
                        ))}
                      </div>
                    )}

                    {/* Bio */}
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">{p.bio}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Eye className="w-3 h-3" /> {(p.views || 0).toLocaleString()} views
                      </span>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/forge?clone=${p.username}`}
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 text-[10px] text-primary hover:underline font-semibold"
                        >
                          <Copy className="w-3 h-3" /> Clone
                        </Link>
                        <span className="text-border">•</span>
                        <span className="flex items-center gap-1 text-[10px] text-accent font-semibold">
                          View <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CTA */}
          <div className="text-center pt-8 border-t border-border space-y-4">
            <h3 className="text-lg font-bold">Ready to join?</h3>
            <p className="text-sm text-muted-foreground">Create your own AI-powered portfolio in under 2 minutes.</p>
            <Link to="/forge">
              <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 hover:opacity-90 hover:scale-105 transition-all shadow-lg shadow-primary/20">
                <Sparkles className="w-4 h-4 mr-2" /> Forge My Portfolio Free
              </Button>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Explore;
