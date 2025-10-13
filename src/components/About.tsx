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
    <section id="about" className="py-24 px-6 relative">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold">
              Building at the <span className="bg-gradient-accent bg-clip-text text-transparent">Intersection</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              I believe the most meaningful innovations happen where software intelligence meets physical reality.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in-slow">
              <p className="text-lg text-foreground/90 leading-relaxed">
                I'm an engineer who finds beauty in both abstraction and tangibility. My work spans from training 
                neural networks that can see and understand, to designing circuit boards that bring those models 
                into the physical world.
              </p>
              <p className="text-lg text-foreground/90 leading-relaxed">
                Whether I'm optimizing a machine learning pipeline, laying out a multi-layer PCB, or prototyping 
                an IoT sensor node, I'm driven by the same question: <span className="text-accent font-medium">how can we make 
                technology more intelligent, more capable, and more meaningful?</span>
              </p>
              <p className="text-lg text-foreground/90 leading-relaxed">
                Currently seeking opportunities in hardware engineering, embedded AI, and research positions where 
                I can contribute to projects that push the boundaries of what's possible.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {skills.map((skill, index) => (
                <Card
                  key={skill.title}
                  className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-md group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      {skill.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{skill.title}</h3>
                      <p className="text-sm text-muted-foreground">{skill.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="bg-secondary/30 border border-border rounded-2xl p-8 md:p-12 text-center space-y-4">
            <h3 className="text-2xl font-bold">Beyond Engineering</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              When I'm not designing circuits or training models, I explore philosophy, listen to diverse music, 
              and think about the meaning we assign to the things we create. I believe good engineering requires 
              both technical precision and human insight.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
