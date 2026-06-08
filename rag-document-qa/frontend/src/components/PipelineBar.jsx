import React from "react";

const STEPS = [
  "Query Input",
  "Embed Query",
  "Vector Search",
  "Retrieve Chunks",
  "LLM Generation",
  "Answer",
];

export default function PipelineBar({ currentStep }) {
  return (
    <div style={styles.bar}>
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const isDone = currentStep > stepNum;
        const isActive = currentStep === stepNum;
        return (
          <React.Fragment key={label}>
            <div style={{ ...styles.step, ...(isActive ? styles.stepActive : isDone ? styles.stepDone : {}) }}>
              <div style={{ ...styles.dot, ...(isActive ? styles.dotActive : isDone ? styles.dotDone : {}) }} />
              <span>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <span style={{ ...styles.arrow, ...(isDone ? styles.arrowDone : {}) }}>→</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const styles = {
  bar: { display: "flex", alignItems: "center", padding: "8px 20px", borderBottom: "0.5px solid rgba(255,255,255,0.07)", background: "#161820", overflowX: "auto", gap: 0, flexShrink: 0 },
  step: { display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 4, fontSize: 11, color: "#7a7f8e", whiteSpace: "nowrap", transition: "all 0.3s" },
  stepActive: { color: "#5b9cf6", background: "rgba(91,156,246,0.1)" },
  stepDone: { color: "#4ade80" },
  dot: { width: 6, height: 6, borderRadius: "50%", background: "#7a7f8e", flexShrink: 0, transition: "all 0.3s" },
  dotActive: { background: "#5b9cf6", boxShadow: "0 0 6px #5b9cf6" },
  dotDone: { background: "#4ade80" },
  arrow: { color: "rgba(255,255,255,0.15)", padding: "0 2px", fontSize: 11, transition: "color 0.3s" },
  arrowDone: { color: "#4ade80" },
};
