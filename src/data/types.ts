import type { ExperienceDetail } from "../types/experiences";

export interface ContactInfo {
  phone: string;
  location: string;
  email: string;
  linkedin: string;
  github: string;
}

export interface Stat {
  label: string;
  value: string;
}

export interface SkillCategory {
  title: string;
  items: string[];
}

export interface SkillsSection {
  heading: string;
  categories: SkillCategory[];
}

export interface EducationEntry {
  school: string;
  period: string;
  program: string;
  location: string;
  gpa?: string;
  note?: string;
}

export interface CredentialsSection {
  heading: string;
  certifications: string[];
  education: EducationEntry[];
}

export interface CallToAction {
  label: string;
  heading: string;
  lines: string[];
  primary: {
    label: string;
    href: string;
  };
  secondary: Array<{
    label: string;
    href: string;
  }>;
  meta: string;
  signature?: string;
}

export interface HeroSection {
  locationLabel: string;
  name: string;
  title: string;
  summary: string;
  contact: ContactInfo;
}

export interface HomeData {
  hero: HeroSection;
  stats: Stat[];
  experiences: ExperienceDetail[];
  skills: SkillsSection;
  credentials: CredentialsSection;
  cta: CallToAction;
}

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  repo: string;
  title: string;
  year: string;
  stack: string;
  description: string;
  highlights: string[];
  links: ProjectLink[];
  stars?: number;
  updatedAt?: string;
  topics?: string[];
  visible?: boolean;
}

export interface BlogPost {
  slug: string;
  title: string;
  author: string;
  date: string;
  summary: string;
  content: string[];
  sourceUrl?: string;
  sourceLabel?: string;
}

export type BlogSummary = Pick<BlogPost, "slug" | "title" | "date" | "summary">;
