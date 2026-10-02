"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";
import { Button } from "@/components/ui/Button";

export function AdminSignOutButton() {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={handleSignOut}
      disabled={isPending}
      isLoading={isPending}
      title="Sign out of admin session"
      aria-label="Sign out"
      className="text-[var(--ink-muted)] hover:text-[var(--danger)] hover:border-[var(--danger)]/50"
    >
      <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">Sign out</span>
    </Button>
  );
}
