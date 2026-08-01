import { useTheme } from "../context/ThemeContext";
import { FaGithub, FaGamepad, FaInfoCircle, FaTasks, FaCode, FaBookmark, FaTools } from "react-icons/fa";

const About = () => {
  const { dark } = useTheme();

  return (
    <div
      className={`flex-1 flex flex-col gap-8 p-6 md:p-8 max-w-4xl mx-auto transition-colors duration-300 ${
        dark ? "text-zinc-200" : "text-neutral-800"
      }`}
    >
      {/* Platform Title */}
      <section
        className={`text-center flex flex-col gap-2 py-8 border-b ${
          dark ? "border-zinc-800/80" : "border-neutral-200"
        }`}
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <div
            className={`w-10 h-10 rounded-xl overflow-hidden border flex items-center justify-center ${
              dark ? "border-zinc-700 bg-zinc-900" : "border-neutral-250 bg-neutral-50"
            }`}
          >
            <img src="/devtasks-logo.png" alt="Dev Tasks Logo" className="w-8 h-8 object-cover" />
          </div>
          <h1
            className={`text-3xl font-black tracking-tight uppercase ${
              dark ? "text-white" : "text-black"
            }`}
          >
            ABOUT DEV<span className={`tracking-[0.2em] font-extrabold ml-1 ${dark ? "text-zinc-500" : "text-neutral-400"}`}>TASKS</span>
          </h1>
        </div>
        <p className={`text-sm max-w-xl mx-auto leading-relaxed ${dark ? "text-zinc-400" : "text-neutral-500"}`}>
          DevTasks is a unified offline-first developer cockpit and workspace designed to organize task roadmaps, vault secure snippets, bookmark curated resource links, and run local utilities.
        </p>
      </section>

      {/* Grid of Key Features */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className={`border p-6 rounded-2xl flex gap-4 transition-colors ${
            dark ? "bg-zinc-900/40 border-zinc-850" : "bg-white border-neutral-200"
          }`}
        >
          <FaTasks className="w-6 h-6 text-zinc-400 shrink-0 mt-1" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide mb-2">Task Management</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Create, track, and manage your engineering backlogs and roadmap tasks locally. Includes archive logs and delete history.
            </p>
          </div>
        </div>

        <div
          className={`border p-6 rounded-2xl flex gap-4 transition-colors ${
            dark ? "bg-zinc-900/40 border-zinc-850" : "bg-white border-neutral-200"
          }`}
        >
          <FaCode className="w-6 h-6 text-zinc-400 shrink-0 mt-1" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide mb-2">Snippet Vault</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Securely store and copy your most frequent shell scripts, configurations, and helper functions in a sandbox environment.
            </p>
          </div>
        </div>

        <div
          className={`border p-6 rounded-2xl flex gap-4 transition-colors ${
            dark ? "bg-zinc-900/40 border-zinc-850" : "bg-white border-neutral-200"
          }`}
        >
          <FaBookmark className="w-6 h-6 text-zinc-400 shrink-0 mt-1" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide mb-2">Resource Hub</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Keep a curated log of libraries, documentations, assets, and design tools within arm's reach of your keyboard.
            </p>
          </div>
        </div>

        <div
          className={`border p-6 rounded-2xl flex gap-4 transition-colors ${
            dark ? "bg-zinc-900/40 border-zinc-850" : "bg-white border-neutral-200"
          }`}
        >
          <FaTools className="w-6 h-6 text-zinc-400 shrink-0 mt-1" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide mb-2">Dev Utilities</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Instantly run dozens of client-side dev utilities (JSON formatter, Base64 converter, JWT decoder, QR generator) offline.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Project / Collaboration */}
      <section
        className={`border p-6 rounded-2xl transition-colors ${
          dark ? "bg-zinc-900/40 border-zinc-850" : "bg-white border-neutral-200"
        }`}
      >
        <h3 className="text-sm font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
          <FaGamepad className="w-5 h-5 text-emerald-500" />
          <span>QuickPlay Zone</span>
        </h3>
        <p className={`text-xs leading-relaxed mb-4 ${dark ? "text-zinc-400" : "text-neutral-500"}`}>
          QuickPlay Zone is a minimal browser arcade cockpit built to run retro games instantly. No logins, no bloated downloads, and completely offline-first. Just retro gaming straight in your browser.
        </p>
        <div className="flex gap-4">
          <a
            href="https://quickplay-zone.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold uppercase tracking-wider text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
          >
            <FaGamepad className="w-3.5 h-3.5" />
            <span>Launch Game Zone</span>
          </a>
          <a
            href="https://github.com/shamilahmdt/quickplay-zone"
            target="_blank"
            rel="noopener noreferrer"
            className={`text-xs font-bold uppercase tracking-wider ${
              dark ? "text-zinc-400 hover:text-white" : "text-neutral-500 hover:text-black"
            } transition-colors flex items-center gap-1.5`}
          >
            <FaGithub className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>
        </div>
      </section>

      {/* Contributor guidelines */}
      <section
        className={`border p-6 rounded-2xl transition-colors ${
          dark ? "bg-zinc-900/40 border-zinc-850" : "bg-white border-neutral-200"
        }`}
      >
        <h3 className="text-sm font-bold uppercase tracking-wide mb-4">Privacy & Offline Policy</h3>
        <p className={`text-xs leading-relaxed mb-4 ${dark ? "text-zinc-400" : "text-neutral-500"}`}>
          Your privacy is absolute. DevTasks runs completely in-browser:
        </p>
        <ul className="list-disc list-inside text-xs text-zinc-500 space-y-2 leading-relaxed">
          <li>All task, snippet, and bookmark datasets remain in local storage.</li>
          <li>No telemetry, third-party analytical cookies, or remote tracking.</li>
          <li>All utility processes run locally via Web APIs.</li>
          <li>PWA capabilities enable complete offline usage.</li>
        </ul>
      </section>
    </div>
  );
};

export default About;
