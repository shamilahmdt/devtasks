import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";
const DEFAULT_CATEGORIES = ["GIT", "DOCKER", "NPM", "OTHER"];

const AddSnippet = () => {
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("GIT");

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("snippet_categories");
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });
  const [showAddInput, setShowAddInput] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      const getSnippetById = (id) => {
        const raw = localStorage.getItem("dev_snippets");
        if (!raw) {
          toast.error("Snippet not found.", {
            style: { background: "#000000", color: "#ffffff" },
          });
          setTitle("");
          setCode("");
          setCategory("GIT");
          return;
        }
        const existing = JSON.parse(raw);
        const snippet = existing.find((data) => data.id === id);
        if (!snippet) {
          toast.error("Snippet not found.", {
            style: { background: "#000000", color: "#ffffff" },
          });
          setTitle("");
          setCode("");
          setCategory("GIT");
          return;
        }

        setTitle(snippet.title);
        setCode(snippet.code);
        setCategory(snippet.category);
      };

      getSnippetById(id);
      document.title = "Edit Snippet — DevTasks";
    }
  }, [id, isEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Form Validation
    const trimmedTitle = title.trim();
    const trimmedCode = code.trim();

    if (!trimmedTitle) {
      toast.error("Please fill in all snippet details.");
      return;
    }
    if (!trimmedCode) {
      toast.error("Please fill in all snippet details.");
      return;
    }

    // 2. Build snippet object
    let snippet = {};
    if (isEdit) {
      snippet = {
        title: trimmedTitle,
        code: trimmedCode,
        category,
      };
    } else {
      snippet = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2),
        title: trimmedTitle,
        code: trimmedCode,
        category,
        createdAt: new Date().toISOString()
      };
    }

    // 3. LocalStorage Persistence
    const raw = localStorage.getItem("dev_snippets");
    const existing = raw ? JSON.parse(raw) : [];
    if (isEdit) {
      const updateSnippets = existing.map((existingSnippet) => {
        if (existingSnippet.id === id) {
          return {
            id,
            ...snippet,
            createdAt: existingSnippet.createdAt,
          };
        }
        return existingSnippet;
      });
      localStorage.setItem("dev_snippets", JSON.stringify(updateSnippets));
    } else {
      existing.push(snippet);
      localStorage.setItem("dev_snippets", JSON.stringify(existing));
    }

    // 4. Toast Notification (Success)
    toast.success(isEdit ? "Snippet successfully updated!" : "Snippet successfully secured in vault!");
    // 5. Reset Form
    setTitle("");
    setCode("");
    setCategory(categories[0] || "GIT");

    // 6. Redirect
    navigate("/snippetvault/list");
  };

  const handleAddCategory = () => {
    const normalized = newCategoryInput.trim().toUpperCase();
    if (!normalized) return;
    if (categories.includes(normalized)) {
      toast.error(`"${normalized}" already exists.`);
      return;
    }
    const updated = [...categories, normalized];
    setCategories(updated);
    localStorage.setItem("snippet_categories", JSON.stringify(updated));
    setCategory(normalized);
    setNewCategoryInput("");
    setShowAddInput(false);
    toast.success(`Category "${normalized}" added.`);
  };

  const handleDeleteCategory = (cat) => {
    if (categories.length === 1) {
      toast.error("At least one category is required.");
      return;
    }
    const raw = localStorage.getItem("dev_snippets");
    const snippets = raw ? JSON.parse(raw) : [];
    const inUse = snippets.some((s) => s.category === cat);
    if (inUse) {
      toast.error(`Cannot remove "${cat}" — it's used by existing snippets.`);
      return;
    }
    const updated = categories.filter((c) => c !== cat);
    setCategories(updated);
    localStorage.setItem("snippet_categories", JSON.stringify(updated));
    if (category === cat) {
      setCategory(updated[0] || "GIT");
    }
    toast.success(`Category "${cat}" removed.`);
  };

  // Category Icons & Badges mapping for rich aesthetics
  const categoryConfig = {
    GIT: {
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      darkColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    },
    DOCKER: {
      color: "text-sky-500 bg-sky-500/10 border-sky-500/20",
      darkColor: "text-sky-400 bg-sky-400/10 border-sky-400/20",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    NPM: {
      color: "text-red-500 bg-red-500/10 border-red-500/20",
      darkColor: "text-red-400 bg-red-400/10 border-red-400/20",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      )
    },
    OTHER: {
      color: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20",
      darkColor: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  };

  const catStyle = categoryConfig[category] || categoryConfig.OTHER;
  const currentBadgeClass = dark ? catStyle.darkColor : catStyle.color;

  return (
    <div
      className={`min-h-screen w-full px-4 sm:px-6 py-8 flex flex-col md:items-center md:justify-center transition-colors duration-300 relative ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>Create Snippet — DevTasks</title>
      <meta
        name="description"
        content="Add a new command template, custom configuration, or reusable code block to your snippet vault."
      />

      {/* AMBIENT BACKGROUND GLOWS */}
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

      {/* GLASS CONTAINER */}
      <div
        className={`relative z-10 w-full max-w-7xl mx-auto rounded-[32px] border shadow-2xl overflow-hidden transition-all duration-300 ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        {/* Accent Bar */}
        <div className={`h-2 w-full transition-colors duration-500 ${dark ? "bg-white" : "bg-black"}`} />

        {/* Header */}
        <div className="flex flex-col gap-4 px-6 sm:px-10 pt-8 sm:pt-10">
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
                className={`text-2xl sm:text-3xl font-black uppercase tracking-tight transition-colors duration-300 ${
                  dark ? "text-white" : "text-black"
                }`}
              >
                { isEdit ? "Edit Snippet" : "Add New Snippet" }
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Store a new template block in your developer vault
              </p>
            </div>
          </div>
        </div>

        {/* Form and Preview Layout (Dual-Column grid on larger screens) */}
        <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6 flex flex-col justify-between">
            <div className="space-y-5">

              {/* Title Field */}
              <div className="group flex flex-col space-y-2">
                <label
                  className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                    dark ? "text-zinc-400 group-focus-within:text-white" : "text-neutral-500 group-focus-within:text-black"
                  }`}
                >
                  Snippet Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Git Push Force"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-semibold outline-none transition-all duration-300 ${
                    dark
                      ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                      : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                  }`}
                />
              </div>

              {/* Category pill selector */}
              <div className="flex flex-col space-y-2">
                <label
                  className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                    dark ? "text-zinc-400" : "text-neutral-500"
                  }`}
                >
                  Category
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {categories.map((cat) => (
                    <div key={cat} className="relative flex items-center">
                      <button
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`pl-4 pr-7 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all duration-200 ${
                          category === cat
                            ? dark
                              ? "bg-white text-black border-white"
                              : "bg-black text-white border-black"
                            : dark
                              ? "bg-transparent text-neutral-400 border-zinc-700 hover:border-zinc-500 hover:text-white"
                              : "bg-transparent text-neutral-500 border-neutral-300 hover:border-neutral-400 hover:text-black"
                        }`}
                      >
                        {cat}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        aria-label={`Remove ${cat}`}
                        className={`absolute right-2 text-xs leading-none transition-colors ${
                          category === cat
                            ? dark
                              ? "text-black/50 hover:text-black"
                              : "text-white/50 hover:text-white"
                            : dark
                              ? "text-zinc-600 hover:text-zinc-300"
                              : "text-neutral-400 hover:text-neutral-700"
                        }`}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* Inline add-category control */}
                  {showAddInput ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <input
                        type="text"
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); handleAddCategory(); }
                          if (e.key === "Escape") { setShowAddInput(false); setNewCategoryInput(""); }
                        }}
                        placeholder="NAME"
                        autoFocus
                        className={`w-24 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border outline-none transition-all ${
                          dark
                            ? "bg-zinc-950 border-zinc-600 text-white placeholder-zinc-600 focus:border-white"
                            : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${
                          dark
                            ? "bg-white text-black border-white hover:bg-neutral-200"
                            : "bg-black text-white border-black hover:bg-neutral-800"
                        }`}
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowAddInput(false); setNewCategoryInput(""); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${
                          dark
                            ? "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                            : "border-neutral-300 text-neutral-500 hover:border-neutral-400 hover:text-black"
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddInput(true)}
                      className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-dashed transition-all duration-200 ${
                        dark
                          ? "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
                          : "border-neutral-300 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600"
                      }`}
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>

              {/* Code / Command Editor */}
              <div className="group flex flex-col space-y-2">
                <label
                  className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                    dark ? "text-zinc-400 group-focus-within:text-white" : "text-neutral-500 group-focus-within:text-black"
                  }`}
                >
                  Code / Command Block
                </label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. git push origin HEAD --force-with-lease"
                  rows={5}
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-mono outline-none transition-all duration-300 resize-none ${
                    dark
                      ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                      : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                  }`}
                />
              </div>

            </div>

            {/* Actions: Save Snippet */}
            <div className="pt-6">
              <button
                type="submit"
                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all duration-300 transform active:scale-95 ${
                  dark
                    ? "bg-white border-white text-black hover:bg-neutral-200"
                    : "bg-black border-black text-white hover:bg-neutral-800"
                }`}
              >
                Save Snippet
              </button>
            </div>
          </form>

          {/* Interactive Live Card Preview */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <div className="flex flex-col h-full">
              <span
                className={`text-xs font-black uppercase tracking-widest mb-2 transition-colors ${
                  dark ? "text-zinc-500" : "text-neutral-400"
                }`}
              >
                Live Board Preview
              </span>

              {/* Snippet Card Mock */}
              <div
                className={`p-6 rounded-[24px] border flex flex-col justify-between min-h-[280px] h-full transition-all duration-500 relative overflow-hidden group ${
                  dark ? "bg-zinc-950/40 border-zinc-800" : "bg-neutral-50 border-neutral-250"
                }`}
              >
                {/* Visual grid background pattern */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#808080_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="relative z-10 space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${currentBadgeClass}`}
                    >
                      {catStyle.icon}
                      <span>{category}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-zinc-700" />
                      <div className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-zinc-700" />
                    </div>
                  </div>

                  {/* Title Preview */}
                  <h3
                    className={`text-lg font-black uppercase tracking-tight transition-colors duration-300 break-words ${
                      title.trim()
                        ? dark
                          ? "text-white"
                          : "text-black"
                        : "text-neutral-400 italic"
                    }`}
                  >
                    {title.trim() ? title : "Untitled Snippet"}
                  </h3>

                  {/* Code Block Preview */}
                  <div
                    className={`p-4 rounded-xl border font-mono text-xs overflow-x-auto max-h-[140px] transition-all duration-300 select-all ${
                      dark
                        ? "bg-zinc-900 border-zinc-800 text-zinc-300"
                        : "bg-white border-neutral-200 text-neutral-600"
                    }`}
                  >
                    {code.trim() ? (
                      <pre className="whitespace-pre-wrap break-all">{code}</pre>
                    ) : (
                      <span className="text-neutral-400 italic font-sans">
                        // code preview will appear here...
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer indicators */}
                <div className="relative z-10 pt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-neutral-400 border-t border-neutral-100 dark:border-zinc-800 mt-4">
                  <span>Vault Preview</span>
                  <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 cursor-not-allowed">
                    <span>Copy</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Back Navigation Bar */}
        <div className="px-6 sm:px-10 pb-8 flex justify-end items-center border-t border-neutral-100 dark:border-zinc-800 pt-6">
          <span
            className={`text-[9px] font-bold uppercase tracking-widest ${
              dark ? "text-zinc-700" : "text-neutral-350"
            }`}
          >
            DevTasks v1.0
          </span>
        </div>

      </div>
    </div>
  );
};

export default AddSnippet;
