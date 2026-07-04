import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const GITIGNORE_PRESETS = {
  macOS: {
    label: "macOS",
    category: "OS",
    keywords: ["macos", "mac", "apple", "ds_store"],
    rules: [".DS_Store", ".AppleDouble", ".LSOverride", "._*"],
  },
  Windows: {
    label: "Windows",
    category: "OS",
    keywords: ["windows", "win", "thumbs"],
    rules: ["Thumbs.db", "ehthumbs.db", "Desktop.ini", "$RECYCLE.BIN/"],
  },
  Linux: {
    label: "Linux",
    category: "OS",
    keywords: ["linux", "unix"],
    rules: ["*~", ".fuse_hidden*", ".directory", ".Trash-*"],
  },
  VisualStudioCode: {
    label: "Visual Studio Code",
    category: "IDE",
    keywords: ["vscode", "visual studio code", "code"],
    rules: [
      ".vscode/*",
      "!.vscode/settings.json",
      "!.vscode/tasks.json",
      "!.vscode/launch.json",
      "!.vscode/extensions.json",
    ],
  },
  JetBrains: {
    label: "JetBrains / IntelliJ",
    category: "IDE",
    keywords: ["jetbrains", "intellij", "idea", "webstorm", "pycharm"],
    rules: [".idea/", "*.iml", "*.iws", "out/"],
  },
  Node: {
    label: "Node.js",
    category: "Language",
    keywords: ["node", "nodejs", "npm", "javascript"],
    rules: [
      "node_modules/",
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*",
      ".env",
      ".env.*",
      "!.env.example",
    ],
  },
  Python: {
    label: "Python",
    category: "Language",
    keywords: ["python", "py", "pip", "venv"],
    rules: [
      "__pycache__/",
      "*.py[cod]",
      "*$py.class",
      "venv/",
      ".venv/",
      "env/",
      ".env",
      "*.egg-info/",
    ],
  },
  Go: {
    label: "Go",
    category: "Language",
    keywords: ["go", "golang"],
    rules: ["*.exe", "*.exe~", "*.test", "*.out", "vendor/"],
  },
  Rust: {
    label: "Rust",
    category: "Language",
    keywords: ["rust", "cargo"],
    rules: ["target/", "Cargo.lock"],
  },
  Java: {
    label: "Java",
    category: "Language",
    keywords: ["java", "gradle", "maven"],
    rules: ["*.class", "*.jar", "*.war", "*.ear", "target/", "build/", ".gradle/"],
  },
};

const mergeGitignore = (selectedKeys) => {
  if (selectedKeys.length === 0) return "";

  const seen = new Set();
  const blocks = [];

  for (const key of selectedKeys) {
    const preset = GITIGNORE_PRESETS[key];
    if (!preset) continue;

    const uniqueRules = preset.rules.filter((rule) => {
      const normalized = rule.trim();
      if (!normalized || seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });

    if (uniqueRules.length === 0) continue;

    blocks.push(
      `# Created by DevTasks - Header: ${preset.label}\n${uniqueRules.join("\n")}`,
    );
  }

  return blocks.length ? `${blocks.join("\n\n")}\n` : "";
};

export default function GitignoreGenerator() {
  const { dark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState([]);

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      card: "bg-white border-zinc-250/90 shadow-sm",
      headerBorder: "border-zinc-200",
      input: "bg-white border-zinc-250 text-zinc-900 focus:border-zinc-900 placeholder-zinc-400 focus:bg-white",
      buttonPrimary: "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]",
      buttonSecondary: "bg-white border-zinc-250 text-zinc-700 hover:bg-zinc-50 active:scale-[0.98]",
      label: "text-zinc-500",
      outputPre: "bg-[#F9FAFB] border-zinc-200 text-emerald-700",
      tag: "bg-zinc-100 border-zinc-200 text-zinc-800",
      suggestion: "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50",
      suggestionMeta: "text-zinc-400",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      card: "bg-zinc-900/50 border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.4)]",
      headerBorder: "border-zinc-800/85",
      input: "bg-zinc-950/60 border-zinc-800 text-white focus:border-zinc-500 placeholder-zinc-600 focus:bg-zinc-950",
      buttonPrimary: "bg-white text-zinc-950 hover:bg-zinc-100 active:scale-[0.98]",
      buttonSecondary: "bg-zinc-900 border-zinc-800/80 text-zinc-300 hover:bg-zinc-850 active:scale-[0.98]",
      label: "text-zinc-400",
      outputPre: "bg-zinc-950/80 border-zinc-800/80 text-emerald-400",
      tag: "bg-zinc-800 border-zinc-700 text-zinc-100",
      suggestion: "bg-zinc-950 border-zinc-800 text-zinc-200 hover:bg-zinc-900",
      suggestionMeta: "text-zinc-500",
    },
  };
  const t = dark ? theme.dark : theme.light;

  const output = useMemo(() => mergeGitignore(selected), [selected]);

  const filteredPresets = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return Object.entries(GITIGNORE_PRESETS).filter(([key, preset]) => {
      if (selected.includes(key)) return false;
      if (!q) return true;
      return (
        preset.label.toLowerCase().includes(q) ||
        preset.category.toLowerCase().includes(q) ||
        key.toLowerCase().includes(q) ||
        preset.keywords.some((keyword) => keyword.includes(q))
      );
    });
  }, [searchQuery, selected]);

  const addPreset = (key) => {
    setSelected((prev) => (prev.includes(key) ? prev : [...prev, key]));
    setSearchQuery("");
  };

  const removePreset = (key) => {
    setSelected((prev) => prev.filter((item) => item !== key));
  };

  const clearAll = () => {
    setSelected([]);
    setSearchQuery("");
  };

  const handleCopy = async () => {
    if (!output.trim()) {
      toast.error("Select at least one environment first");
      return;
    }
    await navigator.clipboard.writeText(output);
    toast.success(".gitignore copied!");
  };

  const handleDownload = () => {
    if (!output.trim()) {
      toast.error("Select at least one environment first");
      return;
    }
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".gitignore";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded .gitignore");
  };

  return (
    <div
      className={`min-h-[calc(100vh-76px)] px-4 py-8 flex items-start justify-center transition-colors duration-300 ${t.wrapper}`}
    >
      <div
        className={`w-full max-w-5xl rounded-3xl border overflow-hidden transition-all duration-300 ${t.card}`}
      >
        <div className={`flex items-center gap-4 p-5 border-b ${t.headerBorder}`}>
          <Link
            to="/devutilities"
            className={`w-10 h-10 border rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-200 ${t.buttonSecondary}`}
            title="Back to Utilities"
          >
            ←
          </Link>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">
              .gitignore Generator
            </h1>
            <p className={`text-xs font-semibold mt-0.5 ${t.label}`}>
              Search and combine OS, IDE, and language presets into one
              .gitignore file — fully offline.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-xs font-black uppercase tracking-[0.2em]">
                Environments
              </h2>
              <button
                type="button"
                onClick={clearAll}
                className={`px-3 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${t.buttonSecondary}`}
              >
                Clear All
              </button>
            </div>

            <div className="relative">
              <svg
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.label}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search environments — e.g. "Node", "macOS", "Python", "VisualStudioCode"'
                className={`w-full pl-9 pr-4 py-3 rounded-xl border text-xs font-bold outline-none transition-all duration-200 ${t.input}`}
              />
            </div>

            {filteredPresets.length > 0 && (
              <div
                className={`border rounded-xl overflow-hidden max-h-[220px] overflow-y-auto custom-scrollbar ${t.suggestion}`}
              >
                {filteredPresets.map(([key, preset]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => addPreset(key)}
                    className={`w-full flex items-center justify-between px-4 py-3 border-b last:border-b-0 text-left transition-colors cursor-pointer ${t.suggestion}`}
                  >
                    <span className="text-xs font-bold">{preset.label}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${t.suggestionMeta}`}>
                      {preset.category}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {searchQuery.trim() && filteredPresets.length === 0 && (
              <p className={`text-xs font-semibold ${t.label}`}>
                No matching environments found.
              </p>
            )}

            <div className="flex flex-col gap-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${t.label}`}>
                Selected Environments
              </label>
              {selected.length === 0 ? (
                <p className={`text-xs font-semibold ${t.label}`}>
                  No environments selected yet. Search above to add some.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selected.map((key) => {
                    const preset = GITIGNORE_PRESETS[key];
                    return (
                      <span
                        key={key}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${t.tag}`}
                      >
                        {preset.label}
                        <button
                          type="button"
                          onClick={() => removePreset(key)}
                          className="opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                          aria-label={`Remove ${preset.label}`}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-xs font-black uppercase tracking-[0.2em]">
                Output
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`px-3 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${t.buttonSecondary}`}
                >
                  Copy
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${t.buttonPrimary}`}
                >
                  Download
                </button>
              </div>
            </div>

            <pre
              className={`rounded-2xl border p-4 font-mono text-xs leading-relaxed overflow-x-auto min-h-[280px] max-h-[480px] overflow-y-auto whitespace-pre-wrap break-words ${t.outputPre}`}
            >
              {output || "# Select one or more environments to generate your .gitignore"}
            </pre>

            <p className={`text-[10px] font-medium ${t.label}`}>
              Generated client-side — no data leaves your browser
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
