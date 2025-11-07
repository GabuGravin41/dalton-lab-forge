import { useMutation } from "@tanstack/react-query";
import { ChatSession } from "@google/generative-ai";
import { analyzeSentiment, SentimentAnalysisResult } from "../utils/gemini";

// --- Sentiment Analysis Mutation ---

/**
 * Hook to run sentiment analysis using Gemini.
 */
export const useSentimentAnalysis = () => {
  return useMutation<SentimentAnalysisResult, Error, string>({
    mutationFn: (textToAnalyze: string) => analyzeSentiment(textToAnalyze),
  });
};

// --- Chatbot Mutation ---

interface ChatMutationVariables {
  prompt: string;
  chatSession: ChatSession;
}

/**
 * Hook to handle a single turn in a chat conversation.
 */
export const useGeminiChat = () => {
  return useMutation<string, Error, ChatMutationVariables>({
    mutationFn: async ({ prompt, chatSession }) => {
      const result = await chatSession.sendMessage(prompt);
      const response = result.response;
      return response.text();
    },
  });
};

/**
 * Optional: Hook for generating prompts for other AI models.
 */
export const usePromptGenerator = () => {
  return useMutation<string, Error, string>({
    mutationFn: async (baseIdea: string) => {
      // Placeholder - can be expanded
      return `A photorealistic image of: ${baseIdea}, 4k, ultra-detailed.`;
    }
  });
}
