# Implementation Notes: Typewriter Portfolio

## Project Overview
Next.js 15 (App Router) application styled to resemble a 1900s typewriter page while staying responsive. Three main routes exist today: `/` (home), `/projects`, and `/blogs`.

## Tooling Stack
- **Next.js 15 App Router** & **TypeScript** for typed server/client components.
- **Tailwind CSS v4** imported via `@import "tailwindcss";`, using utility classes for layout and typography.
- **Google Font (Courier Prime)** loaded through `next/font/google` to achieve the typewriter aesthetic.
- **React hooks** (`useState`, `useMemo`) in client components (blogs modal) for interactivity.

## Key Files
```
src/app/
  layout.tsx         // Root layout & global chrome
  globals.css        // Background texture + shared helpers
  page.tsx           // Home route
  projects/page.tsx  // Projects listing
  blogs/page.tsx     // Blog cards + modal reader
src/components/
  navigation.tsx     // Centered navigation bar
```

## Layout Shell (`src/app/layout.tsx`)
- Imports Courier Prime and attaches the variable to the `<body>` class.
- Wraps all routes in `.site-canvas` (centers content) and `.paper-sheet` (paper-like background) defined in `globals.css`.
- Renders the shared `<NavigationBar />` above the page `<main>` block, ensuring nav consistency across routes.

## Global Styling (`src/app/globals.css`)
- Declares CSS variables (`--paper-base`, `--ink`, etc.) to support the monochrome palette.
- Builds the paper texture with layered gradients and sets typography defaults (letter-spacing, line-height, font stack).
- Defines helper classes (`page-content`, `shadow-soft`, etc.) and global link styling via `@layer base` so Tailwind utilities (e.g., `hover:text-white`) retain precedence.
- Media queries shrink padding on smaller breakpoints, keeping the paper margins balanced on mobile.

## Navigation (`src/components/navigation.tsx`)
- `navItems` array maps to three buttons (Home, Projects, Blogs).
- `usePathname()` computes active state; matching links receive a black background and light foreground.
- Uses a shared `baseLinkClasses` string to enforce uppercase tracking and uniform sizing.
- Inactive links invert to black-on-white while hovering, which now respect Tailwind text utilities after the `@layer base` update.

## Home Route (`src/app/page.tsx`)
- Content is divided into sections separated by dashed rules to mimic typewritten page breaks.
- Static arrays (`experiences`, `skills`, `highlights`) feed JSX maps, making it easy to swap data sources later (Contentlayer, CMS, etc.).
- Hero section combines a heading, supporting paragraph, and stat cards laid out with Tailwind grids.
- CTA links reuse the monochrome palette—primary button is black with light text, outline button inverts on hover.
- Subsequent sections:
  - **Experience log**: `<article>` cards with hover lift.
  - **Skills & Technologies**: responsive grid of uppercase badges.
  - **Highlights**: aside with custom bullet markers.
  - **Closing call-to-action** with copy prepared for future contact links.

## Projects Route (`src/app/projects/page.tsx`)
- Defines a `projects` array containing `title`, `year`, `stack`, and `description` fields.
- Each project renders inside a bordered card with subtle hover translation.
- Stack labels use uppercase tracking to emulate type labels and ensure legibility without color.
- The layout relies on vertical spacing (`space-y-8`) so new projects can be appended seamlessly.

## Blogs Route (`src/app/blogs/page.tsx`)
- Marked `"use client"` because it relies on stateful interactions.
- `posts` array stores frontmatter-like metadata plus `body` paragraphs for each article.
- Clicking a card sets `activeSlug` via `useState`; `useMemo` resolves the active post for rendering.
- Modal implementation:
  - Uses a full-screen overlay (`fixed inset-0 bg-black/60`) to dim the background.
  - `role="dialog"`, `aria-modal="true"`, and `aria-label` support accessibility.
  - Clicks on the backdrop call `closeModal`; clicks inside the modal stop propagation.
  - Close button sits in the top-right and uses uppercase text to stay on theme.
- To add a new blog post, append a new object with `slug`, `title`, `date`, `summary`, and `body` array entries.

## Theming & Utilities
- CSS variables create consistent ink/paper colors. Adjusting them in `:root` instantly re-themes the app.
- `.paper-sheet` applies border, subtle inner highlight, and drop-shadow to resemble a sheet of paper placed on a desk.
- Tailwind’s responsive utilities (`sm:`, `lg:`) keep grids legible on smaller screens without separate components.
- Global smooth scrolling is enabled via `<html className="scroll-smooth">` in the layout.

## Extending the Project
- **Projects/Blogs data**: migrate arrays to MDX + Contentlayer or a headless CMS when dynamic content is required.
- **Animations**: integrate Framer Motion around sections/cards by wrapping them in `motion.div`s—no structural changes needed thanks to the static data maps.
- **Navigation**: add more items by extending `navItems`. Active state logic already handles nested routes (e.g., `/projects/case-study`).
- **Styling tweaks**: adjust background textures or typography by editing `globals.css` without touching component markup.

