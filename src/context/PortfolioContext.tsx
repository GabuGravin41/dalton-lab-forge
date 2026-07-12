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
      const res = await fetch(`/api/portfolio?username=${user}`);
      if (!res.ok) {
        throw new Error(res.status === 404 ? "Portfolio not found" : "Failed to load portfolio");
      }
      
      const data = await res.json();
      
      // Check if user is logged in as this person, load their local drafts if present
      const savedDraftProfile = localStorage.getItem(`draft_profile_${user}`);
      const savedDraftProjects = localStorage.getItem(`draft_projects_${user}`);
      const savedDraftPapers = localStorage.getItem(`draft_papers_${user}`);

      if (user === username && savedDraftProfile) {
        setProfile(JSON.parse(savedDraftProfile));
        setProjects(JSON.parse(savedDraftProjects || "[]"));
        setPapers(JSON.parse(savedDraftPapers || "[]"));
        setIsEditMode(true);
        setHasUnsavedChanges(true);
      } else {
        setProfile(data.profile);
        setProjects(data.projects);
        setPapers(data.papers);
        setHasUnsavedChanges(false);
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
