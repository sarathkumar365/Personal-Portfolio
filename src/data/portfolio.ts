import homeJson from "../../data-source/home.json";
import fs from "fs/promises";
import path from "path";

import type { HomeData, Project } from "./types";

const homeData: HomeData = homeJson;
const projectsVisibilityPath = path.join(
  process.cwd(),
  "data-source",
  "projects-visibility.json",
);
const projectsOrderPath = path.join(
  process.cwd(),
  "data-source",
  "projects-order.json",
);
const projectsOverridesPath = path.join(
  process.cwd(),
  "data-source",
  "projects-overrides.json",
);
const projectsDataPath = path.join(process.cwd(), "data-source", "projects.json");
const githubApiBase = "https://api.github.com";
const isDevMode = process.env.NODE_ENV !== "production";

type ProjectCurationConfig = {
  visibility: Record<string, boolean>;
  order: string[];
  overrides: ProjectOverrides;
};

type ProjectOverrideFields = Partial<
  Pick<Project, "title" | "year" | "stack" | "description" | "highlights">
>;
type ProjectOverrides = Record<string, ProjectOverrideFields>;

type GithubRepo = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  created_at: string;
  updated_at: string;
  stargazers_count: number;
  language: string | null;
  topics?: string[];
  archived: boolean;
  fork: boolean;
  disabled?: boolean;
  private?: boolean;
};

const titleFromRepo = (name: string) =>
  name
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const stackFromRepo = (repo: GithubRepo) => {
  const items = [
    ...(repo.language ? [repo.language] : []),
    ...((repo.topics ?? []).slice(0, 3).map((topic) =>
      topic
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase()),
    )),
  ];

  return items.length > 0 ? items.join(" · ") : "GitHub Repository";
};

const highlightsFromRepo = (repo: GithubRepo) => {
  const highlights = [
    `Updated ${new Date(repo.updated_at).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })}.`,
  ];

  if (repo.topics && repo.topics.length > 0) {
    highlights.push(
      `Topics: ${repo.topics
        .slice(0, 4)
        .map((topic) => topic.replace(/[-_]/g, " "))
        .join(", ")}.`,
    );
  }

  return highlights;
};

const mapGithubRepoToProject = (repo: GithubRepo): Project => {
  const links = [{ label: "GitHub", url: repo.html_url }];
  if (repo.homepage) {
    links.unshift({ label: "Live", url: repo.homepage });
  }

  return {
    repo: repo.name,
    title: titleFromRepo(repo.name),
    year: new Date(repo.created_at).getFullYear().toString(),
    stack: stackFromRepo(repo),
    description: repo.description || "Repository-based project synced from GitHub.",
    highlights: highlightsFromRepo(repo),
    links,
    stars: repo.stargazers_count,
    updatedAt: repo.updated_at,
    topics: repo.topics ?? [],
  };
};

const requireRepoKey = (project: Pick<Project, "repo" | "title">) => {
  const repo = project.repo?.trim();
  if (repo) {
    return repo;
  }

  if (isDevMode) {
    console.warn(
      `[projects] Missing required repo key for backup project "${project.title}". Add "repo" in data-source/projects.json.`,
    );
  }
  return "";
};

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function getProjectCurationConfig(): Promise<ProjectCurationConfig> {
  const [visibility, order, overrides] = await Promise.all([
    readJsonFile<Record<string, boolean>>(projectsVisibilityPath, {}),
    readJsonFile<string[]>(projectsOrderPath, []),
    readJsonFile<ProjectOverrides>(projectsOverridesPath, {}),
  ]);

  return {
    visibility,
    order,
    overrides,
  };
}

export async function saveProjectCurationConfig(config: ProjectCurationConfig) {
  const sanitizedOrder = [...new Set(config.order.map((item) => item.trim()).filter(Boolean))];
  const sanitizedVisibility = Object.fromEntries(
    Object.entries(config.visibility).map(([key, value]) => [key, Boolean(value)]),
  );
  const sanitizedOverrides = Object.fromEntries(
    Object.entries(config.overrides ?? {})
      .map(([repo, override]) => {
        const cleaned: ProjectOverrideFields = {};
        if (typeof override.title === "string") {
          cleaned.title = override.title.trim();
        }
        if (typeof override.year === "string") {
          cleaned.year = override.year.trim();
        }
        if (typeof override.stack === "string") {
          cleaned.stack = override.stack.trim();
        }
        if (typeof override.description === "string") {
          cleaned.description = override.description.trim();
        }
        if (Array.isArray(override.highlights)) {
          cleaned.highlights = override.highlights
            .map((item) => (typeof item === "string" ? item.trim() : ""))
            .filter(Boolean);
        }
        return [repo, cleaned] as const;
      })
      .filter(([, value]) => Object.keys(value).length > 0),
  );

  await Promise.all([
    fs.writeFile(projectsVisibilityPath, `${JSON.stringify(sanitizedVisibility, null, 2)}\n`),
    fs.writeFile(projectsOrderPath, `${JSON.stringify(sanitizedOrder, null, 2)}\n`),
    fs.writeFile(projectsOverridesPath, `${JSON.stringify(sanitizedOverrides, null, 2)}\n`),
  ]);
}

const getProjectKey = (project: Pick<Project, "repo" | "title">) => requireRepoKey(project);

function applyCurationConfig(
  projects: Project[],
  curation: ProjectCurationConfig,
  options?: { showHidden?: boolean },
) {
  const visibility = curation.visibility;
  const order = curation.order;
  const overrides = curation.overrides;
  const orderIndex = new Map(order.map((repo, index) => [repo, index]));
  const showHidden = options?.showHidden ?? false;

  const withVisibility = projects.map((project) => {
    const key = getProjectKey(project);
    if (!key) {
      return {
        ...project,
        visible: false,
      };
    }
    const manualOverride = overrides[key] ?? {};
    const configuredVisibility = visibility[key];
    const defaultVisibility = true;
    const visible = configuredVisibility ?? project.visible ?? defaultVisibility;

    return {
      ...project,
      ...manualOverride,
      repo: key,
      visible,
    };
  });

  const sorted = [...withVisibility].sort((a, b) => {
    const aIndex = orderIndex.get(getProjectKey(a));
    const bIndex = orderIndex.get(getProjectKey(b));

    if (aIndex !== undefined && bIndex !== undefined) {
      return aIndex - bIndex;
    }
    if (aIndex !== undefined) {
      return -1;
    }
    if (bIndex !== undefined) {
      return 1;
    }

    const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return bUpdated - aUpdated;
  });

  if (showHidden) {
    return sorted;
  }

  return sorted.filter((project) => project.visible);
}

async function fetchGithubProjects(): Promise<Project[] | null> {
  const username = process.env.GITHUB_USERNAME?.trim();
  if (!username) {
    return null;
  }

  const token = process.env.GITHUB_TOKEN?.trim();
  const limit = Number(process.env.GITHUB_PROJECT_LIMIT || "100");
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(limit, 100)) : 100;

  try {
    const requestOptions: RequestInit & { next?: { revalidate: number } } = isDevMode
      ? {
          headers: {
            Accept: "application/vnd.github+json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        }
      : {
          headers: {
            Accept: "application/vnd.github+json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          next: { revalidate: 300 },
        };

    const response = await fetch(
      `${githubApiBase}/users/${encodeURIComponent(username)}/repos?sort=updated&direction=desc&per_page=${safeLimit}&type=owner`,
      requestOptions,
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as GithubRepo[];
    const filtered = payload.filter(
      (repo) =>
        !repo.fork &&
        !repo.archived &&
        !repo.disabled &&
        !repo.private,
    );

    return filtered.map(mapGithubRepoToProject);
  } catch {
    return null;
  }
}

async function getBackupProjects() {
  const projectsData = await readJsonFile<Project[]>(projectsDataPath, []);
  const validProjects = projectsData.filter((project) => Boolean(requireRepoKey(project)));
  return validProjects.map((project) => ({
    ...project,
    repo: requireRepoKey(project),
  }));
}

export function getHomeData(): HomeData {
  return homeData;
}

export async function getProjects(options?: { showHidden?: boolean }): Promise<Project[]> {
  const showHidden = options?.showHidden ?? false;
  const baseProjects = await getBackupProjects();
  const curation = await getProjectCurationConfig();
  return applyCurationConfig(baseProjects, curation, { showHidden });
}

export async function refreshProjectsFromGithub(): Promise<{ count: number; message?: string }> {
  if (!isDevMode) {
    throw new Error("Project refresh is disabled in production.");
  }

  const githubProjects = await fetchGithubProjects();
  if (!githubProjects || githubProjects.length === 0) {
    return { count: 0, message: "No GitHub projects were fetched." };
  }

  const existingProjects = await readJsonFile<Project[]>(projectsDataPath, []);
  const existingMap = new Map(
    existingProjects
      .map((project) => [requireRepoKey(project), project] as const)
      .filter(([key]) => Boolean(key)),
  );

  const mergedProjects = githubProjects.map((project) => {
    const existing = existingMap.get(project.repo);
    if (!existing) {
      return project;
    }

    return {
      ...project,
      title: existing.title || project.title,
      year: existing.year || project.year,
      stack: existing.stack || project.stack,
      description: existing.description || project.description,
      highlights:
        Array.isArray(existing.highlights) && existing.highlights.length > 0
          ? existing.highlights
          : project.highlights,
      links: Array.isArray(existing.links) ? existing.links : project.links,
    };
  });

  const githubRepoSet = new Set(mergedProjects.map((project) => project.repo));
  const manualOnlyProjects = existingProjects.filter(
    (project) => Boolean(requireRepoKey(project)) && !githubRepoSet.has(requireRepoKey(project)),
  );
  const finalProjects = [...mergedProjects, ...manualOnlyProjects];

  await fs.writeFile(projectsDataPath, `${JSON.stringify(finalProjects, null, 2)}\n`);

  const curation = await getProjectCurationConfig();
  const repoSet = new Set(finalProjects.map((project) => requireRepoKey(project)).filter(Boolean));
  const nextVisibility = { ...curation.visibility };

  for (const repoKey of repoSet) {
    if (!(repoKey in nextVisibility)) {
      nextVisibility[repoKey] = false;
    }
  }

  for (const key of Object.keys(nextVisibility)) {
    if (!repoSet.has(key)) {
      nextVisibility[key] = false;
    }
  }

  await saveProjectCurationConfig({
    visibility: nextVisibility,
    order: curation.order,
    overrides: curation.overrides,
  });

  return { count: mergedProjects.length };
}
