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

export interface LighthouseScores {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  fcp?: string;
  lcp?: string;
  cls?: string;
  tbt?: string;
}

export interface ConversionStep {
  step: string;
  rate: number;
  count?: number;
}

export interface ProjectPerformanceData {
  lighthouse?: LighthouseScores;
  conversions?: ConversionStep[];
  summary?: string;
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
  performanceData?: ProjectPerformanceData;
  sections: ProjectSection[];
  links?: {
    live?: string;
    github?: string;
  };
}
