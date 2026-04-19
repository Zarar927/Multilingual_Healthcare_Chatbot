import torch
from transformers import AutoTokenizer, AutoModel
from langdetect import detect
from deep_translator import GoogleTranslator


# --------------------------------
# Load Multilingual Transformer
# --------------------------------

MODEL_NAME = "xlm-roberta-base"

print("Loading multilingual model...")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME)

device = "cuda" if torch.cuda.is_available() else "cpu"
model = model.to(device)

print("Model loaded successfully on:", device)


# --------------------------------
# Language Detection
# --------------------------------

def detect_language(text):
    """
    Detect language of user query
    Returns: english / urdu / mixed / unknown
    """
    try:
        lang = detect(text)
        
        if lang == "ur":
            return "urdu"
        elif lang == "en":
            return "english"
        else:
            return "mixed"
    
    except Exception as e:
        print(f"Language detection error: {e}")
        return "unknown"


# --------------------------------
# Tokenization
# --------------------------------

def tokenize_text(text):
    """
    Tokenize input text for transformer
    """

    tokens = tokenizer(
        text,
        return_tensors="pt",
        padding=True,
        truncation=True
    )

    return tokens


# --------------------------------
# Generate Query Embedding
# --------------------------------

def get_query_embedding(text):
    """
    Convert user query into embedding vector
    """

    inputs = tokenizer(
        text,
        return_tensors="pt",
        padding=True,
        truncation=True
    ).to(device)

    with torch.no_grad():
        outputs = model(**inputs)

    embeddings = outputs.last_hidden_state.mean(dim=1)

    return embeddings


# --------------------------------
# Urdu / Mixed → English Translation
# --------------------------------

def translate_to_english(text):
    """
    Translate Urdu or mixed text into English
    """
    try:
        translated = GoogleTranslator(
            source="auto",
            target="en"
        ).translate(text)
        
        return translated if translated else text
    
    except Exception as e:
        print(f"Translation to English error: {e}")
        return text


# --------------------------------
# English → Urdu Translation
# --------------------------------

def translate_to_urdu(text):
    """
    Translate English response into Urdu
    """
    try:
        translated = GoogleTranslator(
            source="auto",
            target="ur"
        ).translate(text)
        
        return translated if translated else text
    
    except Exception as e:
        print(f"Translation to Urdu error: {e}")
        return text


# --------------------------------
# Test the Multilingual Module
# --------------------------------

if __name__ == "__main__":

    print("\nTesting Multilingual NLP Module\n")

    test_queries = [

        "bukhar symptoms kya hain?",
        "Headache aur bukhar ka treatment batao",
        "I have fever and headache",
        "mujhe bukhar hai kya karun"
    ]

    for query in test_queries:

        print("\n=============================")
        print("User Query:", query)

        # Language detection
        language = detect_language(query)
        print("Detected Language:", language)

        # Translate to English
        english_query = translate_to_english(query)
        print("Translated to English:", english_query)

        # Tokenization
        tokens = tokenize_text(english_query)
        print("Tokenized Input IDs:", tokens["input_ids"].shape)

        # Embedding
        embedding = get_query_embedding(english_query)
        print("Embedding Shape:", embedding.shape)

        # Translate back to Urdu
        urdu_text = translate_to_urdu(english_query)
        print("Urdu Translation:", urdu_text)

    print("\n✅ Multilingual module working successfully!")