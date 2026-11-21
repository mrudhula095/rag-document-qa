# DocRAG: Document Q&A with Retrieval-Augmented Generation

<p align="center">
  <a href="https://rag-document-qa-tqwc.vercel.app">
    <img src="https://img.shields.io/badge/%F0%9F%9A%80%20LIVE%20APP-Open%20DocRAG-brightgreen?style=for-the-badge" alt="Open the live app" />
  </a>
</p>

## 🔗 Live App (main link): https://rag-document-qa-tqwc.vercel.app

Open the link above to use the app. Upload a document and start asking questions.

Backend API (for reference, not the app): https://docrag-backend2.onrender.com/api/health

---

Upload PDF, TXT, Markdown or DOCX files and ask questions about them in plain language. DocRAG splits each document into chunks, converts them to vector embeddings, retrieves the most relevant passages for your question, and has an LLM answer using only that retrieved context, with source citations.

> **Note on the live demo:** the backend runs on a free hosting tier. If the app has been idle, the first request can take up to a minute while the server wakes up. Uploaded documents are not kept permanently and may be cleared when the server restarts.

---

## How it works

```
Upload file -> Load -> Chunk -> Embed -> Store in ChromaDB
                                              |
Question -> Embed query -> Vector search -> Top-k chunks -> LLM -> Answer + sources
```

1. **Load:** LangChain loaders read PDF, TXT, MD and DOCX files.
2. **Chunk:** `RecursiveCharacterTextSplitter` splits text into overlapping chunks (500 characters with 100 overlap by default, configurable).
3. **Embed:** chunks are embedded locally with `all-MiniLM-L6-v2` through `fastembed` (ONNX, runs on CPU with low memory).
4. **Store and search:** vectors are stored in ChromaDB and searched by cosine similarity.
5. **Generate:** the top matching chunks are passed to an LLM through an OpenAI-compatible API, with instructions to answer only from the provided context and to cite sources.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Axios, react-dropzone, react-markdown |
| Backend | Python, Flask, Flask-CORS, Gunicorn |
| RAG pipeline | LangChain (loaders and text splitting) |
| Embeddings | fastembed with `sentence-transformers/all-MiniLM-L6-v2` |
| Vector store | ChromaDB (persistent, cosine similarity) |
| LLM | OpenAI-compatible chat API (configured for Groq, model set by environment variable) |
| Deployment | Vercel (frontend), Render (backend) |

## Project structure

```
rag-document-qa/
├── backend/
│   ├── app.py                  # Flask app factory, CORS, routes
│   ├── config.py               # Settings read from environment variables
│   ├── routes/                 # documents and query endpoints
│   ├── services/
│   │   ├── document_service.py # load, chunk, embed, store, list, delete
│   │   ├── embeddings.py       # fastembed wrapper
│   │   └── query_service.py    # retrieval and answer generation
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                   # React app
├── docker-compose.yml
└── README.md
```

## API

Base path: `/api`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/documents/` | List uploaded documents |
| POST | `/api/documents/upload` | Upload and index a document |
| POST | `/api/query/...` | Ask a question (see `backend/routes/query.py`) |

## Run locally

### Prerequisites
- Python 3.11
- Node.js 18 or newer
- An API key for an OpenAI-compatible LLM provider (for example a free Groq key from console.groq.com)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your values:

```
OPENAI_API_KEY=your_provider_api_key
LLM_MODEL=your_model_name
```

Then start the server:

```bash
python app.py
```

The API runs at http://localhost:5000.

### Frontend

```bash
cd frontend
npm install
npm start
```

The app runs at http://localhost:3000 and proxies API calls to the backend on port 5000.

## Configuration

Backend environment variables:

| Variable | Purpose | Default |
|---|---|---|
| `OPENAI_API_KEY` | API key for the LLM provider | none (required) |
| `LLM_MODEL` | Chat model name | see `config.py` |
| `LLM_BASE_URL` | OpenAI-compatible endpoint | `https://api.groq.com/openai/v1` |
| `ALLOWED_ORIGINS` | Comma-separated list of frontend origins allowed by CORS | `http://localhost:3000,http://127.0.0.1:3000` |
| `CHUNK_SIZE` | Characters per chunk | `500` |
| `CHUNK_OVERLAP` | Overlap between chunks | `100` |
| `TOP_K_RESULTS` | Chunks retrieved per question | `5` |
| `CHROMA_PERSIST_DIR` | ChromaDB storage folder | `./chroma_db` |
| `UPLOAD_FOLDER` | Uploaded files folder | `./uploads` |

Frontend environment variable:

| Variable | Purpose |
|---|---|
| `REACT_APP_API_URL` | Base URL of the backend API, for example `https://your-backend.onrender.com/api` |

## Deployment

- **Backend (Render):** root directory `backend`, build command `pip install -r requirements.txt`, start command `gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --threads 4 --timeout 180`. Set `OPENAI_API_KEY`, `LLM_MODEL` and `ALLOWED_ORIGINS` in the service environment.
- **Frontend (Vercel):** root directory `frontend`, framework Create React App. Set `REACT_APP_API_URL` to the backend URL ending in `/api`.

## Known limitations

- The free hosting tier sleeps when idle, so the first request after a break is slow.
- Storage on the free tier is temporary, so indexed documents can disappear when the server restarts.
- Answer quality depends on the chosen LLM and on how well the question matches the uploaded text.

## Author

**Mrudhula**
Final-year B.Tech student, Electronics and Communication Engineering, IIIT Jabalpur
GitHub: https://github.com/mrudhula095
