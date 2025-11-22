const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export interface PredictionResult {
  prediction: string;
  confidence: number | null;  // Gemini fallback returns null
  processed_image_url?: string;

  // 🔥 NEW FIELDS from backend
  prescription?: string;
  tips?: string;
}

export const predictSkinCondition = async (imageFile: File): Promise<PredictionResult> => {
  const formData = new FormData();
  formData.append("file", imageFile);

  const response = await fetch(`${BACKEND_URL}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to analyze image");
  }

  return response.json();
};

