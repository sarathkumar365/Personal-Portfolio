"use client";

import { useMemo, useState } from "react";

import type { BlogPost } from "@/data/types";

type BlogsClientProps = {
  posts: BlogPost[];
};

export default function BlogsClient({ posts }: BlogsClientProps) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const activePost = useMemo(
    () => posts.find((post) => post.slug === activeSlug) ?? null,
    [activeSlug, posts],
  );

  const closeModal = () => setActiveSlug(null);

  return (
    <div className="space-y-16">
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.45em] text-black/55">Blogs</p>
        <h1 className="text-3xl font-semibold tracking-tight">Field notes & essays</h1>
        <p className="max-w-2xl text-sm text-black/75">
          Essays on engineering, design process, and building trustworthy digital experiences.
          Tap a card to open a reader-friendly modal without leaving the page.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="border border-black/25 bg-white/40 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)] transition duration-200 hover:-translate-y-1 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8),0_18px_32px_rgba(0,0,0,0.08)]"
          >
            <button
              type="button"
              onClick={() => setActiveSlug(post.slug)}
              className="flex h-full w-full flex-col text-left"
            >
              <span className="text-[0.65rem] uppercase tracking-[0.4em] text-black/55">
                {new Date(post.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                })}
              </span>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">{post.title}</h2>
              <p className="mt-3 text-sm text-black/75">{post.summary}</p>
              <span className="mt-5 inline-flex items-center text-[0.6rem] uppercase tracking-[0.35em] text-black">
                Read entry ↗
              </span>
            </button>
          </article>
        ))}
      </div>

      {activePost ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePost.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-10"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-2xl border border-black bg-white px-6 pb-8 pt-6 shadow-[0_20px_45px_rgba(0,0,0,0.35)]"
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
            <div className="mt-5 space-y-4 text-sm text-black/80">
              {activePost.content.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
