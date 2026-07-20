import { useTheme } from "../context/ThemeContext";
import { FaGithub, FaUser, FaGamepad } from "react-icons/fa";

const Footer = () => {
  const { dark } = useTheme();

  return (
    <footer
      className={`border-t py-5 px-4 sm:px-6 lg:px-8 mt-auto transition-colors duration-300 ${
        dark
          ? "bg-zinc-950/80 border-zinc-700/50 text-zinc-400 backdrop-blur-md"
          : "bg-[#F9FAFB] border-neutral-300 text-neutral-600"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left copyright and status */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div
              className={`text-[10px] font-bold uppercase tracking-wider ${
                dark ? "text-zinc-500" : "text-neutral-450"
              }`}
            >
              &copy; {new Date().getFullYear()} DevTasks. Open Source License.
            </div>
          </div>

          {/* Right Github and Portfolio links */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/shamilahmdt/devtasks"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 ${
                dark ? "text-zinc-400 hover:text-white" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <FaGithub className="w-3.5 h-3.5" />
              <span>Repository</span>
            </a>
            <span className={dark ? "text-zinc-850" : "text-zinc-300"}>|</span>
            <a
              href="https://shamil-ahammed-t.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 ${
                dark ? "text-zinc-400 hover:text-white" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <FaUser className="w-3.5 h-3.5" />
              <span>Portfolio</span>
            </a>
            <span className={dark ? "text-zinc-850" : "text-zinc-300"}>|</span>
            <a
              href="https://quickplay-zone.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 ${
                dark ? "text-zinc-400 hover:text-white" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <FaGamepad className="w-3.5 h-3.5" />
              <span>QuickPlay Zone</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
