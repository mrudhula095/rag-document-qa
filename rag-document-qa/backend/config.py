import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-prod")
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB upload limit

    # OpenAI / LLM
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    LLM_MODEL = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
    EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")

    # ChromaDB
    CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
    CHROMA_COLLECTION = os.getenv("CHROMA_COLLECTION", "documents")

    # Chunking
    CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "500"))
    CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "100"))
    TOP_K_RESULTS = int(os.getenv("TOP_K_RESULTS", "5"))

    # Uploads
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "./uploads")
    ALLOWED_EXTENSIONS = {"pdf", "txt", "md", "docx"}
