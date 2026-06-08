from flask import Flask
from flask_cors import CORS
from routes.documents import documents_bp
from routes.query import query_bp
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

    app.register_blueprint(documents_bp, url_prefix="/api/documents")
    app.register_blueprint(query_bp, url_prefix="/api/query")

    @app.route("/api/health")
    def health():
        return {"status": "ok", "version": "1.0.0"}

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
