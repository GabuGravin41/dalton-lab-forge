import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Mic, MicOff, Volume2, VolumeX, Bot, User, X, MessageCircle } from "lucide-react";

import profileData from "@/data/profile.json";
import projectsData from "@/data/projects.json";
import papersData from "@/data/papers.json";
import { generateAIResponse } from "@/utils/aiClient";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hey! 👋 I'm Dalton's AI Assistant. Ask me anything about his projects, skills, research, or experience!`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
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
You are Dalton Omondi's Portfolio Virtual Assistant, a friendly and highly capable AI.
Your purpose is to answer visitor questions about Dalton Omondi's work, experience, background, research papers, projects, and skills.
Use the following structured JSON data representing Dalton's background as your ground truth source of information:

--- PROFILE DATA ---
${JSON.stringify(profileData, null, 2)}

--- PROJECTS DATA ---
${JSON.stringify(projectsData, null, 2)}

--- RESEARCH PAPERS DATA ---
${JSON.stringify(papersData, null, 2)}

--- BEHAVIOR GUIDELINES ---
1. Speak in first-person (plural) or third-person on behalf of Dalton, or as his virtual assistant. A warm, professional, and slightly enthusiastic builder tone (using occasional tech emojis) is preferred.
2. Be honest and accurate. If the answer to a question cannot be inferred from the provided profile data, politely state that you don't have that information but invite them to reach out to Dalton directly at: ${profileData.socials.email}
3. Keep responses concise and readable (typically 2-4 sentences or bullet points) suitable for a small chat widget.
4. Highlight Dalton's expertise in Machine Learning, Hardware systems, Chip design, and IoT, pointing to specific projects or papers from the data where relevant.
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
        text: "I apologize, but I ran into an issue connecting to my brain. Please try again or feel free to check Dalton's sections directly! 🛠️",
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 h-12 w-12 md:h-14 md:w-14 rounded-full bg-gradient-primary hover:opacity-90 text-white shadow-lg hover:shadow-glow transition-all z-50 animate-fade-in"
        >
          <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-[calc(100vw-2rem)] max-w-[380px] md:w-96 h-[500px] md:h-[32rem] bg-card/95 backdrop-blur-lg border-border shadow-2xl z-50 flex flex-col animate-slide-in">
          <CardHeader className="border-b border-border flex-shrink-0 p-3 md:p-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm md:text-base font-semibold">Dalton's Assistant</span>
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
          
          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
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
                  
                  <div
                    className={`max-w-[80%] px-2.5 py-1.5 md:px-3 md:py-2 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-gradient-primary text-white shadow-sm'
                        : 'bg-muted border border-border/50 text-foreground'
                    }`}
                  >
                    <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                    <span className="text-[10px] md:text-xs opacity-70 mt-0.5 md:mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
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
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default FloatingChatbot;
