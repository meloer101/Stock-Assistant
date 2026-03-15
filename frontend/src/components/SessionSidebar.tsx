import { MessageSquarePlus, Trash2, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  listSessions,
  deleteSessionApi,
  type SessionSummary,
} from "../utils/api";

function timeAgo(ts: number): string {
  const seconds = Math.floor(Date.now() / 1000 - ts);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface Props {
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  refreshKey: number;
}

export default function SessionSidebar({
  currentSessionId,
  onSelectSession,
  onNewSession,
  refreshKey,
}: Props) {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await listSessions();
      setSessions(data.sessions);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7736/ingest/28ad2c2b-7b4a-490a-8d82-afd6d3eac39a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'954828'},body:JSON.stringify({sessionId:'954828',runId:'run2',hypothesisId:'H1',location:'frontend/src/components/SessionSidebar.tsx:52',message:'sidebar sessions state updated',data:{count:sessions.length,currentSessionId,hasNestedButtonMarkup:sessions.length > 0},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [sessions, currentSessionId]);

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      await deleteSessionApi(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        onNewSession();
      }
    } catch {
      // silently ignore
    }
  };

  return (
    <div className="flex flex-col h-full border-r border-[var(--bg-tertiary)] bg-[var(--bg-secondary)]">
      <div className="p-3">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--accent)] text-[var(--bg-primary)] hover:bg-[var(--accent-hover)] transition-colors text-sm font-medium"
        >
          <MessageSquarePlus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--text-secondary)]" />
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <p className="text-xs text-[var(--text-secondary)] text-center py-8">
            No conversations yet
          </p>
        )}

        {sessions.map((s) => (
          <div
            key={s.id}
            className={`group w-full rounded-lg text-sm transition-colors flex items-start gap-2 ${
              s.id === currentSessionId
                ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <button
              type="button"
              onClick={() => onSelectSession(s.id)}
              className="flex-1 min-w-0 text-left px-3 py-2.5"
            >
              <p className="truncate leading-snug">
                {s.preview || "New conversation"}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 opacity-70">
                {timeAgo(s.last_update_time)}
              </p>
            </button>
            <button
              type="button"
              onClick={(e) => handleDelete(e, s.id)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--error)]/20 hover:text-[var(--error)] transition-all shrink-0 mt-2 mr-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
