import uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
import shutil
import uuid
import os
import json
import google.generativeai as genai

# -------------------------------
# CONFIG
# -------------------------------
genai.configure(api_key="AIzaSyCjuL1uTa_OOXaFZHIr4Fg5tJb2xGyCwS8")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure folders
os.makedirs("processed", exist_ok=True)
os.makedirs("runs/detect/predict", exist_ok=True)

# Load YOLO model
model = YOLO("models/best.pt")



# -------------------------------
# GEMINI ANALYSIS (29 DISEASES + CANCERS)
# -------------------------------
def analyze_image(filepath):
    derm_model = genai.GenerativeModel("models/gemini-2.5-pro")

    prompt = """
    You are an advanced AI Dermatologist trained to detect skin conditions and skin cancers from images.
    Analyze the uploaded image carefully and identify the most likely condition.

    You must strictly choose from these conditions (if none match, choose 'Healthy Skin'):

    1. Acne
    2. Eczema
    3. Psoriasis
    4. Rosacea
    5. Fungal Infection
    6. Melasma
    7. Vitiligo
    8. Skin Allergy
    9. Urticaria (Hives)
    10. Sunburn
    11. Contact Dermatitis
    12. Cold Sores
    13. Cellulitis
    14. Boils (Furuncles)
    15. Warts
    16. Chickenpox
    17. Measles Rash
    18. Ringworm (Tinea)
    19. Impetigo
    20. Scabies
    21. Shingles
    22. Lichen Planus
    23. Keratosis Pilaris
    24. Seborrheic Dermatitis
    25. Folliculitis
    26. Healthy Skin
    27. Basal Cell Carcinoma
    28. Squamous Cell Carcinoma
    29. Melanoma

    For all skin cancer types, mention clearly that it needs **immediate dermatologist consultation**.

    Also provide:
    - A short prescription or treatment plan (avoid heavy medical terms)
    - 2–3 practical lifestyle or skincare tips

    ⚠️ Respond ONLY in this pure JSON format:
    {
        "condition": "",
        "prescription": "",
        "tips": ""
    }
    """

    try:
        uploaded = genai.upload_file(filepath)
        print(f"Uploaded to Gemini: {uploaded.uri}")

        response = derm_model.generate_content([prompt, uploaded])

        raw = response.text.strip()

        # Clean code block formatting
        if raw.startswith("```json"):
            raw = raw.replace("```json", "").replace("```", "").strip()

        # Parse JSON
        data = json.loads(raw)

        # Save log for debugging
        with open("gemini_log.txt", "w", encoding="utf-8") as f:
            f.write(raw)

        return data

    except Exception as e:
        print("Gemini Error:", e)
        return {
            "condition": "Unknown",
            "prescription": "Try uploading a clearer photo or consult a dermatologist.",
            "tips": "Make sure the image is well-lit and close-up."
        }



# -------------------------------
# MAIN PREDICTION ENDPOINT
# -------------------------------
@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    # Save uploaded file
    image_id = str(uuid.uuid4())
    input_path = f"processed/{image_id}.jpg"

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Run YOLO
    results = model.predict(input_path, save=True)
    r = results[0]

    # -------------------------
    # CASE 1 — YOLO FAILS → GEMINI VISION
    # -------------------------
    # CASE 1 — YOLO FAILS OR CONFIDENCE TOO LOW → GEMINI VISION
    if len(r.boxes) == 0:
        print("YOLO found nothing → Using Gemini Vision (advanced dermatologist prompt)")
        use_gemini = True
    else:
        box = r.boxes[0]
        confidence = float(box.conf[0])
        if confidence < 0.30:
            print(f"YOLO confidence too low ({confidence:.2f}) → Using Gemini Vision")
            use_gemini = True
        else:
            use_gemini = False

# If Gemini should be used instead of YOLO
    if use_gemini:
        gemini_result = analyze_image(input_path)
        return {
            "model_used": "Gemini 2.5 Pro Vision",
            "prediction": gemini_result["condition"],
            "confidence": None,
            "prescription": gemini_result["prescription"],
            "tips": gemini_result["tips"],
            "processed_image_url": None
        }
    # -------------------------
    # CASE 2 — YOLO SUCCESS
    # -------------------------
    box = r.boxes[0]
    cls = int(box.cls[0])
    confidence = float(box.conf[0])
    condition = model.names[cls]

    # Get YOLO processed output
    output_dir = "runs/detect/predict"
    files = [f for f in os.listdir(output_dir) if f.endswith((".jpg", ".png"))]

    if files:
        files.sort(key=lambda x: os.path.getmtime(os.path.join(output_dir, x)), reverse=True)
        processed_img = files[0]
        processed_url = f"http://localhost:8000/runs/detect/predict/{processed_img}"
    else:
        processed_url = None

    # Get deeper insights from Gemini
    gemini_result = analyze_image(input_path)

    return {
        "model_used": "YOLO + Gemini",
        "prediction": condition,
        "confidence": confidence,
        "prescription": gemini_result["prescription"],
        "tips": gemini_result["tips"],
        "processed_image_url": processed_url
    }



# -------------------------------
# Static file serving
# -------------------------------
from fastapi.staticfiles import StaticFiles
app.mount("/processed", StaticFiles(directory="processed"), name="processed")
app.mount("/runs/detect/predict", StaticFiles(directory="runs/detect/predict"), name="yolo_output")



# -------------------------------
# CHATBOT ENDPOINT
# -------------------------------
class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Chatbot endpoint for general skin health queries.
    Uses Gemini to provide medical advice and answer questions.
    """
    try:
        chat_model = genai.GenerativeModel("models/gemini-2.5-flash")
        
        system_prompt = """
        You are a helpful medical assistant specializing in dermatology and skin health.
        Provide clear, accurate, and compassionate advice about skin conditions, treatments, and skincare.
        
        Important guidelines:
        - For serious conditions or suspected cancers, always recommend consulting a dermatologist
        - Keep answers concise and easy to understand
        - Avoid overly technical medical jargon
        - If uncertain, acknowledge limitations and suggest professional consultation
        - Never provide definitive diagnoses without proper examination
        """
        
        full_prompt = f"{system_prompt}\n\nUser Question: {request.message}"
        
        response = chat_model.generate_content(full_prompt)
        
        return {
            "response": response.text.strip(),
            "model_used": "Gemini 2.5 Flash"
        }
        
    except Exception as e:
        print("Chat Error:", e)
        return {
            "response": "I'm sorry, I encountered an error processing your question. Please try again or consult a healthcare professional.",
            "model_used": "Error"
        }


# -------------------------------
# RUN SERVER
# -------------------------------
if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
