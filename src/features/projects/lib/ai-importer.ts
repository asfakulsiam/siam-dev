import { getGeminiClient } from "@/lib/gemini";
import { GitHubRepoAnalysis } from "./github";
import { projectInputSchema, ProjectInput } from "../schema";

/**
 * Shape of AI Project Import payload returned to populate the existing ProjectForm.
 * Strictly mirrors the existing project form fields.
 */
export interface GeneratedProjectFormFields {
  title: string;
  slug: string;
  tagline: string;
  category: "Design Systems" | "Full-Stack" | "Web Applications" | "Open Source";
  featured: boolean;
  published: boolean;
  year: string;
  timeline: string;
  role: string;
  client: string;
  summary: string;
  tags: string[];
  problem: string;
  solution: string;
  techStack: string[];
  architectureDecisions: string[];
  metrics: Array<{ label: string; value: string; description?: string }>;
  deliverables: Array<{ title: string; description: string }>;
  githubUrl: string;
  liveUrl?: string;
  coverImageAlt: string;
}

/**
 * Uses Gemini 2.5 Flash to analyze GitHub repository evidence and synthesize structured project data
 * strictly adhering to the existing project creation schema.
 */
export async function generateProjectFromGitHub(
  repoData: GitHubRepoAnalysis,
  additionalInstructions?: string,
): Promise<GeneratedProjectFormFields> {
  const ai = getGeminiClient();

  // Prepare condensed repository facts and evidence
  const evidence = {
    repositoryName: repoData.name,
    repositoryFullName: repoData.fullName,
    description: repoData.description,
    homepage: repoData.homepage,
    githubUrl: repoData.htmlUrl,
    topics: repoData.topics,
    languages: repoData.languages,
    createdYear: repoData.createdAt ? repoData.createdAt.slice(0, 4) : new Date().getFullYear().toString(),
    packageJson: repoData.files.packageJson
      ? {
          name: repoData.files.packageJson.name,
          description: repoData.files.packageJson.description,
          dependencies: Object.keys(
            (repoData.files.packageJson.dependencies as Record<string, string>) || {},
          ).slice(0, 20),
          devDependencies: Object.keys(
            (repoData.files.packageJson.devDependencies as Record<string, string>) || {},
          ).slice(0, 15),
          scripts: Object.keys(
            (repoData.files.packageJson.scripts as Record<string, string>) || {},
          ),
        }
      : undefined,
    requirementsTxt: repoData.files.requirementsTxt?.slice(0, 1000),
    pyprojectToml: repoData.files.pyprojectToml?.slice(0, 1000),
    cargoToml: repoData.files.cargoToml?.slice(0, 1000),
    goMod: repoData.files.goMod?.slice(0, 1000),
    keyDirectoryStructure: repoData.files.directoryTree.slice(0, 35),
    readmeExcerpt: repoData.files.readme ? repoData.files.readme.slice(0, 8000) : undefined,
  };

  const systemInstruction = `
You are a senior technical writer and design engineering curator for an elite developer-designer portfolio called "Dev Den".
Your job is to read real evidence from a GitHub repository and populate an existing portfolio project case study form.

CRITICAL RULES:
1. NEVER INVENT OR HALLUCINATE: Only use facts explicitly verified in the repository evidence (README, package.json, code structure, languages).
   - Do NOT invent user numbers, stars, downloads, awards, speed benchmarks, or fake clients.
   - If client is not specified, default to "Open Source" or "Self-directed".
   - If timeline is not mentioned, provide an honest estimate grounded in the repo commit span or "Ongoing / Open Source".
   - If role is not explicitly described, default to "Creator & Lead Developer" or "Core Maintainer".
2. CATEGORY: Must be EXACTLY one of: "Design Systems", "Full-Stack", "Web Applications", "Open Source".
   - Choose "Open Source" if it's primarily a library, CLI, package, or tool.
   - Choose "Design Systems" if it is primarily tokens, UI library, component kit, or style system.
   - Choose "Full-Stack" if it contains both backend/database/API and frontend.
   - Choose "Web Applications" if it's a frontend web app.
3. SLUG: URL-safe slug with lowercase letters, numbers, and hyphens only (e.g. "my-project").
4. WRITING STYLE: High-craft, considered, active voice, sentence case. No generic corporate marketing buzzwords.
5. METRICS: Provide 2-3 genuine metrics or technical facts derived from the repo (e.g., "Language: TypeScript 100%", "Dependencies: Zero external deps", "Test Coverage: 100%", "Bundle Size", "Stars", or key architecture milestones). Do NOT fabricate false percentage claims.
6. DELIVERABLES: 1 to 3 concrete technical artifacts produced by this project (e.g., "Component Library", "CLI Tool", "REST API", "Documentation").
7. PROBLEM & SOLUTION: Detailed technical problem statement and solution explanation based on the repository purpose and README.
8. RETURN VALID JSON: Must strictly match the requested JSON schema.
`.trim();

  const userPrompt = `
Analyze the following GitHub repository evidence and synthesize the project details for our portfolio:

REPOSITORY EVIDENCE:
${JSON.stringify(evidence, null, 2)}

${
  additionalInstructions && additionalInstructions.trim()
    ? `ADDITIONAL ADMIN INSTRUCTIONS:\n${additionalInstructions.trim()}\n`
    : ""
}

Generate the complete JSON object matching the required schema.
`.trim();

  // Use Gemini 2.5 Flash as requested
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.2, // Low temperature for factual fidelity
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error("Gemini returned an empty response.");
  }

  let rawJson: unknown;
  try {
    rawJson = JSON.parse(responseText);
  } catch {
    throw new Error("Gemini returned invalid JSON output.");
  }

  const generated = rawJson as Record<string, unknown>;

  // Convert raw JSON into strictly typed fields matching existing ProjectInput schema
  const title = String(generated.title || repoData.name || "Untitled Project").trim();
  const slug = String(generated.slug || repoData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")).trim();
  const tagline = String(generated.tagline || repoData.description || "Open source software project.").trim();
  
  let category: "Design Systems" | "Full-Stack" | "Web Applications" | "Open Source" = "Open Source";
  const validCategories = ["Design Systems", "Full-Stack", "Web Applications", "Open Source"];
  if (typeof generated.category === "string" && validCategories.includes(generated.category)) {
    category = generated.category as "Design Systems" | "Full-Stack" | "Web Applications" | "Open Source";
  }

  const year = String(generated.year || evidence.createdYear || new Date().getFullYear().toString()).slice(0, 4);
  const timeline = String(generated.timeline || "8 weeks");
  const role = String(generated.role || "Creator & Developer");
  const client = String(generated.client || "Open Source");
  const summary = String(generated.summary || tagline || "Technical project implementation.");

  const rawTags = Array.isArray(generated.tags) ? generated.tags.map(String) : repoData.languages;
  const tags = rawTags.length > 0 ? rawTags.slice(0, 6) : ["TypeScript", "Open Source"];

  const problem = String(generated.problem || "Project developed to address key engineering or design challenges.").trim();
  const solution = String(generated.solution || "Implementation providing structured architecture and performant utilities.").trim();

  const rawStack = Array.isArray(generated.techStack)
    ? generated.techStack.map(String)
    : repoData.languages;
  const techStack = rawStack.length > 0 ? rawStack : ["TypeScript", "Next.js"];

  const rawDecisions = Array.isArray(generated.architectureDecisions)
    ? generated.architectureDecisions.map(String)
    : [
        "Structured modular codebase for maintainability and clear separation of concerns.",
      ];
  const architectureDecisions = rawDecisions.length > 0 ? rawDecisions : ["Modular codebase architecture."];

  const rawMetrics = Array.isArray(generated.metrics)
    ? (generated.metrics as Array<{ label?: string; value?: string; description?: string }>)
    : [];
  const metrics = rawMetrics.length > 0
    ? rawMetrics.map((m) => ({
        label: String(m.label || "Key Feature").slice(0, 50),
        value: String(m.value || "Production").slice(0, 30),
        description: m.description ? String(m.description).slice(0, 100) : undefined,
      }))
    : [
        {
          label: "Open Source",
          value: repoData.stars > 0 ? `${repoData.stars}★` : "Public",
          description: `Repository on GitHub: ${repoData.fullName}`,
        },
      ];

  const rawDeliverables = Array.isArray(generated.deliverables)
    ? (generated.deliverables as Array<{ title?: string; description?: string }>)
    : [];
  const deliverables = rawDeliverables.length > 0
    ? rawDeliverables.map((d) => ({
        title: String(d.title || "Repository").slice(0, 80),
        description: String(d.description || "Core codebase and documentation").slice(0, 200),
      }))
    : [
        {
          title: "Source Code",
          description: "Production codebase, tests, and configuration",
        },
      ];

  const githubUrl = repoData.htmlUrl;
  const liveUrl = (repoData.homepage && repoData.homepage.startsWith("http")) ? repoData.homepage : undefined;
  const coverImageAlt = `${title} project architecture and repository showcase`;

  // Validate that the synthesized output complies with our existing projectInputSchema
  const validationCheck: Partial<ProjectInput> = {
    slug,
    title,
    tagline,
    category,
    featured: false,
    published: true,
    sortOrder: 0,
    year,
    timeline,
    role,
    client,
    summary,
    coverImage: {
      src: "https://picsum.photos/seed/project/1200/800",
      alt: coverImageAlt,
      aspectRatio: "16/9",
    },
    tags,
    problem,
    solution,
    architecture: {
      stack: techStack,
      decisions: architectureDecisions,
    },
    metrics,
    deliverables,
    links: {
      github: githubUrl,
      live: liveUrl,
    },
    sections: [],
  };

  const validationResult = projectInputSchema.safeParse(validationCheck);
  if (!validationResult.success) {
    const errorDetails = validationResult.error.flatten().fieldErrors;
    throw new Error(
      `AI generated fields did not pass project schema validation: ${JSON.stringify(errorDetails)}`,
    );
  }

  return {
    title,
    slug,
    tagline,
    category,
    featured: false,
    published: true,
    year,
    timeline,
    role,
    client,
    summary,
    tags,
    problem,
    solution,
    techStack,
    architectureDecisions,
    metrics,
    deliverables,
    githubUrl,
    liveUrl,
    coverImageAlt,
  };
}
