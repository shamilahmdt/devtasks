import React, { useMemo, useState, useCallback } from "react";
import { useTheme } from "../../../context/ThemeContext";

/**
 * SVG Wave & Shape Divider Generator
 * -----------------------------------
 * Offline, client-side utility that lets a user design an SVG section
 * divider (wave / curve / triangle / steps / jagged) and export it as
 * raw SVG, an HTML/CSS snippet, or a downloadable .svg file.
 */

const VIEW_WIDTH = 1200;

const DIVIDER_TYPES = [
  { id: "wave", label: "Waves" },
  { id: "curve", label: "Smooth Curve" },
  { id: "triangle", label: "Triangle Spikes" },
  { id: "steps", label: "Steps" },
  { id: "jagged", label: "Jagged Peaks" },
];

/* ---------------------------------------------------------------------- */
/*  Path generators — each returns an SVG "d" attribute string            */
/*  drawn inside a 0,0 -> VIEW_WIDTH,height box.                          */
/* ---------------------------------------------------------------------- */

function wavePath(width, height, peaks, asymmetric) {
  const segW = width / peaks;
  const mid = height / 2;
  let d = `M0,${mid}`;
  for (let i = 0; i < peaks; i++) {
    const x0 = i * segW;
    const x1 = x0 + segW;
    const goingUp = i % 2 === 0;
    const targetY = goingUp ? 0 : height;
    const cpBias = asymmetric ? 0.75 : 0.5;
    const cp1x = x0 + segW * cpBias * 0.6;
    const cp2x = x1 - segW * (1 - cpBias) * 0.6;
    d += ` C${cp1x.toFixed(2)},${targetY} ${cp2x.toFixed(2)},${targetY} ${x1.toFixed(2)},${mid}`;
  }
  d += ` L${width},${height} L0,${height} Z`;
  return d;
}

function curvePath(width, height, _peaks, asymmetric) {
  const cpX = asymmetric ? width * 0.7 : width / 2;
  const cpY = asymmetric ? -height * 0.2 : -height * 0.4;
  return `M0,${height * 0.5} Q${cpX},${cpY} ${width},${height * 0.5} L${width},${height} L0,${height} Z`;
}

function trianglePath(width, height, peaks, asymmetric) {
  const segW = width / peaks;
  let d = `M0,${height}`;
  for (let i = 0; i < peaks; i++) {
    const x0 = i * segW;
    const x1 = x0 + segW;
    const peakX = asymmetric ? x0 + segW * 0.7 : x0 + segW / 2;
    d += ` L${peakX.toFixed(2)},0 L${x1.toFixed(2)},${height}`;
  }
  d += " Z";
  return d;
}

function stepsPath(width, height, peaks) {
  const segW = width / peaks;
  let d = `M0,${height}`;
  for (let i = 0; i < peaks; i++) {
    const x0 = i * segW;
    const xm = x0 + segW / 2;
    const x1 = x0 + segW;
    d += ` L${x0.toFixed(2)},0 L${xm.toFixed(2)},0 L${xm.toFixed(2)},${height} L${x1.toFixed(2)},${height}`;
  }
  d += " Z";
  return d;
}

function jaggedPath(width, height, peaks, asymmetric) {
  const segW = width / peaks;
  let d = `M0,${height}`;
  for (let i = 0; i < peaks; i++) {
    const x0 = i * segW;
    const x1 = x0 + segW;
    const shift = asymmetric ? (i % 2 === 0 ? segW * 0.2 : -segW * 0.2) : 0;
    const peakX = x0 + segW / 2 + shift;
    const peakY = i % 2 === 0 ? 0 : height * 0.35;
    d += ` L${peakX.toFixed(2)},${peakY.toFixed(2)} L${x1.toFixed(2)},${height}`;
  }
  d += " Z";
  return d;
}

const PATH_BUILDERS = {
  wave: wavePath,
  curve: curvePath,
  triangle: trianglePath,
  steps: stepsPath,
  jagged: jaggedPath,
};

function buildPathD(type, height, peaks, asymmetric) {
  const builder = PATH_BUILDERS[type] || wavePath;
  return builder(VIEW_WIDTH, height, peaks, asymmetric);
}

function buildTransform(flip, invert, height) {
  const parts = [];
  if (flip) parts.push(`translate(${VIEW_WIDTH},0) scale(-1,1)`);
  if (invert) parts.push(`translate(0,${height}) scale(1,-1)`);
  return parts.length ? parts.join(" ") : undefined;
}

function buildSvgMarkup({ pathD, transform, height, color }) {
  const groupOpen = transform ? `<g transform="${transform}">` : "<g>";
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_WIDTH} ${height}" preserveAspectRatio="none" class="shape-divider">`,
    `  ${groupOpen}`,
    `    <path d="${pathD}" fill="${color}"></path>`,
    `  </g>`,
    `</svg>`,
  ].join("\n");
}

function buildHtmlSnippet(svgMarkup, height) {
  const indentedSvg = svgMarkup
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n");
  return [
    `<div class="shape-divider-wrapper" style="position: relative; overflow: hidden; line-height: 0;">`,
    `  <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: ${height}px;">`,
    indentedSvg,
    `  </div>`,
    `</div>`,
    ``,
    `<style>`,
    `  .shape-divider-wrapper .shape-divider {`,
    `    width: 100%;`,
    `    height: 100%;`,
    `    display: block;`,
    `  }`,
    `</style>`,
  ].join("\n");
}

function downloadFile(filename, content, mime = "image/svg+xml") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ShapeDividerGenerator() {
  const { dark } = useTheme();

  const theme = {
    light: {
      heading: "text-slate-800",
      subtext: "text-slate-500",
      panel: "bg-white border-slate-200",
      label: "text-slate-700",
      muted: "text-slate-400",
      typeActive: "bg-black border-black text-white",
      typeInactive:
        "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100",
      codeBg: "bg-slate-50",
      tabActive: "border-black text-black",
      tabInactive: "text-slate-500 hover:text-slate-700",
      copyBtn: "bg-slate-800 text-white hover:bg-slate-700",
      downloadBtn: "bg-black text-white hover:bg-zinc-800",
      accent: "accent-black",
    },
    dark: {
      heading: "text-white",
      subtext: "text-zinc-400",
      panel: "bg-zinc-900 border-zinc-800",
      label: "text-zinc-300",
      muted: "text-zinc-500",
      typeActive: "bg-white border-white text-black",
      typeInactive:
        "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700",
      codeBg: "bg-zinc-950",
      tabActive: "border-white text-white",
      tabInactive: "text-zinc-500 hover:text-zinc-300",
      copyBtn: "bg-zinc-200 text-black hover:bg-zinc-300",
      downloadBtn: "bg-white text-black hover:bg-zinc-200",
      accent: "accent-white",
    },
  };
  const c = dark ? theme.dark : theme.light;

  const [type, setType] = useState("wave");
  const [height, setHeight] = useState(120);
  const [peaks, setPeaks] = useState(3);
  const [flip, setFlip] = useState(false);
  const [invert, setInvert] = useState(false);
  const [asymmetric, setAsymmetric] = useState(false);
  const [color, setColor] = useState("#18181b");
  const [bgColor, setBgColor] = useState("#f8fafc");
  const [activeTab, setActiveTab] = useState("svg");
  const [copied, setCopied] = useState(false);

  const pathD = useMemo(
    () => buildPathD(type, height, peaks, asymmetric),
    [type, height, peaks, asymmetric]
  );

  const transform = useMemo(
    () => buildTransform(flip, invert, height),
    [flip, invert, height]
  );

  const svgMarkup = useMemo(
    () => buildSvgMarkup({ pathD, transform, height, color }),
    [pathD, transform, height, color]
  );

  const htmlSnippet = useMemo(
    () => buildHtmlSnippet(svgMarkup, height),
    [svgMarkup, height]
  );

  const handleCopy = useCallback(
    async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch (err) {
        console.error("Copy failed", err);
      }
    },
    []
  );

  const handleDownload = useCallback(() => {
    downloadFile(`${type}-divider.svg`, svgMarkup);
  }, [type, svgMarkup]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${c.heading}`}>
          SVG Wave &amp; Shape Divider Generator
        </h1>
        <p className={`mt-1 ${c.subtext}`}>
          Design organic SVG section dividers and curves visually, then copy
          or download the code — 100% offline.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* ---------------------------- Controls ---------------------------- */}
        <div className={`border rounded-xl p-4 space-y-5 h-fit ${c.panel}`}>
          <div>
            <label className={`block text-sm font-semibold mb-2 ${c.label}`}>
              Divider Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DIVIDER_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`text-sm px-3 py-2 rounded-lg border transition-colors ${
                    type === t.id ? c.typeActive : c.typeInactive
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`flex justify-between text-sm font-semibold mb-1 ${c.label}`}>
              <span>Divider Height</span>
              <span className={`font-normal ${c.muted}`}>{height}px</span>
            </label>
            <input
              type="range"
              min={20}
              max={300}
              step={2}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className={`w-full ${c.accent}`}
            />
          </div>

          <div>
            <label className={`flex justify-between text-sm font-semibold mb-1 ${c.label}`}>
              <span>Number of Waves / Peaks</span>
              <span className={`font-normal ${c.muted}`}>{peaks}</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={peaks}
              onChange={(e) => setPeaks(Number(e.target.value))}
              className={`w-full ${c.accent}`}
              disabled={type === "curve"}
            />
          </div>

          <div className="space-y-2">
            <label className={`flex items-center gap-2 text-sm ${c.label}`}>
              <input
                type="checkbox"
                checked={flip}
                onChange={(e) => setFlip(e.target.checked)}
                className={c.accent}
              />
              Flip (left ↔ right)
            </label>
            <label className={`flex items-center gap-2 text-sm ${c.label}`}>
              <input
                type="checkbox"
                checked={invert}
                onChange={(e) => setInvert(e.target.checked)}
                className={c.accent}
              />
              Invert (top ↕ bottom)
            </label>
            <label className={`flex items-center gap-2 text-sm ${c.label}`}>
              <input
                type="checkbox"
                checked={asymmetric}
                onChange={(e) => setAsymmetric(e.target.checked)}
                className={c.accent}
              />
              Asymmetrical
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-sm font-semibold mb-1 ${c.label}`}>
                Divider Color
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className={`w-full h-9 rounded-md border cursor-pointer ${c.panel}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-1 ${c.label}`}>
                Canvas Color
              </label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className={`w-full h-9 rounded-md border cursor-pointer ${c.panel}`}
              />
            </div>
          </div>
        </div>

        {/* ------------------------- Preview & Export ------------------------ */}
        <div className="space-y-4">
          <div
            className={`relative rounded-xl overflow-hidden border ${
              dark ? "border-zinc-800" : "border-slate-200"
            }`}
            style={{ backgroundColor: bgColor }}
          >
            <div className={`h-40 flex items-center justify-center text-sm ${c.muted}`}>
              Section A
            </div>
            <div
              className="relative w-full"
              style={{ height: `${Math.min(height, 260)}px` }}
            >
              <svg
                viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full"
              >
                <g transform={transform}>
                  <path d={pathD} fill={color} />
                </g>
              </svg>
            </div>
            <div
              className="h-40 flex items-center justify-center text-sm text-white"
              style={{ backgroundColor: color }}
            >
              Section B
            </div>
          </div>

          <div className={`border rounded-xl overflow-hidden ${c.panel}`}>
            <div className={`flex border-b ${dark ? "border-zinc-800" : "border-slate-200"}`}>
              {[
                { id: "svg", label: "Copy SVG" },
                { id: "html", label: "HTML / CSS" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id ? c.tabActive : `border-transparent ${c.tabInactive}`
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <pre className={`text-xs p-4 overflow-x-auto max-h-64 whitespace-pre-wrap break-all ${c.codeBg} ${c.label}`}>
              {activeTab === "svg" ? svgMarkup : htmlSnippet}
            </pre>

            <div className={`flex flex-wrap gap-2 p-4 border-t ${dark ? "border-zinc-800" : "border-slate-200"}`}>
              <button
                type="button"
                onClick={() =>
                  handleCopy(activeTab === "svg" ? svgMarkup : htmlSnippet)
                }
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${c.copyBtn}`}
              >
                {copied ? "Copied!" : "Copy Code"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${c.downloadBtn}`}
              >
                Download SVG
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}