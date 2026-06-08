import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import ThemeToggle from "../../../components/ThemeToggle";

const DataCenter = () => {
  const { dark } = useTheme();

  const [resourceStats, setResourceStats] = useState({
    total: 0,
    categories: [],
    estimatedSize: "0 KB",
  });

  useEffect(() => {
    const saved = localStorage.getItem("dev_resources");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const total = parsed.length;
        const categoryCounts = {};
        parsed.forEach((r) => {
          const cat = r.category || "GENERAL";
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
        const categories = Object.keys(categoryCounts);
        const sizeBytes = new Blob([saved]).size;
        const estimatedSize =
          sizeBytes < 1024
            ? `${sizeBytes} B`
            : `~${Math.ceil(sizeBytes / 1024)} KB`;
        setResourceStats({ total, categories, estimatedSize });
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const categoryDisplay =
    resourceStats.categories.length > 0
      ? resourceStats.categories.slice(0, 3).join(", ") +
        (resourceStats.categories.length > 3 ? "..." : "")
      : "None";

  return (
    <div
      className={`min-h-screen px-4 sm:px-6 py-8 flex items-center justify-center transition-colors duration-300 overflow-hidden relative ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>Resource Data Center — Resource Hub</title>
      <meta
        name="description"
        content="Backup and restore your resource hub bookmarks and links."
      />

      {/* AMBIENT GLOWS */}
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

      {/* MAIN GLASS CARD */}
      <div
        className={`relative z-10 w-[85%] max-w-none rounded-[32px] border shadow-2xl overflow-hidden backdrop-blur-xl transition-all duration-300 ${
          dark
            ? "bg-zinc-900/80 border-zinc-800"
            : "bg-white/80 border-neutral-200"
        }`}
      >
        {/* TOP ACCENT BAR */}
        <div className={`h-2 w-full ${dark ? "bg-white" : "bg-black"}`} />

        {/* HEADER */}
        <div className="flex items-start justify-between px-5 sm:px-8 pt-6 sm:pt-8 gap-4">
          <div>
            <h1
              className={`text-2xl sm:text-4xl font-black uppercase tracking-tight ${
                dark ? "text-white" : "text-black"
              }`}
            >
              Data Center
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 mt-2">
              Backup & restore your resource hub
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* HUB INVENTORY STATS */}
        <div className="px-5 sm:px-8 pt-6">
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
              dark
                ? "bg-zinc-950/60 border-zinc-800"
                : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <div>
              <div className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                Hub Inventory
              </div>
              <div
                className={`text-base font-black uppercase mt-0.5 ${
                  dark ? "text-white" : "text-black"
                }`}
              >
                {resourceStats.total} links indexed
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-wider">
              {resourceStats.categories.length > 0 ? (
                resourceStats.categories.slice(0, 4).map((cat) => (
                  <span
                    key={cat}
                    className={`px-2 py-1 rounded-lg ${
                      dark
                        ? "bg-zinc-800 text-zinc-300"
                        : "bg-white border border-gray-200 text-gray-700"
                    }`}
                  >
                    {cat}
                  </span>
                ))
              ) : (
                <span
                  className={`px-2 py-1 rounded-lg ${
                    dark
                      ? "bg-zinc-800 text-zinc-500"
                      : "bg-white border border-gray-200 text-gray-400"
                  }`}
                >
                  No categories
                </span>
              )}
            </div>
          </div>
        </div>

        {/* DUAL CARD GRID */}
        <div className="px-5 sm:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* EXPORT CARD */}
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
                  Backup Hub
                </h2>
              </div>

              {/* SAMPLE DATA ROWS */}
              <div
                className={`rounded-xl border p-4 space-y-3 flex-1 ${
                  dark
                    ? "bg-zinc-950/50 border-zinc-700"
                    : "bg-white border-neutral-200"
                }`}
              >
                {[
                  { label: "Total Links", value: String(resourceStats.total) },
                  { label: "Categories", value: categoryDisplay },
                  { label: "Last Backup", value: "Never" },
                  { label: "Estimated Size", value: resourceStats.estimatedSize },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                      {label}
                    </span>
                    <span
                      className={`text-[11px] font-black uppercase ${
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
                aria-label="Download backup"
                className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                  dark
                    ? "bg-white text-black hover:bg-neutral-200 border-white"
                    : "bg-black text-white hover:bg-neutral-800 border-black"
                }`}
              >
                Download Backup
              </button>
            </div>

            {/* IMPORT CARD */}
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
                  Restore Hub
                </h2>
              </div>

              {/* DRAG & DROP AREA */}
              <div
                className={`flex-1 min-h-[150px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 px-4 py-8 transition-all duration-300 ${
                  dark
                    ? "border-zinc-700 hover:border-zinc-500 bg-zinc-950/30 hover:bg-zinc-950/50"
                    : "border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50"
                }`}
              >
                <div
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
                </div>
                <div className="text-center">
                  <p
                    className={`text-xs font-black uppercase tracking-widest ${
                      dark ? "text-zinc-300" : "text-neutral-600"
                    }`}
                  >
                    Drag & Drop Backup File
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-1 font-medium">
                    or click to browse — JSON files only
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Upload backup"
                className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                  dark
                    ? "bg-zinc-800 border-zinc-700 text-white hover:border-white"
                    : "bg-white border-neutral-300 text-black hover:border-black"
                }`}
              >
                Upload Backup
              </button>
            </div>

          </div>
        </div>

        {/* FOOTER NAV */}
        <div className="px-5 sm:px-8 pb-8 flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-neutral-100 dark:border-zinc-800 pt-6">
          <Link
            to="/resourcehub"
            className={`inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-300 ${
              dark
                ? "text-neutral-400 hover:text-white"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            <span>←</span>
            <span>Back to Workspace</span>
          </Link>

          <div className="flex gap-4">
            <Link
              to="/resourcehub/list"
              className={`inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                dark
                  ? "text-neutral-400 hover:text-white"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              Resource List
            </Link>
            <span className={dark ? "text-zinc-700" : "text-neutral-300"}>|</span>
            <Link
              to="/resourcehub/delete-history"
              className={`inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                dark
                  ? "text-neutral-400 hover:text-white"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              Deleted Resources
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataCenter;
