import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Mic, MicOff, Volume2, VolumeX, Bot, User, X, MessageCircle, Sparkles, CheckCircle2 } from "lucide-react";

import { usePortfolio } from "@/context/PortfolioContext";
import { generateAIResponse } from "@/utils/aiClient";
import { getPortfolioUpdatesFromAI, UpdateAssistantResult } from "@/utils/adminGemini";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const RecruiterForm = ({ onSubmitSuccess }: { onSubmitSuccess: (msg: string) => void }) => {
  const { profile } = usePortfolio();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const portfolioOwner = window.location.pathname.startsWith('/u/')
        ? window.location.pathname.replace('/u/', '').split('/')[0]
        : 'dalton';
      
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: portfolioOwner,
          name,
          email,
          message: company ? `[Inquiry from ${company}] ${message}` : message
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      
      setSubmitted(true);
      onSubmitSuccess(`Inquiry submitted successfully! I've forwarded your details to ${profile.name || "the builder"} as a priority lead.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit lead");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-xs flex flex-col items-center gap-1 text-center font-medium">
        <span>✓ Submission Received!</span>
        <span>Saved to dashboard.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-card border border-border/80 rounded-xl space-y-2 text-left shadow-sm">
      <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-primary animate-pulse" />
        Priority Recruiter Lead Form
      </div>
      <div className="space-y-1">
        <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Your Name *</label>
        <Input 
          required 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="e.g. Jane Doe" 
          className="h-7 text-xs bg-background/50 border-border/50 focus-visible:ring-primary" 
        />
      </div>
      <div className="space-y-1">
        <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Company Name</label>
        <Input 
          value={company} 
          onChange={(e) => setCompany(e.target.value)} 
          placeholder="e.g. OpenAI" 
          className="h-7 text-xs bg-background/50 border-border/50 focus-visible:ring-primary" 
        />
      </div>
      <div className="space-y-1">
        <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Email Address *</label>
        <Input 
          required 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="e.g. jane@company.com" 
          className="h-7 text-xs bg-background/50 border-border/50 focus-visible:ring-primary" 
        />
      </div>
      <div className="space-y-1">
        <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Inquiry Details *</label>
        <Textarea 
          required 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Role details, schedule links, or feedback..." 
          className="min-h-[50px] text-xs bg-background/50 border-border/50 focus-visible:ring-primary" 
        />
      </div>
      <Button 
        type="submit" 
        disabled={submitting} 
        className="w-full h-8 text-xs bg-gradient-primary hover:opacity-95 text-white font-bold"
      >
        {submitting ? "Submitting..." : "Submit Inquiry"}
      </Button>
    </form>
  );
};

const FloatingChatbot = () => {
  const { isEditMode, profile, projects, papers, updateProfile, updateProjects, updatePapers } = usePortfolio();
  const [botMode, setBotMode] = useState<"chat" | "editor">("chat");
  const [proposedEdits, setProposedEdits] = useState<UpdateAssistantResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setMessages([
      {
        id: '1',
        text: `Hey! 👋 I'm ${profile.name || "the builder"}'s AI Assistant. Ask me anything about their projects, skills, research, or experience!`,
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  }, [profile.name]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const systemPrompt = `
You are ${profile.name || "the builder"}'s Portfolio Virtual Assistant, a friendly and highly capable AI.
Your purpose is to answer visitor questions about ${profile.name || "the builder"}'s work, experience, background, research papers, projects, and skills.
Use the following structured JSON data representing their background as your ground truth source of information:

--- PROFILE DATA ---
${JSON.stringify(profile, null, 2)}

--- PROJECTS DATA ---
${JSON.stringify(projects, null, 2)}

--- RESEARCH PAPERS DATA ---
${JSON.stringify(papers, null, 2)}

--- BEHAVIOR GUIDELINES ---
1. Speak in first-person (plural) or third-person on behalf of ${profile.name || "the builder"}, or as their virtual assistant. A warm, professional, and slightly enthusiastic builder tone (using occasional tech emojis) is preferred.
2. Be honest and accurate. If the answer to a question cannot be inferred from the provided data, politely state that you don't have that information but invite them to reach out directly at: ${profile.socials?.email || ""}
3. Keep responses concise and readable (typically 2-4 sentences or bullet points) suitable for a small chat widget.
4. Highlight their expertise, pointing to specific projects or papers from the data where relevant.

--- RECRUITER SCREENING & INQUIRY BOOKING ---
If the visitor expresses interest in hiring, scheduling an interview, booking a meeting, leaving contact info, or emailing ${profile.name || "the builder"}:
- Act as a screening representative.
- Politely invite them to submit their details through the priority inquiry form loaded below.
- You MUST append the exact tag [LEAD_CAPTURE_FORM] at the very end of your response text.
`;

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const promptText = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      // Build conversation history for context
      const recentHistory = messages
        .slice(-6)
        .map(m => `${m.sender === 'user' ? 'Visitor' : 'Assistant'}: ${m.text}`)
        .join("\n");
      
      const promptWithHistory = `
Here is the recent conversation history:
${recentHistory}

Visitor's new question:
"${promptText}"

Assistant response:
`;

      const botText = await generateAIResponse(promptWithHistory, systemPrompt);

      const botResponse: Message = {
        id: Date.now().toString(),
        text: botText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);

      // If text-to-speech is enabled, speak it
      if (isSpeaking && ('speechSynthesis' in window)) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(botText);
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      const botResponse: Message = {
        id: Date.now().toString(),
        text: "I apologize, but I ran into an issue connecting to my brain. Please try again or feel free to check the portfolio sections directly! 🛠️",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onerror = (e: any) => {
      console.error("Speech recognition error:", e);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const toggleSpeech = () => {
    const nextSpeaking = !isSpeaking;
    setIsSpeaking(nextSpeaking);
    if (!nextSpeaking && ('speechSynthesis' in window)) {
      window.speechSynthesis.cancel();
    }
  };

  const handleSendAIRequest = async () => {
    if (!inputValue.trim() || isAiLoading) return;
    const promptText = inputValue;
    setInputValue("");
    setIsAiLoading(true);
    setProposedEdits(null);
    try {
      const result = await getPortfolioUpdatesFromAI(promptText, profile, projects, papers);
      setProposedEdits(result);
    } catch (err: any) {
      console.error("AI edit error:", err);
      toast.error(err.message || "Failed to generate AI edits");
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyProposedEdits = () => {
    if (!proposedEdits) return;
    updateProfile("_all", proposedEdits.updatedProfile);
    updateProjects(proposedEdits.updatedProjects);
    updatePapers(proposedEdits.updatedPapers);
    setProposedEdits(null);
    toast.success("AI edits applied locally! Click 'Publish Live' at the top of the page to save.");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (botMode === "editor") {
        handleSendAIRequest();
      } else {
        handleSendMessage();
      }
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 flex items-center gap-2.5 z-50 print:hidden">
          <div className="bg-card/95 backdrop-blur-md border border-primary/20 py-1.5 px-3 rounded-xl shadow-lg text-[10px] md:text-xs font-semibold text-foreground animate-bounce hidden sm:block pointer-events-none select-none max-w-[180px] truncate">
            Ask my AI Assistant! 💬
          </div>
          <Button
            onClick={() => setIsOpen(true)}
            className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-gradient-primary hover:opacity-95 text-white shadow-xl hover:shadow-glow transition-all animate-fade-in relative flex items-center justify-center"
          >
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-background animate-pulse" />
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-[calc(100vw-2rem)] max-w-[380px] md:w-96 h-[500px] md:h-[32rem] bg-card/95 backdrop-blur-lg border-border shadow-2xl z-50 flex flex-col animate-slide-in print:hidden">
          <CardHeader className="border-b border-border flex-shrink-0 p-3 md:p-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm md:text-base font-semibold">{profile.name || "Dalton"}'s Assistant</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online & Ready
                  </span>
                </div>
              </div>
              <div className="flex gap-0.5 md:gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleSpeech}
                  className={`h-7 w-7 md:h-8 md:w-8 p-0 ${isSpeaking ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'text-muted-foreground'}`}
                  title={isSpeaking ? "Mute Speech" : "Enable Text-to-Speech"}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="h-7 w-7 md:h-8 md:w-8 p-0 text-muted-foreground"
                >
                  <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0 flex-1 flex flex-col min-h-0 bg-card">
            {/* Tab bar if isEditMode is true */}
            {isEditMode && (
              <div className="flex border-b border-border/50 bg-muted/30 p-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => { setBotMode("chat"); setProposedEdits(null); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-xs font-medium rounded-md transition-all ${botMode === "chat" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Bot className="w-3.5 h-3.5" /> Test Chatbot
                </button>
                <button
                  type="button"
                  onClick={() => { setBotMode("editor"); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-xs font-medium rounded-md transition-all ${botMode === "editor" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Co-pilot
                </button>
              </div>
            )}

            {botMode === "editor" ? (
              /* AI Editor Panel */
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs leading-relaxed text-muted-foreground space-y-2">
                    <div className="font-semibold text-foreground flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                      AI Co-pilot Editor
                    </div>
                    <p>
                      Tell me what changes you'd like to make to your portfolio (e.g. <em>"Change my theme to rose"</em>, <em>"Add a project about satellite systems"</em>, or <em>"Rewrite my bio to focus on physics"</em>) and I will update your sections instantly!
                    </p>
                  </div>

                  {isAiLoading && (
                    <div className="flex flex-col items-center justify-center py-8 gap-3 text-muted-foreground">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-mono">Formulating portfolio updates...</p>
                    </div>
                  )}

                  {proposedEdits && (
                    <div className="bg-card border border-border/80 rounded-xl p-3.5 shadow-sm space-y-3.5 animate-fade-in">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-green-500">
                        <CheckCircle2 className="w-4 h-4" /> Proposed Changes
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">{proposedEdits.explanation}</p>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={applyProposedEdits}
                          className="flex-1 h-8 bg-green-600 hover:bg-green-700 text-white text-xs gap-1.5 shadow-md shadow-green-500/10 rounded-lg"
                        >
                          Apply Updates
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setProposedEdits(null)}
                          className="h-8 text-xs border-border/60 hover:bg-muted rounded-lg"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="border-t border-border p-2.5 md:p-3 flex-shrink-0 bg-background/50">
                  <div className="flex gap-1.5 md:gap-2">
                    <Input
                      placeholder="Instruct AI Co-pilot..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 h-8 md:h-9 text-xs md:text-sm bg-muted/30 border-border/70 focus-visible:ring-primary rounded-full px-4"
                      disabled={isAiLoading}
                    />
                    <Button
                      onClick={handleSendAIRequest}
                      className="h-8 w-8 md:h-9 md:w-9 p-0 bg-gradient-primary hover:opacity-90 text-white rounded-full shadow-sm"
                      disabled={!inputValue.trim() || isAiLoading}
                    >
                      <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Visitor Chat Panel (default) */
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-1.5 md:gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.sender === 'bot' && (
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                          <Bot className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                        </div>
                      )}
                      
                      {(() => {
                        const isForm = message.text.includes("[LEAD_CAPTURE_FORM]");
                        const cleanText = message.text.replace("[LEAD_CAPTURE_FORM]", "").trim();
                        return (
                          <div
                            className={`max-w-[80%] px-2.5 py-1.5 md:px-3 md:py-2 rounded-2xl ${
                              message.sender === 'user'
                                ? 'bg-gradient-primary text-white shadow-sm'
                                : 'bg-muted border border-border/50 text-foreground'
                            }`}
                          >
                            <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{cleanText}</p>
                            
                            {isForm && (
                              <div className="mt-3">
                                <RecruiterForm onSubmitSuccess={(confirmMsg) => {
                                  const botResponse: Message = {
                                    id: Date.now().toString(),
                                    text: confirmMsg,
                                    sender: 'bot',
                                    timestamp: new Date()
                                  };
                                  setMessages(prev => [...prev, botResponse]);
                                }} />
                              </div>
                            )}

                            <span className="text-[10px] md:text-xs opacity-70 mt-0.5 md:mt-1 block">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        );
                      })()}
                      
                      {message.sender === 'user' && (
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-accent flex items-center justify-center flex-shrink-0">
                          <User className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-1.5 md:gap-2 justify-start items-center">
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                      </div>
                      <div className="bg-muted px-3 py-2 rounded-2xl max-w-[80%] flex items-center gap-1 border border-border/50">
                        <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-border p-2.5 md:p-3 flex-shrink-0 bg-background/50">
                  <div className="flex gap-1.5 md:gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleRecording}
                      className={`h-8 w-8 md:h-9 md:w-9 p-0 rounded-full ${isRecording ? 'bg-destructive/20 text-destructive border border-destructive/30 animate-pulse' : 'text-muted-foreground hover:bg-muted'}`}
                      title={isRecording ? "Stop Recording" : "Voice Input"}
                    >
                      {isRecording ? <MicOff className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Mic className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                    </Button>
                    
                    <Input
                      placeholder="Ask me anything..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 h-8 md:h-9 text-xs md:text-sm bg-muted/30 border-border/70 focus-visible:ring-primary rounded-full px-4"
                      disabled={isLoading}
                    />
                    
                    <Button
                      onClick={handleSendMessage}
                      className="h-8 w-8 md:h-9 md:w-9 p-0 bg-gradient-primary hover:opacity-90 text-white rounded-full shadow-sm"
                      disabled={!inputValue.trim() || isLoading}
                    >
                      <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default FloatingChatbot;
