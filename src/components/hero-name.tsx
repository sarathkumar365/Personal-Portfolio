"use client";

import { useEffect, useRef } from "react";

type HeroNameProps = {
  name: string;
  title: string;
  onComplete?: () => void;
};

let heroNameAnimatedOnce = false;

export default function HeroName({ name, title, onComplete }: HeroNameProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let isMounted = true;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (prefersReducedMotion.matches) {
      heroNameAnimatedOnce = true;
      window.requestAnimationFrame(() => onComplete?.());
      return () => {
        isMounted = false;
      };
    }

    if (heroNameAnimatedOnce) {
      window.requestAnimationFrame(() => onComplete?.());
      return () => {
        isMounted = false;
      };
    }

    void (async () => {
      const [{ gsap }, { ScrambleTextPlugin }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrambleTextPlugin"),
      ]);

      if (!isMounted || !containerRef.current || !nameRef.current || !titleRef.current) {
        return;
      }

      gsap.registerPlugin(ScrambleTextPlugin);

      const ctx = gsap.context(() => {
        const timeline = gsap.timeline({ defaults: { ease: "power2.out" } });

        timeline
          .fromTo(
            nameRef.current,
            { scrambleText: { text: "", chars: "upperCase", speed: 1.4 } },
            {
              duration: 2.2,
              scrambleText: {
                text: name,
                chars: "upperCase",
                tweenLength: true,
                speed: 0.8,
              },
            },
          )
          .fromTo(
            titleRef.current,
            { opacity: 0, y: 6 },
            { opacity: 1, y: 0, duration: 0.8 },
            "-=0.6",
          )
          .add(() => {
            onComplete?.();
          });

        timeline.eventCallback("onComplete", () => {
          heroNameAnimatedOnce = true;
        });
      }, containerRef);

      cleanup = () => ctx.revert();
    })();

    return () => {
      isMounted = false;
      cleanup?.();
    };
  }, [name, title, onComplete]);

  return (
    <h1
      ref={containerRef}
      className="text-4xl font-bold tracking-tight sm:text-5xl"
    >
      <span ref={nameRef} className="inline-block">
        {name}
      </span>
      <span className="inline-block"> · </span>
      <span ref={titleRef} className="inline-block">
        {title}
      </span>
    </h1>
  );
}
