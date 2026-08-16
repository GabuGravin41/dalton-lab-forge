import { useState, useEffect, useRef } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal, Monitor, Sparkles, Send } from "lucide-react";
import { toast } from "sonner";

interface HistoryItem {
  command: string;
  output: React.ReactNode;
}

export const TerminalLayout = () => {
  const { profile, projects, papers, isEditMode, updateProfile } = usePortfolio();
  const [inputVal, setInputVal] = useState("");
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [terminalColor, setTerminalColor] = useState<"green" | "amber" | "cyan">("green");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  
  // Custom greeting edit
  const greetingText = profile.cliGreeting || `Welcome to ${profile.name || "Dalton Omondi"}'s Portfolio OS [v2.1].\nType 'help' to see list of available commands.`;
  const [editableGreeting, setEditableGreeting] = useState(greetingText);
  const [isEditingGreeting, setIsEditingGreeting] = useState(false);

  useEffect(() => {
    setEditableGreeting(greetingText);
  }, [greetingText]);

  useEffect(() => {
    // Initial welcome history item
    setHistory([
      {
        command: "system-login",
        output: (
          <div className="whitespace-pre-wrap leading-relaxed">
            {greetingText}
          </div>
        )
      }
    ]);
  }, [greetingText]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;

    let output: React.ReactNode = "";

    switch (trimmed) {
      case "help":
        output = (
          <div className="space-y-1">
            <p className="font-semibold text-primary">Available Commands:</p>
            <p><span className="text-accent min-w-[80px] inline-block">about</span> - Print brief bio & roles</p>
            <p><span className="text-accent min-w-[80px] inline-block">skills</span> - List core technical skills</p>
            <p><span className="text-accent min-w-[80px] inline-block">projects</span> - List featured engineering projects</p>
            <p><span className="text-accent min-w-[80px] inline-block">research</span> - List published papers & abstracts</p>
            <p><span className="text-accent min-w-[80px] inline-block">contact</span> - Show social details & email</p>
            <p><span className="text-accent min-w-[80px] inline-block">theme</span> - Toggle colors (e.g. 'theme amber', 'theme green', 'theme cyan')</p>
            <p><span className="text-accent min-w-[80px] inline-block">clear</span> - Clear the terminal session logs</p>
          </div>
        );
        break;
      case "about":
      case "bio":
        output = (
          <div className="space-y-2">
            <p><strong className="text-primary">Name:</strong> {profile.name}</p>
            <p><strong className="text-primary">Roles:</strong> {profile.roles?.join(" | ")}</p>
            <p><strong className="text-primary">Bio:</strong> {profile.bio}</p>
            {profile.about?.approach && <p><strong className="text-primary">Approach:</strong> {profile.about.approach}</p>}
            {profile.about?.lookingFor && <p><strong className="text-primary">Seeking:</strong> {profile.about.lookingFor}</p>}
          </div>
        );
        break;
      case "skills":
        output = (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {profile.skills?.map((skill: any, i: number) => (
              <div key={i} className="border border-border/20 p-2 rounded bg-card/10">
                <span className="text-accent font-bold">{skill.title}</span>: {skill.description}
              </div>
            ))}
          </div>
        );
        break;
      case "projects":
        output = (
          <div className="space-y-3">
            {projects?.map((proj: any, i: number) => (
              <div key={i} className="border-l-2 border-primary pl-3 py-1">
                <p className="font-bold text-accent">{proj.title} <span className="text-xs font-normal opacity-60">({proj.category})</span></p>
                <p className="text-xs leading-relaxed">{proj.description}</p>
                {proj.technologies && <p className="text-[10px] text-primary/70 mt-1">Tags: {proj.technologies.join(", ")}</p>}
              </div>
            ))}
          </div>
        );
        break;
      case "research":
      case "papers":
        output = (
          <div className="space-y-3">
            {papers?.map((paper: any, i: number) => (
              <div key={i} className="border-l-2 border-accent pl-3 py-1">
                <p className="font-bold text-primary">{paper.title} <span className="text-xs font-normal opacity-60">({paper.year})</span></p>
                <p className="text-xs italic opacity-75">Status: {paper.status}</p>
                <p className="text-xs mt-1 leading-relaxed">{paper.abstract}</p>
              </div>
            ))}
          </div>
        );
        break;
      case "contact":
      case "mail":
        output = (
          <div className="space-y-1">
            <p><strong className="text-primary">Email:</strong> <a href={`mailto:${profile.socials?.email}`} className="hover:underline text-accent">{profile.socials?.email}</a></p>
            {profile.socials?.github && <p><strong className="text-primary">GitHub:</strong> <a href={profile.socials.github} target="_blank" rel="noreferrer" className="hover:underline text-accent">{profile.socials.github}</a></p>}
            {profile.socials?.linkedin && <p><strong className="text-primary">LinkedIn:</strong> <a href={profile.socials.linkedin} target="_blank" rel="noreferrer" className="hover:underline text-accent">{profile.socials.linkedin}</a></p>}
            {profile.socials?.twitter && <p><strong className="text-primary">Twitter:</strong> <a href={profile.socials.twitter} target="_blank" rel="noreferrer" className="hover:underline text-accent">{profile.socials.twitter}</a></p>}
          </div>
        );
        break;
      case "clear":
        setHistory([]);
        setInputVal("");
        return;
      case "theme green":
        setTerminalColor("green");
        output = "Terminal phosphor color set to GREEN.";
        break;
      case "theme amber":
        setTerminalColor("amber");
        output = "Terminal phosphor color set to AMBER.";
        break;
      case "theme cyan":
        setTerminalColor("cyan");
        output = "Terminal phosphor color set to CYAN.";
        break;
      case "theme":
        output = "Use: 'theme green', 'theme amber', or 'theme cyan' to adjust color outputs.";
        break;
      default:
        output = `Command not recognized: '${trimmed}'. Type 'help' to view valid options.`;
    }

    setHistory(prev => [...prev, { command: cmd, output }]);
    setInputVal("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCommand(inputVal);
    }
  };

  const handleSaveGreeting = () => {
    updateProfile("cliGreeting", editableGreeting);
    setIsEditingGreeting(false);
    toast.success("CLI greeting message updated locally!");
  };

  // Class theme mapping
  const colorClasses = {
    green: "text-green-500 border-green-500/30 [--terminal-glow:rgba(34,197,94,0.15)] [--terminal-phosphor:#22c55e]",
    amber: "text-amber-500 border-amber-500/30 [--terminal-glow:rgba(245,158,11,0.15)] [--terminal-phosphor:#f59e0b]",
    cyan: "text-cyan-400 border-cyan-400/30 [--terminal-glow:rgba(34,211,238,0.15)] [--terminal-phosphor:#22d3ee]",
  };

  const activeColor = colorClasses[terminalColor];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-16 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Interactive Terminal</h2>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={() => setCrtEnabled(!crtEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${crtEnabled ? 'bg-primary/10 border-primary text-primary' : 'bg-muted/50 border-border/50 text-muted-foreground'}`}
          >
            <Monitor className="w-3.5 h-3.5" />
            {crtEnabled ? "CRT Scanlines: ON" : "CRT Scanlines: OFF"}
          </button>

          <div className="flex items-center gap-1">
            <span className="text-muted-foreground mr-1">Colors:</span>
            {["green", "amber", "cyan"].map((color) => (
              <button
                key={color}
                onClick={() => setTerminalColor(color as any)}
                className={`w-3 h-3 rounded-full border transition-all ${
                  terminalColor === color 
                    ? "bg-primary border-primary scale-110 shadow-sm" 
                    : "bg-muted border-border hover:opacity-85"
                }`}
                title={`Set ${color} theme`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Greeting Editor Panel in Edit Mode */}
      {isEditMode && (
        <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
          <div className="text-xs font-bold text-primary flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Edit CLI Greeting Message
          </div>
          {isEditingGreeting ? (
            <div className="space-y-2">
              <textarea
                value={editableGreeting}
                onChange={(e) => setEditableGreeting(e.target.value)}
                className="w-full min-h-[80px] p-2 bg-background border border-border rounded-lg text-xs leading-relaxed text-foreground font-mono focus:ring-1 focus:ring-primary focus:outline-none"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveGreeting} className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white">
                  Save Greeting
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditingGreeting(false)} className="h-7 text-xs border-border/60">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-start gap-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click edit to customize the welcome statement printed inside the terminal shell window.
              </p>
              <Button size="sm" variant="outline" onClick={() => setIsEditingGreeting(true)} className="h-7 text-xs border-border/60">
                Edit
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Terminal Shell Window */}
      <div 
        className={`relative w-full aspect-[4/3] max-h-[500px] md:max-h-[600px] bg-black border rounded-xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 ${activeColor}`}
        style={{
          boxShadow: crtEnabled ? "inset 0 0 80px rgba(0,0,0,0.9), 0 0 30px var(--terminal-glow)" : "none"
        }}
      >
        {/* CRT Scanline Filter Overlay */}
        {crtEnabled && (
          <div className="absolute inset-0 pointer-events-none z-50 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)]">
            {/* Scanline lines using absolute styling to prevent tailwind config dependency */}
            <div 
              className="absolute inset-0 opacity-[0.08] pointer-events-none"
              style={{
                backgroundImage: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
                backgroundSize: "100% 4px, 6px 100%"
              }}
            />
          </div>
        )}

        {/* Terminal Window Header Bar */}
        <div className="h-9 px-4 bg-zinc-900 border-b border-border/30 flex items-center justify-between text-xs select-none text-zinc-400 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-zinc-700/50" />
            <span className="w-3 h-3 rounded-full bg-zinc-700/50" />
            <span className="w-3 h-3 rounded-full bg-zinc-700/50" />
          </div>
          <div className="font-mono text-[10px] tracking-wider text-zinc-500">
            guest@{profile.name ? profile.name.split(" ")[0].toLowerCase() : "dalton"}-os:~
          </div>
          <div className="w-12" />
        </div>

        {/* Terminal Output Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs md:text-sm leading-relaxed scrollbar-thin scrollbar-thumb-zinc-800">
          {history.map((item, idx) => (
            <div key={idx} className="space-y-1 animate-fade-in">
              {item.command !== "system-login" && (
                <div className="flex items-center gap-1 opacity-70">
                  <span className="text-primary font-bold">guest@{profile.name ? profile.name.split(" ")[0].toLowerCase() : "dalton"}-os:~$</span>
                  <span>{item.command}</span>
                </div>
              )}
              <div className="pl-2 border-l border-zinc-800/40">
                {item.output}
              </div>
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* Command Quick Actions */}
        <div className="px-4 py-2 border-t border-border/20 bg-zinc-950 flex flex-wrap gap-2 select-none flex-shrink-0">
          {["help", "about", "skills", "projects", "research", "contact"].map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleCommand(cmd)}
              className="text-[10px] md:text-xs px-2.5 py-0.5 rounded border border-border/20 bg-zinc-900 hover:bg-zinc-800 transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="h-10 px-4 bg-zinc-950 border-t border-border/30 flex items-center gap-2 flex-shrink-0">
          <span className="font-bold shrink-0">
            guest@{profile.name ? profile.name.split(" ")[0].toLowerCase() : "dalton"}-os:~$
          </span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a command..."
            className="flex-1 min-w-0 bg-transparent text-foreground border-none outline-none focus:ring-0 focus:outline-none placeholder-zinc-700 text-xs md:text-sm shadow-none"
            style={{ color: "var(--terminal-phosphor)" }}
          />
          <button 
            onClick={() => handleCommand(inputVal)}
            className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-foreground shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
