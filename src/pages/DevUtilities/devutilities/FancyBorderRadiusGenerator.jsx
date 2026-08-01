import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  FaArrowLeft,
  FaCopy,
  FaPlay,
  FaStop,
  FaSyncAlt,
  FaUndo,
} from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";

// Corner order used by the CSS border-radius shorthand: TL, TR, BR, BL
const CORNER_KEYS = ["tl", "tr", "br", "bl"];

const DEFAULT_RADII = {
  tlH: 30, trH: 70, brH: 70, blH: 30,
  tlV: 30, trV: 30, brV: 70, blV: 70,
};

const PRESETS = [
  { name: "Perfect Circle", radii: { tlH: 50, trH: 50, brH: 50, blH: 50, tlV: 50, trV: 50, brV: 50, blV: 50 } },
  { name: "Organic Blob", radii: { tlH: 30, trH: 70, brH: 70, blH: 30, tlV: 30, trV: 30, brV: 70, blV: 70 } },
  { name: "Liquid Button", radii: { tlH: 60, trH: 40, brH: 30, blH: 70, tlV: 60, trV: 30, brV: 70, blV: 40 } },
  { name: "Egg", radii: { tlH: 50, trH: 50, brH: 50, blH: 50, tlV: 60, trV: 60, brV: 40, blV: 40 } },
  { name: "Speech Bubble", radii: { tlH: 35, trH: 35, brH: 35, blH: 5, tlV: 35, trV: 35, brV: 10, blV: 35 } },
];

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const round1 = (n) => Math.round(n * 10) / 10;

const radiiToCss = (r) =>
  `${round1(r.tlH)}% ${round1(r.trH)}% ${round1(r.brH)}% ${round1(r.blH)}% / ${round1(r.tlV)}% ${round1(r.trV)}% ${round1(r.brV)}% ${round1(r.blV)}%`;

// Cyclically rotates the 8 values so the morph target still looks organic
// and always stays within the same 0-100 range as the source shape.
const rotateRadii = (r) => ({
  tlH: r.trH, trH: r.brH, brH: r.blH, blH: r.tlH,
  tlV: r.trV, trV: r.brV, brV: r.blV, blV: r.tlV,
});

export default function FancyBorderRadiusGenerator() {
  const { dark } = useTheme();
  const containerRef = useRef(null);
  const draggingHandle = useRef(null);
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");

  const [radii, setRadii] = useState({ ...DEFAULT_RADII });
  const [activePreset, setActivePreset] = useState("Organic Blob");
  const [width, setWidth] = useState(280);
  const [height, setHeight] = useState(280);
  const [morphing, setMorphing] = useState(false);
  const [duration, setDuration] = useState(4);
  const [tailwindMode, setTailwindMode] = useState(false);

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
      blob: "bg-gradient-to-br from-zinc-800 to-zinc-500",
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
      blob: "bg-gradient-to-br from-zinc-200 to-zinc-500",
    },
  };
  const t = dark ? theme.dark : theme.light;

  const primaryRadius = radiiToCss(radii);
  const secondaryRadii = rotateRadii(radii);
  const secondaryRadius = radiiToCss(secondaryRadii);

  const cssOutput = `.fancy-blob {\n  width: ${width}px;\n  height: ${height}px;\n  border-radius: ${primaryRadius};\n}`;
  const tailwindOutput = `w-[${width}px] h-[${height}px] rounded-[${primaryRadius.replace(/\s+/g, "_")}]`;

  const keyframeName = `blobMorph${rawId}`;

  const getRelativePoint = useCallback((clientX, clientY) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);
    return [x, y];
  }, []);

  const handlePointerDown = (handleKey) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    draggingHandle.current = handleKey;
  };

  useEffect(() => {
    const handleMove = (e) => {
      const handle = draggingHandle.current;
      if (!handle || !containerRef.current) return;
      const [x, y] = getRelativePoint(e.clientX, e.clientY);

      setRadii((prev) => {
        const next = { ...prev };
        switch (handle) {
          case "tlH":
            next.tlH = clamp(round1(x), 0, 100);
            break;
          case "trH":
            next.trH = clamp(round1(100 - x), 0, 100);
            break;
          case "brH":
            next.brH = clamp(round1(100 - x), 0, 100);
            break;
          case "blH":
            next.blH = clamp(round1(x), 0, 100);
            break;
          case "tlV":
            next.tlV = clamp(round1(y), 0, 100);
            break;
          case "trV":
            next.trV = clamp(round1(y), 0, 100);
            break;
          case "brV":
            next.brV = clamp(round1(100 - y), 0, 100);
            break;
          case "blV":
            next.blV = clamp(round1(100 - y), 0, 100);
            break;
          default:
            break;
        }
        return next;
      });
      setActivePreset(null);
    };
    const handleUp = () => {
      draggingHandle.current = null;
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [getRelativePoint]);

  const applyPreset = (preset) => {
    setRadii({ ...preset.radii });
    setActivePreset(preset.name);
    toast.success(`Applied ${preset.name} preset`);
  };

  const resetShape = () => {
    setRadii({ ...DEFAULT_RADII });
    setActivePreset("Organic Blob");
    setMorphing(false);
    toast.success("Shape reset");
  };

  const copyCss = () => {
    navigator.clipboard.writeText(tailwindMode ? tailwindOutput : cssOutput);
    toast.success(tailwindMode ? "Copied Tailwind classes!" : "Copied CSS to clipboard!");
  };

  // Handle anchor positions, expressed as {x%, y%} on the preview box.
  const handlePositions = {
    tlH: { x: radii.tlH, y: 0 },
    trH: { x: 100 - radii.trH, y: 0 },
    brH: { x: 100 - radii.brH, y: 100 },
    blH: { x: radii.blH, y: 100 },
    tlV: { x: 0, y: radii.tlV },
    trV: { x: 100, y: radii.trV },
    brV: { x: 100, y: 100 - radii.brV },
    blV: { x: 0, y: 100 - radii.blV },
  };

  const handleLabels = {
    tlH: "Top-left horizontal",
    trH: "Top-right horizontal",
    brH: "Bottom-right horizontal",
    blH: "Bottom-left horizontal",
    tlV: "Top-left vertical",
    trV: "Top-right vertical",
    brV: "Bottom-right vertical",
    blV: "Bottom-left vertical",
  };

  return (
    <div className={`min-h-screen ${t.wrapper} px-4 sm:px-6 py-6 sm:py-10 transition-colors duration-300`}>
      <title>CSS Custom Blob & Fancy Border Radius Generator — DevTasks</title>
      <meta
        name="description"
        content="Design organic blob shapes using visual drag handles and the 8-value fancy border-radius syntax. Fully offline."
      />

      {morphing && (
        <style>{`
          @keyframes ${keyframeName} {
            0%, 100% { border-radius: ${primaryRadius}; }
            50% { border-radius: ${secondaryRadius}; }
          }
        `}</style>
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
              CSS Custom Blob & Fancy Border Radius Generator
            </h1>
            <p className={`mt-0.5 text-xs sm:text-sm ${t.subtext}`}>
              Drag the 8 handles to morph the shape, layer in animation, and export ready-to-use CSS. Fully offline.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Left: Preview canvas */}
          <div className="space-y-6">
            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-4`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-semibold tracking-tight ${t.heading}`}>Preview</h2>
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
                className={`relative w-full flex items-center justify-center rounded-2xl border ${t.canvasBorder} overflow-visible select-none touch-none py-10`}
              >
                <div
                  className={`${t.blob} shrink-0`}
                  style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    maxWidth: "100%",
                    borderRadius: primaryRadius,
                    animation: morphing ? `${keyframeName} ${duration}s ease-in-out infinite` : "none",
                  }}
                />

                {/* Draggable handles, positioned relative to the container box */}
                <div className="absolute inset-0 py-10 pointer-events-none">
                  <div className="relative w-full h-full mx-auto pointer-events-none" style={{ maxWidth: `${width}px` }}>
                    {CORNER_KEYS.flatMap((corner) => [`${corner}H`, `${corner}V`]).map((key) => {
                      const pos = handlePositions[key];
                      return (
                        <div
                          key={key}
                          onPointerDown={handlePointerDown(key)}
                          title={`${handleLabels[key]} — drag along the edge`}
                          className="absolute w-4 h-4 rounded-full bg-indigo-500 border-2 border-white shadow-md cursor-grab active:cursor-grabbing pointer-events-auto"
                          style={{
                            left: `${pos.x}%`,
                            top: `${pos.y}%`,
                            transform: "translate(-50%, -50%)",
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <p className={`text-[11px] ${t.subtext}`}>
                Each corner has a horizontal and a vertical handle — drag them along the box edges to shape the blob.
              </p>
            </div>

            {/* Dimensions */}
            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-4`}>
              <h2 className={`text-lg font-semibold tracking-tight ${t.heading}`}>Dimensions</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`text-xs w-14 ${t.subtext}`}>Width</span>
                  <input
                    type="range"
                    min="120"
                    max="500"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="flex-1 accent-indigo-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <span className={`text-xs font-mono w-14 text-right ${t.subtext}`}>{width}px</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs w-14 ${t.subtext}`}>Height</span>
                  <input
                    type="range"
                    min="120"
                    max="500"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="flex-1 accent-indigo-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <span className={`text-xs font-mono w-14 text-right ${t.subtext}`}>{height}px</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Presets, animation, output */}
          <div className="space-y-6">
            {/* Presets */}
            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-3`}>
              <h2 className={`text-lg font-semibold tracking-tight ${t.heading}`}>Shape Presets</h2>
              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map((preset) => (
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

            {/* Animation */}
            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-4`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-semibold tracking-tight ${t.heading}`}>Morph Animation</h2>
                <button
                  onClick={() => setMorphing((v) => !v)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest border flex items-center gap-1.5 transition-all duration-200 ${
                    morphing ? t.activeBtn : t.secondaryBtn
                  }`}
                >
                  {morphing ? <FaStop className="w-3 h-3" /> : <FaPlay className="w-3 h-3" />}
                  {morphing ? "Stop" : "Play"}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs w-16 ${t.subtext}`}>Speed</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="flex-1 accent-indigo-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
                <span className={`text-xs font-mono w-10 text-right ${t.subtext}`}>{duration}s</span>
              </div>
              <p className={`text-[11px] ${t.subtext}`}>
                Morphs between the current shape and an auto-generated offset for a fluid, liquid motion.
              </p>
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
                  {tailwindMode ? tailwindOutput : cssOutput}
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
