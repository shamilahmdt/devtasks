import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const getStoredResources = () => {
  try {
    const saved = localStorage.getItem("dev_resources");
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const getStats = (resources) => {
  const savedCategories = localStorage.getItem("resource_categories");
  const categories = savedCategories ? JSON.parse(savedCategories) : ["SITE", "GITHUB", "DOCUMENTATION"];

  const counts = categories.reduce(
    (acc, category) => ({
      ...acc,
      [category]: resources.filter((resource) => resource.category === category)
        .length,
    }),
    {}
  );
  const sizeBytes = new Blob([JSON.stringify(resources)]).size;

  return {
    total: resources.length,
    counts,
    estimatedSize:
      sizeBytes < 1024 ? `${sizeBytes} B` : `~${Math.ceil(sizeBytes / 1024)} KB`,
  };
};

const getInitialSnapshot = () => {
  const storedResources = getStoredResources();
  return {
    resources: storedResources,
    stats: getStats(storedResources),
  };
};

const isValidResource = (resource) =>
  resource &&
  typeof resource.id !== "undefined" &&
  typeof resource.title === "string" &&
  resource.title.trim().length > 0 &&
  typeof resource.url === "string" &&
  resource.url.trim().length > 0 &&
  typeof resource.category === "string" &&
  resource.category.trim().length > 0 &&
  typeof resource.createdAt === "string" &&
  resource.createdAt.trim().length > 0;

const getExportableResources = (resources, exportedAt) =>
  resources.map((resource, index) => ({
    ...resource,
    id: resource.id ?? `resource-${index + 1}`,
    title: resource.title ?? "",
    url: resource.url ?? "",
    category: resource.category ?? "GENERAL",
    createdAt: resource.createdAt ?? exportedAt,
  }));

const DataCenter = () => {
  const { dark } = useTheme();
  const fileInputRef = useRef(null);

  const [resources, setResources] = useState(() => getInitialSnapshot().resources);
  const [resourceStats, setResourceStats] = useState(
    () => getInitialSnapshot().stats
  );

  const refreshResources = () => {
    const storedResources = getStoredResources();
    setResources(storedResources);
    setResourceStats(getStats(storedResources));
  };

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === "dev_resources") refreshResources();
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleExport = () => {
    const currentResources = getStoredResources();

    if (currentResources.length === 0) {
      toast.error("No resources to backup.");
      return;
    }

    const exportedAt = new Date().toISOString();
    const exportableResources = getExportableResources(
      currentResources,
      exportedAt
    );

    const exportData = {
      exportedAt,
      resources: exportableResources,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `resources-backup-${Date.now()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${exportableResources.length} resources successfully.`);
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      try {
        const parsed = JSON.parse(readerEvent.target.result);

        if (!parsed.resources || !Array.isArray(parsed.resources)) {
          toast.error("Invalid backup file. Missing resources database.");
          return;
        }

        if (!parsed.resources.every(isValidResource)) {
          toast.error(
            "Validation failed. Each resource needs id, title, url, category, and createdAt."
          );
          return;
        }

        localStorage.setItem("dev_resources", JSON.stringify(parsed.resources));
        setResources(parsed.resources);
        setResourceStats(getStats(parsed.resources));

        toast.success(`Import completed. Restored ${parsed.resources.length} resources.`);
      } catch {
        toast.error("Invalid JSON file. Please upload a valid DevTasks backup.");
      }
    };

    reader.onerror = () => {
      toast.error("Could not read the selected backup file.");
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  const [categories] = useState(() => {
    const saved = localStorage.getItem("resource_categories");
    return saved ? JSON.parse(saved) : ["SITE", "GITHUB", "DOCUMENTATION"];
  });

  const statCards = [
    { label: "Total Resources", value: resourceStats.total },
    ...categories.map((category) => ({
      label: `${category} Resources`,
      value: resourceStats.counts[category] || 0,
    })),
  ];

  return (
    <div
      className={`min-h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-hidden relative flex flex-col justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>Resource Hub Data Center | DevTasks</title>
      <meta
        name="description"
        content="Manage resource backups, restores, and analytics."
      />

      <div
        aria-hidden="true"
        className={`absolute top-[-120px] right-[-120px] w-[280px] sm:w-[420px] h-[280px] sm:h-[420px] rounded-full blur-3xl opacity-40 ${
          dark ? "bg-zinc-800" : "bg-neutral-200"
        }`}
      />
      <div
        aria-hidden="true"
        className={`absolute bottom-[-120px] left-[-120px] w-[280px] sm:w-[420px] h-[280px] sm:h-[420px] rounded-full blur-3xl opacity-40 ${
          dark ? "bg-zinc-900" : "bg-neutral-100"
        }`}
      />

      <div
        className={`relative z-10 w-full max-w-6xl mx-auto rounded-[32px] border shadow-xl flex flex-col max-h-full overflow-hidden backdrop-blur-xl transition-all duration-300 ${
          dark
            ? "bg-zinc-900/80 border-zinc-800"
            : "bg-white/80 border-neutral-200"
        }`}
      >
        <div className={`h-2 w-full ${dark ? "bg-white" : "bg-black"}`} />

        <div className="px-5 sm:px-8 pt-6 sm:pt-8 flex items-center gap-3">
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
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 w-full">
            <div>
              <h1
                className={`text-2xl sm:text-4xl font-black uppercase tracking-tight transition-colors duration-300 ${
                  dark ? "text-white" : "text-black"
                }`}
              >
                Data Center
              </h1>
              <p className="text-sm sm:text-base text-neutral-400 mt-2">
                Manage resource backups, restores, and analytics
              </p>
            </div>
            <div className="text-left md:text-right">
              <div className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                Database Size
              </div>
              <div
                className={`text-sm font-black uppercase mt-1 ${
                  dark ? "text-zinc-200" : "text-neutral-700"
                }`}
              >
                {resourceStats.estimatedSize}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0">
          <section className="px-5 sm:px-8 pt-6">
            <div
              className={`p-4 rounded-2xl border ${
                dark
                  ? "bg-zinc-950/60 border-zinc-800"
                  : "bg-neutral-50 border-neutral-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <div className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                    Resource Statistics
                  </div>
                  <div
                    className={`text-base font-black uppercase mt-0.5 ${
                      dark ? "text-white" : "text-black"
                    }`}
                  >
                    {resourceStats.total} links indexed
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {statCards.map(({ label, value }) => (
                  <div
                    key={label}
                    className={`rounded-xl border p-3 ${
                      dark
                        ? "bg-zinc-900/70 border-zinc-800"
                        : "bg-white border-neutral-200"
                    }`}
                  >
                    <div className="text-[9px] font-black uppercase tracking-widest text-neutral-400 leading-snug">
                      {label}
                    </div>
                    <div
                      className={`text-2xl font-black mt-2 ${
                        dark ? "text-white" : "text-black"
                      }`}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="px-5 sm:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div
                className={`p-6 rounded-[24px] border flex flex-col gap-4 transition-all duration-300 hover:shadow-md ${
                  dark
                    ? "bg-zinc-800/40 border-zinc-800 hover:border-zinc-700"
                    : "bg-neutral-50 border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    aria-hidden="true"
                    className={`p-2.5 rounded-xl ${
                      dark
                        ? "bg-indigo-500/10 text-indigo-400"
                        : "bg-indigo-50 text-indigo-600"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 4v12m0-12L8 8m4-4l4 4"
                      />
                    </svg>
                  </div>
                  <h2
                    className={`font-black text-sm uppercase tracking-wider ${
                      dark ? "text-white" : "text-black"
                    }`}
                  >
                    Backup Center
                  </h2>
                </div>

                <div
                  className={`rounded-xl border p-4 space-y-3 flex-1 ${
                    dark
                      ? "bg-zinc-950/50 border-zinc-700"
                      : "bg-white border-neutral-200"
                  }`}
                >
                  {[
                    { label: "Export Format", value: "JSON" },
                    { label: "Resources", value: String(resources.length) },
                    { label: "Includes", value: "exportedAt + resources" },
                    { label: "Estimated Size", value: resourceStats.estimatedSize },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex justify-between items-center gap-4"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        {label}
                      </span>
                      <span
                        className={`text-[11px] font-black uppercase text-right ${
                          dark ? "text-zinc-200" : "text-neutral-700"
                        }`}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  aria-label="Download resource backup"
                  onClick={handleExport}
                  className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                    dark
                      ? "bg-white text-black hover:bg-neutral-200 border-white"
                      : "bg-black text-white hover:bg-neutral-800 border-black"
                  }`}
                >
                  Export Backup
                </button>
              </div>

              <div
                className={`p-6 rounded-[24px] border flex flex-col gap-4 transition-all duration-300 hover:shadow-md ${
                  dark
                    ? "bg-zinc-800/40 border-zinc-800 hover:border-zinc-700"
                    : "bg-neutral-50 border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    aria-hidden="true"
                    className={`p-2.5 rounded-xl ${
                      dark
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 16V4m0 12l-4-4m4 4l4-4"
                      />
                    </svg>
                  </div>
                  <h2
                    className={`font-black text-sm uppercase tracking-wider ${
                      dark ? "text-white" : "text-black"
                    }`}
                  >
                    Restore Center
                  </h2>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={handleImport}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 min-h-[150px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 px-4 py-8 text-center transition-all duration-300 ${
                    dark
                      ? "border-zinc-700 hover:border-zinc-500 bg-zinc-950/30 hover:bg-zinc-950/50"
                      : "border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50"
                  }`}
                >
                  <span
                    className={`p-3 rounded-xl ${
                      dark
                        ? "bg-zinc-800 text-zinc-400"
                        : "bg-neutral-100 text-neutral-400"
                    }`}
                  >
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                      />
                    </svg>
                  </span>
                  <span>
                    <span
                      className={`block text-xs font-black uppercase tracking-widest ${
                        dark ? "text-zinc-300" : "text-neutral-600"
                      }`}
                    >
                      Select Backup File
                    </span>
                    <span className="block text-[10px] text-neutral-400 mt-1 font-medium">
                      JSON files with a resources array
                    </span>
                  </span>
                </button>

                <div
                  className={`rounded-xl border p-4 ${
                    dark
                      ? "bg-zinc-950/50 border-zinc-700"
                      : "bg-white border-neutral-200"
                  }`}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Restore Information
                  </p>
                  <p
                    className={`text-xs font-medium leading-relaxed mt-2 ${
                      dark ? "text-zinc-300" : "text-neutral-600"
                    }`}
                  >
                    Imports replace the current dev_resources database after
                    validating each resource record.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DataCenter;
