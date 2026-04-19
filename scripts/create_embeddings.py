import os
import json
import chromadb
from sentence_transformers import SentenceTransformer

# Paths
METADATA_FILE = "data/knowledge_base/processed/chunks_with_metadata.jsonl"
VECTOR_DIR = "vectors/chroma_db"

os.makedirs(VECTOR_DIR, exist_ok=True)

# Multilingual embedding model (important for Urdu + English)
embedding_model = SentenceTransformer(
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)

# Initialize ChromaDB
client = chromadb.PersistentClient(path=VECTOR_DIR)

collection = client.get_or_create_collection(
    name="who_medical_kb"
)


def store_embeddings():

    if not os.path.exists(METADATA_FILE):
        print("❌ Metadata file not found")
        return

    print("Loading metadata chunks...")

    with open(METADATA_FILE, "r", encoding="utf-8") as f:
        lines = f.readlines()

    print("Generating embeddings...")

    for i, line in enumerate(lines):
        data = json.loads(line)

        text = data["text"]
        metadata = data["metadata"]

        embedding = embedding_model.encode(text).tolist()

        collection.add(
            documents=[text],
            embeddings=[embedding],
            ids=[f"chunk_{i}"],
            metadatas=[metadata]
        )

        print(f"Stored chunk {i}")

    print("✅ All embeddings stored successfully!")


if __name__ == "__main__":
    store_embeddings()
