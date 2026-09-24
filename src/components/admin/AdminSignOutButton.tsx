"use client";

import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";

export function AdminSignOutButton() {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      title="Sign out of admin session"
      aria-label="Sign out"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] hover:text-[var(--danger)] hover:border-[var(--danger)]/50 hover:bg-[var(--surface-2)] transition-colors disabled:opacity-50 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
      ) : (
        <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
      )}
      <span className="hidden sm:inline">Sign out</span>
    </button>
  );
}
