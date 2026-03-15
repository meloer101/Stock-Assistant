import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

export interface TimelineEvent {
  id: string;
  agent: string;
  status: "running" | "done" | "error";
  label: string;
  timestamp: number;
}

interface Props {
  events: TimelineEvent[];
}

const statusIcons = {
  running: <Clock className="w-4 h-4 text-[var(--warning)] animate-pulse" />,
  done: <CheckCircle className="w-4 h-4 text-[var(--success)]" />,
  error: <AlertTriangle className="w-4 h-4 text-[var(--error)]" />,
};

const agentLabels: Record<string, string> = {
  data_analyst_agent: "Data Analysis",
  strategy_analyst_agent: "Strategy Development",
  risk_analyst_agent: "Risk Evaluation",
  interactive_planner: "Research Planning",
  section_researcher: "Web Research",
  research_critic: "Quality Review",
  report_composer: "Report Writing",
  doc_qa_agent: "Document Q&A",
};

export default function ActivityTimeline({ events }: Props) {
  if (events.length === 0) return null;

  return (
    <div className="p-4 space-y-3">
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
        Activity
      </h3>
      <div className="space-y-2">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="flex items-center gap-3 p-2 rounded-lg bg-[var(--bg-secondary)]/50"
          >
            {statusIcons[evt.status]}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {agentLabels[evt.agent] || evt.agent}
              </p>
              <p className="text-xs text-[var(--text-secondary)] truncate">
                {evt.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
