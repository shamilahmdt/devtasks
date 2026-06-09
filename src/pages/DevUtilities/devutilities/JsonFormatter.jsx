import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import ThemeToggle from "../../../components/ThemeToggle";

const formatCategories = ["Format", "Minify", "Clear"]; 

const JsonFormatter = () => {
  const { dark } = useTheme();
  return (
    <div
      className={`min-h-screen px-4 sm:px-6 py-8 flex items-center justify-center transition-colors duration-300 overflow-hidden relative ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <div
        className={`absolute top-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-30 transition-colors duration-500 ${
          dark ? "bg-zinc-800" : "bg-neutral-200"
        }`}
      />
      <div
        className={`absolute bottom-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-30 transition-colors duration-500 ${
          dark ? "bg-zinc-900" : "bg-neutral-100"
        }`}
      />

      <div
        className={`relative z-10 w-[85%] max-w-none rounded-[32px] border shadow-2xl overflow-hidden transition-all duration-300 ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        <div
          className={`h-2 w-full transition-colors duration-500 ${
            dark ? "bg-white" : "bg-black"
          }`}
        />

        <div className="flex items-start justify-between px-6 sm:px-10 pt-8 sm:pt-10 gap-4">
          <div>
            <h1
              className={`text-2xl sm:text-3xl font-black uppercase tracking-tight transition-colors duration-300 ${
                dark ? "text-white" : "text-black"
              }`}
            >
              JSON Formatter
            </h1>
          </div>
          <ThemeToggle />
        </div>

        <div className="w-full md:h-[464px] p-6 sm:p-10">
          <div className="w-full h-full flex flex-col md:flex-row gap-4"> 
            <div className="group w-full flex flex-col space-y-2">
              <label
                className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                  dark
                    ? "text-zinc-400 group-focus-within:text-white"
                    : "text-neutral-500 group-focus-within:text-black"
                }`}
              >
                Input
              </label>
              <textarea
                placeholder='{"title":"devtask"}'
                className={`md:h-full h-40 px-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 resize-none ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                    : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                }`}
              />
              <div className="grid grid-cols-1 grid-cols-3 gap-3">
                {formatCategories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`w-full px-4 py-2 rounded-xl border font-bold text-sm text-center transition-all duration-300 active:scale-95 ${
                      dark
                        ? "border-white text-white hover:bg-white hover:text-black"
                        : "border-black text-black hover:bg-black hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="group w-full flex flex-col space-y-2">
              <label
                className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                  dark
                    ? "text-zinc-400 group-focus-within:text-white"
                    : "text-neutral-500 group-focus-within:text-black"
                }`}
              >
                Output
              </label>
              <textarea
                readOnly
                className={`md:h-full h-40 px-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 resize-none ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                    : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                }`}
              />
              <div className={"flex justify-end"}>
                <button
                  type="button"
                  className={`w-40 px-4 py-2 rounded-xl border font-bold text-sm text-center transition-all duration-300 active:scale-95
                    ${dark
                      ? "border-white text-white hover:bg-white hover:text-black"
                      : "border-black text-black hover:bg-black hover:text-white"
                  }`}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-10 pb-8 flex items-center border-t border-neutral-100 dark:border-zinc-800 pt-6">
          <Link
            to="/devutilities"
            className={`inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-300 ${
              dark
                ? "text-neutral-400 hover:text-white"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            <span>&larr;</span>
            <span>Back to Workspace</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JsonFormatter;
