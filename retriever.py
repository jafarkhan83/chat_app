import chromadb
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

client = chromadb.PersistentClient(path="./vectordb")
collection = client.get_collection(name="buitems")

def retrieve(question, top_k=3):
    question_embedding = model.encode([question]).tolist()

    results = collection.query(
        query_embeddings=question_embedding,
        n_results=top_k
    )

    chunks = results["documents"][0]
    return chunks