import os
import re
from sentence_transformers import SentenceTransformer

CLEANED_TEXT_DIR = "data/knowledge_base/cleaned_text"
CHUNK_DIR = "data/knowledge_base/chunks"

os.makedirs(CHUNK_DIR, exist_ok=True)

# Load tokenizer model (only tokenizer is used here)
model = SentenceTransformer("all-MiniLM-L6-v2")
tokenizer = model.tokenizer

CHUNK_SIZE = 500
OVERLAP = 50


def clean_text(text):
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def chunk_text(text):
    tokens = tokenizer.encode(text)
    chunks = []

    start = 0
    while start < len(tokens):
        end = start + CHUNK_SIZE
        chunk_tokens = tokens[start:end]
        chunk_text = tokenizer.decode(chunk_tokens)
        chunks.append(chunk_text)
        start += CHUNK_SIZE - OVERLAP

    return chunks


def process_all_files():
    for filename in os.listdir(CLEANED_TEXT_DIR):
        if filename.endswith(".txt"):
            print(f"Chunking: {filename}")

            file_path = os.path.join(CLEANED_TEXT_DIR, filename)
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()

            text = clean_text(text)
            chunks = chunk_text(text)

            base_name = filename.replace(".txt", "")
            for i, chunk in enumerate(chunks):
                chunk_filename = f"{base_name}_chunk_{i}.txt"
                chunk_path = os.path.join(CHUNK_DIR, chunk_filename)

                with open(chunk_path, "w", encoding="utf-8") as cf:
                    cf.write(chunk)


if __name__ == "__main__":
    process_all_files()
