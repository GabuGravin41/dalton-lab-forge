import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Mic, MicOff, Volume2, VolumeX, Bot, User, X, MessageCircle } from "lucide-react";

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
      text: "Hello! I'm Dalton's AI assistant. I can answer questions about his work, projects, and expertise. How can I help you?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const generateBotResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('project') || lowerInput.includes('work')) {
      return "Dalton has worked on fascinating projects spanning machine learning, PCB design, chip design, and IoT systems. You can explore his complete portfolio in the Projects section above!";
    }
    if (lowerInput.includes('skill') || lowerInput.includes('expertise')) {
      return "Dalton specializes in Machine Learning & AI, Hardware Engineering & PCB Design, VLSI & Chip Design, and IoT & Embedded Systems. He combines software intelligence with hardware innovation.";
    }
    if (lowerInput.includes('contact') || lowerInput.includes('hire')) {
      return "You can reach Dalton through the Contact section above. He's available for freelance work, research collaborations, and internship opportunities!";
    }
    if (lowerInput.includes('research')) {
      return "Dalton is passionate about research at the intersection of AI and hardware. Check out his Research section to see his publications and current research interests.";
    }
    
    return "That's a great question! Dalton works at the intersection of AI and hardware engineering. Feel free to explore the different sections of his portfolio, or ask me anything specific about his work!";
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement actual speech-to-text
  };

  const toggleSpeech = () => {
    setIsSpeaking(!isSpeaking);
    // TODO: Implement actual text-to-speech
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
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-primary hover:opacity-90 text-white shadow-lg hover:shadow-glow transition-all z-50"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[32rem] bg-card/95 backdrop-blur-lg border-border shadow-2xl z-50 flex flex-col">
          <CardHeader className="border-b border-border flex-shrink-0">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="text-base">AI Assistant</span>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleSpeech}
                  className={`h-8 w-8 p-0 ${isSpeaking ? 'bg-primary/20' : ''}`}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'bot' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-gradient-primary text-white'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  {message.sender === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-accent flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-3 flex-shrink-0">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleRecording}
                  className={`h-9 w-9 p-0 ${isRecording ? 'bg-destructive/20 border-destructive' : ''}`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                
                <Input
                  placeholder="Ask me anything..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 h-9 text-sm"
                />
                
                <Button
                  onClick={handleSendMessage}
                  className="h-9 w-9 p-0 bg-gradient-primary hover:opacity-90 text-white"
                  disabled={!inputValue.trim()}
                >
                  <Send className="w-4 h-4" />
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
