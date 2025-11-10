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
