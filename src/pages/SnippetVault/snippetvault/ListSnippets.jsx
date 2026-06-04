import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import ThemeToggle from "../../../components/ThemeToggle";

const ListSnippets = () => {
const { dark } = useTheme();

const [searchQuery, setSearchQuery] = useState("");
const [selectedCategory, setSelectedCategory] = useState("ALL");

// TODO: Fetch active snippets from localStorage
const snippets = [
{
id: 1,
title: "Git Push Force",
code: "git push origin HEAD --force-with-lease",
category: "GIT",
},
{
id: 2,
title: "Nuke Node Modules",
code: "rm -rf node_modules package-lock.json && npm i",
category: "NPM",
},
];

const categories = [
"ALL",
...new Set(snippets.map((snippet) => snippet.category)),
];

const filteredSnippets = snippets.filter((snippet) => {
  const title = snippet?.title || "";
  const code = snippet?.code || "";
  const category = snippet?.category || "";

  const matchesSearch =
    title.toLowerCase().includes((searchQuery || "").toLowerCase()) ||
    code.toLowerCase().includes((searchQuery || "").toLowerCase());

  const matchesCategory =
    selectedCategory === "ALL" ||
    category === selectedCategory;

  return matchesSearch && matchesCategory;
});

const handleCopy = async (code) => {
try {
await navigator.clipboard.writeText(code);
} catch (error) {
console.error("Copy failed:", error);
}
};

const handleDelete = (id) => {
// TODO: Implement delete logic
console.log("Delete snippet:", id);
};

return (
<div
className={`min-h-screen overflow-y-auto p-4 sm:p-6 font-sans antialiased transition-colors duration-300 ${
        dark ? "bg-zinc-950" : "bg-[#FDFDFD]"
      }`}
>
<div
className={`max-w-2xl mx-auto rounded-3xl sm:rounded-4xl shadow-lg p-4 sm:p-8 border transition-colors duration-300 ${
          dark
            ? "bg-zinc-900 border-zinc-700"
            : "bg-white border-neutral-100"
        }`}
>
{/* Header */} <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
<h1
className={`text-2xl sm:text-3xl font-black uppercase ${
              dark ? "text-white" : "text-black"
            }`}
>
Snippet Registry </h1>

      <ThemeToggle />
    </div>

    {/* Search */}   
    <input
      type="text"
      placeholder="Search snippets..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className={`w-full mb-4 px-4 py-3 rounded-2xl border-2 outline-none font-black uppercase tracking-widest text-sm transition-all duration-200 ${
        dark
          ? "bg-zinc-800 text-white border-zinc-700 focus:border-white placeholder-zinc-500"
          : "bg-neutral-50 text-black border-neutral-200 focus:border-black placeholder-neutral-400"
      }`}
    />

    {/* Filters */}
    <div className="flex justify-center mb-6">
      <div
        className={`flex flex-wrap justify-center gap-2 p-1 border rounded-3xl ${
          dark
            ? "border-zinc-700 bg-zinc-800"
            : "border-neutral-200 bg-neutral-50"
        }`}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
              selectedCategory === cat
                ? dark
                  ? "bg-white text-black"
                  : "bg-black text-white"
                : dark
                ? "bg-transparent text-neutral-400 hover:text-white border border-transparent hover:border-zinc-600"
                : "bg-transparent text-neutral-400 hover:text-black border border-transparent hover:border-neutral-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>

    {/* Empty State */}
    {filteredSnippets.length === 0 ? (
      <p className="text-center text-neutral-400 font-medium py-8">
        No snippets match your search.
      </p>
    ) : (
      <ul className="space-y-4">
        {filteredSnippets.map((sn) => (
          <li
            key={sn.id}
            className={`flex flex-col gap-4 rounded-2xl p-4 shadow-sm transition-colors duration-200 ${
              dark ? "bg-zinc-800" : "bg-neutral-50"
            }`}
          >
            {/* Title */}
            <div className="flex flex-wrap items-center gap-3">
              <h3
                className={`font-semibold text-base sm:text-lg ${
                  dark ? "text-white" : "text-black"
                }`}
              >
                {sn.title}
              </h3>

              <span
                className={`text-[11px] font-black uppercase px-2 py-1 rounded-full ${
                  dark
                    ? "bg-zinc-700 text-neutral-300"
                    : "bg-neutral-100 text-neutral-700"
                }`}
              >
                {sn.category}
              </span>
            </div>

            {/* Code Block */}
            <pre
              className={`overflow-x-auto rounded-xl p-4 font-mono text-xs ${
                dark
                  ? "bg-zinc-900 text-neutral-200"
                  : "bg-neutral-100 text-neutral-800"
              }`}
            >
              {sn.code}
            </pre>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                onClick={() => handleCopy(sn.code)}
                className={`px-4 py-2 rounded-xl border font-bold text-sm transition-all duration-300 active:scale-95 ${
                  dark
                    ? "border-white text-white hover:bg-white hover:text-black"
                    : "border-black text-black hover:bg-black hover:text-white"
                }`}
              >
                Copy
              </button>

              <Link
                to={`/snippetvault/edit/${sn.id}`}
                className={`px-4 py-2 rounded-xl border font-bold text-sm text-center transition-all duration-300 active:scale-95 ${
                  dark
                    ? "border-white text-white hover:bg-white hover:text-black"
                    : "border-black text-black hover:bg-black hover:text-white"
                }`}
              >
                Edit
              </Link>

              <button
                onClick={() => handleDelete(sn.id)}
                className={`px-4 py-2 rounded-xl transition-all duration-300 font-bold text-sm active:scale-95 ${
                  dark
                    ? "bg-white text-black hover:bg-gray-100"
                    : "bg-black text-white hover:bg-neutral-800"
                }`}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    )}

    {/* Footer */}
    <div className="mt-12 border-t border-neutral-100 dark:border-zinc-800 pt-6">
      <Link
        to="/snippetvault"
        className={`inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-300 ${
          dark
            ? "text-neutral-400 hover:text-white"
            : "text-neutral-500 hover:text-black"
        }`}
      >
        <span>←</span>
        <span>Back to Workspace</span>
      </Link>
    </div>
  </div>
</div>

      

);
};
      

export default ListSnippets;
