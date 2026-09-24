import React from "react";
import { siteConfig } from "@/config/site";
import type { Project } from "@/features/projects/types";

/**
 * Type definitions for Schema.org Structured Data
 */
export interface PersonJsonLd {
  "@context": "https://schema.org";
  "@type": "Person";
  name: string;
  url: string;
  jobTitle: string;
  worksFor?: {
    "@type": "Organization";
    name: string;
  };
  sameAs: string[];
  description: string;
  address?: {
    "@type": "PostalAddress";
    addressCountry: string;
  };
  knowsAbout?: string[];
}

export interface WebSiteJsonLd {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  description: string;
  author: {
    "@type": "Person";
    name: string;
  };
}

export interface ProfilePageJsonLd {
  "@context": "https://schema.org";
  "@type": "ProfilePage";
  name: string;
  url: string;
  mainEntity: PersonJsonLd;
}

export interface CreativeWorkJsonLd {
  "@context": "https://schema.org";
  "@type": "CreativeWork";
  name: string;
  headline: string;
  description: string;
  url: string;
  image?: string;
  dateCreated?: string;
  datePublished?: string;
  keywords?: string[];
  creator: {
    "@type": "Person";
    name: string;
    url: string;
  };
}

/**
 * Builds the Person JSON-LD entity for Asfakul
 */
export function generatePersonJsonLd(): PersonJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.author.name,
    url: siteConfig.url,
    jobTitle: "Web Designer & Full-Stack Developer",
    sameAs: [siteConfig.links.github, siteConfig.links.linkedin],
    description: siteConfig.description,
    address: {
      "@type": "PostalAddress",
      addressCountry: siteConfig.author.location,
    },
    knowsAbout: [
      "Web Design",
      "Full-Stack Development",
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Design Systems",
      "GSAP Motion Design",
      "WCAG 2.2 Accessibility",
    ],
  };
}

/**
 * Builds the WebSite JSON-LD entity
 */
export function generateWebSiteJsonLd(): WebSiteJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.title,
    url: siteConfig.url,
    description: siteConfig.description,
    author: {
      "@type": "Person",
      name: siteConfig.author.name,
    },
  };
}

/**
 * Builds the ProfilePage JSON-LD entity for the /about page
 */
export function generateProfilePageJsonLd(): ProfilePageJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `About ${siteConfig.author.name} — Web Designer & Full-Stack Developer`,
    url: `${siteConfig.url}/about`,
    mainEntity: generatePersonJsonLd(),
  };
}

/**
 * Builds the CreativeWork JSON-LD entity for a project case study
 */
export function generateProjectJsonLd(project: Project): CreativeWorkJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: project.tagline,
    description: project.summary || project.problem || project.tagline,
    url: `${siteConfig.url}/work/${project.slug}`,
    image:
      project.coverImage.src ||
      `${siteConfig.url}/api/og?title=${encodeURIComponent(project.title)}&category=${encodeURIComponent(project.category)}`,
    dateCreated: project.timeline.split("–")[0]?.trim() || "2025",
    datePublished: "2026-01-01T00:00:00Z",
    keywords: [project.category, ...(project.architecture?.stack || [])],
    creator: {
      "@type": "Person",
      name: siteConfig.author.name,
      url: siteConfig.url,
    },
  };
}

/**
 * React Component to safely render JSON-LD script tags
 */
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
