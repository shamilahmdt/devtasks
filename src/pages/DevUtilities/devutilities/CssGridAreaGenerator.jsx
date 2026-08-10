import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { toast } from "sonner";
import { FaArrowLeft, FaCopy, FaTrash, FaEraser } from "react-icons/fa";

// Map common area names to semantic HTML tags; everything else becomes a div.
const SEMANTIC_TAGS = {
  header: "header",
  footer: "footer",
  main: "main",
  nav: "nav",
  aside: "aside",
  sidebar: "aside",
  section: "section",
  article: "article",
};

export default function CssGridAreaGenerator() {
  const { dark } = useTheme();

  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(2);

  const [gapValue, setGapValue] = useState(16);
  const [gapUnit, setGapUnit] = useState("px");

  const [areas, setAreas] = useState([
    { id: 1, name: "header", color: "#6366f1" },
    { id: 2, name: "main", color: "#10b981" },
  ]);
  const [activeAreaId, setActiveAreaId] = useState(1);
  const [newAreaName, setNewAreaName] = useState("");

  const [grid, setGrid] = useState(() =>
    Array.from({ length: 3 }, () => Array.from({ length: 2 }, () => null))
  );

  const [isPainting, setIsPainting] = useState(false);
  const paintValueRef = useRef(null);

  useEffect(() => {
    setGrid((prev) =>
      Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) =>
          prev[r] && prev[r][c] !== undefined ? prev[r][c] : null
        )
      )
    );
  }, [rows, cols]);

  useEffect(() => {
    const stop = () => setIsPainting(false);
    window.addEventListener("mouseup", stop);
    return () => window.removeEventListener("mouseup", stop);
  }, []);

  const addArea = () => {
    const name = newAreaName.trim().toLowerCase().replace(/\s+/g, "-");
    if (!name) {
      toast.error("Enter an area name");
      return;
    }
    if (areas.some((a) => a.name === name)) {
      toast.error("Area name already exists");
      return;
    }
    const id = Date.now();
    const palette = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#0ea5e9", "#a855f7"];
    const color = palette[areas.length % palette.length];
    setAreas([...areas, { id, name, color }]);
    setActiveAreaId(id);
    setNewAreaName("");
    toast.success(`Added area "${name}"`);
  };

  const updateAreaColor = (id, color) => {
    setAreas(areas.map((a) => (a.id === id ? { ...a, color } : a)));
  };

  const removeArea = (id) => {
    setAreas(areas.filter((a) => a.id !== id));
    if (activeAreaId === id) setActiveAreaId(null);
    setGrid((prev) => prev.map((row) => row.map((cell) => (cell === id ? null : cell))));
    toast.success("Removed area");
  };

  const areaById = (id) => areas.find((a) => a.id === id);

  const setCell = (r, c, value) => {
    setGrid((prev) =>
      prev.map((row, ri) =>
        row.map((cell, ci) => (ri === r && ci === c ? value : cell))
      )
    );
  };

  const handleCellDown = (r, c) => {
    if (activeAreaId == null) {
      toast.error("Select an area first");
      return;
    }
    const value = grid[r][c] === activeAreaId ? null : activeAreaId;
    paintValueRef.current = value;
    setIsPainting(true);
    setCell(r, c, value);
  };

  const handleCellEnter = (r, c) => {
    if (!isPainting) return;
    setCell(r, c, paintValueRef.current);
  };

  const handleCellRightClick = (e, r, c) => {
    e.preventDefault();
    setCell(r, c, null);
  };

  const resetGrid = () => {
    setGrid(Array.from({ length: rows }, () => Array.from({ length: cols }, () => null)));
    toast.success("Cleared grid");
  };

  // ---- Derived output ----

  // Which area ids are actually painted somewhere.
  const usedIds = [...new Set(grid.flat().filter((v) => v != null))];

  // Check each used area forms a solid rectangle. Returns list of offending names.
  const nonRectangular = usedIds
    .map((id) => {
      let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity, count = 0;
      grid.forEach((row, r) =>
        row.forEach((cell, c) => {
          if (cell === id) {
            minR = Math.min(minR, r);
            maxR = Math.max(maxR, r);
            minC = Math.min(minC, c);
            maxC = Math.max(maxC, c);
            count++;
          }
        })
      );
      const boxArea = (maxR - minR + 1) * (maxC - minC + 1);
      return count === boxArea ? null : areaById(id)?.name;
    })
    .filter(Boolean);

  const isValid = nonRectangular.length === 0;

  // Build the grid-template-areas string (one quoted line per row).
  const templateAreas = grid
    .map(
      (row) =>
        `"${row.map((cell) => (cell != null ? areaById(cell)?.name ?? "." : ".")).join(" ")}"`
    )
    .join("\n    ");

  const gap = `${gapValue}${gapUnit}`;

  const cssOutput = isValid
    ? `.grid-container {
  display: grid;
  grid-template-columns: repeat(${cols}, 1fr);
  grid-template-rows: repeat(${rows}, 1fr);
  grid-template-areas:
    ${templateAreas};
  gap: ${gap};
}

${usedIds.map((id) => `.${areaById(id)?.name} { grid-area: ${areaById(id)?.name}; }`).join("\n")}`
    : "";

  const htmlOutput = isValid
    ? `<div class="grid-container">
${usedIds
        .map((id) => {
          const name = areaById(id)?.name ?? "div";
          const tag = SEMANTIC_TAGS[name] || "div";
          return `  <${tag} class="${name}"></${tag}>`;
        })
        .join("\n")}
</div>`
    : "";

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      heading: "text-zinc-900",
      subtext: "text-zinc-500",
      card: "bg-white border-zinc-200/85 shadow-sm",
      input: "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-400 focus:outline-none",
      button: "bg-zinc-900 text-white hover:bg-zinc-800 transition-all duration-200 shadow-sm",
      secondaryBtn: "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50 transition-all duration-200",
      backLink: "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350",
      badge: "bg-zinc-100 text-zinc-800 border-zinc-200",
      codeBox: "bg-zinc-900 text-zinc-100 border-zinc-800",
      emptyCell: "bg-zinc-50 border-zinc-200",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      heading: "text-zinc-100",
      subtext: "text-zinc-500",
      card: "bg-zinc-900/50 border-zinc-800/85 backdrop-blur-md shadow-md",
      input: "bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-zinc-500 focus:outline-none",
      button: "bg-white text-zinc-900 hover:bg-zinc-100 transition-all duration-200 shadow-sm",
      secondaryBtn: "bg-zinc-800/50 text-zinc-300 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-200",
      backLink: "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600",
      badge: "bg-zinc-800 text-zinc-300 border-zinc-700",
      codeBox: "bg-black/40 text-emerald-400 border-zinc-800/80 font-mono",
      emptyCell: "bg-zinc-900/40 border-zinc-800",
    },
  };
  const t = dark ? theme.dark : theme.light;

  return (
    <div className={`min-h-screen ${t.wrapper} px-4 sm:px-6 py-6 sm:py-10 transition-colors duration-300`}>
      <title>CSS Grid Area Generator — DevTasks</title>
      <meta
        name="description"
        content="Visually paint CSS named grid areas and export copy-ready grid-template-areas CSS and matching HTML."
      />

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
              CSS Grid Area Generator
            </h1>
            <p className={`mt-0.5 text-xs sm:text-sm ${t.subtext}`}>
              Paint named grid areas and export grid-template-areas CSS with matching HTML.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* LEFT: settings + area list */}
          <div className="space-y-6">
            {/* Grid Settings card */}
            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-6`}>
              <h2 className="text-lg font-semibold tracking-tight">Grid Settings</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex justify-between">
                    <span>Columns</span>
                    <span className="font-mono text-zinc-400">{cols}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={cols}
                    onChange={(e) => setCols(Number(e.target.value))}
                    className="w-full accent-indigo-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex justify-between">
                    <span>Rows</span>
                    <span className="font-mono text-zinc-400">{rows}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={rows}
                    onChange={(e) => setRows(Number(e.target.value))}
                    className="w-full accent-indigo-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Grid Gap
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={gapValue}
                    onChange={(e) => setGapValue(Math.max(0, Number(e.target.value)))}
                    className={`w-24 px-3 py-2 rounded-xl border text-sm font-semibold ${t.input}`}
                  />
                  <select
                    value={gapUnit}
                    onChange={(e) => setGapUnit(e.target.value)}
                    className={`px-3 py-2 rounded-xl border text-sm font-semibold cursor-pointer ${t.input}`}
                  >
                    <option value="px">px</option>
                    <option value="rem">rem</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid Areas card */}
            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-4`}>
              <h2 className="text-lg font-semibold tracking-tight">Grid Areas</h2>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newAreaName}
                  onChange={(e) => setNewAreaName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addArea()}
                  placeholder="area name e.g. sidebar"
                  className={`flex-1 px-3 py-2 rounded-xl border text-sm ${t.input}`}
                />
                <button
                  onClick={addArea}
                  className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest ${t.secondaryBtn}`}
                >
                  Add
                </button>
              </div>

              <div className="space-y-2">
                {areas.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => setActiveAreaId(a.id)}
                    className={`flex items-center gap-3 p-2.5 rounded-2xl border cursor-pointer transition-all ${
                      activeAreaId === a.id
                        ? "border-indigo-500 ring-1 ring-indigo-500/40"
                        : "border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
                      <input
                        type="color"
                        value={a.color}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateAreaColor(a.id, e.target.value)}
                        className="absolute inset-0 w-full h-full p-0 border-none cursor-pointer scale-150"
                      />
                    </div>
                    <span className="flex-1 text-sm font-mono font-semibold">{a.name}</span>
                    {activeAreaId === a.id && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                        Active
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeArea(a.id);
                      }}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Remove area"
                    >
                      <FaTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: visual grid + generated code */}
          <div className="space-y-6">
            <div className={`rounded-3xl border ${t.card} p-6 space-y-4`}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold tracking-tight">Visual Grid</h2>
                <button
                  onClick={resetGrid}
                  className={`px-3 py-1.5 rounded-xl border font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 ${t.secondaryBtn}`}
                  title="Clear all cells"
                >
                  <FaEraser className="w-3 h-3" /> Reset
                </button>
              </div>
              <p className={`text-xs ${t.subtext}`}>
                Click or drag to paint with the active area. Right-click a cell to erase.
              </p>

              <div
                className="grid w-full select-none"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                  gap: "6px",
                  aspectRatio: `${cols} / ${rows}`,
                }}
              >
                {grid.map((row, r) =>
                  row.map((cell, c) => {
                    const area = cell != null ? areaById(cell) : null;
                    return (
                      <div
                        key={`${r}-${c}`}
                        onMouseDown={() => handleCellDown(r, c)}
                        onMouseEnter={() => handleCellEnter(r, c)}
                        onContextMenu={(e) => handleCellRightClick(e, r, c)}
                        className={`rounded-lg border flex items-center justify-center text-[10px] font-mono font-semibold select-none min-h-[36px] cursor-pointer transition-colors ${
                          area ? "text-white" : `${t.emptyCell} text-zinc-400 hover:border-indigo-400`
                        }`}
                        style={area ? { backgroundColor: area.color, borderColor: area.color } : undefined}
                      >
                        {area ? area.name : ""}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Output card */}
            <div className={`rounded-3xl border ${t.card} p-6 space-y-4`}>
              <h2 className="text-lg font-semibold tracking-tight">Generated Code</h2>

              {!isValid ? (
                <div className="p-4 rounded-2xl border border-amber-400/40 bg-amber-400/10 text-sm">
                  <p className="font-semibold text-amber-600 dark:text-amber-400">
                    Some areas aren’t rectangular
                  </p>
                  <p className={`mt-1 ${t.subtext}`}>
                    CSS grid-template-areas only accepts rectangular areas. Fix:{" "}
                    <span className="font-mono font-semibold">
                      {nonRectangular.join(", ")}
                    </span>
                  </p>
                </div>
              ) : usedIds.length === 0 ? (
                <p className={`text-sm ${t.subtext}`}>Paint at least one area to generate code.</p>
              ) : (
                <>
                  {/* CSS block */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        CSS
                      </label>
                      <button
                        onClick={() => copy(cssOutput, "CSS")}
                        className={`px-3 py-1.5 rounded-xl border font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 ${t.secondaryBtn}`}
                      >
                        <FaCopy className="w-3 h-3" /> Copy CSS
                      </button>
                    </div>
                    <pre className={`p-4 rounded-2xl border text-xs overflow-x-auto whitespace-pre ${t.codeBox}`}>
                      {cssOutput}
                    </pre>
                  </div>

                  {/* HTML block */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        HTML
                      </label>
                      <button
                        onClick={() => copy(htmlOutput, "HTML")}
                        className={`px-3 py-1.5 rounded-xl border font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 ${t.secondaryBtn}`}
                      >
                        <FaCopy className="w-3 h-3" /> Copy HTML
                      </button>
                    </div>
                    <pre className={`p-4 rounded-2xl border text-xs overflow-x-auto whitespace-pre ${t.codeBox}`}>
                      {htmlOutput}
                    </pre>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}