import React, { useState, useEffect, useRef } from "react";
import DocumentSidebar from "./components/DocumentSidebar";
import PipelineBar from "./components/PipelineBar";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import { useDocuments } from "./hooks/useDocuments";
import { useChat } from "./hooks/useChat";

export default function App() {
  const { documents, uploadProgress, upload, remove } = useDocuments();
  const { messages, isLoading, pipelineStep, sendMessage, clearChat } = useChat();
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const toggleSelect = (docId) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleSend = (query) => sendMessage(query, selectedDocIds);

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>⧉</div>
          <span style={styles.logoText}>Doc<span style={{ color: "#5b9cf6" }}>RAG</span></span>
        </div>
        <div style={styles.headerRight}>
          {selectedDocIds.length > 0 && (
            <span style={styles.filterBadge}>
              Filtering {selectedDocIds.length} doc{selectedDocIds.length > 1 ? "s" : ""}
            </span>
          )}
          <div style={{ ...styles.statusPill }}>
            <div style={{ ...styles.statusDot, ...(documents.length ? styles.statusDotActive : {}) }} />
            {documents.length > 0
              ? `${documents.length} doc${documents.length > 1 ? "s" : ""} indexed`
              : "no docs loaded"}
          </div>
        </div>
      </header>

      <div style={styles.body}>
        <DocumentSidebar
          documents={documents}
          uploadProgress={uploadProgress}
          onUpload={upload}
          onDelete={remove}
          selectedIds={selectedDocIds}
          onToggleSelect={toggleSelect}
        />

        <div style={styles.main}>
          <PipelineBar currentStep={pipelineStep} />

          <div style={styles.messages}>
            {messages.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>⧈</div>
                <div style={styles.emptyTitle}>Ask anything about your documents</div>
                <div style={styles.emptySub}>
                  Upload PDFs, text, or markdown files. DocRAG chunks, embeds, and retrieves
                  the most relevant context before generating your answer.
                </div>
                <div style={styles.techStack}>
                  <span style={styles.techBadge}>LangChain</span>
                  <span style={styles.techBadge}>ChromaDB</span>
                  <span style={styles.techBadge}>OpenAI</span>
                  <span style={styles.techBadge}>Flask</span>
                  <span style={styles.techBadge}>React</span>
                </div>
              </div>
            ) : (
              messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
            )}

            {isLoading && (
              <div style={styles.typingWrap}>
                <div style={styles.typingLabel}>⧉ DocRAG</div>
                <div style={styles.typingBubble}>
                  <span style={styles.dot} />
                  <span style={{ ...styles.dot, animationDelay: "0.2s" }} />
                  <span style={{ ...styles.dot, animationDelay: "0.4s" }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <ChatInput
            onSend={handleSend}
            onClear={clearChat}
            isLoading={isLoading}
            hasDocuments={documents.length > 0}
            hasMessages={messages.length > 0}
          />
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0e0f11; color: #e8e9ed; font-family: 'IBM Plex Mono', monospace; }
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,300;9..144,400&display=swap');
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        @keyframes blink { 0%,80%,100%{opacity:0.3} 40%{opacity:1} }
        @keyframes spin { to { transform: rotate(360deg); } }
        p { margin-bottom: 8px; }
        p:last-child { margin-bottom: 0; }
        ul, ol { padding-left: 18px; margin-bottom: 8px; }
        li { margin-bottom: 3px; }
        code { background: rgba(255,255,255,0.08); padding: 1px 5px; border-radius: 3px; font-size: 12px; }
        pre { background: rgba(255,255,255,0.05); padding: 10px; border-radius: 6px; overflow-x: auto; margin: 8px 0; }
        strong { color: #e8e9ed; font-weight: 500; }
      `}</style>
    </div>
  );
}

const styles = {
  root: { height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", background: "#0e0f11" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "0.5px solid rgba(255,255,255,0.07)", background: "#161820", flexShrink: 0 },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { width: 28, height: 28, background: "linear-gradient(135deg,#5b9cf6,#a78bfa)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 },
  logoText: { fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 400 },
  headerRight: { display: "flex", alignItems: "center", gap: 10 },
  filterBadge: { fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(251,146,60,0.15)", color: "#fb923c", border: "0.5px solid rgba(251,146,60,0.3)" },
  statusPill: { fontSize: 10, padding: "3px 10px", borderRadius: 20, border: "0.5px solid rgba(255,255,255,0.1)", color: "#7a7f8e", display: "flex", alignItems: "center", gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: "50%", background: "#7a7f8e" },
  statusDotActive: { background: "#4ade80", boxShadow: "0 0 6px #4ade80" },
  body: { display: "flex", flex: 1, overflow: "hidden" },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  messages: { flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 18 },
  emptyState: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 12, padding: 40, color: "#7a7f8e", margin: "auto" },
  emptyIcon: { fontSize: 48, opacity: 0.3 },
  emptyTitle: { fontFamily: "'Fraunces', serif", fontSize: 22, color: "#e8e9ed", opacity: 0.7 },
  emptySub: { fontSize: 12, lineHeight: 1.7, maxWidth: 380 },
  techStack: { display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginTop: 8 },
  techBadge: { fontSize: 10, padding: "3px 10px", borderRadius: 20, border: "0.5px solid rgba(255,255,255,0.1)", color: "#7a7f8e" },
  typingWrap: { display: "flex", flexDirection: "column", gap: 4 },
  typingLabel: { fontSize: 10, color: "#7a7f8e" },
  typingBubble: { display: "flex", gap: 4, padding: "10px 14px", background: "#161820", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 10, width: "fit-content" },
  dot: { display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#7a7f8e", animation: "blink 1.2s infinite" },
};
