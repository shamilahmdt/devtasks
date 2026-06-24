import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const DataCenter = () => {
  const { dark } = useTheme();
  const fileInputRef = useRef(null);

  // --- WORKSPACE INVENTORY STATS ---
  const [taskStats, setTaskStats] = useState({ total: 0, feature: 0, bug: 0, refactor: 0 });

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      const parsed = JSON.parse(savedTasks);
      const total = parsed.length;
      const feature = parsed.filter((t) => t.category === "FEATURE").length;
      const bug = parsed.filter((t) => t.category === "BUG").length;
      const refactor = parsed.filter((t) => t.category === "REFACTOR").length;
      setTaskStats({ total, feature, bug, refactor });
    }
  }, []);

  const handleExport = () => {
    const saved = localStorage.getItem("tasks");
    const tasks = saved ? JSON.parse(saved) : [];

    if (tasks.length === 0) {
      toast.error("No active tasks to backup.", {
        style: { background: "#000000", color: "#ffffff" },
      });
      return;
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      tasks,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devtasks-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Workspace database backed up successfully!", {
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

        if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
          toast.error("Invalid file format — missing tasks database.", {
            style: { background: "#000000", color: "#ffffff" },
          });
          return;
        }

        const isValid = parsed.tasks.every(
          (task) =>
            typeof task.id !== "undefined" &&
            typeof task.text === "string" &&
            ["FEATURE", "BUG", "REFACTOR"].includes(task.category) &&
            ["HIGH", "MEDIUM", "LOW"].includes(task.priority) &&
            typeof task.completed === "boolean"
        );

        if (!isValid) {
          toast.error("File validation failed — invalid task schema detected.", {
            style: { background: "#000000", color: "#ffffff" },
          });
          return;
        }

        localStorage.setItem("tasks", JSON.stringify(parsed.tasks));

        // Update stats
        const total = parsed.tasks.length;
        const feature = parsed.tasks.filter((t) => t.category === "FEATURE").length;
        const bug = parsed.tasks.filter((t) => t.category === "BUG").length;
        const refactor = parsed.tasks.filter((t) => t.category === "REFACTOR").length;
        setTaskStats({ total, feature, bug, refactor });

        toast.success(`Import completed successfully! Loaded ${parsed.tasks.length} tasks.`, {
          style: { background: "#000000", color: "#ffffff" },
        });
      } catch {
        toast.error("Parsing failed — ensure file is a valid DevTasks JSON backup.", {
          style: { background: "#000000", color: "#ffffff" },
        });
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
      <title>Data Center — Portable Backup Registry</title>

      {/* AMBIENT GLOWS */}
      <div
        className={`absolute top-[-120px] right-[-120px] w-[280px] sm:w-[420px] h-[280px] sm:h-[420px] rounded-full blur-3xl opacity-40 ${
          dark ? "bg-zinc-800" : "bg-neutral-200"
        }`}
      />

      <div
        className={`absolute bottom-[-120px] left-[-120px] w-[280px] sm:w-[420px] h-[280px] sm:h-[420px] rounded-full blur-3xl opacity-40 ${
          dark ? "bg-zinc-900" : "bg-neutral-100"
        }`}
      />

      {/* MODERN GLASS CARD CONTAINER */}
      <div
        className={`relative z-10 w-full max-w-4xl mx-auto rounded-[32px] border shadow-2xl overflow-hidden transition-all duration-300 ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        <div className={`h-2 w-full ${dark ? "bg-white" : "bg-black"}`} />

        <div className="flex flex-col gap-4 px-5 sm:px-8 pt-6 sm:pt-8">
          <Link
            to="/taskmanage"
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
              Backup & restore your task roadmaps
            </p>
          </div>
        </div>

        {/* WORKSPACE STATS SUMMARY SECTION */}
        <div className="px-5 sm:px-8 pt-6">
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
              dark ? "bg-zinc-950 border-zinc-850" : "bg-neutral-50 border-neutral-200"
            }`}
          >
            <div>
              <div className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">
                Workspace Inventory
              </div>
              <div className={`text-base font-black uppercase mt-0.5 ${dark ? "text-white" : "text-black"}`}>
                {taskStats.total} active tasks ready
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-wider text-neutral-500">
              <span className={`px-2 py-1 rounded-lg ${dark ? 'bg-zinc-800 text-zinc-300' : 'bg-white border border-gray-200 text-gray-700'}`}>
                {taskStats.feature} Feature
              </span>
              <span className={`px-2 py-1 rounded-lg ${dark ? 'bg-zinc-800 text-zinc-300' : 'bg-white border border-gray-200 text-gray-700'}`}>
                {taskStats.bug} Bug
              </span>
              <span className={`px-2 py-1 rounded-lg ${dark ? 'bg-zinc-800 text-zinc-300' : 'bg-white border border-gray-200 text-gray-700'}`}>
                {taskStats.refactor} Refactor
              </span>
            </div>
          </div>
        </div>

        {/* SYMMETRICAL DUAL CHANNELS GRID */}
        <div className="px-5 sm:px-8 py-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* EXPORT WORKSPACE */}
            <div
              className={`p-6 rounded-[24px] border flex flex-col justify-between h-[210px] transition-all duration-300 ${
                dark ? "bg-zinc-850/40 border-zinc-800" : "bg-neutral-50 border-neutral-250"
              }`}
            >
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className={`p-2.5 rounded-xl ${dark ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 4v12m0-12L8 8m4-4l4 4" />
                    </svg>
                  </div>
                  <h2 className={`font-black text-sm uppercase tracking-wider ${dark ? "text-white" : "text-black"}`}>
                    Backup Board
                  </h2>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Export all active roadmap planner details as a single portable JSON file.
                </p>
              </div>

              <button
                onClick={handleExport}
                className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                  dark ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"
                }`}
              >
                Export JSON
              </button>
            </div>

            {/* IMPORT WORKSPACE */}
            <div
              className={`p-6 rounded-[24px] border flex flex-col justify-between h-[210px] transition-all duration-300 ${
                dark ? "bg-zinc-850/40 border-zinc-800" : "bg-neutral-50 border-neutral-250"
              }`}
            >
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className={`p-2.5 rounded-xl ${dark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 16V4m0 12l-4-4m4 4l4-4" />
                    </svg>
                  </div>
                  <h2 className={`font-black text-sm uppercase tracking-wider ${dark ? "text-white" : "text-black"}`}>
                    Restore Board
                  </h2>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Upload an exported roadmap JSON backup to restore your tasks into the active deck.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current.click()}
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

        {/* FOOTER & NAV NAVIGATION */}
        <div className="px-5 sm:px-8 pb-8 flex flex-col sm:flex-row gap-4 justify-end items-center border-t border-neutral-100 dark:border-zinc-800 pt-6 mt-4">
          <div className="flex gap-4">
            <Link
              to="/taskmanage/list-tasks"
              className={`inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                dark
                  ? "text-neutral-400 hover:text-white"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              <span>Task List</span>
            </Link>
            <span className={dark ? "text-zinc-700" : "text-neutral-300"}>|</span>
            <Link
              to="/taskmanage/delete-history"
              className={`inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                dark
                  ? "text-neutral-400 hover:text-white"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              <span>Deleted Tasks</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataCenter;
