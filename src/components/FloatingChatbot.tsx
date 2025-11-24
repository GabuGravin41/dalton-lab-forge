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
      text: "Hey! 👋 I'm here to tell you about Dalton. Ask me anything - his projects, skills, experience, or how to reach him!",
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
    
    // Projects
    if (lowerInput.includes('project') || lowerInput.includes('work') || lowerInput.includes('built')) {
      return "Dalton builds at the intersection of AI and hardware! He's done ML models, PCB designs, chip architecture, and IoT systems. Check the Projects section for the full showcase! 🚀";
    }
    
    // Skills
    if (lowerInput.includes('skill') || lowerInput.includes('expertise') || lowerInput.includes('good at') || lowerInput.includes('know')) {
      return "He's got the full stack: Machine Learning (neural nets, computer vision), Hardware (PCB design, embedded systems), Chip Design (VLSI, digital circuits), and IoT. Software meets hardware! ⚡";
    }
    
    // Contact/Hire
    if (lowerInput.includes('contact') || lowerInput.includes('hire') || lowerInput.includes('reach') || lowerInput.includes('email')) {
      return "Hit up the Contact section! Dalton's open to freelance gigs, research collabs, and opportunities. He's ready to build cool stuff! 📬";
    }
    
    // Research
    if (lowerInput.includes('research') || lowerInput.includes('paper') || lowerInput.includes('academic')) {
      return "Dalton's deep into AI-hardware fusion research. Neuromorphic computing, efficient neural architectures, you name it. Peep the Research section! 🔬";
    }
    
    // Background/About
    if (lowerInput.includes('who') || lowerInput.includes('about') || lowerInput.includes('background') || lowerInput.includes('bio')) {
      return "Dalton's an ML engineer and hardware designer who refuses to pick a lane! He trains neural networks AND designs the chips that run them. Based in Kenya, building the future. 🌍";
    }
    
    // Education
    if (lowerInput.includes('school') || lowerInput.includes('education') || lowerInput.includes('study') || lowerInput.includes('university')) {
      return "Engineering student with a passion for AI and hardware. Self-taught in tons of areas - he learns by building! 📚";
    }
    
    // Tools/Tech
    if (lowerInput.includes('tool') || lowerInput.includes('tech') || lowerInput.includes('language') || lowerInput.includes('framework')) {
      return "Python for ML, C/C++ for embedded, Verilog for chips, KiCAD for PCBs. TensorFlow, PyTorch, ONNX - the whole AI toolkit! 🛠️";
    }
    
    // Default - friendly and open
    return "Good question! Dalton's all about AI + hardware. Want to know about his projects, skills, background, or how to connect? Just ask! 💬";
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
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 h-12 w-12 md:h-14 md:w-14 rounded-full bg-gradient-primary hover:opacity-90 text-white shadow-lg hover:shadow-glow transition-all z-50"
        >
          <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-[calc(100vw-2rem)] max-w-[380px] md:w-96 h-[500px] md:h-[32rem] bg-card/95 backdrop-blur-lg border-border shadow-2xl z-50 flex flex-col">
          <CardHeader className="border-b border-border flex-shrink-0 p-3 md:p-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                </div>
                <span className="text-sm md:text-base">AI Assistant</span>
              </div>
              <div className="flex gap-0.5 md:gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleSpeech}
                  className={`h-7 w-7 md:h-8 md:w-8 p-0 ${isSpeaking ? 'bg-primary/20' : ''}`}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="h-7 w-7 md:h-8 md:w-8 p-0"
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
                        ? 'bg-gradient-primary text-white'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-xs md:text-sm leading-relaxed">{message.text}</p>
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
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-2.5 md:p-3 flex-shrink-0">
              <div className="flex gap-1.5 md:gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleRecording}
                  className={`h-8 w-8 md:h-9 md:w-9 p-0 ${isRecording ? 'bg-destructive/20 border-destructive' : ''}`}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Mic className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                </Button>
                
                <Input
                  placeholder="Ask me anything..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 h-8 md:h-9 text-xs md:text-sm"
                />
                
                <Button
                  onClick={handleSendMessage}
                  className="h-8 w-8 md:h-9 md:w-9 p-0 bg-gradient-primary hover:opacity-90 text-white"
                  disabled={!inputValue.trim()}
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
