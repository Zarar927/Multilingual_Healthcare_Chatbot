import os
import cv2

# Input and output directories
INPUT_DIR = "data/handwritten_prescriptions/raw"
OUTPUT_DIR = "data/handwritten_prescriptions/processed"

# Create output folder if not exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

for file in os.listdir(INPUT_DIR):
    if file.lower().endswith((".png", ".jpg", ".jpeg")):
        path = os.path.join(INPUT_DIR, file)
        image = cv2.imread(path)

        # Resize image to make small handwriting more readable
        image = cv2.resize(image, None, fx=1.5, fy=1.5)

        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Remove noise
        blur = cv2.GaussianBlur(gray, (5, 5), 0)

        # Adaptive thresholding for better OCR results
        thresh = cv2.adaptiveThreshold(
            blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )

        # Optional: denoising
        processed = cv2.fastNlMeansDenoising(thresh, h=10)

        output_path = os.path.join(OUTPUT_DIR, file)
        cv2.imwrite(output_path, processed)

print("✅ Prescription images processed successfully")