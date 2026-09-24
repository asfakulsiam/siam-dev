"use client";

import { useState } from "react";
import { Container, Section } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Textarea, Skeleton } from "@/components/ui/Input";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";

export default function DesignTestPage() {
  const [inputValue, setInputValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <main id="main-content" className="min-h-screen pt-24 pb-20">
      <Section spacing="compact">
        <Container size="narrow" className="space-y-16">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="warning">Internal QA</Badge>
                <span className="text-xs font-mono text-[var(--ink-muted)]">
                  Phase 1 Verification
                </span>
              </div>
              <Heading as="h1" size="3xl">
                Design System & Token Verification
              </Heading>
              <Text size="sm" variant="muted">
                Visual test harness for all tokens, theme states, component primitives, and
                contrast.
              </Text>
            </div>
            <ThemeSwitcher />
          </div>

          {/* 1. Buttons Matrix */}
          <div className="space-y-4">
            <Heading as="h2" size="xl">
              Button Primitives & States
            </Heading>
            <div className="p-6 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary Action</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost Link</Button>
                <Button variant="danger">Destructive</Button>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[var(--line)]">
                <Button size="sm">Small (32px)</Button>
                <Button size="md">Medium (40px)</Button>
                <Button size="lg">Large (48px)</Button>
                <Button isLoading={isLoading} onClick={() => setIsLoading(!isLoading)}>
                  {isLoading ? "Saving..." : "Toggle Loading"}
                </Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
          </div>

          {/* 2. Badges */}
          <div className="space-y-4">
            <Heading as="h2" size="xl">
              Badges & Status Elements (Anti-Slop Zero-Pill Rules)
            </Heading>
            <div className="p-6 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] flex flex-wrap items-center gap-3">
              <Badge variant="default">Default Status</Badge>
              <Badge variant="outline">Outline Tag</Badge>
              <Badge variant="success">● Active · 2026</Badge>
              <Badge variant="warning">⚠ Needs Review</Badge>
              <Badge variant="danger">✕ Offline</Badge>
              <Badge variant="text">Unboxed / Semantic Separator</Badge>
            </div>
          </div>

          {/* 3. Form Inputs */}
          <div className="space-y-4">
            <Heading as="h2" size="xl">
              Form Inputs & Textarea
            </Heading>
            <div className="p-6 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--ink)] block">
                  Standard Input Field
                </label>
                <Input
                  placeholder="e.g. Asfakul"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--ink)] block">
                  Error State Input Field
                </label>
                <Input defaultValue="invalid-email@" error />
                <span className="text-xs text-[var(--danger)] block">
                  Please enter a valid email address.
                </span>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-medium text-[var(--ink)] block">
                  Multi-line Textarea
                </label>
                <Textarea
                  placeholder="Your message goes here..."
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--ink-muted)] block">
                  Disabled Field
                </label>
                <Input disabled value="Read-only data from admin" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--ink)] block">
                  Skeleton Loading State
                </label>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Fluid Typography Scale */}
          <div className="space-y-4">
            <Heading as="h2" size="xl">
              Fluid Typography Scale
            </Heading>
            <div className="p-6 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] space-y-4">
              <Heading as="h1" size="4xl">
                Heading 4xl — Page Hero Title
              </Heading>
              <Heading as="h2" size="3xl">
                Heading 3xl — Section Major Title
              </Heading>
              <Heading as="h3" size="2xl">
                Heading 2xl — Content Subsection
              </Heading>
              <Heading as="h4" size="xl">
                Heading xl — Lead Paragraph Title
              </Heading>
              <Text size="lg">
                Text Large (1.125rem → 1.25rem): Lead descriptions that set the tone before deeper
                technical body prose.
              </Text>
              <Text size="base">
                Text Base (1rem → 1.0625rem): Standard reading paragraph. Max line length is
                restricted to 62 characters to guarantee optimal scanning readability.
              </Text>
              <Text size="sm" variant="muted">
                Text Small (0.875rem): Secondary metadata, dates, tabular statistics, and captions.
              </Text>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
