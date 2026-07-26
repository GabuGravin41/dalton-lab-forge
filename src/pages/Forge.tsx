import { useState, useEffect } from "react";
import profileDefault from "@/data/profile.json";
import projectsDefault from "@/data/projects.json";
import papersDefault from "@/data/papers.json";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { usePortfolio } from "@/context/PortfolioContext";
import {
  Sparkles, Palette, User, KeyRound, Loader2, ArrowRight, CheckCircle2,
  Copy, FileText, LogIn, Wand2, FileStack, PencilLine
} from "lucide-react";
import { toast } from "sonner";

const themeClasses: Record<string, { primary: string; text: string; bgGlow: string; border: string; badge: string }> = {
  indigo:   { primary: "text-indigo-500", text: "text-indigo-400", bgGlow: "bg-indigo-500/10", border: "border-indigo-500/30", badge: "bg-indigo-500/10 text-indigo-400" },
  emerald:  { primary: "text-emerald-500", text: "text-emerald-400", bgGlow: "bg-emerald-500/10", border: "border-emerald-500/30", badge: "bg-emerald-500/10 text-emerald-400" },
  rose:     { primary: "text-rose-500", text: "text-rose-400", bgGlow: "bg-rose-500/10", border: "border-rose-500/30", badge: "bg-rose-500/10 text-rose-400" },
  cyberpunk:{ primary: "text-fuchsia-500", text: "text-fuchsia-400", bgGlow: "bg-fuchsia-500/10", border: "border-fuchsia-500/30", badge: "bg-fuchsia-500/10 text-fuchsia-400" },
  steel:    { primary: "text-slate-400", text: "text-slate-400", bgGlow: "bg-slate-500/10", border: "border-slate-500/30", badge: "bg-slate-500/10 text-slate-400" },
  "teal-gold": { primary: "text-teal-500", text: "text-teal-400", bgGlow: "bg-teal-500/10", border: "border-teal-500/30", badge: "bg-teal-500/10 text-teal-400" },
};

const Forge = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { generatePortfolioFromAI, login, fetchUserSnapshot, loading } = usePortfolio();

  // ─── Tab state ───────────────────────────────────────────────────────────
  const [tab, setTab] = useState<ForgeTab>("forge");

  // ─── Login tab state ──────────────────────────────────────────────────────
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPasscode, setLoginPasscode] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ─── Forge tab state ──────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [passcode, setPasscode] = useState("");
  const [theme, setTheme] = useState("indigo");
  const [creationMode, setCreationMode] = useState<CreationMode>("ai");
  const [careerText, setCareerText] = useState("");
  const [cloneSource, setCloneSource] = useState("");
  const [cloneSnapshot, setCloneSnapshot] = useState<{ profile: any; projects: any[]; papers: any[] } | null>(null);
  const [isLoadingClone, setIsLoadingClone] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const themes = [
    { id: "indigo", name: "Midnight Indigo", color: "bg-indigo-600" },
    { id: "emerald", name: "Emerald Aurora", color: "bg-emerald-600" },
    { id: "rose", name: "Cyber-Rose", color: "bg-rose-600" },
    { id: "cyberpunk", name: "Neon Cyberpunk", color: "bg-fuchsia-600" },
    { id: "steel", name: "Minimal Steel", color: "bg-slate-500" },
    { id: "teal-gold", name: "Teal Gold", color: "bg-teal-600" },
  ];

  // ─── Auto-detect ?clone=username on mount ────────────────────────────────
  useEffect(() => {
    const cloneParam = searchParams.get("clone");
    if (cloneParam) {
      setCloneSource(cloneParam);
      setCreationMode("clone");
      setStep(2); // Skip straight to Step 2 since they already know they want to clone
    }
  }, [searchParams]);

  // ─── Pre-load snapshot when user enters a clone source ───────────────────
  const handleLoadCloneSnapshot = async (sourceUser: string) => {
    if (!sourceUser.trim()) return;
    setIsLoadingClone(true);
    const snapshot = await fetchUserSnapshot(sourceUser.trim().toLowerCase());
    setIsLoadingClone(false);
    if (!snapshot) {
      toast.error(`Could not find portfolio for @${sourceUser}. Try a different username.`);
      setCloneSnapshot(null);
    } else {
      setCloneSnapshot(snapshot);
      toast.success(`Template from @${sourceUser} loaded! Ready to clone.`);
    }
  };

  // ─── Step 1 → Step 2 ─────────────────────────────────────────────────────
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !passcode.trim()) {
      toast.error("Please enter a username and a passcode.");
      return;
    }
    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3 || !/^[a-z0-9_-]+$/.test(cleanUsername)) {
      toast.error("Username must be at least 3 characters and contain only letters, numbers, dashes, or underscores.");
      return;
    }
    setStep(2);
  };

  // ─── Final generation + registration ─────────────────────────────────────
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      let seedData: { profile: any; projects: any[]; papers: any[] } | undefined;

      if (creationMode === "ai") {
        // AI path: run AI generation first, then register
        if (!careerText.trim()) {
          toast.error("Please paste your resume or describe your experience.");
          setIsProcessing(false);
          return;
        }
        const aiSuccess = await generatePortfolioFromAI(careerText);
        if (!aiSuccess) throw new Error("AI generation failed");
      } else if (creationMode === "clone") {
        let snapshot = cloneSnapshot;
        if (!snapshot && !cloneSource.trim()) {
          // If blank, use the bundled local defaults as the "dalton" template —
          // avoids a network call that fails in local dev (Vite doesn't serve /api/*).
          snapshot = {
            profile: profileDefault,
            projects: projectsDefault as any[],
            papers: papersDefault as any[],
          };
        } else if (!snapshot) {
          toast.error("Please load a template to clone first.");
          setIsProcessing(false);
          return;
        }
        seedData = snapshot;
      }

      const loginSuccess = await login(username.trim().toLowerCase(), passcode, seedData);
      if (!loginSuccess) throw new Error("Failed to register account");

      setStep(3);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate portfolio");
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Login tab handler ────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPasscode.trim()) {
      toast.error("Please enter your username and passcode.");
      return;
    }
    setIsLoggingIn(true);
    const success = await login(loginUsername.trim().toLowerCase(), loginPasscode);
    setIsLoggingIn(false);
    if (success) {
      navigate(`/u/${loginUsername.trim().toLowerCase()}`);
    }
  };

  const activeTheme = themeClasses[theme] || themeClasses.indigo;

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden transition-all duration-500">
      {/* Background decorations */}
      <div className={`absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl transition-all duration-700 ${activeTheme.bgGlow}`} />
      <div className={`absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl transition-all duration-700 ${activeTheme.bgGlow}`} />

      <Card className={`w-full max-w-xl bg-card/40 backdrop-blur-xl shadow-2xl relative z-10 transition-all duration-500 border ${activeTheme.border}`}>
        <CardHeader className="text-center pb-2">
          <div className={`mx-auto w-12 h-12 rounded-2xl flex items-center justify-center border mb-4 transition-all duration-500 ${activeTheme.border} ${activeTheme.bgGlow}`}>
            <Sparkles className={`w-6 h-6 animate-pulse transition-colors duration-500 ${activeTheme.text}`} />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            LabForge Portfolio Builder
          </CardTitle>
          <CardDescription>
            Generate a stunning, responsive portfolio & resume in seconds.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          {/* ── Tab switcher ─────────────────────────────────────────── */}
          <div className="flex rounded-xl bg-muted/50 p-1 mb-6 border border-border/50">
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === "forge" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => { setTab("forge"); setStep(1); }}
            >
              <Wand2 className="w-4 h-4" /> Forge New
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === "login" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setTab("login")}
            >
              <LogIn className="w-4 h-4" /> Log In
            </button>
          </div>

          {/* ════════════════════ LOG IN TAB ════════════════════ */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-5 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="login-username" className="text-sm font-semibold flex items-center gap-1.5">
                  <User className="w-4 h-4 text-primary" /> Your Username
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-mono">@</span>
                  <Input
                    id="login-username"
                    placeholder="john_doe"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="pl-8 bg-background/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-passcode" className="text-sm font-semibold flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-primary" /> Your Passcode
                </Label>
                <Input
                  id="login-passcode"
                  type="password"
                  placeholder="Enter your passcode"
                  value={loginPasscode}
                  onChange={(e) => setLoginPasscode(e.target.value)}
                  className="bg-background/50"
                  required
                />
              </div>

              <Button type="submit" disabled={isLoggingIn} className="w-full mt-6 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                {isLoggingIn ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Logging in...</>
                ) : (
                  <><LogIn className="w-4 h-4 mr-2" /> Log in & Enter Edit Mode</>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-1">
                Don't have an account?{" "}
                <button type="button" onClick={() => setTab("forge")} className="text-primary hover:underline font-semibold">
                  Forge one for free →
                </button>
              </p>
            </form>
          )}

          {/* ════════════════════ FORGE TAB ════════════════════ */}
          {tab === "forge" && (
            <>
              {/* Progress indicators */}
              <div className="flex items-center justify-center gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {s}
                    </div>
                    {s < 3 && (
                      <div className={`h-0.5 w-10 mx-1 transition-all ${step > s ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* ── STEP 1: Account Settings ───────────────────────── */}
              {step === 1 && (
                <form onSubmit={handleStep1Submit} className="space-y-5 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-semibold flex items-center gap-1.5">
                      <User className="w-4 h-4 text-primary" /> Claim Username
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-mono">@</span>
                      <Input
                        id="username"
                        placeholder="john_doe"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-8 bg-background/50"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Your live URL: <code className="bg-background px-1 py-0.5 rounded">/u/username</code>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passcode" className="text-sm font-semibold flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-primary" /> Admin Passcode
                    </Label>
                    <Input
                      id="passcode"
                      type="password"
                      placeholder="A secure passcode to edit your site later"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      className="bg-background/50"
                      required
                    />
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-primary" /> Select Theme Color
                    </Label>
                    <div className="grid grid-cols-5 gap-2">
                      {themes.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTheme(t.id)}
                          className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1.5 ${
                            theme === t.id ? "border-primary bg-primary/10" : "border-border/50 bg-card/25 hover:bg-card/50"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full ${t.color} border border-white/20`} />
                          <span className="text-[9px] truncate max-w-full font-medium">{t.name.split(" ")[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full mt-6 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                    Next Step <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>

                  <p className="text-center text-xs text-muted-foreground pt-1">
                    Already have a portfolio?{" "}
                    <button type="button" onClick={() => setTab("login")} className="text-primary hover:underline font-semibold">
                      Log in →
                    </button>
                  </p>
                </form>
              )}

              {/* ── STEP 2: Choose Creation Mode ───────────────────── */}
              {step === 2 && (
                <form onSubmit={handleGenerate} className="space-y-5 animate-fade-in">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">How would you like to start?</Label>
                    <div className="grid gap-3">

                      {/* AI Builder */}
                      <button
                        type="button"
                        onClick={() => setCreationMode("ai")}
                        className={`p-4 rounded-xl border text-left transition-all group ${
                          creationMode === "ai" ? "border-primary bg-primary/10 shadow-sm" : "border-border/50 bg-card/30 hover:border-border hover:bg-card/60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 p-2 rounded-lg ${creationMode === "ai" ? "bg-primary/20" : "bg-muted"}`}>
                            <Wand2 className={`w-4 h-4 ${creationMode === "ai" ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <div className="text-sm font-bold">AI Builder</div>
                            <div className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                              Paste your resume or career summary. Gemini AI structures everything automatically.
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Clone a Site */}
                      <button
                        type="button"
                        onClick={() => setCreationMode("clone")}
                        className={`p-4 rounded-xl border text-left transition-all group ${
                          creationMode === "clone" ? "border-primary bg-primary/10 shadow-sm" : "border-border/50 bg-card/30 hover:border-border hover:bg-card/60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 p-2 rounded-lg ${creationMode === "clone" ? "bg-primary/20" : "bg-muted"}`}>
                            <Copy className={`w-4 h-4 ${creationMode === "clone" ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <div className="text-sm font-bold">Clone a Template</div>
                            <div className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                              Use another user's layout as a starting point. Your name and links will be reset.
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Start Blank */}
                      <button
                        type="button"
                        onClick={() => setCreationMode("blank")}
                        className={`p-4 rounded-xl border text-left transition-all group ${
                          creationMode === "blank" ? "border-primary bg-primary/10 shadow-sm" : "border-border/50 bg-card/30 hover:border-border hover:bg-card/60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 p-2 rounded-lg ${creationMode === "blank" ? "bg-primary/20" : "bg-muted"}`}>
                            <PencilLine className={`w-4 h-4 ${creationMode === "blank" ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <div className="text-sm font-bold">Start Blank</div>
                            <div className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                              Get a clean portfolio template. Edit every section manually inline after launch.
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* AI path: paste resume */}
                  {creationMode === "ai" && (
                    <div className="space-y-2 animate-fade-in">
                      <Label htmlFor="career" className="text-sm font-semibold flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-primary" /> Resume / Career Summary
                      </Label>
                      <Textarea
                        id="career"
                        placeholder="Paste your resume details, project achievements, research interests, list of skills, or write a detailed summary of who you are and your experience..."
                        value={careerText}
                        onChange={(e) => setCareerText(e.target.value)}
                        className="min-h-[160px] bg-background/50 leading-relaxed text-xs"
                        required={creationMode === "ai"}
                      />
                      <p className="text-[10px] text-muted-foreground leading-normal">
                        Gemini AI will parse this and fill your bio, skills, experience, and projects.
                      </p>
                    </div>
                  )}

                  {/* Clone path: enter source username */}
                  {creationMode === "clone" && (
                    <div className="space-y-3 animate-fade-in">
                      <Label className="text-sm font-semibold flex items-center gap-1.5">
                        <FileStack className="w-4 h-4 text-primary" /> Source Portfolio Username
                      </Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-mono">@</span>
                          <Input
                            placeholder="johndoe"
                            value={cloneSource}
                            onChange={(e) => { setCloneSource(e.target.value); setCloneSnapshot(null); }}
                            className="pl-8 bg-background/50"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleLoadCloneSnapshot(cloneSource)}
                          disabled={isLoadingClone || !cloneSource.trim()}
                        >
                          {isLoadingClone ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load"}
                        </Button>
                      </div>
                      {cloneSnapshot && (
                        <div className="flex items-center gap-2 text-xs text-green-500 bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                          Template from <strong>@{cloneSource}</strong> is ready. Your name & links will be reset.
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground leading-normal">
                        Leave blank to clone the default LabForge template.
                      </p>
                    </div>
                  )}

                  {/* Blank path: info only */}
                  {creationMode === "blank" && (
                    <div className="flex items-start gap-3 p-3.5 bg-muted/30 border border-border/50 rounded-xl text-xs text-muted-foreground animate-fade-in">
                      <PencilLine className="w-4 h-4 flex-shrink-0 text-primary mt-0.5" />
                      <span>You'll get a clean, structured portfolio. Every section can be edited inline directly on your live page after creation.</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="w-1/3 border-border/80"
                      disabled={isProcessing}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isProcessing || (creationMode === "clone" && !cloneSnapshot && cloneSource.trim().length > 0)}
                      className="w-2/3 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
                    >
                      {isProcessing ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {creationMode === "ai" ? "Generating..." : "Creating..."}
                        </>
                      ) : (
                        <>{creationMode === "ai" ? "Generate with AI" : creationMode === "clone" ? "Clone & Launch" : "Launch Blank Portfolio"}
                          <Sparkles className="w-4 h-4 ml-1.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* ── STEP 3: Success ─────────────────────────────────── */}
              {step === 3 && (
                <div className="text-center space-y-6 py-6 animate-fade-in">
                  <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 mb-2">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">
                      {creationMode === "clone" ? "Site Cloned!" : creationMode === "ai" ? "Portfolio Generated!" : "Portfolio Created!"}
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                      {creationMode === "clone"
                        ? `Your portfolio is live, pre-loaded from the cloned template. Your name and socials have been reset — update them inline!`
                        : creationMode === "ai"
                        ? "Your career details have been structured by AI. You're now in live editing mode — tweak anything you like."
                        : "Your blank portfolio is live! Click any section on your page to start editing inline."}
                    </p>
                  </div>

                  <div className="p-4 bg-background/50 border border-border/80 rounded-xl max-w-sm mx-auto text-left space-y-2">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">🔗 Your Live Link</h4>
                    <code className="text-xs text-primary font-mono">
                      {window.location.origin}/u/{username.trim().toLowerCase()}
                    </code>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => navigate(`/u/${username.trim().toLowerCase()}`)}
                      className="px-8 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 hover:scale-105 transition-all font-semibold"
                    >
                      Go To My Portfolio <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Forge;
