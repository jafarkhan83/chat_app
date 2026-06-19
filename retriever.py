import chromadb
from sentence_transformers import SentenceTransformer
import re

model = SentenceTransformer("all-MiniLM-L6-v2")

client = chromadb.PersistentClient(path="./vectordb")
collection = client.get_collection(name="buitems")

def _extract_filename_and_clean_query(question):
    """
    Checks if a query contains a filename pattern like 'in file.pdf'.
    If found, it extracts the filename and returns a cleaned query for semantic search.
    Example: "What is the fee in fees.pdf?" -> ("fees.pdf", "What is the fee?")
    """
    # Regex to find patterns like "in/from/in the <filename>.pdf"
    pattern = r'\b(?:in|from|in the|from the)\s+([a-zA-Z0-9_\-]+\.pdf)\b'
    match = re.search(pattern, question, re.IGNORECASE)
    
    if match:
        filename = match.group(1)
        # Remove the matched part from the question to clean it up
        cleaned_question = re.sub(pattern, '', question, flags=re.IGNORECASE).strip()
        return filename, cleaned_question
    
    return None, question

def retrieve(question, top_k=8):
    filename_filter, cleaned_question = _extract_filename_and_clean_query(question)
    question_embedding = model.encode([cleaned_question]).tolist()

    where_clause = {"source": filename_filter} if filename_filter else None

    results = collection.query(
        query_embeddings=question_embedding,
        n_results=top_k,
        where=where_clause,
        include=["documents"],
    )

    chunks = results.get("documents", [[]])[0]
    return chunks