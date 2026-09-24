import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between p-8 sm:p-16 max-w-6xl mx-auto font-sans">
      <header className="flex items-center justify-between py-4 border-b border-neutral-200 dark:border-neutral-800">
        <span className="font-semibold tracking-tight text-lg">Asfakul</span>
        <span className="text-xs uppercase tracking-widest text-neutral-500 font-mono">
          Phase 0 · Foundation
        </span>
      </header>

      <section className="my-auto py-16 space-y-6 max-w-2xl">
        <div className="text-xs font-mono text-neutral-400 tracking-wider uppercase">
          Dev Den // Portfolio Foundation
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 text-balance">
          I design and build websites that feel considered.
        </h1>
        <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 text-pretty">
          Web designer and full-stack developer in Bangladesh. Precision, typography, and robust
          engineering.
        </p>
        <div className="pt-4 flex items-center gap-4">
          <Link
            href="#explore"
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-md transition-colors hover:opacity-90"
          >
            Explore System
          </Link>
          <span className="text-xs text-neutral-500 font-mono">
            Dhaka · Ready for Phase 1 Design System
          </span>
        </div>
      </section>

      <footer className="pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
        <span>© {new Date().getFullYear()} Asfakul · Dev Den</span>
        <span className="font-mono">
          Quality Gates: Strict Types · ESLint · Vitest · Playwright
        </span>
      </footer>
    </main>
  );
}
