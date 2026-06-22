"use client";

import { useMemo } from "react";

import ModalShell from "@/components/modal-shell";
import type { ExperienceDetail } from "@/types/experiences";

interface ExperienceModalProps {
  experience: ExperienceDetail;
  onClose: () => void;
}

export default function ExperienceModal({
  experience,
  onClose,
}: ExperienceModalProps) {
  const headingId = useMemo(
    () => `experience-modal-${experience.id}-headline`,
    [experience.id],
  );
  const descriptionId = useMemo(
    () => `experience-modal-${experience.id}-description`,
    [experience.id],
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
            {experience.period} · {experience.location}
          </p>
          <h2
            id={headingId}
            className="text-2xl font-semibold tracking-tight text-black"
          >
            {experience.role} · {experience.company}
          </h2>
          <p className="text-sm text-black/70">{experience.details.overview}</p>
        </div>
        <div className="space-y-6 py-6 text-sm leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-xs uppercase tracking-[0.4em] text-black/55">
              {experience.details.headline}
            </h3>
            <p className="text-sm text-black/75">{experience.summary}</p>
          </section>
          {experience.details.sections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h4 className="text-xs uppercase tracking-[0.36em] text-black/55">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.items.map((item) => (
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
          ))}
        </div>
        <footer className="border-t border-dashed border-black/20 pt-6 text-sm italic text-black/70">
          {experience.details.closing}
        </footer>
      </div>
    </ModalShell>
  );
}
