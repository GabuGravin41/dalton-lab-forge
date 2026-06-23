import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, ImageIcon, MessageSquare, Wand2, Loader2, ArrowLeft, Camera, Network, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { generateAIResponse } from "@/utils/aiClient";
import { analyzeSentimentLocally } from "@/utils/localSentiment";
import Navigation from "@/components/Navigation";
import NeuralNetworkVisualizer from "@/components/NeuralNetworkVisualizer";
import ObjectDetection from "@/components/ObjectDetection";

const Playground = () => {
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem("portfolio_theme") || "indigo");

  const changeTheme = (theme: string) => {
    setActiveTheme(theme);
    localStorage.setItem("portfolio_theme", theme);
    window.dispatchEvent(new CustomEvent("portfolio-theme-change"));
  };

  const [textInput, setTextInput] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [chatPrompt, setChatPrompt] = useState("");
  
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isTestLoading, setIsTestLoading] = useState(false);
  
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'model', text: string}>>([]);
  const [results, setResults] = useState<{[key: string]: string}>({});
  const [sentimentMode, setSentimentMode] = useState<"local" | "cloud">("local");

  const handleTextAnalysis = async () => {
    if (!textInput.trim() || isTextLoading) return;
    setIsTextLoading(true);
    try {
      if (sentimentMode === "local") {
        const result = analyzeSentimentLocally(textInput);
        setResults(prev => ({
          ...prev,
          sentiment: `Emotion: ${result.emotion}\nConfidence: ${(result.confidence * 100).toFixed(0)}%\nFeedback: ${result.feedback}\nScore: ${result.score > 0 ? '+' : ''}${result.score}\nWord count: ${textInput.trim().split(/\s+/).length} words.\n\n[Processed locally in browser cache]`
        }));
      } else {
        const prompt = `
Analyze the sentiment of the following text. Provide your analysis in a JSON object format.
The JSON object should have three keys:
1. "emotion": A single dominant emotion (e.g., "Positive", "Negative", "Neutral", "Joy", "Anger", "Surprise").
2. "confidence": A number between 0 and 1 representing your confidence in the emotion analysis.
3. "feedback": A brief, constructive feedback or summary of the text's tone (20 words or less).

Text to analyze: "${textInput}"
`;
        const systemInstruction = "You are a Sentiment Analysis Assistant. Return ONLY a valid JSON object matching the requested schema. Do not include markdown wraps.";
        const rawResult = await generateAIResponse(prompt, systemInstruction, true);
        
        const cleanJson = rawResult.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
        const data = JSON.parse(cleanJson);
        
        setResults(prev => ({
          ...prev,
          sentiment: `Emotion: ${data.emotion}\nConfidence: ${(data.confidence * 100).toFixed(0)}%\nFeedback: ${data.feedback}\nWord count: ${textInput.trim().split(/\s+/).length} words.\n\n[Processed via OpenRouter Cloud API]`
        }));
      }
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      setResults(prev => ({
        ...prev,
        sentiment: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      }));
    } finally {
      setIsTextLoading(false);
    }
  };

  const handleImageGeneration = async () => {
    setIsImageLoading(true);
    setTimeout(() => {
      const words = imagePrompt.split(' ').length;
      const style = imagePrompt.toLowerCase().includes('realistic') ? 'photorealistic' :
                    imagePrompt.toLowerCase().includes('cartoon') ? 'cartoon' :
                    imagePrompt.toLowerCase().includes('painting') ? 'artistic painting' :
                    'digital art';
      setResults(prev => ({
        ...prev,
        image: `✨ Image generation processed successfully!\n\n📝 Your prompt: "${imagePrompt}"\n🎨 Detected style: ${style}\n📊 Complexity: ${words > 10 ? 'High' : words > 5 ? 'Medium' : 'Low'}\n⏱️ Estimated generation time: ${words * 0.5}s\n\n🚀 Ready to integrate with Google Imagen API or Stable Diffusion via OpenRouter for actual image generation.`
      }));
      setIsImageLoading(false);
    }, 2000);
  };

  const handleChatCompletion = async () => {
    if (!chatPrompt.trim() || isChatLoading) return;
    
    const userMessage = { role: 'user' as const, text: chatPrompt };
    setChatHistory(prev => [...prev, userMessage]);
    const promptText = chatPrompt;
    setChatPrompt('');
    setIsChatLoading(true);

    try {
      // Build conversation history format for the prompt
      const recentHistory = chatHistory
        .slice(-6)
        .map(m => `${m.role === 'user' ? 'User' : 'Model'}: ${m.text}`)
        .join("\n");
      
      const fullPrompt = `${recentHistory}\nUser: ${promptText}\nModel:`;
      const systemInstruction = `You are a helpful AI assistant. Answer the user's questions in a friendly, conversational, and direct manner. Keep responses brief and relevant.`;

      const response = await generateAIResponse(fullPrompt, systemInstruction);
      const modelMessage = { role: 'model' as const, text: response };
      setChatHistory(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { role: 'model' as const, text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your connection and try again.` };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleTestAPI = async () => {
    setIsTestLoading(true);
    try {
      const response = await generateAIResponse("Say 'API connection successful!' in 4 words.");
      alert("✅ AI test successful: " + response);
    } catch (error) {
      console.error("AI test failed:", error);
      alert("❌ AI test failed: " + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Back Button & Test Button */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <Link to="/">
              <Button variant="ghost" className="group text-sm md:text-base">
                <ArrowLeft className="w-3 md:w-4 h-3 md:h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Portfolio
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={handleTestAPI}
              disabled={isTestLoading}
              className="border-primary/20 text-primary hover:bg-primary/5 text-xs md:text-sm"
            >
              {isTestLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
              Test Active AI Config
            </Button>
          </div>

          {/* Section Header */}
          <div className="text-center mb-10 md:mb-12 lg:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 md:mb-6">
              AI <span className="bg-gradient-to-r from-[hsl(245,58%,51%)] to-[hsl(260,60%,45%)] bg-clip-text text-transparent">Playground</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience interactive AI capabilities firsthand. Run real-time edge object detection, 
              test sentiment analysis, and chat with AI using active config settings.
            </p>
          </div>

          {/* AI Tools Tabs */}
          <Tabs defaultValue="text" className="space-y-6 md:space-y-8">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 bg-card/50 backdrop-blur-sm border border-border p-2 h-auto">
              <TabsTrigger value="text" className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm py-2 md:py-2.5">
                <MessageSquare className="w-3 md:w-4 h-3 md:h-4" />
                <span>Sentiment</span>
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm py-2 md:py-2.5">
                <ImageIcon className="w-3 md:w-4 h-3 md:h-4" />
                <span>Image Gen</span>
              </TabsTrigger>
              <TabsTrigger value="detection" className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm py-2 md:py-2.5">
                <Camera className="w-3 md:w-4 h-3 md:h-4" />
                <span>Detection</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm py-2 md:py-2.5">
                <Brain className="w-3 md:w-4 h-3 md:h-4" />
                <span>Chatbot</span>
              </TabsTrigger>
              <TabsTrigger value="neural" className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm py-2 md:py-2.5 col-span-2 sm:col-span-1">
                <Network className="w-3 md:w-4 h-3 md:h-4" />
                <span>NN Visualizer</span>
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
                      Analyze the emotional tone of text input using generative AI structured output models.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
                    <div className="flex justify-end mb-2">
                      <Tabs value={sentimentMode} onValueChange={(val: any) => setSentimentMode(val)} className="w-auto">
                        <TabsList className="bg-muted/50 p-0.5 h-8">
                          <TabsTrigger value="local" className="text-[10px] px-2 py-0.5">Local Model (Free)</TabsTrigger>
                          <TabsTrigger value="cloud" className="text-[10px] px-2 py-0.5">Cloud API (DeepSeek)</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    <Textarea
                      placeholder="Enter text to analyze sentiment..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="min-h-28 md:min-h-32 bg-background/50 text-sm md:text-base"
                    />
                    <Button
                      onClick={handleTextAnalysis}
                      disabled={!textInput.trim() || isTextLoading}
                      className="w-full bg-gradient-primary hover:opacity-90 text-white text-sm md:text-base h-9 md:h-10"
                    >
                      {isTextLoading ? <Loader2 className="w-3 md:w-4 h-3 md:h-4 mr-2 animate-spin" /> : <Wand2 className="w-3 md:w-4 h-3 md:h-4 mr-2" />}
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
                        <Info className="w-4 h-4" />
                        Imagen & Stable Diffusion Sandbox
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Image credits are currently configured to demonstration mode. Play with the prompt details below to see the image pipeline.
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
                      disabled={!imagePrompt.trim() || isImageLoading}
                      className="w-full bg-gradient-primary hover:opacity-90 text-white"
                    >
                      {isImageLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
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
                      AI Sandbox Chatbot
                    </CardTitle>
                    <CardDescription>
                      Chat with the model configured in your Control Center (Gemini or OpenRouter models).
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
                      disabled={!chatPrompt.trim() || isChatLoading}
                      className="w-full bg-gradient-primary hover:opacity-90 text-white"
                    >
                      {isChatLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
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

      {/* Floating Theme Swapper */}
      <div className="fixed bottom-6 right-6 z-50 bg-card/90 backdrop-blur border border-border p-3 rounded-full shadow-2xl flex items-center gap-2 print:hidden">
        <span className="text-[10px] uppercase font-mono px-2 text-muted-foreground font-bold">Theme Preview:</span>
        <div className="flex gap-1.5">
          {[
            { id: "indigo", color: "bg-indigo-600", label: "Indigo" },
            { id: "emerald", color: "bg-emerald-600", label: "Emerald" },
            { id: "rose", color: "bg-rose-600", label: "Rose" },
            { id: "cyberpunk", color: "bg-fuchsia-600", label: "Cyberpunk" },
            { id: "steel", color: "bg-slate-500", label: "Steel" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => changeTheme(t.id)}
              className={`w-6 h-6 rounded-full ${t.color} border transition-all ${
                activeTheme === t.id ? "scale-125 border-white ring-2 ring-primary" : "border-transparent hover:scale-110"
              }`}
              title={t.label}
              aria-label={`Switch to ${t.label} theme`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Playground;
