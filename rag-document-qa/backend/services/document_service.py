import os
import uuid
import hashlib
from pathlib import Path
from typing import List, Dict, Any

import chromadb
from chromadb.config import Settings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from services.embeddings import embed_documents
from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    Docx2txtLoader,
)
from flask import current_app


def get_chroma_client():
    persist_dir = current_app.config["CHROMA_PERSIST_DIR"]
    os.makedirs(persist_dir, exist_ok=True)
    return chromadb.PersistentClient(path=persist_dir)


def get_collection():
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=current_app.config["CHROMA_COLLECTION"],
        metadata={"hnsw:space": "cosine"},
    )





def load_document(file_path: str, filename: str) -> List[Any]:
    """Load document using appropriate LangChain loader."""
    ext = Path(filename).suffix.lower()
    loaders = {
        ".pdf": PyPDFLoader,
        ".txt": TextLoader,
        ".md": TextLoader,
        ".docx": Docx2txtLoader,
    }
    loader_cls = loaders.get(ext)
    if not loader_cls:
        raise ValueError(f"Unsupported file type: {ext}")
    loader = loader_cls(file_path)
    return loader.load()


def chunk_documents(docs: List[Any], chunk_size: int, chunk_overlap: int) -> List[Any]:
    """Split documents into overlapping chunks using LangChain splitter."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    return splitter.split_documents(docs)


def file_hash(file_path: str) -> str:
    h = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def process_and_store(file_path: str, filename: str, doc_id: str) -> Dict[str, Any]:
    """Full pipeline: load → chunk → embed → store in ChromaDB."""
    # Load
    raw_docs = load_document(file_path, filename)

    # Chunk
    chunk_size = current_app.config["CHUNK_SIZE"]
    chunk_overlap = current_app.config["CHUNK_OVERLAP"]
    chunks = chunk_documents(raw_docs, chunk_size, chunk_overlap)

    if not chunks:
        raise ValueError("No text content found in document")

    # Embed
        # Embed
    texts = [c.page_content for c in chunks]
    embeddings = embed_documents(texts)

    # Store in ChromaDB
    collection = get_collection()
    ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
    metadatas = [
        {
            "doc_id": doc_id,
            "filename": filename,
            "chunk_index": i,
            "page": c.metadata.get("page", 0),
            "source": c.metadata.get("source", filename),
        }
        for i, c in enumerate(chunks)
    ]
    collection.add(ids=ids, embeddings=embeddings, documents=texts, metadatas=metadatas)

    return {
        "doc_id": doc_id,
        "filename": filename,
        "chunk_count": len(chunks),
        "total_chars": sum(len(t) for t in texts),
    }


def list_documents() -> List[Dict[str, Any]]:
    """List all unique documents in the vector store."""
    collection = get_collection()
    results = collection.get(include=["metadatas"])
    seen = {}
    for meta in results.get("metadatas") or []:
        did = meta.get("doc_id")
        if did and did not in seen:
            seen[did] = {
                "doc_id": did,
                "filename": meta.get("filename", "unknown"),
                "chunk_count": 0,
            }
        if did:
            seen[did]["chunk_count"] += 1
    return list(seen.values())


def delete_document(doc_id: str) -> int:
    """Delete all chunks for a given doc_id from ChromaDB."""
    collection = get_collection()
    results = collection.get(where={"doc_id": doc_id}, include=["metadatas"])
    ids = results.get("ids", [])
    if ids:
        collection.delete(ids=ids)
    return len(ids)
