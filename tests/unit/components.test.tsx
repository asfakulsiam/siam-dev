import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Heading, Text } from "@/components/ui/Heading";
import { Input } from "@/components/ui/Input";

describe("Phase 1 & Phase V UI Primitives", () => {
  it("renders Button correctly with variant classes", () => {
    render(<Button variant="primary">Click Me</Button>);
    const btn = screen.getByRole("button", { name: /click me/i });
    expect(btn).toBeDefined();
    expect(btn.className).toContain("bg-[var(--accent)]");
  });

  it("renders Button with xs size for utility actions", () => {
    render(
      <Button variant="ghost" size="xs">
        Copy
      </Button>,
    );
    const btn = screen.getByRole("button", { name: /copy/i });
    expect(btn.className).toContain("h-6");
    expect(btn.className).toContain("px-2.5");
    expect(btn.className).toContain("text-[11px]");
  });

  it("exports buttonVariants helper for polymorphic elements", () => {
    const classes = buttonVariants({ variant: "outline", size: "sm" });
    expect(classes).toContain("border-[var(--line)]");
    expect(classes).toContain("h-8");
    expect(classes).toContain("px-3");
    expect(classes).toContain("text-xs");
  });

  it("renders Badge correctly with variant", () => {
    render(<Badge variant="success">Active</Badge>);
    const badge = screen.getByText("Active");
    expect(badge).toBeDefined();
    expect(badge.className).toContain("rounded-[var(--r-pill)]");
  });

  it("renders Badge with xs size and tag variant", () => {
    render(
      <Badge variant="tag" size="xs">
        Design Systems
      </Badge>,
    );
    const badge = screen.getByText("Design Systems");
    expect(badge.className).toContain("rounded-[var(--r-pill)]");
    expect(badge.className).toContain("text-[10px]");
    expect(badge.className).toContain("font-mono");
  });

  it("renders Heading with semantic tag and balance styling", () => {
    render(
      <Heading as="h1" size="4xl">
        Test Heading
      </Heading>,
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeDefined();
    expect(heading.className).toContain("text-balance");
  });

  it("renders Input with error state styling", () => {
    render(<Input error placeholder="Email" />);
    const input = screen.getByPlaceholderText("Email");
    expect(input.className).toContain("border-[var(--danger)]");
  });
});
