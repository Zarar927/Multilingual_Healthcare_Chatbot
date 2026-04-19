from pathlib import Path
from src.rag.retrieval_engine import retrieve
from src.nlp.multilingual_module import translate_to_english, translate_to_urdu, detect_language
import google.generativeai as genai
import os
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-flash-latest')

DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "medical_knowledge"
_known_medical_terms = None


def load_medical_terms():
    global _known_medical_terms
    if _known_medical_terms is not None:
        return _known_medical_terms

    terms = set()
    if DATA_DIR.exists():
        for path in DATA_DIR.glob("*.txt"):
            terms.add(path.stem.replace("_", " ").lower())

    _known_medical_terms = sorted(terms, key=lambda t: -len(t))
    return _known_medical_terms


def normalize_query(query):
    if not query or not query.strip():
        return query

    common_misspellings = {
        "fevr": "fever",
        "feaver": "fever",
        "faver": "fever",
        "feverr": "fever",
        "flue": "flu",
        "caugh": "cough",
        "hedache": "headache",
        "headake": "headache",
        "headach": "headache",
        "diabtes": "diabetes",
        "diabete": "diabetes",
        "hypertention": "hypertension",
        "nauseaous": "nausea",
        "vommiting": "vomiting",
        "migrainee": "migraine",
        "presciption": "prescription",
        "medecine": "medicine",
    }

    def replace_token(match):
        token = match.group(0)
        lower = token.lower()
        if lower in common_misspellings:
            corrected = common_misspellings[lower]
            return corrected.capitalize() if token[0].isupper() else corrected
        return token

    return re.sub(r"\b[\w']+\b", replace_token, query)


def find_medical_terms(query):
    normalized = normalize_query(query.lower())
    terms = load_medical_terms()
    found = []
    for term in terms:
        if re.search(rf"\b{re.escape(term)}\b", normalized):
            found.append(term)
    return found


def load_medical_context(term):
    if not term:
        return None
    path = DATA_DIR / f"{term.replace(' ', '_')}.txt"
    if path.exists():
        try:
            return path.read_text(encoding="utf-8").strip()
        except Exception:
            return None
    return None


def format_structured_context(context_text, question=None):
    docs = [doc.strip() for doc in re.split(r'(?m)^(?=Disease:\s*)', context_text) if doc.strip()]
    if not docs:
        return None

    # Do not use the single-doc fallback if multiple disease documents are present.
    if len(docs) > 1:
        return None

    # Prefer the first doc as the top match.
    doc_text = docs[0]
    sections = {}
    current = None

    for line in doc_text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue

        match = re.match(r'^(Disease|Description|Causes|Symptoms|Treatment|Treatments)\s*:(.*)$', stripped, re.IGNORECASE)
        if match:
            key = match.group(1).capitalize()
            value = match.group(2).strip()

            if key in ['Causes', 'Symptoms', 'Treatment', 'Treatments']:
                sections[key] = []
                if value:
                    sections[key].append(value)
                current = key
            else:
                sections[key] = value
                current = key
        elif current:
            if current in ['Causes', 'Symptoms', 'Treatment', 'Treatments']:
                if stripped.startswith('-'):
                    sections[current].append(stripped.lstrip('- ').strip())
                elif sections[current] and isinstance(sections[current], list):
                    sections[current][-1] = f"{sections[current][-1]} {stripped}".strip()
                else:
                    sections[current].append(stripped)
            else:
                sections[current] = f"{sections[current]} {stripped}".strip()

    if not sections:
        return None

    disease = sections.get('Disease', '').strip()
    description = sections.get('Description', '').strip()
    causes = sections.get('Causes', [])
    symptoms = sections.get('Symptoms', [])
    treatments = sections.get('Treatment', []) or sections.get('Treatments', [])

    if not description:
        return None

    answer_parts = []
    if description:
        answer_parts.append(description)
    if causes:
        answer_parts.append(f"Common causes include {', '.join(causes)}.")
    if symptoms:
        answer_parts.append(f"Key symptoms are {', '.join(symptoms)}.")
    if treatments:
        answer_parts.append(f"Management typically includes {', '.join(treatments)}.")

    answer = ' '.join(answer_parts)
    if question and is_medical_query(question) and answer and 'consult' not in answer.lower():
        answer = f"{answer} Always consult a doctor for personalized medical advice."

    return answer


def is_medical_query(text):
    if not text:
        return False
    text = text.lower()
    medical_terms = [
        'fever', 'cough', 'headache', 'pain', 'diabetes', 'blood pressure', 'hypertension',
        'infection', 'covid', 'flu', 'cancer', 'symptom', 'diagnosis', 'treatment',
        'medication', 'medicine', 'prescription', 'dose', 'disease', 'heart attack',
        'stroke', 'asthma', 'allergy', 'pregnancy', 'surgery', 'doctor', 'clinic',
        'urgent', 'emergency', 'virus', 'bacteria', 'nausea', 'vomiting', 'migraine',
        'therapy', 'insomnia', 'depression', 'blood sugar', 'cholesterol', 'antibiotic'
    ]
    return any(term in text for term in medical_terms)


def generate_medical_response(context, question, retry=False):
    """
    Generate medical response using Gemini with retrieved context.
    """
    try:
        context_text = context.strip() if context and context.strip() else "No relevant medical context was found."

        structured_answer = format_structured_context(context_text, question)
        if structured_answer:
            return structured_answer

        if not retry:
            prompt = f"""You are a clinical healthcare assistant that answers medical questions using only the supplied guideline evidence.

INSTRUCTIONS:
1. Use only the medical context below. If the context does not answer the question, say the evidence is uncertain.
2. Do not invent diagnoses or treatments.
3. Do not use generic filler such as 'rest and drink fluids' unless directly supported by the context.
4. Keep the response professional, structured, and evidence-based.
5. Do not repeat the medical context verbatim; summarize and answer in your own words.
6. If the question is about a symptom, define it briefly and describe how it is assessed.
7. Mention when clinical confirmation or laboratory testing is required.
8. Use the sections from the context where possible: description, causes, symptoms, treatment.

MEDICAL CONTEXT:
{context_text}

USER QUESTION:
{question}

Provide a complete, clinically useful answer in a short paragraph of 3-5 sentences. If you cannot answer from the context, say so and recommend consulting a healthcare professional."""
        else:
            prompt = f"""You are a clinical healthcare assistant that answers medical questions using only the supplied guideline evidence.

INSTRUCTIONS:
1. Use only the medical context below.
2. Answer the user question fully and in your own words.
3. Do not stop the answer in the middle of a sentence.
4. Do not repeat the medical context verbatim.
5. Keep the response professional, structured, and evidence-based.
6. Use the context sections where appropriate: description, causes, symptoms, treatment.
7. If the context does not answer the question clearly, say the evidence is uncertain.

MEDICAL CONTEXT:
{context_text}

USER QUESTION:
{question}

Provide a complete, clinically useful answer in a short paragraph of 3-5 sentences. If you cannot answer from the context, say so and recommend consulting a healthcare professional."""

        response = model.generate_content(
            contents=prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.0,
                max_output_tokens=450
            )
        )

        answer = response.text.strip() if response and getattr(response, 'text', None) else ""

        if is_medical_query(question) and answer and 'consult' not in answer.lower():
            answer = f"{answer} Always consult a doctor for personalized medical advice."

        if not retry and (len(answer) < 80 or not re.search(r"[\.\?!]$", answer)):
            return generate_medical_response(context, question, retry=True)

        if answer:
            return answer

        return "I apologize, but I couldn't generate a response at this time. Please consult a healthcare professional."

    except Exception as e:
        print(f"Error in Gemini API call: {e}")
        return f"I apologize, but there was an error processing your request: {str(e)}. Please consult a healthcare professional."

def ask_question(user_query):
    try:
        # Detect language
        lang = detect_language(user_query)
        print(f"Detected language: {lang}")
        
        # Translate to English if needed
        query_en = translate_to_english(user_query) if lang != "english" else user_query
        normalized_query = normalize_query(query_en)
        if normalized_query != query_en:
            print(f"Normalized query from '{query_en}' to '{normalized_query}'")
        query_en = normalized_query
        print(f"Query in English: {query_en}")
        
        # Retrieve relevant chunks from knowledge base
        docs = retrieve(query_en)
        print(f"Retrieved {len(docs)} relevant chunks")

        # If the query mentions known symptoms or diseases, ensure their exact documents are included.
        query_terms = find_medical_terms(query_en)
        for term in query_terms:
            direct_context = load_medical_context(term)
            if direct_context and direct_context not in docs:
                print(f"Adding direct medical context for term '{term}'")
                docs.insert(0, direct_context)

        # Combine chunks into context
        context = "\n\n".join(docs) if docs else ""
        
        # Generate answer using Gemini LLM
        answer_en = generate_medical_response(context, query_en)
        
        # Translate back to original language if not English
        if lang != "english" and lang != "unknown":
            answer = translate_to_urdu(answer_en)
        else:
            answer = answer_en
        
        return answer
    
    except Exception as e:
        print(f"Error in ask_question: {e}")
        return f"Sorry, I encountered an error: {str(e)}. Please try again or consult a healthcare professional."


if __name__ == "__main__":

    query = "mujhe bukhar hai kya karun"

    response = ask_question(query)

    print("User Query:", query)
    print("Response:", response)