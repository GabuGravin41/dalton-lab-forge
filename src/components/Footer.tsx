import { Github, Linkedin, Mail, Heart, Code2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import profileData from "@/data/profile.json";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const socials = profileData.socials;

  const socialLinks = [
    { icon: Github, href: socials.github, label: "GitHub" },
    { icon: Linkedin, href: socials.linkedin, label: "LinkedIn" },
    { icon: Mail, href: `mailto:${socials.email}`, label: "Email" },
  ];

  const quickLinks = [
    { label: "About", href: "/#about" },
    { label: "Projects", href: "/#projects" },
    { label: "Research", href: "/#research" },
    { label: "Contact", href: "/#contact" },
  ];

  const pageLinks = [
    { label: "Resume Exporter", to: "/resume" },
    { label: "AI Playground", to: "/playground" },
    { label: "Admin Control Center", to: "/admin" },
  ];

  const handleScrollToHash = (href: string) => {
    if (href.startsWith("/#")) {
      const id = href.replace("/#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = href;
      }
    }
  };

  return (
    <footer className="relative py-10 md:py-12 lg:py-16 px-4 sm:px-6 border-t border-border bg-gradient-subtle overflow-hidden z-10">
      {/* Background decoration */}
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute top-0 right-1/4 w-48 h-48 bg-accent/5 rounded-full blur-[80px]" />
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 lg:gap-12 mb-8 md:mb-10 lg:mb-12">
            {/* Brand Section */}
            <div className="space-y-3 md:space-y-4 sm:col-span-2 md:col-span-1">
              <div className="space-y-1 md:space-y-2">
                <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[hsl(245,58%,51%)] to-[hsl(260,60%,45%)] bg-clip-text text-transparent">
                  {profileData.name}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Machine Learning + Hardware Engineer
                </p>
              </div>
              <p className="text-xs md:text-sm text-foreground/80 leading-relaxed">
                Building intelligent systems at the intersection of AI and hardware.
                Turning ideas into reality through code and circuits.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-3 md:space-y-4">
              <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider text-foreground/90">
                Explore
              </h4>
              <nav className="flex flex-col space-y-1.5 md:space-y-2">
                {quickLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => handleScrollToHash(link.href)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors text-left group flex items-center gap-2"
                  >
                    <span className="w-0 h-px bg-primary group-hover:w-4 transition-all" />
                    {link.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Page Links */}
            <div className="space-y-3 md:space-y-4">
              <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider text-foreground/90">
                Features
              </h4>
              <nav className="flex flex-col space-y-1.5 md:space-y-2">
                {pageLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors text-left group flex items-center gap-2"
                  >
                    <span className="w-0 h-px bg-primary group-hover:w-4 transition-all" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Connect Section */}
            <div className="space-y-3 md:space-y-4">
              <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider text-foreground/90">
                Connect
              </h4>
              <div className="flex gap-2 md:gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-2.5 md:p-3 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-all hover:scale-110 hover:shadow-lg hover:shadow-primary/10"
                      aria-label={social.label}
                    >
                      <Icon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                  );
                })}
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed pt-1 md:pt-2">
                Open to opportunities and collaborations.
                Let's build something amazing together!
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 md:pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-xs md:text-sm text-muted-foreground text-center">
                <span>© {currentYear} Dalton Omondi.</span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  Built with <Heart className="w-3 h-3 text-destructive fill-destructive animate-pulse" /> and <Code2 className="w-3 h-3 text-primary" />
                </span>
              </div>
              
              <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-xs text-muted-foreground">
                <span className="px-2 md:px-3 py-0.5 md:py-1 bg-primary/10 rounded-full whitespace-nowrap">
                  Designed for impact
                </span>
                <span className="px-2 md:px-3 py-0.5 md:py-1 bg-accent/10 rounded-full whitespace-nowrap">
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
