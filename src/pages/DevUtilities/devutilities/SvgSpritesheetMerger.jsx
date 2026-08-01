import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  FaArrowLeft,
  FaCopy,
  FaDownload,
  FaFileCode,
  FaFileUpload,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";

let uidCounter = 0;
const nextUid = () => `sprite-item-${(uidCounter += 1)}`;

// Turns a filename or arbitrary label into a safe, kebab-case symbol id.
function slugify(str) {
  const slug = str
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "icon";
}

function ensureUniqueId(base, existingIds) {
  if (!existingIds.has(base)) return base;
  let i = 2;
  while (existingIds.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

// Parses raw SVG markup, extracting a viewBox and the inner markup so it
// can be re-wrapped inside a <symbol>.
function parseSvgMarkup(svgText) {
  try {
    const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
    const svgEl = doc.documentElement;
    if (
      !svgEl ||
      svgEl.nodeName.toLowerCase() !== "svg" ||
      doc.querySelector("parsererror")
    ) {
      return null;
    }
    let viewBox = svgEl.getAttribute("viewBox");
    if (!viewBox) {
      const w = parseFloat(svgEl.getAttribute("width")) || 24;
      const h = parseFloat(svgEl.getAttribute("height")) || 24;
      viewBox = `0 0 ${w} ${h}`;
    }
    const inner = svgEl.innerHTML.trim();
    if (!inner) return null;
    return { viewBox, inner, raw: svgText.trim() };
  } catch {
    return null;
  }
}

function buildSpritesheet(icons) {
  const symbols = icons
    .map(
      (icon) =>
        `  <symbol id="${icon.symbolId}" viewBox="${icon.viewBox}">\n    ${icon.inner}\n  </symbol>`
    )
    .join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">\n${symbols}\n</svg>`;
}

export default function SvgSpritesheetMerger() {
  const { dark } = useTheme();
  const fileInputRef = useRef(null);
  const [icons, setIcons] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [pasteValue, setPasteValue] = useState("");
  const [hoveredId, setHoveredId] = useState(null);

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      heading: "text-zinc-900",
      subtext: "text-zinc-500",
      card: "bg-white border-zinc-200/85 shadow-sm",
      input:
        "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none",
      buttonPrimary:
        "bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-sm",
      buttonSecondary:
        "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-colors",
      backLink:
        "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350",
      row: "bg-zinc-50/60 border-zinc-150",
      codeBox: "bg-zinc-900 text-zinc-100 border-zinc-800",
      dropZone: "border-zinc-200 bg-zinc-50/40",
      gridCell: "bg-zinc-50/60 border-zinc-150 hover:border-zinc-300",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      heading: "text-zinc-100",
      subtext: "text-zinc-400",
      card: "bg-zinc-900/50 border-zinc-800/85 backdrop-blur-md shadow-lg",
      input:
        "bg-zinc-950/70 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none",
      buttonPrimary:
        "bg-white text-zinc-950 hover:bg-zinc-200 transition-colors shadow-sm",
      buttonSecondary:
        "bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white transition-colors",
      backLink:
        "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600",
      row: "bg-zinc-950/50 border-zinc-800",
      codeBox: "bg-black/40 text-emerald-400 border-zinc-800/80 font-mono",
      dropZone: "border-zinc-800 bg-zinc-950/30",
      gridCell: "bg-zinc-950/50 border-zinc-800 hover:border-zinc-600",
    },
  };
  const t = dark ? theme.dark : theme.light;

  const addIcon = (label, svgText) => {
    const parsed = parseSvgMarkup(svgText);
    if (!parsed) {
      toast.error(`Couldn't parse "${label}" as valid SVG`);
      return;
    }
    setIcons((prev) => {
      const existingIds = new Set(prev.map((i) => i.symbolId));
      const symbolId = ensureUniqueId(slugify(label), existingIds);
      return [
        ...prev,
        {
          uid: nextUid(),
          name: label,
          symbolId,
          viewBox: parsed.viewBox,
          inner: parsed.inner,
          raw: parsed.raw,
        },
      ];
    });
  };

  const handleFiles = (files) => {
    const svgFiles = Array.from(files).filter(
      (f) => f.type === "image/svg+xml" || f.name.toLowerCase().endsWith(".svg")
    );
    if (svgFiles.length === 0) {
      toast.error("Please choose valid .svg files");
      return;
    }
    svgFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => addIcon(file.name, e.target.result);
      reader.readAsText(file);
    });
    toast.success(`Loading ${svgFiles.length} SVG file(s)...`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const handleAddFromPaste = () => {
    if (!pasteValue.trim()) {
      toast.error("Paste some SVG markup first");
      return;
    }
    addIcon(`icon-${icons.length + 1}`, pasteValue);
    setPasteValue("");
  };

  const renameIcon = (uid, newLabel) => {
    setIcons((prev) => {
      const existingIds = new Set(
        prev.filter((i) => i.uid !== uid).map((i) => i.symbolId)
      );
      return prev.map((icon) =>
        icon.uid === uid
          ? { ...icon, symbolId: ensureUniqueId(slugify(newLabel) || "icon", existingIds) }
          : icon
      );
    });
  };

  const removeIcon = (uid) => {
    setIcons((prev) => prev.filter((icon) => icon.uid !== uid));
  };

  const clearAll = () => {
    setIcons([]);
    toast.success("Cleared all icons");
  };

  const spritesheetXml = useMemo(() => buildSpritesheet(icons), [icons]);

  const copySpritesheet = async () => {
    if (icons.length === 0) return;
    try {
      await navigator.clipboard.writeText(spritesheetXml);
      toast.success("Spritesheet copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const copyUsage = async (symbolId) => {
    const snippet = `<svg>\n  <use href="spritesheet.svg#${symbolId}"></use>\n</svg>`;
    try {
      await navigator.clipboard.writeText(snippet);
      toast.success(`Copied usage for #${symbolId}`);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const downloadSpritesheet = () => {
    if (icons.length === 0) return;
    const blob = new Blob([spritesheetXml], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spritesheet.svg";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded spritesheet.svg");
  };

  const usageSnippet = hoveredId
    ? `<svg>\n  <use href="spritesheet.svg#${hoveredId}"></use>\n</svg>`
    : `<svg>\n  <use href="spritesheet.svg#icon-name"></use>\n</svg>`;

  return (
    <div className={`min-h-screen ${t.wrapper} px-4 sm:px-6 py-6 sm:py-10 transition-colors duration-300`}>
      <title>SVG Spritesheet Merger — DevTasks</title>
      <meta
        name="description"
        content="Merge multiple standalone SVGs into a single optimized <symbol>-based spritesheet, entirely client-side."
      />

      {/* Hidden compiled spritesheet so <use> references resolve in the preview grid */}
      {icons.length > 0 && (
        <div
          aria-hidden="true"
          style={{ display: "none" }}
          dangerouslySetInnerHTML={{ __html: spritesheetXml }}
        />
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <Link
            to="/devutilities"
            className={`p-2 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${t.backLink}`}
            title="Back to Utilities"
          >
            <FaArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className={`text-xl sm:text-2xl font-semibold tracking-tight ${t.heading}`}>
              SVG Spritesheet Merger
            </h1>
            <p className={`mt-0.5 text-xs sm:text-sm ${t.subtext}`}>
              Bundle multiple SVGs into a single &lt;symbol&gt;-based spritesheet. Fully offline.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Left: Upload & Collection */}
          <div className="space-y-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative rounded-3xl border-2 border-dashed ${t.dropZone} p-6 sm:p-8 text-center transition-all duration-200 ${
                isDragging ? "ring-2 ring-indigo-500 scale-[1.01]" : ""
              }`}
            >
              <FaFileUpload className={`mx-auto w-8 h-8 mb-3 ${t.subtext}`} />
              <p className={`text-sm font-semibold ${t.heading}`}>
                Drag & drop .svg files here
              </p>
              <p className={`text-xs mt-1 mb-4 ${t.subtext}`}>or</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${t.buttonPrimary}`}
              >
                Choose files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-3`}>
              <h2 className={`text-lg font-semibold tracking-tight ${t.heading}`}>
                Paste SVG Code
              </h2>
              <textarea
                value={pasteValue}
                onChange={(e) => setPasteValue(e.target.value)}
                placeholder="Paste a raw <svg>...</svg> snippet here..."
                rows={5}
                className={`w-full p-3 rounded-2xl border text-xs font-mono leading-relaxed ${t.input}`}
              />
              <button
                onClick={handleAddFromPaste}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${t.buttonSecondary} border`}
              >
                <FaPlus className="w-3 h-3" /> Add Icon
              </button>
            </div>

            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-3`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-semibold tracking-tight ${t.heading}`}>
                  Collection ({icons.length})
                </h2>
                {icons.length > 0 && (
                  <button
                    onClick={clearAll}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest ${t.buttonSecondary} border`}
                  >
                    Clear all
                  </button>
                )}
              </div>

              {icons.length === 0 ? (
                <p className={`text-xs ${t.subtext}`}>
                  No icons yet — upload files or paste SVG code to get started.
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {icons.map((icon) => (
                    <div
                      key={icon.uid}
                      className={`flex items-center gap-3 p-2.5 rounded-2xl border ${t.row}`}
                    >
                      <div
                        className="w-8 h-8 shrink-0 flex items-center justify-center [&>svg]:w-6 [&>svg]:h-6 [&_*]:fill-current"
                        dangerouslySetInnerHTML={{ __html: icon.raw }}
                      />
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span className={`text-[11px] font-mono shrink-0 ${t.subtext}`}>#</span>
                        <input
                          value={icon.symbolId}
                          onChange={(e) => renameIcon(icon.uid, e.target.value)}
                          className={`w-full min-w-0 px-2 py-1.5 rounded-lg border text-xs font-mono ${t.input}`}
                        />
                      </div>
                      <button
                        onClick={() => removeIcon(icon.uid)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                        title="Remove icon"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Preview & Output */}
          <div className="space-y-6">
            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-4`}>
              <h2 className={`text-lg font-semibold tracking-tight ${t.heading}`}>
                Spritesheet Preview
              </h2>
              {icons.length === 0 ? (
                <p className={`text-xs ${t.subtext}`}>
                  Compiled symbols will appear here as a grid once you add icons.
                </p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {icons.map((icon) => (
                    <button
                      key={icon.uid}
                      onClick={() => copyUsage(icon.symbolId)}
                      onMouseEnter={() => setHoveredId(icon.symbolId)}
                      onMouseLeave={() => setHoveredId(null)}
                      title={`Copy usage for #${icon.symbolId}`}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all duration-150 ${t.gridCell}`}
                    >
                      <svg className="w-7 h-7" viewBox={icon.viewBox}>
                        <use href={`#${icon.symbolId}`} />
                      </svg>
                      <span className={`text-[10px] font-mono truncate w-full text-center ${t.subtext}`}>
                        {icon.symbolId}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <p className={`text-[11px] ${t.subtext}`}>
                Click any symbol to copy its HTML usage snippet.
              </p>
            </div>

            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-3`}>
              <div className="flex items-center gap-2">
                <FaFileCode className={`w-4 h-4 ${t.subtext}`} />
                <h2 className={`text-lg font-semibold tracking-tight ${t.heading}`}>
                  HTML Usage Snippet
                </h2>
              </div>
              <pre className={`p-4 rounded-2xl border text-xs overflow-x-auto whitespace-pre-wrap break-all select-all ${t.codeBox}`}>
                {usageSnippet}
              </pre>
            </div>

            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-3`}>
              <h2 className={`text-lg font-semibold tracking-tight ${t.heading}`}>
                Spritesheet XML
              </h2>
              <pre className={`p-4 rounded-2xl border text-xs overflow-x-auto whitespace-pre-wrap break-all max-h-72 overflow-y-auto select-all ${t.codeBox}`}>
                {icons.length > 0 ? spritesheetXml : "<!-- Add icons to generate the spritesheet -->"}
              </pre>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={copySpritesheet}
                  disabled={icons.length === 0}
                  className={`w-full py-3 px-4 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    icons.length > 0
                      ? t.buttonPrimary
                      : "opacity-40 cursor-not-allowed border border-zinc-200 text-zinc-400 bg-zinc-100 dark:bg-zinc-900 dark:border-zinc-800"
                  }`}
                >
                  <FaCopy /> Copy Spritesheet
                </button>
                <button
                  onClick={downloadSpritesheet}
                  disabled={icons.length === 0}
                  className={`w-full py-3 px-4 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 border ${
                    icons.length > 0
                      ? t.buttonSecondary
                      : "opacity-40 cursor-not-allowed border-zinc-200 text-zinc-400 bg-zinc-100 dark:bg-zinc-900 dark:border-zinc-800"
                  }`}
                >
                  <FaDownload /> Download .svg
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
