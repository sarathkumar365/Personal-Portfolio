"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import type { ExperienceDetail } from "@/types/experiences";

interface ExperienceModalProps {
  experience: ExperienceDetail;
  onClose: () => void;
}

export default function ExperienceModal({
  experience,
  onClose,
}: ExperienceModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMounted, onClose]);

  const headingId = useMemo(
    () => `experience-modal-${experience.id}-headline`,
    [experience.id],
  );
  const descriptionId = useMemo(
    () => `experience-modal-${experience.id}-description`,
    [experience.id],
  );

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 backdrop-blur-md px-4 py-10"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={descriptionId}
        className="relative w-full max-w-2xl overflow-hidden rounded-md bg-[#fefbf6] shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
        onClick={(event) => event.stopPropagation()}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 border border-black/25"
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 cursor-pointer text-[0.6rem] uppercase tracking-[0.35em] text-black/60 transition hover:text-black"
        >
          Close ✕
        </button>
        <div
          className="max-h-[95vh] overflow-y-auto p-8 text-black/80 sm:p-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          id={descriptionId}
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
        </div>
      </div>
    </div>,
    document.body,
  );
}
