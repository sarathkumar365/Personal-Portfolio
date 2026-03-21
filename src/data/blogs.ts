import fs from "fs/promises";
import path from "path";

import type { BlogPost, BlogSummary } from "./types";

const blogsDir = path.join(process.cwd(), "data-source", "blogs");
const isDevMode = process.env.NODE_ENV !== "production";

let cachedPosts: BlogPost[] | null = null;

async function loadBlogPosts(): Promise<BlogPost[]> {
  try {
    await fs.access(blogsDir);
  } catch {
    return [];
  }

  let entries: string[] = [];

  try {
    const dirEntries = await fs.readdir(blogsDir, { withFileTypes: true });
    entries = dirEntries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => path.join(blogsDir, entry.name));
  } catch {
    return [];
  }

  const posts: BlogPost[] = [];

  await Promise.all(
    entries.map(async (filePath) => {
      try {
        const raw = await fs.readFile(filePath, "utf-8");
        const parsed = JSON.parse(raw) as BlogPost;

        if (!parsed?.slug || !parsed?.title || !parsed?.date || !parsed?.summary || !parsed?.content) {
          return;
        }

        posts.push(parsed);
      } catch {
        // Ignore malformed blog entries to avoid breaking the site when files are missing or invalid.
      }
    }),
  );

  return posts;
}

async function ensurePosts(): Promise<BlogPost[]> {
  if (isDevMode) {
    return loadBlogPosts();
  }

  if (cachedPosts) {
    return cachedPosts;
  }

  cachedPosts = await loadBlogPosts();
  return cachedPosts;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const posts = await ensurePosts();
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getBlogSummaries(): Promise<BlogSummary[]> {
  const posts = await getBlogPosts();
  return posts.map(({ slug, title, date, summary }) => ({
    slug,
    title,
    date,
    summary,
  }));
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await ensurePosts();
  return posts.find((post) => post.slug === slug);
}
