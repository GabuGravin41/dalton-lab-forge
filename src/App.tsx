import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Playground from "./pages/Playground";
import Admin from "./pages/Admin";
import Resume from "./pages/Resume";
import NotFound from "./pages/NotFound";
import profileData from "@/data/profile.json";

const queryClient = new QueryClient();

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
      const themeClasses: string[] = [];
      classes.forEach((c) => {
        if (c.startsWith("theme-")) {
          themeClasses.push(c);
        }
      });
      themeClasses.forEach(c => classes.remove(c));
      classes.add(`theme-${theme}`);
    };

    applyActiveTheme();

    window.addEventListener("storage", applyActiveTheme);
    window.addEventListener("portfolio-theme-change", applyActiveTheme);

    return () => {
      window.removeEventListener("storage", applyActiveTheme);
      window.removeEventListener("portfolio-theme-change", applyActiveTheme);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/playground" element={<Playground />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
