import os
import json

CHUNKS_DIR = "data/knowledge_base/chunks"
OUTPUT_FILE = "data/knowledge_base/processed/chunks_with_metadata.jsonl"


def detect_topic(filename):

    name = filename.lower()

    if "malaria" in name:
        return "malaria"
    elif "hiv" in name:
        return "hiv"
    elif "covid" in name:
        return "covid"
    elif "diabetes" in name:
        return "diabetes"
    elif "hypertension" in name:
        return "hypertension"
    elif "mental" in name:
        return "mental_health"
    else:
        return "general"


def main():

    if not os.path.exists(CHUNKS_DIR):
        print("❌ Chunks folder not found")
        return

    os.makedirs("knowledge_base/processed", exist_ok=True)

    chunk_files = os.listdir(CHUNKS_DIR)

    count = 0

    with open(OUTPUT_FILE, "w", encoding="utf-8") as out_file:

        for file in chunk_files:

            if not file.endswith(".txt"):
                continue

            file_path = os.path.join(CHUNKS_DIR, file)

            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read().strip()

            topic = detect_topic(file)

            pdf_name = file.split("_chunk_")[0] + ".pdf"

            data = {
                "text": text,

                "metadata": {
                    "source": "WHO Guidelines",
                    "pdf_name": pdf_name,
                    "topic": topic,
                    "chunk_file": file,
                    "chunk_id": count
                }
            }

            out_file.write(json.dumps(data) + "\n")

            count += 1

    print(f"✅ Created {count} chunks with metadata")


if __name__ == "__main__":
    main()
