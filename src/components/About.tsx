import { Card } from "@/components/ui/card";
import { Cpu, Zap, Lightbulb, Code2 } from "lucide-react";

const About = () => {
  const skills = [
    {
      icon: <Cpu className="h-6 w-6" />,
      title: "Machine Learning",
      description: "Computer vision, neural networks, and AI model deployment",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Hardware Engineering",
      description: "PCB design, fabrication, and embedded systems development",
    },
    {
      icon: <Code2 className="h-6 w-6" />,
      title: "Chip Design",
      description: "VLSI design, simulation, and digital circuit architecture",
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "IoT & Research",
      description: "Connected devices, sensor networks, and academic exploration",
    },
  ];

  return (
    <section id="about" className="py-32 px-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
      <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-accent/20 to-transparent" />
      
      <div className="container mx-auto">
        <div className="max-w-7xl mx-auto space-y-20">
          {/* Section header with creative layout */}
          <div className="grid lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-2 space-y-6">
              <div className="inline-block">
                <div className="text-sm font-mono text-primary mb-2">{'<about>'}</div>
                <h2 className="text-5xl md:text-6xl font-bold">
                  The
                  <span className="block bg-gradient-accent bg-clip-text text-transparent">Intersection</span>
                </h2>
                <div className="text-sm font-mono text-primary mt-2">{'</about>'}</div>
              </div>
            </div>
            
            <div className="lg:col-span-3 space-y-6">
              <p className="text-xl text-foreground leading-relaxed">
                Where <span className="font-bold text-primary">software intelligence</span> meets{" "}
                <span className="font-bold text-accent">physical reality</span> — that's where I build.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                I'm an engineer who finds beauty in both abstraction and tangibility. My work spans from training 
                neural networks that see and understand, to designing circuit boards that bring those models into the real world.
              </p>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Story column */}
            <div className="lg:col-span-2 space-y-8">
              <div className="relative p-8 bg-card/30 backdrop-blur-sm border border-border rounded-3xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
                <div className="relative space-y-4">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    My Approach
                  </h3>
                  <p className="text-foreground/90 leading-relaxed">
                    Whether I'm optimizing a machine learning pipeline, laying out a multi-layer PCB, or prototyping 
                    an IoT sensor node, I'm driven by the same question: <span className="text-accent font-semibold italic">
                    "How can we make technology more intelligent, more capable, and more meaningful?"</span>
                  </p>
                  <p className="text-foreground/80 leading-relaxed">
                    I believe the most groundbreaking innovations emerge when we refuse to stay in our lane — when we 
                    bring the precision of hardware design to AI systems, or the adaptability of machine learning to 
                    embedded devices.
                  </p>
                </div>
              </div>

              <div className="relative p-8 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 border border-border rounded-3xl">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    What I'm Looking For
                  </h3>
                  <p className="text-foreground/90 leading-relaxed">
                    Currently seeking opportunities in <span className="font-semibold text-primary">hardware engineering</span>, 
                    <span className="font-semibold text-accent"> embedded AI</span>, and{" "}
                    <span className="font-semibold text-primary">research positions</span> where I can contribute to projects 
                    that push boundaries and create meaningful impact.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">Hardware Engineering</span>
                    <span className="px-3 py-1 text-xs font-medium bg-accent/20 text-accent rounded-full">Embedded AI</span>
                    <span className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">Research</span>
                    <span className="px-3 py-1 text-xs font-medium bg-accent/20 text-accent rounded-full">Freelance</span>
                  </div>
                </div>
              </div>

              {/* Beyond Engineering */}
              <div className="relative p-8 bg-secondary/30 border border-border rounded-3xl overflow-hidden group">
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
                <div className="relative space-y-4">
                  <h3 className="text-2xl font-bold">Beyond Engineering</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    When I'm not designing circuits or training models, I explore philosophy, listen to diverse music, 
                    and reflect on the meaning we assign to what we create. Good engineering, I believe, demands both 
                    technical precision and human insight.
                  </p>
                </div>
              </div>
            </div>

            {/* Skills sidebar */}
            <div className="space-y-4">
              <div className="sticky top-24 space-y-4">
                <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Core Expertise</h3>
                {skills.map((skill, index) => (
                  <div
                    key={skill.title}
                    className="group relative p-6 bg-card/50 backdrop-blur-sm border border-border rounded-2xl hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity" />
                    <div className="relative space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                          {skill.icon}
                        </div>
                        <div className="text-xs font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          0{index + 1}
                        </div>
                      </div>
                      <h4 className="font-bold text-foreground">{skill.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{skill.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
