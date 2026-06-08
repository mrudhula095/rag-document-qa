import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from services.document_service import (
    process_and_store,
    list_documents,
    delete_document,
    file_hash,
)

documents_bp = Blueprint("documents", __name__)


def allowed_file(filename: str) -> bool:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in current_app.config["ALLOWED_EXTENSIONS"]


@documents_bp.route("/upload", methods=["POST"])
def upload_document():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"error": "Empty filename"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": f"Unsupported file type. Allowed: pdf, txt, md, docx"}), 400

    upload_dir = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_dir, exist_ok=True)

    filename = secure_filename(file.filename)
    doc_id = str(uuid.uuid4())
    save_path = os.path.join(upload_dir, f"{doc_id}_{filename}")
    file.save(save_path)

    try:
        result = process_and_store(save_path, filename, doc_id)
        return jsonify({"success": True, "document": result}), 201
    except Exception as e:
        os.remove(save_path)
        return jsonify({"error": str(e)}), 500


@documents_bp.route("/", methods=["GET"])
def get_documents():
    try:
        docs = list_documents()
        return jsonify({"documents": docs, "count": len(docs)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@documents_bp.route("/<doc_id>", methods=["DELETE"])
def remove_document(doc_id: str):
    try:
        removed = delete_document(doc_id)
        return jsonify({"success": True, "chunks_removed": removed})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
