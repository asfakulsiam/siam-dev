export interface ProjectMetric {
  label: string;
  value: string;
  description?: string;
}

export interface ProjectDeliverable {
  title: string;
  description: string;
}

export interface ProjectSection {
  title: string;
  subtitle?: string;
  content: string[];
  takeaways?: string[];
}

export interface Project {
  id?: string;
  slug: string;
  title: string;
  tagline: string;
  category: "Design Systems" | "Full-Stack" | "Web Applications" | "Open Source";
  featured: boolean;
  published?: boolean;
  sortOrder?: number;
  year: string;
  timeline: string;
  role: string;
  client: string;
  summary: string;
  coverImage: {
    src: string;
    alt: string;
    aspectRatio: string;
  };
  tags: string[];
  metrics: ProjectMetric[];
  deliverables: ProjectDeliverable[];
  problem: string;
  solution: string;
  architecture: {
    stack: string[];
    decisions: string[];
  };
  sections: ProjectSection[];
  links?: {
    live?: string;
    github?: string;
  };
}
