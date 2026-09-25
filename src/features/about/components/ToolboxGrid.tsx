import type { ToolboxGroup } from "@/features/profile/data";

interface ToolboxGridProps {
  groups: ToolboxGroup[];
}

export function ToolboxGrid({ groups }: ToolboxGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {groups.map((group) => (
        <div
          key={group.group}
          className="p-6 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] space-y-4"
        >
          <h3 className="text-sm font-semibold text-[var(--ink)]">
            {group.group}
          </h3>
          <ul className="flex flex-wrap gap-2">
            {group.items.map((item) => (
              <li
                key={item}
                className="text-xs sm:text-sm font-medium text-[var(--ink)] bg-[var(--bg)] px-3 py-1.5 rounded-[var(--r-sm)] border border-[var(--line)] hover:border-[var(--accent)] transition-colors"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
