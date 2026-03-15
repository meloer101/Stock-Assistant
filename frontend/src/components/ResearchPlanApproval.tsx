import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";

interface Props {
  plan: string;
  onApprove: (plan: string) => void;
  onReject: () => void;
}

export default function ResearchPlanApproval({ plan, onApprove, onReject }: Props) {
  const [editing, setEditing] = useState(false);
  const [editedPlan, setEditedPlan] = useState(plan);

  return (
    <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--bg-secondary)] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--accent)]">
          Research Plan — Awaiting Your Approval
        </h3>
        <button
          onClick={() => setEditing(!editing)}
          className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
          title={editing ? "Cancel editing" : "Edit plan"}
        >
          {editing ? (
            <X className="w-4 h-4" />
          ) : (
            <Pencil className="w-4 h-4" />
          )}
        </button>
      </div>

      {editing ? (
        <textarea
          value={editedPlan}
          onChange={(e) => setEditedPlan(e.target.value)}
          rows={10}
          className="w-full bg-[var(--bg-primary)] border border-[var(--bg-tertiary)] rounded-lg p-3 text-sm resize-y focus:outline-none focus:border-[var(--accent)]"
        />
      ) : (
        <div className="text-sm whitespace-pre-wrap text-[var(--text-secondary)] bg-[var(--bg-primary)] rounded-lg p-3">
          {plan}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <button
          onClick={onReject}
          className="px-4 py-2 rounded-lg text-sm bg-[var(--bg-tertiary)] hover:bg-[var(--error)]/20 text-[var(--text-secondary)] hover:text-[var(--error)] transition-colors"
        >
          Reject
        </button>
        <button
          onClick={() => onApprove(editing ? editedPlan : plan)}
          className="px-4 py-2 rounded-lg text-sm bg-[var(--accent)] text-[var(--bg-primary)] hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          Approve & Start Research
        </button>
      </div>
    </div>
  );
}
