import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowLeft,
  Wand2,
  Upload,
  Settings,
  Database,
  Github,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  Trash2,
  FileCode,
  Download,
} from "lucide-react";
import { fetchFileFromGitHub, commitFileToGitHub, uploadBinaryFileToGitHub, GitHubConfig } from "@/utils/github";
import { getPortfolioUpdatesFromAI, UpdateAssistantResult } from "@/utils/adminGemini";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";

// Import local data as default initial state
import localProfile from "@/data/profile.json";
import localProjects from "@/data/projects.json";
import localPapers from "@/data/papers.json";

const Admin = () => {
  // Config state (API keys & GitHub settings stored in localStorage)
  const [aiProvider, setAiProvider] = useState<"gemini" | "openrouter">("openrouter");
  const [geminiKey, setGeminiKey] = useState("");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [openrouterModel, setOpenrouterModel] = useState("google/gemini-2.5-flash");
  const [gitToken, setGitToken] = useState("");
  const [gitOwner, setGitOwner] = useState("");
  const [gitRepo, setGitRepo] = useState("");
  const [gitBranch, setGitBranch] = useState("main");

  // Portfolio states
  const [profile, setProfile] = useState<any>(localProfile);
  const [projects, setProjects] = useState<any[]>(localProjects);
  const [papers, setPapers] = useState<any[]>(localPapers);

  // AI chat states
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<UpdateAssistantResult | null>(null);

  // PDF upload states
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string>("");
  const [paperTitle, setPaperTitle] = useState("");
  const [paperAbstract, setPaperAbstract] = useState("");
  const [paperYear, setPaperYear] = useState(new Date().getFullYear().toString());
  const [paperAuthors, setPaperAuthors] = useState("Dalton Omondi");
  const [paperTags, setPaperTags] = useState("");
  const [paperStatus, setPaperStatus] = useState<"published" | "submitted" | "draft" | "preprint">("draft");
  const [isUploading, setIsUploading] = useState(false);

  // Syncing states
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Load configs from localStorage on mount
  useEffect(() => {
    setAiProvider((localStorage.getItem("admin_ai_provider") as any) || "openrouter");
    setGeminiKey(localStorage.getItem("admin_gemini_key") || "");
    setOpenrouterKey(localStorage.getItem("admin_openrouter_key") || "");
    setOpenrouterModel(localStorage.getItem("admin_openrouter_model") || "google/gemini-2.5-flash");
    setGitToken(localStorage.getItem("admin_github_token") || "");
    setGitOwner(localStorage.getItem("admin_github_owner") || "");
    setGitRepo(localStorage.getItem("admin_github_repo") || "");
    setGitBranch(localStorage.getItem("admin_github_branch") || "main");

    // Load locally saved data edits if they exist
    const savedProfile = localStorage.getItem("portfolio_profile");
    const savedProjects = localStorage.getItem("portfolio_projects");
    const savedPapers = localStorage.getItem("portfolio_papers");

    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedProjects) setProjects(JSON.parse(savedProjects));
    if (savedPapers) setPapers(JSON.parse(savedPapers));
  }, []);

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("admin_ai_provider", aiProvider);
    localStorage.setItem("admin_gemini_key", geminiKey);
    localStorage.setItem("admin_openrouter_key", openrouterKey);
    localStorage.setItem("admin_openrouter_model", openrouterModel);
    localStorage.setItem("admin_github_token", gitToken);
    localStorage.setItem("admin_github_owner", gitOwner);
    localStorage.setItem("admin_github_repo", gitRepo);
    localStorage.setItem("admin_github_branch", gitBranch);
    toast.success("Settings saved to browser local storage!");
  };

  const getGitHubConfig = (): GitHubConfig => {
    return {
      token: gitToken,
      owner: gitOwner,
      repo: gitRepo,
      branch: gitBranch,
    };
  };

  const isGitHubConfigured = () => {
    return gitToken && gitOwner && gitRepo;
  };

  // Sync configuration from GitHub
  const syncWithGitHub = async () => {
    if (!isGitHubConfigured()) {
      toast.error("Please configure GitHub settings first.");
      return;
    }
    setIsSyncing(true);
    try {
      const config = getGitHubConfig();

      toast.info("Fetching configurations from GitHub...");

      const profileRes = await fetchFileFromGitHub(config, "src/data/profile.json");
      const projectsRes = await fetchFileFromGitHub(config, "src/data/projects.json");
      const papersRes = await fetchFileFromGitHub(config, "src/data/papers.json");

      if (profileRes) {
        const parsed = JSON.parse(profileRes.content);
        setProfile(parsed);
        localStorage.setItem("portfolio_profile", JSON.stringify(parsed));
      }
      if (projectsRes) {
        const parsed = JSON.parse(projectsRes.content);
        setProjects(parsed);
        localStorage.setItem("portfolio_projects", JSON.stringify(parsed));
      }
      if (papersRes) {
        const parsed = JSON.parse(papersRes.content);
        setPapers(parsed);
        localStorage.setItem("portfolio_papers", JSON.stringify(parsed));
      }

      toast.success("Synchronized successfully with GitHub!");
    } catch (error) {
      console.error(error);
      toast.error(`Sync failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Publish all current local edits to GitHub
  const publishToGitHub = async () => {
    if (!isGitHubConfigured()) {
      toast.error("Please configure GitHub settings first.");
      return;
    }
    setIsPublishing(true);
    try {
      const config = getGitHubConfig();

      toast.info("Committing configurations to GitHub...");

      await commitFileToGitHub(config, "src/data/profile.json", JSON.stringify(profile, null, 2), "Update profile configurations via Admin Panel");
      await commitFileToGitHub(config, "src/data/projects.json", JSON.stringify(projects, null, 2), "Update projects configurations via Admin Panel");
      await commitFileToGitHub(config, "src/data/papers.json", JSON.stringify(papers, null, 2), "Update publications configurations via Admin Panel");

      toast.success("All updates committed and published to GitHub! Deployment triggered.");
    } catch (error) {
      console.error(error);
      toast.error(`Publish failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // Run AI editor to request edits
  const handleAIEdit = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiResult(null);
    try {
      const result = await getPortfolioUpdatesFromAI(aiPrompt, profile, projects, papers);
      setAiResult(result);
      toast.success("AI edits proposed successfully! Review the changes below.");
    } catch (error) {
      console.error(error);
      toast.error(`AI Edit failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Apply proposed AI edits
  const applyAIEdit = () => {
    if (!aiResult) return;
    setProfile(aiResult.updatedProfile);
    setProjects(aiResult.updatedProjects);
    setPapers(aiResult.updatedPapers);

    // Save to local storage
    localStorage.setItem("portfolio_profile", JSON.stringify(aiResult.updatedProfile));
    localStorage.setItem("portfolio_projects", JSON.stringify(aiResult.updatedProjects));
    localStorage.setItem("portfolio_papers", JSON.stringify(aiResult.updatedPapers));

    setAiResult(null);
    setAiPrompt("");
    toast.success("Proposed edits applied locally! Click 'Publish' to push them to GitHub.");
  };

  // Handle PDF File Conversion
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported!");
      return;
    }

    setPdfFile(file);
    if (!paperTitle) {
      // Auto-extract title from file name
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      setPaperTitle(nameWithoutExt);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const base64String = result.split(",")[1];
      setPdfBase64(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Upload PDF and commit metadata
  const handlePaperUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile || !pdfBase64) {
      toast.error("Please select a PDF file first.");
      return;
    }
    if (!paperTitle.trim()) {
      toast.error("Please enter a paper title.");
      return;
    }

    setIsUploading(true);
    try {
      const urlSafeTitle = paperTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_+|_+$)/g, "");
      const fileName = `${urlSafeTitle}.pdf`;
      const pdfPath = `/papers/${fileName}`;

      const newPaper = {
        title: paperTitle,
        authors: paperAuthors,
        year: paperYear,
        abstract: paperAbstract,
        tags: paperTags.split(",").map(t => t.trim()).filter(Boolean),
        pdfPath: pdfPath,
        status: paperStatus
      };

      const updatedPapersList = [newPaper, ...papers];

      if (isGitHubConfigured()) {
        const config = getGitHubConfig();
        toast.info("Uploading PDF file directly to GitHub...");
        
        // 1. Upload the PDF file
        await uploadBinaryFileToGitHub(config, `public/papers/${fileName}`, pdfBase64, `Upload research paper PDF: ${paperTitle}`);
        
        // 2. Commit updated papers list JSON
        toast.info("Updating papers config on GitHub...");
        await commitFileToGitHub(config, "src/data/papers.json", JSON.stringify(updatedPapersList, null, 2), `Add research paper: ${paperTitle}`);
        
        toast.success("Paper uploaded and committed to GitHub successfully!");
      } else {
        toast.warning("GitHub not configured. Edits saved locally. Download JSON to update manually.");
      }

      // Update states
      setPapers(updatedPapersList);
      localStorage.setItem("portfolio_papers", JSON.stringify(updatedPapersList));

      // Reset form
      setPdfFile(null);
      setPdfBase64("");
      setPaperTitle("");
      setPaperAbstract("");
      setPaperTags("");
    } catch (error) {
      console.error(error);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadConfigurations = () => {
    const downloadJson = (data: any, fileName: string) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    };

    downloadJson(profile, "profile.json");
    downloadJson(projects, "projects.json");
    downloadJson(papers, "papers.json");
    toast.success("Downloaded data configuration files!");
  };

  const resetLocalEdits = () => {
    if (window.confirm("Are you sure you want to discard all unsaved edits and restore default files?")) {
      localStorage.removeItem("portfolio_profile");
      localStorage.removeItem("portfolio_projects");
      localStorage.removeItem("portfolio_papers");
      setProfile(localProfile);
      setProjects(localProjects);
      setPapers(localPapers);
      toast.success("Local edits reset to codebase defaults!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 md:pt-28 lg:pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <Link to="/">
                <Button variant="ghost" className="mb-2 group text-sm pl-0">
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Portfolio
                </Button>
              </Link>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                Portfolio <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Control Center</span>
                <Badge variant="outline" className="text-xs font-mono font-normal">Serverless CMS</Badge>
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                AI-powered content management system running entirely in your browser.
              </p>
            </div>

            {/* Global Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={syncWithGitHub}
                disabled={isSyncing || !isGitHubConfigured()}
                className="gap-2 text-sm h-10"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                Sync GitHub
              </Button>
              <Button
                onClick={publishToGitHub}
                disabled={isPublishing || !isGitHubConfigured()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-sm h-10"
              >
                <Github className="w-4 h-4" />
                {isPublishing ? "Publishing..." : "Publish Changes"}
              </Button>
            </div>
          </div>

          {!isGitHubConfigured() && (
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">GitHub Repository Not Connected</h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Your API credentials are not set. You can still make edits using the AI Editor locally and download the files,
                  but configure your credentials in the <strong>Settings</strong> tab to enable automated cloud publishing.
                </p>
              </div>
            </div>
          )}

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="bg-card border border-border p-1 gap-1 h-auto flex flex-wrap sm:grid sm:grid-cols-4">
              <TabsTrigger value="dashboard" className="flex items-center gap-2 py-2.5">
                <Database className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="aieditor" className="flex items-center gap-2 py-2.5">
                <Wand2 className="w-4 h-4" />
                AI Assistant
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2 py-2.5">
                <Upload className="w-4 h-4" />
                Add Paper (PDF)
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 py-2.5">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* DASHBOARD TAB */}
            <TabsContent value="dashboard">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Stats Cards */}
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-medium text-muted-foreground">Profile Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-3xl font-bold">{profile.name}</div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{profile.bio}</p>
                    <div className="flex flex-wrap gap-1 pt-2">
                      {profile.roles?.slice(0, 3).map((r: string) => (
                        <Badge key={r} variant="secondary" className="text-[10px]">{r}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-medium text-muted-foreground">Portfolio Projects</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-3xl font-bold">{projects.length}</div>
                    <p className="text-xs text-muted-foreground">Active showcases categorized across ML, Hardware, VLSI, and IoT modules.</p>
                    <div className="flex gap-2 text-xs text-muted-foreground pt-3 border-t border-border mt-2">
                      <div>ML: <span className="font-bold text-foreground">{projects.filter(p=>p.category==='ml').length}</span></div>
                      <div>Hardware: <span className="font-bold text-foreground">{projects.filter(p=>p.category==='hardware').length}</span></div>
                      <div>Chip: <span className="font-bold text-foreground">{projects.filter(p=>p.category==='chip').length}</span></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-medium text-muted-foreground">Research Publications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-3xl font-bold">{papers.length}</div>
                    <p className="text-xs text-muted-foreground">Academic publications, drafts, preprints, and research briefs loaded dynamically.</p>
                    <div className="flex gap-2 text-xs text-muted-foreground pt-3 border-t border-border mt-2">
                      <div>Published: <span className="font-bold text-foreground">{papers.filter(p=>p.status==='published').length}</span></div>
                      <div>Drafts: <span className="font-bold text-foreground">{papers.filter(p=>p.status==='draft').length}</span></div>
                      <div>Review: <span className="font-bold text-foreground">{papers.filter(p=>p.status==='submitted').length}</span></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Operations & backups */}
                <Card className="md:col-span-3 bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Backup & Reset Actions</CardTitle>
                    <CardDescription>Download configurations locally or reset edits.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <Button variant="outline" className="gap-2" onClick={downloadConfigurations}>
                      <Download className="w-4 h-4" />
                      Download Data backups (.json)
                    </Button>
                    <Button variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500" onClick={resetLocalEdits}>
                      <Trash2 className="w-4 h-4" />
                      Reset to defaults
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI EDITOR TAB */}
            <TabsContent value="aieditor">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* Request Box */}
                <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Wand2 className="w-5 h-5 text-primary" />
                      Tell AI what to update
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Provide a raw description of your new accomplishments, projects, or papers. The AI will parse details and restructure your portfolio files.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="e.g. Add a new project called 'Smart Agriculture System' utilizing ESP32, DHT22 sensors, and LoRa. Under the category 'iot'. Add a GitHub link to github.com/GabuGravin41/smart-agri."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="min-h-48 bg-background/50 leading-relaxed text-sm"
                    />
                    <Button
                      onClick={handleAIEdit}
                      disabled={isAiLoading || !aiPrompt.trim()}
                      className="w-full bg-gradient-primary hover:opacity-90 text-white gap-2"
                    >
                      {isAiLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Processing Updates...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Updates
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Diff/Review Panel */}
                <Card className="lg:col-span-3 bg-card/50 backdrop-blur-sm border-border flex flex-col min-h-[400px]">
                  <CardHeader>
                    <CardTitle>AI Proposal & Review</CardTitle>
                    <CardDescription className="text-xs">Review the proposed updates generated by the AI before saving them.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between p-6 pt-0">
                    {aiResult ? (
                      <div className="space-y-4 flex-1 flex flex-col justify-between">
                        
                        {/* Explanation */}
                        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm">
                          <h4 className="font-semibold mb-1 flex items-center gap-1.5 text-primary">
                            <Sparkles className="w-4 h-4" />
                            AI Explanation
                          </h4>
                          <p className="text-muted-foreground text-xs leading-relaxed">{aiResult.explanation}</p>
                        </div>

                        {/* File preview summary tabs */}
                        <div className="flex-1 overflow-y-auto max-h-[300px] border border-border rounded-xl p-4 bg-background/50 space-y-4">
                          <h5 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <FileCode className="w-3.5 h-3.5" />
                            Configuration Changes
                          </h5>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-card border border-border">
                              <span className="font-mono">profile.json</span>
                              <Badge variant="outline" className="text-[10px]">Modified</Badge>
                            </div>
                            <div className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-card border border-border">
                              <span className="font-mono">projects.json</span>
                              <Badge variant="outline" className="text-[10px]">
                                {aiResult.updatedProjects.length !== projects.length ? "Items Changed" : "Unchanged"}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-card border border-border">
                              <span className="font-mono">papers.json</span>
                              <Badge variant="outline" className="text-[10px]">
                                {aiResult.updatedPapers.length !== papers.length ? "Items Changed" : "Unchanged"}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Approve actions */}
                        <div className="flex gap-2 pt-4 border-t border-border mt-4">
                          <Button onClick={applyAIEdit} className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Accept & Apply Locally
                          </Button>
                          <Button onClick={() => setAiResult(null)} variant="outline">
                            Discard
                          </Button>
                        </div>

                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground py-16">
                        <Wand2 className="w-12 h-12 mb-4 text-muted-foreground/30 animate-pulse" />
                        <h4 className="font-medium text-base">No updates proposed yet</h4>
                        <p className="text-xs max-w-sm mt-1">Enter your raw achievement in the left assistant prompt, and watch the updates render here.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>
            </TabsContent>

            {/* PDF UPLOAD TAB */}
            <TabsContent value="upload">
              <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-accent" />
                    Upload Research Paper PDF
                  </CardTitle>
                  <CardDescription>
                    Add a research paper by uploading the PDF. This will commit the PDF directly to public/papers/ and log its details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePaperUpload} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      
                      {/* Left: Metadata */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Paper Title</label>
                          <Input
                            placeholder="e.g. Meta-surfaces: High Impedance Surfaces"
                            value={paperTitle}
                            onChange={(e) => setPaperTitle(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Authors</label>
                          <Input
                            placeholder="e.g. Dalton Omondi"
                            value={paperAuthors}
                            onChange={(e) => setPaperAuthors(e.target.value)}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Year</label>
                            <Input
                              value={paperYear}
                              onChange={(e) => setPaperYear(e.target.value)}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Status</label>
                            <select
                              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              value={paperStatus}
                              onChange={(e: any) => setPaperStatus(e.target.value)}
                            >
                              <option value="published">Published</option>
                              <option value="submitted">Under Review</option>
                              <option value="draft">Draft</option>
                              <option value="preprint">Preprint</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Tags (comma-separated)</label>
                          <Input
                            placeholder="Metasurfaces, Antenna, EMC"
                            value={paperTags}
                            onChange={(e) => setPaperTags(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Right: PDF file & abstract */}
                      <div className="space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Select PDF File</label>
                          <div className="border-2 border-dashed border-border hover:border-accent/40 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer relative bg-background/50">
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={handleFileChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <FileText className="w-8 h-8 text-muted-foreground/60 mb-2" />
                            {pdfFile ? (
                              <div className="text-xs text-accent font-semibold">{pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)</div>
                            ) : (
                              <div className="text-xs text-muted-foreground">Click or drag & drop research paper PDF</div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 flex-1 flex flex-col">
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Abstract</label>
                          <Textarea
                            placeholder="Enter the paper abstract..."
                            value={paperAbstract}
                            onChange={(e) => setPaperAbstract(e.target.value)}
                            className="flex-1 min-h-[100px] leading-relaxed text-sm bg-background/50"
                            required
                          />
                        </div>
                      </div>

                    </div>

                    <Button type="submit" disabled={isUploading || !pdfFile} className="w-full bg-accent text-white hover:bg-accent/90 gap-2 h-11">
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Uploading PDF & Committing Metadata...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Commit Paper & PDF to GitHub
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SETTINGS TAB */}
            <TabsContent value="settings">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Form configuration */}
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">API Settings</CardTitle>
                    <CardDescription className="text-xs">Configure your API access tokens. These values are saved locally in your browser and never sent to any third party.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={saveSettings} className="space-y-4">
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">AI Provider</label>
                        <select
                          className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          value={aiProvider}
                          onChange={(e: any) => setAiProvider(e.target.value)}
                        >
                          <option value="openrouter">OpenRouter (Primary)</option>
                          <option value="gemini">Google Gemini (Direct SDK)</option>
                        </select>
                      </div>

                      {aiProvider === "gemini" ? (
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Gemini API Key</label>
                          <Input
                            type="password"
                            placeholder="AIzaSy..."
                            value={geminiKey}
                            onChange={(e) => setGeminiKey(e.target.value)}
                          />
                          <p className="text-[10px] text-muted-foreground leading-relaxed">Direct Google Gemini key. Uses gemini-2.0-flash model.</p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">OpenRouter API Key</label>
                            <Input
                              type="password"
                              placeholder="sk-or-v1-..."
                              value={openrouterKey}
                              onChange={(e) => setOpenrouterKey(e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">OpenRouter Model</label>
                            <Input
                              placeholder="google/gemini-2.5-flash"
                              value={openrouterModel}
                              onChange={(e) => setOpenrouterModel(e.target.value)}
                            />
                            <p className="text-[10px] text-muted-foreground leading-relaxed">e.g. google/gemini-2.5-flash or deepseek/deepseek-chat.</p>
                          </div>
                        </>
                      )}

                      <div className="space-y-1.5 border-t border-border pt-4">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">GitHub Personal Access Token (PAT)</label>
                        <Input
                          type="password"
                          placeholder="ghp_..."
                          value={gitToken}
                          onChange={(e) => setGitToken(e.target.value)}
                        />
                        <p className="text-[10px] text-muted-foreground leading-relaxed">Required to write files and upload PDFs directly to your repository.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground uppercase">GitHub Owner (Username)</label>
                          <Input
                            placeholder="GabuGravin41"
                            value={gitOwner}
                            onChange={(e) => setGitOwner(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground uppercase">GitHub Repository Name</label>
                          <Input
                            placeholder="dalton-lab-forge"
                            value={gitRepo}
                            onChange={(e) => setGitRepo(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Target Commit Branch</label>
                        <Input
                          placeholder="main"
                          value={gitBranch}
                          onChange={(e) => setGitBranch(e.target.value)}
                        />
                      </div>

                      <Button type="submit" className="w-full mt-4">Save Configuration</Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Info and guidance */}
                <Card className="bg-card/50 backdrop-blur-sm border-border flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle className="text-lg">Security & Serverless Model</CardTitle>
                    <CardDescription className="text-xs">How this control center maintains static principles.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs text-muted-foreground leading-relaxed flex-1">
                    <p>
                      Traditional content management systems (like WordPress) require a running database server and an admin backend to save edits. This increases hosting costs and setup complexity.
                    </p>
                    <p className="font-semibold text-foreground">
                      This portfolio operates on a Decoupled Serverless Git-CMS model:
                    </p>
                    <ul className="list-disc pl-4 space-y-2">
                      <li>Your tokens are stored in your browser's <code className="bg-background px-1 py-0.5 rounded">localStorage</code>, keeping them secure and fully client-side.</li>
                      <li>Edits are compiled into clean configuration files and committed directly to your repository using standard secure GitHub APIs.</li>
                      <li>Any hosting service (like Vercel, Netlify, or GitHub Pages) automatically detects the commit, rebuilds the static files, and updates the site in 30 seconds.</li>
                    </ul>
                    <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-primary text-[10px] mt-4 leading-normal flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>Note: Make sure your GitHub token has write permissions (repo scopes) to your repository.</span>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </TabsContent>
          </Tabs>

        </div>
      </main>
    </div>
  );
};

export default Admin;
