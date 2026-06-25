import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { useState } from "react";

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
  // COPY
  // -----------------------------
  const handleCopy = () => {
    if (output) navigator.clipboard.writeText(output);
  };

  // -----------------------------
  // DOWNLOAD
  // -----------------------------
  const handleDownload = () => {
    const blob = new Blob([output], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized.svg";
    a.click();
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

          <h1 className="font-black uppercase">SVG Optimizer</h1>
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
          <div className="flex flex-col gap-2">
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
              Clean Output
            </label>

            <textarea
              value={output}
              readOnly
              className="h-32 p-3 border rounded-xl text-sm font-mono"
            />

            {/* ACTIONS */}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleCopy} className="border py-2 rounded-xl cursor-pointer">
                Copy
              </button>

              <button onClick={handleDownload} className="border py-2 rounded-xl cursor-pointer">
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SvgOptimizer;