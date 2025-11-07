const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.VITE_GEMINI_API_KEY || "AIzaSyBhX1C4n_KexBUSeIuvVnW2LuAQ6T4Jp0Y";

(async () => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelId = process.argv[2] || "gemini-pro-latest";
    const model = genAI.getGenerativeModel({ model: modelId });
    const result = await model.generateContent("Say hello in one word");
    console.log(`Model ${modelId} result:`, result.response.text());
  } catch (error) {
    console.error("Error for model", process.argv[2], error);
  }
})();
