import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Research from "@/components/Research";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingChatbot from "@/components/FloatingChatbot";
import { usePortfolio } from "@/context/PortfolioContext";
import { Button } from "@/components/ui/button";

const EditHeader = () => {
  const { publishChanges, logout, username, loading, hasUnsavedChanges } = usePortfolio();

  return (
    <div className="bg-background/95 backdrop-blur-md border-b border-primary/30 py-2.5 px-6 flex items-center justify-between sticky top-0 z-[100] text-xs text-foreground select-none print:hidden shadow-lg shadow-primary/5">
      <div className="flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-muted-foreground">Editing as <strong className="text-foreground">@{username}</strong></span>
        {hasUnsavedChanges ? (
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-500 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Unsaved changes
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-500 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            All published
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant={hasUnsavedChanges ? "default" : "outline"}
          size="sm"
          onClick={publishChanges}
          disabled={loading || !hasUnsavedChanges}
          className={`h-7 text-[11px] transition-all ${hasUnsavedChanges ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 hover:bg-primary/90" : "border-border/50 text-muted-foreground"}`}
        >
          {loading ? "Publishing..." : hasUnsavedChanges ? "⬆ Publish Live" : "Published"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="h-7 hover:bg-destructive/10 hover:text-destructive text-[11px] text-muted-foreground"
        >
          Log Out
        </Button>
      </div>
    </div>
  );
};


const Index = () => {
  const { isEditMode } = usePortfolio();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {isEditMode && <EditHeader />}
      <Navigation />
      <main>
        <Hero />
        <About />
        <Projects />
        <Research />
        <Contact />
      </main>
      <Footer />
      <FloatingChatbot />
    </div>
  );
};

export default Index;
