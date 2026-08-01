import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { useState, useEffect, useMemo } from "react";
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
const SVG_DATA_URI_PREFIX = "data:image/svg+xml;utf8,";

function encodeSvgForDataUri(svg, quoteStyle = "double") {
  const wrapperQuote = quoteStyle === "single" ? /'/g : /"/g;
  const encodedQuote = quoteStyle === "single" ? "%27" : "%22";

  return svg
    .trim()
    .replace(/%/g, "%25")
    .replace(/#/g, "%23")
    .replace(/&/g, "%26")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(wrapperQuote, encodedQuote)
    .replace(/\r?\n|\r/g, " ");
}

function createSvgOutputs(svg, quoteStyle = "double") {
  if (!svg.trim()) {
    return {
      css: "",
      html: "",
      base64: "",
      raw: "",
      preview: "",
    };
  }

  const quote = quoteStyle === "single" ? "'" : '"';
  const encoded = encodeSvgForDataUri(svg, quoteStyle);
  const htmlEncoded = encodeSvgForDataUri(svg, "double");
  const raw = `${SVG_DATA_URI_PREFIX}${encoded}`;
  const preview = `${SVG_DATA_URI_PREFIX}${htmlEncoded}`;
  const encoder =
    typeof window === "undefined" ? globalThis.btoa : window.btoa.bind(window);
  const base64 = `data:image/svg+xml;base64,${encoder(
    unescape(encodeURIComponent(svg.trim())),
  )}`;

  return {
    css: `background-image: url(${quote}${raw}${quote});`,
    html: `<img src="${preview}" alt="">`,
    base64,
    raw,
    preview,
  };
}

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
  { componentName, useTypescript, useForwardRef }
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

// Helper for Data URI validation
function validateSvg(svgMarkup) {
  if (!svgMarkup.trim()) {
    return { valid: false, message: "Paste SVG markup to generate a preview." };
  }
  try {
    const parsed = new DOMParser().parseFromString(svgMarkup, "image/svg+xml");
    const parserError = parsed.querySelector("parsererror");
    if (parserError || parsed.documentElement.localName !== "svg") {
      return { valid: false, message: "The SVG markup could not be parsed." };
    }
    return { valid: true, message: "SVG parsed successfully." };
  } catch {
    return { valid: false, message: "The SVG markup could not be parsed." };
  }
}

function SvgOptimizer() {
  const { dark } = useTheme();
  const [activeTab, setActiveTab] = useState("optimizer"); // optimizer | datauri

  // -----------------------------
  // Tab 1: SVG Optimizer State
  // -----------------------------
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [previewBg, setPreviewBg] = useState("checker");
  const [isDragging, setIsDragging] = useState(false);
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
  const [useForwardRefOption, setUseForwardRef] = useState(false);
  const [stripDimensions, setStripDimensions] = useState(false);
  const [componentName, setComponentName] = useState("SvgIcon");

  // -----------------------------
  // Tab 2: SVG to Data URI State
  // -----------------------------
  const [dataUriInput, setDataUriInput] = useState("");
  const [quoteStyle, setQuoteStyle] = useState("double");

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
      useForwardRef: useForwardRefOption,
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
      if (key === "minify" && newOpts.minify) {
        newOpts.beautify = false;
      }
      if (key === "beautify" && newOpts.beautify) {
        newOpts.minify = false;
      }
      return newOpts;
    });
  };

  // Drag and drop handlers
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

  // -----------------------------
  // Data URI Computations
  // -----------------------------
  const dataUriOutputs = useMemo(() => {
    return createSvgOutputs(dataUriInput, quoteStyle);
  }, [dataUriInput, quoteStyle]);

  const dataUriValidation = useMemo(() => {
    return validateSvg(dataUriInput);
  }, [dataUriInput]);

  const handleDataUriSample = () => {
    setDataUriInput(`<svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
  <rect width="160" height="160" rx="32" fill="#18181b"/>
  <path d="M48 82l20 20 44-48" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`);
    toast.success("Sample SVG Loaded");
  };

  const handleDataUriCopy = async (value, label) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Failed to copy");
    }
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
      <title>SVG Toolkit | DevTasks</title>
      <meta
        name="description"
        content="Optimize, clean, and convert SVG code into React components, CSS background-image rules, and Data URIs."
      />

      <div className="max-w-7xl mx-auto">
        {/* Header with main tabs */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/devutilities"
              className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${dark
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
                SVG Toolkit
              </h1>
              <p className={`mt-1 text-sm ${t.subtext}`}>
                Interactive SVG processing tools for Web Developers.
              </p>
            </div>
          </div>

          {/* View Tab Selector */}
          <div className="flex border rounded-2xl p-1 bg-zinc-100 dark:bg-zinc-900/40 border-neutral-200 dark:border-zinc-850 shrink-0 self-start sm:self-center">
            <button
              onClick={() => setActiveTab("optimizer")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${activeTab === "optimizer"
                  ? dark
                    ? "bg-white text-black"
                    : "bg-black text-white"
                  : "bg-transparent text-zinc-700 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
            >
              SVG Optimizer & JSX
            </button>
            <button
              onClick={() => setActiveTab("datauri")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${activeTab === "datauri"
                  ? dark
                    ? "bg-white text-black"
                    : "bg-black text-white"
                  : "bg-transparent text-zinc-700 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
            >
              SVG to Data URI
            </button>
          </div>
        </div>

        {/* ── Tab 1: SVG OPTIMIZER & REACT JSX GENERATOR ── */}
        {activeTab === "optimizer" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Code input, options (7 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Input card */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`rounded-3xl border ${t.card} p-6 sm:p-8 space-y-6 relative overflow-hidden transition-all duration-200 ${isDragging ? "ring-2 ring-blue-500 scale-[1.01]" : ""
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
                    <h2 className={`font-bold text-lg tracking-tight ${t.heading}`}>
                      Raw SVG Input
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSample}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${t.buttonSecondary}`}
                    >
                      Sample
                    </button>
                    <button
                      onClick={handleClear}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${t.buttonSecondary}`}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste your SVG XML code here, or drop an .svg file..."
                  rows={14}
                  className={`w-full p-4 rounded-2xl border transition-all duration-200 text-xs font-mono leading-relaxed ${t.input}`}
                />
              </div>

              {/* Options card */}
              <div className={`rounded-3xl border ${t.card} p-6 sm:p-8 space-y-6`}>
                <h3 className={`font-bold text-base tracking-tight ${t.heading}`}>
                  Optimization & Export Rules
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Clean xml declarations */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.xml}
                      onChange={() => toggleOption("xml")}
                      className="w-4 h-4 rounded text-zinc-900"
                    />
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold ${t.heading}`}>
                        Strip XML Dec
                      </span>
                      <span className={`text-[10px] ${t.subtext}`}>
                        Remove &lt;?xml... ?&gt; declarations
                      </span>
                    </div>
                  </label>

                  {/* Clean SVG comments */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.comments}
                      onChange={() => toggleOption("comments")}
                      className="w-4 h-4 rounded text-zinc-900"
                    />
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold ${t.heading}`}>
                        Remove Comments
                      </span>
                      <span className={`text-[10px] ${t.subtext}`}>
                        Strip code annotations and comments
                      </span>
                    </div>
                  </label>

                  {/* Clean metadata */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.metadata}
                      onChange={() => toggleOption("metadata")}
                      className="w-4 h-4 rounded text-zinc-900"
                    />
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold ${t.heading}`}>
                        Strip Metadata
                      </span>
                      <span className={`text-[10px] ${t.subtext}`}>
                        Remove editor tags and junk properties
                      </span>
                    </div>
                  </label>

                  {/* Minify structure */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.minify}
                      onChange={() => toggleOption("minify")}
                      className="w-4 h-4 rounded text-zinc-900"
                    />
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold ${t.heading}`}>
                        Minify SVG Output
                      </span>
                      <span className={`text-[10px] ${t.subtext}`}>
                        Compress spaces and group elements
                      </span>
                    </div>
                  </label>

                  {/* Format Beautify */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.beautify}
                      onChange={() => toggleOption("beautify")}
                      className="w-4 h-4 rounded text-zinc-900"
                    />
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold ${t.heading}`}>
                        Beautify Markup
                      </span>
                      <span className={`text-[10px] ${t.subtext}`}>
                        Format tags on neat, separate lines
                      </span>
                    </div>
                  </label>

                  {/* Convert to React JSX */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reactExport}
                      onChange={(e) => setReactExport(e.target.checked)}
                      className="w-4 h-4 rounded text-zinc-900"
                    />
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold ${t.heading}`}>
                        React JSX Component
                      </span>
                      <span className={`text-[10px] ${t.subtext}`}>
                        Convert SVG into a functional React wrapper
                      </span>
                    </div>
                  </label>
                </div>

                {reactExport && (
                  <div
                    className={`p-5 rounded-2xl border space-y-4 ${dark ? "bg-zinc-950/60 border-zinc-800" : "bg-zinc-50/50 border-zinc-200"
                      }`}
                  >
                    <h4 className={`text-xs font-bold tracking-wider uppercase ${t.subtext}`}>
                      React Component Options
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tsxMode}
                          onChange={(e) => setTsxMode(e.target.checked)}
                          className="w-4 h-4 rounded text-zinc-900"
                        />
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${t.heading}`}>
                            TypeScript (.tsx)
                          </span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useForwardRefOption}
                          onChange={(e) => setUseForwardRef(e.target.checked)}
                          className="w-4 h-4 rounded text-zinc-900"
                        />
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${t.heading}`}>
                            Use forwardRef
                          </span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={stripDimensions}
                          onChange={(e) => setStripDimensions(e.target.checked)}
                          className="w-4 h-4 rounded text-zinc-900"
                        />
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${t.heading}`}>
                            Strip Width/Height
                          </span>
                        </div>
                      </label>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <span className={`text-xs font-bold ${t.heading}`}>
                        Component Name
                      </span>
                      <input
                        type="text"
                        value={componentName}
                        onChange={(e) => setComponentName(e.target.value)}
                        className={`px-4 py-2.5 rounded-xl border text-xs font-mono ${t.input}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Previews, output text (5 Columns) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Size metrics */}
              {output && (
                <div className={`rounded-3xl border ${t.card} p-5 grid grid-cols-3 gap-2 text-center`}>
                  <div className="flex flex-col">
                    <span className={`text-[10px] uppercase font-bold tracking-widest ${t.subtext}`}>
                      Original
                    </span>
                    <span className={`text-sm font-black mt-1 ${t.heading}`}>
                      {formatSize(originalSize)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[10px] uppercase font-bold tracking-widest ${t.subtext}`}>
                      Optimized
                    </span>
                    <span className={`text-sm font-black mt-1 ${t.heading}`}>
                      {formatSize(optimizedSize)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[10px] uppercase font-bold tracking-widest text-emerald-500`}>
                      Saved
                    </span>
                    <span className="text-sm font-black mt-1 text-emerald-500">
                      {savingsPercent}%
                    </span>
                  </div>
                </div>
              )}

              {/* Rendering canvas preview */}
              <div className={`rounded-3xl border ${t.card} p-6 sm:p-8 space-y-4`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FaEye className="text-zinc-500 w-4 h-4" />
                    <h3 className={`font-bold text-base tracking-tight ${t.heading}`}>
                      Live Preview
                    </h3>
                  </div>

                  {/* Preview background selector */}
                  <div className="flex border border-zinc-200/10 rounded-xl p-0.5 overflow-hidden text-[10px] font-bold">
                    {["checker", "light", "dark"].map((bg) => (
                      <button
                        key={bg}
                        onClick={() => setPreviewBg(bg)}
                        className={`px-2.5 py-1 rounded-lg capitalize cursor-pointer transition-all ${previewBg === bg
                            ? dark
                              ? "bg-zinc-800 text-white"
                              : "bg-zinc-100 text-black"
                            : "text-zinc-500 hover:text-current"
                          }`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className={`w-full h-48 rounded-2xl border border-zinc-200/10 flex items-center justify-center overflow-auto ${previewBg === "dark"
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
                    className={`w-full py-3.5 px-4 rounded-2xl font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${displayOutput
                        ? t.buttonPrimary
                        : "opacity-40 cursor-not-allowed border-zinc-200 text-zinc-400 bg-zinc-100 dark:bg-zinc-900 dark:border-zinc-800"
                      }`}
                  >
                    <FaCopy /> Copy
                  </button>

                  <button
                    onClick={handleDownload}
                    disabled={!displayOutput}
                    className={`w-full py-3.5 px-4 rounded-2xl font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border ${displayOutput
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
        )}

        {/* ── Tab 2: SVG TO DATA URI CONVERTER ── */}
        {activeTab === "datauri" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input SVG Code */}
            <div className="lg:col-span-6 space-y-6">
              <div className={`rounded-3xl border ${t.card} p-6 sm:p-8 space-y-6`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FaFileCode className="text-zinc-500 w-4 h-4" />
                    <h2 className={`font-bold text-lg tracking-tight ${t.heading}`}>
                      SVG Source Markup
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDataUriSample}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 ${t.buttonSecondary}`}
                    >
                      Sample
                    </button>
                    <button
                      onClick={() => setDataUriInput("")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 ${t.buttonSecondary}`}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <textarea
                  value={dataUriInput}
                  onChange={(e) => setDataUriInput(e.target.value)}
                  placeholder="Paste your raw XML <svg>...</svg> tags here..."
                  rows={14}
                  className={`w-full p-4 rounded-2xl border transition-all duration-200 text-xs font-mono leading-relaxed ${t.input}`}
                />

                <div className="flex justify-between items-center pt-2">
                  <span className={`text-xs font-bold ${t.heading}`}>
                    Quote Encoding Style:
                  </span>
                  <div className="flex border border-zinc-200/10 rounded-xl p-0.5 overflow-hidden text-[10px] font-bold">
                    {["double", "single"].map((style) => (
                      <button
                        key={style}
                        onClick={() => setQuoteStyle(style)}
                        className={`px-3 py-1 rounded-lg capitalize cursor-pointer transition-all ${quoteStyle === style
                            ? dark
                              ? "bg-zinc-800 text-white"
                              : "bg-zinc-100 text-black"
                            : "text-zinc-500 hover:text-current"
                          }`}
                      >
                        {style} Quotes
                      </button>
                    ))}
                  </div>
                </div>

                {dataUriInput && (
                  <div
                    className={`p-4 rounded-2xl text-xs font-bold border ${dataUriValidation.valid
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                      }`}
                  >
                    {dataUriValidation.message}
                  </div>
                )}
              </div>
            </div>

            {/* Output URI Fields */}
            <div className="lg:col-span-6 space-y-6">
              {/* Preview */}
              <div className={`rounded-3xl border ${t.card} p-6 sm:p-8 space-y-4`}>
                <h3 className={`font-bold text-base tracking-tight ${t.heading}`}>
                  URI Visual Preview
                </h3>
                <div
                  className={`w-full h-32 rounded-2xl border border-zinc-200/10 flex items-center justify-center overflow-auto ${dark ? "bg-zinc-950/70" : "bg-zinc-50"
                    }`}
                >
                  {dataUriOutputs.preview ? (
                    <img
                      src={dataUriOutputs.preview}
                      alt="Data URI Preview"
                      className="max-w-full max-h-24 object-contain"
                    />
                  ) : (
                    <span className="text-xs uppercase font-bold tracking-widest text-zinc-500">
                      Visual preview will render here
                    </span>
                  )}
                </div>
              </div>

              {/* Fields */}
              <div className={`rounded-3xl border ${t.card} p-6 sm:p-8 space-y-5`}>
                {[
                  { label: "CSS Background Image", value: dataUriOutputs.css },
                  { label: "HTML Image Tag", value: dataUriOutputs.html },
                  { label: "Base64 Data URI", value: dataUriOutputs.base64 },
                  { label: "Raw URL-encoded Data URI", value: dataUriOutputs.raw },
                ].map((field) => (
                  <div key={field.label} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-black uppercase tracking-widest ${t.subtext}`}>
                        {field.label}
                      </span>
                      {field.value && (
                        <button
                          onClick={() => handleDataUriCopy(field.value, field.label)}
                          className={`text-xs font-bold transition-colors flex items-center gap-1 ${dark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-black"
                            }`}
                        >
                          <FaCopy className="w-3 h-3" /> Copy
                        </button>
                      )}
                    </div>
                    <textarea
                      value={field.value}
                      readOnly
                      rows={2}
                      className={`w-full p-3 rounded-xl border text-xs font-mono resize-none focus:outline-none ${t.input}`}
                      placeholder="Generating URI output..."
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SvgOptimizer;