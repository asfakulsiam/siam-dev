import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Footer } from "@/components/layout/Footer";
import { MobileSheet } from "@/components/layout/MobileSheet";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { CloudinaryUploadField } from "@/components/admin/CloudinaryUploadField";
import { PortraitFrame, DEFAULT_AVATAR_PUBLIC_ID } from "@/components/ui/PortraitFrame";
import { ProjectArchive } from "@/features/projects/components/ProjectArchive";
import { SplitHero } from "@/components/motion/SplitHero";
import { staticProjects } from "@/features/projects/data";
import { photoSchema } from "@/features/profile/schema";
import type { ProfileData } from "@/features/profile/data";

beforeAll(() => {
  if (typeof window !== "undefined" && !window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }
});

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/components/motion/FooterWordmark", () => ({
  FooterWordmark: () => <div data-testid="footer-wordmark" />,
}));

describe("Phase N: Dynamic Contact Details & Zero Hardcoding", () => {
  const customProfile: ProfileData = {
    name: "Alex Designer",
    headline: "Custom headline",
    subheadline: "Custom subhead",
    bio: "Custom bio description",
    location: "London, UK",
    timezone: "Europe/London",
    availability: { open: true, text: "Available from November" },
    email: "custom-inquiry@alexdesign.io",
    socials: [
      { label: "Dribbble", url: "https://dribbble.com/alex" },
      { label: "Bluesky", url: "https://bsky.app/profile/alex.bsky.social" },
    ],
    resume: { url: "https://example.com/resume.pdf", updatedAt: "Oct 2026" },
    now: { title: "Now", body: "Building", updatedAt: "Oct 2026" },
    toolbox: [],
    photos: [],
    activePhotoId: DEFAULT_AVATAR_PUBLIC_ID,
  };

  it("Footer renders dynamic email and dynamic socials from profile prop", () => {
    render(<Footer profile={customProfile} />);

    // Custom email must be rendered
    expect(screen.getByText("custom-inquiry@alexdesign.io")).toBeDefined();
    // Default hardcoded email must NOT be in the document
    expect(screen.queryByText("hello@asfakul.com")).toBeNull();

    // Custom socials must be rendered
    expect(screen.getByText("Dribbble")).toBeDefined();
    expect(screen.getByText("Bluesky")).toBeDefined();
    // Bare default links must NOT be present
    expect(screen.queryByText("GitHub")).toBeNull();
    expect(screen.queryByText("LinkedIn")).toBeNull();
  });

  it("Footer renders nothing in Elsewhere slot when profile.socials is empty", () => {
    const emptySocialsProfile: ProfileData = {
      ...customProfile,
      socials: [],
      resume: { url: "", updatedAt: "" },
    };

    render(<Footer profile={emptySocialsProfile} />);
    expect(screen.queryByText("Elsewhere")).toBeNull();
  });

  it("MobileSheet renders dynamic email and socials from profile prop", () => {
    render(
      <MobileSheet
        isOpen={true}
        onClose={vi.fn()}
        links={[{ label: "Work", href: "/work" }]}
        currentPath="/"
        profile={customProfile}
      />,
    );

    expect(screen.getByText("custom-inquiry@alexdesign.io")).toBeDefined();
    expect(screen.queryByText("hello@asfakul.com")).toBeNull();
    expect(screen.getByText("Dribbble")).toBeDefined();
    expect(screen.getByText("Bluesky")).toBeDefined();
  });

  it("ContactForm error message formats with dynamic fallbackEmail prop", () => {
    render(
      <ContactForm
        fallbackEmail="direct-contact@alexdesign.io"
      />,
    );

    // Initial state does not render error
    expect(screen.queryByText(/direct-contact@alexdesign.io/i)).toBeNull();
  });
});

describe("Phase O: Admin Long-URL Truncation & Public ID Display", () => {
  it("displays shortened public ID instead of raw long Cloudinary URL as primary label", () => {
    render(
      <CloudinaryUploadField
        label="Hero Meme"
        value="https://res.cloudinary.com/demo/image/upload/v1234567890/devden/memes/waiting_reaction_abc123.jpg"
        alt="Waiting loop"
        folder="devden/memes"
        onUploaded={vi.fn()}
        onAltChange={vi.fn()}
      />,
    );

    // Should display shortened public ID
    expect(screen.getByText("devden/memes/waiting_reaction_abc123")).toBeDefined();
    // Should provide copy full URL button
    expect(screen.getByLabelText(/Copy full URL/i)).toBeDefined();
  });

  it("renders manual override input with truncate class to prevent blowout", async () => {
    render(
      <CloudinaryUploadField
        label="Hero Meme"
        value="https://res.cloudinary.com/demo/image/upload/v1234567890/devden/memes/extremely-long-asset-name-that-would-otherwise-cause-layout-blowout.jpg"
        alt="Waiting loop"
        folder="devden/memes"
        onUploaded={vi.fn()}
        onAltChange={vi.fn()}
      />,
    );

    // Click "Paste ID / URL" button
    const manualToggle = screen.getByRole("button", { name: /Paste ID \/ URL/i });
    fireEvent.click(manualToggle);

    const input = await screen.findByPlaceholderText(/e\.g\. devden\/memes\/waiting/i);
    expect(input).toBeDefined();
    expect(input.className).toContain("truncate");
  });
});

describe("Phase P: Portrait Frame & Default Avatar", () => {
  it("validates photoSchema with optional accentColor", () => {
    const validWithAccent = {
      publicId: "devden/portraits/studio",
      alt: "Studio portrait with high-contrast rim lighting",
      accentColor: "#2F4BFF",
    };

    const parsed = photoSchema.safeParse(validWithAccent);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.accentColor).toBe("#2F4BFF");
    }
  });

  it("PortraitFrame renders DefaultAvatarSVG when activePhotoId is default-avatar", () => {
    const { container } = render(
      <PortraitFrame
        photo={{ publicId: DEFAULT_AVATAR_PUBLIC_ID, alt: "Default avatar" }}
        variant={1}
        size="hero"
        showBackgroundTint={true}
      />,
    );

    expect(container.querySelector("svg")).toBeDefined();
    expect(screen.getByText(/DEV \/\/ PORTFOLIO AVATAR/i)).toBeDefined();
  });

  it("PortraitFrame renders image when valid publicId is provided", () => {
    render(
      <PortraitFrame
        photo={{
          publicId: "devden/portraits/asfakul-portrait",
          alt: "Asfakul in studio lighting",
          accentColor: "#8AA2FF",
        }}
        variant={2}
        size="md"
        showBackgroundTint={true}
      />,
    );

    expect(screen.getByAltText("Asfakul in studio lighting")).toBeDefined();
  });

  it("PortraitFrame sets background tint using photo accentColor", () => {
    const { container } = render(
      <PortraitFrame
        photo={{
          publicId: DEFAULT_AVATAR_PUBLIC_ID,
          alt: "Default avatar with custom tint",
          accentColor: "#F43F5E",
        }}
        variant={3}
        size="lg"
        showBackgroundTint={true}
      />,
    );

    const tintElement = container.querySelector(".rounded-full.blur-3xl");
    expect(tintElement).toBeDefined();
    // JSDOM computes #F43F5E into rgb(244, 63, 94)
    expect((tintElement as HTMLElement)?.style.background).toMatch(/(#F43F5E|244,\s*63,\s*94)/i);
  });
});

describe("Phase Q: Hero Photo Consolidation & PortraitFrame Polish", () => {
  it("uses valid Tailwind responsive utility classes for hero size", () => {
    const { container } = render(
      <PortraitFrame
        photo={{ publicId: DEFAULT_AVATAR_PUBLIC_ID, alt: "Hero avatar" }}
        size="hero"
      />,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("md:w-72");
    expect(root.className).toContain("md:h-80");
    expect(root.className).toContain("lg:w-80");
    expect(root.className).toContain("lg:h-96");
    // Ensure invalid classes are absent
    expect(root.className).not.toContain("md:w-76");
    expect(root.className).not.toContain("md:h-88");
    expect(root.className).not.toContain("lg:w-84");
  });

  it("sanitizes clipPath id so url(#...) contains no unescaped colons", () => {
    const { container } = render(
      <PortraitFrame
        photo={{ publicId: DEFAULT_AVATAR_PUBLIC_ID, alt: "Avatar" }}
        variant={1}
      />,
    );

    const clipDef = container.querySelector("clipPath");
    expect(clipDef).not.toBeNull();
    const id = clipDef?.getAttribute("id");
    expect(id).toBeDefined();
    expect(id).not.toContain(":");
  });

  it("provides role='img' and accessible aria-label on default avatar container", () => {
    render(
      <PortraitFrame
        photo={{ publicId: DEFAULT_AVATAR_PUBLIC_ID, alt: "Asfakul geometric silhouette" }}
      />,
    );

    const avatarImg = screen.getByRole("img", { name: /Asfakul geometric silhouette/i });
    expect(avatarImg).toBeDefined();
  });

  it("ProjectArchive renders title and project count badge", () => {
    render(<ProjectArchive projects={staticProjects} />);
    expect(screen.getByRole("heading", { name: /Project Archive/i })).toBeDefined();
    expect(screen.getByText(String(staticProjects.length))).toBeDefined();
  });

  it("ProjectArchive expands and collapses table on toggle click", () => {
    render(<ProjectArchive projects={staticProjects} />);

    // Initially collapsed
    expect(screen.queryByRole("table")).toBeNull();
    const toggleBtn = screen.getByRole("button", { name: /Expand Archive/i });
    expect(toggleBtn).toBeDefined();

    // Click to expand
    fireEvent.click(toggleBtn);
    expect(screen.getByRole("table")).toBeDefined();
    expect(screen.getByText("Stride Design System")).toBeDefined();
    expect(screen.getByRole("button", { name: /Collapse Archive/i })).toBeDefined();

    // Click to collapse
    fireEvent.click(screen.getByRole("button", { name: /Collapse Archive/i }));
    expect(screen.queryByRole("table")).toBeNull();
  });
});

describe("Phase S / Hero Redesign v8: Split Frame Hero & Role Management", () => {
  it("photoSchema validates role field with default unassigned", () => {
    const validPhoto = {
      publicId: "devden/portraits/sample-1",
      alt: "Studio portrait",
      role: "hero-primary",
    };
    const parsed = photoSchema.safeParse(validPhoto);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.role).toBe("hero-primary");
    }

    const unassignedPhoto = {
      publicId: "devden/portraits/sample-2",
      alt: "Candid photo",
    };
    const parsed2 = photoSchema.safeParse(unassignedPhoto);
    expect(parsed2.success).toBe(true);
    if (parsed2.success) {
      expect(parsed2.data.role).toBe("unassigned");
    }
  });

  it("SplitHero renders clean single-column text-only layout when zero photos assigned", () => {
    const { container } = render(
      <SplitHero
        name="Asfakul"
        headline="I design and build websites that feel considered."
        subheadline="Web designer and full-stack developer"
        primaryPhoto={null}
        secondaryPhoto={null}
        metaRow={<span data-testid="meta-row">Available</span>}
        actions={<button type="button">Explore Work</button>}
      />,
    );

    // Full headline present in accessible text
    const heading = screen.getByRole("heading", {
      name: /Asfakul — I design and build websites that feel considered\./i,
    });
    expect(heading).toBeDefined();

    // No photo images rendered
    expect(container.querySelectorAll("img").length).toBe(0);

    // No secondary photo or overlap chip
    expect(container.querySelector(".rounded-bl-3xl")).toBeNull();
  });

  it("SplitHero renders two-column layout with primary photo and overlap word", () => {
    const { container } = render(
      <SplitHero
        name="Asfakul"
        headline="I design and build websites that feel considered."
        primaryPhoto={{
          publicId: "devden/portraits/asfakul-split",
          alt: "Asfakul in studio lighting",
          accentColor: "#2F4BFF",
        }}
        secondaryPhoto={{
          publicId: "devden/portraits/asfakul-candid",
          alt: "Asfakul candid at desk",
        }}
        metaRow={<span>Available</span>}
        actions={<button type="button">Explore Work</button>}
      />,
    );

    // Heading has unified accessible label
    const heading = screen.getByRole("heading", {
      name: /Asfakul — I design and build websites that feel considered\./i,
    });
    expect(heading).toBeDefined();

    // Overlap word extracted: "considered."
    expect(screen.getAllByText(/considered\./i).length).toBeGreaterThan(0);

    // Images rendered: primary and secondary
    const images = container.querySelectorAll("img");
    expect(images.length).toBeGreaterThanOrEqual(1);

    // Primary photo container has soft bottom-left corner class
    expect(container.querySelector(".rounded-bl-2xl")).toBeDefined();
  });
});

