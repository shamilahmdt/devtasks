import { Link, NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import StorageGauge from "./StorageGauge";
import useSidebar from "../hooks/useSidebar";
import useMobileMode from "../hooks/useMobileMode";
import useSidebarSection from "../hooks/useSidebarSection";

const Navbar = () => {
  const { dark } = useTheme();
  const { setIsSidebarOpen } = useSidebar();
  const isMobileMode = useMobileMode();
  const { hasSidebarSection } = useSidebarSection();

  const navItems = [
    { name: "Tasks", path: "/taskmanage" },
    { name: "Snippets", path: "/snippetvault" },
    { name: "Resource Hub", path: "/resourcehub" },
    { name: "Utilities", path: "/devutilities" },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 w-full border-b transition-colors duration-300 backdrop-blur-md ${
        dark
          ? "bg-zinc-950/85 border-zinc-800/80 text-white"
          : "bg-white/85 border-neutral-100 text-black"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className={`w-8 h-8 rounded-lg overflow-hidden border transition-colors flex items-center justify-center ${
                dark
                  ? "border-zinc-700 bg-zinc-900 group-hover:border-white"
                  : "border-neutral-200 bg-neutral-50 group-hover:border-black"
              }`}>
                <img src="/devtasks-logo.png" alt="Dev Tasks Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-black uppercase tracking-widest">
                Dev Tasks
              </span>
            </Link>

            {/* Mobile actions */}
            <div className="flex lg:hidden items-center gap-2">
              <StorageGauge />
              <ThemeToggle />
              {hasSidebarSection && isMobileMode && (
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen((prev) => !prev)}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors duration-300 ${
                    dark
                      ? "border-zinc-700 bg-zinc-900 text-white"
                      : "border-neutral-200 bg-neutral-50 text-black"
                  }`}
                  aria-label="Open sidebar menu"
                >
                  <span className="text-lg font-black leading-none">☰</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center justify-start md:justify-center overflow-x-auto no-scrollbar py-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `text-[10px] sm:text-xs font-black uppercase tracking-widest px-3.5 py-2 rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? dark
                          ? "bg-white text-black border border-white"
                          : "bg-black text-white border border-black"
                        : dark
                          ? "text-zinc-400 hover:text-white bg-zinc-900/40 hover:bg-zinc-800/40 border border-zinc-800/60"
                          : "text-neutral-500 hover:text-black bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/60"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Actions on desktop */}
          <div className="hidden lg:flex items-center gap-4">
            <StorageGauge />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;