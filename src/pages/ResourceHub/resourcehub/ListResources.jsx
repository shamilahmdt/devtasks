import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { toast } from "sonner";

const sampleResources = [
  {
    id: "sample-1",
    title: "DevTasks",
    category: "SITE",
    description: "DevTasks workspace and main application portal.",
    url: "https://dev-tasks-beta.vercel.app",
  },
  {
    id: "sample-2",
    title: "DevTasks Github",
    category: "GITHUB",
    description: "Official GitHub repository for the DevTasks project.",
    url: "https://github.com/shamilahmdt/devtasks",
  },
  {
    id: "sample-3",
    title: "React Documentation",
    category: "DOCUMENTATION",
    description:
      "Official React docs for learning components, hooks, and modern React patterns.",
    url: "https://react.dev",
  },
  {
    id: "sample-4",
    title: "Tailwind CSS Guide",
    category: "DOCUMENTATION",
    description:
      "A practical guide to building responsive interfaces with Tailwind CSS.",
    url: "https://tailwindcss.com",
  },
];

const DEFAULT_CATEGORIES = [
  "SITE",
  "GITHUB",
  "DOCUMENTATION",
];

const getCategoryIcon = (category) => {
  switch (category) {
    case "SITE":
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
      );
    case "GITHUB":
      return (
        <svg
          className="h-5 w-5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"
          />
        </svg>
      );
    case "FIGMA":
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
      );
    case "API":
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      );
    case "DOCUMENTATION":
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      );
    case "STAGING":
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
          />
        </svg>
      );
    case "LOCALHOST":
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      );
    default:
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      );
  }
};

function ListResources() {
  const { dark } = useTheme();

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      eyebrow: "text-zinc-500",
      subtitle: "text-zinc-600",
      panel: "bg-white border-zinc-200 shadow-sm",
      input:
        "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white",
      chipActive: "border-zinc-900 bg-zinc-900 text-white shadow-sm",
      chip: "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-400 hover:bg-white",
      card: "bg-white border-zinc-200 shadow-sm hover:border-zinc-400 hover:shadow-xl",
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
        "bg-zinc-950/60 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:bg-zinc-950",
      chipActive: "border-white bg-white text-zinc-950 shadow-sm",
      chip: "border-zinc-700 bg-zinc-950/50 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-900",
      card: "bg-zinc-900/60 border-zinc-800 shadow-black/20 hover:border-zinc-600 hover:shadow-black/30",
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

  const [categories] = useState(() => {
    const saved = localStorage.getItem("resource_categories");
    let parsed = saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    parsed = parsed.filter(cat => {
      const u = cat.toUpperCase();
      return u !== "MDN" && u !== "JAVASCRIPT" && u !== "LOCALHOST" && u !== "STAGING" && u !== "FIGMA" && u !== "GENERAL";
    });
    parsed = parsed.filter(cat => cat !== "SITE" && cat !== "GITHUB" && cat !== "DOCUMENTATION");
    parsed = ["SITE", "GITHUB", "DOCUMENTATION", ...parsed];
    localStorage.setItem("resource_categories", JSON.stringify(parsed));
    return parsed;
  });

  const filterTags = ["All", ...categories];

  const [resources, setResources] = useState(() => {
    const stored = localStorage.getItem("dev_resources");
    let loadedResources;
    try {
      loadedResources = stored ? JSON.parse(stored) : sampleResources;
    } catch {
      loadedResources = sampleResources;
    }

    // Clean up any MDN or JAVASCRIPT resources
    loadedResources = loadedResources.filter(
      (r) =>
        r.category?.toUpperCase() !== "MDN" &&
        r.category?.toUpperCase() !== "JAVASCRIPT"
    );

    // Ensure the 4 default resources are at the beginning and clean up old defaults
    const cleaned = loadedResources.filter(r => 
      r.url !== "https://dev-tasks-beta.vercel.app" && 
      r.id !== "sample-1" &&
      r.url !== "https://github.com/shamilahmdt/devtasks" &&
      r.id !== "sample-2" &&
      r.url !== "https://react.dev" &&
      r.id !== "sample-3" &&
      r.url !== "https://tailwindcss.com" &&
      r.id !== "sample-4" &&
      r.url !== "http://localhost:3000" &&
      r.id !== "sample-5" &&
      r.url !== "https://figma.com/file/example" &&
      r.id !== "sample-6"
    );

    const merged = [...sampleResources, ...cleaned];
    localStorage.setItem("dev_resources", JSON.stringify(merged));
    return merged;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");

  const syncStorage = (updated) => {
    localStorage.setItem("dev_resources", JSON.stringify(updated));
  };

  const handleCopy = async (url) => {
    try {
      await navigator.clipboard.writeText(url || "");
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDelete = (id, itemTitle) => {
    const targetItem = resources.find((r) => r.id === id);
    if (!targetItem) return;

    const filtered = resources.filter((r) => r.id !== id);
    setResources(filtered);
    syncStorage(filtered);

    const archivedDeletions = JSON.parse(
      localStorage.getItem("deleted_resources") || "[]",
    );
    const newArchivedItem = {
      ...targetItem,
      deletedAt: new Date().toISOString(),
    };
    localStorage.setItem(
      "deleted_resources",
      JSON.stringify([...archivedDeletions, newArchivedItem]),
    );

    toast.warning(`Removed "${itemTitle}"`, {
      action: {
        label: "Undo",
        onClick: () => {
          const restored = [...filtered, targetItem];
          setResources(restored);
          syncStorage(restored);

          const historicalLogs = JSON.parse(
            localStorage.getItem("deleted_resources") || "[]",
          );
          localStorage.setItem(
            "deleted_resources",
            JSON.stringify(historicalLogs.filter((r) => r.id !== id)),
          );
          toast.success("Restored successfully!");
        },
      },
    });
  };

  const processedResources = resources.filter((res) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      res.title?.toLowerCase().includes(query) ||
      res.category?.toLowerCase().includes(query) ||
      res.description?.toLowerCase().includes(query) ||
      res.url?.toLowerCase().includes(query);

    const matchesTag =
      selectedTag === "All" ||
      res.category?.toLowerCase() === selectedTag.toLowerCase();

    return matchesSearch && matchesTag;
  });

  return (
    <div
      className={`${t.wrapper} min-h-[calc(100vh-76px)] md:h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto overflow-x-hidden md:overflow-hidden relative flex flex-col justify-center font-sans`}
    >
      <title>Curated Developer Resources & Guides | DevTasks</title>
      <meta name="description" content="Browse and manage local server listings, Figma designs, documentation hubs, and staging environments. Keep your workspace references in one place." />

      {/* AMBIENT GLOWS */}
      <div
        className={`absolute top-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-30 transition-colors duration-500 ${
          dark ? "bg-zinc-800" : "bg-neutral-200"
        }`}
      />
      <div
        className={`absolute bottom-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-30 transition-colors duration-500 ${
          dark ? "bg-zinc-900" : "bg-neutral-100"
        }`}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col max-h-full overflow-hidden gap-8">
        {/* Header */}
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/resourcehub"
              className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${
                dark
                  ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                  : "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350"
              }`}
              title="Back to Workspace"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <div>
              <p
                className={`${t.eyebrow} text-xs font-black uppercase tracking-widest`}
              >
                Saved developer references
              </p>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mt-1">
                Resource Hub
              </h1>
            </div>
          </div>
        </header>

        <div className="overflow-y-auto flex-1 min-h-0 pb-6 space-y-6">
          <section className={`${t.panel} rounded-[2rem] border p-4 sm:p-5`}>
            <div className="relative block w-full lg:max-w-xl">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${t.input} w-full rounded-2xl border py-3 pl-12 pr-4 text-sm font-medium outline-none transition-all`}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {filterTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`${
                    selectedTag === tag ? t.chipActive : t.chip
                  } rounded-full border px-4 py-2 text-xs font-black uppercase tracking-widest transition-all`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>

          <main className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {processedResources.length === 0 ? (
              <div className="col-span-full py-12 text-center text-zinc-500">
                No structural references matched your filters.
              </div>
            ) : (
              processedResources.map((resource, index) => (
                <article
                  key={resource.id || index}
                  className={`${t.card} group flex min-h-[280px] flex-col justify-between rounded-[1.75rem] border p-5 transition-all duration-300`}
                >
                  <div>
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <span
                        className={`${t.badge} rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider`}
                      >
                        {resource.category}
                      </span>
                      <span
                        className={`${t.icon} flex h-10 w-10 items-center justify-center rounded-2xl transition-all group-hover:scale-110`}
                      >
                        {getCategoryIcon(resource.category)}
                      </span>
                    </div>

                    <h2
                      className={`${t.heading} text-xl font-black tracking-tight`}
                    >
                      {resource.title}
                    </h2>
                    <p
                      className={`${t.body} mt-3 text-sm font-medium leading-6 line-clamp-3`}
                    >
                      {resource.description}
                    </p>
                  </div>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <a
                      href={resource.url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className={`${t.primaryButton} flex-1 rounded-2xl px-4 py-3 text-center text-sm font-bold transition-all`}
                    >
                      View Resource
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(resource.url)}
                      className={`${t.secondaryButton} flex-1 rounded-2xl border px-4 py-3 text-sm font-bold transition-all`}
                    >
                      Copy URL
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(resource.id || index, resource.title)
                      }
                      className="rounded-2xl border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-3 text-sm font-bold transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default ListResources;
