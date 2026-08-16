import { useState, useEffect } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Globe, Clock, Award, Loader2 } from "lucide-react";

export const LiveStatsWidget = () => {
  const { profile } = usePortfolio();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const wakatimeUser = profile?.socials?.wakatime;
  const scholarId = profile?.socials?.googleScholar;

  useEffect(() => {
    if (!wakatimeUser && !scholarId) {
      setStats(null);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (wakatimeUser) queryParams.set("wakatime", wakatimeUser);
        if (scholarId) queryParams.set("scholar", scholarId);

        const res = await fetch(`/api/live-stats?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to load live stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [wakatimeUser, scholarId]);

  if (!wakatimeUser && !scholarId) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span>Syncing live stats...</span>
      </div>
    );
  }

  const wakaLanguages = stats?.wakatime?.languages || [];
  const scholarMetrics = stats?.scholar;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* WakaTime Languages card */}
      {wakatimeUser && (
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              Weekly Coding Composition
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] text-green-500 font-semibold bg-green-500/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Live
            </div>
          </div>

          <div className="space-y-3">
            {wakaLanguages.map((lang: any, i: number) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-foreground">{lang.name}</span>
                  <span className="text-muted-foreground">{lang.percent}% ({lang.hours} hrs)</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                    style={{ width: `${lang.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Google Scholar citations card */}
      {scholarId && (
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-primary" />
              Research Citation Graph
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] text-green-500 font-semibold bg-green-500/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Live
            </div>
          </div>

          {scholarMetrics ? (
            <div className="grid grid-cols-3 gap-4 py-2">
              <div className="text-center p-3 rounded-xl bg-muted/40 border border-border/50">
                <div className="text-2xl font-bold text-primary font-mono">{scholarMetrics.citations}</div>
                <div className="text-[10px] uppercase text-muted-foreground tracking-wider font-medium mt-1">Citations</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/40 border border-border/50">
                <div className="text-2xl font-bold text-primary font-mono">{scholarMetrics.hIndex}</div>
                <div className="text-[10px] uppercase text-muted-foreground tracking-wider font-medium mt-1">h-index</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/40 border border-border/50">
                <div className="text-2xl font-bold text-primary font-mono">{scholarMetrics.i10Index}</div>
                <div className="text-[10px] uppercase text-muted-foreground tracking-wider font-medium mt-1">i10-index</div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Unable to parse scholar profile metrics.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
