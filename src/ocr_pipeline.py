import os
import cv2
import pytesseract
import re

# ------------------------------
# Folder Paths
# ------------------------------
RAW_FOLDER = "data/handwritten_prescriptions/raw"
PROCESSED_FOLDER = "data/handwritten_prescriptions/processed"

os.makedirs(PROCESSED_FOLDER, exist_ok=True)


# ------------------------------
# Image Preprocessing
# ------------------------------
def preprocess_image(image_path):
    image = cv2.imread(image_path)

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    blur = cv2.GaussianBlur(gray, (5, 5), 0)

    thresh = cv2.threshold(
        blur,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )[1]

    return thresh


# ------------------------------
# OCR Extraction
# ------------------------------
def extract_text(image):
    text = pytesseract.image_to_string(image)
    return text


# ------------------------------
# Medicine Mapping
# ------------------------------
medicine_dictionary = {
    "panadol": "Paracetamol",
    "paracetamol": "Paracetamol",
    "brufen": "Ibuprofen",
    "ibuprofen": "Ibuprofen",
}


def standardize_medicine(name):
    name = name.lower()
    return medicine_dictionary.get(name, name)


# ------------------------------
# Extract Medicines
# ------------------------------
def extract_medicine_info(text):
    medicines = []

    lines = text.split("\n")

    for line in lines:
        match = re.search(r"([A-Za-z]+)\s*(\d+mg|\d+ml)?", line)

        if match:
            name = match.group(1)
            dose = match.group(2)

            name = standardize_medicine(name)

            medicines.append({
                "medicine": name,
                "dosage": dose
            })

    return medicines


# ------------------------------
# Main OCR Pipeline
# ------------------------------
def run_ocr():

    files = os.listdir(RAW_FOLDER)

    if len(files) == 0:
        print("No images found in raw folder")
        return

    print("Total images found:", len(files))

    for file in files:

        image_path = os.path.join(RAW_FOLDER, file)

        print("\nProcessing:", file)

        processed_image = preprocess_image(image_path)

        # Save processed image
        processed_path = os.path.join(PROCESSED_FOLDER, file)
        cv2.imwrite(processed_path, processed_image)

        text = extract_text(processed_image)

        print("\nExtracted Text:")
        print(text)

        medicines = extract_medicine_info(text)

        print("\nDetected Medicines:")
        print(medicines)


if __name__ == "__main__":
    run_ocr()