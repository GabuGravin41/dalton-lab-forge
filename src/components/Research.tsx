import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink, BookOpen, Award, TrendingUp } from "lucide-react";

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
    <section id="research" className="py-32 px-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-accent/20 to-transparent" />
      <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
      <div className="absolute top-1/3 left-0 w-72 h-72 bg-accent/10 rounded-full blur-[100px] animate-glow-pulse" />
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-7xl mx-auto space-y-20">
          {/* Section Header */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full backdrop-blur-sm mb-4">
              <BookOpen className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Academic Contributions</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold">
              Research & <span className="bg-gradient-to-r from-[hsl(30,90%,58%)] to-[hsl(20,85%,55%)] bg-clip-text text-transparent">Publications</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Contributing to the intersection of machine learning and hardware design through
              peer-reviewed publications and innovative research.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 pt-6">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-accent" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground text-lg">3</span> Publications
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground text-lg">6</span> Research Interests
                </span>
              </div>
            </div>
          </div>

          {/* Publications List */}
          <div className="space-y-8">
            {publications.map((pub, index) => (
              <Card
                key={pub.title}
                className="group relative p-6 md:p-8 bg-card/50 backdrop-blur-sm border-border hover:border-accent/50 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/10 overflow-hidden"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                <div className="flex flex-col md:flex-row gap-6 relative">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="p-4 rounded-xl bg-accent/10 group-hover:bg-accent/20 border border-accent/20 group-hover:border-accent/40 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <FileText className="h-8 w-8 text-accent" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-accent transition-colors">
                        {pub.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                        <span className="font-semibold text-foreground/90 px-3 py-1 bg-accent/10 rounded-full">{pub.venue}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground font-medium">{pub.year}</span>
                      </div>
                    </div>
                    <p className="text-foreground/80 leading-relaxed text-base">
                      {pub.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      {pub.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs px-3 py-1.5 bg-secondary/50 hover:bg-accent/20 hover:text-accent transition-colors">
                          {tag}
                        </Badge>
                      ))}
                      <a
                        href={pub.link}
                        className="ml-auto flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-all group/link px-4 py-2 rounded-lg hover:bg-accent/10"
                      >
                        Read Paper
                        <ExternalLink className="h-4 w-4 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Research Interests */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 rounded-3xl blur-3xl" />
            <div className="relative bg-card/30 backdrop-blur-sm border border-border rounded-3xl p-8 md:p-12 space-y-8">
              <div className="text-center space-y-3">
                <h3 className="text-3xl font-bold">
                  Research <span className="bg-gradient-to-r from-[hsl(245,58%,51%)] to-[hsl(260,60%,45%)] bg-clip-text text-transparent">Interests</span>
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Exploring cutting-edge topics at the frontier of AI and hardware innovation
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {interests.map((interest, idx) => (
                  <div
                    key={interest}
                    className="group relative flex items-center gap-3 p-5 rounded-xl bg-background/50 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 rounded-xl transition-opacity" />
                    <div className="relative flex items-center gap-3 w-full">
                      <div className="w-2 h-2 rounded-full bg-gradient-primary animate-pulse" />
                      <span className="text-foreground/90 font-medium group-hover:text-primary transition-colors">{interest}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center pt-6">
                <p className="text-muted-foreground font-medium mb-4">
                  💡 Open to collaborations and research opportunities
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
                  <span className="px-3 py-1 bg-primary/10 rounded-full">Co-authorship</span>
                  <span className="px-3 py-1 bg-accent/10 rounded-full">Joint Projects</span>
                  <span className="px-3 py-1 bg-primary/10 rounded-full">Conference Presentations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Research;
