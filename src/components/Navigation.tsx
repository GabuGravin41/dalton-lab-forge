import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const location = useLocation();
  const isPlayground = location.pathname === '/playground';

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
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            {!isPlayground && (
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
            
            <Link to="/playground">
              <button className="group relative text-sm font-medium text-foreground/90 hover:text-foreground transition-colors flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
                Playground
              </button>
            </Link>
            
            <div className="h-4 w-px bg-border" />
            
            <ThemeToggle />
            
            {!isPlayground && (
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
              {!isPlayground && (
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
              
              <Link to="/playground" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full text-left px-4 py-3 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-all text-sm font-medium hover:bg-primary/5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Playground
                </button>
              </Link>
              
              {!isPlayground && (
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
