import { Github, Linkedin, Mail, Heart, Code2 } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = [
    { icon: Github, href: "https://github.com", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Mail, href: "mailto:dalton@example.com", label: "Email" },
  ];

  const quickLinks = [
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Research", href: "#research" },
    { label: "Contact", href: "#contact" },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="relative py-16 px-6 border-t border-border bg-gradient-subtle overflow-hidden z-10">
      {/* Background decoration */}
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute top-0 right-1/4 w-48 h-48 bg-accent/5 rounded-full blur-[80px]" />
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[hsl(245,58%,51%)] to-[hsl(260,60%,45%)] bg-clip-text text-transparent">
                  Dalton Omondi
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Machine Learning + Hardware Engineer
                </p>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Building intelligent systems at the intersection of AI and hardware.
                Turning ideas into reality through code and circuits.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-foreground/90">
                Quick Links
              </h4>
              <nav className="flex flex-col space-y-2">
                {quickLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => scrollToSection(link.href.replace('#', ''))}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors text-left group flex items-center gap-2"
                  >
                    <span className="w-0 h-px bg-primary group-hover:w-4 transition-all" />
                    {link.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Connect Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-foreground/90">
                Connect
              </h4>
              <div className="flex gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-3 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-all hover:scale-110 hover:shadow-lg hover:shadow-primary/10"
                      aria-label={social.label}
                    >
                      <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-2">
                Open to opportunities and collaborations.
                Let's build something amazing together!
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>© {currentYear} Dalton Omondi.</span>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center gap-1">
                  Built with <Heart className="w-3 h-3 text-destructive fill-destructive animate-pulse" /> and <Code2 className="w-3 h-3 text-primary" />
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="px-3 py-1 bg-primary/10 rounded-full">
                  Designed for impact
                </span>
                <span className="px-3 py-1 bg-accent/10 rounded-full">
                  Engineered for excellence
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
