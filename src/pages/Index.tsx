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
  const { publishChanges, logout, username, loading } = usePortfolio();

  return (
    <div className="bg-primary/20 backdrop-blur-md border-b border-primary/30 py-3 px-6 flex items-center justify-between sticky top-0 z-[100] text-xs text-foreground select-none print:hidden">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
        <span>Editing Mode: <strong>@{username}</strong></span>
      </div>
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={publishChanges} 
          disabled={loading}
          className="h-8 border-primary/40 hover:bg-primary/10 text-[11px]"
        >
          {loading ? "Publishing..." : "Publish Live"}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={logout}
          className="h-8 hover:bg-destructive/10 hover:text-destructive text-[11px]"
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
