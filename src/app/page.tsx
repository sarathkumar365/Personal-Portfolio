"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { GSAPContext, GSAPTween } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

import HeroName from "@/components/hero-name";
import ExperienceModal from "@/components/experience-modal";
import { getHomeData } from "@/data/portfolio";
import type { ExperienceDetail } from "@/types/experiences";

const { hero, stats, experiences, skills, credentials, cta } = getHomeData();

export default function Home() {
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

    let ctx: GSAPContext | undefined;
    const tweens: GSAPTween[] = [];
    const triggers: ScrollTriggerType[] = [];
    let isMounted = true;

    void (async () => {
      const [gsapModule, scrollTriggerModule] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      const gsap = gsapModule.gsap;
      const ScrollTrigger =
        scrollTriggerModule.ScrollTrigger ?? scrollTriggerModule.default;

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
            }
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
              snapTo: (value) => snapFn(value),
              duration: { min: 0.18, max: 0.35 },
              ease: "power2.inOut",
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
    <div ref={containerRef} className="space-y-20">
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
              className="hover:text-black"
            >
              {hero.contact.email}
            </a>{" "}
            ·{" "}
            <a
              href={hero.contact.linkedin}
              className="hover:text-black"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>{" "}
            ·{" "}
            <a
              href={hero.contact.github}
              className="hover:text-black"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </p>
        </div>

        <div
          className={`grid gap-4 transition-opacity duration-500 delay-[120ms] sm:grid-cols-3 ${
            heroComplete ? "opacity-100" : "opacity-0"
          }`}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-sm border border-black/30 bg-white/50 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]"
            >
              <p className="text-[0.55rem] uppercase tracking-[0.45em] text-black/60">
                {stat.label}
              </p>
              <p className="mt-2 text-xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <div
        className="h-px w-full border-t border-black/20 border-dashed"
        aria-hidden="true"
      />

      <section
        data-page-section
        className={`page-turn-section space-y-6 transition-opacity duration-500 delay-[220ms] ${
          heroComplete ? "opacity-100" : "opacity-0"
        }`}
      >
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.45em] text-black/55">
            Experience log
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
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
                className="border border-black/25 bg-white/40 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)] transition duration-200 hover:-translate-y-1 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8),0_16px_32px_rgba(0,0,0,0.08)]"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6rem] uppercase tracking-[0.42em] text-black/60">
                  <span>{experience.period}</span>
                  <span className="text-black/30">·</span>
                  <span>{experience.location}</span>
                </div>
                <h3 className="mt-2 text-xl font-semibold">
                  {experience.role} · {experience.company}
                </h3>
                <p className="mt-3 text-sm text-black/75">{experience.summary}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.32em] text-black/55">
                    {experience.details.headline}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (isUnlocked) {
                        setSelectedExperience(experience);
                      }
                    }}
                    disabled={!isUnlocked}
                    className={`rounded-sm border border-black/40 px-4 py-2 text-[0.65rem] uppercase tracking-[0.3em] transition ${
                      isUnlocked
                        ? "bg-black text-white hover:-translate-y-0.5 hover:bg-black/90"
                        : "cursor-not-allowed bg-white/40 text-black/40"
                    }`}
                  >
                    {isUnlocked ? "Open letter" : "Scroll to unlock"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div
        className="h-px w-full border-t border-black/20 border-dashed"
        aria-hidden="true"
      />

      <section
        data-page-section
        className={`page-turn-section grid gap-10 transition-opacity duration-500 delay-[280ms] lg:grid-cols-[2fr_1fr] ${
          heroComplete ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="space-y-5">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-[0.45em] text-black/55">
              Toolkit
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              {skills.heading}
            </h2>
          </header>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {skills.items.map((skill) => (
              <li
                key={skill}
                className="border border-black/30 bg-white/50 px-4 py-3 text-sm font-medium uppercase tracking-[0.3em] text-black/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)]"
              >
                {skill}
              </li>
            ))}
          </ul>
        </div>
        <aside className="space-y-4 border border-black/25 bg-white/40 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]">
          <p className="text-xs uppercase tracking-[0.45em] text-black/55">
            {credentials.heading}
          </p>
          <ul className="space-y-3 text-sm text-black/75">
            {credentials.items.map((item) => (
              <li key={item} className="relative pl-5">
                <span
                  className="absolute left-0 top-1.5 h-1 w-1 bg-black"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <div
        className="h-px w-full border-t border-black/20 border-dashed"
        aria-hidden="true"
      />

      <section
        data-page-section
        className={`page-turn-section space-y-4 transition-opacity duration-500 delay-[360ms] ${
          heroComplete ? "opacity-100" : "opacity-0"
        }`}
      >
        <header>
          <p className="text-xs uppercase tracking-[0.45em] text-black/55">
            Next on the ribbon
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
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
