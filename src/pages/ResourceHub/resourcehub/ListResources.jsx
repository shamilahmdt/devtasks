import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import ThemeToggle from "../../../components/ThemeToggle";

const sampleResources = [
  {
    title: "React Documentation",
    category: "Frontend",
    description:
      "Official React docs for learning components, hooks, and modern React patterns.",
  },
  {
    title: "Tailwind CSS Guide",
    category: "CSS",
    description:
      "A practical guide to building responsive and modern interfaces with Tailwind CSS.",
  },
  {
    title: "JavaScript Info",
    category: "JavaScript",
    description:
      "Beginner-friendly JavaScript tutorials covering fundamentals and advanced concepts.",
  },
  {
    title: "MDN Web Docs",
    category: "Web",
    description:
      "Reliable documentation for HTML, CSS, JavaScript, and browser APIs.",
  },
];

const filterTags = ["All", "Frontend", "Backend", "DSA", "Tools"];

const ListResources = () => {
  const { dark } = useTheme();

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      eyebrow: "text-zinc-500",
      subtitle: "text-zinc-600",
      panel: "bg-white border-zinc-200 shadow-sm",
      input:
        "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-zinc-200/70",
      chipActive: "border-zinc-900 bg-zinc-900 text-white shadow-sm",
      chip:
        "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-400 hover:bg-white",
      card:
        "bg-white border-zinc-200 shadow-sm hover:border-zinc-400 hover:shadow-xl",
      badge: "bg-zinc-100 border-zinc-200 text-zinc-600",
      icon: "bg-zinc-900 text-white",
      heading: "text-zinc-950",
      body: "text-zinc-600",
      primaryButton: "bg-zinc-900 text-white hover:bg-zinc-700",
      secondaryButton:
        "border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50",
      backLink:
        "border-zinc-300 text-zinc-700 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      eyebrow: "text-zinc-400",
      subtitle: "text-zinc-400",
      panel: "bg-zinc-900/60 border-zinc-800 shadow-black/20",
      input:
        "bg-zinc-950/60 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:bg-zinc-950 focus:ring-zinc-800",
      chipActive: "border-white bg-white text-zinc-950 shadow-sm",
      chip:
        "border-zinc-700 bg-zinc-950/50 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-900",
      card:
        "bg-zinc-900/60 border-zinc-800 shadow-black/20 hover:border-zinc-600 hover:shadow-black/30",
      badge: "bg-zinc-950 border-zinc-700 text-zinc-300",
      icon: "bg-white text-zinc-950",
      heading: "text-white",
      body: "text-zinc-400",
      primaryButton: "bg-white text-zinc-950 hover:bg-zinc-200",
      secondaryButton:
        "border-zinc-700 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800",
      backLink:
        "border-zinc-700 text-zinc-200 hover:border-white hover:bg-white hover:text-zinc-950",
    },
  };
  const t = dark ? theme.dark : theme.light;

  return (
    <div
      className={`${t.wrapper} min-h-screen px-4 py-8 font-sans transition-colors duration-300 sm:px-6 lg:px-8`}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p
              className={`${t.eyebrow} mb-3 text-xs font-black uppercase tracking-widest`}
            >
              Saved developer references
            </p>
            <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
              Resource Hub
            </h1>
            <p className={`${t.subtitle} mt-4 text-base font-medium leading-7`}>
              Browse curated documentation, guides, and tools for building better
              projects faster.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <Link
              to="/resourcehub"
              className={`${t.backLink} w-fit rounded-full border px-5 py-2 text-sm font-bold uppercase tracking-widest transition hover:-translate-y-0.5`}
            >
              Back to Workspace
            </Link>
          </div>
        </header>

        <section className={`${t.panel} rounded-[2rem] border p-4 sm:p-5`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative block w-full lg:max-w-xl">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m21 21-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search resources..."
                className={`${t.input} w-full rounded-2xl border py-3 pl-12 pr-4 text-sm font-medium outline-none transition focus:ring-4`}
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {filterTags.map((tag, index) => (
                <button
                  key={tag}
                  type="button"
                  className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-widest transition hover:-translate-y-0.5 ${
                    index === 0 ? t.chipActive : t.chip
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        <main className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {sampleResources.map((resource) => (
            <article
              key={resource.title}
              className={`${t.card} group flex min-h-[280px] flex-col justify-between rounded-[1.75rem] border p-6 transition duration-300 hover:-translate-y-1 hover:scale-[1.01]`}
            >
              <div>
                <div className="mb-5 flex items-center justify-between gap-4">
                  <span
                    className={`${t.badge} rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-widest`}
                  >
                    {resource.category}
                  </span>
                  <span
                    className={`${t.icon} flex h-10 w-10 items-center justify-center rounded-2xl transition group-hover:-rotate-6 group-hover:scale-105`}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.5 6H18m0 0v4.5M18 6l-7.5 7.5M6 8.25v9A1.75 1.75 0 0 0 7.75 19h8.5A1.75 1.75 0 0 0 18 17.25V15"
                      />
                    </svg>
                  </span>
                </div>

                <h2 className={`${t.heading} text-xl font-black tracking-tight`}>
                  {resource.title}
                </h2>
                <p className={`${t.body} mt-3 text-sm font-medium leading-6`}>
                  {resource.description}
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className={`${t.primaryButton} rounded-2xl px-4 py-3 text-sm font-bold transition hover:-translate-y-0.5`}
                >
                  View Resource
                </button>
                <button
                  type="button"
                  className={`${t.secondaryButton} rounded-2xl border px-4 py-3 text-sm font-bold transition hover:-translate-y-0.5`}
                >
                  Save
                </button>
              </div>
            </article>
          ))}
        </main>
      </div>
    </div>
  );
};

export default ListResources;
