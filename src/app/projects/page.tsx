const projects = [
  {
    title: "Studio Atlas",
    year: "2024",
    stack: "Next.js · tRPC · Postgres",
    description:
      "Design-led platform for creative studios to manage proposals, production schedules, and stakeholder feedback with real-time updates.",
  },
  {
    title: "Ledgerline",
    year: "2023",
    stack: "Remix · GraphQL · Tailwind",
    description:
      "Financial analytics dashboard distilling complex reporting into digestible narratives with exportable insights and alerts.",
  },
  {
    title: "CartaPress",
    year: "2022",
    stack: "Astro · Sanity · Cloudflare",
    description:
      "High-performing content site with editorial workflows, custom MDX components, and edge-rendered localization.",
  },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-16">
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.45em] text-black/55">Projects</p>
        <h1 className="text-3xl font-semibold tracking-tight">Case studies & builds</h1>
        <p className="max-w-2xl text-sm text-black/75">
          A sampling of recent collaborations that blend reliable engineering with crafted
          storytelling. Each project pairs a modern stack with a focus on accessibility,
          performance, and maintainability.
        </p>
      </header>

      <div className="space-y-8">
        {projects.map((project) => (
          <article
            key={project.title}
            className="border border-black/25 bg-white/35 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)] transition duration-200 hover:-translate-y-1 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8),0_20px_36px_rgba(0,0,0,0.08)]"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-2xl font-semibold tracking-tight">{project.title}</h2>
              <span className="text-[0.65rem] uppercase tracking-[0.38em] text-black/55">
                {project.year}
              </span>
            </div>
            <p className="mt-3 text-sm uppercase tracking-[0.3em] text-black/60">
              {project.stack}
            </p>
            <p className="mt-4 text-sm text-black/75">{project.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
