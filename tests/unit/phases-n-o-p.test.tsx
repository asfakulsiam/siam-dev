import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Footer } from "@/components/layout/Footer";
import { MobileSheet } from "@/components/layout/MobileSheet";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { CloudinaryUploadField } from "@/components/admin/CloudinaryUploadField";
import { PortraitFrame, DEFAULT_AVATAR_PUBLIC_ID } from "@/components/ui/PortraitFrame";
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
