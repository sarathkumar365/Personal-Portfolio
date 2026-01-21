"use client";

import { useState } from "react";

import { getProjects } from "@/data/portfolio";
import ProjectModal from "@/components/project-modal";
import type { Project } from "@/data/types";

const projects = getProjects();

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <div className="space-y-16">
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.45em] text-black/55">Projects</p>
        <h1 className="text-4xl font-serif text-shadow-sm tracking-tight text-[var(--ink)]">
          Case studies & builds
        </h1>
        <p className="max-w-2xl text-sm text-black/75">
          A sampling of recent collaborations that blend reliable engineering with crafted
          storytelling. Each project pairs a modern stack with a focus on accessibility,
          performance, and maintainability.
        </p>
      </header>

      <div className="space-y-8">
        {projects.map((project) => (
          <article
            key={project.title}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedProject(project)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedProject(project);
              }
            }}
            className="group cursor-pointer border border-black/25 bg-white/35 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)] hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-2xl font-semibold tracking-tight group-hover:text-[var(--ink-blue)] transition-colors">
                {project.title}
              </h2>
              <span className="text-[0.65rem] uppercase tracking-[0.38em] text-[var(--ink-red)] opacity-80">
                {project.year}
              </span>
            </div>
            <p className="mt-3 inline-block border border-black/10 bg-white/40 px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-black/70 -rotate-1">
              {project.stack}
            </p>
            <p className="mt-4 text-sm text-black/75">{project.description}</p>
            {project.links.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-3 text-[0.6rem] uppercase tracking-[0.35em]">
                {project.links.map((link) => (
                  <a
                    key={`${project.title}-${link.label}`}
                    href={link.url}
                    className="border border-black px-3 py-2 text-black transition-colors duration-200 hover:bg-[var(--ink-blue)] hover:text-white hover:border-[var(--ink-blue)]"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {selectedProject ? (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      ) : null}
    </div>
  );
}
