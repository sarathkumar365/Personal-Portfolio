"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

import HeroName from "@/components/hero-name";
import ExperienceModal from "@/components/experience-modal";
import SoftwarePathMap from "@/components/software-path-map";
import type { ExperienceDetail } from "@/types/experiences";
import type { HomeData } from "@/data/types";

type GsapContext = { revert: () => void } | undefined;
type GsapTween = { kill: () => void; scrollTrigger?: ScrollTriggerType };
type SnapFunction = (input: number) => number;
type ContactFormData = {
  name: string;
  email: string;
  message: string;
  honey: string;
};
type ContactFormErrors = Partial<Record<"name" | "email" | "message", string>>;
type ContactFormStatus = { type: "idle" | "submitting" | "success" | "error"; message: string };
const CONTACT_SHELL_ANIMATION_MS = 1000;
const CONTACT_FORM_ANIMATION_MS = 560;
const CONTACT_COLLAPSE_HANDOFF_MS = 1040;

interface HomePageProps {
  data: HomeData;
}

export default function HomePage({ data }: HomePageProps) {
  const { hero, stats, experiences, skills, cta } = data;
  const router = useRouter();

  const [heroComplete, setHeroComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contactPanelRef = useRef<HTMLDivElement | null>(null);
  const contactNameRef = useRef<HTMLInputElement | null>(null);
  const [selectedExperience, setSelectedExperience] =
    useState<ExperienceDetail | null>(null);
  const [contactExpanded, setContactExpanded] = useState(false);
  const [contactClosing, setContactClosing] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: "",
    email: "",
    message: "",
    honey: "",
  });
  const [contactErrors, setContactErrors] = useState<ContactFormErrors>({});
  const [contactStatus, setContactStatus] = useState<ContactFormStatus>({
    type: "idle",
    message: "",
  });
  const closeTimeoutRef = useRef<number | null>(null);
  const collapseTimeoutRef = useRef<number | null>(null);
  const isContactPanelActive = contactExpanded || contactClosing;

  const closeExperience = useCallback(() => {
    setSelectedExperience(null);
  }, []);

  const handleHeroComplete = useCallback(() => {
    setHeroComplete(true);
  }, []);

  useEffect(() => {
    if (heroComplete) {
      return undefined;
    }

    const fallback = window.setTimeout(() => {
      setHeroComplete(true);
    }, 3600);

    return () => window.clearTimeout(fallback);
  }, [heroComplete]);

  useEffect(() => {
    router.prefetch("/projects");
    void fetch("/api/projects/warm", { method: "POST" }).catch(() => {
      // Best-effort warmup; failures should not affect landing page.
    });
  }, [router]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReducedMotion(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);

    return () => {
      mediaQuery.removeEventListener("change", sync);
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
      if (collapseTimeoutRef.current !== null) {
        window.clearTimeout(collapseTimeoutRef.current);
      }
    };
  }, []);

  const collapseContactPanel = useCallback(() => {
    if (!contactExpanded) {
      return;
    }

    setContactClosing(true);
    setContactExpanded(false);

    if (collapseTimeoutRef.current !== null) {
      window.clearTimeout(collapseTimeoutRef.current);
    }

    collapseTimeoutRef.current = window.setTimeout(() => {
      setContactClosing(false);
      collapseTimeoutRef.current = null;
    }, prefersReducedMotion ? 0 : CONTACT_COLLAPSE_HANDOFF_MS);
  }, [contactExpanded, prefersReducedMotion]);

  useEffect(() => {
    if (!contactExpanded) {
      return;
    }

    contactNameRef.current?.focus();

    const onPointerDown = (event: PointerEvent) => {
      if (!contactPanelRef.current) {
        return;
      }
      if (!contactPanelRef.current.contains(event.target as Node)) {
        collapseContactPanel();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        collapseContactPanel();
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [collapseContactPanel, contactExpanded]);

  const validateContactForm = useCallback((payload: ContactFormData): ContactFormErrors => {
    const errors: ContactFormErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (payload.name.trim().length < 2) {
      errors.name = "Please enter at least 2 characters.";
    }
    if (!emailPattern.test(payload.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (payload.message.trim().length < 10) {
      errors.message = "Message should be at least 10 characters.";
    }

    return errors;
  }, []);

  const handleContactChange = useCallback(
    (field: keyof ContactFormData) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = event.target.value;
        setContactForm((current) => ({ ...current, [field]: value }));
        if (field === "name" || field === "email" || field === "message") {
          setContactErrors((current) => {
            if (!current[field]) {
              return current;
            }
            const next = { ...current };
            delete next[field];
            return next;
          });
        }
      },
    [],
  );

  const handleContactSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const errors = validateContactForm(contactForm);
      setContactErrors(errors);
      if (Object.keys(errors).length > 0) {
        setContactStatus({ type: "error", message: "Please correct the highlighted fields." });
        return;
      }

      setContactStatus({ type: "submitting", message: "Sending your message..." });

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(contactForm),
        });

        const result = (await response.json()) as { ok?: boolean; message?: string };

        if (!response.ok || !result.ok) {
          setContactStatus({
            type: "error",
            message: result.message || "Unable to send right now. Please try again.",
          });
          return;
        }

        setContactStatus({ type: "success", message: "Message sent. I’ll get back to you soon." });
        if (closeTimeoutRef.current !== null) {
          window.clearTimeout(closeTimeoutRef.current);
        }
        closeTimeoutRef.current = window.setTimeout(() => {
          collapseContactPanel();
          setContactForm({ name: "", email: "", message: "", honey: "" });
          setContactErrors({});
          setContactStatus({ type: "idle", message: "" });
          closeTimeoutRef.current = null;
        }, 1300);
      } catch {
        setContactStatus({
          type: "error",
          message: "Network issue while sending. Please try again.",
        });
      }
    },
    [collapseContactPanel, contactForm, validateContactForm],
  );

  useEffect(() => {
    if (!heroComplete) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      window.dispatchEvent(new Event("signature:show"));
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [heroComplete]);

  useEffect(() => {
    if (!heroComplete) {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (prefersReducedMotion.matches) {
      return undefined;
    }

    let ctx: GsapContext;
    const tweens: GsapTween[] = [];
    const triggers: Array<{ kill: () => void }> = [];
    let isMounted = true;

    void (async () => {
      const [gsapModule, scrollTriggerModule] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      const gsap = gsapModule.gsap;
      const ScrollTrigger = (
        scrollTriggerModule.ScrollTrigger ?? scrollTriggerModule.default
      ) as unknown as ScrollTriggerType | undefined;

      if (!isMounted || !containerRef.current) {
        return;
      }

      if (!ScrollTrigger) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const sections = gsap.utils.toArray<HTMLElement>("[data-page-section]");

        if (!sections.length) {
          return;
        }

        let snapFn: SnapFunction | undefined;
        if (sections.length > 1) {
          const snapCandidate = (ScrollTrigger as unknown as { utils?: { snap: SnapFunction } })?.utils?.snap(
            1 / (sections.length - 1),
          );

          if (typeof snapCandidate === "function") {
            snapFn = snapCandidate as SnapFunction;
          }
        }

        sections.forEach((section, index) => {
          const direction = index % 2 === 0 ? 1 : -1;

          gsap.set(section, {
            transformOrigin: direction > 0 ? "left center" : "right center",
            transformPerspective: 1400,
          });

          const tween = gsap.fromTo(
            section,
            {
              rotateY: direction * -12,
              rotateX: 4,
              xPercent: direction * -7.5,
              yPercent: 9,
              opacity: 0.6,
            },
            {
              rotateY: 0,
              rotateX: 0,
              xPercent: 0,
              yPercent: 0,
              opacity: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: "top 80%",
                end: "top 25%",
                scrub: 0.35,
                fastScrollEnd: true,
                anticipatePin: 1,
              },
            },
          );

          tweens.push(tween);
          if (tween.scrollTrigger) {
            triggers.push(tween.scrollTrigger);
          }
        });

        if (snapFn && ScrollTrigger) {
          const snapTrigger = (
            ScrollTrigger as unknown as { create: (options: unknown) => { kill: () => void } }
          ).create({
            start: 0,
              end: () => (ScrollTrigger as unknown as { maxScroll: (target: unknown) => number }).maxScroll(window),
            snap: {
              snapTo: (value: number) => (snapFn ? snapFn(value) : value),
              duration: { min: 0.18, max: 0.35 },
              ease: "power2.inOut",
              delay: 0, // Ensure no delay on snap
            },
          });

          triggers.push(snapTrigger);
        }
      }, containerRef);
    })();

    return () => {
      isMounted = false;
      ctx?.revert();
      tweens.forEach((tween) => tween.kill());
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [heroComplete]);

  return (
    <div ref={containerRef} className="space-y-12 sm:space-y-16">
      <section data-page-section className="page-turn-section space-y-6">
        <p className="text-xs uppercase tracking-[0.5em] text-black/60">
          {hero.locationLabel}
        </p>
        <HeroName
          name={hero.name}
          title={hero.title}
          onComplete={handleHeroComplete}
        />
        <div
          className={`max-w-2xl text-base text-black/80 transition-opacity duration-500 sm:text-lg ${
            heroComplete ? "opacity-100" : "opacity-0"
          }`}
        >
          {hero.summary}
        </div>
        <div
          className={`space-y-1 text-sm uppercase tracking-[0.3em] text-black/70 transition-opacity duration-500 delay-100 ${
            heroComplete ? "opacity-100" : "opacity-0"
          }`}
        >
          <p>{hero.contact.phone}</p>
          <p>
            <a
              href={`mailto:${hero.contact.email}`}
              className="hover:text-[var(--ink-blue)] transition-colors"
            >
              {hero.contact.email}
            </a>{" "}
            ·{" "}
            <a
              href={hero.contact.linkedin}
              className="hover:text-[var(--ink-blue)] transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>{" "}
            ·{" "}
            <a
              href={hero.contact.github}
              className="hover:text-[var(--ink-blue)] transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </p>
        </div>
        <div
          className={`grid gap-3 pt-2 sm:grid-cols-3 transition-opacity duration-500 delay-[140ms] ${
            heroComplete ? "opacity-100" : "opacity-0"
          }`}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border border-black/25 bg-white/45 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)]"
            >
              <p className="text-[0.55rem] uppercase tracking-[0.34em] text-black/55">
                {stat.label}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-black/80">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div
        className="h-px w-full border-t border-black/20 border-dashed !mt-4 sm:!mt-5"
        aria-hidden="true"
      />

      <section
        data-page-section
        className={`page-turn-section space-y-6 transition-opacity duration-500 delay-[220ms] !mt-4 sm:!mt-5 ${
          heroComplete ? "opacity-100" : "opacity-0"
        }`}
      >
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.45em] text-black/55">
            Experience log
          </p>
          <h2 className="text-3xl font-serif text-shadow-sm tracking-tight">
            Selected chapters
          </h2>
        </header>
        <div className="space-y-6">
          {experiences.map((experience) => {
            return (
              <article
                key={experience.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedExperience(experience)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedExperience(experience);
                  }
                }}
                className="cursor-pointer border border-black/25 bg-white/40 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 hover-lift"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6rem] uppercase tracking-[0.42em] text-black/60">
                  <span>{experience.period}</span>
                  <span className="text-black/30">·</span>
                  <span>{experience.location}</span>
                </div>
                <h3 className="mt-2 text-xl font-semibold">
                  {experience.role} · {experience.company}
                </h3>
                <p className="mt-3 text-sm text-black/75">
                  {experience.summary}
                </p>
                <p className="mt-4 text-xs uppercase tracking-[0.32em] text-black/55">
                  {experience.details.headline}
                </p>
                <p
                  className="mt-2 text-[0.62rem] uppercase tracking-[0.32em] text-[var(--ink-red)]"
                >
                  Open the letter
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <div
        className="h-px w-full border-t border-black/20 border-dashed !mt-4 sm:!mt-5"
        aria-hidden="true"
      />

      <section
        data-page-section
        className={`page-turn-section space-y-5 transition-opacity duration-500 delay-[280ms] !mt-4 sm:!mt-5 ${
          heroComplete ? "opacity-100" : "opacity-0"
        }`}
      >
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.45em] text-black/55">
            Toolkit
          </p>
          <h2 className="text-3xl font-serif text-shadow-sm tracking-tight">
            {skills.heading}
          </h2>
        </header>

        <SoftwarePathMap skills={skills} />
      </section>

      <div
        className="h-px w-full border-t border-black/20 border-dashed !mt-4 sm:!mt-5"
        aria-hidden="true"
      />

      <section
        data-page-section
        className={`page-turn-section space-y-4 transition-opacity duration-500 delay-[360ms] !mt-4 sm:!mt-5 ${
          heroComplete ? "opacity-100" : "opacity-0"
        }`}
      >
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.45em] text-black/55">
            {cta.label}
          </p>
          <h2 className="text-3xl font-serif text-shadow-sm tracking-tight">
            {cta.heading}
          </h2>
        </header>
        <div className="relative space-y-4 border border-black/25 bg-white/40 p-4 pr-12 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)] sm:p-5 sm:pr-14">
          <span
            className="absolute right-3 top-3 inline-flex h-6 w-10 items-center justify-center text-black/70 sm:right-4 sm:top-4 sm:h-7 sm:w-11"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[22px] w-[22px]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 5v14a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 6h.01"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 18h.01"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.75 14.112l-1.63 .853a.294 .294 0 0 1 -.425 -.307l.31 -1.808l-1.317 -1.28a.292 .292 0 0 1 .163 -.499l1.82 -.264l.815 -1.644a.294 .294 0 0 1 .527 0l.814 1.644l1.82 .264a.292 .292 0 0 1 .164 .499l-1.318 1.28l.31 1.807a.292 .292 0 0 1 -.425 .308l-1.628 -.853"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="space-y-2">
            {cta.lines.map((line, index) => (
              <p key={`${line}-${index}`} className="max-w-2xl text-sm text-black/75">
                {line}
              </p>
            ))}
          </div>
          <div className="text-[0.62rem] uppercase tracking-[0.3em]">
            <div
              className={`flex gap-3 ${
                isContactPanelActive
                  ? "flex-col items-start"
                  : "flex-wrap items-center"
              }`}
            >
              <div
              ref={contactPanelRef}
              className={`contact-expand-shell overflow-hidden border border-transparent transition-[width,max-height,padding,background-color,box-shadow,border-color] ${
                prefersReducedMotion ? "duration-0" : "ease-out"
              } ${
                isContactPanelActive
                  ? "w-full max-h-[36rem] border-black/15 bg-[rgba(247,247,242,0.94)] p-3.5 shadow-[0_10px_20px_-18px_rgba(0,0,0,0.3)] md:w-[46%]"
                  : "w-[214px] max-h-12 bg-transparent p-0 shadow-none"
              }`}
              style={
                prefersReducedMotion
                  ? undefined
                  : {
                      transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                      transitionDuration: `${CONTACT_SHELL_ANIMATION_MS}ms`,
                    }
              }
            >
              {!isContactPanelActive ? (
                <button
                  type="button"
                  className="h-10 w-full border border-black bg-black px-3 py-2 text-white transition-colors duration-200 hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2"
                  onClick={() => {
                    setContactClosing(false);
                    setContactExpanded(true);
                    setContactStatus({ type: "idle", message: "" });
                  }}
                  aria-expanded={contactExpanded}
                >
                  {cta.primary.label}
                </button>
              ) : (
                <form
                  className={`space-y-3 rounded-sm border border-black/12 bg-white/72 p-2.5 transition-[opacity,transform] ${
                    prefersReducedMotion ? "duration-0" : ""
                  } ${contactExpanded ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}
                  style={
                    prefersReducedMotion
                      ? undefined
                      : {
                          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                          transitionDuration: `${CONTACT_FORM_ANIMATION_MS}ms`,
                        }
                  }
                  onSubmit={handleContactSubmit}
                  noValidate
                >
                  <div className="flex items-center justify-between border-b border-black/15 pb-2">
                    <p className="text-[0.55rem] uppercase tracking-[0.25em] text-black/70">
                      Send message
                    </p>
                    <button
                      type="button"
                      className="inline-flex h-6 w-6 items-center justify-center border border-black/25 bg-white text-black/70 transition-colors hover:bg-black hover:text-white"
                      onClick={collapseContactPanel}
                      aria-label="Close contact form"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-[11px] w-[11px]"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 6l12 12M18 6l-12 12"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="contact-name" className="text-[0.5rem] tracking-[0.2em] text-black/65">
                      Name
                    </label>
                    <input
                      ref={contactNameRef}
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={contactForm.name}
                      onChange={handleContactChange("name")}
                      className={`w-full border bg-white/95 px-2 py-1.5 text-[0.58rem] tracking-[0.08em] text-black/85 outline-none transition focus-visible:ring-2 focus-visible:ring-black/50 ${
                        contactErrors.name ? "border-[var(--ink-red)]" : "border-black/25"
                      }`}
                    />
                    {contactErrors.name ? (
                      <p className="text-[0.48rem] tracking-[0.16em] text-[var(--ink-red)]">
                        {contactErrors.name}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="contact-email" className="text-[0.5rem] tracking-[0.2em] text-black/65">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={contactForm.email}
                      onChange={handleContactChange("email")}
                      className={`w-full border bg-white/95 px-2 py-1.5 text-[0.58rem] tracking-[0.08em] text-black/85 outline-none transition focus-visible:ring-2 focus-visible:ring-black/50 ${
                        contactErrors.email ? "border-[var(--ink-red)]" : "border-black/25"
                      }`}
                    />
                    {contactErrors.email ? (
                      <p className="text-[0.48rem] tracking-[0.16em] text-[var(--ink-red)]">
                        {contactErrors.email}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="contact-message" className="text-[0.5rem] tracking-[0.2em] text-black/65">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      value={contactForm.message}
                      onChange={handleContactChange("message")}
                      className={`w-full resize-y border bg-white/95 px-2 py-1.5 text-[0.58rem] tracking-[0.08em] text-black/85 outline-none transition focus-visible:ring-2 focus-visible:ring-black/50 ${
                        contactErrors.message ? "border-[var(--ink-red)]" : "border-black/25"
                      }`}
                    />
                    {contactErrors.message ? (
                      <p className="text-[0.48rem] tracking-[0.16em] text-[var(--ink-red)]">
                        {contactErrors.message}
                      </p>
                    ) : null}
                  </div>

                  <input
                    type="text"
                    name="company_website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={contactForm.honey}
                    onChange={handleContactChange("honey")}
                    className="hidden"
                    aria-hidden="true"
                  />

                  <button
                    type="submit"
                    disabled={contactStatus.type === "submitting"}
                    className="h-9 w-full border border-black bg-black px-3 py-2 text-white transition-colors duration-200 hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {contactStatus.type === "submitting" ? "Sending..." : "Send message"}
                  </button>

                  <p className="min-h-[1rem] text-[0.5rem] tracking-[0.16em] text-black/65" aria-live="polite">
                    {contactStatus.message}
                  </p>
                </form>
              )}
              </div>
              {!isContactPanelActive ? (
                <div className="flex flex-wrap items-center gap-3">
                  {cta.secondary.map((item) => {
                    const isExternal = item.href.startsWith("http");

                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        className="border border-black/40 bg-white/65 px-3 py-2 text-black/80 transition-colors duration-200 hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2"
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                      >
                        {item.label}
                      </a>
                    );
                  })}
                </div>
              ) : null}
            </div>
            {isContactPanelActive ? (
              <div className="mt-3 w-full px-2.5 md:w-[46%]">
                <div className="flex flex-wrap items-center gap-3">
                {cta.secondary.map((item) => {
                  const isExternal = item.href.startsWith("http");

                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      className="border border-black/40 bg-white/65 px-3 py-2 text-black/80 transition-colors duration-200 hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2"
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                    >
                      {item.label}
                    </a>
                  );
                })}
                </div>
              </div>
            ) : null}
            </div>
          <div className="ml-auto w-fit space-y-1 text-right">
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-black/60">
              {cta.meta}
            </p>
            {cta.signature ? (
              <p className="text-sm italic text-black/70">{cta.signature}</p>
            ) : null}
          </div>
        </div>
      </section>
      {selectedExperience ? (
        <ExperienceModal
          experience={selectedExperience}
          onClose={closeExperience}
        />
      ) : null}
    </div>
  );
}
