import { getMeme } from "@/features/appearance/queries";
import { MemeState } from "@/components/motion/MemeState";
import { Container, Section } from "@/components/ui/Container";

export default async function Loading() {
  const loadingMeme = await getMeme("loading");

  return (
    <main
      id="main-content"
      aria-label="Loading page content"
      className="min-h-[60vh] flex flex-col items-center justify-center pt-24 pb-20"
    >
      <Section spacing="compact">
        <Container size="narrow" className="flex flex-col items-center justify-center text-center space-y-4">
          <MemeState asset={loadingMeme} maxLoops={3} />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[var(--ink)]">
              Loading content...
            </p>
            <p className="text-xs text-[var(--ink-muted)]">
              Fetching assets and initializing layout.
            </p>
          </div>
        </Container>
      </Section>
    </main>
  );
}
