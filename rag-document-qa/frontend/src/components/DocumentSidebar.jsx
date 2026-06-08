import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Trash2, Upload, CheckCircle, Loader, AlertCircle } from "lucide-react";

const ACCEPTED = { "application/pdf": [".pdf"], "text/plain": [".txt"], "text/markdown": [".md"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] };

export default function DocumentSidebar({ documents, uploadProgress, onUpload, onDelete, selectedIds, onToggleSelect }) {
  const [error, setError] = useState("");

  const onDrop = useCallback(async (accepted, rejected) => {
    setError("");
    if (rejected.length) { setError(`Unsupported file type`); return; }
    try { await onUpload(accepted); }
    catch (e) { setError(e.response?.data?.error || e.message); }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPTED, multiple: true,
  });

  const uploading = Object.entries(uploadProgress);

  return (
    <aside style={styles.sidebar}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Documents</span>
        <span style={styles.count}>{documents.length}</span>
      </div>

      {/* Drop zone */}
      <div {...getRootProps()} style={{ ...styles.dropzone, ...(isDragActive ? styles.dropzoneActive : {}) }}>
        <input {...getInputProps()} />
        <Upload size={18} color={isDragActive ? "#5b9cf6" : "#7a7f8e"} />
        <span style={styles.dropLabel}>
          {isDragActive ? "Drop files here" : "Upload PDF, TXT, MD, DOCX"}
        </span>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={12} /> {error}
        </div>
      )}

      {/* Uploading indicators */}
      {uploading.map(([name, pct]) => (
        <div key={name} style={styles.uploadingItem}>
          <Loader size={12} style={{ animation: "spin 1s linear infinite" }} />
          <span style={styles.uploadName}>{name}</span>
          <span style={styles.uploadPct}>{pct}%</span>
        </div>
      ))}

      {/* Document list */}
      <div style={styles.list}>
        {documents.length === 0 && !uploading.length ? (
          <div style={styles.empty}>No documents yet.<br />Upload to begin.</div>
        ) : (
          documents.map((doc) => {
            const isSelected = selectedIds.includes(doc.doc_id);
            return (
              <div
                key={doc.doc_id}
                style={{ ...styles.docItem, ...(isSelected ? styles.docItemSelected : {}) }}
                onClick={() => onToggleSelect(doc.doc_id)}
              >
                <FileText size={14} color={isSelected ? "#5b9cf6" : "#7a7f8e"} style={{ flexShrink: 0 }} />
                <div style={styles.docInfo}>
                  <div style={styles.docName}>{doc.filename}</div>
                  <div style={styles.docMeta}>{doc.chunk_count} chunks</div>
                </div>
                <div style={styles.docActions}>
                  <CheckCircle size={12} color={isSelected ? "#5b9cf6" : "transparent"} />
                  <button style={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); onDelete(doc.doc_id); }}>
                    <Trash2 size={12} color="#7a7f8e" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

const styles = {
  sidebar: { width: 260, background: "#161820", borderRight: "0.5px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" },
  header: { padding: "14px 16px 10px", borderBottom: "0.5px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#7a7f8e" },
  count: { background: "rgba(91,156,246,0.15)", color: "#5b9cf6", fontSize: 11, padding: "2px 7px", borderRadius: 10, border: "0.5px solid rgba(91,156,246,0.3)" },
  dropzone: { margin: 10, padding: "16px 12px", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 8, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transition: "all 0.2s", background: "#1e2028" },
  dropzoneActive: { borderColor: "#5b9cf6", background: "rgba(91,156,246,0.08)" },
  dropLabel: { fontSize: 11, color: "#7a7f8e", textAlign: "center", lineHeight: 1.4 },
  errorBox: { margin: "0 10px 6px", background: "rgba(228,77,77,0.1)", border: "0.5px solid rgba(228,77,77,0.3)", borderRadius: 6, padding: "6px 10px", fontSize: 11, color: "#f87171", display: "flex", alignItems: "center", gap: 5 },
  uploadingItem: { margin: "0 10px 4px", display: "flex", alignItems: "center", gap: 7, padding: "6px 10px", background: "rgba(91,156,246,0.07)", borderRadius: 6, fontSize: 11, color: "#7a7f8e" },
  uploadName: { flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  uploadPct: { color: "#5b9cf6", fontWeight: 500 },
  list: { flex: 1, overflowY: "auto", padding: "6px 10px" },
  empty: { color: "#7a7f8e", fontSize: 11, textAlign: "center", padding: "20px 10px", lineHeight: 1.6 },
  docItem: { display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, cursor: "pointer", marginBottom: 4, border: "0.5px solid transparent", transition: "all 0.15s" },
  docItemSelected: { background: "rgba(91,156,246,0.1)", borderColor: "rgba(91,156,246,0.3)" },
  docInfo: { flex: 1, minWidth: 0 },
  docName: { fontSize: 11, fontWeight: 500, color: "#e8e9ed", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  docMeta: { fontSize: 10, color: "#7a7f8e", marginTop: 2 },
  docActions: { display: "flex", alignItems: "center", gap: 4 },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", padding: 2, opacity: 0.6, transition: "opacity 0.15s" },
};
