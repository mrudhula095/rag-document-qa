import { useState, useCallback, useRef } from "react";
import { queryDocuments } from "../utils/api";

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [lastSources, setLastSources] = useState([]);
  const historyRef = useRef([]);

  const animatePipeline = useCallback(async () => {
    for (let i = 1; i <= 6; i++) {
      setPipelineStep(i);
      await new Promise((r) => setTimeout(r, 350));
    }
    setTimeout(() => setPipelineStep(0), 2000);
  }, []);

  const sendMessage = useCallback(async (query, selectedDocIds) => {
    if (!query.trim() || isLoading) return;

    const userMsg = { role: "user", content: query, id: Date.now() };
    setMessages((m) => [...m, userMsg]);
    historyRef.current.push({ role: "user", content: query });

    setIsLoading(true);
    setPipelineStep(1);

    try {
      const [result] = await Promise.all([
        queryDocuments({
          query,
          docIds: selectedDocIds?.length ? selectedDocIds : undefined,
          history: historyRef.current.slice(-6),
        }),
        animatePipeline(),
      ]);

      const assistantMsg = {
        role: "assistant",
        content: result.answer,
        sources: result.sources,
        tokensUsed: result.tokens_used,
        model: result.model,
        id: Date.now() + 1,
      };
      setMessages((m) => [...m, assistantMsg]);
      setLastSources(result.sources || []);
      historyRef.current.push({ role: "assistant", content: result.answer });
    } catch (err) {
      const errMsg = {
        role: "assistant",
        content: `Error: ${err.response?.data?.error || err.message}`,
        isError: true,
        id: Date.now() + 1,
      };
      setMessages((m) => [...m, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, animatePipeline]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setLastSources([]);
    historyRef.current = [];
    setPipelineStep(0);
  }, []);

  return { messages, isLoading, pipelineStep, lastSources, sendMessage, clearChat };
}
