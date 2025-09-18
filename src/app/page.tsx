import { getHomeData } from "@/data/portfolio";

const {
  hero,
  stats,
  experiences,
  skills,
  credentials,
  cta,
} = getHomeData();

export default function Home() {
  return (
    <div className="space-y-20">
      <section className="space-y-6">
        <p className="text-xs uppercase tracking-[0.5em] text-black/60">
          {hero.locationLabel}
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          {hero.name} · {hero.title}
        </h1>
        <p className="max-w-2xl text-base sm:text-lg text-black/80">
          {hero.summary}
        </p>
        <div className="space-y-1 text-sm uppercase tracking-[0.3em] text-black/70">
          <p>
            {hero.contact.phone} · {hero.contact.location}
          </p>
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
            >
              LinkedIn
            </a>{" "}
            ·{" "}
            <a
              href={hero.contact.github}
              className="hover:text-black"
            >
              GitHub
            </a>
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
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

      <section className="space-y-6">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.45em] text-black/55">
            Experience log
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            Selected chapters
          </h2>
        </header>
        <div className="space-y-6">
          {experiences.map((experience) => (
            <article
              key={`${experience.period}-${experience.company}`}
              className="border border-black/25 bg-white/40 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)] transition duration-200 hover:-translate-y-1 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8),0_16px_32px_rgba(0,0,0,0.08)]"
            >
              <p className="text-[0.6rem] uppercase tracking-[0.42em] text-black/60">
                {experience.period}
              </p>
              <h3 className="mt-2 text-xl font-semibold">
                {experience.role} · {experience.company}
              </h3>
              <p className="mt-3 text-sm text-black/75">{experience.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <div
        className="h-px w-full border-t border-black/20 border-dashed"
        aria-hidden="true"
      />

      <section className="grid gap-10 lg:grid-cols-[2fr_1fr]">
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

      <section className="space-y-4">
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
    </div>
  );
}
