import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
  timeout: 60000,
});

// ── Documents ─────────────────────────────────────────────────────────────────

export const uploadDocument = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });
  return res.data;
};

export const fetchDocuments = async () => {
  const res = await api.get("/documents/");
  return res.data.documents;
};

export const deleteDocument = async (docId) => {
  const res = await api.delete(`/documents/${docId}`);
  return res.data;
};

// ── Query ─────────────────────────────────────────────────────────────────────

export const queryDocuments = async ({ query, docIds, topK = 5, history = [] }) => {
  const res = await api.post("/query/", {
    query,
    doc_ids: docIds,
    top_k: topK,
    history,
  });
  return res.data;
};

export const retrieveChunks = async ({ query, docIds, topK = 5 }) => {
  const res = await api.post("/query/retrieve", { query, doc_ids: docIds, top_k: topK });
  return res.data.chunks;
};

export const checkHealth = async () => {
  const res = await api.get("/health");
  return res.data;
};
