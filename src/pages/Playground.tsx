import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, ImageIcon, MessageSquare, Wand2, Loader2, ArrowLeft, Video } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

const Playground = () => {
  const [textInput, setTextInput] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [chatPrompt, setChatPrompt] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{[key: string]: string}>({});

  const handleTextAnalysis = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setResults(prev => ({
        ...prev,
        sentiment: "This text has a positive sentiment with 87% confidence. Key emotions detected: optimistic, enthusiastic."
      }));
      setIsLoading(false);
    }, 2000);
  };

  const handleImageGeneration = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setResults(prev => ({
        ...prev,
        image: "Image generation would happen here. Your prompt: '" + imagePrompt + "' has been processed."
      }));
      setIsLoading(false);
    }, 3000);
  };

  const handleChatCompletion = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setResults(prev => ({
        ...prev,
        chat: "Here's an AI-generated response to your prompt. This demonstrates natural language understanding and generation capabilities."
      }));
      setIsLoading(false);
    }, 1500);
  };

  const handleVideoGeneration = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setResults(prev => ({
        ...prev,
        video: "Video generation using Veo would happen here. Your prompt: '" + videoPrompt + "' has been processed."
      }));
      setIsLoading(false);
    }, 4000);
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
              AI <span className="bg-gradient-primary bg-clip-text text-transparent">Playground</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience interactive AI capabilities firsthand. Test sentiment analysis, 
              image generation, and language models in real-time.
            </p>
          </div>

          {/* AI Tools Tabs */}
          <Tabs defaultValue="text" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm border border-border">
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
                      disabled={!textInput.trim() || isLoading}
                      className="w-full bg-gradient-primary hover:opacity-90 text-white"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
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
                      disabled={!chatPrompt.trim() || isLoading}
                      className="w-full bg-gradient-primary hover:opacity-90 text-white"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
                      Generate Response
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle>AI Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {results.chat ? (
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-sm">{results.chat}</p>
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
          </Tabs>

          {/* Integration Notice */}
          <div className="mt-16 text-center">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Ready for Integration</h3>
              <p className="text-muted-foreground">
                This playground demonstrates the UI for AI capabilities. 
                Ready to integrate with Google Gemini API for sentiment analysis, chatbot, image generation (Imagen), and video generation (Veo).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Playground;
