import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { deleteDocument, listDocuments, uploadDocument } from "../utils/api";

interface DocInfo {
  source: string;
  page_count: string | number;
  doc_id?: string;
}

export default function DocumentUpload() {
  const [documents, setDocuments] = useState<DocInfo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshDocs = useCallback(async () => {
    try {
      const data = await listDocuments();
      setDocuments(data.documents || []);
    } catch {
      // corpus may not exist yet
    }
  }, []);

  useEffect(() => {
    refreshDocs();
  }, [refreshDocs]);

  const handleUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      await uploadDocument(file);
      await refreshDocs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDelete = async (docId: string) => {
    try {
      await deleteDocument(docId);
      await refreshDocs();
    } catch {
      setError("Delete failed");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Document Corpus</h3>

      {/* Upload area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragOver
            ? "border-[var(--accent)] bg-[var(--accent)]/10"
            : "border-[var(--bg-tertiary)] hover:border-[var(--text-secondary)]"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
            <p className="text-sm text-[var(--text-secondary)]">Processing PDF...</p>
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-[var(--text-secondary)]" />
            <p className="text-sm text-[var(--text-secondary)]">
              Drop a PDF here or click to upload
            </p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        )}
      </div>

      {error && (
        <p className="text-sm text-[var(--error)]">{error}</p>
      )}

      {/* Document list */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-[var(--text-secondary)]">
            Uploaded Documents ({documents.length})
          </h4>
          {documents.map((doc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)]"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--accent)]" />
                <div>
                  <p className="text-sm font-medium">{doc.source}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {doc.page_count} pages
                  </p>
                </div>
              </div>
              {doc.doc_id && (
                <button
                  onClick={() => handleDelete(doc.doc_id!)}
                  className="p-1.5 rounded hover:bg-[var(--error)]/20 text-[var(--text-secondary)] hover:text-[var(--error)] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
