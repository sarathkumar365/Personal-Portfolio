import { getProjects } from "@/data/portfolio";

const projects = getProjects();

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
            {project.links.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-3 text-[0.6rem] uppercase tracking-[0.35em]">
                {project.links.map((link) => (
                  <a
                    key={`${project.title}-${link.label}`}
                    href={link.url}
                    className="border border-black px-3 py-2 text-black transition-colors duration-200 hover:bg-black hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
