INPUT_FILE = "data/linguistic_data/clean/medical_chat_clean.txt"
OUTPUT_FILE = "data/linguistic_data/chunks/medical_chunks.txt"

CHUNK_SIZE = 300  # words
OVERLAP = 30      # words


def main():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        words = f.read().split()

    chunks = []

    i = 0
    while i < len(words):
        chunk = words[i:i+CHUNK_SIZE]
        chunks.append(" ".join(chunk))
        i += CHUNK_SIZE - OVERLAP

    with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
        for idx, c in enumerate(chunks):
            out.write(f"--- Chunk {idx+1} ---\n")
            out.write(c + "\n\n")

    print("✅ Text split into chunks")

if __name__ == "__main__":
    main()
