import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Research from "@/components/Research";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingChatbot from "@/components/FloatingChatbot";
import { usePortfolio } from "@/context/PortfolioContext";
import { Button } from "@/components/ui/button";
import { MinimalistLayout } from "@/components/MinimalistLayout";
import { CreativeLayout } from "@/components/CreativeLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Trash2, Calendar, Building, User as UserIcon, Inbox } from "lucide-react";
import { toast } from "sonner";

const EditHeader = () => {
  const { publishChanges, logout, username, loading, hasUnsavedChanges, profile, updateProfile } = usePortfolio();

  const leads = profile?.leads || [];

  const handleDeleteLead = (leadId: string) => {
    const updatedLeads = leads.filter((l: any) => l.id !== leadId);
    updateProfile("leads", updatedLeads);
    toast.success("Lead removed. Click 'Publish Live' to save changes.");
  };

  return (
    <div className="bg-background/95 backdrop-blur-md border-b border-primary/30 py-2.5 px-6 flex items-center justify-between sticky top-0 z-[100] text-xs text-foreground select-none print:hidden shadow-lg shadow-primary/5">
      <div className="flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-muted-foreground">Editing as <strong className="text-foreground">@{username}</strong></span>
        {hasUnsavedChanges ? (
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-500 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Unsaved changes
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-500 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            All published
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[11px] border-border/50 text-muted-foreground hover:text-foreground gap-1"
            >
              <Mail className="w-3.5 h-3.5" />
              Leads
              {leads.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-primary text-primary-foreground rounded-full text-[9px] font-bold">
                  {leads.length}
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <Inbox className="w-5 h-5 text-primary" /> Captured Inquiries & Leads
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {leads.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <Inbox className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-sm font-medium">No inquiries received yet.</p>
                  <p className="text-xs max-w-sm mx-auto">When recruiters or visitors submit the lead form in your chatbot, they will show up here.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {[...leads].reverse().map((lead: any) => (
                    <div key={lead.id} className="p-4 bg-muted/40 border border-border/60 rounded-xl relative group hover:border-primary/30 transition-all">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLead(lead.id)}
                        className="absolute top-3 right-3 h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                            <UserIcon className="w-3.5 h-3.5 text-muted-foreground" /> {lead.name}
                          </div>
                          {lead.message.includes("[Inquiry from ") && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card px-2 py-0.5 rounded-full border border-border/50">
                              <Building className="w-3 h-3 text-primary" />
                              {lead.message.match(/\[Inquiry from (.*?)\]/)?.[1] || "Company"}
                            </div>
                          )}
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(lead.createdAt).toLocaleDateString()} at {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="text-[11px] text-primary/80 font-medium hover:underline">
                          <a href={`mailto:${lead.email}`}>{lead.email}</a>
                        </div>
                        <p className="text-xs text-muted-foreground bg-card p-3 rounded-lg border border-border/40 leading-relaxed font-mono whitespace-pre-wrap">
                          {lead.message.replace(/\[Inquiry from .*?\] /, "")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant={hasUnsavedChanges ? "default" : "outline"}
          size="sm"
          onClick={publishChanges}
          disabled={loading || !hasUnsavedChanges}
          className={`h-7 text-[11px] transition-all ${hasUnsavedChanges ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 hover:bg-primary/90" : "border-border/50 text-muted-foreground"}`}
        >
          {loading ? "Publishing..." : hasUnsavedChanges ? "⬆ Publish Live" : "Published"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="h-7 hover:bg-destructive/10 hover:text-destructive text-[11px] text-muted-foreground"
        >
          Log Out
        </Button>
      </div>
    </div>
  );
};


const Index = () => {
  const { isEditMode, profile } = usePortfolio();
  const [activeLayout, setActiveLayout] = useState(() => {
    return localStorage.getItem("portfolio_layout") || profile?.layoutTemplate || "standard";
  });

  useEffect(() => {
    if (isEditMode && profile?.layoutTemplate) {
      setActiveLayout(profile.layoutTemplate);
    }
  }, [profile?.layoutTemplate, isEditMode]);

  useEffect(() => {
    const syncLayout = () => {
      setActiveLayout(localStorage.getItem("portfolio_layout") || profile?.layoutTemplate || "standard");
    };
    window.addEventListener("portfolio-layout-change", syncLayout);
    return () => window.removeEventListener("portfolio-layout-change", syncLayout);
  }, [profile?.layoutTemplate]);

  const renderLayoutContent = () => {
    switch (activeLayout) {
      case "minimalist":
        return <MinimalistLayout />;
      case "creative":
        return <CreativeLayout />;
      case "standard":
      default:
        return (
          <>
            <Hero />
            <About />
            <Projects />
            {!profile?.hideResearch && <Research />}
            <Contact />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {isEditMode && <EditHeader />}
      <Navigation />
      <main>
        {renderLayoutContent()}
      </main>
      <Footer />
      <FloatingChatbot />
    </div>
  );
};

export default Index;
