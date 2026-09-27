import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import fs from "fs";
import path from "path";

async function buildCss() {
  const inputPath = path.resolve(process.cwd(), "app/globals.css");
  const outputPath = path.resolve(process.cwd(), "public/css/globals.css");
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const css = fs.readFileSync(inputPath, "utf8");
  const result = await postcss([tailwind()]).process(css, { from: inputPath });
  fs.writeFileSync(outputPath, result.css);
  console.log(`[css:build] Generated ${outputPath} (${result.css.length} bytes)`);
}

buildCss().catch((err) => {
  console.error("[css:build] Error:", err);
  process.exit(1);
});
