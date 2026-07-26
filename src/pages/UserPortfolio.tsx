import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import Index from "./Index";
import { Loader2 } from "lucide-react";

// Helper: upsert a <meta> tag by attribute
function setMeta(attr: string, value: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${value}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return el;
}

export const UserPortfolio = ({ useDomain = false }: { useDomain?: boolean }) => {
  const { username } = useParams<{ username: string }>();
  const { loadUserPortfolio, loadUserPortfolioByDomain, profile, loading, error } = usePortfolio();

  useEffect(() => {
    if (useDomain) {
      loadUserPortfolioByDomain(window.location.hostname);
    } else if (username) {
      loadUserPortfolio(username);
    }
    // Cleanup: restore default meta on unmount
    return () => {
      document.title = "LabForge Portfolio";
      const tags = document.querySelectorAll("meta[data-user-og]");
      tags.forEach(t => t.remove());
    };
  }, [username, useDomain]);

  // Inject user-specific OG tags once profile is loaded
  useEffect(() => {
    if (!profile?.name || profile.name === "Dalton Omondi") return;
    const name = profile.name;
    const role = (profile.roles || [])[0] || "Portfolio";
    const bio = profile.bio || `${name}'s portfolio — powered by LabForge.`;
    const title = `${name} — ${role}`;
    const origin = window.location.origin;
    const url = username ? `${origin}/u/${username}` : `${origin}/`;

    document.title = title;
    const metas = [
      setMeta("name", "description", bio),
      setMeta("property", "og:title", title),
      setMeta("property", "og:description", bio),
      setMeta("property", "og:url", url),
      setMeta("property", "og:type", "profile"),
      setMeta("name", "twitter:title", title),
      setMeta("name", "twitter:description", bio),
      setMeta("name", "twitter:card", "summary"),
    ];
    metas.forEach(m => m.setAttribute("data-user-og", "true"));
  }, [profile, username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-foreground">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-mono tracking-widest text-muted-foreground uppercase">Loading live portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-foreground text-center px-6">
        <div className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Portfolio Not Found</div>
        <p className="text-sm text-muted-foreground max-w-md">The portfolio page for @{username} does not exist or failed to load. Check the spelling or create your own portfolio now!</p>
        <a href="/forge" className="mt-4 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all font-semibold shadow-md">Create Your Portfolio Now</a>
      </div>
    );
  }

  return <Index />;
};

export default UserPortfolio;

