import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ProjectCard } from "@/features/projects/components/ProjectCard";
import { WorkGallery } from "@/features/projects/components/WorkGallery";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { staticProjects } from "@/features/projects/data";

describe("Phase 2 Component Testing", () => {
  it("renders ProjectCard with title, category, and tags", () => {
    const project = staticProjects[0]!;
    render(<ProjectCard project={project} />);

    expect(screen.getByText(project.title)).toBeDefined();
    expect(screen.getByText(project.category)).toBeDefined();
    expect(screen.getByText(project.summary)).toBeDefined();
  });

  it("filters projects in WorkGallery when selecting a category", () => {
    render(<WorkGallery initialProjects={staticProjects} />);

    // Initially shows all projects
    expect(screen.getByText("Stride Design System")).toBeDefined();
    expect(screen.getByText("Pulse Analytics Platform")).toBeDefined();

    // Click "Design Systems" category tab
    const designSystemsTab = screen.getByRole("tab", { name: /Design Systems/i });
    fireEvent.click(designSystemsTab);

    // Stride should still be visible, Pulse should be filtered out
    expect(screen.getByText("Stride Design System")).toBeDefined();
    expect(screen.queryByText("Pulse Analytics Platform")).toBeNull();
  });

  it("shows validation error on empty submit in ContactForm", async () => {
    render(<ContactForm />);

    const submitBtn = screen.getByRole("button", { name: /Send Message/i });
    fireEvent.click(submitBtn);

    // Error messages should appear
    expect(await screen.findByText(/at least 2 characters/i)).toBeDefined();
    expect(await screen.findByText(/provide a valid email/i)).toBeDefined();
  });
});
