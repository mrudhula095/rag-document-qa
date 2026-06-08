# DocRAG — RAG-based Document Q&A System

A full-stack Retrieval-Augmented Generation (RAG) application. Upload PDFs, text, or markdown files and ask questions — DocRAG chunks, embeds, and retrieves relevant context before generating precise, source-cited answers.

![Tech Stack](https://img.shields.io/badge/Python-3.11-blue) ![Flask](https://img.shields.io/badge/Flask-3.0-lightgrey) ![React](https://img.shields.io/badge/React-18-61dafb) ![LangChain](https://img.shields.io/badge/LangChain-0.2-green) ![ChromaDB](https://img.shields.io/badge/ChromaDB-0.5-orange) ![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5-412991)

---

## Architecture

```
User Query
    │
    ▼
React Frontend  ──────────────────────►  Flask Backend
(Upload UI + Chat)                            │
                                    ┌─────────┴─────────┐
                                    │                   │
                               LangChain           ChromaDB
                            (PDF loading,        (Vector Store)
                             chunking,                │
                             embedding)        Cosine Similarity
                                    │               Search
                                    └─────────┬─────────┘
                                              │
                                         Top-K Chunks
                                              │
                                          OpenAI LLM
                                        (GPT-3.5-turbo)
                                              │
                                     Grounded Answer
                                      with Citations
```

## Features

- **Multi-format support** — PDF, TXT, Markdown, DOCX
- **Real embeddings** — OpenAI `text-embedding-3-small` for semantic search
- **Persistent vector store** — ChromaDB with cosine similarity
- **LangChain pipeline** — `RecursiveCharacterTextSplitter` for smart chunking
- **Multi-turn chat** — conversation history maintained per session
- **Source citations** — every answer links back to source chunks + page numbers
- **Document filtering** — select specific docs to query
- **Token tracking** — see exactly how many tokens each query used
- **Docker support** — one command to run the full stack

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- OpenAI API key → [platform.openai.com](https://platform.openai.com)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/rag-document-qa.git
cd rag-document-qa
```

### 2. Backend setup
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
nano .env

python app.py
# → Running on http://localhost:5000
```

### 3. Frontend setup (new terminal)
```bash
cd frontend
npm install
cp .env.example .env
npm start
# → Running on http://localhost:3000
```

### Using Docker (optional)
```bash
cp backend/.env.example .env
# Add your OPENAI_API_KEY to .env

docker-compose up --build
# Frontend → http://localhost:3000
# Backend  → http://localhost:5000
```

---

## API Reference

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/documents/upload` | Upload a file (multipart/form-data) |
| `GET`  | `/api/documents/` | List all indexed documents |
| `DELETE` | `/api/documents/<doc_id>` | Delete a document and its chunks |

### Query

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/query/` | Full RAG query (retrieval + generation) |
| `POST` | `/api/query/retrieve` | Retrieval only (no LLM, for debugging) |
| `GET`  | `/api/health` | Health check |

#### Example query request
```json
POST /api/query/
{
  "query": "What are the main findings?",
  "top_k": 5,
  "doc_ids": ["optional-filter-by-doc-id"],
  "history": [
    {"role": "user", "content": "previous question"},
    {"role": "assistant", "content": "previous answer"}
  ]
}
```

---

## Project Structure

```
rag-document-qa/
├── backend/
│   ├── app.py                  # Flask app factory
│   ├── config.py               # All config via env vars
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example
│   ├── routes/
│   │   ├── documents.py        # Upload / list / delete endpoints
│   │   └── query.py            # Query + retrieve endpoints
│   └── services/
│       ├── document_service.py # Load → chunk → embed → store
│       └── query_service.py    # Retrieve → build context → generate
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Root component + layout
│   │   ├── components/
│   │   │   ├── DocumentSidebar.jsx   # File upload + doc list
│   │   │   ├── PipelineBar.jsx       # Animated RAG pipeline
│   │   │   ├── ChatMessage.jsx       # Message bubbles + sources
│   │   │   └── ChatInput.jsx         # Query input + chips
│   │   ├── hooks/
│   │   │   ├── useDocuments.js       # Document state + upload
│   │   │   └── useChat.js            # Chat state + history
│   │   └── utils/
│   │       └── api.js                # Axios API client
│   ├── public/index.html
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Configuration

All backend config is via environment variables (see `backend/.env.example`):

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | — | **Required.** Your OpenAI API key |
| `LLM_MODEL` | `gpt-3.5-turbo` | LLM model for generation |
| `EMBEDDING_MODEL` | `text-embedding-3-small` | OpenAI embedding model |
| `CHUNK_SIZE` | `500` | Characters per chunk |
| `CHUNK_OVERLAP` | `100` | Overlap between chunks |
| `TOP_K_RESULTS` | `5` | Chunks to retrieve per query |
| `CHROMA_PERSIST_DIR` | `./chroma_db` | Where ChromaDB stores data |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, react-dropzone, react-markdown, Axios |
| Backend | Python 3.11, Flask, Flask-CORS |
| RAG Framework | LangChain 0.2 |
| Vector DB | ChromaDB (local persistent) |
| Embeddings | OpenAI text-embedding-3-small |
| LLM | OpenAI GPT-3.5-turbo |
| Document Parsing | pypdf, unstructured, docx2txt |
| Deployment | Docker, Docker Compose, Nginx, Gunicorn |

---

## License

MIT
