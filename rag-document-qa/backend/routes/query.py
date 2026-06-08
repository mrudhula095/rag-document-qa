from flask import Blueprint, request, jsonify, current_app
from services.query_service import retrieve_chunks, generate_answer

query_bp = Blueprint("query", __name__)


@query_bp.route("/", methods=["POST"])
def query():
    data = request.get_json()
    if not data or not data.get("query"):
        return jsonify({"error": "Missing 'query' field"}), 400

    user_query = data["query"].strip()
    if len(user_query) < 3:
        return jsonify({"error": "Query too short"}), 400

    doc_ids = data.get("doc_ids")  # optional filter by specific docs
    top_k = min(int(data.get("top_k", current_app.config["TOP_K_RESULTS"])), 10)
    conversation_history = data.get("history", [])

    try:
        chunks = retrieve_chunks(user_query, top_k=top_k, doc_ids=doc_ids)
        if not chunks:
            return jsonify({
                "answer": "No relevant content found. Please upload some documents first.",
                "sources": [],
                "tokens_used": {},
            })

        result = generate_answer(user_query, chunks, conversation_history)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@query_bp.route("/retrieve", methods=["POST"])
def retrieve_only():
    """Return raw retrieved chunks without LLM generation (for debugging)."""
    data = request.get_json()
    if not data or not data.get("query"):
        return jsonify({"error": "Missing 'query'"}), 400

    top_k = min(int(data.get("top_k", 5)), 10)
    doc_ids = data.get("doc_ids")

    try:
        chunks = retrieve_chunks(data["query"], top_k=top_k, doc_ids=doc_ids)
        return jsonify({"chunks": chunks, "count": len(chunks)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
