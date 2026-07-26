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
  Camera
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import PaperModal from "./PaperModal";

export const MinimalistLayout = () => {
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
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="grid md:grid-cols-3 gap-12 items-start">
        
        {/* Left Column: Profile Card */}
        <div className="space-y-6 md:sticky md:top-24">
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            
            {/* Avatar block */}
            <div className="relative group w-32 h-32 rounded-full overflow-hidden border border-border shadow-sm bg-card flex-shrink-0">
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={profile.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-3xl font-extrabold">
                  {profile.name ? profile.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2) : "DO"}
                </div>
              )}
              {isEditMode && (
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white">
                  <label className="cursor-pointer flex flex-col items-center text-[10px] gap-0.5">
                    <Camera className="w-4 h-4" />
                    <span>Upload</span>
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
                      className="text-[9px] text-red-400 hover:text-red-300 font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Profile info */}
            <div className="space-y-2 w-full">
              {isEditMode ? (
                <div className="space-y-2">
                  <div>
                    <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Full Name</Label>
                    <Input 
                      value={profile.name || ""} 
                      onChange={(e) => updateProfile("name", e.target.value)}
                      className="h-8 text-sm font-bold bg-background/50 border-primary/20"
                    />
                  </div>
                  <div>
                    <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Title / Role</Label>
                    <Input 
                      value={(profile.roles || [])[0] || ""} 
                      onChange={(e) => updateProfile("roles", [e.target.value])}
                      className="h-8 text-xs bg-background/50 border-primary/20"
                    />
                  </div>
                  <div>
                    <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Location</Label>
                    <Input 
                      value={profile.location || ""} 
                      onChange={(e) => updateProfile("location", e.target.value)}
                      className="h-8 text-xs bg-background/50 border-primary/20"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">{profile.name || "Your Name"}</h1>
                  <p className="text-sm font-medium text-primary">{(profile.roles || [])[0] || "Your Title"}</p>
                  <p className="text-xs text-muted-foreground">{profile.location || "Location"}</p>
                </>
              )}
            </div>

            {/* Short Bio */}
            <div className="w-full text-sm text-muted-foreground leading-relaxed pt-2">
              {isEditMode ? (
                <div>
                  <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Brief Intro Bio</Label>
                  <Textarea 
                    value={profile.bio || ""} 
                    onChange={(e) => updateProfile("bio", e.target.value)}
                    className="min-h-[80px] text-xs bg-background/50 border-primary/20"
                  />
                </div>
              ) : (
                <p>{profile.bio}</p>
              )}
            </div>

            {/* Social Links Panel */}
            <div className="w-full pt-4 space-y-3">
              <div className="flex flex-wrap gap-2.5 justify-center md:justify-start">
                {socials.github && (
                  <a href={socials.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-card border border-border/80 hover:border-primary/50 text-muted-foreground hover:text-foreground rounded-lg transition-all" title="GitHub">
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {socials.linkedin && (
                  <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-card border border-border/80 hover:border-primary/50 text-muted-foreground hover:text-foreground rounded-lg transition-all" title="LinkedIn">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {socials.email && (
                  <a href={`mailto:${socials.email}`} className="p-2 bg-card border border-border/80 hover:border-primary/50 text-muted-foreground hover:text-foreground rounded-lg transition-all" title="Email">
                    <Mail className="w-4 h-4" />
                  </a>
                )}
                {socials.twitter && (
                  <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-card border border-border/80 hover:border-primary/50 text-muted-foreground hover:text-foreground rounded-lg transition-all" title="Twitter / X">
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {socials.instagram && (
                  <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-card border border-border/80 hover:border-primary/50 text-muted-foreground hover:text-foreground rounded-lg transition-all" title="Instagram">
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
              </div>

              {isEditMode && (
                <div className="bg-card/40 border border-border/60 p-3 rounded-lg space-y-2 text-left">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Social URLs</span>
                  <div className="space-y-1.5">
                    <Input 
                      placeholder="GitHub Link" 
                      value={socials.github || ""} 
                      onChange={(e) => updateProfile("socials", { ...socials, github: e.target.value })}
                      className="h-7 text-[10px] bg-background/50 border-border/50"
                    />
                    <Input 
                      placeholder="LinkedIn Link" 
                      value={socials.linkedin || ""} 
                      onChange={(e) => updateProfile("socials", { ...socials, linkedin: e.target.value })}
                      className="h-7 text-[10px] bg-background/50 border-border/50"
                    />
                    <Input 
                      placeholder="Email Address" 
                      value={socials.email || ""} 
                      onChange={(e) => updateProfile("socials", { ...socials, email: e.target.value })}
                      className="h-7 text-[10px] bg-background/50 border-border/50"
                    />
                    <Input 
                      placeholder="Twitter URL" 
                      value={socials.twitter || ""} 
                      onChange={(e) => updateProfile("socials", { ...socials, twitter: e.target.value })}
                      className="h-7 text-[10px] bg-background/50 border-border/50"
                    />
                  </div>
                </div>
              )}

              {/* Resume download button */}
              <a href="/resume" className="block w-full">
                <Button variant="outline" className="w-full text-xs h-9 gap-2 border-border/80 hover:border-primary/50">
                  <Download className="w-3.5 h-3.5" />
                  View/Download Resume
                </Button>
              </a>
            </div>

          </div>
        </div>

        {/* Right Column: Main Content Area */}
        <div className="md:col-span-2 space-y-12">
          
          {/* Section 1: Statement / About */}
          <div className="space-y-3 pb-6 border-b border-border/40">
            <h2 className="text-xs uppercase tracking-widest text-primary font-bold">Biography</h2>
            {isEditMode ? (
              <div className="space-y-3">
                <div>
                  <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">About Headline</Label>
                  <Input 
                    value={profile.about?.intersectionHeadline || ""} 
                    onChange={(e) => updateProfile("about", { ...profile.about, intersectionHeadline: e.target.value })}
                    className="h-8 text-xs font-semibold bg-background/50 border-primary/20"
                  />
                </div>
                <div>
                  <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">About Content</Label>
                  <Textarea 
                    value={profile.about?.intersectionBody || ""} 
                    onChange={(e) => updateProfile("about", { ...profile.about, intersectionBody: e.target.value })}
                    className="min-h-[100px] text-xs leading-relaxed bg-background/50 border-primary/20"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-sm text-foreground/90 leading-relaxed font-sans">
                <p className="text-base font-medium text-foreground">{profile.about?.intersectionHeadline}</p>
                <p>{profile.about?.intersectionBody}</p>
              </div>
            )}
          </div>

          {/* Section 2: Projects List */}
          <div className="space-y-4 pb-6 border-b border-border/40">
            <div className="flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-widest text-primary font-bold">Selected Projects</h2>
              {isEditMode && (
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newProj = {
                      title: "New Project",
                      role: "Lead Developer",
                      description: "Brief summary of what you built...",
                      category: "Software",
                      tech: ["React", "Tailwind"],
                      githubUrl: "",
                      liveUrl: "",
                      imageUrl: "",
                      priority: 1
                    };
                    updateProjects([...projects, newProj]);
                    toast.success("New project added!");
                  }}
                  className="h-7 text-[10px] px-2 gap-1 border-primary/30 text-primary hover:bg-primary/5"
                >
                  <Plus className="w-3 h-3" /> Add Project
                </Button>
              )}
            </div>

            <div className="space-y-6">
              {sortedProjects.map((project, idx) => {
                const projIndex = projects.findIndex(p => p.title === project.title);
                return (
                  <div key={idx} className="group relative space-y-2 border border-border/40 hover:border-primary/30 p-4 rounded-lg bg-card/10 transition-colors">
                    
                    {/* Inline Editor */}
                    {isEditMode ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-border/30 pb-2">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Project #{idx + 1}</span>
                          <button
                            onClick={() => {
                              const updated = projects.filter((_, i) => i !== projIndex);
                              updateProjects(updated);
                              toast.success("Project removed.");
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
                            <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">GitHub Link</Label>
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
                            <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Live Link</Label>
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
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors">{project.title}</h3>
                            <span className="text-xs text-muted-foreground font-medium">{project.role || "Role"} • {project.category}</span>
                          </div>
                          
                          {/* Links */}
                          <div className="flex items-center gap-2">
                            {project.githubUrl && (
                              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground p-1 transition-colors" title="GitHub">
                                <Github className="w-4 h-4" />
                              </a>
                            )}
                            {project.liveUrl && (
                              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground p-1 transition-colors" title="Live Link">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed pt-1">{project.description}</p>
                        
                        {/* Tech tags */}
                        {project.tech && project.tech.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {project.tech.map((t: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 bg-muted/60 text-[10px] font-mono text-muted-foreground rounded border border-border/40">
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

          {/* Section 3: Publications / Research (if not hidden) */}
          {!profile?.hideResearch && (
            <div className="space-y-4 pb-6 border-b border-border/40">
              <div className="flex items-center justify-between">
                <h2 className="text-xs uppercase tracking-widest text-primary font-bold">Publications & Research</h2>
                {isEditMode && (
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newPaper = {
                        title: "New Research Publication",
                        authors: profile.name || "Your Name",
                        venue: "IEEE Conference or Journal...",
                        year: new Date().getFullYear().toString(),
                        abstract: "Brief summary of findings...",
                        tags: ["Deep Learning"],
                        pdfPath: "",
                        status: "published" as const,
                        priority: 1
                      };
                      updatePapers([...papers, newPaper]);
                      toast.success("New publication added!");
                    }}
                    className="h-7 text-[10px] px-2 gap-1 border-primary/30 text-primary hover:bg-primary/5"
                  >
                    <Plus className="w-3 h-3" /> Add Paper
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                {sortedPapers.map((paper, idx) => {
                  const paperIndex = papers.findIndex(p => p.title === paper.title);
                  return (
                    <div key={idx} className="group relative space-y-2 border border-border/40 hover:border-primary/30 p-4 rounded-lg bg-card/10 transition-colors">
                      {isEditMode ? (
                        <div className="space-y-3">
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
                                  updatePapers(updated);
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
                          <div>
                            <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Abstract / Summary</Label>
                            <Textarea 
                              value={paper.abstract || ""} 
                              onChange={(e) => {
                                const updated = [...papers];
                                updated[paperIndex] = { ...updated[paperIndex], abstract: e.target.value };
                                updatePapers(updated);
                              }}
                              className="min-h-[50px] text-xs bg-background/50"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 
                                onClick={() => { setSelectedPaper(paper); setIsPaperModalOpen(true); }}
                                className="font-semibold text-foreground text-base group-hover:text-primary transition-colors cursor-pointer hover:underline"
                              >
                                {paper.title}
                              </h3>
                              <p className="text-xs text-muted-foreground font-medium pt-0.5">
                                {paper.authors} ({paper.year}) • <span className="italic">{paper.venue || "Unspecified venue"}</span>
                              </p>
                            </div>
                            {paper.pdfPath && (
                              <a href={paper.pdfPath} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground p-1 transition-colors" title="PDF Document">
                                <FileText className="w-4 h-4" />
                              </a>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pt-1">{paper.abstract}</p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 4: Research Statement / Focus (if present and not hidden) */}
          {profile.researchCollabs && (
            <div className="space-y-3 pb-6 border-b border-border/40">
              <h2 className="text-xs uppercase tracking-widest text-primary font-bold">Research Statement</h2>
              {isEditMode ? (
                <div>
                  <Label className="text-[9px] uppercase tracking-wider text-muted-foreground">Collabs / Statement</Label>
                  <Textarea 
                    value={profile.researchCollabs || ""} 
                    onChange={(e) => updateProfile("researchCollabs", e.target.value)}
                    className="min-h-[80px] text-xs bg-background/50 border-primary/20"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">{profile.researchCollabs}</p>
              )}
            </div>
          )}

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
