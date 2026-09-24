export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading dashboard content">
      <div className="flex items-center justify-between pb-6 border-b border-[var(--line)]">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-[var(--surface-2)] rounded-[var(--r-sm)]" />
          <div className="h-4 w-72 bg-[var(--surface-2)] rounded-[var(--r-sm)]" />
        </div>
        <div className="h-9 w-28 bg-[var(--surface-2)] rounded-[var(--r-sm)]" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-[var(--r-md)] bg-[var(--surface)] border border-[var(--line)] space-y-3"
          >
            <div className="h-4 w-24 bg-[var(--surface-2)] rounded-[var(--r-sm)]" />
            <div className="h-8 w-16 bg-[var(--surface-2)] rounded-[var(--r-sm)]" />
            <div className="h-3 w-32 bg-[var(--surface-2)] rounded-[var(--r-sm)]" />
          </div>
        ))}
      </div>

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-6 space-y-4">
        <div className="h-5 w-36 bg-[var(--surface-2)] rounded-[var(--r-sm)]" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 w-full bg-[var(--surface-2)]/60 rounded-[var(--r-sm)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
