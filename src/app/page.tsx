const experiences = [
  {
    period: "2021 — Present",
    role: "Senior Full-Stack Developer",
    company: "Independent",
    summary:
      "Leading end-to-end delivery of web applications with a focus on resilient infrastructure, polished UX, and measurable outcomes.",
  },
  {
    period: "2018 — 2021",
    role: "Product Engineer",
    company: "Studio & SaaS teams",
    summary:
      "Shipped performant React frontends, designed scalable Node backends, and mentored teams on modern tooling and accessibility.",
  },
  {
    period: "2014 — 2018",
    role: "Software Engineer",
    company: "Various startups",
    summary:
      "Built and maintained feature-rich products across fintech and education, working closely with designers and stakeholders.",
  },
];

const skills = [
  "TypeScript",
  "React / Next.js",
  "Node.js",
  "PostgreSQL",
  "Tailwind CSS",
  "Framer Motion",
  "tRPC",
  "AWS",
  "Playwright",
];

const highlights = [
  "Crafting narrative-driven portfolios and dashboards with motion-rich details.",
  "Obsessed with clean typography, inclusive experiences, and performance budgets.",
  "Collaborating with founders to translate ideas into reliable, scalable software.",
];

export default function Home() {
  return (
    <div className="space-y-20">
      <section className="space-y-6">
        <p className="text-xs uppercase tracking-[0.5em] text-black/60">Typed on a calm morning</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Sarath Kumar · Full-Stack Developer
        </h1>
        <p className="max-w-2xl text-base sm:text-lg text-black/80">
          I help teams craft thoughtful digital experiences—from strategy and architecture to
          {" "}
          authentic interfaces that feel as personal as a letter from a well-loved typewriter.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-sm border border-black/30 bg-white/50 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]">
            <p className="text-[0.55rem] uppercase tracking-[0.45em] text-black/60">Experience</p>
            <p className="mt-2 text-xl font-semibold">10+ years</p>
          </div>
          <div className="rounded-sm border border-black/30 bg-white/50 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]">
            <p className="text-[0.55rem] uppercase tracking-[0.45em] text-black/60">Primary Stack</p>
            <p className="mt-2 text-xl font-semibold">Next.js · Node.js</p>
          </div>
          <div className="rounded-sm border border-black/30 bg-white/50 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]">
            <p className="text-[0.55rem] uppercase tracking-[0.45em] text-black/60">Location</p>
            <p className="mt-2 text-xl font-semibold">Remote · GMT+5:30</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-2 text-sm">
          <a
            href="/projects"
            className="inline-flex items-center justify-center border border-black bg-black px-6 py-2 text-white transition-transform duration-200 hover:-translate-y-0.5"
          >
            View Projects
          </a>
          <a
            href="/blogs"
            className="inline-flex items-center justify-center border border-black/60 px-6 py-2 text-black transition-colors duration-200 hover:bg-black hover:text-white"
          >
            Read Blogs
          </a>
        </div>
      </section>

      <div className="h-px w-full border-t border-black/20 border-dashed" aria-hidden="true" />

      <section className="space-y-6">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.45em] text-black/55">Experience log</p>
          <h2 className="text-2xl font-semibold tracking-tight">Selected chapters</h2>
        </header>
        <div className="space-y-6">
          {experiences.map((experience) => (
            <article
              key={experience.period}
              className="border border-black/25 bg-white/40 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)] transition duration-200 hover:-translate-y-1 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8),0_16px_32px_rgba(0,0,0,0.08)]"
            >
              <p className="text-[0.6rem] uppercase tracking-[0.42em] text-black/60">
                {experience.period}
              </p>
              <h3 className="mt-2 text-xl font-semibold">
                {experience.role} · {experience.company}
              </h3>
              <p className="mt-3 text-sm text-black/75">
                {experience.summary}
              </p>
            </article>
          ))}
        </div>
      </section>

      <div className="h-px w-full border-t border-black/20 border-dashed" aria-hidden="true" />

      <section className="grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-[0.45em] text-black/55">Toolkit</p>
            <h2 className="text-2xl font-semibold tracking-tight">Skills & Technologies</h2>
          </header>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {skills.map((skill) => (
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
          <p className="text-xs uppercase tracking-[0.45em] text-black/55">Highlights</p>
          <ul className="space-y-3 text-sm text-black/75">
            {highlights.map((highlight) => (
              <li key={highlight} className="relative pl-5">
                <span className="absolute left-0 top-1.5 h-1 w-1 bg-black" aria-hidden="true" />
                {highlight}
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <div className="h-px w-full border-t border-black/20 border-dashed" aria-hidden="true" />

      <section className="space-y-4">
        <header>
          <p className="text-xs uppercase tracking-[0.45em] text-black/55">Next on the ribbon</p>
          <h2 className="text-2xl font-semibold tracking-tight">Let&rsquo;s build something enduring</h2>
        </header>
        <p className="max-w-2xl text-sm text-black/75">
          Whether it&rsquo;s a portfolio rich with story, a high-performing SaaS dashboard, or a
          bespoke content platform, I bring a balanced stack and an eye for detail to every
          engagement.
        </p>
        <p className="text-sm text-black/75">
          Ready when you are: drop a line to discuss your next chapter, or explore the
          projects and essays linked above.
        </p>
      </section>
    </div>
  );
}
