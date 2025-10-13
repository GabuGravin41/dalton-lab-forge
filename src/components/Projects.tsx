import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github } from "lucide-react";

const Projects = () => {
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
    { id: "all", label: "All Projects" },
    { id: "ml", label: "Machine Learning" },
    { id: "hardware", label: "Hardware" },
    { id: "chip", label: "Chip Design" },
    { id: "iot", label: "IoT" },
  ];

  return (
    <section id="projects" className="py-24 px-6 bg-gradient-subtle">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Featured <span className="bg-gradient-primary bg-clip-text text-transparent">Projects</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A selection of work spanning machine learning, hardware design, and systems engineering
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <Card
                key={project.title}
                className="group bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <div className="flex gap-2">
                      {project.github && (
                        <a
                          href={project.github}
                          className="p-2 rounded-lg hover:bg-secondary transition-colors"
                          aria-label="View on GitHub"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {project.demo && (
                        <a
                          href={project.demo}
                          className="p-2 rounded-lg hover:bg-secondary transition-colors"
                          aria-label="View live demo"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="h-1 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
