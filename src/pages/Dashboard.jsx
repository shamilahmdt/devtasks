import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const Dashboard = () => {
  const { dark } = useTheme();
  
  // --- STATE FOR TASK PROGRESS ---
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, percentage: 0 });

  // --- STATE FOR SNIPPET STATS ---
  const [snippetStats, setSnippetStats] = useState({ total: 0, breakdown: "No active snippets" });

  // --- STATE FOR RESOURCE STATS ---
  const [resourceStats, setResourceStats] = useState({ total: 0, breakdown: "No active resources" });

  // --- LOAD INITIAL DATA ---
  useEffect(() => {
    // Tasks Stats
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      const parsed = JSON.parse(savedTasks);
      const total = parsed.length;
      const completed = parsed.filter((t) => t.completed).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      setTaskStats({ total, completed, percentage });
    }

    // Snippets Stats
    const savedSnippets = localStorage.getItem("dev_snippets");
    if (savedSnippets) {
      const parsed = JSON.parse(savedSnippets);
      const total = parsed.length;
      if (total > 0) {
        const counts = {};
        parsed.forEach((s) => {
          const cat = s.category || "GENERAL";
          counts[cat] = (counts[cat] || 0) + 1;
        });
        const breakdownStr = Object.keys(counts).slice(0, 3).join(" • ");
        setSnippetStats({
          total,
          breakdown: breakdownStr + (Object.keys(counts).length > 3 ? "..." : "")
        });
      } else {
        setSnippetStats({ total: 0, breakdown: "Empty vault directory" });
      }
    }

    // Resources Stats
    const savedResources = localStorage.getItem("dev_resources");
    if (savedResources) {
      try {
        const parsed = JSON.parse(savedResources);
        const total = parsed.length;
        if (total > 0) {
          const counts = {};
          parsed.forEach((r) => {
            const cat = r.category || "GENERAL";
            counts[cat] = (counts[cat] || 0) + 1;
          });
          const breakdownStr = Object.keys(counts).slice(0, 3).join(" • ");
          setResourceStats({
            total,
            breakdown: breakdownStr + (Object.keys(counts).length > 3 ? "..." : "")
          });
        } else {
          setResourceStats({ total: 0, breakdown: "No active resources" });
        }
      } catch (e) {
        console.error(e);
        setResourceStats({ total: 0, breakdown: "No active resources" });
      }
    }
  }, []);

  // --- THEME SETTING ---
  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      cardInteractive: "group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-400 hover:bg-zinc-50/80",
      icon: "bg-black text-white border border-black/10",
      badge: "bg-zinc-100 text-zinc-700 border border-zinc-200/60",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      cardInteractive: "group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700/80 hover:bg-zinc-800/30",
      icon: "bg-white text-black border border-white/10",
      badge: "bg-zinc-800/60 text-zinc-300 border border-zinc-700/60",
    },
  };
  const t = dark ? theme.dark : theme.light;

  return (
    <div
      className={`${t.wrapper} min-h-screen w-full font-sans overflow-y-auto flex flex-col p-4 md:p-8 transition-colors duration-300`}
    >
      <title>Dashboard — DevTasks</title>
      <meta
        name="description"
        content="Integrated engineering cockpit for managing developer roadmap task boards and snippet code registries."
      />

      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto flex flex-col grow justify-between">
        <header className="shrink-0 mb-12 flex flex-col gap-4">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all duration-300 w-fit ${
              dark
                ? "text-neutral-400 hover:text-white"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            <span>← Exit to Site</span>
          </Link>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
              Dashboard
            </h1>
            <p className="text-gray-400 font-medium">
              Manage your engineering command center
            </p>
          </div>
        </header>

        {/* WORKSPACE GRID */}
        <div className="grow  grid gap-6 sm:grid-cols-2 lg:grid-cols-3 py-4 items-stretch w-full">
          
          {/* WORKSPACE 1: TASK MANAGEMENT */}
          <Link
            to="/taskmanage"
            id="taskmanage-workspace-card"
            className={`flex hover:scale-105 transition-all duration-300 flex-col justify-between min-h-[200px] ${t.cardInteractive}`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl transition-colors shadow-sm ${t.icon}`}>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${t.badge}`}>
                  {taskStats.percentage}% Done
                </span>
              </div>
              
              <h2 className="text-lg font-black mb-1.5 uppercase tracking-tight">
                Task Workspace
              </h2>
              <p className="text-xs font-semibold text-zinc-500 leading-relaxed">
                Developer roadmap planners, custom category groups, backup portability, and deletion safety logs.
              </p>
            </div>

            <div className="text-[10px] font-bold text-zinc-400 mt-4 uppercase">
              {taskStats.completed} of {taskStats.total} active tasks completed
            </div>
          </Link>

          {/* WORKSPACE 2: SNIPPET VAULT */}
          <Link
            to="/snippetvault"
            id="snippetvault-workspace-card"
            className={`flex hover:scale-105 transition-all duration-300 flex-col justify-between min-h-[200px] ${t.cardInteractive}`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl transition-colors shadow-sm ${t.icon}`}>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${t.badge}`}>
                  {snippetStats.total} Snippets
                </span>
              </div>
              
              <h2 className="text-lg font-black mb-1.5 uppercase tracking-tight">
                Snippet Workspace
              </h2>
              <p className="text-xs font-semibold text-zinc-500 leading-relaxed">
                Fast search templates, double-click inline script updates, clickable clipboards, and JSON restorations.
              </p>
            </div>

            <div className="text-[9px] font-bold text-zinc-400 mt-4 uppercase truncate">
              Categories: {snippetStats.breakdown}
            </div>
          </Link>

          {/* WORKSPACE 3: RESOURCE HUB */}
          <Link
            to="/resourcehub"
            id="resourcehub-workspace-card"
            className={`flex hover:scale-105 transition-all duration-300 flex-col justify-between min-h-[200px] ${t.cardInteractive}`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl transition-colors shadow-sm ${t.icon}`}>
                  <svg
                    className="w-5 h-5"
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
                </div>
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${t.badge}`}>
                  {resourceStats.total} Links
                </span>
              </div>
              
              <h2 className="text-lg font-black mb-1.5 uppercase tracking-tight">
                Resource Hub
              </h2>
              <p className="text-xs font-semibold text-zinc-500 leading-relaxed">
                Consolidated database of API links, designs, specifications, code wikis, and documentation.
              </p>
            </div>

            <div className="text-[9px] font-bold text-zinc-400 mt-4 uppercase truncate">
              Categories: {resourceStats.breakdown}
            </div>
          </Link>

          {/* WORKSPACE 4: DEV UTILITIES */}
          <Link
            to="/devutilities"
            id="devutilities-workspace-card"
            className={`flex hover:scale-105 transition-all duration-300 flex-col justify-between min-h-[200px] ${t.cardInteractive}`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl transition-colors shadow-sm ${t.icon}`}>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${t.badge}`}>
                  4 Tools
                </span>
              </div>
              
              <h2 className="text-lg font-black mb-1.5 uppercase tracking-tight">
                Dev Utilities
              </h2>
              <p className="text-xs font-semibold text-zinc-500 leading-relaxed">
                Offline formatters, encoders/decoders, validators, token decoders, and difference checkers.
              </p>
            </div>

            <div className="text-[9px] font-bold text-zinc-400 mt-4 uppercase truncate">
              Utilities: REGEXP • JSON • BASE64 • TIMESTAMP
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
