import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isPlayground = location.pathname === '/playground';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-lg border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => scrollToSection("hero")}
            className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            Dalton Omondi
          </button>

          <div className="hidden md:flex items-center gap-6">
            {!isPlayground && (
              <>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-sm text-foreground/80 hover:text-foreground transition-colors"
                >
                  About
                </button>
                <button
                  onClick={() => scrollToSection("projects")}
                  className="text-sm text-foreground/80 hover:text-foreground transition-colors"
                >
                  Projects
                </button>
                <button
                  onClick={() => scrollToSection("research")}
                  className="text-sm text-foreground/80 hover:text-foreground transition-colors"
                >
                  Research
                </button>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-sm text-foreground/80 hover:text-foreground transition-colors"
                >
                  Contact
                </button>
              </>
            )}
            <Link to="/playground">
              <button className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                Playground
              </button>
            </Link>
            <ThemeToggle />
            {!isPlayground && (
              <Button
                onClick={() => scrollToSection("contact")}
                className="bg-gradient-accent text-accent-foreground hover:opacity-90 transition-opacity"
              >
                Let's Connect
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
