import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const ListSnippets = () => {
  const { dark } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const [snippets, setSnippets] = useState(() => {
    try {
      const raw = localStorage.getItem("dev_snippets");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error("Failed to load snippets from localStorage:", err);
      return [];
    }
  });

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
      toast.success("Snippet copied successfully!", {
      style: { background: "#000000", color: "#ffffff" },
    });
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Snippet copy failed.", {
      style: { background: "#000000", color: "#ffffff" },
    });
    }
  };

  const handleDelete = (id) => {
    const snippetToDelete = snippets.find((s) => s.id === id);
    if (!snippetToDelete) return;

    const rawDeleted = localStorage.getItem("deleted_snippets");
    const deletedList = rawDeleted ? JSON.parse(rawDeleted) : [];
    const snippetWithTimestamp = {
      ...snippetToDelete,
      deletedAt: new Date().toISOString(),
    };
    localStorage.setItem(
      "deleted_snippets",
      JSON.stringify([...deletedList, snippetWithTimestamp])
    );

    const updated = snippets.filter((s) => s.id !== id);
    setSnippets(updated);
    localStorage.setItem("dev_snippets", JSON.stringify(updated));

    toast.warning("Snippet removed from vault.", {
      style: { background: "#000000", color: "#ffffff" },
      action: {
        label: "Undo",
        onClick: () => {
          const current = JSON.parse(localStorage.getItem("dev_snippets") || "[]");
          const currentDeleted = JSON.parse(localStorage.getItem("deleted_snippets") || "[]");
          localStorage.setItem(
            "dev_snippets",
            JSON.stringify([...current, snippetToDelete])
          );
          localStorage.setItem(
            "deleted_snippets",
            JSON.stringify(currentDeleted.filter((s) => s.id !== id))
          );
          setSnippets((prev) => [...prev, snippetToDelete]);
          toast.success("Snippet restored.", {
            style: { background: "#000000", color: "#ffffff" },
          });
        },
      },
      duration: 4000,
    });

    setTimeout(() => {
      toast.info("View in delete history to restore later.", {
        style: { background: "#000000", color: "#ffffff" },
        action: {
          label: "View Logs",
          onClick: () => navigate("/snippetvault/delete-history"),
        },
        actionButtonStyle: {
          border: "1px solid #ffffff",
          borderRadius: "8px",
          backgroundColor: "transparent",
          color: "#ffffff",
          padding: "6px 16px",
          cursor: "pointer",
        },
        duration: 5000,
      });
    }, 4100);
  };

  return (
    <div
      className={`min-h-[calc(100vh-76px)] md:h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto overflow-x-hidden md:overflow-hidden relative flex flex-col justify-center ${
        dark ? "bg-zinc-950" : "bg-[#FDFDFD]"
      }`}
    >
      <title>Secure Code Snippet Registry | DevTasks</title>
      <meta name="description" content="Browse, search, edit, and organize your reusable code templates, docker commands, and shell snippets. Keep your code recipes accessible." />

      {/* AMBIENT GLOWS */}
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
        className={`relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto rounded-[32px] border shadow-xl flex flex-col max-h-full md:max-h-[85vh] overflow-hidden transition-all duration-300 ${
          dark ? "bg-zinc-900 border-zinc-700" : "bg-white border-neutral-100"
        }`}
      >
        <div
          className={`h-2 w-full transition-colors duration-500 ${
            dark ? "bg-white" : "bg-black"
          }`}
        />

        {/* Header */}
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 flex flex-col gap-4">
          <Link
            to="/snippetvault"
            className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all duration-300 w-fit ${
              dark
                ? "text-neutral-400 hover:text-white"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            <span>← Back to Workspace</span>
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1
                className={`text-xl sm:text-2xl font-black uppercase tracking-tight transition-colors duration-300 ${
                  dark ? "text-white" : "text-black"
                }`}
              >
                Snippet Registry
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Browse, search, and manage your saved snippets
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8 overflow-y-auto flex-1 min-h-0">
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
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSnippets.map((sn) => (
                <li
                  key={sn.id}
                  className={`flex flex-col justify-between gap-4 rounded-2xl p-5 shadow-sm transition-all duration-300 border ${
                    dark
                      ? "bg-zinc-800/40 border-zinc-700/50 hover:border-zinc-600 hover:shadow-md"
                      : "bg-neutral-50 border-neutral-200/60 hover:border-neutral-300 hover:shadow-md"
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
                    {sn.code || sn.cmd}
                  </pre>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                    <button
                      onClick={() => handleCopy(sn.code || sn.cmd)}
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
        </div>
      </div>
    </div>



  );
};


export default ListSnippets;
