"use client";

import { useMemo } from "react";

import ModalShell from "@/components/modal-shell";
import type { Project } from "@/data/types";

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const headingId = useMemo(
    () => `project-modal-${project.title.replace(/\s+/g, "-").toLowerCase()}-headline`,
    [project.title],
  );
  const descriptionId = useMemo(
    () =>
      `project-modal-${project.title.replace(/\s+/g, "-").toLowerCase()}-description`,
    [project.title],
  );

  return (
    <ModalShell
      onClose={onClose}
      labelledById={headingId}
      describedById={descriptionId}
    >
      <div className="rounded-sm bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.02),transparent_55%)]">
        <div className="space-y-3 border-b border-black/15 pb-6">
          <p className="text-[0.58rem] uppercase tracking-[0.45em] text-black/55">
            {project.year}
          </p>
          <h2
            id={headingId}
            className="text-2xl font-semibold tracking-tight text-black"
          >
            {project.title}
          </h2>
          <p className="inline-block border border-black/10 bg-white/60 px-2 py-1 text-[0.6rem] uppercase tracking-[0.24em] text-black/70">
            {project.stack}
          </p>
          <p className="text-sm text-black/70">{project.description}</p>
        </div>
        <div className="space-y-6 py-6 text-sm leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-xs uppercase tracking-[0.4em] text-black/55">
              Highlights
            </h3>
            <ul className="space-y-2">
              {project.highlights.map((item) => (
                <li key={item} className="relative pl-5 text-sm text-black/80">
                  <span
                    className="absolute left-0 top-2 h-[3px] w-[3px] rounded-full bg-black"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </section>
          {project.links.length > 0 ? (
            <section className="space-y-2">
              <h3 className="text-xs uppercase tracking-[0.4em] text-black/55">
                Links
              </h3>
              <div className="flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-[0.35em]">
                {project.links.map((link) => (
                  <a
                    key={`${project.title}-${link.label}`}
                    href={link.url}
                    className="border border-black px-3 py-2 text-black transition-colors duration-200 hover:bg-[var(--ink-blue)] hover:text-white hover:border-[var(--ink-blue)]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </ModalShell>
  );
}
