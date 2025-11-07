import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, ImageIcon, MessageSquare, Wand2, Loader2, ArrowLeft, Video, Network } from "lucide-react";
import { Link } from "react-router-dom";
import { useGeminiChat, useSentimentAnalysis } from '@/hooks/useGemini';
import Navigation from "@/components/Navigation";
import NeuralNetworkVisualizer from "@/components/NeuralNetworkVisualizer";

const Playground = () => {
  const [textInput, setTextInput] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [chatPrompt, setChatPrompt] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
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

  const handleVideoGeneration = async () => {
    setIsLoading(true);
    setTimeout(() => {
      const duration = videoPrompt.toLowerCase().includes('long') ? '30-60' :
                      videoPrompt.toLowerCase().includes('short') ? '5-10' : '15-30';
      const hasMotion = videoPrompt.toLowerCase().includes('moving') || videoPrompt.toLowerCase().includes('walking') || videoPrompt.toLowerCase().includes('running');
      
      setResults(prev => ({
        ...prev,
        video: `🎬 Video generation request processed!\n\n📝 Your prompt: "${videoPrompt}"\n⏱️ Estimated duration: ${duration} seconds\n🎭 Scene complexity: ${hasMotion ? 'High (includes motion)' : 'Medium (static scene)'}\n🎨 Rendering quality: 1080p HD\n\n✨ Ready to integrate with Google Veo for cutting-edge AI video generation. Veo can create realistic, high-quality videos from text descriptions with smooth motion and coherent scenes.`
      }));
      setIsLoading(false);
    }, 2500);
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
      
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link to="/">
            <Button variant="ghost" className="mb-8 group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Portfolio
            </Button>
          </Link>

          {/* Section Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              AI <span className="bg-gradient-to-r from-[hsl(245,58%,51%)] to-[hsl(260,60%,45%)] bg-clip-text text-transparent">Playground</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
              Experience interactive AI capabilities firsthand. Test sentiment analysis, 
              image generation, and language models in real-time.
            </p>
            <Button
              onClick={handleTestAPI}
              variant="outline"
              className="bg-card/50 hover:bg-card/80 border-primary/20 hover:border-primary/40"
            >
              🔧 Test Gemini API Connection
            </Button>
          </div>

          {/* AI Tools Tabs */}
          <Tabs defaultValue="text" className="space-y-8">
            <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-sm border border-border">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Sentiment Analysis
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Image Gen
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Video Gen
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Chatbot
              </TabsTrigger>
              <TabsTrigger value="neural" className="flex items-center gap-2">
                <Network className="w-4 h-4" />
                NN Visualizer
              </TabsTrigger>
            </TabsList>

            {/* Text Analysis Tab */}
            <TabsContent value="text">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      Sentiment Analysis
                    </CardTitle>
                    <CardDescription>
                      Analyze the emotional tone and sentiment of any text using advanced NLP models.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Enter text to analyze sentiment..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="min-h-32 bg-background/50"
                    />
                    <Button
                      onClick={handleTextAnalysis}
                      disabled={!textInput.trim() || sentimentMutation.isPending}
                      className="w-full bg-gradient-primary hover:opacity-90 text-white"
                    >
                      {sentimentMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                      Analyze Sentiment
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle>Analysis Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {results.sentiment ? (
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-sm">{results.sentiment}</p>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
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
                      Generate Image
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

            {/* Video Generation Tab */}
            <TabsContent value="video">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-accent" />
                      AI Video Generation (Veo)
                    </CardTitle>
                    <CardDescription>
                      Generate videos from text descriptions using Google's Veo model.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Describe the video you want to generate..."
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      className="min-h-32 bg-background/50"
                    />
                    <Button
                      onClick={handleVideoGeneration}
                      disabled={!videoPrompt.trim() || isLoading}
                      className="w-full bg-gradient-accent hover:opacity-90 text-accent-foreground"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Video className="w-4 h-4 mr-2" />}
                      Generate Video
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle>Generated Video</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {results.video ? (
                      <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                        <p className="text-sm">{results.video}</p>
                        <div className="mt-4 aspect-video bg-gradient-accent/10 rounded-lg flex items-center justify-center">
                          <span className="text-muted-foreground">Generated video would appear here</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        Generate a video to see results here
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
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
