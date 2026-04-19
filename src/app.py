# import chromadb
# from sentence_transformers import SentenceTransformer
# from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
# import torch

# # --------------------------------
# # Device (CPU / GPU)
# # --------------------------------
# device = "cuda" if torch.cuda.is_available() else "cpu"

# # --------------------------------
# # Load embedding model
# # --------------------------------
# embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# # --------------------------------
# # Load ChromaDB
# # --------------------------------
# client = chromadb.PersistentClient(path="vectors/chroma_db")
# collection = client.get_collection("who_medical_kb")

# # --------------------------------
# # Load FLAN-T5
# # --------------------------------
# MODEL_NAME = "google/flan-t5-base"  # or flan-t5-small if system is weak
# tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
# model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME).to(device)

# # --------------------------------
# # Retrieve relevant chunks
# # --------------------------------
# def retrieve_chunks(query, top_k=3):
#     query_emb = embedding_model.encode(query).tolist()
#     results = collection.query(
#         query_embeddings=[query_emb],
#         n_results=top_k
#     )
#     return results["documents"][0]

# # --------------------------------
# # Generate answer
# # --------------------------------
# def generate_answer(query, top_k=3):
#     chunks = retrieve_chunks(query, top_k)
#     context = " ".join(chunks)

#     prompt = f"""
# Answer the question using ONLY the context below. Use clear, concise language.

# Context:
# {context}

# Question:
# {query}

# Answer:
# """

#     # Tokenize input
#     inputs = tokenizer(
#         prompt,
#         return_tensors="pt",
#         truncation=True,
#         max_length=1024
#     )

#     # Move tensors to device
#     inputs = {k: v.to(device) for k, v in inputs.items()}

#     # Generate output
#     outputs = model.generate(
#         **inputs,
#         max_new_tokens=200,
#         do_sample=True,      # True allows more natural paraphrased answers
#         temperature=0.7,     # Controls creativity
#         top_p=0.9,           # Nucleus sampling for better quality
#         eos_token_id=tokenizer.eos_token_id
#     )

#     # Decode output
#     answer = tokenizer.decode(outputs[0], skip_special_tokens=True)
#     return answer

# # --------------------------------
# # Chat loop
# # --------------------------------
# if __name__ == "__main__":
#     print("\n🩺 Medical Chatbot (FLAN-T5)")
#     print("Type 'exit' to quit\n")

#     while True:
#         user_input = input("Ask a medical question: ")
#         if user_input.lower() in ["exit", "quit"]:
#             break

#         response = generate_answer(user_input)
#         print("\nChatbot:", response)



import chromadb
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import re

# --------------------------------
# Device (CPU / GPU)
# --------------------------------
device = "cuda" if torch.cuda.is_available() else "cpu"

# --------------------------------
# Load multilingual embedding model
# --------------------------------
embedding_model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

# --------------------------------
# Load ChromaDB
# --------------------------------
client = chromadb.PersistentClient(path="vectors/chroma_db")
collection = client.get_collection("who_medical_kb")

# --------------------------------
# Load FLAN-T5 model
# --------------------------------
MODEL_NAME = "google/flan-t5-base"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME).to(device)

# --------------------------------
# Language Detection
# --------------------------------
def detect_language(text):

    if re.search(r'[\u0600-\u06FF]', text):
        return "urdu"

    roman_words = [
        "kya", "hai", "ilaj", "bukhar", "dard",
        "malaria", "zukaam", "dawai", "kaise", "kyun"
    ]

    for word in roman_words:
        if word in text.lower():
            return "roman_urdu"

    return "english"


# --------------------------------
# Clean retrieved context
# --------------------------------
def clean_context(text):
    text = re.sub(r"\(.*?\)", "", text)
    text = re.sub(r"\[.*?\]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


# --------------------------------
# Retrieve relevant chunks
# --------------------------------
def retrieve_chunks(query, top_k=3):

    query_embedding = embedding_model.encode(query).tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    if not results or len(results["documents"]) == 0:
        return []

    chunks = results["documents"][0]

    cleaned_chunks = [clean_context(c) for c in chunks]

    return cleaned_chunks


# --------------------------------
# Generate Answer
# --------------------------------
def generate_answer(query):

    chunks = retrieve_chunks(query)

    if len(chunks) == 0:
        return "I could not find medical information related to your question."

    # Use limited context (very important)
    context = " ".join(chunks[:2])

    language = detect_language(query)

    if language == "urdu":
        instruction = "جواب آسان اردو میں دیں۔"
    elif language == "roman_urdu":
        instruction = "Answer in simple Roman Urdu."
    else:
        instruction = "Answer in simple English."

    prompt = f"""
You are a helpful medical assistant.

Rules:
- Use the provided context only
- Explain in simple words
- Do not show author names or references
- Give useful advice for a patient
- {instruction}

Context:
{context}

Question:
{query}

Answer:
"""

    inputs = tokenizer(
        prompt,
        return_tensors="pt",
        truncation=True,
        max_length=1024
    )

    inputs = {k: v.to(device) for k, v in inputs.items()}

    outputs = model.generate(
        **inputs,
        max_new_tokens=150,
        temperature=0.3,
        do_sample=True
    )

    answer = tokenizer.decode(outputs[0], skip_special_tokens=True)

    return answer


# --------------------------------
# Chat Loop
# --------------------------------
if __name__ == "__main__":

    print("\n🩺 Multilingual Medical Chatbot")
    print("Supports: English | Urdu | Roman Urdu")
    print("Type 'exit' to quit\n")

    while True:
        user_input = input("Ask a medical question: ")

        if user_input.lower() in ["exit", "quit"]:
            break

        response = generate_answer(user_input)

        print("\nChatbot:", response)