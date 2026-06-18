import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Github, Linkedin, Mail, ExternalLink, Send, Sparkles, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import profileData from "@/data/profile.json";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "Thank you for reaching out. I'll get back to you soon.",
    });
    setFormData({ name: "", email: "", message: "" });
  };

  const socials = profileData.socials;

  const socialLinks = [
    {
      name: "GitHub",
      icon: <Github className="h-5 w-5" />,
      href: socials.github,
      label: socials.github.replace("https://", ""),
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="h-5 w-5" />,
      href: socials.linkedin,
      label: socials.linkedin.replace("https://www.", "").replace("https://", ""),
    },
    {
      name: "Email",
      icon: <Mail className="h-5 w-5" />,
      href: `mailto:${socials.email}`,
      label: socials.email,
    },
    {
      name: "Fiverr",
      icon: <ExternalLink className="h-5 w-5" />,
      href: socials.fiverr,
      label: "Freelance Services",
    },
  ];

  return (
    <section id="contact" className="py-16 md:py-24 lg:py-32 px-4 sm:px-6 bg-gradient-subtle relative overflow-hidden z-10">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary/20 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: "2s" }} />
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-6xl mx-auto space-y-10 md:space-y-12 lg:space-y-16">
          {/* Header */}
          <div className="text-center space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-accent/10 border border-accent/20 rounded-full backdrop-blur-sm mb-2 md:mb-4">
              <Sparkles className="w-3 md:w-4 h-3 md:h-4 text-accent" />
              <span className="text-xs md:text-sm font-medium text-foreground">Get In Touch</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold">
              Let's <span className="bg-gradient-to-r from-[hsl(30,90%,58%)] to-[hsl(20,85%,55%)] bg-clip-text text-transparent">Work Together</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Open to freelance projects, research collaborations, and full-time opportunities.
              Let's build something amazing together.
            </p>
            
            {/* Quick info */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 pt-2 md:pt-4 text-xs md:text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 md:gap-2">
                <MapPin className="w-3 md:w-4 h-3 md:h-4 text-primary" />
                <span>Remote / Hybrid</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <Clock className="w-3 md:w-4 h-3 md:h-4 text-accent" />
                <span className="hidden sm:inline">Usually responds within 24h</span>
                <span className="sm:hidden">Reply in 24h</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Contact Form */}
            <Card className="group relative p-5 md:p-6 lg:p-8 bg-card/50 backdrop-blur-sm border-border hover:border-primary/30 transition-all duration-500 space-y-5 md:space-y-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
              <div className="relative">
                <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 flex items-center gap-2">
                  <Send className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                  Send a Message
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Have a project in mind? Let's discuss how I can help bring it to life.
                  Fill out the form and I'll get back to you shortly.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 relative">
                <div className="space-y-1.5 md:space-y-2">
                  <label htmlFor="name" className="text-xs md:text-sm font-semibold mb-1 md:mb-2 block flex items-center gap-1.5 md:gap-2">
                    Your Name
                    <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                    className="bg-background/50 border-border focus:border-primary/50 transition-colors h-10 md:h-11 text-sm md:text-base"
                  />
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <label htmlFor="email" className="text-xs md:text-sm font-semibold mb-1 md:mb-2 block flex items-center gap-1.5 md:gap-2">
                    Email Address
                    <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                    className="bg-background/50 border-border focus:border-primary/50 transition-colors h-10 md:h-11 text-sm md:text-base"
                  />
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <label htmlFor="message" className="text-xs md:text-sm font-semibold mb-1 md:mb-2 block flex items-center gap-1.5 md:gap-2">
                    Your Message
                    <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell me about your project, timeline, budget, and any specific requirements..."
                    required
                    rows={5}
                    className="bg-background/50 border-border focus:border-primary/50 transition-colors resize-none text-sm md:text-base"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-accent text-accent-foreground hover:opacity-90 shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all h-10 md:h-11 font-semibold group text-sm md:text-base"
                >
                  <Send className="w-3 md:w-4 h-3 md:h-4 mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  Send Message
                </Button>
              </form>
            </Card>

            {/* Connect & Social Links */}
            <div className="space-y-5 md:space-y-6">
              <Card className="relative p-5 md:p-6 lg:p-8 bg-card/50 backdrop-blur-sm border-border overflow-hidden">
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                <div className="relative">
                  <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                    Connect With Me
                  </h3>
                  <p className="text-muted-foreground text-xs md:text-sm mb-4 md:mb-6">Find me across these platforms</p>
                  <div className="space-y-2 md:space-y-3">
                    {socialLinks.map((link, idx) => (
                      <a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg md:rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-all duration-300 group hover:-translate-x-1 hover:shadow-lg hover:shadow-primary/5"
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <div className="p-2 md:p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                          {link.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm md:text-base group-hover:text-primary transition-colors">
                            {link.name}
                          </div>
                          <div className="text-xs md:text-sm text-muted-foreground truncate">{link.label}</div>
                        </div>
                        <ExternalLink className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="relative p-5 md:p-6 lg:p-8 bg-gradient-to-br from-accent/10 via-card/50 to-primary/10 backdrop-blur-sm border-border overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
                <div className="relative space-y-3 md:space-y-4">
                  <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 flex items-center gap-2">
                    💼 Freelance Services
                  </h3>
                  <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                    I offer professional freelance services through Fiverr for custom PCB design, 
                    IoT solutions, and machine learning implementations. Let's collaborate!
                  </p>
                  <div className="flex flex-wrap gap-1.5 md:gap-2 text-[10px] md:text-xs pt-1 md:pt-2">
                    <span className="px-2 md:px-3 py-0.5 md:py-1 bg-primary/20 text-primary rounded-full">PCB Design</span>
                    <span className="px-2 md:px-3 py-0.5 md:py-1 bg-accent/20 text-accent rounded-full">IoT Dev</span>
                    <span className="px-2 md:px-3 py-0.5 md:py-1 bg-primary/20 text-primary rounded-full">ML Solutions</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-accent/30 hover:bg-accent/10 hover:border-accent/50 group mt-3 md:mt-4 text-sm md:text-base h-9 md:h-10"
                    onClick={() => window.open("https://fiverr.com", "_blank")}
                  >
                    View Fiverr Profile
                    <ExternalLink className="ml-2 h-3 w-3 md:h-4 md:w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Bottom note */}
          <div className="text-center pt-8">
            <Card className="inline-block px-8 py-4 bg-card/30 backdrop-blur-sm border-border">
              <p className="text-sm text-muted-foreground">
                ✨ Response time: <span className="font-semibold text-foreground">Usually within 24 hours</span> • 
                All inquiries are welcome!
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
