# main.py
import os
import sys
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

# Ensure project root is on Python path so sibling src/ imports work from backend/ folder.
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# ---- LLM + RAG Pipeline ----
from src.llm.llm_pipeline import ask_question
from src.ocr_module import process_image_file

# ---- FastAPI app ----
app = FastAPI(title="Multilingual Healthcare Chatbot API")

# Allow all CORS origins for frontend testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Request model ----
class QueryRequest(BaseModel):
    query: str

# ---- Helper function to ask questions ----
# ---- API Endpoints ----

@app.post("/ask")
async def ask(request: QueryRequest):
    """
    Ask a question to the chatbot.
    """
    response = ask_question(request.query)
    return {"query": request.query, "response": response}

@app.post("/upload_prescription")
async def upload_prescription(file: UploadFile = File(...)):
    """
    Upload prescription image and perform OCR extraction.
    """
    os.makedirs("temp_uploads", exist_ok=True)
    file_location = os.path.join("temp_uploads", file.filename)

    with open(file_location, "wb") as f:
        f.write(await file.read())

    try:
        ocr_result = process_image_file(file_location)
    except Exception as exc:
        return {"filename": file.filename, "message": f"OCR failed: {str(exc)}"}

    if ocr_result.get("error"):
        return {"filename": file.filename, "message": ocr_result["error"]}

    message = "OCR extraction completed."
    if ocr_result["text"]:
        message += f"\n\nExtracted text:\n{ocr_result['text']}"
        message += f"\n\nCleaned text:\n{ocr_result.get('clean_text', ocr_result['text'])}"
    else:
        message += "\n\nNo text was extracted from the image."

    if ocr_result["medicines"]:
        medicines_text = "\n".join(
            f"- {item['medicine']} {item.get('dosage') or ''} {item.get('frequency') or ''}".strip()
            for item in ocr_result["medicines"]
        )
        message += f"\n\nDetected medicines:{medicines_text}"
    else:
        message += "\n\nDetected medicines: None found."

    # Build a prescription-aware question for the RAG/medical knowledge pipeline.
    if ocr_result["text"]:
        medicine_names = [item["medicine"] for item in ocr_result.get("medicines", []) if item.get("medicine")]
        if medicine_names:
            query = (
                f"Prescription text: {ocr_result['text']}. "
                f"Detected medicines: {', '.join(medicine_names)}. "
                "Please provide a medical summary, likely clinical use, and safety guidance for these medications based on trusted medical knowledge. "
                "If any medication cannot be identified with confidence, state that clearly."
            )
        else:
            query = (
                f"Prescription text: {ocr_result['text']}. "
                "Please identify any likely medications and provide a medical summary based on trusted clinical knowledge. "
                "If the prescription text is too unclear to identify the medication, say so instead of guessing."
            )

        try:
            generated_answer = ask_question(query)
            message += f"\n\nGenerated medical answer:\n{generated_answer}"
        except Exception as exc:
            message += f"\n\nCould not generate a medical answer: {str(exc)}"

    return {"filename": file.filename, "message": message}

@app.get("/")
async def root():
    return {"message": "Multilingual Healthcare Chatbot API is running 🚀"}

# ---- Run the app ----
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)