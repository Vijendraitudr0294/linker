
/**
 * Utility for AI-assisted form fields (AI Clarification and AI FAQ)
 */

const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash'];

export interface AICallResult {
  text: string;
  error?: string;
}

export const callGeminiAI = async (prompt: string): Promise<AICallResult> => {
  const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return { text: "", error: "AI Key missing" };
  }

  for (const model of GEMINI_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
          })
        }
      );

      if (!response.ok) continue;
      
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return { text: text.trim() };
    } catch (e) {
      console.warn(`Gemini AI failed for model ${model}:`, e);
    }
  }

  return { text: "", error: "AI service unavailable" };
};

export const getClarification = async (label: string, value: string): Promise<string> => {
  if (!value || value.length < 5) return "";
  const prompt = `
    Context: A user is filling out a form field labelled "${label}".
    Input: "${value}"
    Task: If the input is informal, unclear, or has typos, suggest a professional and clear alternative. 
    Rule: Only return the suggested text, nothing else. If it's already perfect, return the original text.
  `;
  const result = await callGeminiAI(prompt);
  return result.text;
};

export const getFieldFAQ = async (label: string, type: string, userQuestion: string): Promise<string> => {
  const prompt = `
    Context: A user is filling out a form field.
    Field Label: "${label}"
    Field Type: "${type}"
    User Question: "${userQuestion}"
    Task: Answer the user's question about this field in a helpful, concise way (max 2 sentences).
  `;
  const result = await callGeminiAI(prompt);
  return result.text || "I'm sorry, I couldn't generate an answer. Try asking differently.";
};
