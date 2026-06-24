import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const DataCenter = () => {
  const { dark } = useTheme();

  const [snippetStats, setSnippetStats] = useState({
    total: 0,
    git: 0,
    docker: 0,
    npm: 0,
    other: 0,
  });

  useEffect(() => {
    const saved = localStorage.getItem("dev_snippets");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSnippetStats({
        total: parsed.length,
        git: parsed.filter((s) => s.category === "GIT").length,
        docker: parsed.filter((s) => s.category === "DOCKER").length,
        npm: parsed.filter((s) => s.category === "NPM").length,
        other: parsed.filter((s) => s.category === "OTHER").length,
      });
    }
  }, []);

  const handleExport = () => {
    const saved = localStorage.getItem("dev_snippets");
    const snippets = saved ? JSON.parse(saved) : [];

    if (snippets.length === 0) {
      toast.error("No snippets to backup.", {
        style: { background: "#000000", color: "#ffffff" },
      });
      return;
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      snippets,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `snippets-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);

    toast.success("Snippet vault backed up successfully!", {
      style: { background: "#000000", color: "#ffffff" },
    });
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);

        if (!parsed.snippets || !Array.isArray(parsed.snippets)) {
          toast.error("Invalid file format — missing snippets database.", {
            style: { background: "#000000", color: "#ffffff" },
          });
          return;
        }

        const isValid = parsed.snippets.every(
          (s) =>
            typeof s.id !== "undefined" &&
            typeof s.title === "string" &&
            (typeof s.code === "string" || typeof s.cmd === "string") &&
            ["GIT", "DOCKER", "NPM", "OTHER"].includes(s.category)
        );

        if (!isValid) {
          toast.error("File validation failed — invalid snippet schema detected.", {
            style: { background: "#000000", color: "#ffffff" },
          });
          return;
        }

        const normalized = parsed.snippets.map((s) =>
          s.code !== undefined ? s : { ...s, code: s.cmd, cmd: undefined }
        );

        localStorage.setItem("dev_snippets", JSON.stringify(normalized));

        setSnippetStats({
          total: normalized.length,
          git: normalized.filter((s) => s.category === "GIT").length,
          docker: normalized.filter((s) => s.category === "DOCKER").length,
          npm: normalized.filter((s) => s.category === "NPM").length,
          other: normalized.filter((s) => s.category === "OTHER").length,
        });

        toast.success(
          `Import completed! Loaded ${normalized.length} snippets.`,
          { style: { background: "#000000", color: "#ffffff" } }
        );
      } catch {
        toast.error(
          "Parsing failed — ensure file is a valid DevTasks JSON backup.",
          { style: { background: "#000000", color: "#ffffff" } }
        );
      }
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div
      className={`min-h-screen w-full px-4 sm:px-6 py-8 flex flex-col md:items-center md:justify-center transition-colors duration-300 relative ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
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

      {/* MAIN GLASS CARD — fix 2: backdrop-blur-xl + translucent bg */}
      <div
        className={`relative z-10 w-full max-w-4xl mx-auto rounded-[32px] border shadow-2xl overflow-hidden backdrop-blur-xl transition-all duration-300 ${
          dark
            ? "bg-zinc-900/80 border-zinc-800"
            : "bg-white/80 border-neutral-200"
        }`}
      >
        {/* TOP ACCENT BAR */}
        <div className={`h-2 w-full ${dark ? "bg-white" : "bg-black"}`} />

        {/* HEADER */}
        <div className="flex flex-col gap-4 px-5 sm:px-8 pt-6 sm:pt-8">
          <Link
            to="/snippetvault"
            className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all duration-300 w-fit ${
              dark
                ? "text-neutral-400 hover:text-white"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            <span>← Back to Workspace</span>
          </Link>
          <div>
            <h1
              className={`text-2xl sm:text-4xl font-black uppercase tracking-tight ${
                dark ? "text-white" : "text-black"
              }`}
            >
              Data Center
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 mt-2">
              Backup & restore your snippet vault
            </p>
          </div>
        </div>

        {/* VAULT INVENTORY STATS */}
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
                Vault Inventory
              </div>
              <div
                className={`text-base font-black uppercase mt-0.5 ${
                  dark ? "text-white" : "text-black"
                }`}
              >
                {snippetStats.total} snippets ready
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-wider">
              {[
                { label: "Git", value: snippetStats.git },
                { label: "Docker", value: snippetStats.docker },
                { label: "NPM", value: snippetStats.npm },
                { label: "Other", value: snippetStats.other },
              ].map(({ label, value }) => (
                <span
                  key={label}
                  className={`px-2 py-1 rounded-lg ${
                    dark
                      ? "bg-zinc-800 text-zinc-300"
                      : "bg-white border border-gray-200 text-gray-700"
                  }`}
                >
                  {value} {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* DUAL CARD GRID */}
        <div className="px-5 sm:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* EXPORT CARD */}
            <div
              className={`p-6 rounded-[24px] border flex flex-col justify-between h-[210px] transition-all duration-300 ${
                dark
                  ? "bg-zinc-800/40 border-zinc-800"
                  : "bg-neutral-50 border-neutral-200"
              }`}
            >
              <div>
                <div className="flex items-center gap-2.5 mb-3">
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
                    Backup Vault
                  </h2>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Export all saved snippets as a single portable JSON backup file.
                </p>
              </div>

              {/* fix 3: type="button" */}
              <button
                type="button"
                onClick={handleExport}
                aria-label="Export snippets as JSON backup"
                className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 cursor-pointer ${
                  dark
                    ? "bg-white text-black hover:bg-neutral-200 border-white"
                    : "bg-black text-white hover:bg-neutral-800 border-black"
                }`}
              >
                Export JSON
              </button>
            </div>

            {/* IMPORT CARD */}
            <div
              className={`p-6 rounded-[24px] border flex flex-col justify-between h-[210px] transition-all duration-300 ${
                dark
                  ? "bg-zinc-800/40 border-zinc-800"
                  : "bg-neutral-50 border-neutral-200"
              }`}
            >
              <div>
                <div className="flex items-center gap-2.5 mb-3">
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
                    Restore Vault
                  </h2>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Upload an exported snippet JSON backup to restore your vault.
                </p>
              </div>

              {/* fix 3: type="button" on label not needed, but input is non-submit by nature */}
              <input
                id="snippet-import"
                type="file"
                accept="application/json"
                onChange={handleImport}
                className="hidden"
                aria-label="Select a JSON backup file to import"
              />
              <label
                htmlFor="snippet-import"
                className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 cursor-pointer text-center block ${
                  dark
                    ? "bg-zinc-800 border-zinc-700 text-white hover:border-white"
                    : "bg-white border-neutral-300 text-black hover:border-black"
                }`}
              >
                Upload Backup
              </label>
            </div>

          </div>
        </div>

        {/* FOOTER NAV */}
        <div className="px-5 sm:px-8 pb-8 flex flex-col sm:flex-row gap-4 justify-end items-center border-t border-neutral-100 dark:border-zinc-800 pt-6">
          <div className="flex gap-4">
            <Link
              to="/snippetvault/list"
              className={`inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                dark
                  ? "text-neutral-400 hover:text-white"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              Snippet List
            </Link>
            <span className={dark ? "text-zinc-700" : "text-neutral-300"}>|</span>
            <Link
              to="/snippetvault/delete-history"
              className={`inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                dark
                  ? "text-neutral-400 hover:text-white"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              Deleted Snippets
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DataCenter;