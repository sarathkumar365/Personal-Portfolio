# Landing Page Execution Plan

Purpose: execute landing page improvements in a strict order without losing the intended story (typewritten editorial artifact + credible engineering proof).

Scope: planning only. No implementation in this document.

## How To Use This Plan
1. Execute passes in order: Pass 1 -> Pass 2 -> Pass 3.
2. Complete all items in a pass before starting the next pass.
3. Keep each change data-driven where possible (content in JSON, behavior in components, styling in global system).
4. After each pass, run quick regression checks: desktop/mobile layout, keyboard nav, modal open/close, and reduced-motion behavior.

---

## Pass 1 - Story Clarity (Highest Impact)

Goal: make the first read unmistakably clear and evidence-forward.

### 1.1 Remove narrative friction in Experience
- Replace or soften "unlock" mechanics so experience proof is immediately available.
- Keep interaction optional enhancement, not a gate.
- Files to review:
  - `src/components/home-page.tsx`
  - `src/components/experience-modal.tsx`

### 1.2 Strengthen hero proof signal
- Keep current voice, but introduce one concrete impact signal near hero summary/stat strip.
- Ensure the first screen answers: who you are + what measurable value you create.
- Files to review:
  - `data-source/home.json`
  - `src/components/home-page.tsx`

### 1.3 Align CTA tone with earlier sections
- Make CTA feel like natural continuation of hero + experience tone.
- Keep invitation direct and specific.
- Files to review:
  - `data-source/home.json`
  - `src/components/home-page.tsx`

### 1.4 Section-by-section recruiter scan test
- Verify each section quickly answers one key question:
  - Hero: Who is this person?
  - Experience: What impact have they delivered?
  - Toolkit/Credentials: How do they work and what validates them?
  - CTA: What is the next action?
- Files to review:
  - `src/components/home-page.tsx`
  - `data-source/home.json`

Exit criteria for Pass 1:
- No section requires interaction before showing proof.
- First viewport communicates identity + impact clearly.
- CTA tone matches the page voice.

---

## Pass 2 - Interaction Discipline

Goal: motion supports reading instead of competing with it.

### 2.1 Audit concurrent motion layers
- List all simultaneous motion sources and reduce overlap in key reading moments.
- Prioritize a single dominant motion cue at a time.
- Files to review:
  - `src/app/globals.css`
  - `src/components/hero-name.tsx`
  - `src/components/home-page.tsx`
  - `src/components/page-transition-provider.tsx`

### 2.2 Calibrate page-turn behavior
- Keep page-turn metaphor subtle; avoid content distortion that hurts legibility.
- Ensure transitions feel intentional but not theatrical.
- Files to review:
  - `src/components/home-page.tsx`
  - `src/app/globals.css`

### 2.3 Standardize modal interaction language/behavior
- Ensure modal affordances and copy are consistent across experience/project/blog patterns.
- Confirm behavior parity: backdrop close, escape close, scroll handling, focus expectations.
- Files to review:
  - `src/components/experience-modal.tsx`
  - `src/components/project-modal.tsx`
  - `src/app/blogs/blogs-client.tsx`

### 2.4 Complete reduced-motion compliance
- Ensure every animated layer honors reduced-motion preference.
- Include background drift and section/route motion behavior.
- Files to review:
  - `src/app/globals.css`
  - `src/components/home-page.tsx`
  - `src/components/page-transition-provider.tsx`
  - `src/components/hero-name.tsx`

Exit criteria for Pass 2:
- Motion is noticeable but secondary to content.
- Modal behavior is consistent across the site.
- Reduced-motion mode feels fully respected, not partial.

---

## Pass 3 - Visual Consistency

Goal: unify the interface as one deliberate visual system across breakpoints.

### 3.1 Preserve signature motif across breakpoints
- Keep signature identity present on mobile in an intentional, proportionate form.
- Avoid accidental disappearance of brand motif.
- Files to review:
  - `src/components/signature-mark.tsx`
  - `src/app/layout.tsx`
  - `src/app/globals.css`

### 3.2 Tighten spacing and rhythm
- Standardize vertical cadence around dividers, headings, cards, and section blocks.
- Eliminate spacing "jumps" that break the document feel.
- Files to review:
  - `src/components/home-page.tsx`
  - `src/app/globals.css`

### 3.3 Normalize typography and micro-UI tokens
- Harmonize uppercase tracking values, metadata text sizing, border weights, and shadow strengths.
- Keep hierarchy expressive but systematic.
- Files to review:
  - `src/app/globals.css`
  - `src/components/home-page.tsx`
  - `src/components/navigation.tsx`
  - `src/app/projects/page.tsx`
  - `src/app/blogs/blogs-client.tsx`

### 3.4 Sync documentation with implementation
- Update project docs to match actual visual and interaction decisions.
- Remove stale references to avoid future drift.
- Files to review:
  - `IMPLEMENTATION.md`
  - `README.md`

Exit criteria for Pass 3:
- Desktop/mobile feel like the same design language.
- Typography and component surfaces look intentionally systematized.
- Documentation accurately describes current behavior.

---

## Suggested Working Rhythm (Per Pass)
1. Define exact acceptance checklist before editing.
2. Apply content/data adjustments first, then behavior, then styling.
3. Validate at key widths: mobile, tablet, desktop.
4. Run lint and manual interaction checks before closing the pass.
5. Commit each pass separately for clean rollback/history.

---

## Progress Tracker

- [ ] Pass 1 complete
- [ ] Pass 2 complete
- [ ] Pass 3 complete

