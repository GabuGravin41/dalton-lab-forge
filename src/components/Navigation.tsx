import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sparkles, FileText, Settings, Palette, LayoutGrid } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

const SettingsButton = ({ activeTheme, activeFocus, handleThemeChange, handleFocusChange }: {
  activeTheme: string;
  activeFocus: string;
  handleThemeChange: (t: string) => void;
  handleFocusChange: (f: "engineering" | "research") => void;
}) => {
  const themes = [
    { id: "indigo", name: "Midnight Indigo", color: "bg-indigo-600", desc: "Deep Indigo & Amber accents" },
    { id: "emerald", name: "Emerald Aurora", color: "bg-emerald-600", desc: "Forest background & Cyan highlights" },
    { id: "rose", name: "Cyber-Rose", color: "bg-rose-600", desc: "Dark Crimson & Gold accents" },
    { id: "cyberpunk", name: "Neon Cyberpunk", color: "bg-fuchsia-600", desc: "Pitch Black & electric Magenta/Cyan" },
    { id: "steel", name: "Minimal Steel", color: "bg-slate-500", desc: "Slate background & Steel/Silver accents" },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 relative hover:bg-accent/10 focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-label="Site settings"
        >
          <Settings className="w-[1.2rem] h-[1.2rem] transition-transform hover:rotate-45 duration-300" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] max-h-[85vh] bg-background/95 backdrop-blur-xl border border-border/80 shadow-2xl text-foreground flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            <Settings className="w-5 h-5 text-primary" />
            Appearance & Layout
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure site-wide visual templates and default resume layouts.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* Theme selection */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-primary" />
              Color Template
            </h4>
            <div className="grid gap-2.5">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleThemeChange(t.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                    activeTheme === t.id
                      ? "bg-primary/10 border-primary shadow-sm shadow-primary/5"
                      : "bg-card/40 border-border/50 hover:bg-card/70 hover:border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${t.color} border border-white/20`} />
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-[11px] text-muted-foreground">{t.desc}</div>
                    </div>
                  </div>
                  {activeTheme === t.id && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Resume Focus selection */}
          <div className="space-y-3 border-t border-border/50 pt-5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-primary" />
              Default Resume Focus
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleFocusChange("engineering")}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between h-24 ${
                  activeFocus === "engineering"
                    ? "bg-primary/10 border-primary shadow-sm shadow-primary/5"
                    : "bg-card/40 border-border/50 hover:bg-card/70 hover:border-border"
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-sm font-semibold">Engineering</span>
                  {activeFocus === "engineering" && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <span className="text-[10px] text-muted-foreground leading-normal">
                  Prioritizes ML/HW projects, engineering experience, and technical tools.
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleFocusChange("research")}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between h-24 ${
                  activeFocus === "research"
                    ? "bg-primary/10 border-primary shadow-sm shadow-primary/5"
                    : "bg-card/40 border-border/50 hover:bg-card/70 hover:border-border"
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-sm font-semibold">Research</span>
                  {activeFocus === "research" && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <span className="text-[10px] text-muted-foreground leading-normal">
                  Prioritizes papers, academic profile, research statement, and education.
                </span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Navigation = () => {
  const { theme: nextTheme, setTheme: setNextTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem("portfolio_theme") || "indigo");
  const [activeFocus, setActiveFocus] = useState(() => localStorage.getItem("portfolio_resume_focus") || "engineering");
  const location = useLocation();
  const isPlayground = location.pathname === '/playground';
  const isResume = location.pathname === '/resume';
  const isAdmin = location.pathname === '/admin';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Detect active section
      const sections = ['hero', 'about', 'projects', 'research', 'contact'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    
    const syncSettings = () => {
      setActiveTheme(localStorage.getItem("portfolio_theme") || "indigo");
      setActiveFocus(localStorage.getItem("portfolio_resume_focus") || "engineering");
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("portfolio-theme-change", syncSettings);
    window.addEventListener("portfolio-focus-change", syncSettings);
    window.addEventListener("storage", syncSettings);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("portfolio-theme-change", syncSettings);
      window.removeEventListener("portfolio-focus-change", syncSettings);
      window.removeEventListener("storage", syncSettings);
    };
  }, []);

  const handleThemeChange = (theme: string) => {
    setActiveTheme(theme);
    localStorage.setItem("portfolio_theme", theme);
    
    // Automatically switch next-themes to dark mode for custom color templates
    if (nextTheme === "light") {
      setNextTheme("dark");
    }
    
    const savedProfile = localStorage.getItem("portfolio_profile");
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        profile.theme = theme;
        localStorage.setItem("portfolio_profile", JSON.stringify(profile));
      } catch (e) {}
    }
    
    window.dispatchEvent(new CustomEvent("portfolio-theme-change"));
  };

  const handleFocusChange = (focus: "engineering" | "research") => {
    setActiveFocus(focus);
    localStorage.setItem("portfolio_resume_focus", focus);
    window.dispatchEvent(new CustomEvent("portfolio-focus-change"));
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { id: "about", label: "About" },
    { id: "projects", label: "Projects" },
    { id: "research", label: "Research" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-lg shadow-primary/5" 
          : "bg-background/20 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" onClick={() => scrollToSection("hero")}>
            <div className="group flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(245,58%,51%)] to-[hsl(260,60%,45%)] rounded-lg blur-md opacity-0 group-hover:opacity-50 transition-opacity" />
                <span className="relative text-xl font-bold bg-gradient-to-r from-[hsl(245,58%,51%)] to-[hsl(260,60%,45%)] bg-clip-text text-transparent group-hover:scale-105 transition-transform inline-block">
                  Dalton Omondi
                </span>
              </div>
              {scrolled && (
                <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-full animate-fade-in">
                  ML + HW
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {!isPlayground && !isResume && !isAdmin && (
              <>
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className={`relative text-sm font-medium transition-all duration-300 group ${
                      activeSection === link.id
                        ? "text-primary"
                        : "text-foreground/90 hover:text-foreground"
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-primary transition-all duration-300 ${
                        activeSection === link.id ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </button>
                ))}
              </>
            )}
            
            <Link to="/resume">
              <button className={`group relative text-sm font-medium transition-colors flex items-center gap-1.5 ${isResume ? 'text-primary' : 'text-foreground/90 hover:text-foreground'}`}>
                <FileText className={`w-3.5 h-3.5 group-hover:text-primary transition-colors ${isResume ? 'text-primary' : ''}`} />
                Resume / CV
              </button>
            </Link>

            <Link to="/playground">
              <button className={`group relative text-sm font-medium transition-colors flex items-center gap-1.5 ${isPlayground ? 'text-primary' : 'text-foreground/90 hover:text-foreground'}`}>
                <Sparkles className={`w-3.5 h-3.5 group-hover:text-primary transition-colors ${isPlayground ? 'text-primary' : ''}`} />
                Playground
              </button>
            </Link>
            
            <div className="h-4 w-px bg-border" />
            
            <ThemeToggle />

            <SettingsButton
              activeTheme={activeTheme}
              activeFocus={activeFocus}
              handleThemeChange={handleThemeChange}
              handleFocusChange={handleFocusChange}
            />
            
            {!isPlayground && !isResume && !isAdmin && (
              <Button
                onClick={() => scrollToSection("contact")}
                className="bg-gradient-accent text-accent-foreground hover:opacity-90 shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all hover:scale-105"
              >
                Let's Connect
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <SettingsButton
              activeTheme={activeTheme}
              activeFocus={activeFocus}
              handleThemeChange={handleThemeChange}
              handleFocusChange={handleFocusChange}
            />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-all"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-border shadow-2xl animate-fade-in">
            <div className="container mx-auto px-6 py-6 space-y-4">
              {!isPlayground && !isResume && !isAdmin && (
                <>
                  {navLinks.map((link, idx) => (
                    <button
                      key={link.id}
                      onClick={() => scrollToSection(link.id)}
                      className="w-full text-left px-4 py-3 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-all text-sm font-medium hover:bg-primary/5 group"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <span className="flex items-center justify-between">
                        {link.label}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">→</span>
                      </span>
                    </button>
                  ))}
                  <div className="h-px bg-border my-2" />
                </>
              )}
              
              <Link to="/resume" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full text-left px-4 py-3 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-all text-sm font-medium hover:bg-primary/5 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Resume / CV
                </button>
              </Link>

              <Link to="/playground" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full text-left px-4 py-3 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-all text-sm font-medium hover:bg-primary/5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Playground
                </button>
              </Link>
              
              {!isPlayground && !isResume && !isAdmin && (
                <Button
                  onClick={() => scrollToSection("contact")}
                  className="w-full bg-gradient-accent text-accent-foreground hover:opacity-90 shadow-lg"
                >
                  Let's Connect
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
