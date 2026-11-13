import { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

// Units shown in the converter tab. `relativeTo` decides which font size
// the unit is resolved against; `digits` is the display precision.
const UNITS = [
  { key: "px", label: "Pixels (px)", suffix: "px", relativeTo: null, digits: 2 },
  { key: "rem", label: "REM (rem)", suffix: "rem", relativeTo: "root", digits: 4 },
  { key: "em", label: "EM (em)", suffix: "em", relativeTo: "parent", digits: 4 },
  { key: "percent", label: "Percent (%)", suffix: "%", relativeTo: "parent", digits: 2 },
];

// Returns a positive number, or null when the font size is empty or invalid.
const parseFontSize = (valStr) => {
  const val = parseFloat(valStr);
  return Number.isFinite(val) && val > 0 ? val : null;
};

// Rounds to `digits` decimals and drops trailing zeros (1.0000 -> 1).
const formatNumber = (num, digits) => String(parseFloat(num.toFixed(digits)));

const CssUnitConverter = () => {
  const { dark } = useTheme();

  // Tab State
  const [activeTab, setActiveTab] = useState("converter"); // "converter" | "fluid"

  // Converter State
  const [baseFontSize, setBaseFontSize] = useState("16");
  const [parentFontSize, setParentFontSize] = useState("16");
  // The pixel value is the single source of truth; null means "no value".
  const [pxValue, setPxValue] = useState(16);
  // The field being typed in keeps its raw text so it is not reformatted mid-edit.
  const [editing, setEditing] = useState(null); // { unit, text } | null

  // Fluid Typography State
  const [fluidParams, setFluidParams] = useState({
    minFont: "16",
    maxFont: "48",
    minVw: "320",
    maxVw: "1200",
  });
  const [previewVw, setPreviewVw] = useState(768);

  // --- Helpers for Unit Converter ---
  const rootSize = parseFontSize(baseFontSize);
  const parentSize = parseFontSize(parentFontSize);

  // How many pixels one of the given unit is worth, or null if its
  // reference font size is invalid.
  const getPxPerUnit = (unit) => {
    if (unit.relativeTo === null) return 1;
    const reference = unit.relativeTo === "root" ? rootSize : parentSize;
    if (reference === null) return null;
    return unit.key === "percent" ? reference / 100 : reference;
  };

  const getDisplayValue = (unit) => {
    if (editing?.unit === unit.key) return editing.text;
    const pxPerUnit = getPxPerUnit(unit);
    if (pxValue === null || pxPerUnit === null) return "";
    return formatNumber(pxValue / pxPerUnit, unit.digits);
  };

  // --- Handlers for Unit Converter ---
  const handleUnitChange = (unit, valStr) => {
    setEditing({ unit: unit.key, text: valStr });
    const val = parseFloat(valStr);
    const pxPerUnit = getPxPerUnit(unit);
    setPxValue(isNaN(val) || pxPerUnit === null ? null : val * pxPerUnit);
  };

  // Changing a reference size keeps the pixel value and recalculates the rest.
  const handleBaseFontSizeChange = (valStr) => {
    setBaseFontSize(valStr);
    setEditing(null);
  };

  const handleParentFontSizeChange = (valStr) => {
    setParentFontSize(valStr);
    setEditing(null);
  };

  const handleCopyUnit = async (unit) => {
    const val = parseFloat(getDisplayValue(unit));
    if (isNaN(val)) {
      toast.error("Nothing to copy.");
      return;
    }
    const text = `${val}${unit.suffix}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${text} copied!`);
    } catch {
      toast.error("Failed to copy.");
    }
  };

  // --- Handlers for Fluid Typography ---
  const handleFluidChange = (e) => {
    const { name, value } = e.target;
    setFluidParams((prev) => ({ ...prev, [name]: value }));
  };

  const clampValue = useMemo(() => {
    const minFont = parseFloat(fluidParams.minFont) || 0;
    const maxFont = parseFloat(fluidParams.maxFont) || 0;
    const minVw = parseFloat(fluidParams.minVw) || 0;
    const maxVw = parseFloat(fluidParams.maxVw) || 0;
    const base = parseFloat(baseFontSize) || 16;

    if (!minFont || !maxFont || !minVw || !maxVw || maxVw <= minVw || maxFont <= minFont || base <= 0) {
      return "clamp(0rem, 0rem, 0rem)";
    }

    const minRem = minFont / base;
    const maxRem = maxFont / base;

    const slope = (maxFont - minFont) / (maxVw - minVw);
    const slopeVw = slope * 100;

    const intersection = (-1 * minVw * slope + minFont) / base;

    return `clamp(${minRem.toFixed(4)}rem, ${intersection.toFixed(4)}rem + ${slopeVw.toFixed(4)}vw, ${maxRem.toFixed(4)}rem)`;
  }, [fluidParams, baseFontSize]);

  const getSimulatedFontSize = useCallback(() => {
    const minFont = parseFloat(fluidParams.minFont) || 0;
    const maxFont = parseFloat(fluidParams.maxFont) || 0;
    const minVw = parseFloat(fluidParams.minVw) || 0;
    const maxVw = parseFloat(fluidParams.maxVw) || 0;

    if (minVw === maxVw || maxVw <= minVw) return `${minFont}px`;

    const slope = (maxFont - minFont) / (maxVw - minVw);
    const intersection = -1 * minVw * slope + minFont;

    const currentVal = intersection + slope * previewVw;
    const clampedVal = Math.max(minFont, Math.min(maxFont, currentVal));

    return `${clampedVal.toFixed(2)}px`;
  }, [fluidParams, previewVw]);

  const handleCopyClamp = () => {
    navigator.clipboard.writeText(`font-size: ${clampValue};`)
      .then(() => toast.success("Clamp function copied!"))
      .catch(() => toast.error("Failed to copy."));
  };

  // Class helpers
  const inputClass = `w-full px-4 py-3 rounded-2xl border text-sm font-mono outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
    dark
      ? "bg-zinc-950 border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:border-white focus:ring-1 focus:ring-white"
      : "bg-neutral-50 border-neutral-200 text-zinc-800 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
  }`;

  const labelClass = `text-xs font-black uppercase tracking-widest ${
    dark ? "text-zinc-400" : "text-neutral-500"
  }`;

  const hintClass = `mt-2 text-xs ${dark ? "text-zinc-500" : "text-neutral-500"}`;

  const copyButtonClass = `px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
    dark
      ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
      : "bg-neutral-100 border border-neutral-200 text-neutral-600 hover:bg-neutral-200 hover:text-black"
  }`;

  return (
    <div
      className={`min-h-[calc(100vh-76px)] md:h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto overflow-x-hidden md:overflow-hidden relative flex flex-col justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>CSS Unit & Fluid Typography — DevTasks</title>

      {/* Background glows */}
      <div
        className={`absolute top-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-30 transition-colors duration-500 ${
          dark ? "bg-zinc-800" : "bg-neutral-200"
        }`}
      />

      {/* Main card */}
      <div
        className={`relative z-10 w-full max-w-5xl md:mx-auto rounded-[32px] border shadow-xl flex flex-col max-h-full md:max-h-[85vh] overflow-hidden transition-all duration-300 ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        {/* Top accent bar */}
        <div
          className={`h-2 w-full transition-colors duration-500 ${
            dark ? "bg-white" : "bg-black"
          }`}
        />

        {/* Header */}
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full min-w-0">
          <div className="flex items-center gap-3">
            <Link
              to="/devutilities"
              className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${
                dark
                  ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                  : "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350"
              }`}
              title="Back to Workspace"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="flex flex-col min-w-0">
              <h1 className={`text-xl sm:text-2xl font-black tracking-tight truncate transition-colors duration-300 ${dark ? "text-white" : "text-black"}`}>
                CSS Unit & Fluid Typography
              </h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("converter")}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                activeTab === "converter"
                  ? dark ? "bg-white text-black" : "bg-black text-white"
                  : dark ? "bg-zinc-800 text-zinc-400" : "bg-neutral-200 text-neutral-600"
              }`}
            >
              Unit Converter
            </button>
            <button
              onClick={() => setActiveTab("fluid")}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                activeTab === "fluid"
                  ? dark ? "bg-white text-black" : "bg-black text-white"
                  : dark ? "bg-zinc-800 text-zinc-400" : "bg-neutral-200 text-neutral-600"
              }`}
            >
              Fluid Typography
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6">
          <div className="flex flex-col gap-6">

            {/* Font Size Configuration (root size is shared by both tabs) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="base-font-size" className={`${labelClass} mb-2 block`}>
                  Base Root Font Size (px)
                </label>
                <input
                  id="base-font-size"
                  type="number"
                  min="0"
                  value={baseFontSize}
                  onChange={(e) => handleBaseFontSizeChange(e.target.value)}
                  aria-invalid={rootSize === null}
                  className={inputClass}
                />
                {rootSize === null && (
                  <p role="alert" className="mt-2 text-xs text-red-500">
                    Enter a root font size greater than 0.
                  </p>
                )}
              </div>

              {activeTab === "converter" && (
                <div>
                  <label htmlFor="parent-font-size" className={`${labelClass} mb-2 block`}>
                    Parent Font Size (px)
                  </label>
                  <input
                    id="parent-font-size"
                    type="number"
                    min="0"
                    value={parentFontSize}
                    onChange={(e) => handleParentFontSizeChange(e.target.value)}
                    aria-invalid={parentSize === null}
                    className={inputClass}
                  />
                  {parentSize === null && (
                    <p role="alert" className="mt-2 text-xs text-red-500">
                      Enter a parent font size greater than 0.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* TAB: Unit Converter */}
            {activeTab === "converter" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {UNITS.map((unit) => {
                    const unavailable = getPxPerUnit(unit) === null;
                    const value = getDisplayValue(unit);
                    return (
                      <div key={unit.key}>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <label htmlFor={`unit-${unit.key}`} className={labelClass}>
                            {unit.label}
                          </label>
                          <button
                            type="button"
                            onClick={() => handleCopyUnit(unit)}
                            disabled={unavailable || isNaN(parseFloat(value))}
                            aria-label={`Copy ${unit.suffix} value`}
                            className={copyButtonClass}
                          >
                            Copy
                          </button>
                        </div>
                        <input
                          id={`unit-${unit.key}`}
                          type="number"
                          value={value}
                          onChange={(e) => handleUnitChange(unit, e.target.value)}
                          onBlur={() => setEditing(null)}
                          disabled={unavailable}
                          className={inputClass}
                        />
                      </div>
                    );
                  })}
                </div>
                <p className={hintClass}>
                  rem is relative to the root font size. em and % are relative to the parent
                  element&apos;s font size.
                </p>
              </>
            )}

            {/* TAB: Fluid Typography */}
            {activeTab === "fluid" && (
              <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className={`text-sm font-bold ${dark ? "text-white" : "text-black"}`}>Target Font Sizes (px)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`text-xs font-black uppercase tracking-widest ${dark ? "text-zinc-400" : "text-neutral-500"} mb-2 block`}>Min Size</label>
                        <input type="number" name="minFont" value={fluidParams.minFont} onChange={handleFluidChange} className={inputClass} />
                      </div>
                      <div>
                        <label className={`text-xs font-black uppercase tracking-widest ${dark ? "text-zinc-400" : "text-neutral-500"} mb-2 block`}>Max Size</label>
                        <input type="number" name="maxFont" value={fluidParams.maxFont} onChange={handleFluidChange} className={inputClass} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className={`text-sm font-bold ${dark ? "text-white" : "text-black"}`}>Viewport Boundaries (px)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`text-xs font-black uppercase tracking-widest ${dark ? "text-zinc-400" : "text-neutral-500"} mb-2 block`}>Min Viewport</label>
                        <input type="number" name="minVw" value={fluidParams.minVw} onChange={handleFluidChange} className={inputClass} />
                      </div>
                      <div>
                        <label className={`text-xs font-black uppercase tracking-widest ${dark ? "text-zinc-400" : "text-neutral-500"} mb-2 block`}>Max Viewport</label>
                        <input type="number" name="maxVw" value={fluidParams.maxVw} onChange={handleFluidChange} className={inputClass} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Output Clamp Code */}
                <div className={`p-6 rounded-2xl border ${dark ? "bg-zinc-950/50 border-zinc-800" : "bg-neutral-100 border-neutral-200"}`}>
                   <div className="flex justify-between items-center mb-4">
                       <span className={`text-xs font-black uppercase tracking-widest ${dark ? "text-zinc-400" : "text-neutral-500"}`}>Generated CSS</span>
                       <button onClick={handleCopyClamp} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${dark ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-white border text-black hover:bg-neutral-50"}`}>
                         Copy Clamp
                       </button>
                    </div>
                    <code className={`block font-mono text-sm p-4 rounded-xl ${dark ? "bg-black text-zinc-200" : "bg-white border"}`}>
                       font-size: {clampValue};
                    </code>
                </div>

                {/* Live Preview Slider */}
                <div className={`p-6 rounded-2xl border flex flex-col gap-4 ${dark ? "bg-zinc-950/50 border-zinc-800" : "bg-neutral-100 border-neutral-200"}`}>
                   <label className={`text-xs font-black uppercase tracking-widest ${dark ? "text-zinc-400" : "text-neutral-500"}`}>Live Preview (Drag Slider)</label>
                   <input
                     type="range"
                     min={(parseFloat(fluidParams.minVw) || 320) - 200}
                     max={(parseFloat(fluidParams.maxVw) || 1200) + 200}
                     value={previewVw}
                     onChange={(e) => setPreviewVw(parseFloat(e.target.value) || 0)}
                     className="w-full"
                   />
                   <div className="mt-4 border-t pt-4 border-dashed" style={{ borderColor: dark ? "#3f3f46" : "#d4d4d8" }}>
                     <p className={`mb-2 text-sm font-mono ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                       Simulated Viewport: {previewVw}px (Calculated Font Size: {getSimulatedFontSize()})
                     </p>
                     <div
                        className={`transition-all duration-75 font-semibold ${dark ? "text-white" : "text-black"}`}
                        style={{ fontSize: getSimulatedFontSize() }}
                     >
                       The quick brown fox jumps over the lazy dog.
                     </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CssUnitConverter;
