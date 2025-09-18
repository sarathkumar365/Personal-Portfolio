# Implementation Notes: Typewriter Portfolio

## Project Overview
Next.js 15 (App Router) application styled to resemble a 1900s typewriter page while staying responsive. Three main routes exist today: `/` (home), `/projects`, and `/blogs`.

## Tooling Stack
- **Next.js 15 App Router** & **TypeScript** for typed server/client components.
- **Tailwind CSS v4** imported via `@import "tailwindcss";`, using utility classes for layout and typography.
- **Google Font (Courier Prime)** loaded through `next/font/google` to achieve the typewriter aesthetic.
- **React hooks** (`useState`, `useMemo`) in client modules (blogs modal) for interactivity.
- **Central JSON data source** consumed via typed helpers in `src/data/portfolio.ts`.

## Key Files
```
data-source/
  home.json                // Hero, stats, experience, skills, credentials, CTA copy
  projects.json            // Project cards
  blogs/*.json             // One JSON file per blog entry
src/app/
  layout.tsx               // Root layout & global chrome
  globals.css              // Background texture + shared helpers
  page.tsx                 // Home route
  projects/page.tsx        // Projects listing
  blogs/page.tsx           // Server component wrapper for blogs
  blogs/blogs-client.tsx   // Client component powering modal interactions
src/components/
  navigation.tsx           // Centered navigation bar
src/data/
  types.ts                 // Shared TypeScript interfaces for JSON data
  portfolio.ts             // Helper functions returning typed data slices
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
- Pulls structured content from `getHomeData()` which hydrates JSON into typed objects.
- Sections are separated by dashed rules to mimic typewritten page breaks while mapping directly over JSON arrays (`stats`, `experiences`, `skills.items`, `credentials.items`).
- Hero block renders location label, name/title, summary, and contact strip sourced from `home.json` to avoid hardcoding.
- Final CTA section copies the `cta` object, keeping messaging editable without touching component code.

## Projects Route (`src/app/projects/page.tsx`)
- Calls `getProjects()` to retrieve the typed array from `projects.json`.
- Each project renders inside a bordered card with subtle hover translation.
- Link buttons are optional and render when the JSON supplies entries in `links`.
- Vertical spacing (`space-y-8`) keeps additions simple—drop a new object into the JSON array to surface another card.

## Blogs Route (`src/app/blogs/page.tsx` + `blogs/blogs-client.tsx`)
- Server component wrapper (`page.tsx`) loads typed data via `getBlogPosts()` and passes it into the client component.
- Client module maps over the JSON-driven posts to render cards and manages modal state with `useState`/`useMemo`.
- Modal implementation:
  - Uses a full-screen overlay (`fixed inset-0 bg-black/60`) to dim the background.
  - `role="dialog"`, `aria-modal="true"`, and `aria-label` support accessibility.
  - Clicks on the backdrop call `closeModal`; clicks inside the modal stop propagation.
  - Close button sits in the top-right and uses uppercase text to stay on theme.
- Add a blog by dropping a new JSON file in `data-source/blogs/`; the helper aggregates and sorts posts by date automatically.

## Theming & Utilities
- CSS variables create consistent ink/paper colors. Adjusting them in `:root` instantly re-themes the app.
- `.paper-sheet` applies border, subtle inner highlight, and drop-shadow to resemble a sheet of paper placed on a desk.
- Tailwind’s responsive utilities (`sm:`, `lg:`) keep grids legible on smaller screens without separate components.
- Global smooth scrolling is enabled via `<html className="scroll-smooth">` in the layout.

## Extending the Project
- **Data source evolution**: swap JSON loaders for CMS fetches inside `src/data/portfolio.ts` without touching the UI layer.
- **Animations**: integrate Framer Motion around sections/cards by wrapping them in `motion.div`s—no structural changes needed thanks to the data-driven maps.
- **Navigation**: add more items by extending `navItems`. Active state logic already handles nested routes (e.g., `/projects/case-study`).
- **Styling tweaks**: adjust background textures or typography by editing `globals.css` without touching component markup.
