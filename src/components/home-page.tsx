"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

import HeroName from "@/components/hero-name";
import ExperienceModal from "@/components/experience-modal";
import type { ExperienceDetail } from "@/types/experiences";
import type { HomeData } from "@/data/types";

type GsapModule = typeof import("gsap");
type GsapContext = ReturnType<GsapModule["context"]>;
type GsapTween = ReturnType<GsapModule["fromTo"]>;

interface HomePageProps {
  data: HomeData;
}

export default function HomePage({ data }: HomePageProps) {
  const { hero, experiences, skills, credentials, cta } = data;

  const [heroComplete, setHeroComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedExperience, setSelectedExperience] =
    useState<ExperienceDetail | null>(null);
  const [visibleExperiences, setVisibleExperiences] = useState<
    Record<string, boolean>
  >({});
  const experienceRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const registerExperienceRef = useCallback(
    (id: string) => (node: HTMLDivElement | null) => {
      if (node) {
        experienceRefs.current[id] = node;
      } else {
        delete experienceRefs.current[id];
      }
    },
    [],
  );

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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const id = (entry.target as HTMLElement).dataset.experienceId;

          if (!id) {
            return;
          }

          setVisibleExperiences((prev) => {
            if (prev[id]) {
              return prev;
            }

            return {
              ...prev,
              [id]: true,
            };
          });
        });
      },
      { threshold: 0.4 },
    );

    const elements = Object.values(experienceRefs.current).filter(
      (node): node is HTMLDivElement => Boolean(node),
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      elements.forEach((element) => observer.unobserve(element));
      observer.disconnect();
    };
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

    let ctx: GsapContext | undefined;
    const tweens: GsapTween[] = [];
    const triggers: ScrollTriggerType[] = [];
    let isMounted = true;

    void (async () => {
      const [gsapModule, scrollTriggerModule] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      const gsap = gsapModule.gsap;
      const ScrollTrigger = (
        scrollTriggerModule.ScrollTrigger ?? scrollTriggerModule.default
      ) as ScrollTriggerType | undefined;

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

        const snapFn =
          sections.length > 1 && ScrollTrigger?.utils
            ? ScrollTrigger.utils.snap(1 / (sections.length - 1))
            : undefined;

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
          const snapTrigger = ScrollTrigger.create({
            start: 0,
            end: () => ScrollTrigger.maxScroll(window),
            snap: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              snapTo: (value: any) => snapFn(value),
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
          className={`space-y-1 text-sm uppercase tracking-[0.3em] text-black/70 transition-opacity duration-500 delay-75 ${
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
            const isUnlocked = Boolean(visibleExperiences[experience.id]);

            return (
              <article
                key={experience.id}
                ref={registerExperienceRef(experience.id)}
                data-experience-id={experience.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (isUnlocked) {
                    setSelectedExperience(experience);
                  }
                }}
                onKeyDown={(event) => {
                  if (!isUnlocked) {
                    return;
                  }

                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedExperience(experience);
                  }
                }}
                className={`border border-black/25 bg-white/40 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)] transition duration-200 ${
                  isUnlocked
                    ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 hover-lift"
                    : "cursor-not-allowed opacity-95"
                }`}
                aria-disabled={!isUnlocked}
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
                  className={`mt-2 text-[0.62rem] uppercase tracking-[0.32em] ${
                    isUnlocked ? "text-[var(--ink-red)]" : "text-black/35"
                  }`}
                >
                  {isUnlocked ? "Tap to open the letter" : "Scroll to unlock"}
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

        <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-md border border-black/20 bg-white/60 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {skills.categories.map((category) => (
                <div
                  key={category.title}
                  className="border border-black/15 bg-white/75 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]"
                >
                  <p className="text-[0.62rem] uppercase tracking-[0.32em] text-black/60">
                    {category.title}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {category.items.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center border border-black/25 bg-white/85 px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.26em] text-black/80 shadow-[0_1px_0_rgba(0,0,0,0.05)] hover-lift"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <aside className="space-y-4 rounded-md border border-black/20 bg-white/60 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]">
            <div className="space-y-2">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-black/60">
                {credentials.heading}
              </p>
              <div className="space-y-1.5">
                {credentials.certifications.map((certification) => (
                  <div
                    key={certification}
                    className="hover-lift border border-black/25 bg-white/80 px-3 py-2 text-sm text-black/85 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)]"
                  >
                    <p className="font-medium tracking-tight">{certification}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-px w-full bg-black/15" aria-hidden="true" />
            <div className="space-y-2">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-black/60">
                Education
              </p>
              <div className="space-y-2">
                {credentials.education.map((education) => (
                  <div
                    key={`${education.school}-${education.period}`}
                    className="hover-lift border border-black/25 bg-white/80 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold tracking-tight text-black">
                        {education.school}
                      </p>
                      <span className="text-[0.6rem] uppercase tracking-[0.28em] text-black/60">
                        {education.period}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-black/80">
                      {education.program}
                    </p>
                    <p className="text-[0.7rem] uppercase tracking-[0.28em] text-black/60">
                      {education.location}
                      {education.gpa ? ` \u00b7 GPA ${education.gpa}` : ""}
                    </p>
                    {education.note ? (
                      <p className="mt-2 text-xs text-black/75">
                        {education.note}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
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
        <header>
          <p className="text-xs uppercase tracking-[0.45em] text-black/55">
            Next on the ribbon
          </p>
          <h2 className="text-3xl font-serif text-shadow-sm tracking-tight">
            {cta.heading}
          </h2>
        </header>
        <p className="max-w-2xl text-sm text-black/75">{cta.body}</p>
        <p className="text-sm text-black/75">{cta.closing}</p>
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
