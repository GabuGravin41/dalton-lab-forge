import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerationConfig, ChatSession } from "@google/generative-ai";
import profileData from "../data/profile.json";
import projectsData from "../data/projects.json";
import papersData from "../data/papers.json";

// 1. Get API Key from environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  const errorMsg = "VITE_GEMINI_API_KEY is not defined in environment variables. " +
                  "Please check your .env file and make sure it's properly configured.";
  console.error(errorMsg);
  if (import.meta.env.DEV) {
    throw new Error(errorMsg);
  }
}

// 2. Initialize the GoogleGenerativeAI instance
const genAI = new GoogleGenerativeAI(apiKey);

// 3. Define safety settings for content generation
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Helper to generate dynamic system prompt representing Dalton Omondi
const getSystemPrompt = (): string => {
  return `You're a friendly AI assistant helping people learn about ${profileData.name}.
Be brief, conversational, and to-the-point. Keep responses under 3 sentences unless they ask for details. Use a casual, engaging tone.
If they ask about specific projects, publications, or credentials, answer accurately using the data below.

Here is Dalton's current professional profile:
- Name: ${profileData.name}
- Roles: ${profileData.roles.join(", ")}
- Bio: ${profileData.bio}
- Approach: ${profileData.about.approach}
- Seeking: ${profileData.about.lookingFor}

Core Skills & Expertise:
${profileData.skills.map(s => `- ${s.title}: ${s.description}`).join("\n")}

Professional Experience:
${profileData.experience.map(e => `- ${e.role} at ${e.company} (${e.period}): ${e.description}`).join("\n")}

Featured Projects:
${projectsData.map(p => `- ${p.title} (${p.category}): ${p.description}`).join("\n")}

Research Publications:
${papersData.map(paper => `- ${paper.title} (${paper.year}, Status: ${paper.status}): ${paper.abstract}`).join("\n")}

Certifications & Achievements:
${profileData.certifications.map(c => `- ${c}`).join("\n")}

Answer questions from visitors based on this information. If you don't know something, just say so.`;
};

// 5. Configuration for the generative model
const generationConfig: GenerationConfig = {
  temperature: 0.7,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

// --- Exportable Models & Functions ---

/**
 * The primary generative model instance (e.g., gemini-2.0-flash).
 */
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  safetySettings,
  generationConfig,
  systemInstruction: getSystemPrompt(),
});

/**
 * Creates a new chat session with conversation history.
 */
export const getChatSession = (): ChatSession => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    safetySettings,
    generationConfig,
    systemInstruction: getSystemPrompt(),
  });

  return model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: `You are a friendly AI assistant helping people learn about Dalton Omondi.` }],
      },
      {
        role: "model",
        parts: [{ text: `Got it! I will answer questions about Dalton Omondi, his machine learning projects, PCB designs, publications, and credentials in a brief, conversational manner. How can I help you today? 👍` }],
      },
    ],
  });
};

/**
 * A helper function for one-off sentiment analysis.
 */
export const analyzeSentiment = async (textToAnalyze: string) => {
  const prompt = `
    Analyze the sentiment of the following text. Provide your analysis in a JSON object format.
    The JSON object should have three keys:
    1. "emotion": A single dominant emotion (e.g., "Positive", "Negative", "Neutral", "Joy", "Anger", "Surprise").
    2. "confidence": A number between 0 and 1 representing your confidence in the emotion analysis.
    3. "feedback": A brief, constructive feedback or summary of the text's tone (20 words or less).

    Text to analyze: "${textToAnalyze}"

    Example JSON response:
    {
      "emotion": "Positive",
      "confidence": 0.9,
      "feedback": "The user seems very pleased and excited."
    }
  `;

  const generationConfigWithJson = {
    ...generationConfig,
    responseMimeType: "application/json",
  };

  const modelWithJson = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    safetySettings,
    generationConfig: generationConfigWithJson,
  });

  const result = await modelWithJson.generateContent(prompt);
  const response = result.response;
  const jsonText = response.text();

  return JSON.parse(jsonText);
};

// --- Type Definitions ---

export interface SentimentAnalysisResult {
  emotion: string;
  confidence: number;
  feedback: string;
}

export interface ChatMessage {
  role: "user" | "model";
  parts: [{ text: string }];
}
