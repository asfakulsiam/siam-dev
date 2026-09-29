"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Github, CheckCircle2, AlertCircle, X, ChevronDown, ChevronUp } from "lucide-react";
import { syncAllProjectsFromGitHubAction, BatchSyncResult } from "@/features/projects/actions";

interface SyncAllProjectsButtonProps {
  totalActiveProjects?: number;
}

export function SyncAllProjectsButton({ totalActiveProjects = 0 }: SyncAllProjectsButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [syncResult, setSyncResult] = useState<BatchSyncResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleSyncAll = () => {
    setErrorMessage(null);
    setSyncResult(null);

    startTransition(async () => {
      try {
        const res = await syncAllProjectsFromGitHubAction();
        if (res.ok) {
          setSyncResult(res.data);
          router.refresh();
        } else {
          setErrorMessage(res.error || "Failed to execute batch GitHub synchronization.");
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while contacting the synchronization service.",
        );
      }
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleSyncAll}
        disabled={isPending}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[var(--radius-sm)] text-xs sm:text-sm font-medium border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--ink)] transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
        title="Fetches latest README and metadata from GitHub repositories for all active projects and synthesizes updates"
        aria-busy={isPending}
      >
        <RefreshCw className={`w-4 h-4 text-[var(--accent)] ${isPending ? "animate-spin" : ""}`} aria-hidden="true" />
        <Github className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
        <span>{isPending ? "Syncing Repositories..." : "Sync with GitHub"}</span>
      </button>

      {/* Sync Status / Result Popover Notification */}
      {(syncResult || errorMessage) && (
        <div
          role="status"
          aria-live="polite"
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 p-4 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-[var(--shadow-floating)] animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-[var(--line)]">
            <div className="flex items-center gap-2">
              {errorMessage ? (
                <AlertCircle className="w-4 h-4 text-[var(--danger)] shrink-0" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" aria-hidden="true" />
              )}
              <h4 className="text-xs font-bold text-[var(--ink)]">
                {errorMessage ? "Sync Incomplete" : "GitHub Sync Completed"}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => {
                setSyncResult(null);
                setErrorMessage(null);
              }}
              className="p-1 rounded-[var(--r-sm)] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
              aria-label="Dismiss sync status"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {errorMessage && (
            <p className="text-xs text-[var(--danger)] mt-2 font-medium leading-relaxed">
              {errorMessage}
            </p>
          )}

          {syncResult && (
            <div className="space-y-3 mt-2.5">
              <div className="flex items-center justify-between text-xs text-[var(--ink-muted)]">
                <span>Eligible projects: <strong className="text-[var(--ink)] font-mono">{syncResult.totalEligible}</strong></span>
                <span className="text-[var(--success)] font-mono font-semibold">✓ {syncResult.syncedCount} synced</span>
                {syncResult.failedCount > 0 && (
                  <span className="text-[var(--danger)] font-mono font-semibold">✕ {syncResult.failedCount} failed</span>
                )}
              </div>

              {syncResult.results.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setIsDetailsOpen((prev) => !prev)}
                    className="flex items-center justify-between w-full text-[11px] font-semibold text-[var(--accent)] hover:underline pt-1"
                  >
                    <span>{isDetailsOpen ? "Hide Breakdown" : "View Breakdown"}</span>
                    {isDetailsOpen ? (
                      <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                  </button>

                  {isDetailsOpen && (
                    <div className="mt-2 max-h-40 overflow-y-auto space-y-1.5 pr-1">
                      {syncResult.results.map((r, i) => (
                        <div
                          key={i}
                          className="p-1.5 rounded-[var(--r-sm)] bg-[var(--surface-2)] text-[11px] flex items-center justify-between gap-2"
                        >
                          <span className="font-medium text-[var(--ink)] truncate max-w-[180px]">{r.title}</span>
                          <span
                            className={`font-mono text-[10px] font-semibold ${
                              r.status === "success"
                                ? "text-[var(--success)]"
                                : r.status === "failed"
                                ? "text-[var(--danger)]"
                                : "text-[var(--ink-muted)]"
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
