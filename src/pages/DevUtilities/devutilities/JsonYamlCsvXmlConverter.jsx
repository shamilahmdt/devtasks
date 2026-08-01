import { useState } from "react";
import { Link } from "react-router-dom";
import { dump, load } from "js-yaml";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const FORMATS = ["json", "yaml", "csv", "xml"];

const DELIMITER_OPTIONS = [
    { label: "Comma (,)", value: "," },
    { label: "Semicolon (;)", value: ";" },
    { label: "Tab (\\t)", value: "\t" },
];

const YAML_OPTIONS = { indent: 2, sortKeys: false };
const SAMPLE_OBJECT = {
    app: { name: "DevTasks", environment: "development", version: "1.0.0", debug: true },
    server: {
        host: "localhost",
        port: 5173,
        cors: { enabled: true, origins: ["http://localhost:5173", "https://dev-tasks-beta.vercel.app"] },
    },
    features: [
        { key: "taskManagement", enabled: true },
        { key: "snippetVault", enabled: true },
        { key: "resourceHub", enabled: false },
    ],
    limits: { maxUploadMb: 10, retryAttempts: 3 },
};

const SAMPLE_CSV_ROWS = [
    { key: "taskManagement", enabled: "true", priority: "high" },
    { key: "snippetVault", enabled: "true", priority: "medium" },
    { key: "resourceHub", enabled: "false", priority: "low" },
];

// ─── Error Formatters ─────────────────────────────────────────────────────────

const formatJsonParseError = (error, source) => {
    const message = error instanceof Error ? error.message : "Invalid JSON syntax.";
    if (/line\s+\d+\s+column\s+\d+/i.test(message)) return message;
    const positionMatch = message.match(/position\s+(\d+)/i);
    if (!positionMatch) return message;
    const position = Number(positionMatch[1]);
    if (Number.isNaN(position)) return message;
    const beforeError = source.slice(0, position);
    const line = beforeError.split("\n").length;
    const column = beforeError.length - beforeError.lastIndexOf("\n");
    return `${message} (line ${line}, column ${column})`;
};

const formatYamlParseError = (error) => {
    const message = error instanceof Error ? error.message : "Invalid YAML syntax.";
    if (error?.mark) {
        return `${error.reason || message} (line ${error.mark.line + 1}, column ${error.mark.column + 1})`;
    }
    return message;
};

const formatXmlParseError = (msg) => {
    return msg || "Invalid XML syntax.";
};

const formatErrorFor = (format, error, source) => {
    if (format === "json") return { title: "Invalid JSON", message: formatJsonParseError(error, source) };
    if (format === "yaml") return { title: "Invalid YAML", message: formatYamlParseError(error) };
    if (format === "xml") return { title: "Invalid XML", message: formatXmlParseError(error instanceof Error ? error.message : String(error)) };
    return { title: "Invalid CSV", message: error instanceof Error ? error.message : "Invalid CSV input." };
};

// ─── XML Parser & Serializer Helpers ──────────────────────────────────────────

function parseXmlDoc(xmlString) {
  const doc = new DOMParser().parseFromString(xmlString, "application/xml");
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) throw new Error(errorNode.textContent.trim());
  return doc;
}

function elementToValue(rootEl) {
  const allElements = [];           
  const explicitStack = [rootEl];   

  while (explicitStack.length > 0) {
    const el = explicitStack.pop();
    allElements.push(el);

    for (let i = el.children.length - 1; i >= 0; i--) {
      explicitStack.push(el.children[i]);
    }
  }

  const valueMap = new Map();

  for (let i = allElements.length - 1; i >= 0; i--) {
    const el = allElements[i];

    const result = {};
    for (const attr of el.attributes) {
      result[`@${attr.name}`] = attr.value;
    }

    if (el.children.length === 0) {
      const text = el.textContent.trim();

      if (el.attributes.length === 0) {
        valueMap.set(el, text);
        continue;
      }

      if (text) result["#text"] = text;
      valueMap.set(el, result);
      continue;
    }

    const groups = new Map();

    for (let j = 0; j < el.children.length; j++) {
      const child = el.children[j];
      const tag   = child.tagName;

      if (!groups.has(tag)) groups.set(tag, []);
      groups.get(tag).push(child);
    }

    for (const [tag, elements] of groups.entries()) {
      if (elements.length === 1) {
        result[tag] = valueMap.get(elements[0]);
      } else {
        result[tag] = elements.map(child => valueMap.get(child));
      }
    }

    valueMap.set(el, result);
  }

  return valueMap.get(rootEl);
}

function xmlToObj(xmlString) {
  const doc = parseXmlDoc(xmlString);
  const root = doc.documentElement;
  return { [root.tagName]: elementToValue(root) };
}

function objToXmlString(obj) {
  const allNodes = [];
  const explicitStack = [{ parentNode: null, key: null, val: obj }];

  let rootNode = null;

  while (explicitStack.length > 0) {
    const item = explicitStack.pop();
    const { parentNode, key, val } = item;

    if (val && typeof val === "object" && !Array.isArray(val)) {
      let nodeName = key;
      let actualVal = val;

      if (!parentNode) {
        const rootKeys = Object.keys(val).filter(k => !k.startsWith("@"));
        if (rootKeys.length === 0) throw new Error("Object must have a root element tag.");
        nodeName = rootKeys[0];
        actualVal = val[nodeName];
      }

      const el = { tag: nodeName, attrs: [], children: [], text: "" };
      if (!parentNode) {
        rootNode = el;
      } else {
        parentNode.children.push(el);
      }

      allNodes.push({ el, val: actualVal });
      
      const childKeys = Object.keys(actualVal || {});
      for (let i = childKeys.length - 1; i >= 0; i--) {
        const ck = childKeys[i];
        const cv = actualVal[ck];

        if (ck.startsWith("@")) {
          el.attrs.push({ name: ck.slice(1), value: String(cv) });
        } else if (ck === "#text") {
          el.text = String(cv);
        } else if (Array.isArray(cv)) {
          for (let j = cv.length - 1; j >= 0; j--) {
            explicitStack.push({ parentNode: el, key: ck, val: cv[j] });
          }
        } else {
          explicitStack.push({ parentNode: el, key: ck, val: cv });
        }
      }
    } else {
      const el = { tag: key || "item", attrs: [], children: [], text: String(val ?? "") };
      if (parentNode) {
        parentNode.children.push(el);
      }
    }
  }

  function serializeNode(node) {
    const attrStr = node.attrs.map(a => ` ${a.name}="${a.value.replace(/"/g, "&quot;")}"`).join("");
    if (node.children.length === 0 && !node.text) {
      return `<${node.tag}${attrStr}/>`;
    }
    const childrenStr = node.children.map(serializeNode).join("");
    const textStr = node.text ? node.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
    return `<${node.tag}${attrStr}>${childrenStr}${textStr}</${node.tag}>`;
  }

  if (!rootNode) return "";
  return `<?xml version="1.0" encoding="UTF-8"?>\n${serializeNode(rootNode)}`;
}

// ─── CSV Parser & Serializer Helpers ──────────────────────────────────────────

function parseCsv(csvText, delimiter = ",", hasHeaders = true) {
    const lines = [];
    let currentRow = [];
    let currentField = "";
    let insideQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];

        if (insideQuotes) {
            if (char === '"') {
                if (nextChar === '"') {
                    currentField += '"';
                    i++;
                } else {
                    insideQuotes = false;
                }
            } else {
                currentField += char;
            }
        } else {
            if (char === '"') {
                insideQuotes = true;
            } else if (char === delimiter) {
                currentRow.push(currentField.trim());
                currentField = "";
            } else if (char === "\r" || char === "\n") {
                currentRow.push(currentField.trim());
                if (currentRow.some(field => field !== "")) {
                    lines.push(currentRow);
                }
                currentRow = [];
                currentField = "";
                if (char === "\r" && nextChar === "\n") {
                    i++;
                }
            } else {
                currentField += char;
            }
        }
    }

    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some(field => field !== "")) {
            lines.push(currentRow);
        }
    }

    if (lines.length === 0) return [];

    if (!hasHeaders) {
        return lines.map((row) => {
            const obj = {};
            row.forEach((val, idx) => { obj[`column${idx + 1}`] = val; });
            return obj;
        });
    }

    const headers = lines[0].map(h => h || "unnamed");
    const dataRows = lines.slice(1);

    return dataRows.map((row) => {
        const obj = {};
        headers.forEach((header, idx) => {
            obj[header] = row[idx] !== undefined ? row[idx] : "";
        });
        return obj;
    });
}

function serializeCsv(data, delimiter = ",", includeHeaders = true) {
    if (!Array.isArray(data) || data.length === 0) return "";
    const flatData = data.map(item => {
        if (item && typeof item === "object") return item;
        return { value: item };
    });

    const headers = Array.from(new Set(flatData.flatMap(Object.keys)));
    const escapeCsvValue = (val) => {
        const str = String(val ?? "");
        if (str.includes(delimiter) || str.includes('"') || str.includes("\n") || str.includes("\r")) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const rows = [];
    if (includeHeaders) {
        rows.push(headers.map(escapeCsvValue).join(delimiter));
    }

    flatData.forEach((item) => {
        const row = headers.map(header => escapeCsvValue(item[header]));
        rows.push(row.join(delimiter));
    });

    return rows.join("\n");
}

// ─── Format XML Pretty-Printer ───────────────────────────────────────────────

function prettyPrintXml(xmlString) {
    try {
        const doc = parseXmlDoc(xmlString);
        let indent = "";
        const lines = [];

        const allNodes = [];
        const explicitStack = [{ parent: null, node: doc.documentElement, depth: 0 }];

        while (explicitStack.length > 0) {
            const { parent, node, depth } = explicitStack.pop();
            allNodes.push({ parent, node, depth });

            for (let i = node.children.length - 1; i >= 0; i--) {
                explicitStack.push({ parent: node, node: node.children[i], depth: depth + 1 });
            }
        }

        const renderedMap = new Map();

        for (let i = allNodes.length - 1; i >= 0; i--) {
            const { node, depth } = allNodes[i];
            const pad = "  ".repeat(depth);

            const attrStr = Array.from(node.attributes)
                .map(a => ` ${a.name}="${a.value.replace(/"/g, "&quot;")}"`)
                .join("");

            if (node.children.length === 0) {
                const text = node.textContent.trim();
                if (text) {
                    renderedMap.set(node, `${pad}<${node.tagName}${attrStr}>${text}</${node.tagName}>`);
                } else {
                    renderedMap.set(node, `${pad}<${node.tagName}${attrStr}/>`);
                }
                continue;
            }

            const childrenStr = Array.from(node.children)
                .map(c => renderedMap.get(c))
                .join("\n");

            renderedMap.set(node, `${pad}<${node.tagName}${attrStr}>\n${childrenStr}\n${pad}</${node.tagName}>`);
        }

        return `<?xml version="1.0" encoding="UTF-8"?>\n${renderedMap.get(doc.documentElement)}`;
    } catch {
        return xmlString; 
    }
}

// ─── Main Conversions Engine ─────────────────────────────────────────────────

function parseSource(text, format, delimiter, hasHeaders) {
    if (format === "json") return JSON.parse(text);
    if (format === "yaml") return load(text);
    if (format === "csv") return parseCsv(text, delimiter, hasHeaders);
    if (format === "xml") return xmlToObj(text);
    throw new Error(`Unsupported source format: ${format}`);
}

function serializeTarget(obj, format, delimiter, includeHeaders) {
    if (format === "json") return JSON.stringify(obj, null, 2);
    if (format === "yaml") return dump(obj, YAML_OPTIONS);
    if (format === "csv") {
        const array = Array.isArray(obj) ? obj : [obj];
        return serializeCsv(array, delimiter, includeHeaders);
    }
    if (format === "xml") return objToXmlString(obj);
    throw new Error(`Unsupported target format: ${format}`);
}

function runConvert(text, srcFmt, tgtFmt, delimiter, hasHeader) {
    try {
        const parsed = parseSource(text, srcFmt, delimiter, hasHeader);
        const result = serializeTarget(parsed, tgtFmt, delimiter, hasHeader);
        return { result, error: null };
    } catch (err) {
        return { result: "", error: formatErrorFor(srcFmt, err, text) };
    }
}

// ─── Sample Data Generator ────────────────────────────────────────────────────

const getSample = (format, delimiter) => {
    switch (format) {
        case "json": return JSON.stringify(SAMPLE_OBJECT, null, 2);
        case "yaml": return dump(SAMPLE_OBJECT, YAML_OPTIONS);
        case "csv": return serializeCsv(SAMPLE_CSV_ROWS, delimiter, true);
        case "xml": return prettyPrintXml(objToXmlString({ devtasks: SAMPLE_OBJECT }));
        default: return "";
    }
};

// ─── Theme ────────────────────────────────────────────────────────────────────

const buildTheme = (dark) => ({
    page: dark ? "bg-zinc-950" : "bg-[#F7F7F7]",
    panel: dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200",
    textarea: dark
        ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 focus:border-white focus:ring-1 focus:ring-white"
        : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black",
    textareaError: dark
        ? "bg-zinc-950 border-red-500/70 text-white focus:border-red-400 focus:ring-1 focus:ring-red-400"
        : "bg-neutral-50 border-red-400 text-black focus:border-red-500 focus:ring-1 focus:ring-red-500",
    textareaReadonly: dark
        ? "bg-zinc-905 border-zinc-800 text-zinc-300 cursor-default"
        : "bg-white border-neutral-200 text-zinc-700 cursor-default",
    softBtn: dark
        ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
        : "bg-white border-neutral-200 text-zinc-600 hover:text-black hover:border-neutral-400",
    primaryBtn: dark
        ? "bg-white text-black border-white hover:bg-zinc-200"
        : "bg-black text-white border-black hover:bg-zinc-800",
    fmtActive: dark ? "bg-white text-black" : "bg-black text-white",
    fmtInactive: dark
        ? "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
        : "bg-neutral-100 text-zinc-500 hover:text-black hover:bg-neutral-200",
    fmtWrap: dark ? "bg-zinc-800 border-zinc-700" : "bg-neutral-100 border-neutral-200",
    label: dark ? "text-zinc-500" : "text-neutral-400",
    heading: dark ? "text-white" : "text-black",
    subtext: dark ? "text-zinc-500" : "text-neutral-500",
    errorBox: dark ? "bg-red-950/30 border-red-900/70 text-red-200" : "bg-red-50 border-red-200 text-red-700",
    errorLabel: dark ? "text-red-100" : "text-red-800",
    optionsBar: dark ? "bg-zinc-800/60 border-zinc-700" : "bg-neutral-50 border-neutral-200",
    select: dark
        ? "bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-white"
        : "bg-white border-neutral-300 text-black focus:border-black",
    checkLabel: dark ? "text-zinc-300" : "text-zinc-600",
});

// ─── FormatPills ─────────────────────────────────────────────────────────────

const FormatPills = ({ value, onChange, t }) => (
    <div className={`flex rounded-lg border overflow-hidden text-[11px] ${t.fmtWrap}`}>
        {FORMATS.map((fmt) => (
            <button
                key={fmt}
                type="button"
                onClick={() => onChange(fmt)}
                aria-pressed={value === fmt}
                className={`px-3 py-1.5 font-black uppercase tracking-widest transition-all duration-150 ${value === fmt ? t.fmtActive : t.fmtInactive
                    }`}
            >
                {fmt}
            </button>
        ))}
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const JsonYamlCsvXmlConverter = () => {
    const { dark } = useTheme();
    const t = buildTheme(dark);

    // Active main tab: 'formatter' or 'converter'
    const [activeTab, setActiveTab] = useState("formatter");

    // ── Formatter State ──
    const [formatInput, setFormatInput] = useState("");
    const [formatOutput, setFormatOutput] = useState("");

    // ── Converter State ──
    const [srcFmt, setSrcFmt] = useState("json");
    const [tgtFmt, setTgtFmt] = useState("yaml");
    const [srcText, setSrcText] = useState("");
    const [tgtText, setTgtText] = useState("");
    const [delimiter, setDelimiter] = useState(",");
    const [hasHeader, setHasHeader] = useState(true);
    const [error, setError] = useState(null); // { title, message } | null

    // ── Formatter Handlers ──
    const handleFormatterFormat = () => {
        try {
            if (!formatInput.trim()) return;
            const parsed = JSON.parse(formatInput);
            setFormatOutput(JSON.stringify(parsed, null, 2));
            toast.success("JSON Formatted!");
        } catch (error) {
            toast.error("Invalid JSON format");
        }
    };

    const handleFormatterMinify = () => {
        try {
            if (!formatInput.trim()) return;
            const parsed = JSON.parse(formatInput);
            setFormatOutput(JSON.stringify(parsed));
            toast.success("JSON Minified!");
        } catch (error) {
            toast.error("Invalid JSON format");
        }
    };

    const handleFormatterClear = () => {
        setFormatInput("");
        setFormatOutput("");
    };

    const handleFormatterSample = () => {
        const sampleJson = {
            name: "John Doe",
            role: "Frontend Developer",
            skills: ["React", "Next.js", "TypeScript"],
            experience: 3,
            active: true,
        };
        setFormatInput(JSON.stringify(sampleJson, null, 2));
        setFormatOutput("");
    };

    const handleFormatterCopy = async () => {
        if (!formatOutput) return;
        try {
            await navigator.clipboard.writeText(formatOutput);
            toast.success("Copied to clipboard");
        } catch (error) {
            toast.error("Failed to copy");
        }
    };

    // ── Shared conversion runner ─────────────────────────────────────────────

    const applyConversion = (text, sf, tf, delim, hdr) => {
        if (!text.trim()) {
            setTgtText("");
            setError(null);
            return;
        }
        const { result, error: err } = runConvert(text, sf, tf, delim, hdr);
        setTgtText(result);
        setError(err);
    };

    // ── Event handlers ───────────────────────────────────────────────────────

    // User types in the source textarea
    const handleSrcChange = (value) => {
        setSrcText(value);
        applyConversion(value, srcFmt, tgtFmt, delimiter, hasHeader);
    };

    // Source format pill clicked
    const handleSrcFmtChange = (fmt) => {
        if (fmt === srcFmt) return;
        setSrcFmt(fmt);
        setSrcText("");
        setTgtText("");
        setError(null);
    };

    // Target format pill clicked
    const handleTgtFmtChange = (fmt) => {
        if (fmt === tgtFmt) return;
        setTgtFmt(fmt);
        applyConversion(srcText, srcFmt, fmt, delimiter, hasHeader);
    };

    // Swap
    const handleSwap = () => {
        const prevSrcFmt = srcFmt;
        const prevTgtFmt = tgtFmt;
        const prevTgtText = tgtText;

        setSrcFmt(prevTgtFmt);
        setTgtFmt(prevSrcFmt);
        setSrcText(prevTgtText);

        if (!prevTgtText.trim()) {
            setTgtText("");
            setError(null);
            return;
        }
        applyConversion(prevTgtText, prevTgtFmt, prevSrcFmt, delimiter, hasHeader);
    };

    // CSV option: delimiter changed
    const handleDelimiterChange = (delim) => {
        setDelimiter(delim);
        applyConversion(srcText, srcFmt, tgtFmt, delim, hasHeader);
    };

    // CSV option: hasHeader toggled
    const handleHeaderChange = (val) => {
        setHasHeader(val);
        applyConversion(srcText, srcFmt, tgtFmt, delimiter, val);
    };

    // Load format-appropriate sample data
    const handleSample = () => {
        const sample = getSample(srcFmt, delimiter);
        setSrcText(sample);
        applyConversion(sample, srcFmt, tgtFmt, delimiter, hasHeader);
        toast.success("Sample data loaded");
    };

    // Beautify/normalize the source text in-place
    const handleFormat = () => {
        if (!srcText.trim()) return;
        let parsed;
        try {
            parsed = parseSource(srcText, srcFmt, delimiter, hasHeader);
        } catch (err) {
            const { title, message } = formatErrorFor(srcFmt, err, srcText);
            setError({ title, message });
            toast.error("Fix syntax errors before formatting");
            return;
        }
        try {
            const beautified = serializeTarget(parsed, srcFmt, delimiter, hasHeader);
            setSrcText(beautified);
            applyConversion(beautified, srcFmt, tgtFmt, delimiter, hasHeader);
            toast.success("Formatted successfully");
        } catch (err) {
            setError({
                title: "Format failed",
                message: err instanceof Error ? err.message : "Could not format the source.",
            });
            toast.error("Formatting failed");
        }
    };

    // Clear both panels
    const handleClear = () => {
        setSrcText("");
        setTgtText("");
        setError(null);
    };

    // Copy a panel's text to clipboard
    const handleCopy = async (value, label) => {
        if (!value.trim()) { toast.error(`No ${label} to copy`); return; }
        try {
            await navigator.clipboard.writeText(value);
            toast.success(`${label} copied`);
        } catch {
            toast.error(`Failed to copy ${label}`);
        }
    };

    const showCsvOptions = srcFmt === "csv" || tgtFmt === "csv";

    return (
        <div className={`min-h-[calc(100vh-76px)] px-4 py-6 transition-colors duration-300 sm:px-6 ${t.page}`}>
            <title>JSON & Data Format Suite | DevTasks</title>
            <meta name="description" content="Format, beautify, and convert between JSON, YAML, CSV, and XML formats offline with live validation." />

            <div className={`mx-auto flex w-full max-w-7xl flex-col overflow-hidden rounded-3xl border shadow-xl transition-colors duration-300 ${t.panel}`}>
                {/* Accent bar */}
                <div className={`h-2 w-full ${dark ? "bg-white" : "bg-black"}`} />

                {/* Header */}
                <header className="flex flex-col gap-4 px-5 pt-6 sm:px-8 sm:pt-8">
                    {/* Title + Tab Selectors */}
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
                                    JSON & Data Format Suite
                                </h1>
                                <p className={`mt-0.5 text-sm font-medium ${t.subtext}`}>
                                    JSON formatting/minifying and multi-format conversion suite.
                                </p>
                            </div>
                        </div>

                        {/* View Tabs */}
                        <div className="flex border rounded-2xl p-1 bg-zinc-150 dark:bg-zinc-800 border-neutral-205 dark:border-zinc-750 shrink-0">
                            <button
                                onClick={() => setActiveTab("formatter")}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                                    activeTab === "formatter"
                                        ? dark
                                            ? "bg-white text-black"
                                            : "bg-black text-white"
                                        : "bg-transparent text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                                }`}
                            >
                                Format & Minify
                            </button>
                            <button
                                onClick={() => setActiveTab("converter")}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                                    activeTab === "converter"
                                        ? dark
                                            ? "bg-white text-black"
                                            : "bg-black text-white"
                                        : "bg-transparent text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                                }`}
                            >
                                Convert Formats
                            </button>
                        </div>
                    </div>
                </header>

                {/* ── Tab 1: Formatter & Minifier ── */}
                {activeTab === "formatter" && (
                    <main className="flex flex-col gap-5 p-5 sm:p-8">
                        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                            {/* Input Column */}
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center h-8">
                                    <span className={`text-[11px] font-black uppercase tracking-widest ${t.label}`}>
                                        JSON Input
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleFormatterSample}
                                        className={`rounded-xl border px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-all duration-200 ${t.softBtn}`}
                                    >
                                        Sample JSON
                                    </button>
                                </div>
                                <textarea
                                    value={formatInput}
                                    onChange={(e) => setFormatInput(e.target.value)}
                                    placeholder='{\n  "key": "value"\n}'
                                    spellCheck={false}
                                    className={`min-h-[340px] lg:min-h-[460px] w-full resize-none rounded-2xl border px-4 py-3 font-mono text-sm leading-6 outline-none transition-all duration-200 ${t.textarea}`}
                                />
                            </div>

                            {/* Output Column */}
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center h-8">
                                    <span className={`text-[11px] font-black uppercase tracking-widest ${t.label}`}>
                                        Formatted Output
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleFormatterCopy}
                                        disabled={!formatOutput}
                                        className={`rounded-xl border px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-all duration-200 ${t.softBtn} disabled:opacity-40`}
                                    >
                                        Copy
                                    </button>
                                </div>
                                <textarea
                                    value={formatOutput}
                                    readOnly
                                    placeholder="Result will appear here..."
                                    spellCheck={false}
                                    className={`min-h-[340px] lg:min-h-[460px] w-full resize-none rounded-2xl border px-4 py-3 font-mono text-sm leading-6 outline-none transition-all duration-200 ${t.textareaReadonly}`}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4 pt-4">
                            <button
                                onClick={handleFormatterFormat}
                                className={`rounded-xl border px-6 py-3 text-xs font-black uppercase tracking-widest transition-all duration-200 hover:scale-105 ${t.primaryBtn}`}
                            >
                                Format
                            </button>
                            <button
                                onClick={handleFormatterMinify}
                                className={`rounded-xl border px-6 py-3 text-xs font-black uppercase tracking-widest transition-all duration-200 hover:scale-105 ${t.primaryBtn}`}
                            >
                                Minify
                            </button>
                            <button
                                onClick={handleFormatterClear}
                                className={`rounded-xl border px-6 py-3 text-xs font-black uppercase tracking-widest transition-all duration-200 hover:scale-105 ${t.softBtn}`}
                            >
                                Clear
                            </button>
                        </div>
                    </main>
                )}

                {/* ── Tab 2: Converter ── */}
                {activeTab === "converter" && (
                    <main className="flex flex-col gap-5 p-5 sm:p-8">
                        {/* CSV Options (only visible when CSV in active conversion) */}
                        {showCsvOptions && (
                            <div className={`flex flex-wrap items-center gap-5 rounded-2xl border px-4 py-3 ${t.optionsBar}`}>
                                <span className={`text-[11px] font-black uppercase tracking-widest ${t.label}`}>
                                    CSV Options
                                </span>

                                <label className="flex items-center gap-2">
                                    <span className={`text-xs font-semibold ${t.checkLabel}`}>Delimiter</span>
                                    <select
                                        value={delimiter}
                                        onChange={(e) => handleDelimiterChange(e.target.value)}
                                        className={`rounded-lg border px-2 py-1 text-xs font-mono outline-none ${t.select}`}
                                    >
                                        {DELIMITER_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                </label>

                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={hasHeader}
                                        onChange={(e) => handleHeaderChange(e.target.checked)}
                                        className="h-4 w-4 cursor-pointer accent-current rounded"
                                    />
                                    <span className={`text-xs font-semibold ${t.checkLabel}`}>First row is header</span>
                                </label>

                                <span className={`ml-auto text-[11px] font-mono font-bold rounded-lg px-2 py-1 border ${t.optionsBar}`}>
                                    {srcFmt.toUpperCase()} → {tgtFmt.toUpperCase()}
                                </span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_44px_1fr]">
                            {/* Source Panel */}
                            <section className="flex flex-col gap-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[11px] font-black uppercase tracking-widest ${t.label}`}>Source</span>
                                        <FormatPills value={srcFmt} onChange={handleSrcFmtChange} t={t} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleSample}
                                            className={`rounded-xl border px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-all duration-205 ${t.softBtn}`}
                                        >
                                            Sample
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(srcText, `${srcFmt.toUpperCase()} source`)}
                                            className={`rounded-xl border px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${t.softBtn}`}
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    value={srcText}
                                    onChange={(e) => handleSrcChange(e.target.value)}
                                    spellCheck={false}
                                    placeholder={
                                        srcFmt === "json" ? '{\n  "key": "value"\n}'
                                            : srcFmt === "yaml" ? "key: value"
                                                : "column1,column2\nvalue1,value2"
                                    }
                                    className={`min-h-[340px] lg:min-h-[460px] w-full resize-none rounded-2xl border px-4 py-3 font-mono text-sm leading-6 outline-none transition-all duration-200 ${error ? t.textareaError : t.textarea
                                        }`}
                                />
                            </section>

                            {/* Swap Button */}
                            <div className="flex items-center justify-center pt-0 lg:pt-14">
                                <button
                                    type="button"
                                    onClick={handleSwap}
                                    title="Swap source and output"
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 active:scale-95 ${t.swapBtn}`}
                                >
                                    {/* Vertical on desktop */}
                                    <svg className="hidden h-4 w-4 lg:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                    {/* Horizontal on mobile */}
                                    <svg className="h-4 w-4 lg:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7H4m0 0l4-4M4 7l4 4M8 17h12m0 0l-4-4m4 4l-4 4" />
                                    </svg>
                                </button>
                            </div>

                            {/* Output Panel (read-only) */}
                            <section className="flex flex-col gap-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[11px] font-black uppercase tracking-widest ${t.label}`}>Output</span>
                                        <FormatPills value={tgtFmt} onChange={handleTgtFmtChange} t={t} />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(tgtText, `${tgtFmt.toUpperCase()} output`)}
                                        className={`rounded-xl border px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${t.softBtn}`}
                                    >
                                        Copy
                                    </button>
                                </div>
                                <textarea
                                    value={tgtText}
                                    readOnly
                                    spellCheck={false}
                                    placeholder={
                                        tgtFmt === "json" ? "Converted JSON appears here…"
                                            : tgtFmt === "yaml" ? "Converted YAML appears here…"
                                                : "Converted CSV appears here…"
                                    }
                                    className={`min-h-[340px] lg:min-h-[460px] w-full resize-none rounded-2xl border px-4 py-3 font-mono text-sm leading-6 outline-none transition-all duration-200 select-all ${t.textareaReadonly}`}
                                />
                            </section>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4 pt-4">
                            <button
                                onClick={handleFormat}
                                className={`rounded-xl border px-6 py-3 text-xs font-black uppercase tracking-widest transition-all duration-200 hover:scale-105 ${t.softBtn}`}
                            >
                                Format Source
                            </button>
                            <button
                                onClick={handleClear}
                                className={`rounded-xl border px-6 py-3 text-xs font-black uppercase tracking-widest transition-all duration-200 hover:scale-105 ${t.softBtn}`}
                            >
                                Clear
                            </button>
                        </div>

                        {/* Error box */}
                        {error && (
                            <div
                                className={`rounded-2xl border px-4 py-3 font-mono text-sm ${t.errorBox}`}
                                role="alert"
                                aria-live="polite"
                            >
                                <span className={`mr-2 font-black uppercase tracking-widest ${t.errorLabel}`}>
                                    {error.title}:
                                </span>
                                {error.message}
                            </div>
                        )}
                    </main>
                )}
            </div>
        </div>
    );
};

export default JsonYamlCsvXmlConverter;