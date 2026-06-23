import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Printer,
  ArrowLeft,
  Mail,
  Github,
  Linkedin,
  ExternalLink,
  BookOpen,
  Briefcase,
  GraduationCap,
  Sparkles,
  Award,
} from "lucide-react";
import profileData from "@/data/profile.json";
import projectsData from "@/data/projects.json";
import papersData from "@/data/papers.json";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";

type ResumeTemplate = "modern" | "academic" | "minimal";

const Resume = () => {
  const [template, setTemplate] = useState<ResumeTemplate>("modern");
  const [focus, setFocus] = useState<"engineering" | "research">(() => {
    const saved = localStorage.getItem("portfolio_resume_focus");
    return (saved === "engineering" || saved === "research") ? saved : "engineering";
  });

  useEffect(() => {
    const syncFocus = () => {
      const saved = localStorage.getItem("portfolio_resume_focus");
      if (saved === "engineering" || saved === "research") {
        setFocus(saved);
      }
    };
    window.addEventListener("portfolio-focus-change", syncFocus);
    window.addEventListener("storage", syncFocus);
    return () => {
      window.removeEventListener("portfolio-focus-change", syncFocus);
      window.removeEventListener("storage", syncFocus);
    };
  }, []);

  const updateFocus = (newFocus: "engineering" | "research") => {
    setFocus(newFocus);
    localStorage.setItem("portfolio_resume_focus", newFocus);
    window.dispatchEvent(new CustomEvent("portfolio-focus-change"));
  };

  // Load from local storage (or fallback to static data files)
  const [profile] = useState<any>(() => {
    const saved = localStorage.getItem("portfolio_profile");
    return saved ? JSON.parse(saved) : profileData;
  });
  const [projects] = useState<any[]>(() => {
    const saved = localStorage.getItem("portfolio_projects");
    return saved ? JSON.parse(saved) : projectsData;
  });
  const [papers] = useState<any[]>(() => {
    const saved = localStorage.getItem("portfolio_papers");
    return saved ? JSON.parse(saved) : papersData;
  });

  const socials = profile.socials || profileData.socials;

  const handlePrint = () => {
    toast.info("Opening system print dialog... Select 'Save as PDF' to export.");
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const cleanUrl = (url: string) => url.replace("https://www.", "").replace("https://", "");

  // Sort by priority descending (highest first)
  const sortedProjects = [...projects].sort((a, b) => (b.priority || 1) - (a.priority || 1));
  const sortedPapers = [...papers].sort((a, b) => (b.priority || 1) - (a.priority || 1));

  // Slice arrays based on active focus to guarantee fit on single page
  const displayProjects = focus === "engineering" ? sortedProjects.slice(0, 4) : sortedProjects.slice(0, 2);
  const displayPapers = focus === "engineering" ? sortedPapers.slice(0, 2) : sortedPapers.slice(0, 4);

  const activeBio = focus === "engineering"
    ? (profile.engineeringObjective || profile.bio)
    : (profile.researchStatement || profile.bio);

  return (
    <div className="min-h-screen bg-background">
      {/* Hide on Print */}
      <div className="print:hidden">
        <Navigation />
      </div>

      <main className="pt-24 md:pt-28 lg:pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header Action Bar - Hide on Print */}
          <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <Link to="/">
                <Button variant="ghost" className="mb-2 group text-sm pl-0">
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Portfolio
                </Button>
              </Link>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                CV & Resume <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Exporter</span>
              </h1>
              <p className="text-muted-foreground text-xs mt-1">
                Customize your layout, review details, and export a pixel-perfect resume PDF.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Tabs value={focus} onValueChange={updateFocus} className="w-auto">
                <TabsList className="bg-card border border-border p-1 gap-1 h-9">
                  <TabsTrigger value="engineering" className="text-xs px-2.5 py-1">Engineering Focus</TabsTrigger>
                  <TabsTrigger value="research" className="text-xs px-2.5 py-1">Research Focus</TabsTrigger>
                </TabsList>
              </Tabs>

              <Tabs value={template} onValueChange={(val: any) => setTemplate(val)} className="w-auto">
                <TabsList className="bg-card border border-border p-1 gap-1 h-9">
                  <TabsTrigger value="modern" className="text-xs px-2.5 py-1">Modern</TabsTrigger>
                  <TabsTrigger value="academic" className="text-xs px-2.5 py-1">Academic (LaTeX)</TabsTrigger>
                  <TabsTrigger value="minimal" className="text-xs px-2.5 py-1">Minimal</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button onClick={handlePrint} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-9 text-xs">
                <Printer className="w-4 h-4" />
                Export PDF
              </Button>
            </div>
          </div>

          <div
            id="resume-canvas"
            className={`w-full bg-card border border-border shadow-2xl rounded-2xl p-6 md:p-12 print:shadow-none print:border-none print:p-0 print:m-0 print:bg-white print:text-black mx-auto relative overflow-hidden transition-all duration-300 ${
              template === "academic" ? "font-serif max-w-[800px]" : "font-sans max-w-[800px]"
            }`}
          >
            {/* ==================== 1. MODERN TEMPLATE ==================== */}
            {template === "modern" && (
              <div className="space-y-8 text-sm text-foreground">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-extrabold tracking-tight text-foreground">{profile.name}</h2>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.roles?.map((role: string) => (
                        <Badge key={role} variant="outline" className="text-xs border-primary/30 text-primary font-medium">{role}</Badge>
                      ))}
                    </div>
                  </div>
                  {/* Contacts */}
                  <div className="space-y-1.5 text-xs text-muted-foreground font-mono">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                      <a href={`mailto:${socials.email}`} className="hover:underline">{socials.email}</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Github className="w-3.5 h-3.5 text-primary" />
                      <a href={socials.github} target="_blank" rel="noreferrer" className="hover:underline">{cleanUrl(socials.github)}</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Linkedin className="w-3.5 h-3.5 text-primary" />
                      <a href={socials.linkedin} target="_blank" rel="noreferrer" className="hover:underline">{cleanUrl(socials.linkedin)}</a>
                    </div>
                  </div>
                </div>

                {/* Subtitle / Objective */}
                <div className="space-y-2">
                  <h3 className="text-xs uppercase font-mono tracking-widest text-primary font-bold">
                    {focus === "engineering" ? "Professional Objective" : "Research Statement"}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{activeBio}</p>
                </div>

                {/* Main Two-Column Layout */}
                <div className="grid md:grid-cols-[1.5fr,1fr] gap-8">
                  {/* Left Column: Experience & Projects */}
                  <div className="space-y-6">
                    
                    {focus === "engineering" ? (
                      <>
                        {/* Featured Projects */}
                        <div className="space-y-4">
                          <h3 className="text-xs uppercase font-mono tracking-widest text-primary font-bold border-b border-border pb-1 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Featured Projects
                          </h3>
                          <div className="space-y-4">
                            {displayProjects.map((proj) => (
                              <div key={proj.title} className="space-y-1">
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="font-bold text-foreground text-sm flex items-center gap-1">
                                    {proj.title}
                                    {proj.github && <a href={proj.github} className="text-primary hover:text-primary/75"><ExternalLink className="w-3 h-3" /></a>}
                                  </h4>
                                  <span className="text-[10px] bg-secondary px-2 py-0.5 rounded text-muted-foreground capitalize">{proj.category}</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">{proj.description}</p>
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {proj.tags.slice(0, 4).map((tag: string) => (
                                    <span key={tag} className="text-[9px] bg-secondary/50 px-1.5 py-0.5 rounded text-muted-foreground">{tag}</span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Experience */}
                        <div className="space-y-4">
                          <h3 className="text-xs uppercase font-mono tracking-widest text-primary font-bold border-b border-border pb-1 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Experience
                          </h3>
                          <div className="space-y-4">
                            {profile.experience?.map((exp: any) => (
                              <div key={exp.role} className="space-y-1">
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="font-bold text-foreground text-sm">{exp.role}</h4>
                                  <span className="text-xs text-muted-foreground font-mono flex-shrink-0">{exp.period}</span>
                                </div>
                                <div className="text-xs font-semibold text-primary/80">{exp.company}</div>
                                <p className="text-xs text-muted-foreground leading-relaxed mt-1">{exp.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Experience */}
                        <div className="space-y-4">
                          <h3 className="text-xs uppercase font-mono tracking-widest text-primary font-bold border-b border-border pb-1 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Research Experience
                          </h3>
                          <div className="space-y-4">
                            {profile.experience?.map((exp: any) => (
                              <div key={exp.role} className="space-y-1">
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="font-bold text-foreground text-sm">{exp.role}</h4>
                                  <span className="text-xs text-muted-foreground font-mono flex-shrink-0">{exp.period}</span>
                                </div>
                                <div className="text-xs font-semibold text-primary/80">{exp.company}</div>
                                <p className="text-xs text-muted-foreground leading-relaxed mt-1">{exp.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Featured Projects */}
                        <div className="space-y-4">
                          <h3 className="text-xs uppercase font-mono tracking-widest text-primary font-bold border-b border-border pb-1 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Selected Technical Projects
                          </h3>
                          <div className="space-y-4">
                            {displayProjects.map((proj) => (
                              <div key={proj.title} className="space-y-1">
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="font-bold text-foreground text-sm flex items-center gap-1">
                                    {proj.title}
                                    {proj.github && <a href={proj.github} className="text-primary hover:text-primary/75"><ExternalLink className="w-3 h-3" /></a>}
                                  </h4>
                                  <span className="text-[10px] bg-secondary px-2 py-0.5 rounded text-muted-foreground capitalize">{proj.category}</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">{proj.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                  </div>

                  {/* Right Column: Education, Skills, publications */}
                  <div className="space-y-6">
                    
                    {/* Core Skills */}
                    <div className="space-y-4">
                      <h3 className="text-xs uppercase font-mono tracking-widest text-primary font-bold border-b border-border pb-1">
                        Core Expertise
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills?.map((skill: any) => (
                          <Badge key={skill.title} variant="outline" className="text-xs border-border bg-card">{skill.title}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Publications / Research */}
                    <div className="space-y-4">
                      <h3 className="text-xs uppercase font-mono tracking-widest text-primary font-bold border-b border-border pb-1 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Research
                      </h3>
                      <div className="space-y-3">
                        {displayPapers.map((pub) => (
                          <div key={pub.title} className="space-y-0.5">
                            <h4 className="font-bold text-foreground text-xs leading-normal">{pub.title}</h4>
                            <div className="text-[10px] text-muted-foreground font-mono">{pub.year} • {pub.status}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Education */}
                    <div className="space-y-4">
                      <h3 className="text-xs uppercase font-mono tracking-widest text-primary font-bold border-b border-border pb-1 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Education
                      </h3>
                      <div className="space-y-3">
                        {profile.education?.map((edu: any) => (
                          <div key={edu.degree} className="space-y-0.5">
                            <h4 className="font-bold text-foreground text-xs">{edu.degree}</h4>
                            <div className="text-[10px] text-primary/80 font-medium">{edu.school}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{edu.period}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="space-y-4">
                      <h3 className="text-xs uppercase font-mono tracking-widest text-primary font-bold border-b border-border pb-1 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Credentials
                      </h3>
                      <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                        {profile.certifications?.map((cert: string) => (
                          <li key={cert}>{cert}</li>
                        ))}
                      </ul>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* ==================== 2. ACADEMIC (LaTeX-STYLE) TEMPLATE ==================== */}
            {template === "academic" && focus === "research" && (
              <div className="space-y-6 text-xs text-black leading-relaxed font-serif">
                
                {/* Header */}
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-bold tracking-wide uppercase">{profile.name}</h2>
                  <div className="text-[10px] font-mono flex flex-wrap justify-center gap-x-4 gap-y-1 border-b border-black pb-2">
                    <span>Email: <a href={`mailto:${socials.email}`} className="underline">{socials.email}</a></span>
                    <span>GitHub: <a href={socials.github} target="_blank" rel="noreferrer" className="underline">{cleanUrl(socials.github)}</a></span>
                    <span>LinkedIn: <a href={socials.linkedin} target="_blank" rel="noreferrer" className="underline">{cleanUrl(socials.linkedin)}</a></span>
                  </div>
                </div>

                {/* Objective */}
                <div className="space-y-1">
                  <h3 className="text-xs font-bold border-b border-black uppercase tracking-wider">Research Statement & Profile</h3>
                  <p className="text-[11px] leading-relaxed text-black/90 italic">{activeBio}</p>
                </div>

                {/* Education */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold border-b border-black uppercase tracking-wider">Education</h3>
                  <div className="space-y-2">
                    {profile.education?.map((edu: any) => (
                      <div key={edu.degree} className="space-y-0.5">
                        <div className="flex justify-between items-center font-bold">
                          <span>{edu.degree}</span>
                          <span className="text-[10px] font-mono">{edu.period}</span>
                        </div>
                        <div className="text-[11px] text-black/90">{edu.school}</div>
                        <p className="text-[10px] text-black/70">{edu.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Research Interests */}
                <div className="space-y-1">
                  <h3 className="text-xs font-bold border-b border-black uppercase tracking-wider">Research Interests</h3>
                  <p className="text-[11px]">{profile.researchInterests ? profile.researchInterests.join(", ") : "Hardware-Software Co-Design for AI, Silicon Photonics, Neuromorphic Computing"}</p>
                </div>

                {/* Research papers */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold border-b border-black uppercase tracking-wider">Research & Publications</h3>
                  <div className="space-y-3">
                    {displayPapers.map((pub) => (
                      <div key={pub.title} className="space-y-0.5">
                        <div className="flex justify-between items-baseline gap-4">
                          <span className="font-semibold">"{pub.title}"</span>
                          <span className="text-[10px] font-mono flex-shrink-0">{pub.year}</span>
                        </div>
                        <div className="text-[10px] text-black/75 italic">
                          Authors: {pub.authors} • Status: <span className="capitalize">{pub.status}</span>
                        </div>
                        <p className="text-[10px] text-black/70 line-clamp-3 leading-normal pl-4 border-l border-black/20">
                          {pub.abstract}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold border-b border-black uppercase tracking-wider">Research & Professional Experience</h3>
                  <div className="space-y-3">
                    {profile.experience?.map((exp: any) => (
                      <div key={exp.role} className="space-y-0.5">
                        <div className="flex justify-between items-center font-bold">
                          <span>{exp.role} — {exp.company}</span>
                          <span className="text-[10px] font-mono">{exp.period}</span>
                        </div>
                        <p className="text-[11px] text-black/80">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                {displayProjects.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold border-b border-black uppercase tracking-wider">Selected Technical Projects</h3>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      {displayProjects.map((proj) => (
                        <li key={proj.title}>
                          <strong>{proj.title}</strong>: {proj.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Skills & Certs */}
                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold border-b border-black uppercase tracking-wider">Technical Expertise</h3>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      {profile.skills?.map((skill: any) => (
                        <li key={skill.title}>
                          <strong>{skill.title}:</strong> {skill.description}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-bold border-b border-black uppercase tracking-wider">Certifications & Honors</h3>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      {profile.certifications?.map((cert: string) => (
                        <li key={cert}>{cert}</li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            )}

            {/* ==================== 2B. ACADEMIC LATEX STYLE (ENGINEERING CS FORMAT) ==================== */}
            {template === "academic" && focus === "engineering" && (
              <div className="space-y-5 text-xs text-black leading-relaxed font-serif">
                
                {/* Header */}
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold tracking-wide uppercase">{profile.name}</h2>
                  <div className="text-[10px] flex flex-wrap justify-center gap-x-4 gap-y-0.5 border-b border-black pb-2">
                    <span>Email: <a href={`mailto:${socials.email}`} className="underline">{socials.email}</a></span>
                    <span>GitHub: <a href={socials.github} target="_blank" rel="noreferrer" className="underline">{cleanUrl(socials.github)}</a></span>
                    <span>LinkedIn: <a href={socials.linkedin} target="_blank" rel="noreferrer" className="underline">{cleanUrl(socials.linkedin)}</a></span>
                  </div>
                </div>

                {/* Professional Objective */}
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider border-b border-black">Objective</h3>
                  <p className="text-[11px] leading-relaxed text-black/90">{activeBio}</p>
                </div>

                {/* Technical Skills */}
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider border-b border-black">Technical Skills</h3>
                  <div className="text-[11px] space-y-1">
                    <div><strong>Languages & Frameworks:</strong> Python, Verilog, C/C++, TypeScript, React, PyTorch, TensorFlow</div>
                    <div><strong>Tools & Hardwares:</strong> Altium Designer, PCB Design, RISC-V, FPGA, Edge AI (Raspberry Pi/ESP32), LoRa, MQTT</div>
                    <div><strong>Core Expertise:</strong> {profile.skills?.map((s: any) => s.title).join(" • ")}</div>
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider border-b border-black">Experience</h3>
                  <div className="space-y-2">
                    {profile.experience?.map((exp: any) => (
                      <div key={exp.role} className="space-y-0.5">
                        <div className="flex justify-between items-center font-bold">
                          <span>{exp.role} — {exp.company}</span>
                          <span className="text-[10px] font-mono">{exp.period}</span>
                        </div>
                        <p className="text-[11px] text-black/85">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider border-b border-black">Selected Technical Projects</h3>
                  <div className="space-y-2">
                    {displayProjects.map((proj) => (
                      <div key={proj.title} className="space-y-0.5">
                        <div className="flex justify-between items-baseline gap-4 font-bold">
                          <span>{proj.title}</span>
                          <span className="text-[10px] font-mono capitalize">{proj.category}</span>
                        </div>
                        <p className="text-[11px] text-black/85">{proj.description}</p>
                        <div className="text-[9.5px] text-black/60 font-mono">Technologies: {proj.tags.join(", ")}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider border-b border-black">Education</h3>
                  <div className="space-y-2">
                    {profile.education?.map((edu: any) => (
                      <div key={edu.degree} className="space-y-0.5">
                        <div className="flex justify-between items-center font-bold">
                          <span>{edu.degree}</span>
                          <span className="text-[10px] font-mono">{edu.period}</span>
                        </div>
                        <div className="text-[11px] text-black/90">{edu.school}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Publications / Research */}
                {displayPapers.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider border-b border-black">Selected Publications</h3>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      {displayPapers.map((pub) => (
                        <li key={pub.title}>
                          <strong>"{pub.title}"</strong> ({pub.year}) • {pub.status}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ==================== 3. MINIMAL TEMPLATE ==================== */}
            {template === "minimal" && (
              <div className="space-y-8 text-sm text-foreground">
                
                {/* Header */}
                <div className="space-y-3 border-b border-border pb-6">
                  <h2 className="text-3xl font-light tracking-wide text-foreground">{profile.name}</h2>
                  <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-muted-foreground font-mono">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {socials.email}</span>
                    <span className="flex items-center gap-1"><Github className="w-3.5 h-3.5" /> {cleanUrl(socials.github)}</span>
                    <span className="flex items-center gap-1"><Linkedin className="w-3.5 h-3.5" /> {cleanUrl(socials.linkedin)}</span>
                  </div>
                </div>

                {/* Subtitle */}
                <p className="text-muted-foreground leading-relaxed italic">{activeBio}</p>

                {/* Experience */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground border-l-2 border-primary pl-2.5">
                    Experience
                  </h3>
                  <div className="space-y-6">
                    {profile.experience?.map((exp: any) => (
                      <div key={exp.role} className="space-y-1">
                        <div className="flex justify-between items-baseline gap-2">
                          <h4 className="font-bold text-foreground">{exp.role}</h4>
                          <span className="text-xs text-muted-foreground font-mono">{exp.period}</span>
                        </div>
                        <div className="text-xs text-primary font-medium">{exp.company}</div>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-1">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground border-l-2 border-primary pl-2.5">
                    Education
                  </h3>
                  <div className="space-y-4">
                    {profile.education?.map((edu: any) => (
                      <div key={edu.degree} className="space-y-1">
                        <div className="flex justify-between items-baseline gap-2">
                          <h4 className="font-bold text-foreground">{edu.degree}</h4>
                          <span className="text-xs text-muted-foreground font-mono">{edu.period}</span>
                        </div>
                        <div className="text-xs text-primary font-medium">{edu.school}</div>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{edu.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected projects & papers list in simple flex */}
                <div className="grid md:grid-cols-2 gap-6">
                  
                  {/* Left: Projects */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground border-l-2 border-primary pl-2.5">
                      Selected Projects
                    </h3>
                    <div className="space-y-3">
                      {displayProjects.map((proj) => (
                        <div key={proj.title} className="space-y-0.5">
                          <h4 className="font-semibold text-foreground text-xs">{proj.title}</h4>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Papers */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground border-l-2 border-primary pl-2.5">
                      Selected Papers
                    </h3>
                    <div className="space-y-3">
                      {displayPapers.map((pub) => (
                        <div key={pub.title} className="space-y-0.5">
                          <h4 className="font-semibold text-foreground text-xs leading-normal">{pub.title}</h4>
                          <div className="text-[10px] text-muted-foreground font-mono">{pub.year} • {pub.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* Print Signature / URL */}
            <div className="hidden print:block text-center text-[9px] text-muted-foreground font-mono mt-12 border-t border-border pt-4">
              Generated via Portfolio Exporter • {window.location.origin}/resume
            </div>

          </div>

          {/* Marketing CTA bottom - Hide on Print */}
          <div className="print:hidden text-center p-6 bg-card/30 backdrop-blur-sm border border-border rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-left space-y-1">
              <h4 className="font-bold text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                Want your own AI-powered portfolio page?
              </h4>
              <p className="text-xs text-muted-foreground">Clone this project on GitHub and set up your serverless CMS in 2 minutes.</p>
            </div>
            <Link to="/admin">
              <Button size="sm" variant="outline" className="gap-1.5 border-primary/20 text-primary hover:bg-primary/10">
                Deploy Control Center
              </Button>
            </Link>
          </div>

        </div>
      </main>

      {/* Print Specific CSS Styles injected globally */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          main {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          #resume-canvas {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            background: white !important;
            color: black !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Resume;
