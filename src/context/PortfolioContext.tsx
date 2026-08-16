import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import profileDefault from "@/data/profile.json";
import projectsDefault from "@/data/projects.json";
import papersDefault from "@/data/papers.json";

interface PortfolioContextType {
  profile: any;
  projects: any[];
  papers: any[];
  isEditMode: boolean;
  hasUnsavedChanges: boolean;
  username: string | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  setEditMode: (mode: boolean) => void;
  updateProfile: (key: string, value: any) => void;
  updateProjects: (projects: any[]) => void;
  updatePapers: (papers: any[]) => void;
  login: (username: string, passcode: string, seedData?: { profile: any; projects: any[]; papers: any[] }) => Promise<boolean>;
  fetchUserSnapshot: (username: string) => Promise<{ profile: any; projects: any[]; papers: any[] } | null>;
  logout: () => void;
  publishChanges: () => Promise<boolean>;
  generatePortfolioFromAI: (text: string) => Promise<boolean>;
  loadUserPortfolio: (username: string) => Promise<void>;
  loadUserPortfolioByDomain: (domain: string) => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<any>(profileDefault);
  const [projects, setProjects] = useState<any[]>(projectsDefault);
  const [papers, setPapers] = useState<any[]>(papersDefault);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem("portfolio_user"));
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("portfolio_token"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync draft edits to local storage so they survive page refreshes
  useEffect(() => {
    if (username && isEditMode) {
      localStorage.setItem(`draft_profile_${username}`, JSON.stringify(profile));
      localStorage.setItem(`draft_projects_${username}`, JSON.stringify(projects));
      localStorage.setItem(`draft_papers_${username}`, JSON.stringify(papers));
      setHasUnsavedChanges(true);
    }
  }, [profile, projects, papers, username, isEditMode]);

  // Load user data dynamically
  const loadUserPortfolio = async (user: string) => {
    setLoading(true);
    setError(null);
    try {
      const activeToken = token || localStorage.getItem("portfolio_token");
      const headers: HeadersInit = {};
      if (activeToken) {
        headers["Authorization"] = `Bearer ${activeToken}`;
      }
      const res = await fetch(`/api/portfolio?username=${user}`, { headers });
      if (!res.ok) {
        throw new Error(res.status === 404 ? "Portfolio not found" : "Failed to load portfolio");
      }
      
      const data = await res.json();
      
      // Sync loaded aiSettings to localStorage
      if (user === username || user === data.username) {
        const loadedProfile = data.profile;
        if (loadedProfile?.aiSettings) {
          const { provider, openrouterKey, openrouterModel, geminiKey } = loadedProfile.aiSettings;
          if (provider) localStorage.setItem("admin_ai_provider", provider);
          if (openrouterKey) localStorage.setItem("admin_openrouter_key", openrouterKey);
          if (openrouterModel) localStorage.setItem("admin_openrouter_model", openrouterModel);
          if (geminiKey) localStorage.setItem("admin_gemini_key", geminiKey);
        }
      }
      
      // Check if user is logged in as this person, load their local drafts if present
      const savedDraftProfile = localStorage.getItem(`draft_profile_${user}`);
      const savedDraftProjects = localStorage.getItem(`draft_projects_${user}`);
      const savedDraftPapers = localStorage.getItem(`draft_papers_${user}`);

      let activeProfile;
      if (user === username) {
        setIsEditMode(true);
        if (savedDraftProfile) {
          activeProfile = JSON.parse(savedDraftProfile);
          setProfile(activeProfile);
          setProjects(JSON.parse(savedDraftProjects || "[]"));
          setPapers(JSON.parse(savedDraftPapers || "[]"));
          setHasUnsavedChanges(true);
        } else {
          activeProfile = data.profile;
          setProfile(activeProfile);
          setProjects(data.projects);
          setPapers(data.papers);
          setHasUnsavedChanges(false);
        }
      } else {
        activeProfile = data.profile;
        setProfile(activeProfile);
        setProjects(data.projects);
        setPapers(data.papers);
        setIsEditMode(false);
        setHasUnsavedChanges(false);
      }

      if (activeProfile) {
        localStorage.setItem("portfolio_theme", activeProfile.theme || "indigo");
        localStorage.setItem("portfolio_layout", activeProfile.layoutTemplate || "standard");
        window.dispatchEvent(new CustomEvent("portfolio-theme-change"));
        window.dispatchEvent(new CustomEvent("portfolio-layout-change"));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      toast.error(err.message);
      
      // Reset to defaults on error
      setProfile(profileDefault);
      setProjects(projectsDefault);
      setPapers(papersDefault);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPortfolioByDomain = async (dom: string) => {
    setLoading(true);
    setError(null);
    try {
      const cleanDomain = dom.trim().toLowerCase().replace(/^www\./, '');
      const activeToken = token || localStorage.getItem("portfolio_token");
      const headers: HeadersInit = {};
      if (activeToken) {
        headers["Authorization"] = `Bearer ${activeToken}`;
      }
      const res = await fetch(`/api/portfolio?domain=${cleanDomain}`, { headers });
      if (!res.ok) {
        throw new Error(res.status === 404 ? "Portfolio not found" : "Failed to load portfolio");
      }
      
      const data = await res.json();
      const user = data.username;
      
      // Sync loaded aiSettings to localStorage
      if (user === username || user === data.username) {
        const loadedProfile = data.profile;
        if (loadedProfile?.aiSettings) {
          const { provider, openrouterKey, openrouterModel, geminiKey } = loadedProfile.aiSettings;
          if (provider) localStorage.setItem("admin_ai_provider", provider);
          if (openrouterKey) localStorage.setItem("admin_openrouter_key", openrouterKey);
          if (openrouterModel) localStorage.setItem("admin_openrouter_model", openrouterModel);
          if (geminiKey) localStorage.setItem("admin_gemini_key", geminiKey);
        }
      }

      // Check if user is logged in as this person, load their local drafts if present
      const savedDraftProfile = localStorage.getItem(`draft_profile_${user}`);
      const savedDraftProjects = localStorage.getItem(`draft_projects_${user}`);
      const savedDraftPapers = localStorage.getItem(`draft_papers_${user}`);

      let activeProfile;
      if (user === username) {
        setIsEditMode(true);
        if (savedDraftProfile) {
          activeProfile = JSON.parse(savedDraftProfile);
          setProfile(activeProfile);
          setProjects(JSON.parse(savedDraftProjects || "[]"));
          setPapers(JSON.parse(savedDraftPapers || "[]"));
          setHasUnsavedChanges(true);
        } else {
          activeProfile = data.profile;
          setProfile(activeProfile);
          setProjects(data.projects);
          setPapers(data.papers);
          setHasUnsavedChanges(false);
        }
      } else {
        activeProfile = data.profile;
        setProfile(activeProfile);
        setProjects(data.projects);
        setPapers(data.papers);
        setIsEditMode(false);
        setHasUnsavedChanges(false);
      }

      if (activeProfile) {
        localStorage.setItem("portfolio_theme", activeProfile.theme || "indigo");
        localStorage.setItem("portfolio_layout", activeProfile.layoutTemplate || "standard");
        window.dispatchEvent(new CustomEvent("portfolio-theme-change"));
        window.dispatchEvent(new CustomEvent("portfolio-layout-change"));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      toast.error(err.message);
      
      // Reset to defaults on error
      setProfile(profileDefault);
      setProjects(projectsDefault);
      setPapers(papersDefault);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (key: string, value: any) => {
    if (key === "_all") {
      setProfile(value);
      if (value.theme) {
        localStorage.setItem("portfolio_theme", value.theme);
        window.dispatchEvent(new CustomEvent("portfolio-theme-change"));
      }
      return;
    }
    setProfile((prev: any) => {
      const updated = { ...prev, [key]: value };
      
      // Special check: if they updated the theme, apply it immediately on document classList
      if (key === "theme") {
        localStorage.setItem("portfolio_theme", value);
        window.dispatchEvent(new CustomEvent("portfolio-theme-change"));
      }

      return updated;
    });
  };

  const updateProjects = (updatedProjects: any[]) => {
    setProjects(updatedProjects);
  };

  const updatePapers = (updatedPapers: any[]) => {
    setPapers(updatedPapers);
  };

  const fetchUserSnapshot = async (user: string): Promise<{ profile: any; projects: any[]; papers: any[] } | null> => {
    try {
      const res = await fetch(`/api/portfolio?username=${user.trim().toLowerCase()}`);
      if (!res.ok) return null;
      const data = await res.json();
      return { profile: data.profile, projects: data.projects, papers: data.papers };
    } catch {
      return null;
    }
  };

  const login = async (user: string, passcode: string, seedData?: { profile: any; projects: any[]; papers: any[] }): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user,
          passcode,
          seedProfile: seedData?.profile,
          seedProjects: seedData?.projects,
          seedPapers: seedData?.papers
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      setUsername(data.username);
      setToken(data.token);
      localStorage.setItem("portfolio_user", data.username);
      localStorage.setItem("portfolio_token", data.token);
      setIsEditMode(true);

      // Force load their dynamic profile details
      await loadUserPortfolio(data.username);
      toast.success(res.status === 201 ? "Account registered successfully!" : "Logged in successfully!");
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear drafts from storage
    if (username) {
      localStorage.removeItem(`draft_profile_${username}`);
      localStorage.removeItem(`draft_projects_${username}`);
      localStorage.removeItem(`draft_papers_${username}`);
    }
    
    setUsername(null);
    setToken(null);
    setIsEditMode(false);
    localStorage.removeItem("portfolio_user");
    localStorage.removeItem("portfolio_token");
    
    // Reset back to Dalton's default portfolio
    setProfile(profileDefault);
    setProjects(projectsDefault);
    setPapers(papersDefault);
    toast.info("Logged out of editor mode.");
  };

  const publishChanges = async (): Promise<boolean> => {
    if (!token || !username) {
      toast.error("You must be logged in to publish changes.");
      return false;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ profile, projects, papers })
      });

      const data = await res.json();
      if (!res.ok) {
        // Session expired: clear auth and bounce to forge login
        if (res.status === 401) {
          setUsername(null);
          setToken(null);
          setIsEditMode(false);
          localStorage.removeItem("portfolio_user");
          localStorage.removeItem("portfolio_token");
          toast.error("Session expired. Please log in again.");
          window.location.href = '/forge';
          return false;
        }
        throw new Error(data.error || "Failed to publish changes");
      }

      // Successful publish: Clear draft memory
      localStorage.removeItem(`draft_profile_${username}`);
      localStorage.removeItem(`draft_projects_${username}`);
      localStorage.removeItem(`draft_papers_${username}`);
      setHasUnsavedChanges(false);

      toast.success("Portfolio published live successfully!");
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const generatePortfolioFromAI = async (text: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, currentProfile: profile, currentProjects: projects, currentPapers: papers })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "AI generation failed");
      }

      // Load AI structured details directly into the live preview state
      setProfile(data.profile);
      setProjects(data.projects);
      setPapers(data.papers || []);
      
      // Auto-trigger custom theme class updates
      if (data.profile.theme) {
        localStorage.setItem("portfolio_theme", data.profile.theme);
        window.dispatchEvent(new CustomEvent("portfolio-theme-change"));
      }

      toast.success("AI generated your portfolio details successfully! Previewing now.");
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Helper to convert hex to HSL variables
  const hexToHsl = (hex: string) => {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  useEffect(() => {
    const custom = profile?.customTheme || {
      primaryStart: "#4F46E5",
      primaryEnd: "#7C3AED",
      accentStart: "#F59E0B",
      accentEnd: "#EF4444",
      bgStart: "#0A0B10",
      bgEnd: "#11131E"
    };

    try {
      const p1 = hexToHsl(custom.primaryStart || "#4F46E5");
      const p2 = hexToHsl(custom.primaryEnd || "#7C3AED");
      const a1 = hexToHsl(custom.accentStart || "#F59E0B");
      const a2 = hexToHsl(custom.accentEnd || "#EF4444");
      const bg1 = hexToHsl(custom.bgStart || "#0A0B10");
      const bg2 = hexToHsl(custom.bgEnd || "#11131E");

      const cardL = Math.min(100, bg1.l + 4);
      const popoverL = Math.min(100, bg1.l + 2);
      const secondaryL = Math.min(100, bg1.l + 10);
      const mutedL = Math.min(100, bg1.l + 12);
      const borderL = Math.min(100, bg1.l + 14);

      const styleContent = `
        .theme-custom {
          --background: ${bg1.h} ${bg1.s}% ${bg1.l}%;
          --foreground: 240 10% 96%;
          --card: ${bg1.h} ${bg1.s}% ${cardL}%;
          --card-foreground: 240 10% 96%;
          --popover: ${bg1.h} ${bg1.s}% ${popoverL}%;
          --popover-foreground: 240 10% 96%;
          --primary: ${p1.h} ${p1.s}% ${p1.l}%;
          --primary-foreground: 240 10% 98%;
          --secondary: ${bg1.h} ${bg1.s}% ${secondaryL}%;
          --secondary-foreground: 240 10% 96%;
          --muted: ${bg1.h} ${bg1.s}% ${mutedL}%;
          --muted-foreground: 240 5% 64%;
          --accent: ${a1.h} ${a1.s}% ${a1.l}%;
          --accent-foreground: ${bg1.h} ${bg1.s}% ${bg1.l}%;
          --border: ${bg1.h} ${bg1.s}% ${borderL}%;
          --input: ${bg1.h} ${bg1.s}% ${borderL}%;
          --ring: ${p1.h} ${p1.s}% ${p1.l}%;

          --gradient-primary: linear-gradient(135deg, hsl(${p1.h} ${p1.s}% ${p1.l}%) 0%, hsl(${p2.h} ${p2.s}% ${p2.l}%) 100%);
          --gradient-accent: linear-gradient(135deg, hsl(${a1.h} ${a1.s}% ${a1.l}%) 0%, hsl(${a2.h} ${a2.s}% ${a2.l}%) 100%);
          --gradient-subtle: linear-gradient(180deg, hsl(${bg1.h} ${bg1.s}% ${bg1.l}%) 0%, hsl(${bg2.h} ${bg2.s}% ${bg2.l}%) 100%);

          --shadow-sm: 0 2px 8px -2px hsl(${p1.h} ${p1.s}% ${p1.l}% / 0.1);
          --shadow-md: 0 8px 24px -4px hsl(${p1.h} ${p1.s}% ${p1.l}% / 0.15);
          --shadow-lg: 0 16px 48px -8px hsl(${p1.h} ${p1.s}% ${p1.l}% / 0.2);
          --shadow-glow: 0 0 32px hsl(${p1.h} ${p1.s}% ${p1.l}% / 0.3);
        }
      `;

      let styleEl = document.getElementById("custom-theme-styles");
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "custom-theme-styles";
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = styleContent;
    } catch (e) {
      console.error("Custom theme CSS injection failed:", e);
    }
  }, [profile?.customTheme]);

  return (
    <PortfolioContext.Provider
      value={{
        profile,
        projects,
        papers,
        isEditMode,
        hasUnsavedChanges,
        username,
        token,
        loading,
        error,
        setEditMode: setIsEditMode,
        updateProfile,
        updateProjects,
        updatePapers,
        login,
        logout,
        publishChanges,
        generatePortfolioFromAI,
        loadUserPortfolio,
        loadUserPortfolioByDomain,
        fetchUserSnapshot
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
};
