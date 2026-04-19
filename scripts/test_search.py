import chromadb
from sentence_transformers import SentenceTransformer

DB_PATH = "vectors/chroma_db"
COLLECTION_NAME = "who_medical_kb"

model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

client = chromadb.PersistentClient(path=DB_PATH)
collection = client.get_collection(name=COLLECTION_NAME)


def search(query):
    query_embedding = model.encode(query).tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3
    )

    print("\nTop Results:\n")
    for doc in results["documents"][0]:
        print(doc[:300])
        print("-----")


if __name__ == "__main__":
    query = input("Ask: ")
    search(query)
