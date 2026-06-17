from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from retriever import retrieve
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Request body
class Question(BaseModel):
    question: str

# Chat history (in memory)
chat_history = []

@app.post("/ask")
def ask(body: Question):
    question = body.question

    # Step 1 - Get relevant chunks from ChromaDB
    chunks = retrieve(question)
    context = "\n\n".join(chunks)

    # Step 2 - Build the prompt
    system_prompt = """You are a helpful university assistant.
Answer questions using only the context provided.
If the answer is not in the context, say 'I don't have that information.'
Keep answers clear and concise."""

    # Step 3 - Add to chat history
    chat_history.append({"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"})

    # Step 4 - Send to Groq
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            *chat_history
        ],
        max_tokens=1024,
        temperature=0.5
    )

    answer = response.choices[0].message.content

    # Step 5 - Save assistant response to history
    chat_history.append({"role": "assistant", "content": answer})

    return {"answer": answer}

# Serve frontend
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

@app.get("/")
def root():
    return FileResponse("frontend/index.html")