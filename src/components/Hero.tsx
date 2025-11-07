import { Button } from "@/components/ui/button";
import { ArrowRight, Download } from "lucide-react";

const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Grid pattern background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[80px] animate-glow-pulse" style={{ animationDelay: "4s" }} />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Main content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium text-foreground">Available for Opportunities</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tight">
                <span className="block text-foreground">Dalton</span>
                <span className="block bg-gradient-to-r from-[hsl(245,58%,51%)] to-[hsl(260,60%,45%)] bg-clip-text text-transparent">Omondi</span>
              </h1>
              
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full border border-primary/30">
                  ML Engineer
                </span>
                <span className="px-3 py-1 text-xs font-medium bg-accent/20 text-accent rounded-full border border-accent/30">
                  Hardware Designer
                </span>
                <span className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full border border-primary/30">
                  Researcher
                </span>
              </div>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Engineering at the intersection of <span className="text-primary font-medium">artificial intelligence</span> and{" "}
              <span className="text-accent font-medium">physical systems</span>. From neural networks to circuit boards, 
              I create technology that thinks and works.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                onClick={() => scrollToSection("projects")}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 group shadow-lg shadow-primary/20"
              >
                View Projects
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={() => scrollToSection("contact")}
                size="lg"
                variant="outline"
                className="border-border hover:bg-secondary/50 backdrop-blur-sm"
              >
                Get in Touch
              </Button>
            </div>
          </div>

          {/* Right side - Skill cards */}
          <div className="grid grid-cols-2 gap-4 animate-fade-in-slow">
            {[
              /*
              { icon: "🧠", title: "Machine Learning", desc: "Neural networks, computer vision, AI deployment" },
              { icon: "⚡", title: "PCB Design", desc: "Hardware fabrication, embedded systems" },
              { icon: "🔬", title: "Chip Design", desc: "VLSI architecture, digital circuits" },
              { icon: "📡", title: "IoT Systems", desc: "Connected devices, sensor networks" },
              */

              { title: "Machine Learning", desc: "Neural networks, computer vision, AI deployment" },
              { title: "PCB Design", desc: "Hardware fabrication, embedded systems" },
              { title: "Chip Design", desc: "VLSI architecture, digital circuits" },
              { title: "IoT Systems", desc: "Connected devices, sensor networks" },
            ].map((skill, index) => (
              <div
                key={skill.title}
                className="group relative p-6 bg-card/50 backdrop-blur-sm border border-border rounded-2xl hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity" />
                <div className="relative space-y-3">
                  <div className="text-3xl">{skill.icon}</div>
                  <h3 className="font-bold text-foreground">{skill.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{skill.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        
        {/* Bottom scroll indicator */}
        {/*
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default Hero;
