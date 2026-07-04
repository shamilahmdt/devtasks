import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { useState } from "react";

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

/**
 * Convert a hyphenated SVG/CSS attribute name to camelCase.
 * e.g. "stroke-width" → "strokeWidth", "clip-path" → "clipPath"
 */
function hyphenToCamel(name) {
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Convert a CSS property value to a JS-appropriate value.
 * Numeric values (with optional units stripped) become numbers, others stay strings.
 */
function cssValueToJs(value) {
  const trimmed = value.trim();
  // Pure numbers (including decimals)
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return parseFloat(trimmed);
  }
  // Numbers with px units → strip px and return number
  if (/^-?\d+(\.\d+)?px$/.test(trimmed)) {
    return parseFloat(trimmed);
  }
  return `"${trimmed}"`;
}

/**
 * Convert an inline style="..." string to a React style={{ ... }} object string.
 */
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

/**
 * Transform optimized SVG into React-compatible JSX:
 * - Rename HTML attrs → React equivalents
 * - Convert hyphenated SVG attrs → camelCase
 * - Convert inline style strings → style objects
 * - Optionally strip width/height
 */
function svgToJsx(svg, { stripDimensions = false } = {}) {
  let result = svg;

  // Convert inline style="..." to React style={{ ... }}
  result = result.replace(/\bstyle="([^"]*)"/g, (_, styleVal) => {
    return `style=${convertInlineStyle(styleVal)}`;
  });

  // Strip width/height attributes if requested
  if (stripDimensions) {
    result = result.replace(/\s(width|height)="[^"]*"/g, "");
  }

  // Replace known HTML→React attribute mappings (whole-word, in tags only)
  result = result.replace(/<[^>]+>/g, (tag) => {
    // Replace known HTML attrs
    for (const [html, react] of Object.entries(HTML_TO_REACT_ATTRS)) {
      const regex = new RegExp(`\\b${html}=`, "g");
      tag = tag.replace(regex, `${react}=`);
    }
    // Convert any remaining hyphenated attributes to camelCase
    // Match attribute names like "stroke-width", "fill-rule", etc.
    tag = tag.replace(/\s([a-z]+-[a-z][-a-z]*)(?==)/g, (match, attr) => {
      // Don't convert data-* or aria-* attributes
      if (attr.startsWith("data-") || attr.startsWith("aria-")) return match;
      return ` ${hyphenToCamel(attr)}`;
    });
    return tag;
  });

  return result;
}

/**
 * Wrap JSX SVG in a React component string.
 */
function wrapInComponent(
  jsxSvg,
  { componentName, useTypescript, useForwardRef },
) {
  const name = componentName || "SvgIcon";
  const trimmedSvg = jsxSvg.trim();

  // Inject props spread (and ref if needed) into the root <svg> tag
  const injectProps = (svg, includeRef) => {
    return svg.replace(/^<svg/, includeRef ? "<svg ref={ref} {...props}" : "<svg {...props}");
  };

  const svgWithProps = injectProps(trimmedSvg, useForwardRef);

  const imports = [];
  const lines = [];

  if (useForwardRef && useTypescript) {
    imports.push("import { forwardRef, SVGProps } from 'react';");
    lines.push("");
    lines.push(
      `export const ${name} = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (`,
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
      `export const ${name} = (props: SVGProps<SVGSVGElement>) => (`,
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

  const [previewBg, setPreviewBg] = useState("dark");

  const [options, setOptions] = useState({
    xml: false,
    comments: false,
    metadata: false,
    minify: false,
    beautify: false,
  });

  // React export options
  const [reactExport, setReactExport] = useState(false);
  const [tsxMode, setTsxMode] = useState(false);
  const [useForwardRef, setUseForwardRef] = useState(false);
  const [stripDimensions, setStripDimensions] = useState(false);
  const [componentName, setComponentName] = useState("SvgIcon");

  // -----------------------------
  // SAMPLE SVG
  // -----------------------------
  const handleSample = () => {
    setInput(`<?xml version="1.0"?>
<!-- Figma Export -->
<svg width="120" height="120">
  <metadata>figma junk data</metadata>
  <rect id="box1" class="shape" width="120" height="120" fill="blue"/>
</svg>`);
  };

  // -----------------------------
  // CLEAR
  // -----------------------------
  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  // -----------------------------
  // OPTIMIZER CORE
  // -----------------------------
  const optimizeSvg = () => {
    let result = input;

    if (!result) return;

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

    // Beautify (basic)
    if (options.beautify) {
      result = result
        .replace(/></g, ">\n<")
        .trim();
    }

    setOutput(result);
  };

  // -----------------------------
  // Build the final display string
  // (raw SVG or React component)
  // -----------------------------
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

  // -----------------------------
  // COPY
  // -----------------------------
  const handleCopy = () => {
    if (displayOutput) navigator.clipboard.writeText(displayOutput);
  };

  // -----------------------------
  // DOWNLOAD
  // -----------------------------
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
    } else {
      const blob = new Blob([displayOutput], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "optimized.svg";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const toggleOption = (key) => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div
      className={`min-h-[calc(100vh-76px)] px-4 py-6 flex justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <div
        className={`w-full max-w-6xl rounded-3xl border shadow-xl overflow-hidden ${
          dark
            ? "bg-zinc-900 border-zinc-800"
            : "bg-white border-neutral-200"
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Link
            to="/devutilities"
            className="px-3 py-2 border rounded-xl"
          >
            ←
          </Link>

          <h1 className="font-black uppercase">SVG Optimizer & React JSX Generator</h1>
        </div>

        {/* MAIN GRID */}
        <div className="grid md:grid-cols-3 gap-4 p-4 h-[80vh]">
          {/* INPUT */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase">
              Input SVG
            </label>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste SVG here..."
              className="flex-1 p-3 border rounded-xl text-sm font-mono"
            />

            <button
              onClick={optimizeSvg}
              className="border py-2 rounded-xl font-bold cursor-pointer"
            >
              Optimize
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleSample} className="border py-2 rounded-xl cursor-pointer">
                Load Sample
              </button>

              <button onClick={handleClear} className="border py-2 rounded-xl cursor-pointer">
                Clear
              </button>
            </div>
          </div>

          {/* CENTER OPTIONS */}
          <div className="flex flex-col gap-2 overflow-y-auto">
            <label className="text-xs font-bold uppercase">
              Options
            </label>

            {[
              ["xml", "Remove XML"],
              ["comments", "Remove Comments"],
              ["metadata", "Remove Metadata"],
              ["minify", "Minify"],
              ["beautify", "Beautify"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => toggleOption(key)}
                className={`border py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  options[key] ? "bg-black text-white" : ""
                }`}
              >
                {label}
              </button>
            ))}

            {/* React Export Section */}
            <div className="mt-3 border-t pt-3">
              <button
                onClick={() => setReactExport((v) => !v)}
                className={`w-full border py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  reactExport ? "bg-black text-white" : ""
                }`}
              >
                Export as React Component (JSX)
              </button>

              {reactExport && (
                <div className="flex flex-col gap-2 mt-2 pl-2 border-l-2 border-zinc-600">
                  <button
                    onClick={() => setTsxMode((v) => !v)}
                    className={`border py-2 rounded-xl text-xs font-bold cursor-pointer ${
                      tsxMode ? "bg-black text-white" : ""
                    }`}
                  >
                    TypeScript Support (TSX)
                  </button>

                  <button
                    onClick={() => setUseForwardRef((v) => !v)}
                    className={`border py-2 rounded-xl text-xs font-bold cursor-pointer ${
                      useForwardRef ? "bg-black text-white" : ""
                    }`}
                  >
                    Use forwardRef
                  </button>

                  <button
                    onClick={() => setStripDimensions((v) => !v)}
                    className={`border py-2 rounded-xl text-xs font-bold cursor-pointer ${
                      stripDimensions ? "bg-black text-white" : ""
                    }`}
                  >
                    Strip Dimensions
                  </button>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase">
                      Component Name
                    </label>
                    <input
                      type="text"
                      value={componentName}
                      onChange={(e) => setComponentName(e.target.value)}
                      placeholder="SvgIcon"
                      className="border py-2 px-3 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col gap-3">
            {/* PREVIEW */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase">
                Live Preview
              </label>

              <div className="flex gap-1 text-xs">
                {["dark", "light", "checker"].map((bg) => (
                  <button
                    key={bg}
                    onClick={() => setPreviewBg(bg)}
                    className="border px-2 py-1 rounded cursor-pointer"
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={`flex-1 border rounded-xl overflow-auto ${
                previewBg === "dark"
                  ? "bg-black"
                  : previewBg === "light"
                  ? "bg-white"
                  : "bg-[repeating-conic-gradient(#ccc_0_25%,transparent_0_50%)]"
              }`}
              dangerouslySetInnerHTML={{ __html: output }}
            />

            {/* OUTPUT */}
            <label className="text-xs font-bold uppercase">
              {reactExport ? "React Component Output" : "Clean Output"}
            </label>

            <textarea
              value={displayOutput}
              readOnly
              className="h-32 p-3 border rounded-xl text-sm font-mono"
            />

            {/* ACTIONS */}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleCopy} className="border py-2 rounded-xl cursor-pointer">
                Copy
              </button>

              <button onClick={handleDownload} className="border py-2 rounded-xl cursor-pointer">
                {reactExport
                  ? tsxMode
                    ? "Download .tsx"
                    : "Download .jsx"
                  : "Download"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SvgOptimizer;