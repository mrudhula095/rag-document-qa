import React, { useRef, useEffect } from "react";
import { ArrowUp, RotateCcw } from "lucide-react";

const SUGGESTIONS = [
  "Summarize the main points",
  "What are the key findings?",
  "List all topics covered",
  "What conclusions are drawn?",
];

export default function ChatInput({ onSend, onClear, isLoading, hasDocuments, hasMessages }) {
  const textareaRef = useRef(null);
  const [value, setValue] = React.useState("");

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [value]);

  const handleSend = () => {
    if (!value.trim() || isLoading || !hasDocuments) return;
    onSend(value.trim());
    setValue("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const canSend = value.trim().length > 0 && !isLoading && hasDocuments;

  return (
    <div style={styles.container}>
      {/* Suggestion chips — only when no messages yet */}
      {!hasMessages && hasDocuments && (
        <div style={styles.chips}>
          {SUGGESTIONS.map((s) => (
            <button key={s} style={styles.chip} onClick={() => setValue(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={styles.row}>
        <div style={{ ...styles.inputWrap, ...(isLoading ? styles.inputLoading : {}) }}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKey}
            placeholder={hasDocuments ? "Ask a question about your documents…" : "Upload documents to enable Q&A…"}
            disabled={!hasDocuments || isLoading}
            rows={1}
            style={styles.textarea}
          />
        </div>
        <div style={styles.btnCol}>
          <button onClick={handleSend} disabled={!canSend} style={{ ...styles.sendBtn, ...(!canSend ? styles.sendBtnDisabled : {}) }}>
            <ArrowUp size={16} />
          </button>
          {hasMessages && (
            <button onClick={onClear} style={styles.clearBtn} title="Clear chat">
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      <div style={styles.hint}>
        <span>{hasDocuments ? "Enter to send · Shift+Enter for newline" : "Upload at least one document to start"}</span>
        <span style={styles.modelBadge}>GPT-3.5-turbo · ChromaDB</span>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "12px 20px", borderTop: "0.5px solid rgba(255,255,255,0.07)", background: "#161820", flexShrink: 0 },
  chips: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  chip: { fontSize: 11, padding: "4px 12px", borderRadius: 20, border: "0.5px solid rgba(255,255,255,0.1)", cursor: "pointer", background: "#1e2028", color: "#7a7f8e", fontFamily: "'IBM Plex Mono', monospace", transition: "all 0.15s" },
  row: { display: "flex", gap: 8, alignItems: "flex-end" },
  inputWrap: { flex: 1, background: "#0e0f11", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 14px", transition: "border-color 0.2s" },
  inputLoading: { opacity: 0.6 },
  textarea: { width: "100%", background: "none", border: "none", outline: "none", color: "#e8e9ed", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, resize: "none", lineHeight: 1.5, maxHeight: 120, minHeight: 20 },
  btnCol: { display: "flex", flexDirection: "column", gap: 6 },
  sendBtn: { width: 36, height: 36, borderRadius: 8, background: "#5b9cf6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", transition: "all 0.15s" },
  sendBtnDisabled: { opacity: 0.4, cursor: "default" },
  clearBtn: { width: 36, height: 36, borderRadius: 8, background: "none", border: "0.5px solid rgba(255,255,255,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#7a7f8e" },
  hint: { marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 10, color: "#7a7f8e" },
  modelBadge: { background: "rgba(167,139,250,0.15)", color: "#a78bfa", padding: "2px 8px", borderRadius: 10, border: "0.5px solid rgba(167,139,250,0.3)" },
};
