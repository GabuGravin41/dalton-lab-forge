import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, ImageIcon, MessageSquare, Wand2, Loader2, ArrowLeft, Camera, Network } from "lucide-react";
import { Link } from "react-router-dom";
import { useGeminiChat, useSentimentAnalysis } from '@/hooks/useGemini';
import Navigation from "@/components/Navigation";
import NeuralNetworkVisualizer from "@/components/NeuralNetworkVisualizer";
import ObjectDetection from "@/components/ObjectDetection";

const Playground = () => {
  const [textInput, setTextInput] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [chatPrompt, setChatPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'model', text: string}>>([]);
  const [results, setResults] = useState<{[key: string]: string}>({});

  const chatSessionRef = useRef<any>(null);
  const sentimentMutation = useSentimentAnalysis();
  const chatMutation = useGeminiChat();

  // Initialize chat session on mount
  useEffect(() => {
    const initChat = async () => {
      const { getChatSession } = await import('@/utils/gemini');
      chatSessionRef.current = getChatSession();
    };
    initChat();
  }, []);


  const handleTextAnalysis = async () => {
    if (!textInput.trim()) return;
    try {
      const data = await sentimentMutation.mutateAsync(textInput);
      setResults(prev => ({
        ...prev,
        sentiment: `Emotion: ${data.emotion}\nConfidence: ${(data.confidence * 100).toFixed(0)}%\nFeedback: ${data.feedback}\nWord count: ${textInput.split(' ').length} words.`
      }));
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      setResults(prev => ({
        ...prev,
        sentiment: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      }));
    }
  };

  const handleImageGeneration = async () => {
    setIsLoading(true);
    setTimeout(() => {
      const words = imagePrompt.split(' ').length;
      const style = imagePrompt.toLowerCase().includes('realistic') ? 'photorealistic' :
                    imagePrompt.toLowerCase().includes('cartoon') ? 'cartoon' :
                    imagePrompt.toLowerCase().includes('painting') ? 'artistic painting' :
                    'digital art';
      setResults(prev => ({
        ...prev,
        image: `✨ Image generation processed successfully!\n\n📝 Your prompt: "${imagePrompt}"\n🎨 Detected style: ${style}\n📊 Complexity: ${words > 10 ? 'High' : words > 5 ? 'Medium' : 'Low'}\n⏱️ Estimated generation time: ${words * 0.5}s\n\n🚀 Ready to integrate with Google Imagen API for actual image generation.`
      }));
      setIsLoading(false);
    }, 2000);
  };

  const handleChatCompletion = async () => {
    if (!chatPrompt.trim() || !chatSessionRef.current) return;
    const userMessage = { role: 'user' as const, text: chatPrompt };
    setChatHistory(prev => [...prev, userMessage]);
    setChatPrompt('');
    try {
      const response = await chatMutation.mutateAsync({ prompt: userMessage.text, chatSession: chatSessionRef.current });
      const modelMessage = { role: 'model' as const, text: response };
      setChatHistory(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { role: 'model' as const, text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.` };
      setChatHistory(prev => [...prev, errorMessage]);
    }
  };


  const handleTestAPI = async () => {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error("API key not found in environment variables");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const testModel = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      const result = await testModel.generateContent("Hello, just testing the API. Please respond with 'API test successful'");
      const response = result.response;
      const text = response.text();

      console.log("✅ Gemini API test successful:", text);
      alert("✅ Gemini API test successful! " + text);

    } catch (error) {
      console.error("❌ Gemini API test failed:", error);
      alert("❌ Gemini API test failed: " + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link to="/">
            <Button variant="ghost" className="mb-6 md:mb-8 group text-sm md:text-base">
              <ArrowLeft className="w-3 md:w-4 h-3 md:h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Portfolio
            </Button>
          </Link>

          {/* Section Header */}
          <div className="text-center mb-10 md:mb-12 lg:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 md:mb-6">
              AI <span className="bg-gradient-to-r from-[hsl(245,58%,51%)] to-[hsl(260,60%,45%)] bg-clip-text text-transparent">Playground</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience interactive AI capabilities firsthand. Test sentiment analysis, 
              image generation, and language models in real-time.
            </p>
          </div>

          {/* AI Tools Tabs */}
          <Tabs defaultValue="text" className="space-y-6 md:space-y-8">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 bg-card/50 backdrop-blur-sm border border-border p-2 h-auto">
              <TabsTrigger value="text" className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm py-2 md:py-2.5">
                <MessageSquare className="w-3 md:w-4 h-3 md:h-4" />
                <span className="hidden sm:inline">Sentiment</span>
                <span className="sm:hidden">Sentiment</span>
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm py-2 md:py-2.5">
                <ImageIcon className="w-3 md:w-4 h-3 md:h-4" />
                <span className="hidden sm:inline">Image Gen</span>
                <span className="sm:hidden">Image</span>
              </TabsTrigger>
              <TabsTrigger value="detection" className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm py-2 md:py-2.5">
                <Camera className="w-3 md:w-4 h-3 md:h-4" />
                <span className="hidden sm:inline">Detection</span>
                <span className="sm:hidden">Detect</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm py-2 md:py-2.5">
                <Brain className="w-3 md:w-4 h-3 md:h-4" />
                <span>Chatbot</span>
              </TabsTrigger>
              <TabsTrigger value="neural" className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm py-2 md:py-2.5 col-span-2 sm:col-span-1">
                <Network className="w-3 md:w-4 h-3 md:h-4" />
                <span className="hidden sm:inline">NN Visualizer</span>
                <span className="sm:hidden">Neural Net</span>
              </TabsTrigger>
            </TabsList>

            {/* Text Analysis Tab */}
            <TabsContent value="text">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 lg:gap-8">
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                      <MessageSquare className="w-4 md:w-5 h-4 md:h-5 text-primary" />
                      Sentiment Analysis
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      Analyze the emotional tone and sentiment of any text using advanced NLP models.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
                    <Textarea
                      placeholder="Enter text to analyze sentiment..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="min-h-28 md:min-h-32 bg-background/50 text-sm md:text-base"
                    />
                    <Button
                      onClick={handleTextAnalysis}
                      disabled={!textInput.trim() || sentimentMutation.isPending}
                      className="w-full bg-gradient-primary hover:opacity-90 text-white text-sm md:text-base h-9 md:h-10"
                    >
                      {sentimentMutation.isPending ? <Loader2 className="w-3 md:w-4 h-3 md:h-4 mr-2 animate-spin" /> : <Wand2 className="w-3 md:w-4 h-3 md:h-4 mr-2" />}
                      Analyze Sentiment
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-lg md:text-xl">Analysis Result</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0">
                    {results.sentiment ? (
                      <div className="p-3 md:p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-xs md:text-sm whitespace-pre-wrap">{results.sentiment}</p>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-6 md:py-8 text-sm">
                        Run sentiment analysis to see results here
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Image Generation Tab */}
            <TabsContent value="image">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-primary" />
                      AI Image Generation
                    </CardTitle>
                    <CardDescription>
                      Generate unique images from text descriptions using state-of-the-art diffusion models.
                    </CardDescription>
                    <div className="mt-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <p className="text-sm text-orange-600 font-medium flex items-center gap-2">
                        ⚠️ Dalton has not paid for image gen credits
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        This feature is currently disabled as image generation credits have been used up. The demo shows the processing pipeline though. Have fun!! :)
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Describe the image you want to generate..."
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      className="bg-background/50"
                    />
                    <Button
                      onClick={handleImageGeneration}
                      disabled={!imagePrompt.trim() || isLoading}
                      className="w-full bg-gradient-primary hover:opacity-90 text-white"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                      Demo Processing Pipeline
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle>Generated Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {results.image ? (
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-sm">{results.image}</p>
                        <div className="mt-4 h-48 bg-gradient-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-muted-foreground">Generated image would appear here</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        Generate an image to see results here
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Object Detection Tab */}
            <TabsContent value="detection">
              <ObjectDetection />
            </TabsContent>

            {/* Chatbot Tab */}
            <TabsContent value="chat">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary" />
                      AI Chatbot
                    </CardTitle>
                    <CardDescription>
                      Interact with advanced language models for text completion, Q&A, and creative writing.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Ask a question or start a conversation..."
                      value={chatPrompt}
                      onChange={(e) => setChatPrompt(e.target.value)}
                      className="min-h-32 bg-background/50"
                    />
                    <Button
                      onClick={handleChatCompletion}
                      disabled={!chatPrompt.trim() || chatMutation.isPending}
                      className="w-full bg-gradient-primary hover:opacity-90 text-white"
                    >
                      {chatMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
                      Generate Response
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle>AI Response</CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-96 overflow-y-auto">
                    {chatHistory.length > 0 ? (
                      <div className="space-y-4">
                        {chatHistory.map((msg, index) => (
                          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-lg ${
                              msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        Start a conversation to see AI responses here
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Neural Network Visualizer Tab */}
            <TabsContent value="neural">
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold mb-3">
                    <span className="bg-gradient-to-r from-[hsl(245,58%,51%)] to-[hsl(260,60%,45%)] bg-clip-text text-transparent">Neural Network Visualizer</span>
                  </h2>
                  <p className="text-muted-foreground">
                    Build and visualize custom neural network architectures. Adjust layers, nodes, and watch the learning simulation in real-time.
                  </p>
                </div>
                <NeuralNetworkVisualizer />
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </section>
    </div>
  );
};

export default Playground;
