import { usePortfolio } from "@/context/PortfolioContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Github, 
  Linkedin, 
  Mail, 
  Twitter, 
  Instagram, 
  Sparkles, 
  BookOpen, 
  FileText, 
  ExternalLink, 
  Trash2, 
  Plus, 
  Star,
  Download,
  Camera,
  Layers,
  Award
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import PaperModal from "./PaperModal";

export const CreativeLayout = () => {
  const { 
    profile, 
    updateProfile, 
    projects, 
    updateProjects, 
    papers, 
    updatePapers, 
    isEditMode 
  } = usePortfolio();

  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);

  const socials = profile.socials || {};

  // Sort lists
  const sortedProjects = [...projects].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  const sortedPapers = [...papers].sort((a, b) => (b.priority || 0) - (a.priority || 0));

  const handleAvatarUpload = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert("Image too large. Maximum size is 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      try {
        const token = localStorage.getItem("portfolio_token");
        const res = await fetch("/api/upload-avatar", {
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
        updateProfile("avatarUrl", dataUrl);
        toast.success("Profile photo uploaded!");
      } catch (err: any) {
        alert(err.message || "Failed to upload image");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarRemove = async () => {
    try {
      const token = localStorage.getItem("portfolio_token");
      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ dataUrl: "" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to remove photo");
      }
      updateProfile("avatarUrl", "");
      toast.success("Profile photo removed!");
    } catch (err: any) {
      alert(err.message || "Failed to remove photo");
    }
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      
      {/* Dynamic abstract decorative backgrounds */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-glow-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/15 rounded-full blur-[140px] pointer-events-none animate-float" />
      
      <div className="container mx-auto px-6 py-20 relative z-10 max-w-6xl space-y-24">
        
        {/* Header Hero Area: Bold Typography & Large Staggered Columns */}
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Column 1: Staggered Large Name & Bio */}
          <div className="lg:col-span-8 space-y-6 text-center lg:text-left">
            <div className="inline-block relative">
              <span className="absolute -top-6 -left-3 text-xs font-mono text-accent animate-pulse uppercase tracking-widest">
                ✦ CREATIVE SHOWCASE
              </span>
              {isEditMode ? (
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Full Name</Label>
                  <Input 
                    value={profile.name || ""} 
                    onChange={(e) => updateProfile("name", e.target.value)}
                    className="h-12 text-3xl font-black bg-background/50 border-primary/30"
                  />
                </div>
              ) : (
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none uppercase">
                  {profile.name || "Your Name"}
                </h1>
              )}
            </div>

            <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent uppercase tracking-wider">
              {isEditMode ? (
                <div>
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Title / Role</Label>
                  <Input 
                    value={(profile.roles || [])[0] || ""} 
                    onChange={(e) => updateProfile("roles", [e.target.value])}
                    className="h-8 text-sm bg-background/50 border-primary/30"
                  />
                </div>
              ) : (
                <span>{(profile.roles || [])[0] || "Creative Developer"}</span>
              )}
            </div>

            <div className="max-w-2xl text-muted-foreground text-sm sm:text-base leading-relaxed font-medium">
              {isEditMode ? (
                <div>
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase">Short Bio</Label>
                  <Textarea 
                    value={profile.bio || ""} 
                    onChange={(e) => updateProfile("bio", e.target.value)}
                    className="min-h-[80px] text-xs bg-background/50 border-primary/30"
                  />
                </div>
              ) : (
                <p>{profile.bio}</p>
              )}
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
              <a href="/resume">
                <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg hover:scale-105 transition-all font-semibold uppercase tracking-wider text-xs h-10 px-6 gap-2">
                  <Download className="w-4 h-4" /> Download CV
                </Button>
              </a>
              <a href="#contact">
                <Button variant="outline" className="border-primary/50 hover:bg-primary/10 uppercase tracking-wider text-xs h-10 px-6">
                  Let's Collab
                </Button>
              </a>
            </div>
          </div>

          {/* Column 2: Large Visual Avatar Frame */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative group w-64 h-64 sm:w-72 sm:h-72">
              
              {/* Asymmetrical glowing borders */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent rounded-3xl blur-md opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
              <div className="absolute inset-0.5 bg-background rounded-3xl z-10" />
              
              {/* Photo container */}
              <div className="absolute inset-3 rounded-2xl overflow-hidden z-20 bg-card/60 flex items-center justify-center">
                {profile.avatarUrl ? (
                  <img 
                    src={profile.avatarUrl} 
                    alt={profile.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-accent flex items-center justify-center text-accent-foreground text-5xl font-black">
                    {profile.name ? profile.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2) : "DO"}
                  </div>
                )}
                
                {isEditMode && (
                  <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white z-30">
                    <label className="cursor-pointer flex flex-col items-center text-xs gap-1 font-bold">
                      <Camera className="w-5 h-5 text-accent" />
                      <span>UPLOAD PHOTO</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAvatarUpload(file);
                        }} 
                      />
                    </label>
                    {profile.avatarUrl && (
                      <button 
                        onClick={handleAvatarRemove}
                        className="text-[10px] text-red-400 hover:text-red-300 font-bold tracking-wider"
                      >
                        REMOVE PHOTO
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Section 1: Biography / Headline */}
        <div className="space-y-6 relative">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black uppercase tracking-wider text-foreground">
              ✦ Vision Statement
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
          </div>
          
          <div className="bg-card/30 backdrop-blur-md border border-primary/20 p-6 md:p-8 rounded-3xl space-y-4 shadow-xl">
            {isEditMode ? (
              <div className="space-y-3">
                <div>
                  <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Vision Headline</Label>
                  <Input 
                    value={profile.about?.intersectionHeadline || ""} 
                    onChange={(e) => updateProfile("about", { ...profile.about, intersectionHeadline: e.target.value })}
                    className="h-9 text-sm font-semibold bg-background/50 border-primary/30"
                  />
                </div>
                <div>
                  <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Vision Details</Label>
                  <Textarea 
                    value={profile.about?.intersectionBody || ""} 
                    onChange={(e) => updateProfile("about", { ...profile.about, intersectionBody: e.target.value })}
                    className="min-h-[100px] text-xs leading-relaxed bg-background/50 border-primary/30"
                  />
                </div>
              </div>
            ) : (
              <>
                <p className="text-xl font-bold text-foreground leading-snug">
                  "{profile.about?.intersectionHeadline}"
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {profile.about?.intersectionBody}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Section 2: Interactive Projects Showcase */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <h2 className="text-2xl font-black uppercase tracking-wider text-foreground">
                ✦ Selected Works
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            </div>
            {isEditMode && (
              <Button 
                size="sm"
                onClick={() => {
                  const newProj = {
                    title: "Brand New Build",
                    role: "Creator",
                    description: "Details about this production...",
                    category: "Hardware & Software",
                    tech: ["React", "AI"],
                    githubUrl: "",
                    liveUrl: "",
                    imageUrl: "",
                    priority: 1
                  };
                  updateProjects([...projects, newProj]);
                  toast.success("New project added!");
                }}
                className="ml-4 h-8 bg-gradient-accent text-accent-foreground text-xs uppercase font-bold tracking-wider"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Work
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {sortedProjects.map((project, idx) => {
              const projIndex = projects.findIndex(p => p.title === project.title);
              return (
                <div key={idx} className="group relative bg-card/25 backdrop-blur-sm border border-border/80 hover:border-primary/50 p-6 rounded-3xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 flex flex-col justify-between space-y-4">
                  {isEditMode ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-border/30 pb-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Work Item #{idx + 1}</span>
                        <button
                          onClick={() => {
                            const updated = projects.filter((_, i) => i !== projIndex);
                            updateProjects(updated);
                            toast.success("Work removed.");
                          }}
                          className="text-destructive hover:bg-destructive/10 p-1 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Title</Label>
                          <Input 
                            value={project.title || ""} 
                            onChange={(e) => {
                              const updated = [...projects];
                              updated[projIndex] = { ...updated[projIndex], title: e.target.value };
                              updateProjects(updated);
                            }}
                            className="h-7 text-xs bg-background/50"
                          />
                        </div>
                        <div>
                          <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Role</Label>
                          <Input 
                            value={project.role || ""} 
                            onChange={(e) => {
                              const updated = [...projects];
                              updated[projIndex] = { ...updated[projIndex], role: e.target.value };
                              updateProjects(updated);
                            }}
                            className="h-7 text-xs bg-background/50"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Description</Label>
                        <Textarea 
                          value={project.description || ""} 
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[projIndex] = { ...updated[projIndex], description: e.target.value };
                            updateProjects(updated);
                          }}
                          className="min-h-[50px] text-xs bg-background/50"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">GitHub URL</Label>
                          <Input 
                            value={project.githubUrl || ""} 
                            onChange={(e) => {
                              const updated = [...projects];
                              updated[projIndex] = { ...updated[projIndex], githubUrl: e.target.value };
                              updateProjects(updated);
                            }}
                            className="h-7 text-xs bg-background/50"
                          />
                        </div>
                        <div>
                          <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Live URL</Label>
                          <Input 
                            value={project.liveUrl || ""} 
                            onChange={(e) => {
                              const updated = [...projects];
                              updated[projIndex] = { ...updated[projIndex], liveUrl: e.target.value };
                              updateProjects(updated);
                            }}
                            className="h-7 text-xs bg-background/50"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="px-2.5 py-0.5 bg-accent/15 text-accent text-[9px] font-bold uppercase rounded-full tracking-wider">
                              {project.category}
                            </span>
                            <h3 className="text-xl font-bold pt-1.5 uppercase group-hover:text-primary transition-colors">
                              {project.title}
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium">{project.role}</p>
                          </div>
                          
                          {/* Links */}
                          <div className="flex gap-2">
                            {project.githubUrl && (
                              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 border border-border/80 hover:border-primary/50 text-muted-foreground hover:text-foreground rounded-lg transition-colors bg-background/30" title="Code Repository">
                                <Github className="w-4 h-4" />
                              </a>
                            )}
                            {project.liveUrl && (
                              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="p-2 border border-border/80 hover:border-primary/50 text-muted-foreground hover:text-foreground rounded-lg transition-colors bg-background/30" title="Live Preview">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      {project.tech && project.tech.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {project.tech.map((t: string, idx: number) => (
                            <span key={idx} className="px-2.5 py-0.5 bg-primary/10 text-primary text-[9px] font-bold uppercase rounded-full">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Publications Staggered Rows */}
        {!profile?.hideResearch && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <h2 className="text-2xl font-black uppercase tracking-wider text-foreground">
                  ✦ Press & Research
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
              </div>
              {isEditMode && (
                <Button 
                  size="sm"
                  onClick={() => {
                    const newPaper = {
                      title: "Novel Structural Design",
                      authors: profile.name || "Your Name",
                      venue: "Conference proceedings...",
                      year: new Date().getFullYear().toString(),
                      abstract: "Summary...",
                      tags: ["Innovations"],
                      pdfPath: "",
                      status: "published" as const,
                      priority: 1
                    };
                    updatePapers([...papers, newPaper]);
                    toast.success("New paper added!");
                  }}
                  className="ml-4 h-8 bg-gradient-accent text-accent-foreground text-xs uppercase font-bold tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Press
                </Button>
              )}
            </div>

            <div className="space-y-6">
              {sortedPapers.map((paper, idx) => {
                const paperIndex = papers.findIndex(p => p.title === paper.title);
                return (
                  <div key={idx} className="group relative bg-card/20 backdrop-blur-sm border border-border/60 p-6 rounded-3xl transition-all duration-300 hover:border-accent/40 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    
                    {isEditMode ? (
                      <div className="space-y-3 w-full">
                        <div className="flex items-center justify-between border-b border-border/30 pb-2">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Paper #{idx + 1}</span>
                          <button
                            onClick={() => {
                              const updated = papers.filter((_, i) => i !== paperIndex);
                              updatePapers(updated);
                              toast.success("Paper removed.");
                            }}
                            className="text-destructive hover:bg-destructive/10 p-1 rounded-md"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div>
                          <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Title</Label>
                          <Input 
                            value={paper.title || ""} 
                            onChange={(e) => {
                              const updated = [...papers];
                              updated[paperIndex] = { ...updated[paperIndex], title: e.target.value };
                              updatePapers(updated);
                            }}
                            className="h-7 text-xs bg-background/50"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Authors</Label>
                            <Input 
                              value={paper.authors || ""} 
                              onChange={(e) => {
                                const updated = [...papers];
                                updated[paperIndex] = { ...updated[paperIndex], authors: e.target.value };
                                updatePapers(updated);
                              }}
                              className="h-7 text-xs bg-background/50"
                            />
                          </div>
                          <div>
                            <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Year</Label>
                            <Input 
                              value={paper.year || ""} 
                              onChange={(e) => {
                                const updated = [...papers];
                                updated[paperIndex] = { ...updated[paperIndex], year: e.target.value };
                                updateProjects(updated);
                              }}
                              className="h-7 text-xs bg-background/50"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Venue</Label>
                          <Input 
                            value={paper.venue || ""} 
                            onChange={(e) => {
                              const updated = [...papers];
                              updated[paperIndex] = { ...updated[paperIndex], venue: e.target.value };
                              updatePapers(updated);
                            }}
                            className="h-7 text-xs bg-background/50"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-accent" />
                            <span className="text-xs font-mono text-muted-foreground uppercase">{paper.venue} • {paper.year}</span>
                          </div>
                          <h3 
                            onClick={() => { setSelectedPaper(paper); setIsPaperModalOpen(true); }}
                            className="text-lg font-bold uppercase leading-tight hover:text-accent transition-colors cursor-pointer hover:underline"
                          >
                            {paper.title}
                          </h3>
                          <p className="text-xs text-muted-foreground leading-normal">{paper.authors}</p>
                          <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed pt-1">{paper.abstract}</p>
                        </div>
                        
                        <div className="flex gap-2 w-full md:w-auto justify-end">
                          {paper.pdfPath && (
                            <a href={paper.pdfPath} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-bold tracking-wider border-border/80 hover:border-accent/50 gap-1.5">
                                <FileText className="w-3.5 h-3.5" /> PDF
                              </Button>
                            </a>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { setSelectedPaper(paper); setIsPaperModalOpen(true); }}
                            className="h-8 text-[10px] uppercase font-bold tracking-wider hover:bg-card"
                          >
                            Abstract
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 4: Contact details */}
        <div id="contact" className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black uppercase tracking-wider text-foreground">
              ✦ Connections
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 p-8 rounded-3xl grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-3">
              <h3 className="text-xl font-bold uppercase tracking-tight">Let's create something together</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If you have a project idea, a research collaboration proposal, or just want to chat about AI and hardware, hit me up!
              </p>
            </div>
            
            <div className="space-y-3">
              {socials.email && (
                <a href={`mailto:${socials.email}`} className="flex items-center gap-3 p-3 bg-background/50 border border-border/80 hover:border-primary/50 rounded-2xl transition-all">
                  <Mail className="w-4.5 h-4.5 text-primary" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase font-mono text-muted-foreground font-bold">Direct Email</div>
                    <div className="text-xs font-semibold">{socials.email}</div>
                  </div>
                </a>
              )}
              <div className="flex gap-2">
                {socials.github && (
                  <a href={socials.github} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2 border border-border/80 hover:border-primary/50 rounded-xl bg-background/30 text-xs font-bold uppercase tracking-wider transition-colors">
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                )}
                {socials.linkedin && (
                  <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2 border border-border/80 hover:border-primary/50 rounded-xl bg-background/30 text-xs font-bold uppercase tracking-wider transition-colors">
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {selectedPaper && (
        <PaperModal 
          isOpen={isPaperModalOpen}
          onClose={() => { setSelectedPaper(null); setIsPaperModalOpen(false); }}
          paper={selectedPaper}
        />
      )}
    </div>
  );
};
