import { Send, RotateCcw, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { createNewSession, streamChat } from "../utils/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  author?: string;
  isStreaming?: boolean;
}

export default function ChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

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

    try {
      let accumulated = "";
      for await (const event of streamChat(text)) {
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
          m.id === assistantId ? { ...m, isStreaming: false } : m
        )
      );
    } catch (err) {
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

  const handleNewSession = async () => {
    await createNewSession();
    setMessages([]);
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
        {messages.length === 0 && (
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
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-sm hover:bg-[var(--accent)] hover:text-[var(--bg-primary)] transition-colors"
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
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-[var(--accent)] text-[var(--bg-primary)]"
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
                <Loader2 className="w-4 h-4 animate-spin mt-2 text-[var(--accent)]" />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-[var(--bg-tertiary)] p-4">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <button
            onClick={handleNewSession}
            className="p-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            title="New session"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
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
            className="p-2.5 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
