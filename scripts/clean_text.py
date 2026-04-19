INPUT_FILE = "data/linguistic_data/raw/medical_chat.txt"
OUTPUT_FILE = "data/linguistic_data/clean/medical_chat_clean.txt"

def main():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        text = f.read()

    # Remove extra spaces and empty lines
    lines = text.split("\n")
    cleaned = []

    for line in lines:
        line = line.strip()
        if line:
            cleaned.append(line)

    final_text = "\n".join(cleaned)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
        out.write(final_text)

    print("✅ Text cleaned successfully")

if __name__ == "__main__":
    main()
