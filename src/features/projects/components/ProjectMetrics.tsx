import type { ProjectMetric } from "../types";

interface ProjectMetricsProps {
  metrics: ProjectMetric[];
}

export function ProjectMetrics({ metrics }: ProjectMetricsProps) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="p-6 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] space-y-2"
        >
          <div className="text-xs font-semibold text-[var(--ink-muted)]">
            {metric.label}
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[var(--accent)] tracking-tight">
            {metric.value}
          </div>
          {metric.description && (
            <p className="text-xs text-[var(--ink-muted)] leading-relaxed">{metric.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
