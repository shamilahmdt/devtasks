import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { FaMoon, FaSun, FaInfoCircle } from "react-icons/fa";
import { toast } from "sonner";
import SIDEBAR_SECTIONS from "../config/sidebarSections";

const Home = () => {
  const { dark, toggleTheme } = useTheme();
  const devUtils = SIDEBAR_SECTIONS.find((s) => s.title === "Dev Utilities")?.items || [];

  return (
    <div
      className={`min-h-screen w-full overflow-hidden flex flex-col transition-colors duration-300 ${
        dark ? "bg-zinc-950 text-white" : "bg-[#FDFDFD] text-black"
      }`}
    >
      {/* React 19 Document Metadata Hoisting */}
      <title>
        DevTasks — Developer Workspace: Tasks, Snippets, Resources & DevUtilities
      </title>

      <meta
        name="description"
        content="DevTasks is a unified developer workspace. Manage engineering task roadmaps, vault secure code snippets, reference curated bookmark links, and run offline dev utilities with ease."
      />

      <meta
        name="keywords"
        content="devtasks, dev tasks, dev tasks beta, devtasksbeta, dev-tasks, dev-tasks-beta, dev, tasks, devtask, developer todo workspace, engineer task manager, roadmap builder, bug tracking checklist, code snippet manager, bookmarks manager, dev workflow optimizer"
      />

      {/* Background Blur */}
      <div
        className={`fixed top-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full blur-[120px] opacity-50 -z-10 ${
          dark ? "bg-zinc-800" : "bg-neutral-200"
        }`}
      />

      <div
        className={`fixed bottom-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full blur-[120px] opacity-50 -z-10 ${
          dark ? "bg-zinc-900" : "bg-neutral-100"
        }`}
      />

      {/* Navbar removed */}

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-5 sm:px-8 lg:px-14 py-8 sm:py-10">
        <div className="w-full max-w-md lg:max-w-none lg:w-[85%] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-center">
            {/* LEFT CONTENT */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-5">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs sm:text-sm font-bold uppercase tracking-[0.25em] ${
                    dark
                      ? "border-zinc-700 bg-zinc-900 text-zinc-300"
                      : "border-neutral-200 bg-white text-neutral-500"
                  }`}
                >
                  Productivity • Workflow • Roadmaps
                </div>

                <h1
                  className={`text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-black leading-[0.9] uppercase tracking-tight ${
                    dark ? "text-white" : "text-black"
                  }`}
                >
                  Dev <br />
                  <span
                    className={`${dark ? "text-zinc-500" : "text-neutral-300"}`}
                  >
                    Tasks
                  </span>
                </h1>

                <p
                  className={`max-w-xl mx-auto lg:mx-0 text-base sm:text-lg leading-relaxed font-medium ${
                    dark ? "text-zinc-400" : "text-neutral-500"
                  }`}
                >
                  Streamline your engineering workflow with an integrated developer cockpit.
                  Manage task roadmaps, securely vault code snippets, curate documentation resources,
                  and run offline utility tools in a single unified workspace.
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <button
                    id="get-started-button"
                    className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300 active:scale-[0.98] cursor-pointer ${
                      dark
                        ? "bg-white text-black hover:bg-zinc-200 shadow-[0_20px_60px_rgba(255,255,255,0.15)]"
                        : "bg-black text-white hover:bg-neutral-800 shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
                    }`}
                  >
                    Get Started
                  </button>
                </Link>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <a
                    href="https://github.com/shamilahmdt/devtasks/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial"
                  >
                    <button
                      id="github-button"
                      className={`w-full px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300 active:scale-[0.98] cursor-pointer border flex items-center justify-center gap-2 ${
                        dark
                          ? "bg-zinc-900 border-zinc-800 text-zinc-100 hover:text-white hover:bg-zinc-900/80 hover:border-zinc-700 shadow-md"
                          : "bg-white border-neutral-200 text-neutral-800 hover:text-black hover:bg-neutral-50 hover:border-neutral-300 shadow-sm"
                      }`}
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.164 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                      <span>GitHub</span>
                    </button>
                  </a>
                  <Link
                    to="/about"
                    className={`p-4 rounded-2xl border transition-all duration-300 active:scale-[0.98] cursor-pointer flex items-center justify-center shrink-0 ${
                      dark
                        ? "bg-zinc-900 border-zinc-800 text-zinc-100 hover:text-white hover:bg-zinc-900/80 hover:border-zinc-700 shadow-md"
                        : "bg-white border-neutral-200 text-neutral-800 hover:text-black hover:bg-neutral-50 hover:border-neutral-300 shadow-sm"
                    }`}
                    aria-label="About DevTasks"
                    title="About DevTasks"
                  >
                    <FaInfoCircle className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={toggleTheme}
                    className={`p-4 rounded-2xl border transition-all duration-300 active:scale-[0.98] cursor-pointer flex items-center justify-center shrink-0 ${
                      dark
                        ? "bg-zinc-900 border-zinc-800 text-zinc-100 hover:text-white hover:bg-zinc-900/80 hover:border-zinc-700 shadow-md"
                        : "bg-white border-neutral-200 text-neutral-800 hover:text-black hover:bg-neutral-50 hover:border-neutral-300 shadow-sm"
                    }`}
                    aria-label="Toggle Theme"
                  >
                    {dark ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                {[
                  {
                    value: "Fast",
                    label: "Performance",
                  },
                  {
                    value: "Clean",
                    label: "UI Design",
                  },
                  {
                    value: "Smart",
                    label: "Workflow",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-3xl p-4 sm:p-5 border transition-all duration-300 ${
                      dark
                        ? "bg-zinc-900 border-zinc-800"
                        : "bg-white border-neutral-100"
                    }`}
                  >
                    <h3 className="text-lg sm:text-2xl font-black">
                      {item.value}
                    </h3>

                    <p
                      className={`text-[11px] sm:text-xs uppercase tracking-widest mt-1 ${
                        dark ? "text-zinc-500" : "text-neutral-400"
                      }`}
                    >
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT CONTENT */}
            <div className="hidden lg:block relative w-full">
              <div
                className={`relative rounded-[2rem] border p-5 sm:p-8 shadow-xl transition-colors duration-300 ${
                  dark
                    ? "bg-zinc-900 border-zinc-800"
                    : "bg-white border-neutral-100"
                }`}
              >
                {/* TOP BAR */}
                <div className="flex items-center justify-between mb-8">
                  <div
                    className={`h-3 w-28 rounded-full ${
                      dark ? "bg-zinc-700" : "bg-neutral-200"
                    }`}
                  />

                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        dark ? "bg-zinc-700" : "bg-neutral-200"
                      }`}
                    />

                    <div
                      className={`w-3 h-3 rounded-full ${
                        dark ? "bg-zinc-700" : "bg-neutral-200"
                      }`}
                    />

                    <div
                      className={`w-3 h-3 rounded-full ${
                        dark ? "bg-zinc-700" : "bg-neutral-200"
                      }`}
                    />
                  </div>
                </div>

                {/* CONTENT */}
                <div className="space-y-5">
                  {/* Task Workspace */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${dark ? 'text-zinc-500' : 'text-neutral-400'}`}>
                        Task Workspace
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-black uppercase tracking-wider">
                        Active
                      </span>
                    </div>
                    
                    <div
                      className={`flex items-center gap-3 rounded-xl border p-3 ${
                        dark
                          ? "bg-zinc-800/40 border-zinc-700/50"
                          : "bg-neutral-50 border-neutral-100"
                      }`}
                    >
                      <div className="w-4 h-4 rounded bg-black flex items-center justify-center dark:bg-white text-white dark:text-black shrink-0">
                        <svg
                          className="w-2.5 h-2.5 text-white dark:text-black"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div
                          className={`h-2.5 w-2/3 rounded-full ${
                            dark ? "bg-zinc-600" : "bg-neutral-200"
                          }`}
                        />
                      </div>
                      
                      <span className="text-[8px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-black uppercase">
                        HIGH
                      </span>
                    </div>
                  </div>

                  {/* Snippet Workspace */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${dark ? 'text-zinc-500' : 'text-neutral-400'}`}>
                        Snippet Workspace
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 font-black uppercase tracking-wider">
                        Secure
                      </span>
                    </div>
                    
                    <div
                      className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${
                        dark
                          ? "bg-zinc-800/40 border-zinc-700/50"
                          : "bg-neutral-50 border-neutral-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`p-1.5 rounded-lg shrink-0 ${dark ? "bg-zinc-700 text-zinc-300" : "bg-neutral-100 text-neutral-600"}`}>
                          <svg
                            className="w-3.5 h-3.5"
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
                        
                        <div className="font-mono text-[11px] tracking-wider font-bold truncate">
                          {dark ? (
                            <span className="text-zinc-400">API_KEY = "••••••••"</span>
                          ) : (
                            <span className="text-neutral-500">API_KEY = "••••••••"</span>
                          )}
                        </div>
                      </div>
                      
                      <div
                        className={`p-1.5 rounded-lg border flex items-center justify-center shrink-0 ${
                          dark
                            ? "bg-zinc-900 border-zinc-700 text-zinc-500"
                            : "bg-white border-neutral-200 text-neutral-400"
                        }`}
                        title="Copy snippet (Example only)"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-5 4h5m-5 4h5m-5 4h5"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Resource Hub */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${dark ? 'text-zinc-500' : 'text-neutral-400'}`}>
                        Resource Hub
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-black uppercase tracking-wider">
                        Curated
                      </span>
                    </div>
                    
                    <div
                      className={`flex items-center gap-3 rounded-xl border p-3 ${
                        dark
                          ? "bg-zinc-800/40 border-zinc-700/50"
                          : "bg-neutral-50 border-neutral-100"
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${dark ? "bg-zinc-700 text-zinc-300" : "bg-neutral-100 text-neutral-600"}`}>
                        <svg
                          className="w-3.5 h-3.5"
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

                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-bold truncate ${dark ? 'text-zinc-300' : 'text-neutral-700'}`}>
                          React 19 Docs & Specs
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dev Utilities */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${dark ? 'text-zinc-500' : 'text-neutral-400'}`}>
                        Dev Utilities
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-black uppercase tracking-wider">
                        Offline
                      </span>
                    </div>
                    
                    <div
                      className={`flex items-center gap-3 rounded-xl border p-3 ${
                        dark
                          ? "bg-zinc-800/40 border-zinc-700/50"
                          : "bg-neutral-50 border-neutral-100"
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${dark ? "bg-zinc-700 text-zinc-300" : "bg-neutral-100 text-neutral-600"}`}>
                        <svg
                          className="w-3.5 h-3.5"
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

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${dark ? 'text-zinc-300' : 'text-neutral-700'}`}>
                            JSON Formatter
                          </span>
                          <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-wider">
                            Valid
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div
                  className={`mt-8 pt-6 border-t flex items-center justify-between ${
                    dark ? "border-zinc-800" : "border-neutral-100"
                  }`}
                >
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`w-10 h-10 rounded-full border-2 ${
                          dark
                            ? "bg-zinc-700 border-zinc-900"
                            : "bg-neutral-200 border-white"
                        }`}
                      />
                    ))}
                  </div>

                  <div
                    className={`text-xs font-black uppercase tracking-[0.25em] ${
                      dark ? "text-zinc-500" : "text-neutral-400"
                    }`}
                  >
                    Productivity
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Utilities Directory Section (Invisible to users to preserve UI/UX, fully visible to Google/crawlers/screen-readers for indexing) */}
      <section className="sr-only" aria-label="Dev Utilities Directory">
        <h2>Explore Dev Utilities</h2>
        {devUtils
          .filter((item) => item.path !== "/devutilities")
          .map((item, index) => (
            <Link key={index} to={item.path}>
              {item.label}
            </Link>
          ))}
      </section>

      {/* BACKGROUND TEXT */}
      <div className="fixed bottom-0 right-0 pointer-events-none select-none opacity-[0.03] -z-10">
        <h2
          className={`text-[28vw] font-black leading-none tracking-tighter ${
            dark ? "text-white" : "text-black"
          }`}
        >
          TASK
        </h2>
      </div>
    </div>
  );
};

export default Home;
