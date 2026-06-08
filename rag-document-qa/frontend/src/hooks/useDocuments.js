import { useState, useEffect, useCallback } from "react";
import { fetchDocuments, uploadDocument, deleteDocument } from "../utils/api";

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to load documents:", err);
    }
  }, []);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const upload = useCallback(async (files) => {
    const results = [];
    for (const file of files) {
      const fileKey = file.name;
      setUploadProgress((p) => ({ ...p, [fileKey]: 0 }));
      try {
        const data = await uploadDocument(file, (pct) => {
          setUploadProgress((p) => ({ ...p, [fileKey]: pct }));
        });
        results.push(data.document);
        setUploadProgress((p) => {
          const next = { ...p };
          delete next[fileKey];
          return next;
        });
      } catch (err) {
        setUploadProgress((p) => {
          const next = { ...p };
          delete next[fileKey];
          return next;
        });
        throw err;
      }
    }
    await loadDocuments();
    return results;
  }, [loadDocuments]);

  const remove = useCallback(async (docId) => {
    await deleteDocument(docId);
    setDocuments((d) => d.filter((doc) => doc.doc_id !== docId));
  }, []);

  return { documents, loading, uploadProgress, upload, remove, reload: loadDocuments };
}
