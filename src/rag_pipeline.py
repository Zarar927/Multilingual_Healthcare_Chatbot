# import os
# import chromadb
# from sentence_transformers import SentenceTransformer

# # Paths
# CHUNK_DIR = "data/knowledge_base/chunks"
# VECTOR_DIR = "vectors/chroma_db"

# os.makedirs(VECTOR_DIR, exist_ok=True)

# # Load embedding model
# embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# # Initialize ChromaDB
# client = chromadb.PersistentClient(path=VECTOR_DIR)
# collection = client.get_or_create_collection(name="who_medical_kb")


# def store_embeddings():
#     for filename in os.listdir(CHUNK_DIR):
#         if filename.endswith(".txt"):
#             file_path = os.path.join(CHUNK_DIR, filename)
#             with open(file_path, "r", encoding="utf-8") as f:
#                 text = f.read()

#             embedding = embedding_model.encode(text).tolist()

#             collection.add(
#                 documents=[text],
#                 embeddings=[embedding],
#                 ids=[filename],
#                 metadatas=[{"source": filename}]
#             )

#             print(f"Stored embedding: {filename}")


# if __name__ == "__main__":
#     store_embeddings()


import os
import chromadb
from sentence_transformers import SentenceTransformer

# --------------------------------
# Paths
# --------------------------------
CHUNK_DIR = "data/medical_knowledge"
VECTOR_DIR = "vectors/chroma_db"

os.makedirs(VECTOR_DIR, exist_ok=True)

# --------------------------------
# Multilingual embedding model
# Supports Urdu + Roman Urdu
# --------------------------------
embedding_model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

# --------------------------------
# Initialize ChromaDB
# --------------------------------
client = chromadb.PersistentClient(path=VECTOR_DIR)
collection = client.get_or_create_collection(name="who_medical_kb")


def store_embeddings():

    files = [f for f in os.listdir(CHUNK_DIR) if f.endswith(".txt")]

    if len(files) == 0:
        print("❌ No chunk files found in:", CHUNK_DIR)
        return

    print("Total chunk files found:", len(files))
    print("Starting embedding process...\n")

    for i, filename in enumerate(files):

        file_path = os.path.join(CHUNK_DIR, filename)

        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read().strip()

        if not text:
            continue

        embedding = embedding_model.encode(text).tolist()
        doc_id = filename

        # Correct duplicate check
        existing = collection.get(ids=[doc_id])

        if existing["ids"]:
            print(f"Skipped (already exists): {filename}")
            continue

        # Store embedding
        collection.add(
            documents=[text],
            embeddings=[embedding],
            ids=[doc_id],
            metadatas=[{
                "source": filename,
                "type": "who_medical_guideline"
            }]
        )

        print(f"Stored embedding {i+1}/{len(files)}: {filename}")

    print("\n✅ All embeddings stored successfully!")


if __name__ == "__main__":
    store_embeddings()