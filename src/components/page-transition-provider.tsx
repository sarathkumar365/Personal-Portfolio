"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

interface PageTransitionContextValue {
  registerContainer: (node: HTMLDivElement | null) => void;
  startTransition: (href: string) => void;
  isAnimating: boolean;
}

const PageTransitionContext = createContext<PageTransitionContextValue | null>(
  null,
);

export function PageTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const prefersReducedMotionRef = useRef(false);
  const hasAnimatedOnceRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = (matches: boolean) => {
      prefersReducedMotionRef.current = matches;
    };
    update(media.matches);
    const handler = (event: MediaQueryListEvent) => update(event.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const registerContainer = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    void import("gsap").then(({ gsap }) => {
      gsap.killTweensOf(container);

      if (prefersReducedMotionRef.current) {
        gsap.set(container, { clearProps: "all" });
        return;
      }

      if (!hasAnimatedOnceRef.current) {
        hasAnimatedOnceRef.current = true;
        gsap.set(container, { clearProps: "all" });
        return;
      }

      gsap.set(container, {
        transformPerspective: 1200,
        transformOrigin: "right center",
      });
      gsap.fromTo(
        container,
        { xPercent: 100, rotateY: -12, opacity: 0 },
        {
          xPercent: 0,
          rotateY: 0,
          opacity: 1,
          duration: 0.65,
          ease: "power2.out",
        },
      );
    });
  }, [pathname]);

  const startTransition = useCallback(
    (href: string) => {
      if (href === pathname || isAnimating) {
        return;
      }

      const container = containerRef.current;

      if (!container || prefersReducedMotionRef.current) {
        router.push(href);
        return;
      }

      setIsAnimating(true);

      void import("gsap")
        .then(({ gsap }) => {
          gsap.killTweensOf(container);
          const timeline = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            onComplete: () => {
              gsap.set(container, {
                xPercent: 100,
                rotateY: -12,
                opacity: 0,
              });
              router.push(href);
              requestAnimationFrame(() => setIsAnimating(false));
            },
          });

          timeline.to(container, {
            xPercent: -120,
            rotateY: 10,
            opacity: 0,
            duration: 0.55,
          });
        })
        .catch(() => {
          setIsAnimating(false);
          router.push(href);
        });
    },
    [isAnimating, pathname, router],
  );

  const value = useMemo<PageTransitionContextValue>(
    () => ({ registerContainer, startTransition, isAnimating }),
    [registerContainer, startTransition, isAnimating],
  );

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error(
      "usePageTransition must be used within a PageTransitionProvider",
    );
  }
  return context;
}

export function PageTransitionContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { registerContainer } = usePageTransition();
  return (
    <div
      ref={registerContainer}
      className={["relative will-change-transform w-full", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
