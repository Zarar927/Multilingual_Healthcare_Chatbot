import os
from pathlib import Path
from sentence_transformers import SentenceTransformer, util

# Load embedding model
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

# Get data folder relative to project root, not backend folder
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
DOC_FOLDER = os.path.join(ROOT_DIR, "data", "medical_knowledge")

documents = []
doc_texts = []

# Load medical knowledge documents from the medical_knowledge folder
if os.path.exists(DOC_FOLDER):
    chunk_files = sorted([f for f in os.listdir(DOC_FOLDER) if f.endswith(".txt")])
    print(f"Loading {len(chunk_files)} medical knowledge files from {DOC_FOLDER}")
    
    for file in chunk_files:
        path = os.path.join(DOC_FOLDER, file)
        try:
            with open(path, "r", encoding="utf-8") as f:
                text = f.read().strip()
            
            if text:  # Only add non-empty chunks
                documents.append(text)
                doc_texts.append(text)
        except Exception as e:
            print(f"Error loading {file}: {e}")
    
    print(f"Successfully loaded {len(documents)} chunks")
else:
    print(f"Warning: DOC_FOLDER '{DOC_FOLDER}' not found. Using fallback medical knowledge.")
    documents = ["Medical knowledge database not loaded. Please consult a healthcare professional."]
    doc_texts = documents

# Convert docs to embeddings
if doc_texts:
    doc_embeddings = model.encode(doc_texts, convert_to_tensor=True)
else:
    doc_embeddings = None


def retrieve(query, top_k=3):
    """
    Retrieve top_k most relevant chunks based on semantic similarity.
    Using top_k=3 since chunks are smaller than full documents.
    """
    if doc_embeddings is None:
        return documents if documents else ["Unable to retrieve medical knowledge. Please consult a healthcare professional."]

    query_embedding = model.encode(query, convert_to_tensor=True)

    hits = util.semantic_search(query_embedding, doc_embeddings, top_k=min(top_k, len(documents)))

    results = []

    for hit in hits[0]:
        results.append(documents[hit["corpus_id"]])

    return results