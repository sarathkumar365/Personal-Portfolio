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
        className="relative w-full max-w-3xl rounded-md border border-black/30 bg-white/90 shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-xs uppercase tracking-[0.35em] text-black/60 transition hover:text-black"
        >
          Close ✕
        </button>
        <div
          className="max-h-[95vh] overflow-y-auto px-8 pb-10 pt-12 text-black/80 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          id={descriptionId}
        >
          <header className="space-y-2 border-b border-black/10 pb-6">
            <p className="text-[0.6rem] uppercase tracking-[0.5em] text-black/50">
              {experience.period} · {experience.location}
            </p>
            <h2
              id={headingId}
              className="text-2xl font-semibold tracking-tight text-black"
            >
              {experience.role} · {experience.company}
            </h2>
            <p className="text-sm text-black/70">{experience.details.overview}</p>
          </header>
          <div className="space-y-6 py-6 text-sm leading-relaxed">
            {experience.details.sections.map((section) => (
              <section key={section.title} className="space-y-2">
                <h3 className="text-xs uppercase tracking-[0.4em] text-black/55">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="pl-4 text-black/80">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <footer className="border-t border-black/10 pt-6 text-sm text-black/75">
            {experience.details.closing}
          </footer>
        </div>
      </div>
    </div>,
    document.body,
  );
}
