import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { toast } from "sonner";
import {
  FaPlus,
  FaTrash,
  FaCopy,
  FaArrowLeft,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

// Maximum number of shadow layers allowed to avoid unbounded UI growth.
const MAX_LAYERS = 8;

/** Create a fresh shadow layer with sensible defaults. */
const createDefaultLayer = () => ({
  id: crypto.randomUUID(),
  offsetX: 0,
  offsetY: 4,
  blur: 6,
  spread: 0,
  color: "#000000",
  opacity: 10, // percent (0–100)
  inset: false,
  visible: true,
});

/**
 * Convert a hex color string + opacity (0-100) to an rgba() CSS value.
 */
const hexToRgba = (hex, opacity) => {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const a = Math.round((opacity / 100) * 100) / 100;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/**
 * Build a single CSS shadow value string from a layer object.
 */
const layerToCSS = (layer) => {
  const insetStr = layer.inset ? "inset " : "";
  const colorStr = hexToRgba(layer.color, layer.opacity);
  return `${insetStr}${layer.offsetX}px ${layer.offsetY}px ${layer.blur}px ${layer.spread}px ${colorStr}`;
};

/**
 * Build a single Tailwind arbitrary-value shadow from a layer object.
 * Tailwind syntax uses underscores for spaces inside brackets.
 */
const layerToTailwind = (layer) => {
  const insetStr = layer.inset ? "inset_" : "";
  const a = Math.round((layer.opacity / 100) * 100) / 100;
  const sanitized = layer.color.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${insetStr}${layer.offsetX}px_${layer.offsetY}px_${layer.blur}px_${layer.spread}px_rgba(${r},${g},${b},${a})`;
};

export default function BoxShadowGenerator() {
  const { dark } = useTheme();

  // Theme tokens — matches the monochrome zinc pattern used by CssGradientGenerator and other utilities
  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      heading: "text-zinc-900",
      subtext: "text-zinc-500",
      card: "bg-white border-zinc-200/85 shadow-sm",
      input:
        "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-400 focus:outline-none",
      button:
        "bg-zinc-900 text-white hover:bg-zinc-800 transition-all duration-200 shadow-sm",
      secondaryBtn:
        "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50 transition-all duration-200",
      backLink:
        "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350",
      badge: "bg-zinc-100 text-zinc-800 border-zinc-200",
      codeBox: "bg-zinc-900 text-zinc-100 border-zinc-800",
      toggle:
        "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700",
      toggleActive:
        "border-zinc-900 bg-zinc-900 text-white",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      heading: "text-zinc-100",
      subtext: "text-zinc-500",
      card: "bg-zinc-900/50 border-zinc-800/85 backdrop-blur-md shadow-md",
      input:
        "bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-zinc-500 focus:outline-none",
      button:
        "bg-white text-zinc-900 hover:bg-zinc-100 transition-all duration-200 shadow-sm",
      secondaryBtn:
        "bg-zinc-800/50 text-zinc-300 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-200",
      backLink:
        "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600",
      badge: "bg-zinc-800 text-zinc-300 border-zinc-700",
      codeBox: "bg-black/40 text-emerald-400 border-zinc-800/80 font-mono",
      toggle:
        "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300",
      toggleActive:
        "border-white bg-white text-zinc-900",
    },
  };

  const t = dark ? theme.dark : theme.light;

  // ── Shadow Layers ──
  const [layers, setLayers] = useState([createDefaultLayer()]);

  // ── Preview Settings ──
  const [bgColor, setBgColor] = useState(dark ? "#090a0f" : "#f8f9fa");
  const [cardColor, setCardColor] = useState(dark ? "#18181b" : "#ffffff");
  const [borderRadius, setBorderRadius] = useState(16);
  const [cardSize, setCardSize] = useState(200);

  // ── Code Output Toggles ──
  const [includeWebkit, setIncludeWebkit] = useState(false);
  const [showTailwind, setShowTailwind] = useState(false);

  // ── Layer management helpers ──
  const addLayer = useCallback(() => {
    if (layers.length >= MAX_LAYERS) {
      toast.error(`Maximum ${MAX_LAYERS} shadow layers allowed`);
      return;
    }
    setLayers((prev) => [...prev, createDefaultLayer()]);
    toast.success("Added new shadow layer");
  }, [layers.length]);

  const removeLayer = useCallback(
    (id) => {
      if (layers.length <= 1) {
        toast.error("At least 1 shadow layer is required");
        return;
      }
      setLayers((prev) => prev.filter((l) => l.id !== id));
      toast.success("Removed shadow layer");
    },
    [layers.length],
  );

  const updateLayer = useCallback((id, key, value) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [key]: value } : l)),
    );
  }, []);

  const moveLayer = useCallback((index, direction) => {
    setLayers((prev) => {
      const copy = [...prev];
      const target = index + direction;
      if (target < 0 || target >= copy.length) return prev;
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }, []);

  const toggleVisibility = useCallback((id) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    );
  }, []);

  // ── Computed CSS output ──
  const visibleLayers = layers.filter((l) => l.visible);
  const shadowCSS =
    visibleLayers.length > 0
      ? visibleLayers.map(layerToCSS).join(",\n    ")
      : "none";

  const cssOutput = includeWebkit
    ? `-webkit-box-shadow: ${shadowCSS};\nbox-shadow: ${shadowCSS};`
    : `box-shadow: ${shadowCSS};`;

  const tailwindOutput =
    visibleLayers.length > 0
      ? `shadow-[${visibleLayers.map(layerToTailwind).join(",")}]`
      : "shadow-none";

  const displayedCode = showTailwind ? tailwindOutput : cssOutput;

  // Inline style for the preview card
  const previewShadow =
    visibleLayers.length > 0
      ? visibleLayers.map(layerToCSS).join(", ")
      : "none";

  const copyCode = () => {
    navigator.clipboard.writeText(displayedCode);
    toast.success("Copied to clipboard!");
  };

  // ── Slider helper component ──
  const RangeControl = ({ label, value, min, max, unit, onChange }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex justify-between">
        <span>{label}</span>
        <span className="font-mono text-zinc-400">
          {value}
          {unit}
        </span>
      </label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-zinc-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
        />
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v >= min && v <= max) onChange(v);
          }}
          className={`w-16 px-2 py-1 rounded-lg border text-xs font-semibold text-center ${t.input}`}
        />
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen ${t.wrapper} px-4 sm:px-6 py-6 sm:py-10 transition-colors duration-300`}
    >
      <title>CSS Box Shadow &amp; Glow Generator — DevTasks</title>
      <meta
        name="description"
        content="Design multi-layer CSS box shadows and glows with a live preview, inset support, and copy-ready CSS or Tailwind output."
      />

      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
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
              CSS Box Shadow & Glow Generator
            </h1>
            <p className={`mt-0.5 text-xs sm:text-sm ${t.subtext}`}>
              Design multi-layer box shadows with live preview and export
              copy-ready CSS or Tailwind classes.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* ═══════════════════════════════════════════════
              LEFT COLUMN — Shadow Layer Controls
              ═══════════════════════════════════════════════ */}
          <div className="space-y-6">
            {/* Actions toolbar */}
            <div
              className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-4`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">
                  Shadow Layers
                </h2>
                <span
                  className={`text-xs font-bold uppercase tracking-widest ${t.subtext}`}
                >
                  {layers.length} / {MAX_LAYERS}
                </span>
              </div>

              <button
                onClick={addLayer}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 border ${t.secondaryBtn}`}
              >
                <FaPlus className="w-3.5 h-3.5" /> Add Layer
              </button>
            </div>

            {/* Individual layer editors */}
            <div className="space-y-4 max-h-[calc(100vh-340px)] overflow-y-auto pr-1">
              {layers.map((layer, index) => (
                <div
                  key={layer.id}
                  className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-5 transition-opacity duration-200 ${
                    !layer.visible ? "opacity-50" : ""
                  }`}
                >
                  {/* Layer header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black uppercase tracking-widest ${t.subtext}`}
                      >
                        Layer {index + 1}
                      </span>
                      {layer.inset && (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${t.badge}`}
                        >
                          Inset
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Move up */}
                      <button
                        onClick={() => moveLayer(index, -1)}
                        disabled={index === 0}
                        className={`p-1.5 rounded-lg transition-colors ${
                          index === 0
                            ? "opacity-30 cursor-not-allowed"
                            : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                        title="Move layer up"
                      >
                        <FaArrowUp className="w-3 h-3" />
                      </button>
                      {/* Move down */}
                      <button
                        onClick={() => moveLayer(index, 1)}
                        disabled={index === layers.length - 1}
                        className={`p-1.5 rounded-lg transition-colors ${
                          index === layers.length - 1
                            ? "opacity-30 cursor-not-allowed"
                            : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                        title="Move layer down"
                      >
                        <FaArrowDown className="w-3 h-3" />
                      </button>
                      {/* Visibility toggle */}
                      <button
                        onClick={() => toggleVisibility(layer.id)}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title={
                          layer.visible ? "Hide layer" : "Show layer"
                        }
                      >
                        {layer.visible ? (
                          <FaEye className="w-3.5 h-3.5" />
                        ) : (
                          <FaEyeSlash className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => removeLayer(layer.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Remove layer"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Offset controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <RangeControl
                      label="Offset X"
                      value={layer.offsetX}
                      min={-100}
                      max={100}
                      unit="px"
                      onChange={(v) => updateLayer(layer.id, "offsetX", v)}
                    />
                    <RangeControl
                      label="Offset Y"
                      value={layer.offsetY}
                      min={-100}
                      max={100}
                      unit="px"
                      onChange={(v) => updateLayer(layer.id, "offsetY", v)}
                    />
                  </div>

                  {/* Blur & Spread */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <RangeControl
                      label="Blur"
                      value={layer.blur}
                      min={0}
                      max={100}
                      unit="px"
                      onChange={(v) => updateLayer(layer.id, "blur", v)}
                    />
                    <RangeControl
                      label="Spread"
                      value={layer.spread}
                      min={-50}
                      max={50}
                      unit="px"
                      onChange={(v) => updateLayer(layer.id, "spread", v)}
                    />
                  </div>

                  {/* Color + Opacity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Shadow Color
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
                          <input
                            type="color"
                            value={layer.color}
                            onChange={(e) =>
                              updateLayer(layer.id, "color", e.target.value)
                            }
                            className="absolute inset-0 w-full h-full p-0 border-none cursor-pointer scale-150"
                          />
                        </div>
                        <input
                          type="text"
                          value={layer.color}
                          onChange={(e) =>
                            updateLayer(layer.id, "color", e.target.value)
                          }
                          className={`w-24 px-2 py-1.5 rounded-lg border text-xs font-mono text-center uppercase ${t.input}`}
                        />
                      </div>
                    </div>
                    <RangeControl
                      label="Opacity"
                      value={layer.opacity}
                      min={0}
                      max={100}
                      unit="%"
                      onChange={(v) => updateLayer(layer.id, "opacity", v)}
                    />
                  </div>

                  {/* Inset toggle */}
                  <div className="flex items-center gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                    <button
                      onClick={() =>
                        updateLayer(layer.id, "inset", !layer.inset)
                      }
                      className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest border transition-all duration-200 ${
                        layer.inset ? t.toggleActive : t.toggle
                      }`}
                    >
                      Inset
                    </button>
                    <span className="text-xs text-zinc-400">
                      {layer.inset
                        ? "Shadow renders inside the element"
                        : "Shadow renders outside the element"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════
              RIGHT COLUMN — Live Preview & Code Output
              ═══════════════════════════════════════════════ */}
          <div className="space-y-6">
            {/* Live Preview Card */}
            <div
              className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-5`}
            >
              <h2 className="text-lg font-semibold tracking-tight">
                Live Preview
              </h2>

              {/* Preview area */}
              <div
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 relative overflow-hidden flex items-center justify-center"
                style={{
                  backgroundColor: bgColor,
                  minHeight: "280px",
                  padding: "40px",
                }}
              >
                {/* Checkerboard transparency indicator */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-5 pointer-events-none" />
                <div
                  style={{
                    width: `${cardSize}px`,
                    height: `${cardSize}px`,
                    backgroundColor: cardColor,
                    borderRadius: `${borderRadius}px`,
                    boxShadow: previewShadow,
                    transition: "box-shadow 0.2s ease, border-radius 0.2s ease",
                  }}
                />
              </div>

              {/* Preview customization controls */}
              <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Background
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="absolute inset-0 w-full h-full p-0 border-none cursor-pointer scale-150"
                        />
                      </div>
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className={`flex-1 px-2 py-1.5 rounded-lg border text-xs font-mono text-center uppercase ${t.input}`}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Card Color
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
                        <input
                          type="color"
                          value={cardColor}
                          onChange={(e) => setCardColor(e.target.value)}
                          className="absolute inset-0 w-full h-full p-0 border-none cursor-pointer scale-150"
                        />
                      </div>
                      <input
                        type="text"
                        value={cardColor}
                        onChange={(e) => setCardColor(e.target.value)}
                        className={`flex-1 px-2 py-1.5 rounded-lg border text-xs font-mono text-center uppercase ${t.input}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <RangeControl
                    label="Border Radius"
                    value={borderRadius}
                    min={0}
                    max={50}
                    unit="px"
                    onChange={setBorderRadius}
                  />
                  <RangeControl
                    label="Card Size"
                    value={cardSize}
                    min={150}
                    max={400}
                    unit="px"
                    onChange={setCardSize}
                  />
                </div>
              </div>
            </div>

            {/* Code Output Card */}
            <div
              className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-4`}
            >
              <h2 className="text-lg font-semibold tracking-tight">
                Generated Code
              </h2>

              {/* Toggle buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setIncludeWebkit((v) => !v)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-widest border transition-all duration-200 ${
                    includeWebkit ? t.toggleActive : t.toggle
                  }`}
                >
                  -webkit- prefix
                </button>
                <button
                  onClick={() => setShowTailwind((v) => !v)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-widest border transition-all duration-200 ${
                    showTailwind ? t.toggleActive : t.toggle
                  }`}
                >
                  Tailwind
                </button>
              </div>

              {/* Code block */}
              <div className="relative">
                <pre
                  className={`p-4 rounded-2xl border text-xs overflow-x-auto whitespace-pre-wrap select-all ${t.codeBox}`}
                >
                  {displayedCode}
                </pre>
                <button
                  onClick={copyCode}
                  className="absolute right-3 top-3 p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-white transition-colors active:scale-95 flex items-center gap-1.5 text-xs font-semibold shadow-md"
                  title="Copy to clipboard"
                >
                  <FaCopy className="w-3 h-3" /> Copy{" "}
                  {showTailwind ? "Class" : "CSS"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
