"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import type { BlogPost } from "@/data/types";
import { safeHttpUrl } from "@/lib/safe-url";

type BlogsClientProps = {
  posts: BlogPost[];
};

export default function BlogsClient({ posts }: BlogsClientProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const activePost = useMemo(
    () => posts.find((post) => post.slug === activeSlug) ?? null,
    [activeSlug, posts],
  );

  const closeModal = () => setActiveSlug(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!activePost) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [activePost]);

  useEffect(() => {
    if (!activePost) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activePost]);

  return (
    <div className="space-y-16">
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.45em] text-black/55">Blogs</p>
        <h1 className="text-4xl font-serif text-shadow-sm tracking-tight">
          Notes from shipped work
        </h1>
        <p className="max-w-2xl text-sm text-black/75">
          Practical writing on software delivery, architecture choices, and product
          decisions shaped by real execution.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="group border border-black/25 bg-white/40 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)] hover-lift"
          >
            <button
              type="button"
              onClick={() => setActiveSlug(post.slug)}
              className="flex h-full w-full flex-col text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ink-blue)]"
            >
              <span className="text-[0.65rem] uppercase tracking-[0.4em] text-[var(--ink-red)] opacity-80">
                {new Date(post.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                })}
              </span>
              <h2 className="mt-2 text-xl font-semibold tracking-tight group-hover:text-[var(--ink-blue)] transition-colors">
                {post.title}
              </h2>
              <p className="mt-3 text-sm text-black/75">{post.summary}</p>
              <span className="mt-5 inline-flex items-center text-[0.6rem] uppercase tracking-[0.35em] text-black group-hover:text-[var(--ink-blue)] group-hover:underline decoration-dotted underline-offset-4 transition-all">
                Read entry ↗
              </span>
            </button>
          </article>
        ))}
      </div>

      {isMounted && activePost
        ? createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePost.title}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 backdrop-blur-md px-4 py-10"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-2xl border border-black/25 bg-[#fefbf6] px-6 pb-8 pt-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-5 top-4 text-[0.6rem] uppercase tracking-[0.35em] text-black/70 hover:text-black"
            >
              Close ✕
            </button>
            <span className="text-[0.65rem] uppercase tracking-[0.4em] text-black/55">
              {new Date(activePost.date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
              })}
            </span>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{activePost.title}</h2>
            <div className="mt-5 max-h-[75vh] space-y-4 overflow-y-auto pr-1 text-sm text-black/80 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {activePost.content.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {safeHttpUrl(activePost.sourceUrl) ? (
                <a
                  href={safeHttpUrl(activePost.sourceUrl) ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center border border-black px-3 py-2 text-[0.6rem] uppercase tracking-[0.35em] text-black transition-colors duration-200 hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2"
                >
                  {activePost.sourceLabel ?? "Read the original"} ↗
                </a>
              ) : null}
            </div>
          </div>
        </div>
            ,
            document.body,
          )
        : null}
    </div>
  );
}
