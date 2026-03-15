import { FileText, MessageSquare } from "lucide-react";
import { useState } from "react";
import ChatView from "./components/ChatView";
import DocumentUpload from "./components/DocumentUpload";

type Tab = "chat" | "documents";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");

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
      <main className="flex-1 overflow-hidden max-w-5xl w-full mx-auto">
        {activeTab === "chat" && <ChatView />}
        {activeTab === "documents" && <DocumentUpload />}
      </main>
    </div>
  );
}

export default App;
