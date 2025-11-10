import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Sparkles } from "lucide-react";

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const projects = [
    {
      title: "Real-Time Object Detection System",
      description: "Built a computer vision system using YOLOv8 for real-time object detection with edge deployment on Raspberry Pi. Achieved 30+ FPS performance.",
      tags: ["Machine Learning", "Computer Vision", "Python", "Edge AI"],
      github: "#",
      demo: "#",
      category: "ml",
    },
    {
      title: "IoT Weather Station with LoRa",
      description: "Designed and fabricated a custom PCB for a low-power IoT weather station using LoRa for long-range data transmission. Integrated multiple environmental sensors.",
      tags: ["IoT", "PCB Design", "LoRa", "Embedded C"],
      github: "#",
      category: "hardware",
    },
    {
      title: "RISC-V CPU Design",
      description: "Implemented a 5-stage pipelined RISC-V processor in Verilog with hazard detection and forwarding. Simulated and synthesized for FPGA deployment.",
      tags: ["VLSI", "Verilog", "Computer Architecture", "FPGA"],
      github: "#",
      category: "chip",
    },
    {
      title: "Smart Home Automation Hub",
      description: "Developed a centralized smart home system with ESP32 microcontrollers, MQTT protocol, and a custom Android app. Supports voice control integration.",
      tags: ["IoT", "ESP32", "MQTT", "Mobile Dev"],
      github: "#",
      demo: "#",
      category: "iot",
    },
    {
      title: "Music Generation with AI",
      description: "Trained a transformer-based model to generate original music compositions. Explored attention mechanisms and sequence modeling for creative applications.",
      tags: ["Deep Learning", "Transformers", "Audio ML", "PyTorch"],
      github: "#",
      demo: "#",
      category: "ml",
    },
    {
      title: "Multi-Layer PCB for Drone Controller",
      description: "Designed a 4-layer PCB for a custom drone flight controller with IMU integration, motor drivers, and telemetry modules. Optimized for signal integrity.",
      tags: ["PCB Design", "Embedded Systems", "Altium", "Hardware"],
      github: "#",
      category: "hardware",
    },
  ];

  const categories = [
    { id: "all", label: "All Projects", icon: "🎯" },
    { id: "ml", label: "Machine Learning", icon: "🧠" },
    { id: "hardware", label: "Hardware", icon: "⚡" },
    { id: "chip", label: "Chip Design", icon: "🔬" },
    { id: "iot", label: "IoT", icon: "📡" },
  ];

  const filteredProjects = activeFilter === "all" 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

  return (
    <section id="projects" className="py-32 px-6 bg-gradient-subtle relative overflow-hidden z-10">
      {/* Background decoration */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent/10 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: "3s" }} />
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-sm mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Portfolio Showcase</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold">
              Featured <span className="bg-gradient-to-r from-[hsl(245,58%,51%)] to-[hsl(260,60%,45%)] bg-clip-text text-transparent">Projects</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A selection of work spanning machine learning, hardware design, and systems engineering.
              Each project represents a unique challenge solved with innovative solutions.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                variant={activeFilter === category.id ? "default" : "outline"}
                className={`group transition-all duration-300 ${
                  activeFilter === category.id
                    ? "bg-gradient-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "border-border hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <span className="text-base mr-2">{category.icon}</span>
                {category.label}
              </Button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <Card
                key={project.title}
                className="group relative bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                
                {/* Glow effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-150" />
                
                <div className="relative p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors flex-1">
                      {project.title}
                    </h3>
                    <div className="flex gap-2 flex-shrink-0">
                      {project.github && (
                        <a
                          href={project.github}
                          className="p-2 rounded-lg bg-background/50 hover:bg-primary/20 hover:text-primary transition-all hover:scale-110"
                          aria-label="View on GitHub"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {project.demo && (
                        <a
                          href={project.demo}
                          className="p-2 rounded-lg bg-background/50 hover:bg-accent/20 hover:text-accent transition-all hover:scale-110"
                          aria-label="View live demo"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed min-h-[4rem]">
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="text-xs px-3 py-1 bg-secondary/50 hover:bg-primary/20 hover:text-primary transition-colors"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Bottom accent line */}
                <div className="h-1 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Card>
            ))}
          </div>

          {/* Empty state */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No projects found in this category.</p>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="text-center pt-8">
            <p className="text-muted-foreground mb-4">
              Want to see more? Check out my GitHub for additional projects and contributions.
            </p>
            <Button
              variant="outline"
              className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 group"
              onClick={() => window.open("https://github.com", "_blank")}
            >
              <Github className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
              View GitHub Profile
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
