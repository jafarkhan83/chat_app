import os
import pdfplumber
import chromadb
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()

print("Loading embedding model...")
model = SentenceTransformer("all-MiniLM-L6-v2")

client = chromadb.PersistentClient(path="./vectordb")
collection = client.get_or_create_collection(name="buitems")

def extract_text(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                cleaned = "\n".join([
                    line.strip() for line in page_text.splitlines()
                    if line.strip()
                ])
                text += cleaned + "\n"
    return text

def chunk_text(text, chunk_size=800, overlap=100):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk)
        start += chunk_size - overlap
    return chunks

# All PDFs in one folder
pdf_folder = "./pdfs"
all_pdfs = [
    os.path.join(pdf_folder, f)
    for f in os.listdir(pdf_folder)
    if f.endswith(".pdf")
]

print(f"Found {len(all_pdfs)} PDFs\n")

if not all_pdfs:
    print("No PDFs found in pdfs/ folder!")
else:
    for idx, pdf_path in enumerate(all_pdfs, 1):
        print(f"[{idx}/{len(all_pdfs)}] Processing: {os.path.basename(pdf_path)}")

        text = extract_text(pdf_path)

        if not text.strip():
            print(f"  ⚠️  No text found, skipping\n")
            continue

        chunks = chunk_text(text)
        print(f"  → {len(chunks)} chunks created")

        embeddings = model.encode(
            chunks,
            batch_size=32,
            show_progress_bar=False
        ).tolist()

        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            collection.add(
                ids=[f"{os.path.basename(pdf_path)}_chunk_{i}"],
                documents=[chunk],
                embeddings=[embedding]
            )

        print(f"  → Stored ✅\n")

print("=" * 50)
print("All PDFs ingested successfully!")
print(f"Total chunks in DB: {collection.count()}")