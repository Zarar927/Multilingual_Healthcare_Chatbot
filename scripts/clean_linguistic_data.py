import re

INPUT_FILE = "data/linguistic_data/raw/medical_ur_roman.txt"
OUTPUT_FILE = "data/linguistic_data/processed/medical_clean.txt"


def clean_text(text):

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text)

    # Remove weird symbols (keep Urdu + English)
    text = re.sub(r"[^\w\s\:\؟\؟\.\،\u0600-\u06FF]", "", text)

    return text.strip()


def main():

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        lines = f.readlines()

    cleaned_lines = []

    for line in lines:
        line = line.strip()

        if not line:
            continue

        cleaned = clean_text(line)
        cleaned_lines.append(cleaned)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
        for line in cleaned_lines:
            out.write(line + "\n")

    print("✅ Linguistic data cleaned successfully")


if __name__ == "__main__":
    main()
