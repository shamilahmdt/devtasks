import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import useSidebar from "../hooks/useSidebar";
import useSidebarSection from "../hooks/useSidebarSection";
import { useEffect } from "react";

const Sidebar = () => {
  const location = useLocation();
  const { dark } = useTheme();
  const {
    isSidebarOpen,
    isMobileMode,
    setIsSidebarOpen,
  } = useSidebar();
  const { activeSection, hasSidebarSection } = useSidebarSection();

  const isItemActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }

    return (
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`)
    );
  };

  const basePanel = dark
    ? "border-zinc-800 bg-zinc-900/95 text-zinc-100 shadow-[2px_0_12px_rgba(0,0,0,0.3)]"
    : "border-zinc-200 bg-zinc-50/95 text-zinc-900 shadow-[2px_0_12px_rgba(0,0,0,0.01)]";

  useEffect(() => {
    if (isMobileMode) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobileMode, setIsSidebarOpen]);

  if (!hasSidebarSection) {
    return null;
  }

  return (
    <>
      {/* Mobile backdrop fades in and out with the drawer. */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm sidebar-motion-mobile lg:hidden ${
          isSidebarOpen && isMobileMode
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer slides, scales, and fades on open and close. */}
      <aside
        className={`fixed left-0 right-0 top-18.5 z-50 max-h-[calc(100vh-74px)] w-full rounded-none border-x-0 border-b shadow-2xl sidebar-motion-mobile lg:hidden ${basePanel} ${
          isSidebarOpen && isMobileMode
            ? "translate-y-0 scale-100 opacity-100 pointer-events-auto blur-0"
            : "-translate-y-6 scale-[0.98] opacity-0 pointer-events-none blur-sm"
        }`}
      >
        <div className="p-4 sm:p-5 flex flex-col gap-4 max-h-[calc(100vh-74px)] overflow-y-auto">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                Workspace Menu
              </div>
              <h2 className="mt-0.5 text-lg font-bold uppercase tracking-tight">
                {activeSection.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
                dark
                  ? "border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700 hover:text-white hover:bg-zinc-800/40"
                  : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-350 hover:text-black hover:bg-zinc-100"
              }`}
              aria-label="Close sidebar menu"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="space-y-2">
            {activeSection.items.map((item) => {
              const isActive = isItemActive(item);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`group relative flex items-start gap-3 rounded-lg border pl-5 pr-4 py-3 transition-all duration-300 ${
                    isActive
                      ? dark
                        ? "border-zinc-700 bg-zinc-800/40 text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                        : "border-zinc-300 bg-zinc-200/60 text-zinc-900 shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
                      : dark
                        ? "border-zinc-800/30 bg-zinc-900/20 text-zinc-400 hover:border-zinc-700/60 hover:bg-zinc-900/40 hover:text-zinc-200"
                        : "border-zinc-200/30 bg-zinc-100/20 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-100/60 hover:text-zinc-800"
                  }`}
                >
                  {isActive && (
                    <span
                      className={`absolute left-0 top-2.5 bottom-2.5 w-[3.5px] rounded-r-md ${
                        dark
                          ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                          : "bg-black"
                      }`}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`text-sm font-bold tracking-tight transition-colors duration-300 ${
                        isActive
                          ? dark
                            ? "text-white"
                            : "text-zinc-900"
                          : dark
                            ? "text-zinc-300 group-hover:text-white"
                            : "text-zinc-700 group-hover:text-zinc-900"
                      }`}>
                        {item.label}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-none transition-all duration-300 ${
                        isActive
                          ? dark
                            ? "bg-white/10 text-white"
                            : "bg-zinc-900/10 text-zinc-900"
                          : "opacity-0 group-hover:opacity-60 text-zinc-400"
                      }`}>
                        {isActive ? "Active" : "Open"}
                      </span>
                    </div>

                    <p
                      className={`mt-1 text-xs leading-relaxed transition-colors duration-300 ${
                        isActive
                          ? dark
                            ? "text-zinc-400"
                            : "text-zinc-500"
                          : dark
                            ? "text-zinc-500/80 group-hover:text-zinc-400"
                            : "text-zinc-400/80 group-hover:text-zinc-500"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Desktop wrapper animates width so the content can reclaim space. */}
      <div
        className={`hidden lg:block relative flex-none sidebar-motion-width overflow-visible ${
          isSidebarOpen ? "lg:w-72 xl:w-80" : "lg:w-0"
        }`}
      >
        {/* Desktop panel slides and fades during collapse/expand. */}
        <aside
          className={`w-full max-w-full lg:w-72 xl:w-80 shrink-0 rounded-none border-y-0 border-l-0 border-r shadow-2xl overflow-hidden sidebar-motion-panel lg:h-full lg:min-h-0 lg:self-stretch ${basePanel} ${
            isSidebarOpen
              ? "translate-x-0 scale-100 opacity-100 pointer-events-auto blur-0"
              : "-translate-x-5 scale-[0.96] opacity-0 pointer-events-none blur-sm"
          }`}
        >
          <div className="p-5 sm:p-6 flex flex-col gap-6 h-full min-h-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                  Workspace Menu
                </div>
                <h2 className="mt-1.5 text-xl font-bold uppercase tracking-tight">
                  {activeSection.title}
                </h2>
                <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
                  {activeSection.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
                  dark
                    ? "border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700 hover:text-white hover:bg-zinc-800/40"
                    : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-300 hover:text-black hover:bg-zinc-100/50"
                }`}
                title="Collapse sidebar"
              >
                <span>Collapse</span>
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
              {activeSection.items.map((item, index) => {
                const isActive = isItemActive(item);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group relative flex items-start gap-3 rounded-lg border pl-5 pr-4 py-3 transition-all duration-300 ${
                      isActive
                        ? dark
                          ? "border-zinc-700 bg-zinc-800/40 text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                          : "border-zinc-300 bg-zinc-200/60 text-zinc-900 shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
                        : dark
                          ? "border-zinc-800/30 bg-zinc-900/20 text-zinc-400 hover:border-zinc-700/60 hover:bg-zinc-900/40 hover:text-zinc-200"
                          : "border-zinc-200/30 bg-zinc-100/20 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-100/60 hover:text-zinc-800"
                    }`}
                  >
                    {isActive && (
                      <span
                        className={`absolute left-0 top-2.5 bottom-2.5 w-[3.5px] rounded-r-md ${
                          dark
                            ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                            : "bg-black"
                        }`}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className={`text-sm font-bold tracking-tight transition-colors duration-300 ${
                          isActive
                            ? dark
                              ? "text-white"
                              : "text-zinc-900"
                            : dark
                              ? "text-zinc-300 group-hover:text-white"
                              : "text-zinc-700 group-hover:text-zinc-900"
                        }`}>
                          {item.label}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-none transition-all duration-300 ${
                          isActive
                            ? dark
                              ? "bg-white/10 text-white"
                              : "bg-zinc-900/10 text-zinc-900"
                            : "opacity-0 group-hover:opacity-60 text-zinc-400"
                        }`}>
                          {isActive ? "Active" : "Open"}
                        </span>
                      </div>

                      <p
                        className={`mt-1 text-xs leading-relaxed transition-colors duration-300 ${
                          isActive
                            ? dark
                              ? "text-zinc-400"
                              : "text-zinc-500"
                            : dark
                              ? "text-zinc-500/80 group-hover:text-zinc-400"
                              : "text-zinc-400/80 group-hover:text-zinc-500"
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Collapsed bubble scales in/out as the desktop trigger. */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className={`absolute left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-lg border shadow-lg transition-all duration-350 cursor-pointer ${
            isSidebarOpen
              ? "pointer-events-none scale-75 opacity-0 blur-sm"
              : "pointer-events-auto scale-100 opacity-100 hover:scale-105 hover:shadow-xl hover:translate-x-0.5"
          } ${
            dark
              ? "border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-650 hover:text-white hover:bg-zinc-850"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-black hover:bg-zinc-50"
          }`}
          aria-label="Expand sidebar"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </>
  );
};

export default Sidebar;