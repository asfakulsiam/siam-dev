import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Heading, Text } from "@/components/ui/Heading";
import { Input } from "@/components/ui/Input";

describe("Phase 1 UI Primitives", () => {
  it("renders Button correctly with variant classes", () => {
    render(<Button variant="primary">Click Me</Button>);
    const btn = screen.getByRole("button", { name: /click me/i });
    expect(btn).toBeDefined();
    expect(btn.className).toContain("bg-[var(--accent)]");
  });

  it("renders Badge correctly with variant", () => {
    render(<Badge variant="success">Active</Badge>);
    const badge = screen.getByText("Active");
    expect(badge).toBeDefined();
    expect(badge.className).toContain("rounded-[var(--r-pill)]");
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
