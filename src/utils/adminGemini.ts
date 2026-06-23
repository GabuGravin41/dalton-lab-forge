import { generateAIResponse } from "./aiClient";

export interface UpdateAssistantResult {
  updatedProfile: any;
  updatedProjects: any[];
  updatedPapers: any[];
  explanation: string;
}

/**
 * Sends current portfolio data and the update request to the unified AI client, returning structured modifications.
 */
export const getPortfolioUpdatesFromAI = async (
  userMessage: string,
  currentProfile: any,
  currentProjects: any[],
  currentPapers: any[]
): Promise<UpdateAssistantResult> => {
  const systemPrompt = `
You are Dalton Omondi's Portfolio Content Update Assistant.
Your task is to analyze Dalton's current portfolio data and the user's natural language request (which describes changes, new accomplishments, projects, or research papers).
You must determine which parts of the portfolio data need to be added, modified, or deleted, and return the updated structures.

Each project and paper object must include a "priority" field (integer 1 to 5, where 5 is the highest priority).
The profile object must include "theme" (one of: 'indigo', 'emerald', 'rose', 'cyberpunk', 'steel'), "engineeringObjective", and "researchStatement".

Return the updated configurations in a valid JSON object matching this schema:
{
  "updatedProfile": { ... },
  "updatedProjects": [ ... ],
  "updatedPapers": [ ... ],
  "explanation": "A concise, user-friendly summary of the changes made, explaining what was added, edited, or removed."
}

Return ONLY the JSON. Do not include markdown wraps like \`\`\`json.
`;

  const userPrompt = `
Here is the current portfolio data:

--- PROFILE CONFIGURATION ---
${JSON.stringify(currentProfile, null, 2)}

--- PROJECTS CONFIGURATION ---
${JSON.stringify(currentProjects, null, 2)}

--- PAPERS CONFIGURATION ---
${JSON.stringify(currentPapers, null, 2)}

--- USER UPDATE REQUEST ---
"${userMessage}"

--- INSTRUCTIONS ---
1. Review the User Update Request.
2. Determine which data configurations need to change:
   - If the request is to add a project, append it to the Projects array. Ensure it has: title, description, tags (array of strings), github link (default to empty string or user provided), demo link (default to empty string or user provided), category (must be one of: 'ml', 'hardware', 'chip', 'iot'), and priority (integer 1 to 5, default to 5 unless specified).
   - If the request is to add a research paper, append it to the Papers array. Ensure it has: title, authors (default to "Dalton Omondi" if not specified), year, abstract, tags (array of strings), pdfPath (e.g. "/papers/filename.pdf" where filename is a URL-safe version of the title), status (must be one of: 'published', 'submitted', 'draft', 'preprint'), and priority (integer 1 to 5, default to 5 unless specified).
   - If the request is to update his general profile (bio, roles, theme, engineeringObjective, researchStatement, social links, work experience, education, certifications), modify the Profile configuration accordingly.
3. Keep all other fields intact unless explicitly asked to modify them. Ensure existing priorities are preserved.
4. Return a valid JSON matching the schema.
`;

  try {
    const rawResult = await generateAIResponse(userPrompt, systemPrompt, true);
    
    // Clean potential markdown quotes in case some models still output them despite JSON mode
    const cleanJson = rawResult.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    
    return JSON.parse(cleanJson) as UpdateAssistantResult;
  } catch (error) {
    console.error("Failed to generate content from AI Provider:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to process portfolio updates");
  }
};
