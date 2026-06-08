from typing import List, Dict, Any, Optional
from openai import OpenAI
from langchain_huggingface import HuggingFaceEmbeddings
from flask import current_app
from .document_service import get_collection


def embed_query(query: str) -> List[float]:
    embeddings_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)
    return embeddings_model.embed_query(query)


def retrieve_chunks(
    query: str,
    top_k: int = 5,
    doc_ids: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """Embed query and retrieve top-k similar chunks from ChromaDB."""
    collection = get_collection()
    query_embedding = embed_query(query)

    where = {"doc_id": {"$in": doc_ids}} if doc_ids else None

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"],
        where=where,
    )

    chunks = []
    docs_list = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    for text, meta, dist in zip(docs_list, metas, distances):
        similarity = 1 - dist  # cosine distance → similarity
        chunks.append({
            "text": text,
            "filename": meta.get("filename", ""),
            "doc_id": meta.get("doc_id", ""),
            "chunk_index": meta.get("chunk_index", 0),
            "page": meta.get("page", 0),
            "similarity": round(similarity, 4),
        })

    return chunks


def build_context(chunks: List[Dict[str, Any]]) -> str:
    parts = []
    for i, chunk in enumerate(chunks, 1):
        parts.append(
            f"[Source {i}: {chunk['filename']} | Page {chunk['page']} | "
            f"Similarity: {chunk['similarity']:.2%}]\n{chunk['text']}"
        )
    return "\n\n---\n\n".join(parts)


def generate_answer(
    query: str,
    chunks: List[Dict[str, Any]],
    conversation_history: Optional[List[Dict]] = None,
) -> Dict[str, Any]:
    """Generate an answer using retrieved context and the LLM."""
    client = OpenAI(api_key=current_app.config["OPENAI_API_KEY"])
    context = build_context(chunks)

    system_prompt = f"""You are DocRAG, an expert document Q&A assistant.
Answer the user's question using ONLY the context provided below.
Always cite which source(s) you used (e.g. "According to Source 2...").
If the answer is not in the context, say: "I couldn't find this in the uploaded documents."
Be concise, accurate, and helpful.

RETRIEVED CONTEXT:
{context}"""

    messages = [{"role": "system", "content": system_prompt}]
    if conversation_history:
        messages.extend(conversation_history[-6:])  # last 3 turns
    messages.append({"role": "user", "content": query})

    response = client.chat.completions.create(
        model=current_app.config["LLM_MODEL"],
        messages=messages,
        temperature=0.2,
        max_tokens=1024,
    )

    answer = response.choices[0].message.content
    usage = response.usage

    return {
        "answer": answer,
        "sources": chunks,
        "tokens_used": {
            "prompt": usage.prompt_tokens,
            "completion": usage.completion_tokens,
            "total": usage.total_tokens,
        },
        "model": current_app.config["LLM_MODEL"],
    }
