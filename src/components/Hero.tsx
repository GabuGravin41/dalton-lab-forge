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
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-block px-4 py-2 bg-secondary/50 rounded-full border border-border mb-4">
            <span className="text-sm text-muted-foreground">Available for Freelance & Opportunities</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Machine Learning
            </span>
            <br />
            <span className="text-foreground">meets Hardware Design</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            I'm Dalton Omondi, an engineer bridging the gap between artificial intelligence and physical systems. 
            From PCB fabrication to neural networks, I build things that think and things that work.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              onClick={() => scrollToSection("projects")}
              size="lg"
              className="bg-gradient-accent text-accent-foreground hover:opacity-90 transition-opacity group"
            >
              Explore Projects
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => scrollToSection("about")}
              size="lg"
              variant="outline"
              className="border-border hover:bg-secondary"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Resume
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 max-w-3xl mx-auto">
            {[
              { label: "Machine Learning", value: "AI/ML" },
              { label: "PCB Design", value: "Hardware" },
              { label: "Chip Design", value: "VLSI" },
              { label: "IoT Systems", value: "Embedded" },
            ].map((skill) => (
              <div key={skill.label} className="text-center space-y-2">
                <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {skill.value}
                </div>
                <div className="text-sm text-muted-foreground">{skill.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
