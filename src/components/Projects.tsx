import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Sparkles } from "lucide-react";
import projectsData from "@/data/projects.json";
import profileData from "@/data/profile.json";

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const projects = projectsData;

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
    <section id="projects" className="py-16 md:py-24 lg:py-32 px-4 sm:px-6 bg-gradient-subtle relative overflow-hidden z-10">
      {/* Background decoration */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent/10 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: "3s" }} />
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-7xl mx-auto space-y-10 md:space-y-12 lg:space-y-16">
          <div className="text-center space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-sm mb-2 md:mb-4">
              <Sparkles className="w-3 md:w-4 h-3 md:h-4 text-primary" />
              <span className="text-xs md:text-sm font-medium text-foreground">Portfolio Showcase</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold">
              Featured <span className="bg-gradient-to-r from-[hsl(245,58%,51%)] to-[hsl(260,60%,45%)] bg-clip-text text-transparent">Projects</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A selection of work spanning machine learning, hardware design, and systems engineering.
              Each project represents a unique challenge solved with innovative solutions.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                variant={activeFilter === category.id ? "default" : "outline"}
                className={`group transition-all duration-300 text-xs md:text-sm ${
                  activeFilter === category.id
                    ? "bg-gradient-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "border-border hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <span className="text-sm md:text-base mr-1 md:mr-2">{category.icon}</span>
                <span className="hidden sm:inline">{category.label}</span>
                <span className="sm:hidden">{category.label.split(' ')[0]}</span>
              </Button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
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
                
                <div className="relative p-4 md:p-6 space-y-3 md:space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 md:gap-3">
                    <h3 className="text-base md:text-lg lg:text-xl font-bold group-hover:text-primary transition-colors flex-1">
                      {project.title}
                    </h3>
                    <div className="flex gap-1 md:gap-2 flex-shrink-0">
                      {project.github && (
                        <a
                          href={project.github}
                          className="p-1.5 md:p-2 rounded-lg bg-background/50 hover:bg-primary/20 hover:text-primary transition-all hover:scale-110"
                          aria-label="View on GitHub"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Github className="h-3 w-3 md:h-4 md:w-4" />
                        </a>
                      )}
                      {project.demo && (
                        <a
                          href={project.demo}
                          className="p-1.5 md:p-2 rounded-lg bg-background/50 hover:bg-accent/20 hover:text-accent transition-all hover:scale-110"
                          aria-label="View live demo"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3 md:h-4 md:w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed min-h-[3rem] md:min-h-[4rem]">
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
              onClick={() => window.open(profileData.socials.github, "_blank")}
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
