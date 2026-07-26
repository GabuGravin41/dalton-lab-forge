import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Sparkles, Star, Trash2, Plus } from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const { projects, updateProjects, profile, isEditMode } = usePortfolio();

  const categories = [
    { id: "all", label: "All Projects", icon: "🎯" },
    { id: "ml", label: "Machine Learning", icon: "🧠" },
    { id: "hardware", label: "Hardware", icon: "⚡" },
    { id: "chip", label: "Chip Design", icon: "🔬" },
    { id: "iot", label: "IoT", icon: "📡" },
  ];

  const sortedProjects = [...projects].sort((a, b) => (b.priority || 0) - (a.priority || 0));

  const filteredProjects = activeFilter === "all" 
    ? sortedProjects 
    : sortedProjects.filter(p => p.category === activeFilter);

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
                key={project.title + index}
                className="group relative bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden hover:-translate-y-2 flex flex-col justify-between"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Project Card Image / Header */}
                <div className="relative w-full h-40 bg-muted overflow-hidden border-b border-border/40 group/projphoto">
                  {project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 via-accent/5 to-primary/20 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-primary/30 group-hover:scale-110 transition-transform" />
                    </div>
                  )}

                  {isEditMode && (
                    <div className="absolute inset-0 bg-black/75 opacity-0 group-hover/projphoto:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white font-semibold">
                      <label className="flex flex-col items-center justify-center cursor-pointer text-[10px] gap-1">
                        <span>📸 Set Project Image</span>
                        <span className="text-[8px] text-muted-foreground">(Max 2MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 2 * 1024 * 1024) {
                              alert("Image too large. Maximum size is 2MB.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              const dataUrl = reader.result as string;
                              try {
                                const token = localStorage.getItem("portfolio_token");
                                const res = await fetch("/api/upload-project-image", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({ dataUrl, mimeType: file.type }),
                                });
                                if (!res.ok) {
                                  const err = await res.json();
                                  throw new Error(err.error || "Failed to upload");
                                }
                                const updated = [...projects];
                                const projIndex = projects.findIndex(p => p.title === project.title);
                                if (projIndex !== -1) {
                                  updated[projIndex] = { ...updated[projIndex], imageUrl: dataUrl };
                                  updateProjects(updated);
                                  toast.success("Project image uploaded!");
                                }
                              } catch (err: any) {
                                alert(err.message || "Failed to upload image");
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      {project.imageUrl && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-6 text-[9px] font-medium px-2 bg-red-600 hover:bg-red-700 text-white rounded-md border-0"
                          onClick={(e) => {
                            e.preventDefault();
                            const updated = [...projects];
                            const projIndex = projects.findIndex(p => p.title === project.title);
                            if (projIndex !== -1) {
                              updated[projIndex] = { ...updated[projIndex], imageUrl: "" };
                              updateProjects(updated);
                              toast.success("Project image removed!");
                            }
                          }}
                        >
                          Remove Image
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none" />
                
                {/* Glow effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-150 pointer-events-none" />
                
                <div className="relative p-4 md:p-6 space-y-3 md:space-y-4 flex-1 flex flex-col justify-between">
                  {isEditMode ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Priority Rating</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => {
                            const updated = projects.filter((_, idx) => projects.findIndex(p => p.title === project.title) !== idx);
                            updateProjects(updated);
                            toast.success("Project card removed.");
                          }}
                          className="h-6 w-6 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => {
                              const updated = [...projects];
                              const projIndex = projects.findIndex(p => p.title === project.title);
                              if (projIndex !== -1) {
                                updated[projIndex] = { ...updated[projIndex], priority: star };
                                updateProjects(updated);
                              }
                            }}
                            className="focus:outline-none hover:scale-110 transition-transform"
                          >
                            <Star className={`w-4.5 h-4.5 ${star <= (project.priority || 0) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                          </button>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Title</Label>
                        <Input
                          value={project.title || ""}
                          onChange={(e) => {
                            const updated = [...projects];
                            const projIndex = projects.findIndex(p => p.title === project.title);
                            if (projIndex !== -1) {
                              updated[projIndex] = { ...updated[projIndex], title: e.target.value };
                              updateProjects(updated);
                            }
                          }}
                          className="h-8 bg-background/40 border-primary/20 text-xs font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Description</Label>
                        <Textarea
                          value={project.description || ""}
                          onChange={(e) => {
                            const updated = [...projects];
                            const projIndex = projects.findIndex(p => p.title === project.title);
                            if (projIndex !== -1) {
                              updated[projIndex] = { ...updated[projIndex], description: e.target.value };
                              updateProjects(updated);
                            }
                          }}
                          className="min-h-[60px] bg-background/40 border-primary/20 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Category</Label>
                        <Select 
                          value={project.category} 
                          onValueChange={(val) => {
                            const updated = [...projects];
                            const projIndex = projects.findIndex(p => p.title === project.title);
                            if (projIndex !== -1) {
                              updated[projIndex] = { ...updated[projIndex], category: val };
                              updateProjects(updated);
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs bg-background/40 border-primary/20">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ml">Machine Learning</SelectItem>
                            <SelectItem value="hardware">Hardware</SelectItem>
                            <SelectItem value="chip">Chip Design</SelectItem>
                            <SelectItem value="iot">IoT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Skills Tags (comma separated)</Label>
                        <Input
                          value={(project.tags || []).join(", ")}
                          onChange={(e) => {
                            const updated = [...projects];
                            const projIndex = projects.findIndex(p => p.title === project.title);
                            if (projIndex !== -1) {
                              updated[projIndex] = { ...updated[projIndex], tags: e.target.value.split(",").map((t: string) => t.trim()) };
                              updateProjects(updated);
                            }
                          }}
                          className="h-8 bg-background/40 border-primary/20 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">GitHub Link</Label>
                          <Input
                            value={project.github || ""}
                            onChange={(e) => {
                              const updated = [...projects];
                              const projIndex = projects.findIndex(p => p.title === project.title);
                              if (projIndex !== -1) {
                                updated[projIndex] = { ...updated[projIndex], github: e.target.value };
                                updateProjects(updated);
                              }
                            }}
                            className="h-7 bg-background/40 border-primary/20 text-[10px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Demo Link</Label>
                          <Input
                            value={project.demo || ""}
                            onChange={(e) => {
                              const updated = [...projects];
                              const projIndex = projects.findIndex(p => p.title === project.title);
                              if (projIndex !== -1) {
                                updated[projIndex] = { ...updated[projIndex], demo: e.target.value };
                                updateProjects(updated);
                              }
                            }}
                            className="h-7 bg-background/40 border-primary/20 text-[10px]"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
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
                        {(project.tags || []).map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="text-xs px-3 py-1 bg-secondary/50 hover:bg-primary/20 hover:text-primary transition-colors"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Bottom accent line */}
                <div className="h-1 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Card>
            ))}
            {isEditMode && (
              <Card 
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary/30 hover:border-primary/60 bg-primary/5 hover:bg-primary/10 cursor-pointer min-h-[250px] transition-all duration-300 rounded-xl"
                onClick={() => {
                  const newProj = {
                    title: `New Project ${projects.length + 1}`,
                    description: "Provide a description of your custom project features here.",
                    tags: ["System", "Design"],
                    github: "",
                    demo: "",
                    category: activeFilter === "all" ? "ml" : activeFilter,
                    priority: 3
                  };
                  updateProjects([...projects, newProj]);
                  toast.success("New project card added! Fill in its details.");
                }}
              >
                <Plus className="w-10 h-10 text-primary mb-2 animate-bounce" />
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Add Project Card</span>
              </Card>
            )}
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
              onClick={() => window.open(profile?.socials?.github || "https://github.com", "_blank")}
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
