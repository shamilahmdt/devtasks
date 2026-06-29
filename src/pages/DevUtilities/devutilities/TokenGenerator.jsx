import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

// ─── Color math ──────────────────────────────────────────────────────────────

const hexToRgb = (hex) => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
};

const rgbToHex = (r, g, b) =>
  "#" +
  [r, g, b]
    .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0"))
    .join("");

const mixWithWhite = (r, g, b, factor) => ({
  r: r + (255 - r) * factor,
  g: g + (255 - g) * factor,
  b: b + (255 - b) * factor,
});

const mixWithBlack = (r, g, b, factor) => ({
  r: r * (1 - factor),
  g: g * (1 - factor),
  b: b * (1 - factor),
});

// Generates a 10-shade scale: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
const generateColorScale = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  const shades = {
    50:  mixWithWhite(r, g, b, 0.95),
    100: mixWithWhite(r, g, b, 0.88),
    200: mixWithWhite(r, g, b, 0.74),
    300: mixWithWhite(r, g, b, 0.58),
    400: mixWithWhite(r, g, b, 0.32),
    500: { r, g, b },
    600: mixWithBlack(r, g, b, 0.14),
    700: mixWithBlack(r, g, b, 0.28),
    800: mixWithBlack(r, g, b, 0.44),
    900: mixWithBlack(r, g, b, 0.62),
    950: mixWithBlack(r, g, b, 0.74),
  };
  return Object.fromEntries(
    Object.entries(shades).map(([k, { r, g, b }]) => [k, rgbToHex(r, g, b)])
  );
};

const getLuminance = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

// ─── Type scale math ─────────────────────────────────────────────────────────

const TYPE_RATIOS = [
  { label: "Minor Third", value: 1.2 },
  { label: "Major Third", value: 1.25 },
  { label: "Perfect Fourth", value: 1.333 },
  { label: "Golden Ratio", value: 1.618 },
];

const TYPE_STEPS = [
  { key: "xs",  step: -2 },
  { key: "sm",  step: -1 },
  { key: "base",step:  0 },
  { key: "lg",  step:  1 },
  { key: "xl",  step:  2 },
  { key: "2xl", step:  3 },
  { key: "3xl", step:  4 },
  { key: "4xl", step:  5 },
  { key: "5xl", step:  6 },
];

const generateTypeScale = (basePx, ratio) =>
  Object.fromEntries(
    TYPE_STEPS.map(({ key, step }) => {
      const px = basePx * Math.pow(ratio, step);
      return [key, +(px / 16).toFixed(4)]; // rem
    })
  );

// ─── Spacing scale ────────────────────────────────────────────────────────────

const SPACING_STEPS = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64];

const generateSpacingScale = (basePx) =>
  Object.fromEntries(
    SPACING_STEPS.map((step) => [
      step,
      step === 0 ? "0px" : `${+(step * basePx / 16).toFixed(4)}rem`,
    ])
  );

// ─── Export generators ────────────────────────────────────────────────────────

const generateCSS = (colors, type, spacing) => {
  const lines = [":root {"];
  Object.entries(colors).forEach(([shade, hex]) =>
    lines.push(`  --color-primary-${shade}: ${hex};`)
  );
  lines.push("");
  Object.entries(type).forEach(([key, rem]) =>
    lines.push(`  --text-${key}: ${rem}rem;`)
  );
  lines.push("");
  Object.entries(spacing).forEach(([step, val]) =>
    lines.push(`  --spacing-${step}: ${val};`)
  );
  lines.push("}");
  return lines.join("\n");
};

const generateTailwind = (colors, type, spacing) => {
  const colorObj = Object.entries(colors)
    .map(([k, v]) => `        '${k}': '${v}',`)
    .join("\n");
  const typeObj = Object.entries(type)
    .map(([k, v]) => `        '${k}': '${v}rem',`)
    .join("\n");
  const spacingObj = Object.entries(spacing)
    .map(([k, v]) => `        '${k}': '${v}',`)
    .join("\n");

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
${colorObj}
        },
      },
      fontSize: {
${typeObj}
      },
      spacing: {
${spacingObj}
      },
    },
  },
};`;
};

const generateSass = (colors, type, spacing) => {
  const lines = [];
  lines.push("// Primary Color Scale");
  Object.entries(colors).forEach(([k, v]) =>
    lines.push(`$color-primary-${k}: ${v};`)
  );
  lines.push("\n// Typography Scale");
  Object.entries(type).forEach(([k, v]) =>
    lines.push(`$text-${k}: ${v}rem;`)
  );
  lines.push("\n// Spacing Scale");
  Object.entries(spacing).forEach(([k, v]) =>
    lines.push(`$spacing-${k}: ${v};`)
  );
  return lines.join("\n");
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionLabel = ({ dark, children }) => (
  <p className={`text-xs font-black uppercase tracking-widest mb-3 ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
    {children}
  </p>
);

const CardWrap = ({ dark, children, className = "" }) => (
  <div
    className={`rounded-2xl border p-5 transition-colors ${className} ${
      dark ? "bg-zinc-800/60 border-zinc-700" : "bg-neutral-50 border-neutral-200"
    }`}
  >
    {children}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const EXPORT_TABS = ["CSS", "Tailwind", "Sass"];

const TokenGenerator = () => {
  const { dark } = useTheme();

  // Controls
  const [seedColor, setSeedColor] = useState("#6366f1");
  const [hexInput, setHexInput]   = useState("#6366f1");
  const [baseFontPx, setBaseFontPx]   = useState(16);
  const [typeRatioIdx, setTypeRatioIdx] = useState(1); // Major Third
  const [baseSpacingPx, setBaseSpacingPx] = useState(4);
  const [exportTab, setExportTab] = useState("CSS");
  const [copied, setCopied] = useState(false)

  // Derived scales
  const colorScale   = useMemo(() => generateColorScale(seedColor), [seedColor]);
  const typeScale    = useMemo(() => generateTypeScale(baseFontPx, TYPE_RATIOS[typeRatioIdx].value), [baseFontPx, typeRatioIdx]);
  const spacingScale = useMemo(() => generateSpacingScale(baseSpacingPx), [baseSpacingPx]);

  // Export code
  const exportCode = useMemo(() => {
    if (exportTab === "CSS")      return generateCSS(colorScale, typeScale, spacingScale);
    if (exportTab === "Tailwind") return generateTailwind(colorScale, typeScale, spacingScale);
    return generateSass(colorScale, typeScale, spacingScale);
  }, [exportTab, colorScale, typeScale, spacingScale]);

  const handleHexInput = (val) => {
    setHexInput(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) setSeedColor(val);
  };

  const handleColorPicker = (val) => {
    setSeedColor(val);
    setHexInput(val);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportCode);
      toast.success("Copied to clipboard");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  // Shared styles
  const labelCls = `text-xs font-black uppercase tracking-widest ${dark ? "text-zinc-400" : "text-zinc-500"}`;
  const inputCls = `w-full px-3 py-2 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors ${
    dark
      ? "bg-zinc-950 border-zinc-700 text-zinc-200"
      : "bg-white border-neutral-200 text-zinc-800"
  }`;
  const smallBtnCls = `px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
    dark
      ? "bg-white text-black hover:bg-zinc-200"
      : "bg-black text-white hover:bg-zinc-800"
  }`;

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 font-sans antialiased transition-colors duration-300 overflow-x-hidden ${
        dark ? "bg-zinc-950" : "bg-[#FDFDFD]"
      }`}
    >
      <title>Design Token Generator | DevTasks</title>
      <meta name="description" content="Client-side design system token and Tailwind config generator." />

      <div
        className={`w-full max-w-6xl md:mx-auto rounded-3xl sm:rounded-4xl shadow-lg p-4 sm:p-8 border transition-colors duration-300 ${
          dark ? "bg-zinc-900 border-zinc-700" : "bg-white border-neutral-100"
        }`}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-8">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1
            className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${
              dark ? "text-white" : "text-black"
            }`}
          >
            Design Token Generator
          </h1>
        </div>

        {/* ── Two-column layout: Controls left, Previews right ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">

          {/* ══ LEFT COLUMN: Controls ══ */}
          <div className="flex flex-col gap-6">

            {/* Color Seed */}
            <CardWrap dark={dark}>
              <SectionLabel dark={dark}>Primary Color Seed</SectionLabel>
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <input
                    type="color"
                    value={seedColor}
                    onChange={(e) => handleColorPicker(e.target.value)}
                    className="w-12 h-12 rounded-xl border-2 cursor-pointer appearance-none p-0.5 bg-transparent"
                    style={{ borderColor: dark ? "#3f3f46" : "#e5e5e5" }}
                    title="Pick seed color"
                  />
                </div>
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => handleHexInput(e.target.value)}
                  maxLength={7}
                  className={`${inputCls} uppercase`}
                  placeholder="#6366f1"
                  spellCheck={false}
                />
              </div>
              {/* Mini swatch strip preview */}
              <div className="flex gap-1 mt-4 rounded-xl overflow-hidden">
                {Object.entries(colorScale).map(([shade, hex]) => (
                  <div
                    key={shade}
                    title={`${shade}: ${hex}`}
                    className="flex-1 h-7 cursor-default transition-transform hover:scale-y-110 origin-bottom"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className={`text-[10px] ${dark ? "text-zinc-600" : "text-zinc-400"}`}>50</span>
                <span className={`text-[10px] ${dark ? "text-zinc-600" : "text-zinc-400"}`}>950</span>
              </div>
            </CardWrap>

            {/* Typography Scale */}
            <CardWrap dark={dark}>
              <SectionLabel dark={dark}>Typography Scale</SectionLabel>

              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className={labelCls}>Base size</label>
                    <span className={`text-xs font-mono font-bold ${dark ? "text-zinc-300" : "text-zinc-700"}`}>
                      {baseFontPx}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={12} max={24} step={1}
                    value={baseFontPx}
                    onChange={(e) => setBaseFontPx(Number(e.target.value))}
                    className="w-full accent-current cursor-pointer"
                  />
                  <div className="flex justify-between mt-0.5">
                    <span className={`text-[10px] ${dark ? "text-zinc-600" : "text-zinc-400"}`}>12px</span>
                    <span className={`text-[10px] ${dark ? "text-zinc-600" : "text-zinc-400"}`}>24px</span>
                  </div>
                </div>

                <div>
                  <label className={`${labelCls} block mb-2`}>Scale ratio</label>
                  <div className={`flex flex-wrap gap-1.5 p-1 border rounded-2xl ${
                    dark ? "border-zinc-700 bg-zinc-800" : "border-neutral-200 bg-neutral-100"
                  }`}>
                    {TYPE_RATIOS.map((r, i) => (
                      <button
                        key={r.label}
                        type="button"
                        onClick={() => setTypeRatioIdx(i)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all duration-200 ${
                          typeRatioIdx === i
                            ? dark ? "bg-white text-black" : "bg-black text-white"
                            : dark ? "text-neutral-400 hover:text-white" : "text-neutral-400 hover:text-black"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardWrap>

            {/* Spacing Scale */}
            <CardWrap dark={dark}>
              <SectionLabel dark={dark}>Spacing Scale</SectionLabel>
              <div className="flex justify-between items-center mb-1">
                <label className={labelCls}>Base unit</label>
                <span className={`text-xs font-mono font-bold ${dark ? "text-zinc-300" : "text-zinc-700"}`}>
                  {baseSpacingPx}px
                </span>
              </div>
              <input
                type="range"
                min={2} max={8} step={1}
                value={baseSpacingPx}
                onChange={(e) => setBaseSpacingPx(Number(e.target.value))}
                className="w-full accent-current cursor-pointer"
              />
              <div className="flex justify-between mt-0.5 mb-4">
                <span className={`text-[10px] ${dark ? "text-zinc-600" : "text-zinc-400"}`}>2px</span>
                <span className={`text-[10px] ${dark ? "text-zinc-600" : "text-zinc-400"}`}>8px</span>
              </div>
              {/* Spacing visual strip */}
              <div className="flex items-end gap-1 h-12">
                {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((step) => {
                  const heightPx = Math.min(step * baseSpacingPx * 0.9, 48);
                  return (
                    <div
                      key={step}
                      title={`${step}: ${+(step * baseSpacingPx / 16).toFixed(3)}rem`}
                      className="flex-1 rounded-t-sm transition-all duration-200"
                      style={{
                        height: `${heightPx}px`,
                        backgroundColor: seedColor,
                        opacity: 0.7 + step * 0.03,
                      }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-1">
                <span className={`text-[10px] ${dark ? "text-zinc-600" : "text-zinc-400"}`}>1</span>
                <span className={`text-[10px] ${dark ? "text-zinc-600" : "text-zinc-400"}`}>16</span>
              </div>
            </CardWrap>
          </div>

          {/* ══ RIGHT COLUMN: Previews ══ */}
          <div className="flex flex-col gap-6">

            {/* Color Swatch Grid */}
            <CardWrap dark={dark}>
              <SectionLabel dark={dark}>Color Scale Preview</SectionLabel>
              <div className="flex flex-col gap-1.5">
                {Object.entries(colorScale).map(([shade, hex]) => {
                  const lum = getLuminance(hex);
                  const textColor = lum > 0.55 ? "#18181b" : "#fafafa";
                  return (
                    <div
                      key={shade}
                      className="flex items-center justify-between px-3 py-2 rounded-xl transition-all"
                      style={{ backgroundColor: hex }}
                    >
                      <span className="text-xs font-black uppercase tracking-widest" style={{ color: textColor }}>
                        {shade}
                      </span>
                      <span className="text-xs font-mono" style={{ color: textColor }}>
                        {hex.toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardWrap>

            {/* Typography Preview */}
            <CardWrap dark={dark}>
              <SectionLabel dark={dark}>Type Scale Preview</SectionLabel>
              <div className="flex flex-col gap-2 overflow-hidden">
                {[...TYPE_STEPS].reverse().map(({ key }) => {
                  const remVal = typeScale[key];
                  return (
                    <div key={key} className="flex items-baseline gap-3">
                      <span className={`text-[10px] font-black uppercase tracking-widest w-8 shrink-0 ${dark ? "text-zinc-600" : "text-zinc-400"}`}>
                        {key}
                      </span>
                      <span
                        className={`font-bold leading-tight truncate ${dark ? "text-white" : "text-black"}`}
                        style={{ fontSize: `${remVal}rem` }}
                      >
                        Aa
                      </span>
                      <span className={`text-[10px] font-mono ml-auto shrink-0 ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                        {remVal.toFixed(3)}rem
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardWrap>
          </div>
        </div>

        {/* ── Export Panel ── */}
        <div
          className={`rounded-2xl border transition-colors ${
            dark ? "bg-zinc-800/60 border-zinc-700" : "bg-neutral-50 border-neutral-200"
          }`}
        >
          {/* Tab bar + Copy button */}
          <div className={`flex items-center justify-between px-5 pt-4 pb-3 border-b ${dark ? "border-zinc-700" : "border-neutral-200"}`}>
            <div className={`flex items-center gap-1 p-1 border rounded-2xl ${
              dark ? "border-zinc-700 bg-zinc-800" : "border-neutral-200 bg-neutral-100"
            }`}>
              {EXPORT_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setExportTab(tab)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                    exportTab === tab
                      ? dark ? "bg-white text-black" : "bg-black text-white"
                      : dark ? "text-neutral-400 hover:text-white" : "text-neutral-400 hover:text-black"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button type="button" onClick={handleCopy} className={smallBtnCls}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Code output */}
          <pre
            className={`p-5 text-xs font-mono leading-relaxed overflow-x-auto max-h-72 ${
              dark ? "text-zinc-300" : "text-zinc-700"
            }`}
          >
            {exportCode}
          </pre>

          <div className={`px-5 pb-4 text-[10px] font-medium ${dark ? "text-zinc-600" : "text-zinc-400"}`}>
            ✓ Generated client-side — no data leaves your browser
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenGenerator;