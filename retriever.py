import chromadb
from sentence_transformers import SentenceTransformer

# Load same model used in ingest.py
model = SentenceTransformer("all-MiniLM-L6-v2")

# Connect to existing ChromaDB
client = chromadb.PersistentClient(path="./vectordb")
collection = client.get_collection(name="university")

def retrieve(question, top_k=3):
    # Embed the question
    question_embedding = model.encode([question]).tolist()

    # Search ChromaDB
    results = collection.query(
        query_embeddings=question_embedding,
        n_results=top_k
    )

    # Return top matching chunks
    chunks = results["documents"][0]
    return chunks