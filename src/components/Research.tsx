import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink } from "lucide-react";

const Research = () => {
  const publications = [
    {
      title: "Efficient Edge Deployment of Convolutional Neural Networks for Real-Time Applications",
      venue: "International Conference on Machine Learning (ICML) Workshop",
      year: "2024",
      description: "Investigated model compression techniques and hardware acceleration strategies for deploying CNNs on resource-constrained edge devices.",
      tags: ["Edge AI", "Model Compression", "Hardware Acceleration"],
      link: "#",
    },
    {
      title: "Low-Power Circuit Design Techniques for IoT Sensor Nodes",
      venue: "IEEE Transactions on Circuits and Systems",
      year: "2023",
      description: "Proposed novel circuit design methodologies to minimize power consumption in battery-operated IoT devices without sacrificing performance.",
      tags: ["Low Power Design", "IoT", "Analog Circuits"],
      link: "#",
    },
    {
      title: "Bridging Machine Learning and VLSI: A Co-Design Approach",
      venue: "Design Automation Conference (DAC)",
      year: "2023",
      description: "Explored hardware-software co-design strategies for optimizing neural network inference on custom ASIC architectures.",
      tags: ["VLSI", "Neural Network Hardware", "Co-Design"],
      link: "#",
    },
  ];

  const interests = [
    "Hardware-Software Co-Design for AI",
    "Neuromorphic Computing",
    "Efficient Neural Network Architectures",
    "Low-Power Embedded Systems",
    "Quantum Computing Applications",
    "Autonomous Systems",
  ];

  return (
    <section id="research" className="py-24 px-6">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Research & <span className="bg-gradient-accent bg-clip-text text-transparent">Publications</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Contributing to the intersection of machine learning and hardware design
            </p>
          </div>

          <div className="space-y-6">
            {publications.map((pub, index) => (
              <Card
                key={pub.title}
                className="p-6 md:p-8 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-md group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="p-4 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {pub.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-3">
                        <span className="font-medium">{pub.venue}</span>
                        <span>•</span>
                        <span>{pub.year}</span>
                      </div>
                    </div>
                    <p className="text-foreground/80 leading-relaxed">
                      {pub.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      {pub.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      <a
                        href={pub.link}
                        className="ml-auto flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        Read Paper
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="bg-secondary/30 border border-border rounded-2xl p-8 md:p-12 space-y-6">
            <h3 className="text-2xl font-bold text-center">Research Interests</h3>
            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {interests.map((interest) => (
                <div
                  key={interest}
                  className="flex items-center gap-3 p-4 rounded-lg bg-background/50 border border-border/50"
                >
                  <div className="w-2 h-2 rounded-full bg-gradient-primary" />
                  <span className="text-foreground/90">{interest}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-muted-foreground pt-4">
              Open to collaborations and research opportunities in these areas
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Research;
