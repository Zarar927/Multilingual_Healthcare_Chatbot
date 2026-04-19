import os
import cv2
import pytesseract
import re
import difflib

# Path to prescription images
IMAGE_FOLDER = "data/handwritten_prescriptions/processed"

# Medicine dictionary
MEDICINE_LIST = [
    "paracetamol",
    "panadol",
    "ibuprofen",
    "amoxicillin",
    "augmentin",
    "aspirin",
    "metformin",
    "insulin",
    "omeprazole",
    "diclofenac",
    "celebrex",
    "gabapentin",
    "dextromethorphan",
    "azithromycin",
    "losartan",
    "atorvastatin",
    "acetaminophen",
    "cetirizine",
    "clopidogrel",
    "hydrocortisone",
    "montelukast",
    "loperamide",
    "prednisolone",
    "salbutamol",
    "ranitidine",
    "zinc",
    "folic acid",
    "vitamin d"
]

MEDICINE_ALIASES = {
    "celbexx": "celebrex",
    "celbex": "celebrex",
    "gabica": "gabapentin",
    "gabapentin": "gabapentin",
    "dextran": "dextromethorphan",
    "dextro": "dextromethorphan",
    "vitamind": "vitamin d",
    "vitamind3": "vitamin d"
}

# --------------------------------
# Image Preprocessing
# --------------------------------
def preprocess_image(image_path):

    image = cv2.imread(image_path)

    if image is None:
        print("❌ Error loading image:", image_path)
        return None

    # Resize (helps OCR read handwriting better)
    image = cv2.resize(image, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Improve contrast
    gray = cv2.equalizeHist(gray)

    # Remove noise
    blur = cv2.GaussianBlur(gray, (5, 5), 0)

    # Adaptive threshold
    thresh = cv2.adaptiveThreshold(
        blur,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        11,
        2
    )

    return thresh


# --------------------------------
# Clean OCR Text
# --------------------------------
def clean_ocr_text(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def score_ocr_text(text):
    if not text or len(text.strip()) == 0:
        return 0
    words = re.findall(r'\b[a-zA-Z0-9]{2,}\b', text)
    return len(words)


def preprocess_for_ocr(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    gray = cv2.bilateralFilter(gray, 9, 75, 75)
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 1))
    cleaned = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
    return cleaned


def ocr_text_from_image(image):
    custom_config = r'--oem 3 --psm 6'
    text = pytesseract.image_to_string(image, config=custom_config, lang='eng')
    return text.strip()


# --------------------------------
# Detect Dosage
# Example: 500mg, 250mg, 10ml
# --------------------------------
def detect_dosage(text):

    dosage_pattern = r"\b\d+\s?(mg|ml|g|tablet|tablets|capsule|capsules)\b"

    match = re.search(dosage_pattern, text)

    if match:
        return match.group()

    return None


# --------------------------------
# Detect Frequency
# Example: once daily, twice daily, BD, TDS
# --------------------------------
def detect_frequency(text):

    frequency_patterns = [
        "once daily",
        "twice daily",
        "three times daily",
        "bd",
        "tds",
        "od",
        "qid"
    ]

    for freq in frequency_patterns:
        if freq in text:
            return freq

    return None


# --------------------------------
# Detect Medicines
# --------------------------------
def normalize_medicine_candidate(token):
    token = token.lower().strip()
    token = re.sub(r'[^a-z0-9 ]', '', token)
    return MEDICINE_ALIASES.get(token, token)


def best_medicine_match(token):
    token = normalize_medicine_candidate(token)
    if token in MEDICINE_LIST:
        return token
    matches = difflib.get_close_matches(token, MEDICINE_LIST, n=1, cutoff=0.65)
    return matches[0] if matches else None


def extract_candidate_medicine_names(text):
    candidates = set()
    for line in text.splitlines():
        # Look for medicine names before dosages like 'Celbexx 200m'
        dosage_matches = re.findall(r"\b([A-Za-z][A-Za-z0-9]{3,})\b\s*\d+\s?(?:mg|ml|g|mcg|iu|m)(?=\W|$)", line, re.IGNORECASE)
        candidates.update(dosage_matches)

        # Look for forms like 'Cap. Gabica' or 'Tab. Xobix'
        form_matches = re.findall(r"(?:cap|cap\.|tab|tab\.|tablet|tabs|capsule|syrup|cream|gel|ointment)\s*\.?\s*([A-Za-z][A-Za-z0-9]{3,})", line, re.IGNORECASE)
        candidates.update(form_matches)

        # Fallback: common medicine suffixes
        for token in re.findall(r"\b[A-Za-z][A-Za-z0-9]{3,}\b", line):
            if token.lower().endswith(("ine", "ol", "ex", "an", "cin", "pril", "sartan", "statin", "mycin", "coxib", "azole", "zole", "pam", "nide")):
                candidates.add(token)

    return candidates


def detect_medicines(text):
    medicines = []
    found = set()
    cleaned_text = text.lower()

    for med in MEDICINE_LIST:
        if med in cleaned_text:
            found.add(med)

    for candidate in extract_candidate_medicine_names(text):
        matched = best_medicine_match(candidate)
        if matched:
            found.add(matched)

    for med in sorted(found):
        dosage = detect_dosage(text)
        frequency = detect_frequency(text)
        medicines.append({
            "medicine": med,
            "dosage": dosage,
            "frequency": frequency
        })

    return medicines


def process_image_file(image_path):
    """Run OCR on a single uploaded image file and return extracted text and medicines."""
    original = cv2.imread(image_path)
    if original is None:
        return {"error": "Unable to load the uploaded image."}

    preprocessed = None
    try:
        preprocessed = preprocess_for_ocr(original)
    except Exception:
        preprocessed = None

    candidates = [original]
    if preprocessed is not None:
        candidates.append(preprocessed)

    best_text = ""
    best_score = -1
    for candidate in candidates:
        try:
            current_text = ocr_text_from_image(candidate)
            current_score = score_ocr_text(current_text)
            if current_score > best_score:
                best_score = current_score
                best_text = current_text
        except Exception:
            continue

    cleaned_text = clean_ocr_text(best_text)
    medicines = detect_medicines(best_text)
    dosages = detect_dosage(best_text)
    frequencies = detect_frequency(best_text)

    return {
        "text": best_text,
        "clean_text": cleaned_text,
        "medicines": medicines,
        "dosages": dosages,
        "frequencies": frequencies,
    }


# --------------------------------
# Main OCR Function
# --------------------------------
def run_ocr():

    files = os.listdir(IMAGE_FOLDER)

    if len(files) == 0:
        print("❌ No images found in folder")
        return

    print("Total images found:", len(files))

    for file in files:

        if file.lower().endswith((".jpg", ".png", ".jpeg")):

            image_path = os.path.join(IMAGE_FOLDER, file)

            print("\n==============================")
            print("Processing:", file)

            image = preprocess_image(image_path)

            if image is None:
                continue

            # OCR configuration
            custom_config = r'--oem 3 --psm 6'

            text = pytesseract.image_to_string(image, config=custom_config)

            text = clean_ocr_text(text)

            print("\nExtracted Text:")
            print(text)

            medicines = detect_medicines(text)

            print("\nDetected Medicines:")
            print(medicines)


# --------------------------------
# Run
# --------------------------------
if __name__ == "__main__":
    run_ocr()