import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import ThemeToggle from "../../../components/ThemeToggle";

const categories = ["FIGMA", "API", "DOCS", "STAGING"];

const AddResource = () => {
  const { dark } = useTheme();
  const [resourceName, setResourceName] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("FIGMA");

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
              Add New Resource
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Save project links, docs, designs, and staging references
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="p-6 sm:p-10">
          <form className="space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="group flex flex-col space-y-2">
                <label
                  className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                    dark
                      ? "text-zinc-400 group-focus-within:text-white"
                      : "text-neutral-500 group-focus-within:text-black"
                  }`}
                >
                  Resource Name
                </label>
                <input
                  type="text"
                  value={resourceName}
                  onChange={(e) => setResourceName(e.target.value)}
                  placeholder="e.g. Product Design System"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-semibold outline-none transition-all duration-300 ${
                    dark
                      ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                      : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                  }`}
                />
              </div>

              <div className="group flex flex-col space-y-2">
                <label
                  className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                    dark
                      ? "text-zinc-400 group-focus-within:text-white"
                      : "text-neutral-500 group-focus-within:text-black"
                  }`}
                >
                  Resource URL
                </label>
                <input
                  type="url"
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                  placeholder="https://example.com/resource"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-semibold outline-none transition-all duration-300 ${
                    dark
                      ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                      : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                  }`}
                />
              </div>

              <div className="group flex flex-col space-y-2">
                <label
                  className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                    dark
                      ? "text-zinc-400 group-focus-within:text-white"
                      : "text-neutral-500 group-focus-within:text-black"
                  }`}
                >
                  Category Tags
                </label>
                <div className="flex flex-wrap gap-3">
                  {categories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCategory(item)}
                      className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest border transition-all duration-300 ${
                        category === item
                          ? dark
                            ? "bg-white text-black border-white"
                            : "bg-black text-white border-black"
                          : dark
                            ? "bg-zinc-800 border-zinc-700 text-neutral-300 hover:border-white hover:text-white"
                            : "bg-neutral-100 border-neutral-200 text-neutral-600 hover:border-black hover:text-black"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="group flex flex-col space-y-2">
                <label
                  className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                    dark
                      ? "text-zinc-400 group-focus-within:text-white"
                      : "text-neutral-500 group-focus-within:text-black"
                  }`}
                >
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a short note about when to use this resource."
                  rows={5}
                  className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 resize-none ${
                    dark
                      ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                      : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                  }`}
                />
              </div>
            </div>

            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/resourcehub"
                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all duration-300 transform active:scale-95 text-center ${
                  dark
                    ? "bg-zinc-900 border-zinc-700 text-neutral-300 hover:border-white hover:text-white"
                    : "bg-white border-neutral-300 text-neutral-600 hover:border-black hover:text-black"
                }`}
              >
                Cancel
              </Link>
              <button
                type="button"
                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all duration-300 transform active:scale-95 ${
                  dark
                    ? "bg-white border-white text-black hover:bg-neutral-200"
                    : "bg-black border-black text-white hover:bg-neutral-800"
                }`}
              >
                Submit Resource
              </button>
            </div>
          </form>
        </div>

        <div className="px-6 sm:px-10 pb-8 flex items-center border-t border-neutral-100 dark:border-zinc-800 pt-6">
          <Link
            to="/resourcehub"
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

export default AddResource;
