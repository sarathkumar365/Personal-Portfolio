"use client";

import { useMemo, useState } from "react";

import ProjectModal from "@/components/project-modal";
import type { Project } from "@/data/types";

type ProjectOverrideFields = Partial<
  Pick<Project, "title" | "year" | "stack" | "description" | "highlights">
>;

type ProjectOverrides = Record<string, ProjectOverrideFields>;

type ProjectsClientProps = {
  initialProjects: Project[];
  initialOverrides: ProjectOverrides;
};

const isDevMode = process.env.NODE_ENV !== "production";

async function persistProjectCuration(projects: Project[], overrides: ProjectOverrides) {
  if (!isDevMode) {
    return;
  }

  const order = projects.map((project) => project.repo).filter((value): value is string => Boolean(value));
  const visibility = Object.fromEntries(
    projects
      .map((project) => [project.repo, Boolean(project.visible)] as const)
      .filter(([repo]) => Boolean(repo)),
  );

  const response = await fetch("/api/projects/config", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ order, visibility, overrides }),
  });

  if (!response.ok) {
    throw new Error(`Failed to persist project curation (${response.status})`);
  }
}

function toHighlightsText(highlights?: string[]) {
  return (highlights ?? []).join("\n");
}

function toHighlightsArray(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ProjectsClient({ initialProjects, initialOverrides }: ProjectsClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [overrides, setOverrides] = useState<ProjectOverrides>(initialOverrides);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [draggingRepo, setDraggingRepo] = useState<string | null>(null);
  const [editingRepo, setEditingRepo] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "error">("idle");

  const visibleCount = useMemo(
    () => projects.filter((project) => project.visible).length,
    [projects],
  );

  const updateProjects = (
    updater: (current: Project[]) => Project[],
    nextOverrides?: ProjectOverrides,
    options?: { persist?: boolean },
  ) => {
    setProjects((current) => {
      const nextProjects = updater(current);
      const shouldPersist = options?.persist ?? true;
      if (isDevMode && shouldPersist) {
        const overridesToPersist = nextOverrides ?? overrides;
        setSaveStatus("saving");
        void persistProjectCuration(nextProjects, overridesToPersist)
          .then(() => setSaveStatus("idle"))
          .catch(() => setSaveStatus("error"));
      }
      return nextProjects;
    });
  };

  const saveNow = () => {
    if (!isDevMode) {
      return;
    }
    setSaveStatus("saving");
    void persistProjectCuration(projects, overrides)
      .then(() => setSaveStatus("idle"))
      .catch(() => setSaveStatus("error"));
  };

  const applyManualEdit = (
    repoKey: string,
    repo: string | undefined,
    patch: ProjectOverrideFields,
    projectUpdater: (project: Project) => Project,
  ) => {
    const nextOverrides = {
      ...overrides,
      [repoKey]: {
        ...overrides[repoKey],
        ...patch,
      },
    };
    setOverrides(nextOverrides);
    updateProjects(
      (current) =>
        current.map((item) => (item.repo === repo ? projectUpdater(item) : item)),
      nextOverrides,
      { persist: false },
    );
  };

  const handleDrop = (targetRepo: string | undefined) => {
    if (!isDevMode || !draggingRepo || !targetRepo || draggingRepo === targetRepo) {
      setDraggingRepo(null);
      return;
    }

    updateProjects((current) => {
      const fromIndex = current.findIndex((project) => project.repo === draggingRepo);
      const toIndex = current.findIndex((project) => project.repo === targetRepo);

      if (fromIndex < 0 || toIndex < 0) {
        return current;
      }

      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });

    setDraggingRepo(null);
  };

  return (
    <div className="space-y-16">
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.45em] text-black/55">Projects</p>
        <h1 className="text-4xl font-serif text-shadow-sm tracking-tight text-[var(--ink)]">
          Selected work
        </h1>
        <p className="max-w-2xl text-sm text-black/75">
          A curated set of products I designed and shipped, focused on reliability,
          measurable impact, and production-ready engineering.
        </p>
        {isDevMode ? (
          <p className="text-[0.62rem] uppercase tracking-[0.3em] text-black/60">
            Dev curation: {visibleCount}/{projects.length} visible
            {saveStatus === "saving" ? " · Saving..." : ""}
            {saveStatus === "error" ? " · Save failed" : ""}
          </p>
        ) : null}
      </header>

      <div className="space-y-8">
        {projects.map((project) => {
          const repoKey = project.repo;
          const hidden = isDevMode && !project.visible;
          const isEditing = isDevMode && editingRepo === repoKey;

          return (
            <article
              key={repoKey}
              role="button"
              tabIndex={0}
              draggable={isDevMode}
              onDragStart={() => setDraggingRepo(project.repo)}
              onDragOver={(event) => {
                if (isDevMode) {
                  event.preventDefault();
                }
              }}
              onDrop={() => handleDrop(project.repo)}
              onDragEnd={() => setDraggingRepo(null)}
              onClick={() => setSelectedProject(project)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedProject(project);
                }
              }}
              className={`group relative cursor-pointer border border-black/25 bg-white/35 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)] hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 ${
                hidden ? "opacity-55" : "opacity-100"
              }`}
            >
              {isDevMode ? (
                <div
                  className="absolute right-3 top-3 z-10 inline-flex items-center gap-2"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <label className="inline-flex items-center gap-2 border border-black/25 bg-white/85 px-2 py-1 text-[0.52rem] uppercase tracking-[0.22em] text-black/70">
                    <input
                      type="checkbox"
                      checked={Boolean(project.visible)}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        updateProjects((current) =>
                          current.map((item) =>
                            item.repo === project.repo ? { ...item, visible: checked } : item,
                          ),
                        );
                      }}
                    />
                    Visible
                  </label>
                  <button
                    type="button"
                    className="border border-black/25 bg-white/85 px-2 py-1 text-[0.52rem] uppercase tracking-[0.22em] text-black/70"
                    onClick={(event) => {
                      event.stopPropagation();
                      setEditingRepo((current) => {
                        if (current === repoKey) {
                          saveNow();
                          return null;
                        }
                        return repoKey;
                      });
                    }}
                  >
                    {isEditing ? "Close" : "Edit"}
                  </button>
                </div>
              ) : null}

              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {project.title}
                </h2>
                <span className="text-[0.65rem] uppercase tracking-[0.38em] text-[var(--ink-red)] opacity-80">
                  Built {project.year}
                </span>
              </div>
              <p className="mt-3 inline-block border border-black/10 bg-white/40 px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-black/70 -rotate-1">
                {project.stack}
              </p>
              <p className="mt-4 text-sm text-black/75">{project.description}</p>

              {isEditing ? (
                <div
                  className="mt-4 space-y-2 border border-black/20 bg-white/80 p-3"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <label className="block space-y-1">
                    <span className="text-[0.5rem] uppercase tracking-[0.2em] text-black/70">Title</span>
                    <input
                      type="text"
                      value={project.title}
                      onBlur={saveNow}
                      onChange={(event) => {
                        const value = event.target.value;
                        applyManualEdit(
                          repoKey,
                          project.repo,
                          { title: value },
                          (item) => ({ ...item, title: value }),
                        );
                      }}
                      className="w-full border border-black/25 bg-white px-2 py-1.5 text-xs"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[0.5rem] uppercase tracking-[0.2em] text-black/70">Stack</span>
                    <input
                      type="text"
                      value={project.stack}
                      onBlur={saveNow}
                      onChange={(event) => {
                        const value = event.target.value;
                        applyManualEdit(
                          repoKey,
                          project.repo,
                          { stack: value },
                          (item) => ({ ...item, stack: value }),
                        );
                      }}
                      className="w-full border border-black/25 bg-white px-2 py-1.5 text-xs"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[0.5rem] uppercase tracking-[0.2em] text-black/70">Description</span>
                    <textarea
                      rows={3}
                      value={project.description}
                      onBlur={saveNow}
                      onChange={(event) => {
                        const value = event.target.value;
                        applyManualEdit(
                          repoKey,
                          project.repo,
                          { description: value },
                          (item) => ({ ...item, description: value }),
                        );
                      }}
                      className="w-full border border-black/25 bg-white px-2 py-1.5 text-xs"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[0.5rem] uppercase tracking-[0.2em] text-black/70">Highlights (one per line)</span>
                    <textarea
                      rows={4}
                      value={toHighlightsText(project.highlights)}
                      onBlur={saveNow}
                      onChange={(event) => {
                        const value = event.target.value;
                        const parsed = toHighlightsArray(value);
                        applyManualEdit(
                          repoKey,
                          project.repo,
                          { highlights: parsed },
                          (item) => ({ ...item, highlights: parsed }),
                        );
                      }}
                      className="w-full border border-black/25 bg-white px-2 py-1.5 text-xs"
                    />
                  </label>
                </div>
              ) : null}

              {project.links.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-3 text-[0.6rem] uppercase tracking-[0.35em]">
                  {project.links.map((link) => (
                    <a
                      key={`${project.title}-${link.label}`}
                      href={link.url}
                      className="border border-black px-3 py-2 text-black transition-colors duration-200 hover:bg-black hover:text-white"
                      onClick={(event) => event.stopPropagation()}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {selectedProject ? (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      ) : null}
    </div>
  );
}
