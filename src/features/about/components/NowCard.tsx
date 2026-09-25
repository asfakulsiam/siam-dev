import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { ProfileData } from "@/features/profile/data";

interface NowCardProps {
  now: ProfileData["now"];
  location: string;
}

export function NowCard({ now, location }: NowCardProps) {
  return (
    <div className="p-6 sm:p-8 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
          <h3 className="text-xs font-semibold text-[var(--ink)]">
            What I&apos;m Doing Now
          </h3>
        </div>
        <span className="text-xs font-mono text-[var(--ink-muted)]">Updated {now.updatedAt}</span>
      </div>

      <div className="space-y-2">
        <h4 className="text-lg sm:text-xl font-bold text-[var(--ink)]">{now.title}</h4>
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{now.body}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--line)] text-xs text-[var(--ink-muted)] font-mono">
        <span>Based in {location}</span>
        {now.links && now.links.length > 0 && (
          <div className="flex items-center gap-3">
            {now.links.map((link) => (
              <Link
                key={link.label}
                href={link.url}
                className="flex items-center gap-1 text-[var(--accent)] hover:underline font-medium"
              >
                <span>{link.label}</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
