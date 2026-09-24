import { vi } from "vitest";
import React from "react";

vi.mock("next/image", () => ({
  default: (
    props: React.ImgHTMLAttributes<HTMLImageElement> & {
      fill?: boolean;
      priority?: boolean;
      blurDataURL?: string;
      placeholder?: string;
    }
  ) => {
    const { fill, priority, blurDataURL, placeholder, ...rest } = props;
    void fill;
    void priority;
    void blurDataURL;
    void placeholder;
    return React.createElement("img", {
      ...rest,
      alt: props.alt || "",
    });
  },
}));
