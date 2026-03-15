import { FileText, MessageSquare } from "lucide-react";
import { useCallback, useState } from "react";
import ChatView from "./components/ChatView";
import DocumentUpload from "./components/DocumentUpload";
import SessionSidebar from "./components/SessionSidebar";

type Tab = "chat" | "documents";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);

  const refreshSidebar = useCallback(() => {
    setSidebarRefreshKey((k) => k + 1);
  }, []);

  const handleNewSession = useCallback(() => {
    setCurrentSessionId(null);
  }, []);

  const handleSelectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
  }, []);

  const handleSessionCreated = useCallback(
    (sessionId: string) => {
      setCurrentSessionId(sessionId);
      refreshSidebar();
    },
    [refreshSidebar]
  );

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--bg-tertiary)] bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center text-[var(--bg-primary)] font-bold text-sm">
            V
          </div>
          <h1 className="text-lg font-semibold">Vine Research</h1>
        </div>
        <nav className="flex gap-1">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              activeTab === "chat"
                ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              activeTab === "documents"
                ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
            }`}
          >
            <FileText className="w-4 h-4" />
            Documents
          </button>
        </nav>
      </header>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === "chat" && (
          <aside className="w-64 shrink-0">
            <SessionSidebar
              currentSessionId={currentSessionId}
              onSelectSession={handleSelectSession}
              onNewSession={handleNewSession}
              refreshKey={sidebarRefreshKey}
            />
          </aside>
        )}

        <main
          className={`flex-1 overflow-hidden ${
            activeTab === "chat" ? "" : "max-w-5xl w-full mx-auto"
          }`}
        >
          {activeTab === "chat" && (
            <ChatView
              sessionId={currentSessionId}
              onSessionCreated={handleSessionCreated}
              onMessageSent={refreshSidebar}
            />
          )}
          {activeTab === "documents" && <DocumentUpload />}
        </main>
      </div>
    </div>
  );
}

export default App;
