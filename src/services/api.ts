const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export interface PredictionResult {
  prediction: string;
  confidence: number;
  bbox?: number[];
  processed_image_url?: string;
}

export interface GeminiInsights {
  text: string;
}

export const predictSkinCondition = async (imageFile: File): Promise<PredictionResult> => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${BACKEND_URL}/predict`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to analyze image');
  }

  return response.json();
};

export const getGeminiInsights = async (prediction: string): Promise<GeminiInsights> => {
  if (!GEMINI_API_KEY) {
    return { text: 'Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment variables.' };
  }

  const prompt = `Provide medical-style insights for the detected skin disease:
- Name of the disease: ${prediction}
- Brief explanation
- Common symptoms
- Severity estimate
- Suggested care steps
- When to see a dermatologist

Write in simple, friendly language and don't provide medical diagnosis. Only provide educational information.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get AI insights');
  }

  const data = await response.json();
  return {
    text: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No insights available',
  };
};
