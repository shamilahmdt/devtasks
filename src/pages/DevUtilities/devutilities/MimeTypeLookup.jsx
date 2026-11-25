import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { FaArrowLeft, FaCopy, FaSearch } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";

const MIME_ENTRIES = [
  { ext: ".html", mime: "text/html", category: "Text" },
  { ext: ".htm", mime: "text/html", category: "Text" },
  { ext: ".css", mime: "text/css", category: "Text" },
  { ext: ".js", mime: "text/javascript", category: "Text" },
  { ext: ".mjs", mime: "text/javascript", category: "Text" },
  { ext: ".json", mime: "application/json", category: "Data" },
  { ext: ".jsonld", mime: "application/ld+json", category: "Data" },
  { ext: ".xml", mime: "application/xml", category: "Data" },
  { ext: ".txt", mime: "text/plain", category: "Text" },
  { ext: ".csv", mime: "text/csv", category: "Data" },
  { ext: ".md", mime: "text/markdown", category: "Text" },
  { ext: ".svg", mime: "image/svg+xml", category: "Image" },
  { ext: ".png", mime: "image/png", category: "Image" },
  { ext: ".jpg", mime: "image/jpeg", category: "Image" },
  { ext: ".jpeg", mime: "image/jpeg", category: "Image" },
  { ext: ".gif", mime: "image/gif", category: "Image" },
  { ext: ".webp", mime: "image/webp", category: "Image" },
  { ext: ".avif", mime: "image/avif", category: "Image" },
  { ext: ".ico", mime: "image/x-icon", category: "Image" },
  { ext: ".bmp", mime: "image/bmp", category: "Image" },
  { ext: ".mp3", mime: "audio/mpeg", category: "Audio" },
  { ext: ".wav", mime: "audio/wav", category: "Audio" },
  { ext: ".ogg", mime: "audio/ogg", category: "Audio" },
  { ext: ".mp4", mime: "video/mp4", category: "Video" },
  { ext: ".webm", mime: "video/webm", category: "Video" },
  { ext: ".pdf", mime: "application/pdf", category: "Document" },
  { ext: ".zip", mime: "application/zip", category: "Archive" },
  { ext: ".gz", mime: "application/gzip", category: "Archive" },
  { ext: ".tar", mime: "application/x-tar", category: "Archive" },
  { ext: ".7z", mime: "application/x-7z-compressed", category: "Archive" },
  { ext: ".wasm", mime: "application/wasm", category: "Binary" },
  { ext: ".woff", mime: "font/woff", category: "Font" },
  { ext: ".woff2", mime: "font/woff2", category: "Font" },
  { ext: ".ttf", mime: "font/ttf", category: "Font" },
  { ext: ".otf", mime: "font/otf", category: "Font" },
  { ext: ".m2ts", mime: "video/mp2t", category: "Video" },
  { ext: ".tsx", mime: "text/tsx", category: "Text" },
  { ext: ".jsx", mime: "text/jsx", category: "Text" },
  { ext: ".ts", mime: "text/typescript", category: "Text" },
  { ext: ".mts", mime: "text/typescript", category: "Text" },
  { ext: ".cts", mime: "text/typescript", category: "Text" },
  { ext: ".yaml", mime: "application/yaml", category: "Data" },
  { ext: ".yml", mime: "application/yaml", category: "Data" },
  { ext: ".toml", mime: "application/toml", category: "Data" },
  { ext: ".graphql", mime: "application/graphql", category: "Data" },
  { ext: ".map", mime: "application/json", category: "Data" },
  { ext: ".webmanifest", mime: "application/manifest+json", category: "Data" },
  { ext: ".bin", mime: "application/octet-stream", category: "Binary" },
];

const CATEGORIES = ["All", "Text", "Data", "Image", "Audio", "Video", "Font", "Document", "Archive", "Binary"];

const normalizeQuery = (value) =>
  value.trim().toLowerCase().replace(/^\./, "");

export default function MimeTypeLookup() {
  const { dark } = useTheme();
  const [query, setQuery] = useState("png");
  const [category, setCategory] = useState("All");

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      heading: "text-zinc-900",
      subtext: "text-zinc-500",
      card: "bg-white border-zinc-200/85 shadow-sm",
      input:
        "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none",
      secondaryBtn:
        "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50 transition-all duration-200",
      activeBtn: "bg-zinc-900 text-white border-zinc-900",
      backLink:
        "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350",
      codeBox: "bg-zinc-900 text-zinc-100 border-zinc-800",
      row: "border-zinc-100 hover:bg-zinc-50/80",
      chip: "bg-zinc-100 text-zinc-700",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      heading: "text-zinc-100",
      subtext: "text-zinc-500",
      card: "bg-zinc-900/50 border-zinc-800/85 backdrop-blur-md shadow-md",
      input:
        "bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none",
      secondaryBtn:
        "bg-zinc-800/50 text-zinc-300 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-200",
      activeBtn: "bg-white text-zinc-900 border-white",
      backLink:
        "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600",
      codeBox: "bg-black/40 text-emerald-400 border-zinc-800/80 font-mono",
      row: "border-zinc-800/60 hover:bg-zinc-800/30",
      chip: "bg-zinc-800 text-zinc-300",
    },
  };
  const t = dark ? theme.dark : theme.light;

  const results = useMemo(() => {
    const q = normalizeQuery(query);
    return MIME_ENTRIES.filter((entry) => {
      const matchesCategory = category === "All" || entry.category === category;
      if (!matchesCategory) return false;
      if (!q) return true;
      const ext = entry.ext.replace(/^\./, "").toLowerCase();
      return (
        ext.includes(q) ||
        entry.mime.toLowerCase().includes(q) ||
        entry.category.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  const primary = results[0] || null;

  const copyText = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  return (
    <div
      className={`min-h-screen ${t.wrapper} px-4 sm:px-6 py-6 sm:py-10 transition-colors duration-300`}
    >
      <title>MIME Type Lookup — DevTasks</title>
      <meta
        name="description"
        content="Look up MIME types by file extension or Content-Type. Fully offline developer utility."
      />

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <Link
            to="/devutilities"
            className={`p-2 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${t.backLink}`}
            title="Back to Utilities"
          >
            <FaArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1
              className={`text-xl sm:text-2xl font-semibold tracking-tight ${t.heading}`}
            >
              MIME Type Lookup
            </h1>
            <p className={`mt-0.5 text-xs sm:text-sm ${t.subtext}`}>
              Search by extension or MIME type. Copy Content-Type headers
              offline.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-4`}>
            <p
              className={`text-xs uppercase tracking-widest font-medium ${t.subtext}`}
            >
              Search
            </p>
            <div className="relative">
              <FaSearch
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${t.subtext}`}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="png, .json, image/webp, application/..."
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm ${t.input}`}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all duration-200 ${
                    category === item ? t.activeBtn : t.secondaryBtn
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {primary && (
            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-3`}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p
                  className={`text-xs uppercase tracking-widest font-medium ${t.subtext}`}
                >
                  Best Match
                </p>
                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${t.chip}`}
                >
                  {primary.category}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className={`text-xs mb-1.5 ${t.subtext}`}>Extension</p>
                  <pre
                    className={`p-3 rounded-2xl border text-sm overflow-x-auto ${t.codeBox}`}
                  >
                    {primary.ext}
                  </pre>
                </div>
                <div>
                  <p className={`text-xs mb-1.5 ${t.subtext}`}>MIME type</p>
                  <pre
                    className={`p-3 rounded-2xl border text-sm overflow-x-auto ${t.codeBox}`}
                  >
                    {primary.mime}
                  </pre>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => copyText(primary.mime, "MIME type")}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border ${t.secondaryBtn}`}
                >
                  <FaCopy className="w-3 h-3" /> Copy MIME
                </button>
                <button
                  type="button"
                  onClick={() =>
                    copyText(`Content-Type: ${primary.mime}`, "Header")
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border ${t.secondaryBtn}`}
                >
                  <FaCopy className="w-3 h-3" /> Copy Content-Type
                </button>
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      `Content-Type: ${primary.mime}\nContent-Disposition: attachment; filename="file${primary.ext}"`,
                      "Headers"
                    )
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border ${t.secondaryBtn}`}
                >
                  <FaCopy className="w-3 h-3" /> Copy Response Headers
                </button>
              </div>
            </div>
          )}

          <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-3`}>
            <div className="flex items-center justify-between gap-3">
              <p
                className={`text-xs uppercase tracking-widest font-medium ${t.subtext}`}
              >
                Results
              </p>
              <span className={`text-xs ${t.subtext}`}>
                {results.length} match{results.length === 1 ? "" : "es"}
              </span>
            </div>

            {results.length === 0 ? (
              <p className={`text-sm ${t.subtext}`}>
                No MIME types matched that search.
              </p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {results.map((entry) => (
                  <div
                    key={`${entry.ext}-${entry.mime}`}
                    className={`flex items-center justify-between gap-3 py-3 px-2 rounded-xl transition-colors ${t.row}`}
                  >
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${t.heading}`}>
                        {entry.ext}{" "}
                        <span className={`font-normal ${t.subtext}`}>
                          · {entry.category}
                        </span>
                      </p>
                      <p
                        className={`text-xs mt-0.5 font-mono truncate ${t.subtext}`}
                      >
                        {entry.mime}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyText(entry.mime, "MIME type")}
                      className={`shrink-0 p-2 rounded-xl border ${t.secondaryBtn}`}
                      title="Copy MIME type"
                    >
                      <FaCopy className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
