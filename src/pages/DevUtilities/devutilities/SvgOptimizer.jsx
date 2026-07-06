import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  FaCopy,
  FaDownload,
  FaTrash,
  FaFileCode,
  FaEye,
  FaCheck,
  FaReact,
} from "react-icons/fa";

// -----------------------------
// SVG → React JSX converter
// -----------------------------
const HTML_TO_REACT_ATTRS = {
  class: "className",
  for: "htmlFor",
  tabindex: "tabIndex",
  readonly: "readOnly",
  maxlength: "maxLength",
  cellspacing: "cellSpacing",
  cellpadding: "cellPadding",
  rowspan: "rowSpan",
  colspan: "colSpan",
  enctype: "encType",
  contenteditable: "contentEditable",
  crossorigin: "crossOrigin",
  accesskey: "accessKey",
  autocomplete: "autoComplete",
  autofocus: "autoFocus",
  autoplay: "autoPlay",
  formaction: "formAction",
  novalidate: "noValidate",
};

function hyphenToCamel(name) {
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function cssValueToJs(value) {
  const trimmed = value.trim();
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return parseFloat(trimmed);
  }
  if (/^-?\d+(\.\d+)?px$/.test(trimmed)) {
    return parseFloat(trimmed);
  }
  return `"${trimmed}"`;
}

function convertInlineStyle(styleStr) {
  const pairs = styleStr
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  const entries = pairs.map((pair) => {
    const colonIdx = pair.indexOf(":");
    if (colonIdx === -1) return null;
    const prop = pair.slice(0, colonIdx).trim();
    const val = pair.slice(colonIdx + 1).trim();
    return `${hyphenToCamel(prop)}: ${cssValueToJs(val)}`;
  });

  return `{{ ${entries.filter(Boolean).join(", ")} }}`;
}

function svgToJsx(svg, { stripDimensions = false } = {}) {
  let result = svg;

  result = result.replace(/\bstyle="([^"]*)"/g, (_, styleVal) => {
    return `style=${convertInlineStyle(styleVal)}`;
  });

  if (stripDimensions) {
    result = result.replace(/\s(width|height)="[^"]*"/g, "");
  }

  result = result.replace(/<[^>]+>/g, (tag) => {
    for (const [html, react] of Object.entries(HTML_TO_REACT_ATTRS)) {
      const regex = new RegExp(`\\b${html}=`, "g");
      tag = tag.replace(regex, `${react}=`);
    }
    tag = tag.replace(/\s([a-z]+-[a-z][-a-z]*)(?==)/g, (match, attr) => {
      if (attr.startsWith("data-") || attr.startsWith("aria-")) return match;
      return ` ${hyphenToCamel(attr)}`;
    });
    return tag;
  });

  return result;
}

function wrapInComponent(
  jsxSvg,
  { componentName, useTypescript, useForwardRef },
) {
  const name = componentName || "SvgIcon";
  const trimmedSvg = jsxSvg.trim();

  const injectProps = (svg, includeRef) => {
    return svg.replace(
      /^<svg/,
      includeRef ? "<svg ref={ref} {...props}" : "<svg {...props}"
    );
  };

  const svgWithProps = injectProps(trimmedSvg, useForwardRef);

  const imports = [];
  const lines = [];

  if (useForwardRef && useTypescript) {
    imports.push("import { forwardRef, SVGProps } from 'react';");
    lines.push("");
    lines.push(
      `export const ${name} = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (`
    );
    lines.push(`  ${svgWithProps}`);
    lines.push("));");
  } else if (useForwardRef) {
    imports.push("import { forwardRef } from 'react';");
    lines.push("");
    lines.push(`export const ${name} = forwardRef((props, ref) => (`);
    lines.push(`  ${svgWithProps}`);
    lines.push("));");
  } else if (useTypescript) {
    imports.push("import { SVGProps } from 'react';");
    lines.push("");
    lines.push(
      `export const ${name} = (props: SVGProps<SVGSVGElement>) => (`
    );
    lines.push(`  ${svgWithProps}`);
    lines.push(");");
  } else {
    lines.push(`export const ${name} = (props) => (`);
    lines.push(`  ${svgWithProps}`);
    lines.push(");");
  }

  return [...imports, ...lines].join("\n");
}

function SvgOptimizer() {
  const { dark } = useTheme();

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [previewBg, setPreviewBg] = useState("checker");
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "image/svg+xml" || file.name.endsWith(".svg"))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInput(event.target.result);
        toast.success(`Loaded SVG file: ${file.name}`);
      };
      reader.readAsText(file);
    } else {
      toast.error("Please drop a valid SVG file");
    }
  };

  const [options, setOptions] = useState({
    xml: true,
    comments: true,
    metadata: true,
    minify: true,
    beautify: false,
  });

  // React export options
  const [reactExport, setReactExport] = useState(false);
  const [tsxMode, setTsxMode] = useState(false);
  const [useForwardRef, setUseForwardRef] = useState(false);
  const [stripDimensions, setStripDimensions] = useState(false);
  const [componentName, setComponentName] = useState("SvgIcon");

  // Auto-optimize whenever input or options change
  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    let result = input;

    // XML declaration
    if (options.xml) {
      result = result.replace(/<\?xml[\s\S]*?\?>/g, "");
    }

    // Comments
    if (options.comments) {
      result = result.replace(/<!--[\s\S]*?-->/g, "");
    }

    // Metadata + editor junk
    if (options.metadata) {
      result = result
        .replace(/<metadata[\s\S]*?<\/metadata>/g, "")
        .replace(/\s(id|class|sketch:[a-zA-Z-]+)="[^"]*"/g, "");
    }

    // Minify
    if (options.minify) {
      result = result.replace(/\s+/g, " ").trim();
    }

    // Beautify (basic layout structure formatting)
    if (options.beautify) {
      result = result.replace(/>\s*</g, ">\n<").trim();
    }

    setOutput(result);
  }, [input, options]);

  const handleSample = () => {
    setInput(`<?xml version="1.0" encoding="UTF-8"?>
<!-- Figma Export / Custom SVG Graphic -->
<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <metadata>editor:figma;version:1.0;</metadata>
  <rect width="100" height="100" rx="20" fill="#3B82F6"/>
  <circle cx="50" cy="50" r="25" fill="white" class="main-circle" style="stroke: #1E3A8A; stroke-width: 4px; opacity: 0.9;"/>
  <!-- Decorative elements -->
  <path d="M45 45L55 55" stroke="#3B82F6" stroke-width="6" stroke-linecap="round"/>
</svg>`);
    toast.success("Sample SVG loaded");
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    toast.success("Cleared workspace");
  };

  const getOutputText = () => {
    if (!output) return "";
    if (!reactExport) return output;

    const jsx = svgToJsx(output, { stripDimensions });
    return wrapInComponent(jsx, {
      componentName,
      useTypescript: tsxMode,
      useForwardRef,
    });
  };

  const displayOutput = getOutputText();

  const handleCopy = async () => {
    if (!displayOutput) return;
    try {
      await navigator.clipboard.writeText(displayOutput);
      toast.success(
        reactExport ? "React Component copied!" : "Optimized SVG copied!"
      );
    } catch {
      toast.error("Failed to copy text");
    }
  };

  const handleDownload = () => {
    if (!displayOutput) return;

    if (reactExport) {
      const ext = tsxMode ? "tsx" : "jsx";
      const fileName = `${componentName || "SvgIcon"}.${ext}`;
      const blob = new Blob([displayOutput], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${fileName}`);
    } else {
      const blob = new Blob([displayOutput], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "optimized.svg";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Downloaded optimized.svg");
    }
  };

  const toggleOption = (key) => {
    setOptions((prev) => {
      const newOpts = { ...prev, [key]: !prev[key] };
      // Mutual exclusion for minify and beautify
      if (key === "minify" && newOpts.minify) {
        newOpts.beautify = false;
      }
      if (key === "beautify" && newOpts.beautify) {
        newOpts.minify = false;
      }
      return newOpts;
    });
  };

  // Calculations for size statistics
  const originalSize = input ? new Blob([input]).size : 0;
  const optimizedSize = output ? new Blob([output]).size : 0;
  const savingsPercent =
    originalSize > 0
      ? (((originalSize - optimizedSize) / originalSize) * 100).toFixed(1)
      : 0;

  const formatSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      heading: "text-zinc-900",
      subtext: "text-zinc-500",
      card: "bg-white border-zinc-200/85 shadow-sm",
      input:
        "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 focus:outline-none",
      buttonPrimary:
        "bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-sm",
      buttonSecondary:
        "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-colors",
      label: "text-zinc-500 font-semibold tracking-wider text-xs uppercase",
      infoCard: "bg-zinc-50/55 border-zinc-150/85 text-zinc-600",
      badge: "bg-zinc-100 text-zinc-700",
      toggleActive: "bg-zinc-900 text-white border-zinc-950",
      toggleInactive:
        "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      heading: "text-zinc-100",
      subtext: "text-zinc-400",
      card: "bg-zinc-900/50 border-zinc-800/85 backdrop-blur-md shadow-lg",
      input:
        "bg-zinc-950/70 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-zinc-600 focus:ring-2 focus:ring-white/5 focus:outline-none",
      buttonPrimary:
        "bg-white text-zinc-950 hover:bg-zinc-200 transition-colors shadow-sm",
      buttonSecondary:
        "bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white transition-colors",
      label: "text-zinc-400 font-semibold tracking-wider text-xs uppercase",
      infoCard: "bg-zinc-900/40 border-zinc-800/60 text-zinc-400",
      badge: "bg-zinc-800/50 text-zinc-300",
      toggleActive: "bg-white text-zinc-950 border-white",
      toggleInactive:
        "bg-zinc-950/40 text-zinc-400 border-zinc-800 hover:bg-zinc-900",
    },
  };

  const t = dark ? theme.dark : theme.light;

  return (
    <div
      className={`min-h-screen ${t.wrapper} px-4 sm:px-6 py-10 transition-colors duration-300 relative overflow-x-hidden`}
    >
      <title>SVG Optimizer & React JSX Generator — DevTasks</title>
      <meta
        name="description"
        content="Optimize, clean, and convert SVG code into optimized React JSX/TSX components instantly."
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${
              dark
                ? "bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700"
                : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-350"
            }`}
            title="Back to Workspace"
          >
            <svg
              className="w-4.5 h-4.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${t.heading}`}>
              SVG Optimizer & React JSX Generator
            </h1>
            <p className={`mt-1 text-sm ${t.subtext}`}>
              Optimize, clean, and convert SVG code into optimized React
              JSX/TSX components instantly.
            </p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Code input, options (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Input card */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-3xl border ${t.card} p-6 sm:p-8 space-y-6 relative overflow-hidden transition-all duration-200 ${
                isDragging ? "ring-2 ring-blue-500 scale-[1.01]" : ""
              }`}
            >
              {isDragging && (
                <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm flex flex-col items-center justify-center border-2 border-dashed border-blue-500 rounded-3xl z-30 pointer-events-none">
                  <FaFileCode className="text-blue-500 text-4xl animate-bounce mb-2" />
                  <span className="text-sm font-bold uppercase tracking-wider text-blue-500">
                    Drop SVG File Here
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <FaFileCode className="text-zinc-500 w-4.5 h-4.5" />
                  <h2
                    className={`font-bold text-lg tracking-tight ${t.heading}`}
                  >
                    SVG Input Source
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSample}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer ${t.buttonSecondary}`}
                  >
                    Sample SVG
                  </button>
                  <button
                    onClick={handleClear}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer ${t.buttonSecondary}`}
                  >
                    <FaTrash className="inline mr-1" /> Clear
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                <textarea
                  rows={12}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste raw SVG tag here (<svg>...</svg>)..."
                  className={`w-full p-4 rounded-2xl border transition-all duration-200 text-xs font-mono leading-relaxed ${t.input}`}
                />
                <button
                  onClick={() => {
                    if (!input.trim()) {
                      toast.error("Please enter SVG input source first");
                      return;
                    }
                    toast.success(
                      reactExport
                        ? `Successfully generated React Component "${componentName}"!`
                        : "Successfully optimized SVG code!"
                    );
                  }}
                  className={`w-full py-3.5 px-6 rounded-2xl font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-sm shadow-md ${
                    dark
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white"
                      : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                  } active:scale-[0.98]`}
                >
                  <FaFileCode className="text-base" />
                  {reactExport ? "Generate React Component" : "Optimize SVG Code"}
                </button>
              </div>

              {/* Optimization statistics badge */}
              {originalSize > 0 && (
                <div
                  className={`grid grid-cols-3 gap-4 p-4 rounded-2xl border text-center ${t.infoCard}`}
                >
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                      Original Size
                    </div>
                    <div className="text-sm font-black mt-0.5">
                      {formatSize(originalSize)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                      Optimized Size
                    </div>
                    <div className="text-sm font-black mt-0.5 text-emerald-500">
                      {formatSize(optimizedSize)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                      Savings
                    </div>
                    <div className="text-sm font-black mt-0.5 text-blue-500">
                      {savingsPercent > 0 ? `${savingsPercent}%` : "0%"}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Config & Settings Card */}
            <div className={`rounded-3xl border ${t.card} p-6 sm:p-8 space-y-6`}>
              <h3 className={`font-bold text-base tracking-tight ${t.heading}`}>
                Optimization Settings
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  ["xml", "Remove XML Declaration"],
                  ["comments", "Remove XML Comments"],
                  ["metadata", "Remove Editor Metadata"],
                  ["minify", "Minify Code"],
                  ["beautify", "Beautify Layout"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => toggleOption(key)}
                    className={`border px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-between ${
                      options[key] ? t.toggleActive : t.toggleInactive
                    }`}
                  >
                    <span>{label}</span>
                    {options[key] && <FaCheck className="text-xs" />}
                  </button>
                ))}
              </div>

              {/* React JSX Export options */}
              <div className="border-t border-zinc-200/20 pt-6 space-y-4">
                <div
                  onClick={() => setReactExport((v) => !v)}
                  className={`relative p-5 border rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-between shadow-sm select-none ${
                    reactExport
                      ? dark
                        ? "bg-blue-600/10 border-blue-500/50 shadow-blue-500/5"
                        : "bg-blue-50 border-blue-300 shadow-blue-500/5"
                      : dark
                      ? "bg-zinc-950/40 border-zinc-800 hover:border-zinc-700"
                      : "bg-zinc-50/50 border-zinc-250 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`p-3 rounded-xl transition-all duration-300 ${
                        reactExport
                          ? "bg-blue-500 text-white"
                          : dark
                          ? "bg-zinc-900 text-zinc-500"
                          : "bg-zinc-200/60 text-zinc-600"
                      }`}
                    >
                      <FaReact className={`w-5 h-5 ${reactExport ? "animate-[spin_6s_linear_infinite]" : ""}`} />
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm leading-snug ${reactExport ? "text-blue-600 dark:text-blue-400" : ""}`}>
                        Convert into React Functional Component
                      </h4>
                      <p className={`text-[11px] mt-0.5 ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                        Convert clean SVG tags into functional React JSX or TSX code
                      </p>
                    </div>
                  </div>

                  {/* Custom Toggle Switch */}
                  <div
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 shrink-0 ${
                      reactExport ? "bg-blue-500" : dark ? "bg-zinc-800" : "bg-zinc-200"
                    }`}
                  >
                    <div
                      className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                        reactExport ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>

                {reactExport && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-zinc-500/30 mt-4 space-y-1 md:space-y-0">
                    <div className="space-y-3">
                      <button
                        onClick={() => setTsxMode((v) => !v)}
                        className={`w-full border px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-between ${
                          tsxMode ? t.toggleActive : t.toggleInactive
                        }`}
                      >
                        <span>TypeScript (TSX) Output</span>
                        {tsxMode && <FaCheck />}
                      </button>

                      <button
                        onClick={() => setUseForwardRef((v) => !v)}
                        className={`w-full border px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-between ${
                          useForwardRef ? t.toggleActive : t.toggleInactive
                        }`}
                      >
                        <span>Use forwardRef</span>
                        {useForwardRef && <FaCheck />}
                      </button>

                      <button
                        onClick={() => setStripDimensions((v) => !v)}
                        className={`w-full border px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-between ${
                          stripDimensions ? t.toggleActive : t.toggleInactive
                        }`}
                      >
                        <span>Strip width/height</span>
                        {stripDimensions && <FaCheck />}
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className={t.label}>React Component Name</label>
                      <input
                        type="text"
                        value={componentName}
                        onChange={(e) => setComponentName(e.target.value)}
                        placeholder="SvgIcon"
                        className={`w-full p-3.5 rounded-2xl border transition-all duration-200 text-sm font-mono ${t.input}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live preview & Resulting code output (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Preview Card */}
            <div className={`rounded-3xl border ${t.card} p-6 sm:p-8 space-y-4`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FaEye className="text-zinc-500" />
                  <h3
                    className={`font-bold text-base tracking-tight ${t.heading}`}
                  >
                    Live Preview
                  </h3>
                </div>

                <div className="flex gap-1">
                  {[
                    ["dark", "Dark"],
                    ["light", "Light"],
                    ["checker", "Grid"],
                  ].map(([bg, label]) => (
                    <button
                      key={bg}
                      onClick={() => setPreviewBg(bg)}
                      className={`px-2 py-1 rounded-lg border text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                        previewBg === bg
                          ? dark
                            ? "bg-white text-zinc-900 border-white"
                            : "bg-zinc-900 text-white border-zinc-950"
                          : dark
                          ? "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-white"
                          : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-900"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rendering canvas */}
              <div
                className={`w-full h-48 rounded-2xl border border-zinc-200/10 flex items-center justify-center overflow-auto ${
                  previewBg === "dark"
                    ? "bg-[#0B0F19]"
                    : previewBg === "light"
                    ? "bg-[#F8F9FA]"
                    : "bg-[size:16px_16px] bg-[repeating-conic-gradient(#80808020_0_25%,transparent_0_50%)] bg-[#00000010] dark:bg-[#ffffff05]"
                }`}
              >
                {output ? (
                  <div
                    className="max-w-full max-h-full p-6 [&>svg]:max-h-36 [&>svg]:w-auto"
                    dangerouslySetInnerHTML={{ __html: output }}
                  />
                ) : (
                  <span className="text-xs uppercase font-bold tracking-widest text-zinc-500">
                    Empty Canvas
                  </span>
                )}
              </div>
            </div>

            {/* Output code card */}
            <div className={`rounded-3xl border ${t.card} p-6 sm:p-8 space-y-4`}>
              <h3 className={`font-bold text-base tracking-tight ${t.heading}`}>
                {reactExport ? "React Component Code" : "Optimized SVG Code"}
              </h3>

              <textarea
                value={displayOutput}
                readOnly
                placeholder="Output code will appear here..."
                rows={12}
                className={`w-full p-4 rounded-2xl border transition-all duration-200 text-xs font-mono leading-relaxed select-all ${t.input}`}
              />

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleCopy}
                  disabled={!displayOutput}
                  className={`w-full py-3.5 px-4 rounded-2xl font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                    displayOutput
                      ? t.buttonPrimary
                      : "opacity-40 cursor-not-allowed border-zinc-200 text-zinc-400 bg-zinc-100 dark:bg-zinc-900 dark:border-zinc-800"
                  }`}
                >
                  <FaCopy /> Copy
                </button>

                <button
                  onClick={handleDownload}
                  disabled={!displayOutput}
                  className={`w-full py-3.5 px-4 rounded-2xl font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border ${
                    displayOutput
                      ? t.buttonSecondary
                      : "opacity-40 cursor-not-allowed border-zinc-200 text-zinc-400 bg-zinc-100 dark:bg-zinc-900 dark:border-zinc-800"
                  }`}
                >
                  <FaDownload /> Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SvgOptimizer;