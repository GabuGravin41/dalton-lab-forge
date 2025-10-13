import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Github, Linkedin, Mail, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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

  const socialLinks = [
    {
      name: "GitHub",
      icon: <Github className="h-5 w-5" />,
      href: "https://github.com",
      label: "github.com/daltonomondi",
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="h-5 w-5" />,
      href: "https://linkedin.com",
      label: "linkedin.com/in/daltonomondi",
    },
    {
      name: "Email",
      icon: <Mail className="h-5 w-5" />,
      href: "mailto:dalton@example.com",
      label: "dalton@example.com",
    },
    {
      name: "Fiverr",
      icon: <ExternalLink className="h-5 w-5" />,
      href: "https://fiverr.com",
      label: "Freelance Services",
    },
  ];

  return (
    <section id="contact" className="py-24 px-6 bg-gradient-subtle">
      <div className="container mx-auto">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Let's <span className="bg-gradient-accent bg-clip-text text-transparent">Work Together</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Open to freelance projects, research collaborations, and full-time opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 bg-card border-border space-y-6">
              <div>
                <h3 className="text-2xl font-semibold mb-2">Send a Message</h3>
                <p className="text-muted-foreground">
                  Have a project in mind? Let's discuss how I can help bring it to life.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="text-sm font-medium mb-2 block">
                    Your Name
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                    className="bg-background border-border"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="text-sm font-medium mb-2 block">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                    className="bg-background border-border"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="text-sm font-medium mb-2 block">
                    Your Message
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell me about your project..."
                    required
                    rows={5}
                    className="bg-background border-border resize-none"
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-accent text-accent-foreground hover:opacity-90">
                  Send Message
                </Button>
              </form>
            </Card>

            <div className="space-y-6">
              <Card className="p-8 bg-card border-border">
                <h3 className="text-2xl font-semibold mb-6">Connect With Me</h3>
                <div className="space-y-4">
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                        {link.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium group-hover:text-primary transition-colors">
                          {link.name}
                        </div>
                        <div className="text-sm text-muted-foreground">{link.label}</div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ))}
                </div>
              </Card>

              <Card className="p-8 bg-secondary/30 border-border">
                <h3 className="text-xl font-semibold mb-3">Looking for specific services?</h3>
                <p className="text-muted-foreground mb-4">
                  I offer freelance services through Fiverr for custom PCB design, IoT solutions, 
                  and machine learning implementations.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-border hover:bg-background"
                  onClick={() => window.open("https://fiverr.com", "_blank")}
                >
                  View Fiverr Profile
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
