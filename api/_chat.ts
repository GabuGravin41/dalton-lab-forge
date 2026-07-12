import { GoogleGenerativeAI } from '@google/generative-ai';

const FALLBACK_KEYS = [
  "c2stb3ItdjEtMDI4ODFjY2Q3YzU4MTZlN2Q0ZmY3MDU2YzA5Mzc4YWFhZTBjNTkzOGMzOWJlNDgzOWUyNmU2YjAwM2VlMzNlNQ==",
  "c2stb3ItdjEtZjE0MTI4M2E4ZDJhNzA4NzJjNTMyZGFlN2ViYTlkZDhiOTNlNDcwM2I3MTVlN2VlMzFjYWUyYTU4NGExNDdkOTY="
];

function getFallbackOpenRouterKey() {
  try {
    return Buffer.from(FALLBACK_KEYS[0], 'base64').toString('utf8');
  } catch (e) {
    return '';
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userPrompt, systemPrompt, jsonMode } = req.body;
  if (!userPrompt) {
    return res.status(400).json({ error: 'userPrompt is required' });
  }

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const openrouterModel = process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash";
  const geminiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  try {
    let responseText = "";

    // 1. Attempt OpenRouter if key is present
    if (openrouterKey) {
      console.log(`[Chat API] Using OpenRouter key with model ${openrouterModel}`);
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openrouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://dalton-omondi.vercel.app",
          "X-Title": "LabForge Portfolio Chatbot"
        },
        body: JSON.stringify({
          model: openrouterModel,
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            { role: "user", content: userPrompt }
          ],
          temperature: 0.3,
          response_format: jsonMode ? { type: "json_object" } : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        responseText = data.choices?.[0]?.message?.content?.trim() || "";
      } else {
        const errDetails = await response.json().catch(() => ({}));
        throw new Error(errDetails.error?.message || `OpenRouter returned status ${response.status}`);
      }
    } 
    // 2. Attempt Google Gemini SDK direct if key is present
    else if (geminiKey) {
      console.log(`[Chat API] Using Google Gemini SDK`);
      const genAI = new GoogleGenerativeAI(geminiKey);
      const modelName = 'gemini-2.0-flash';
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.2,
          responseMimeType: jsonMode ? "application/json" : "text/plain",
        }
      });

      const contents = [];
      if (systemPrompt) {
        contents.push({ role: 'user', parts: [{ text: `System Instructions:\n${systemPrompt}` }] });
      }
      contents.push({ role: 'user', parts: [{ text: userPrompt }] });

      const result = await model.generateContent({ contents });
      responseText = result.response.text().trim();
    }
    // 3. Fallback to Dalton's shared keys if nothing else is configured
    else {
      console.log(`[Chat API] Falling back to default shared keys`);
      const fallbackKey = getFallbackOpenRouterKey();
      if (!fallbackKey) {
        throw new Error("No AI API keys are configured on the backend.");
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${fallbackKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://dalton-omondi.vercel.app",
          "X-Title": "LabForge Portfolio Chatbot"
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash",
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            { role: "user", content: userPrompt }
          ],
          temperature: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        responseText = data.choices?.[0]?.message?.content?.trim() || "";
      } else {
        const errDetails = await response.json().catch(() => ({}));
        throw new Error(errDetails.error?.message || `Fallback OpenRouter status ${response.status}`);
      }
    }

    return res.status(200).json({ text: responseText });
  } catch (error: any) {
    console.error('Chat API handler error:', error);
    // User-friendly cleaner message for clients
    const cleanMessage = error.message?.toLowerCase().includes("quota") || error.message?.toLowerCase().includes("credits")
      ? "AI provider quota exceeded. Please check your billing settings or API key limits."
      : "I apologize, but I ran into an issue connecting to my brain. Please try again or check the sections directly! 🛠️";
      
    return res.status(500).json({ error: cleanMessage, raw: error.message });
  }
}
