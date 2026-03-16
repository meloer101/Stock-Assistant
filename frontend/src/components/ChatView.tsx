import { Send, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getSessionMessages, streamChat } from "../utils/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  author?: string;
  isStreaming?: boolean;
  statusHint?: string;
}

const agentLabels: Record<string, string> = {
  vine_root_agent: "Routing your request...",
  interactive_planner: "Creating research plan...",
  section_researcher: "Searching the web...",
  research_critic: "Evaluating research quality...",
  report_composer: "Writing final report...",
  quick_answer_agent: "Looking up information...",
  theme_research_agent: "Researching theme...",
  stock_coordinator: "Analyzing stock...",
  data_analyst_agent: "Gathering market data...",
  strategy_analyst_agent: "Developing strategies...",
  risk_analyst_agent: "Evaluating risks...",
  doc_qa_agent: "Searching documents...",
};

interface Props {
  sessionId: string | null;
  onSessionCreated: (sessionId: string) => void;
  onMessageSent: () => void;
}

export default function ChatView({
  sessionId,
  onSessionCreated,
  onMessageSent,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const activeSessionRef = useRef<string | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  useEffect(() => {
    activeSessionRef.current = sessionId;

    if (!sessionId) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setLoadingHistory(true);

    getSessionMessages(sessionId)
      .then((data) => {
        if (cancelled || activeSessionRef.current !== sessionId) return;
        setMessages(
          data.messages.map((m) => ({
            id: crypto.randomUUID(),
            role: m.role,
            content: m.content,
            author: m.author,
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    // #region agent log
    fetch('http://127.0.0.1:7736/ingest/28ad2c2b-7b4a-490a-8d82-afd6d3eac39a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'954828'},body:JSON.stringify({sessionId:'954828',runId:'run2',hypothesisId:'H4',location:'frontend/src/components/ChatView.tsx:92',message:'handleSend started',data:{hasSessionId:Boolean(sessionId),textLength:text.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", isStreaming: true },
    ]);

    let currentSessionId = sessionId;

    try {
      let accumulated = "";
      let lastAuthor = "";
      for await (const event of streamChat(
        text,
        "default_user",
        currentSessionId ?? undefined
      )) {
        if (event.type === "session_info" && event.session_id) {
          // #region agent log
          fetch('http://127.0.0.1:7736/ingest/28ad2c2b-7b4a-490a-8d82-afd6d3eac39a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'954828'},body:JSON.stringify({sessionId:'954828',runId:'run2',hypothesisId:'H2',location:'frontend/src/components/ChatView.tsx:121',message:'session_info received',data:{sessionId:event.session_id,previousSessionId:currentSessionId},timestamp:Date.now()})}).catch(()=>{});
          // #endregion
          currentSessionId = event.session_id;
          onSessionCreated(event.session_id);
          continue;
        }

        if (event.author && event.author !== lastAuthor) {
          lastAuthor = event.author;
          const hint = agentLabels[event.author] || event.author;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, statusHint: hint } : m
            )
          );
        }

        if (event.text) {
          if (event.partial) {
            accumulated += event.text;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: accumulated, author: event.author }
                  : m
              )
            );
          } else {
            if (!accumulated) {
              accumulated = event.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: event.text!, author: event.author }
                    : m
                )
              );
            }
          }
        }
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, isStreaming: false, statusHint: undefined }
            : m
        )
      );
      // #region agent log
      fetch('http://127.0.0.1:7736/ingest/28ad2c2b-7b4a-490a-8d82-afd6d3eac39a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'954828'},body:JSON.stringify({sessionId:'954828',runId:'run2',hypothesisId:'H2',location:'frontend/src/components/ChatView.tsx:168',message:'chat stream completed',data:{finalTextLength:accumulated.length,finalAuthor:lastAuthor || null,sessionId:currentSessionId},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      onMessageSent();
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7736/ingest/28ad2c2b-7b4a-490a-8d82-afd6d3eac39a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'954828'},body:JSON.stringify({sessionId:'954828',runId:'run2',hypothesisId:'H4',location:'frontend/src/components/ChatView.tsx:171',message:'chat stream failed',data:{error:err instanceof Error ? err.message : 'Unknown error',sessionId:currentSessionId},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingHistory && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
          </div>
        )}

        {!loadingHistory && messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-[var(--text-secondary)]">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
                Vine Investment Research
              </h2>
              <p className="max-w-md">
                Ask me to analyze a stock, research a topic in depth, or answer
                questions about your uploaded documents.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {[
                  "Analyze NVDA stock",
                  "Research the AI chip market",
                  "What does my uploaded report say about revenue?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] text-sm hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-colors shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                msg.role === "user"
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)]"
              }`}
            >
              {msg.author && msg.role === "assistant" && (
                <div className="text-xs text-[var(--text-secondary)] mb-1 font-mono">
                  {msg.author}
                </div>
              )}
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              {msg.isStreaming && (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
                  {msg.statusHint && (
                    <span className="text-xs text-[var(--text-secondary)]">
                      {msg.statusHint}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-[var(--bg-tertiary)] p-4">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about stocks, research topics, or uploaded documents..."
            rows={1}
            className="flex-1 bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] rounded-xl px-4 py-2.5 resize-none focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2.5 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
