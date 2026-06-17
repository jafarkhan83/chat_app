import os
import pdfplumber
import chromadb
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()

# Load embedding model (downloads once, then cached)
print("Loading embedding model...")
model = SentenceTransformer("all-MiniLM-L6-v2")

# Connect to ChromaDB
client = chromadb.PersistentClient(path="./vectordb")
collection = client.get_or_create_collection(name="university")

# Extract text from a single PDF
def extract_text(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

# Chunk text with overlap
def chunk_text(text, chunk_size=500, overlap=50):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():  # skip empty chunks
            chunks.append(chunk)
        start += chunk_size - overlap
    return chunks

# Load all PDFs from pdfs/ folder
pdf_folder = "./pdfs"
pdf_files = [f for f in os.listdir(pdf_folder) if f.endswith(".pdf")]

if not pdf_files:
    print("No PDFs found in pdfs/ folder!")
else:
    for pdf_file in pdf_files:
        pdf_path = os.path.join(pdf_folder, pdf_file)
        print(f"Processing: {pdf_file}")

        text = extract_text(pdf_path)
        chunks = chunk_text(text)

        print(f"  → {len(chunks)} chunks created")

        embeddings = model.encode(chunks).tolist()

        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            collection.add(
                ids=[f"{pdf_file}_chunk_{i}"],
                documents=[chunk],
                embeddings=[embedding]
            )

        print(f"  → Stored in ChromaDB ✅")

print("\nAll PDFs ingested successfully!")
print(f"Total documents in DB: {collection.count()}")