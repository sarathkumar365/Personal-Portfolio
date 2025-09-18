import homeJson from "../../data-source/home.json";
import projectsJson from "../../data-source/projects.json";
import blogDurable from "../../data-source/blogs/durable-portfolio-interfaces.json";
import blogSeo from "../../data-source/blogs/typewriter-inspired-seo.json";
import blogMotion from "../../data-source/blogs/motion-for-developers.json";

import type {
  BlogPost,
  BlogSummary,
  HomeData,
  Project,
} from "./types";

const homeData: HomeData = homeJson;
const projectsData: Project[] = projectsJson;
const blogPosts: BlogPost[] = [blogDurable, blogSeo, blogMotion];

export function getHomeData(): HomeData {
  return homeData;
}

export function getProjects(): Project[] {
  return projectsData;
}

export function getBlogPosts(): BlogPost[] {
  return [...blogPosts].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getBlogSummaries(): BlogSummary[] {
  return getBlogPosts().map(({ slug, title, date, summary }) => ({
    slug,
    title,
    date,
    summary,
  }));
}

export function getBlogBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
