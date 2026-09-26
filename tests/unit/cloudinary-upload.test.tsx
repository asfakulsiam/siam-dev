import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CloudinaryUploadField } from "@/components/admin/CloudinaryUploadField";
import { deleteCloudinaryAssetAction } from "@/lib/cloudinary-actions";

describe("Phase K: Cloudinary Upload Field & Asset Management", () => {
  it("renders upload button, label, and required alt text input", () => {
    const handleUploaded = vi.fn();
    const handleAltChange = vi.fn();

    render(
      <CloudinaryUploadField
        label="Test Meme Reaction"
        value=""
        alt=""
        folder="devden/memes"
        onUploaded={handleUploaded}
        onAltChange={handleAltChange}
        required
        altRequired
      />,
    );

    expect(screen.getByText("Test Meme Reaction")).toBeDefined();
    expect(screen.getByRole("button", { name: /Choose File to Upload/i })).toBeDefined();
    expect(screen.getByLabelText(/Accessibility Alt Text/i)).toBeDefined();
  });

  it("displays existing asset preview and public ID", () => {
    render(
      <CloudinaryUploadField
        label="Portrait Photo"
        value="devden/portraits/sample-portrait"
        alt="Studio portrait"
        folder="devden/portraits"
        onUploaded={vi.fn()}
        onAltChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Replace File")).toBeDefined();
    expect(screen.getByText("devden/portraits/sample-portrait")).toBeDefined();
    expect(screen.getByAltText("Studio portrait")).toBeDefined();
  });

  it("rejects image files exceeding 10MB client-side", async () => {
    render(
      <CloudinaryUploadField
        label="Large Image Test"
        value=""
        alt=""
        folder="devden/projects"
        onUploaded={vi.fn()}
        onAltChange={vi.fn()}
      />,
    );

    const oversizedFile = new File(["x".repeat(11 * 1024 * 1024)], "huge.jpg", {
      type: "image/jpeg",
    });

    const fileInput = screen.getByLabelText(/Upload file for Large Image Test/i) as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [oversizedFile] } });

    const errorAlert = await screen.findByText(/Image is too large/i);
    expect(errorAlert).toBeDefined();
  });

  it("allows power-user manual ID entry via toggle", () => {
    const handleUploaded = vi.fn();

    render(
      <CloudinaryUploadField
        label="Power User Field"
        value="devden/memes/custom-id"
        alt="Custom alt"
        folder="devden/memes"
        onUploaded={handleUploaded}
        onAltChange={vi.fn()}
      />,
    );

    const toggleBtn = screen.getByRole("button", { name: /Paste ID \/ URL/i });
    fireEvent.click(toggleBtn);

    const manualInput = screen.getByLabelText(/Direct Public ID or Hosted URL/i);
    expect(manualInput).toBeDefined();

    fireEvent.change(manualInput, { target: { value: "devden/memes/updated-custom-id" } });
    expect(handleUploaded).toHaveBeenCalledWith(
      "devden/memes/updated-custom-id",
      "devden/memes/updated-custom-id",
    );
  });

  it("deleteCloudinaryAssetAction rejects unauthenticated calls", async () => {
    const unauthRes = await deleteCloudinaryAssetAction("devden/test-asset");
    expect(unauthRes.ok).toBe(false);
    expect(unauthRes.message).toMatch(/unauthorized/i);
  });

  it("deleteCloudinaryAssetAction safely handles data URIs and empty IDs when authorized", async () => {
    const authGuard = await import("@/lib/auth-guard");
    vi.spyOn(authGuard, "requireAdmin").mockResolvedValue({
      user: { email: "admin@example.com", name: "Admin", role: "admin" },
      expires: "2099-01-01T00:00:00.000Z",
    });

    const emptyRes = await deleteCloudinaryAssetAction("");
    expect(emptyRes.ok).toBe(false);

    const dataUriRes = await deleteCloudinaryAssetAction("data:image/svg+xml;utf8,<svg></svg>");
    expect(dataUriRes.ok).toBe(true);

    const httpUrlRes = await deleteCloudinaryAssetAction("https://example.com/external-photo.jpg");
    expect(httpUrlRes.ok).toBe(true);
  });
});
