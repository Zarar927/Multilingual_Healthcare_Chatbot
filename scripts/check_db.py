import chromadb

client = chromadb.PersistentClient(path="vectors/chroma_db")

collection = client.get_collection("who_medical_kb")

count = collection.count()

print("Total documents in ChromaDB:", count)