import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  FaArrowLeft,
  FaCopy,
  FaImage,
  FaPalette,
  FaSyncAlt,
  FaTh,
  FaTrash,
  FaUndo,
} from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=900&q=80&auto=format&fit=crop";

const SHAPE_PRESETS = [
  { name: "Triangle", group: "Polygons", points: [[50, 0], [0, 100], [100, 100]] },
  { name: "Trapezoid", group: "Polygons", points: [[20, 0], [80, 0], [100, 100], [0, 100]] },
  { name: "Parallelogram", group: "Polygons", points: [[25, 0], [100, 0], [75, 100], [0, 100]] },
  { name: "Pentagon", group: "Polygons", points: [[50, 0], [100, 38], [82, 100], [18, 100], [0, 38]] },
  { name: "Hexagon", group: "Polygons", points: [[25, 0], [75, 0], [100, 50], [75, 100], [25, 100], [0, 50]] },
  {
    name: "Octagon",
    group: "Polygons",
    points: [
      [30, 0], [70, 0], [100, 30], [100, 70],
      [70, 100], [30, 100], [0, 70], [0, 30],
    ],
  },
  {
    name: "Star",
    group: "Special",
    points: [
      [50, 0], [61, 35], [98, 35], [68, 57], [79, 91],
      [50, 70], [21, 91], [32, 57], [2, 35], [39, 35],
    ],
  },
  {
    name: "Left Arrow",
    group: "Special",
    points: [[40, 0], [40, 20], [100, 20], [100, 80], [40, 80], [40, 100], [0, 50]],
  },
  {
    name: "Right Arrow",
    group: "Special",
    points: [[60, 0], [60, 20], [0, 20], [0, 80], [60, 80], [60, 100], [100, 50]],
  },
  {
    name: "Message Bubble",
    group: "Special",
    points: [[0, 0], [100, 0], [100, 75], [25, 75], [15, 100], [15, 75], [0, 75]],
  },
  {
    name: "Cross",
    group: "Special",
    points: [
      [35, 0], [65, 0], [65, 35], [100, 35], [100, 65], [65, 65],
      [65, 100], [35, 100], [35, 65], [0, 65], [0, 35], [35, 35],
    ],
  },
  {
    name: "Frame",
    group: "Special",
    points: [
      [0, 0], [100, 0], [100, 100], [0, 100], [0, 10],
      [10, 10], [10, 90], [90, 90], [90, 10], [0, 10],
    ],
  },
];

const GRID_OPTIONS = [
  { label: "Off", value: 0 },
  { label: "5%", value: 5 },
  { label: "10%", value: 10 },
];

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const round1 = (n) => Math.round(n * 10) / 10;

const snapValue = (value, grid) => {
  if (!grid) return round1(value);
  return Math.round(value / grid) * grid;
};

// Shortest distance from point p to segment ab. Returns { dist, x, y }.
const closestPointOnSegment = (p, a, b) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lenSq;
  t = clamp(t, 0, 1);
  const x = a[0] + t * dx;
  const y = a[1] + t * dy;
  const dist = Math.hypot(p[0] - x, p[1] - y);
  return { dist, x, y };
};

const pointsToPolygonCss = (points) =>
  `polygon(${points.map(([x, y]) => `${round1(x)}% ${round1(y)}%`).join(", ")})`;

export default function ClipPathMaker() {
  const { dark } = useTheme();
  const containerRef = useRef(null);
  const draggingIndex = useRef(null);

  const [points, setPoints] = useState(SHAPE_PRESETS[0].points.map((p) => [...p]));
  const [activePreset, setActivePreset] = useState(SHAPE_PRESETS[0].name);
  const [grid, setGrid] = useState(0);
  const [tailwindMode, setTailwindMode] = useState(false);

  const [bgMode, setBgMode] = useState("image"); // image | color | gradient | transparent
  const [bgImage, setBgImage] = useState(DEFAULT_IMAGE);
  const [bgColor, setBgColor] = useState("#6366f1");
  const [gradFrom, setGradFrom] = useState("#4facfe");
  const [gradTo, setGradTo] = useState("#00f2fe");
  const [gradAngle, setGradAngle] = useState(120);

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      heading: "text-zinc-900",
      subtext: "text-zinc-500",
      card: "bg-white border-zinc-200/85 shadow-sm",
      input:
        "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-400 focus:outline-none",
      button: "bg-zinc-900 text-white hover:bg-zinc-800 transition-all duration-200 shadow-sm",
      secondaryBtn:
        "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50 transition-all duration-200",
      activeBtn: "bg-zinc-900 text-white border-zinc-900",
      backLink:
        "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350",
      codeBox: "bg-zinc-900 text-zinc-100 border-zinc-800",
      subtle: "border-zinc-100",
      canvasBorder: "border-zinc-200",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      heading: "text-zinc-100",
      subtext: "text-zinc-500",
      card: "bg-zinc-900/50 border-zinc-800/85 backdrop-blur-md shadow-md",
      input:
        "bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-zinc-500 focus:outline-none",
      button: "bg-white text-zinc-900 hover:bg-zinc-100 transition-all duration-200 shadow-sm",
      secondaryBtn:
        "bg-zinc-800/50 text-zinc-300 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-200",
      activeBtn: "bg-white text-zinc-900 border-white",
      backLink:
        "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600",
      codeBox: "bg-black/40 text-emerald-400 border-zinc-800/80 font-mono",
      subtle: "border-zinc-800/60",
      canvasBorder: "border-zinc-800",
    },
  };
  const t = dark ? theme.dark : theme.light;

  const polygonCss = pointsToPolygonCss(points);
  const clipPathValue = `clip-path: ${polygonCss};`;
  const tailwindClass = `clip-[${polygonCss}]`.replace(/\s+/g, "_");

  const getRelativePoint = useCallback((clientX, clientY) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);
    return [x, y];
  }, []);

  // --- Dragging handles ---
  const handlePointerDown = (index) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    draggingIndex.current = index;
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (draggingIndex.current === null || !containerRef.current) return;
      const [x, y] = getRelativePoint(e.clientX, e.clientY);
      setPoints((prev) => {
        const next = [...prev];
        next[draggingIndex.current] = [snapValue(x, grid), snapValue(y, grid)];
        return next;
      });
      setActivePreset(null);
    };
    const handleUp = () => {
      draggingIndex.current = null;
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [getRelativePoint, grid]);

  // --- Add vertex by clicking on an edge ---
  const handleEdgeClick = (e) => {
    if (!containerRef.current) return;
    const clicked = getRelativePoint(e.clientX, e.clientY);

    let bestIndex = 0;
    let bestDist = Infinity;
    let bestPoint = clicked;

    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      const { dist, x, y } = closestPointOnSegment(clicked, a, b);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
        bestPoint = [x, y];
      }
    }

    const next = [...points];
    next.splice(bestIndex + 1, 0, [
      snapValue(bestPoint[0], grid),
      snapValue(bestPoint[1], grid),
    ]);
    setPoints(next);
    setActivePreset(null);
    toast.success("Vertex added");
  };

  // --- Delete vertex on double click ---
  const handleDeleteVertex = (index) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (points.length <= 3) {
      toast.error("A shape needs at least 3 vertices");
      return;
    }
    setPoints(points.filter((_, i) => i !== index));
    setActivePreset(null);
    toast.success("Vertex removed");
  };

  const applyPreset = (preset) => {
    setPoints(preset.points.map((p) => [...p]));
    setActivePreset(preset.name);
    toast.success(`Applied ${preset.name} preset`);
  };

  const resetShape = () => {
    applyPreset(SHAPE_PRESETS[0]);
  };

  const updatePointField = (index, axis, value) => {
    const num = clamp(Number(value) || 0, 0, 100);
    const next = [...points];
    next[index] = axis === "x" ? [num, next[index][1]] : [next[index][0], num];
    setPoints(next);
    setActivePreset(null);
  };

  const copyCss = () => {
    navigator.clipboard.writeText(tailwindMode ? tailwindClass : clipPathValue);
    toast.success(tailwindMode ? "Copied Tailwind class!" : "Copied CSS to clipboard!");
  };

  const backgroundStyle = (() => {
    if (bgMode === "image") {
      return {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    if (bgMode === "color") {
      return { backgroundColor: bgColor };
    }
    if (bgMode === "gradient") {
      return {
        backgroundImage: `linear-gradient(${gradAngle}deg, ${gradFrom}, ${gradTo})`,
      };
    }
    return {};
  })();

  const groupedPresets = SHAPE_PRESETS.reduce((acc, p) => {
    acc[p.group] = acc[p.group] || [];
    acc[p.group].push(p);
    return acc;
  }, {});

  return (
    <div className={`min-h-screen ${t.wrapper} px-4 sm:px-6 py-6 sm:py-10 transition-colors duration-300`}>
      <title>CSS Clip-path Maker & Shape Generator — DevTasks</title>
      <meta
        name="description"
        content="Design CSS clip-path shapes visually with draggable vertices, presets, and instant copy-ready CSS output."
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
              CSS Clip-path Maker & Shape Generator
            </h1>
            <p className={`mt-0.5 text-xs sm:text-sm ${t.subtext}`}>
              Drag vertices, load presets, and export ready-to-use clip-path CSS. Fully offline.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Left: Canvas */}
          <div className="space-y-6">
            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-4`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-semibold tracking-tight ${t.heading}`}>Canvas</h2>
                <button
                  onClick={resetShape}
                  className={`px-3 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center gap-1.5 ${t.secondaryBtn}`}
                  title="Reset shape"
                >
                  <FaUndo className="w-3 h-3" /> Reset
                </button>
              </div>

              <div
                ref={containerRef}
                className={`relative w-full h-72 sm:h-96 rounded-2xl border ${t.canvasBorder} overflow-hidden select-none touch-none`}
                style={
                  bgMode === "transparent"
                    ? {
                        backgroundImage:
                          "linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)",
                        backgroundSize: "20px 20px",
                        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                      }
                    : {}
                }
              >
                {/* Clipped background layer */}
                <div
                  className="absolute inset-0"
                  style={{ ...backgroundStyle, clipPath: polygonCss, WebkitClipPath: polygonCss }}
                />
                {/* Faint unclipped reference */}
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={backgroundStyle}
                />

                {/* Outline overlay (click to add vertex) */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <polygon
                    points={points.map(([x, y]) => `${x},${y}`).join(" ")}
                    fill="none"
                    stroke={dark ? "#a1a1aa" : "#3f3f46"}
                    strokeWidth="0.6"
                    vectorEffect="non-scaling-stroke"
                    style={{ cursor: "copy", pointerEvents: "stroke" }}
                    onClick={handleEdgeClick}
                  />
                </svg>

                {/* Draggable handles */}
                {points.map(([x, y], i) => (
                  <div
                    key={i}
                    onPointerDown={handlePointerDown(i)}
                    onDoubleClick={handleDeleteVertex(i)}
                    title={`Vertex ${i + 1} — drag to move, double-click to delete`}
                    className="absolute w-4 h-4 rounded-full bg-indigo-500 border-2 border-white shadow-md cursor-grab active:cursor-grabbing"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                ))}
              </div>

              <p className={`text-[11px] ${t.subtext}`}>
                Click the outline to add a vertex. Double-click a handle to remove it (minimum 3).
              </p>

              {/* Grid snap */}
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                <span className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${t.subtext}`}>
                  <FaTh className="w-3 h-3" /> Snap
                </span>
                {GRID_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setGrid(opt.value)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-all duration-200 ${
                      grid === opt.value ? t.activeBtn : t.secondaryBtn
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Coordinate table */}
            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-3`}>
              <h2 className={`text-lg font-semibold tracking-tight ${t.heading}`}>Vertices</h2>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {points.map(([x, y], i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`w-6 text-xs font-mono ${t.subtext}`}>{i + 1}</span>
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-[10px] text-zinc-500">X</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={round1(x)}
                        onChange={(e) => updatePointField(i, "x", e.target.value)}
                        className={`w-full px-2 py-1 rounded-lg border text-xs font-mono text-center ${t.input}`}
                      />
                      <span className="text-[10px] text-zinc-500">%</span>
                    </div>
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-[10px] text-zinc-500">Y</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={round1(y)}
                        onChange={(e) => updatePointField(i, "y", e.target.value)}
                        className={`w-full px-2 py-1 rounded-lg border text-xs font-mono text-center ${t.input}`}
                      />
                      <span className="text-[10px] text-zinc-500">%</span>
                    </div>
                    <button
                      onClick={handleDeleteVertex(i)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                      title="Remove vertex"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Presets, Background, Output */}
          <div className="space-y-6">
            {/* Presets */}
            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-4`}>
              <h2 className={`text-lg font-semibold tracking-tight ${t.heading}`}>Shape Presets</h2>
              {Object.entries(groupedPresets).map(([group, presets]) => (
                <div key={group} className="space-y-2">
                  <span className={`text-[11px] font-semibold uppercase tracking-wider ${t.subtext}`}>
                    {group}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {presets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => applyPreset(preset)}
                        className={`px-2 py-2 rounded-xl border text-[11px] font-semibold text-center transition-all duration-200 ${
                          activePreset === preset.name ? t.activeBtn : t.secondaryBtn
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Background controls */}
            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-4`}>
              <h2 className={`text-lg font-semibold tracking-tight ${t.heading} flex items-center gap-2`}>
                <FaPalette className="w-4 h-4" /> Preview Background
              </h2>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "image", label: "Image" },
                  { id: "color", label: "Solid Color" },
                  { id: "gradient", label: "Gradient" },
                  { id: "transparent", label: "Transparent" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setBgMode(opt.id)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-all duration-200 ${
                      bgMode === opt.id ? t.activeBtn : t.secondaryBtn
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {bgMode === "image" && (
                <div className="flex items-center gap-2">
                  <FaImage className={`w-4 h-4 shrink-0 ${t.subtext}`} />
                  <input
                    type="text"
                    value={bgImage}
                    onChange={(e) => setBgImage(e.target.value)}
                    placeholder="Image URL"
                    className={`flex-1 px-3 py-2 rounded-xl border text-xs ${t.input}`}
                  />
                </div>
              )}

              {bgMode === "color" && (
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border-none cursor-pointer"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-xl border text-xs font-mono uppercase ${t.input}`}
                  />
                </div>
              )}

              {bgMode === "gradient" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={gradFrom}
                      onChange={(e) => setGradFrom(e.target.value)}
                      className="w-10 h-10 rounded-xl border-none cursor-pointer"
                    />
                    <input
                      type="color"
                      value={gradTo}
                      onChange={(e) => setGradTo(e.target.value)}
                      className="w-10 h-10 rounded-xl border-none cursor-pointer"
                    />
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={gradAngle}
                      onChange={(e) => setGradAngle(Number(e.target.value))}
                      className="flex-1 accent-indigo-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                    />
                    <span className={`text-xs font-mono w-10 text-right ${t.subtext}`}>{gradAngle}°</span>
                  </div>
                </div>
              )}
            </div>

            {/* CSS Output */}
            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-3`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-semibold tracking-tight ${t.heading}`}>CSS Output</h2>
                <button
                  onClick={() => setTailwindMode((v) => !v)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest border flex items-center gap-1.5 transition-all duration-200 ${
                    tailwindMode ? t.activeBtn : t.secondaryBtn
                  }`}
                  title="Toggle Tailwind class syntax"
                >
                  <FaSyncAlt className="w-3 h-3" /> Tailwind
                </button>
              </div>
              <div className="relative">
                <pre
                  className={`p-4 rounded-2xl border text-xs overflow-x-auto whitespace-pre-wrap break-all select-all ${t.codeBox}`}
                >
                  {tailwindMode ? tailwindClass : clipPathValue}
                </pre>
                <button
                  onClick={copyCss}
                  className="absolute right-3 top-3 p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-white transition-colors active:scale-95 flex items-center gap-1.5 text-xs font-semibold shadow-md"
                  title="Copy to clipboard"
                >
                  <FaCopy className="w-3 h-3" /> Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}