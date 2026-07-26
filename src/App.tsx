import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import profileData from "@/data/profile.json";
import { PortfolioProvider } from "@/context/PortfolioContext";

// Heavy pages are lazily loaded — each becomes its own chunk
const Playground   = lazy(() => import("./pages/Playground"));
const Admin        = lazy(() => import("./pages/Admin"));
const Resume       = lazy(() => import("./pages/Resume"));
const Forge        = lazy(() => import("./pages/Forge"));
const Explore      = lazy(() => import("./pages/Explore"));
const UserPortfolio = lazy(() => import("./pages/UserPortfolio"));

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="w-7 h-7 text-primary animate-spin" />
  </div>
);


const queryClient = new QueryClient();

const isCustomDomain = () => {
  const hostname = window.location.hostname;
  return !(
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".vercel.app")
  );
};

const App = () => {
  useEffect(() => {
    const applyActiveTheme = () => {
      let theme = localStorage.getItem("portfolio_theme");
      
      if (!theme) {
        const savedProfile = localStorage.getItem("portfolio_profile");
        if (savedProfile) {
          try {
            theme = JSON.parse(savedProfile).theme;
          } catch (e) {}
        }
      }
      
      if (!theme) {
        theme = (profileData as any).theme || "indigo";
      }

      const classes = document.documentElement.classList;
      const expectedClass = `theme-${theme}`;

      if (!classes.contains(expectedClass)) {
        const themeClasses: string[] = [];
        classes.forEach((c) => {
          if (c.startsWith("theme-") && c !== expectedClass) {
            themeClasses.push(c);
          }
        });
        themeClasses.forEach(c => classes.remove(c));
        classes.add(expectedClass);
      }
    };

    applyActiveTheme();

    window.addEventListener("storage", applyActiveTheme);
    window.addEventListener("portfolio-theme-change", applyActiveTheme);

    // MutationObserver guarantees custom theme classes survive next-themes updates/resets
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          observer.disconnect();
          applyActiveTheme();
          observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      window.removeEventListener("storage", applyActiveTheme);
      window.removeEventListener("portfolio-theme-change", applyActiveTheme);
      observer.disconnect();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PortfolioProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={isCustomDomain() ? <UserPortfolio useDomain={true} /> : <Index />} />
                <Route path="/playground" element={<Playground />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/resume" element={<Resume />} />
                <Route path="/forge" element={<Forge />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/u/:username" element={<UserPortfolio />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </PortfolioProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
