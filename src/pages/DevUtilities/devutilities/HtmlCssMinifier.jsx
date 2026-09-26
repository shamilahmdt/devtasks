import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { toast } from "sonner";

// ─── Preset Samples ────────────────────────────────────────────────────────────

const SAMPLE_HTML = `<div class="card" id="main-card">
  <!-- User Profile Section -->
  <header className="card-header">
    <h1 class="title">DevTasks Engineering Cockpit</h1>
    <p class="subtitle">High-performance developer workspace utilities</p>
  </header>
  <div class="card-body">
    <ul class="features">
      <li>Task Management & Roadmaps</li>
      <li>Snippet Vault Registry</li>
      <li>Offline Developer Utilities</li>
    </ul>
  </div>
</div>`;

const SAMPLE_CSS = `/* DevTasks Custom Utility Theme Styles */
.card-container {
  display: flex;
  flex-direction: column;
  background-color: #18181b;
  border: 1px solid #27272a;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
}

.card-container:hover {
  border-color: #52525b;
  transform: translateY(-2px);
  transition: all 0.2s ease-in-out;
}

.title-text {
  font-size: 1.25rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.025em;
}`;

// ─── Minification & Formatting Utilities ────────────────────────────────────────

function minifyHtml(html, preserveComments = false) {
  if (!html) return "";
  let code = html;
  if (!preserveComments) {
    code = code.replace(/<!--[\s\S]*?-->/g, "");
  }
  // Collapse whitespace between tags
  code = code
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim();
  return code;
}

function beautifyHtml(html, indentSize = 2) {
  if (!html) return "";
  const indentStr = " ".repeat(indentSize);
  // Strip newlines and redundant space first
  let clean = html.replace(/<!--[\s\S]*?-->/g, (m) => m).replace(/>\s+</g, "><").trim();
  const tokens = clean.split(/(<[^>]+>)/g).filter((t) => t.trim().length > 0);

  let formatted = "";
  let indent = 0;
  const selfClosing = /^(?:<meta|<img|<br|<hr|<input|<link|<source|<embed|<param|<area|<col|<base)/i;

  tokens.forEach((token) => {
    if (token.startsWith("</")) {
      indent = Math.max(0, indent - 1);
      formatted += "\n" + indentStr.repeat(indent) + token;
    } else if (token.startsWith("<") && !token.startsWith("<!")) {
      const isSelf = selfClosing.test(token) || token.endsWith("/>");
      formatted += "\n" + indentStr.repeat(indent) + token;
      if (!isSelf) {
        indent++;
      }
    } else {
      formatted += token.trim();
    }
  });

  return formatted.trim();
}

function minifyCss(css, preserveComments = false) {
  if (!css) return "";
  let code = css;
  if (!preserveComments) {
    code = code.replace(/\/\*[\s\S]*?\*\//g, "");
  }
  code = code
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,])\s*/g, "$1")
    .replace(/;\}/g, "}")
    .trim();
  return code;
}

function beautifyCss(css, indentSize = 2) {
  if (!css) return "";
  const indentStr = " ".repeat(indentSize);
  // Minify first to standardize tokens
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{}:;,])\s*/g, "$1").trim();

  let formatted = "";
  let depth = 0;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (char === "{") {
      formatted += " {\n";
      depth++;
      formatted += indentStr.repeat(depth);
    } else if (char === "}") {
      depth = Math.max(0, depth - 1);
      formatted += "\n" + indentStr.repeat(depth) + "}\n\n";
    } else if (char === ";") {
      formatted += ";\n" + indentStr.repeat(depth);
    } else if (char === ":") {
      formatted += ": ";
    } else {
      formatted += char;
    }
  }

  return formatted.replace(/\n\s+\n/g, "\n").trim();
}

// ─── Theme Builder ────────────────────────────────────────────────────────────

const buildTheme = (dark) => ({
  page: dark ? "bg-zinc-950" : "bg-[#F7F7F7]",
  panel: dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200",
  textarea: dark
    ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 focus:border-white focus:ring-1 focus:ring-white"
    : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black",
  textareaReadonly: dark
    ? "bg-zinc-900 border-zinc-800 text-zinc-300 cursor-default"
    : "bg-white border-neutral-200 text-zinc-700 cursor-default",
  softBtn: dark
    ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
    : "bg-white border-neutral-200 text-zinc-600 hover:text-black hover:border-neutral-400",
  primaryBtn: dark
    ? "bg-white text-black border-white hover:bg-zinc-200"
    : "bg-black text-white border-black hover:bg-zinc-800",
  tabActive: dark ? "bg-white text-black" : "bg-black text-white",
  tabInactive: dark
    ? "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
    : "bg-neutral-100 text-zinc-500 hover:text-black hover:bg-neutral-200",
  tabWrap: dark ? "bg-zinc-800 border-zinc-700" : "bg-neutral-100 border-neutral-200",
  label: dark ? "text-zinc-500" : "text-neutral-400",
  heading: dark ? "text-white" : "text-black",
  subtext: dark ? "text-zinc-500" : "text-neutral-500",
  select: dark
    ? "bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-white"
    : "bg-white border-neutral-300 text-black focus:border-black",
  statBox: dark ? "bg-zinc-950 border-zinc-800 text-zinc-300" : "bg-neutral-100 border-neutral-200 text-zinc-700",
});

const HtmlCssMinifier = () => {
  const { dark } = useTheme();
  const t = buildTheme(dark);

  const [mode, setMode] = useState("html"); // 'html' | 'css'
  const [inputCode, setInputCode] = useState("");
  const [outputCode, setOutputCode] = useState("");
  const [indentSize, setIndentSize] = useState(2);
  const [preserveComments, setPreserveComments] = useState(false);

  const handleSample = () => {
    const sample = mode === "html" ? SAMPLE_HTML : SAMPLE_CSS;
    setInputCode(sample);
    setOutputCode("");
  };

  const handleClear = () => {
    setInputCode("");
    setOutputCode("");
  };

  const handleMinify = () => {
    if (!inputCode.trim()) {
      toast.error("Please enter code to minify.");
      return;
    }
    const result = mode === "html" ? minifyHtml(inputCode, preserveComments) : minifyCss(inputCode, preserveComments);
    setOutputCode(result);
    toast.success(`${mode.toUpperCase()} minified successfully`);
  };

  const handleBeautify = () => {
    if (!inputCode.trim()) {
      toast.error("Please enter code to format.");
      return;
    }
    const result = mode === "html" ? beautifyHtml(inputCode, indentSize) : beautifyCss(inputCode, indentSize);
    setOutputCode(result);
    toast.success(`${mode.toUpperCase()} formatted successfully`);
  };

  const handleCopy = async (text, label) => {
    if (!text.trim()) {
      toast.error("Nothing to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDownload = () => {
    if (!outputCode.trim()) {
      toast.error("Nothing to download");
      return;
    }
    const extension = mode === "html" ? "html" : "css";
    const blob = new Blob([outputCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `minified_output.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded minified_output.${extension}`);
  };

  // Stats calculation
  const inputBytes = new Blob([inputCode]).size;
  const outputBytes = new Blob([outputCode]).size;
  const savings = inputBytes > 0 && outputBytes > 0 ? (((inputBytes - outputBytes) / inputBytes) * 100).toFixed(1) : 0;

  return (
    <div className={`min-h-[calc(100vh-76px)] px-4 py-6 transition-colors duration-300 sm:px-6 ${t.page}`}>
      <title>HTML & CSS Minifier / Beautifier — DevTasks</title>
      <meta
        name="description"
        content="Minify, compress, format, and beautify HTML and CSS code client-side offline with real-time compression analytics."
      />

      <div className={`mx-auto flex w-full max-w-7xl flex-col overflow-hidden rounded-3xl border shadow-xl transition-colors duration-300 ${t.panel}`}>
        {/* Accent Bar */}
        <div className={`h-2 w-full ${dark ? "bg-white" : "bg-black"}`} />

        <header className="flex flex-col gap-4 px-5 pt-6 sm:px-8 sm:pt-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/devutilities"
                className={`flex shrink-0 items-center justify-center rounded-xl border p-2.5 transition-all duration-200 active:scale-95 ${t.softBtn}`}
                title="Back to Workspace"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>

              <div>
                <h1 className={`text-xl font-black uppercase tracking-tight sm:text-2xl ${t.heading}`}>
                  HTML & CSS Minifier / Beautifier
                </h1>
                <p className={`mt-0.5 text-sm font-medium ${t.subtext}`}>
                  Compress and format HTML markup and CSS stylesheets client-side offline
                </p>
              </div>
            </div>

            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Language Selector */}
              <div className={`flex rounded-xl border overflow-hidden text-xs font-black uppercase tracking-widest ${t.tabWrap}`}>
                <button
                  type="button"
                  onClick={() => {
                    setMode("html");
                    setInputCode("");
                    setOutputCode("");
                  }}
                  className={`px-4 py-2 transition-all ${mode === "html" ? t.tabActive : t.tabInactive}`}
                >
                  HTML
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("css");
                    setInputCode("");
                    setOutputCode("");
                  }}
                  className={`px-4 py-2 transition-all ${mode === "css" ? t.tabActive : t.tabInactive}`}
                >
                  CSS
                </button>
              </div>

              <button
                type="button"
                onClick={handleSample}
                className={`rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${t.primaryBtn}`}
              >
                Sample
              </button>
              <button
                type="button"
                onClick={handleClear}
                className={`rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${t.softBtn}`}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Options Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-xs font-semibold ${t.tabWrap}">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className={t.label}>Indent Size:</span>
                <select
                  value={indentSize}
                  onChange={(e) => setIndentSize(Number(e.target.value))}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-bold outline-none ${t.select}`}
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                </select>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={preserveComments}
                  onChange={(e) => setPreserveComments(e.target.checked)}
                  className="rounded border-zinc-700 text-black focus:ring-0 cursor-pointer"
                />
                <span className={t.subtext}>Preserve Comments</span>
              </label>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBeautify}
                className={`rounded-xl border px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${t.softBtn}`}
              >
                Format / Beautify
              </button>
              <button
                type="button"
                onClick={handleMinify}
                className={`rounded-xl border px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${t.primaryBtn}`}
              >
                Minify / Compress
              </button>
            </div>
          </div>
        </header>

        <main className="flex flex-col gap-6 p-5 sm:p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Input Editor */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-black uppercase tracking-widest ${t.label}`}>
                  Input {mode.toUpperCase()} Code ({inputBytes} bytes)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(inputCode, "Input code")}
                  className={`rounded-lg border px-3 py-1 text-[11px] font-black uppercase tracking-widest transition-all ${t.softBtn}`}
                >
                  Copy
                </button>
              </div>

              <textarea
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                spellCheck={false}
                placeholder={`Paste your unformatted or raw ${mode.toUpperCase()} code here...`}
                className={`min-h-[380px] lg:min-h-[460px] w-full resize-none rounded-2xl border px-4 py-3 font-mono text-sm leading-6 outline-none transition-all ${t.textarea}`}
              />
            </section>

            {/* Output Editor */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-black uppercase tracking-widest ${t.label}`}>
                  Output {mode.toUpperCase()} Code ({outputBytes} bytes)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className={`rounded-lg border px-3 py-1 text-[11px] font-black uppercase tracking-widest transition-all ${t.softBtn}`}
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(outputCode, "Output code")}
                    className={`rounded-lg border px-3 py-1 text-[11px] font-black uppercase tracking-widest transition-all ${t.softBtn}`}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <textarea
                value={outputCode}
                readOnly
                spellCheck={false}
                placeholder={`Formatted or minified ${mode.toUpperCase()} output will appear here...`}
                className={`min-h-[380px] lg:min-h-[460px] w-full resize-none rounded-2xl border px-4 py-3 font-mono text-sm leading-6 outline-none transition-all select-all ${t.textareaReadonly}`}
              />
            </section>
          </div>

          {/* Real-time Analytics Bar */}
          {outputCode && (
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl border p-4 text-center ${t.statBox}`}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Original Size</p>
                <p className="text-base font-bold">{inputBytes} bytes</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Result Size</p>
                <p className="text-base font-bold">{outputBytes} bytes</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Compression Savings</p>
                <p className={`text-base font-black ${Number(savings) > 0 ? "text-emerald-500" : "text-zinc-400"}`}>
                  {savings}%
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HtmlCssMinifier;
