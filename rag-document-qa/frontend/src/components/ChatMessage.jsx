import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ChevronDown, ChevronUp, FileText, Zap } from "lucide-react";

export default function ChatMessage({ message }) {
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === "user";

  return (
    <div style={{ ...styles.wrapper, ...(isUser ? styles.wrapperUser : {}) }}>
      <div style={styles.label}>
        {isUser ? "You" : "⧉ DocRAG"}
        {message.model && (
          <span style={styles.modelBadge}>{message.model}</span>
        )}
      </div>

      <div style={{
        ...styles.bubble,
        ...(isUser ? styles.bubbleUser : styles.bubbleAssistant),
        ...(message.isError ? styles.bubbleError : {}),
      }}>
        {isUser ? (
          <span style={styles.userText}>{message.content}</span>
        ) : (
          <div style={styles.markdownWrap}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Sources accordion */}
      {!isUser && message.sources?.length > 0 && (
        <div style={styles.sourcesContainer}>
          <button style={styles.sourcesToggle} onClick={() => setShowSources(!showSources)}>
            <FileText size={11} />
            {message.sources.length} source{message.sources.length !== 1 ? "s" : ""} retrieved
            {showSources ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>

          {showSources && (
            <div style={styles.sourcesList}>
              {message.sources.map((src, i) => (
                <div key={i} style={styles.sourceItem}>
                  <div style={styles.sourceHeader}>
                    <span style={styles.sourceNum}>{i + 1}</span>
                    <span style={styles.sourceFile}>{src.filename}</span>
                    {src.page > 0 && <span style={styles.sourcePage}>p.{src.page}</span>}
                    <span style={styles.sourceSim}>{(src.similarity * 100).toFixed(0)}% match</span>
                  </div>
                  <div style={styles.sourceText}>{src.text.slice(0, 200)}…</div>
                </div>
              ))}
            </div>
          )}

          {message.tokensUsed?.total && (
            <div style={styles.tokenBadge}>
              <Zap size={10} /> {message.tokensUsed.total} tokens
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", flexDirection: "column", gap: 4, maxWidth: 720, alignSelf: "flex-start", alignItems: "flex-start" },
  wrapperUser: { alignSelf: "flex-end", alignItems: "flex-end" },
  label: { fontSize: 10, color: "#7a7f8e", display: "flex", alignItems: "center", gap: 6 },
  modelBadge: { background: "rgba(167,139,250,0.15)", color: "#a78bfa", fontSize: 10, padding: "1px 7px", borderRadius: 10, border: "0.5px solid rgba(167,139,250,0.3)" },
  bubble: { padding: "10px 14px", borderRadius: 10, fontSize: 13, lineHeight: 1.6, maxWidth: 640 },
  bubbleUser: { background: "rgba(91,156,246,0.15)", border: "0.5px solid rgba(91,156,246,0.3)", color: "#e8e9ed", borderRadius: "10px 10px 2px 10px" },
  bubbleAssistant: { background: "#161820", border: "0.5px solid rgba(255,255,255,0.1)", color: "#e8e9ed", borderRadius: "10px 10px 10px 2px" },
  bubbleError: { background: "rgba(228,77,77,0.1)", borderColor: "rgba(228,77,77,0.3)", color: "#f87171" },
  userText: { whiteSpace: "pre-wrap" },
  markdownWrap: { fontSize: 13, lineHeight: 1.7 },
  sourcesContainer: { display: "flex", flexDirection: "column", gap: 4, maxWidth: 640 },
  sourcesToggle: { background: "none", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", color: "#7a7f8e", fontSize: 11, display: "flex", alignItems: "center", gap: 5, fontFamily: "'IBM Plex Mono', monospace" },
  sourcesList: { background: "#1e2028", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 8 },
  sourceItem: { display: "flex", flexDirection: "column", gap: 3 },
  sourceHeader: { display: "flex", alignItems: "center", gap: 6 },
  sourceNum: { background: "rgba(91,156,246,0.2)", color: "#5b9cf6", fontSize: 10, minWidth: 18, height: 18, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500 },
  sourceFile: { fontSize: 11, color: "#e8e9ed", fontWeight: 500 },
  sourcePage: { fontSize: 10, color: "#7a7f8e", background: "rgba(255,255,255,0.05)", padding: "1px 5px", borderRadius: 3 },
  sourceSim: { fontSize: 10, color: "#4ade80", marginLeft: "auto" },
  sourceText: { fontSize: 11, color: "#7a7f8e", lineHeight: 1.5, paddingLeft: 24 },
  tokenBadge: { fontSize: 10, color: "#7a7f8e", display: "flex", alignItems: "center", gap: 4 },
};
