"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { loginAction } from "@/lib/auth-actions";

export function AdminLoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await loginAction(email, password);
        if (result.ok) {
          router.push("/admin");
          router.refresh();
        } else {
          setErrorMessage(result.error);
        }
      } catch {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-6 sm:p-8 shadow-xs">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--line)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--r-sm)] bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center text-[var(--accent)]">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[var(--ink)] tracking-tight">Dev Den Admin</h1>
              <p className="text-xs text-[var(--ink-muted)]">Authenticate to manage content</p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Site</span>
          </Link>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 p-3 rounded-[var(--r-sm)] bg-[var(--danger)]/10 border border-[var(--danger)]/30 flex items-start gap-2.5 text-xs text-[var(--ink)]"
          >
            <AlertCircle className="w-4 h-4 text-[var(--danger)] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-[var(--danger)]">Authentication failed</p>
              <p className="mt-0.5 opacity-90">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-semibold text-[var(--ink-muted)] mb-1.5"
            >
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
              placeholder="admin@example.com"
              disabled={isPending}
              className="w-full px-3.5 py-2.5 text-sm bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] placeholder:text-[var(--ink-muted)]/50 focus:border-[var(--accent)] focus:outline-2 focus:outline-[var(--focus)] transition-colors disabled:opacity-60"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-[var(--ink-muted)]"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                disabled={isPending}
                className="w-full px-3.5 py-2.5 text-sm bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] placeholder:text-[var(--ink-muted)]/50 focus:border-[var(--accent)] focus:outline-2 focus:outline-[var(--focus)] transition-colors disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-[var(--r-sm)] bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" aria-hidden="true" />
                <span>Sign in to Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Security Note */}
        <p className="mt-6 text-[11px] text-center text-[var(--ink-muted)] border-t border-[var(--line)] pt-4">
          Rate-limited: 5 attempts per 15 minutes. Authorized admin credentials only.
        </p>
      </div>
    </div>
  );
}
