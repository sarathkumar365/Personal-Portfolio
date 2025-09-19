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

export interface SkillsSection {
  heading: string;
  items: string[];
}

export interface CredentialsSection {
  heading: string;
  items: string[];
}

export interface CallToAction {
  heading: string;
  body: string;
  closing: string;
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
  title: string;
  year: string;
  stack: string;
  description: string;
  links: ProjectLink[];
}

export interface BlogPost {
  slug: string;
  title: string;
  author: string;
  date: string;
  summary: string;
  content: string[];
}

export type BlogSummary = Pick<BlogPost, "slug" | "title" | "date" | "summary">;
