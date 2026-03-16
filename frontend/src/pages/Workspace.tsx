import { FileText, MessageSquare, Menu, X } from "lucide-react";
import { useCallback, useState } from "react";
import ChatView from "../components/ChatView";
import DocumentUpload from "../components/DocumentUpload";
import SessionSidebar from "../components/SessionSidebar";

type Tab = "chat" | "documents";

function Workspace() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
    <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--bg-tertiary)] bg-[var(--bg-secondary)] shadow-sm z-20 relative">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 rounded-lg hover:bg-[var(--bg-tertiary)]/50 text-[var(--text-secondary)] transition-colors"
            title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm shadow-sm">
            V
          </div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Vine Research</h1>
        </div>
        <nav className="flex gap-1">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors font-medium ${
              activeTab === "chat"
                ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/50"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors font-medium ${
              activeTab === "documents"
                ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/50"
            }`}
          >
            <FileText className="w-4 h-4" />
            Documents
          </button>
        </nav>
      </header>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {activeTab === "chat" && (
          <aside 
            className={`
              absolute md:relative z-10 h-full bg-[var(--bg-secondary)] border-r border-[var(--bg-tertiary)] transition-all duration-300 ease-in-out
              ${isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full md:translate-x-0 md:w-0 overflow-hidden border-none"}
            `}
          >
            <div className="w-64 h-full">
              <SessionSidebar
                currentSessionId={currentSessionId}
                onSelectSession={handleSelectSession}
                onNewSession={handleNewSession}
                refreshKey={sidebarRefreshKey}
              />
            </div>
          </aside>
        )}

        <main
          className={`flex-1 overflow-hidden bg-[var(--bg-primary)] ${
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

export default Workspace;
