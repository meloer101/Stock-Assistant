const API_BASE = "/api";

export interface ChatEvent {
  author: string;
  type: "progress" | "final" | "error";
  text?: string;
  partial?: boolean;
  state_update?: Record<string, string>;
}

export async function* streamChat(
  message: string,
  userId: string = "default_user"
): AsyncGenerator<ChatEvent> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, user_id: userId }),
  });

  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") return;
      try {
        yield JSON.parse(data) as ChatEvent;
      } catch {
        // skip malformed JSON
      }
    }
  }
}

export async function uploadDocument(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/corpus/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function listDocuments() {
  const res = await fetch(`${API_BASE}/corpus`);
  return res.json();
}

export async function deleteDocument(docId: string) {
  const res = await fetch(`${API_BASE}/corpus/${docId}`, { method: "DELETE" });
  return res.json();
}

export async function createNewSession(userId: string = "default_user") {
  const res = await fetch(`${API_BASE}/session/new?user_id=${userId}`, {
    method: "POST",
  });
  return res.json();
}
