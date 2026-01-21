"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { Project } from "@/data/types";

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scrollTweenRef = useRef<any | null>(null);

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

  useEffect(() => {
    if (!isMounted) {
      return undefined;
    }

    const overlayElement = overlayRef.current;
    const modalElement = modalRef.current;
    const scrollElement = scrollRef.current;

    let cancelled = false;
    let wheelHandler: ((event: WheelEvent) => void) | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let introTimeline: any | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let gsapInstance: any | undefined;

    void (async () => {
      const [gsapModule, scrollToModule] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollToPlugin"),
      ]);

      if (cancelled) {
        return;
      }

      const { gsap } = gsapModule;
      const ScrollToPlugin =
        scrollToModule.ScrollToPlugin ?? scrollToModule.default;

      gsap.registerPlugin(ScrollToPlugin);
      gsapInstance = gsap;

      if (overlayElement && modalElement) {
        gsap.set(overlayElement, { opacity: 0, willChange: "opacity" });
        gsap.set(modalElement, {
          opacity: 0,
          y: 28,
          scale: 0.96,
          willChange: "transform, opacity",
        });

        introTimeline = gsap
          .timeline({ defaults: { ease: "power2.out" } })
          .to(overlayElement, {
            opacity: 1,
            duration: 0.28,
            ease: "power1.out",
          })
          .to(
            modalElement,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.5,
            },
            0,
          )
          .add(() => {
            gsap.set([overlayElement, modalElement], { clearProps: "willChange" });
          });
      }

      if (!scrollElement) {
        return;
      }

      wheelHandler = (event: WheelEvent) => {
        if (!gsapInstance) {
          return;
        }

        const delta =
          event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;

        if (delta === 0) {
          return;
        }

        event.preventDefault();

        const maxScroll = scrollElement.scrollHeight - scrollElement.clientHeight;
        const target = gsap.utils.clamp(
          0,
          maxScroll,
          scrollElement.scrollTop + delta,
        );

        scrollTweenRef.current?.kill();
        scrollTweenRef.current = gsapInstance.to(scrollElement, {
          duration: 0.45,
          scrollTo: { y: target },
          ease: "power2.out",
        });
      };

      scrollElement.addEventListener("wheel", wheelHandler, {
        passive: false,
      });
    })();

    return () => {
      cancelled = true;
      scrollTweenRef.current?.kill();
      if (wheelHandler && scrollElement) {
        scrollElement.removeEventListener("wheel", wheelHandler);
      }
      introTimeline?.kill();
    };
  }, [isMounted]);

  const headingId = useMemo(
    () => `project-modal-${project.title.replace(/\s+/g, "-").toLowerCase()}-headline`,
    [project.title],
  );
  const descriptionId = useMemo(
    () =>
      `project-modal-${project.title.replace(/\s+/g, "-").toLowerCase()}-description`,
    [project.title],
  );

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 backdrop-blur-md px-4 py-10"
      onClick={onClose}
    >
      <div
        ref={modalRef}
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
          ref={scrollRef}
          className="max-h-[95vh] overflow-y-auto p-8 text-black/80 sm:p-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          id={descriptionId}
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
        </div>
      </div>
    </div>,
    document.body,
  );
}
