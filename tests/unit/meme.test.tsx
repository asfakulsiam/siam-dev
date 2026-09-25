import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemeState } from "@/components/motion/MemeState";
import { MemeAsset } from "@/features/appearance/schema";

describe("MemeState Component", () => {
  it("renders image asset correctly with alt text", () => {
    const asset: MemeAsset = {
      type: "image",
      publicId: "data:image/svg+xml;utf8,<svg></svg>",
      alt: "Character checking wristwatch while waiting",
    };

    render(<MemeState asset={asset} />);
    const img = screen.getByAltText("Character checking wristwatch while waiting");
    expect(img).toBeDefined();
  });

  it("renders video element for video asset with loop controls", () => {
    const asset: MemeAsset = {
      type: "video",
      publicId: "devden/memes/waiting-clip",
      posterPublicId: "devden/memes/waiting-poster",
      alt: "Video of comic impatience",
    };

    render(<MemeState asset={asset} maxLoops={3} />);
    const video = screen.getByLabelText("Video of comic impatience");
    expect(video).toBeDefined();
    expect(video.tagName.toLowerCase()).toBe("video");
  });
});
