# BUITEMS Information Bot

A RAG (Retrieval Augmented Generation) based chatbot that answers questions about BUITEMS using a pre-built vector database.

## Tech Stack

- **Embeddings** - Sentence Transformers (free, local)
- **Vector Database** - ChromaDB (free, local)
- **LLM** - Groq API (free)
- **Backend** - FastAPI
- **Frontend** - HTML, CSS, JavaScript

## Project Structure

BUITEMS_Information_Bot/

├── pdfs/              # Add your university PDFs here

├── vectordb/          # Pre-built ChromaDB containing BUITEMS information.

├── frontend/

│   └── vendor/

        └── FontAwesome 5.15.4/  # download it from fontawesome.com

│   ├── index.html

│   ├── style.css

│   └── script.js

├── ingest.py          # Run once to load PDFs

├── retriever.py       # Searches vector DB

├── main.py            # FastAPI backend

├── .env               # Your Groq API key -> i am not going to share it get your own api Gndo.

├── requirements.txt

└── README.md

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/rag-chatbot.git
cd rag-chatbot
```

### 2. Create virtual environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Add your Groq API key
Create a `.env` file in the root folder:
Get your free API key at https://console.groq.com
and put that api here in this file 

### 5. Add your PDFs
Drop your university PDF files inside the `pdfs/` folder.

### 6. (Optional) Ingest PDFs

The vector database is already created and contains information about the BUITEMS overview, faculties, admission, scholarships, fee structure, and all departments.

You only need to run the `ingest.py` script if you add new or different PDF files to the `pdfs/` folder.

```bash
python ingest.py
```
Run this only once. If you add new PDFs later, run it again.

### 7. Start the server
```bash
uvicorn main:app --reload
```

### 8. Open the chatbot
Open your browser and go to: