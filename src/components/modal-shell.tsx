"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ModalShellProps {
  onClose: () => void;
  labelledById: string;
  describedById: string;
  children: React.ReactNode;
}

/**
 * Shared modal chrome used by the experience and project modals.
 *
 * Owns the identical behavior both previously duplicated: portal mount, body
 * scroll-lock, Escape-to-close, the GSAP intro timeline, and the smooth
 * wheel-scroll inside the dialog body. The wheel-hijack is skipped under
 * prefers-reduced-motion so those users keep native scrolling. Visuals are
 * unchanged for everyone else.
 */
export default function ModalShell({
  onClose,
  labelledById,
  describedById,
  children,
}: ModalShellProps) {
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

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

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

      // Reduced-motion users keep native scrolling; skip the wheel-hijack.
      if (!scrollElement || prefersReducedMotion) {
        return;
      }

      wheelHandler = (event: WheelEvent) => {
        if (!gsapInstance) {
          return;
        }

        const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;

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
        aria-labelledby={labelledById}
        aria-describedby={describedById}
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
          id={describedById}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
