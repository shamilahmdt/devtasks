import { useState } from "react";
import { Link } from "react-router-dom";
import { dump, load } from "js-yaml";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const FORMATS = ["json", "yaml", "csv"];

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

const formatErrorFor = (format, error, source) => {
    if (format === "json") return { title: "Invalid JSON", message: formatJsonParseError(error, source) };
    if (format === "yaml") return { title: "Invalid YAML", message: formatYamlParseError(error) };
    return { title: "Invalid CSV", message: error instanceof Error ? error.message : "Invalid CSV input." };
};

// ─── CSV Parser ───────────────────────────────────────────────────────────────
//
// Uses a single-pass character tokenizer instead of line.split() so that
// quoted fields containing newlines, commas, or the chosen delimiter are
// handled correctly without any third-party library.

const tokenizeCsv = (text, delimiter) => {
    text = text.replace(/\r\n/g, "\n");
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];

        if (inQuotes) {
            if (ch === '"' && text[i + 1] === '"') {
                field += '"';
                i++;
            } else if (ch === '"') {
                inQuotes = false;
            } else {
                field += ch; // KEEP newlines safely inside quotes
            }
            continue;
        }

        if (ch === '"') {
            inQuotes = true;
            continue;
        }

        if (text.slice(i, i + delimiter.length) === delimiter) {
            row.push(field);
            field = "";
            i += delimiter.length - 1;
            continue;
        }

        if (ch === "\n") {
            row.push(field);
            rows.push(row);
            row = [];
            field = "";
            continue;
        }

        if (ch === "\r") continue;

        field += ch;
    }

    row.push(field);
rows.push(row);
    return rows;
};

/**
 * Parse CSV text into an array of objects.
 *
 * - hasHeader=true  → first row becomes object keys
 * - hasHeader=false → keys are auto-generated: field1, field2, …
 * - Returns [] for empty or header-only input (no error)
 */
const parseCsv = (csv, delimiter = ",", hasHeader = true) => {
    const rows = tokenizeCsv(csv, delimiter);

    if (rows.length === 0) return [];

    const colCount = Math.max(...rows.map(r => r.length));

    const normalizeRow = (row) => {
        const out = new Array(colCount).fill("");
        row.forEach((v, i) => {
            out[i] = v;
        });
        return out;
    };

    const normalized = rows.map(normalizeRow);

const inferType = (v) => {
    const val = v.trim();

    if (val === "") return "";

    if (val === "true") return true;
    if (val === "false") return false;

    // number detection
    if (/^-?\d+(\.\d+)?$/.test(val)) return Number(val);

    // array detection (pipe-separated)
    if (val.includes("|")) {
        return val.split("|").map(x => inferType(x));
    }

    // JSON detection (safe parse)
    if (
        (val.startsWith("{") && val.endsWith("}")) ||
        (val.startsWith("[") && val.endsWith("]"))
    ) {
        try {
            return JSON.parse(val);
        } catch {
            return val;
        }
    }

    return val;
};
    if (hasHeader) {
        const headers = normalized[0].map((h, i) => {
    const clean = h.trim().replace(/^"|"$/g, "");
    return clean || `col_${i}`;
});
        if (normalized.length === 1) return [];

        return normalized.slice(1).map(row => {
            const obj = {};
            headers.forEach((h, i) => {
                obj[h] = inferType(row[i]);
            });
            return obj;
        });
    }

    return normalized.map(row => {
        const obj = {};
        row.forEach((v, i) => {
            obj[`field${i + 1}`] = inferType(v);
        });
        return obj;
    });
};

// ─── CSV Serializer ───────────────────────────────────────────────────────────

/**
 * Quote a single CSV field only when necessary (RFC 4180).
 */
const escapeCsvField = (value, delimiter) => {
    const str = value === null || value === undefined ? "" : String(value);

    const mustQuote =
        str.includes(delimiter) ||
        str.includes('"') ||
        str.includes("\n") ||
        str.includes("\r") ||
        str.startsWith(" ") ||
        str.endsWith(" ");

    if (!mustQuote) return str;

    return `"${str.replace(/"/g, '""')}"`;
};
const safeStringify = (val) => {
    try {
        return JSON.stringify(val);
    } catch {
        return String(val);
    }
};
/**
 * Recursively flatten a nested object into dot-notation keys.
 * Arrays are serialized as pipe-separated strings (a|b|c).
 * Scalars (string/number/boolean/null) at the top level get key "value".
 */
const flattenObject = (obj, prefix = "") => {
    const result = {};

    const safeArray = (arr) =>
    arr.map(v =>
        v === null || v === undefined
            ? ""
            : typeof v === "object"
                ? JSON.stringify(v)
                : String(v)
    ).join("|");

    const walk = (current, currentKey) => {
        if (current === null || current === undefined) {
            result[currentKey] = "";
            return;
        }

        if (Array.isArray(current)) {
            result[currentKey] = current.map(safeValue).join("|");
            return;
        }

        if (typeof current !== "object") {
            result[currentKey] = current;
            return;
        }

        for (const key of Object.keys(current)) {
            const val = current[key];
            const newKey = currentKey ? `${currentKey}.${key}` : key;

            if (val === null || val === undefined) {
                result[newKey] = "";
           } else if (Array.isArray(val)) {
    result[newKey] = safeArray(val);
}else if (typeof val === "object") {
                walk(val, newKey);
            } else {
                result[newKey] = val;
            }
        }
    };

    if (obj === null || obj === undefined) {
        return prefix ? { [prefix]: "" } : {};
    }

    walk(obj, prefix);

    return result;
};
/**
 * Serialize a JS value to CSV text.
 *
 * Accepts:
 *   - Array of objects (standard case)
 *   - Single object (wrapped in array automatically)
 *   - Array of scalars (produces a single "value" column)
 *
 * includeHeader mirrors the hasHeader setting so CSV→CSV round-trips cleanly.
 */
const serializeCsv = (data, delimiter = ",", includeHeader = true) => {
    const arr = Array.isArray(data)
        ? data
        : data !== null && data !== undefined
            ? [data]
            : [];

    if (!arr.length) {
        throw new Error("No data available for CSV conversion.");
    }

    const flatRows = arr.map(row => {
        if (row === null || row === undefined) return { value: "" };
        if (typeof row !== "object") return { value: String(row) };
        return flattenObject(row);
    });

    const keySet = new Set();

flatRows.forEach(row => {
    Object.keys(row).forEach(k => keySet.add(k));
});

const keys = Array.from(keySet);
    if (!keys.length) {
        throw new Error("Cannot convert empty structure to CSV.");
    }

    const lines = flatRows.map(row =>
        keys.map(k => escapeCsvField(row[k], delimiter)).join(delimiter)
    );

    return includeHeader
        ? [keys.join(delimiter), ...lines].join("\n")
        : lines.join("\n");
};

// ─── Core Conversion Engine ───────────────────────────────────────────────────

/**
 * Parse source text into an intermediate JS value.
 * Throws with a format-specific error on failure.
 */
const parseSource = (text, format, delimiter, hasHeader) => {
    switch (format) {
        case "json": return JSON.parse(text);
        case "yaml": {
    const res = load(text);
    return res ?? {};
}
        case "csv": return parseCsv(text, delimiter, hasHeader);
        default: throw new Error(`Unknown source format: ${format}`);
    }
};

/**
 * Serialize an intermediate JS value to the target format text.
 * Throws if the value is incompatible with the target (e.g. empty array → CSV).
 */
const serializeTarget = (value, format, delimiter, hasHeader) => {
    switch (format) {
        case "json": return JSON.stringify(value ?? null, null, 2);
        case "yaml": return dump(value ?? null, YAML_OPTIONS);
        case "csv": return serializeCsv(value, delimiter, hasHeader);
        default: throw new Error(`Unknown target format: ${format}`);
    }
};

/**
 * Full conversion pipeline. Never throws — returns { result, error }.
 *
 * Error classification:
 *   - Parse error  → blame source format
 *   - Serialize error → blame the conversion (incompatible data shape)
 */
const runConvert = (sourceText, srcFmt, tgtFmt, delimiter, hasHeader) => {
    if (!sourceText.trim()) return { result: "", error: null };

    let parsed;
    try {
        parsed = parseSource(sourceText, srcFmt, delimiter, hasHeader);
    } catch (err) {
        return { result: "", error: formatErrorFor(srcFmt, err, sourceText) };
    }

    // Same format → beautify/normalize only
    if (srcFmt === tgtFmt) {
        try {
            // For CSV same-format, re-serialize with the correct includeHeader
            return { result: serializeTarget(parsed, tgtFmt, delimiter, hasHeader), error: null };
        } catch (err) {
            return { result: "", error: formatErrorFor(srcFmt, err, sourceText) };
        }
    }

    try {
        const result = serializeTarget(parsed, tgtFmt, delimiter, hasHeader);
        return { result, error: null };
    } catch (err) {
        // Serialization failure → data shape incompatible with target
        return {
            result: "",
            error: {
                title: `Cannot convert to ${tgtFmt.toUpperCase()}`,
                message: err instanceof Error ? err.message : `Failed to serialize as ${tgtFmt}.`,
            },
        };
    }
};

// ─── Sample Data Generator ────────────────────────────────────────────────────

const getSample = (format, delimiter) => {
    switch (format) {
        case "json": return JSON.stringify(SAMPLE_OBJECT, null, 2);
        case "yaml": return dump(SAMPLE_OBJECT, YAML_OPTIONS);
        case "csv": return serializeCsv(SAMPLE_CSV_ROWS, delimiter, true);
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
        ? "bg-zinc-900 border-zinc-800 text-zinc-300 cursor-default"
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
    swapBtn: dark
        ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 hover:bg-zinc-700"
        : "bg-white border-neutral-200 text-zinc-500 hover:text-black hover:border-neutral-400",
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

const JsonYamlCsvConverter = () => {
    const { dark } = useTheme();
    const t = buildTheme(dark);

    const [srcFmt, setSrcFmt] = useState("json");
    const [tgtFmt, setTgtFmt] = useState("yaml");
    const [srcText, setSrcText] = useState("");
    const [tgtText, setTgtText] = useState("");
    const [delimiter, setDelimiter] = useState(",");
    const [hasHeader, setHasHeader] = useState(true);
    const [error, setError] = useState(null); // { title, message } | null

    // ── Shared conversion runner ─────────────────────────────────────────────

    const applyConversion = (text, sf, tf, delim, hdr) => {
        if (!text.trim()) {
            setTgtText("");
            setError(null);
            toast.info("Input is empty");
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

    // Source format pill clicked:
    // Clear both panels — existing text belongs to the old format,
    // re-parsing it as a different format would always show a misleading error.
    const handleSrcFmtChange = (fmt) => {
        if (fmt === srcFmt) return;
        setSrcFmt(fmt);
        setSrcText("");
        setTgtText("");
        setError(null);
    };

    // Target format pill clicked:
    // Keep the source text; just re-convert it to the new target format.
    const handleTgtFmtChange = (fmt) => {
        if (fmt === tgtFmt) return;
        setTgtFmt(fmt);
        applyConversion(srcText, srcFmt, fmt, delimiter, hasHeader);
    };

    // Swap: the current output becomes the new input, formats are exchanged.
    const handleSwap = () => {
        const prevSrcFmt = srcFmt;
        const prevTgtFmt = tgtFmt;
        const prevTgtText = tgtText; // use output as new source

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

    // CSV option: delimiter changed → re-convert current source
    const handleDelimiterChange = (delim) => {
        setDelimiter(delim);
        applyConversion(srcText, srcFmt, tgtFmt, delim, hasHeader);
    };

    // CSV option: hasHeader toggled → re-convert current source
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

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div className={`min-h-[calc(100vh-76px)] px-4 py-6 transition-colors duration-300 sm:px-6 ${t.page}`}>
            <title>JSON YAML CSV Converter — DevTasks</title>
            <meta name="description" content="Convert between JSON, YAML, and CSV formats offline with live validation." />

            <div className={`mx-auto flex w-full max-w-7xl flex-col overflow-hidden rounded-3xl border shadow-xl transition-colors duration-300 ${t.panel}`}>

                {/* Accent bar */}
                <div className={`h-2 w-full ${dark ? "bg-white" : "bg-black"}`} />

                {/* Header */}
                <header className="flex flex-col gap-4 px-5 pt-6 sm:px-8 sm:pt-8">

                    {/* Title + action buttons */}
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
                                    JSON · YAML · CSV Converter
                                </h1>
                                <p className={`mt-0.5 text-sm font-medium ${t.subtext}`}>
                                    Live conversion · works offline · no data leaves your browser
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button type="button" onClick={handleSample}
                                className={`rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${t.primaryBtn}`}>
                                Sample Data
                            </button>
                            <button type="button" onClick={handleFormat}
                                className={`rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${t.softBtn}`}>
                                Format / Beautify
                            </button>
                            <button type="button" onClick={handleClear}
                                className={`rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${t.softBtn}`}>
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* CSV options row — only shown when either panel is CSV */}
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
                </header>

                {/* Editor panels */}
                <main className="flex flex-col gap-5 p-5 sm:p-8">
                    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_44px_1fr]">

                        {/* ── Source panel ── */}
                        <section className="flex flex-col gap-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className={`text-[11px] font-black uppercase tracking-widest ${t.label}`}>Source</span>
                                    <FormatPills value={srcFmt} onChange={handleSrcFmtChange} t={t} />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleCopy(srcText, `${srcFmt.toUpperCase()} source`)}
                                    className={`rounded-xl border px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${t.softBtn}`}
                                >
                                    Copy
                                </button>
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

                        {/* ── Swap button ── */}
                        <div className="flex items-center justify-center pt-0 lg:pt-10">
                            <button
                                type="button"
                                onClick={handleSwap}
                                title="Swap source and output"
                                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 active:scale-95 ${t.swapBtn}`}
                            >
                                {/* Vertical on desktop */}
                                <svg className="hidden h-4 w-4 lg:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                        d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                                </svg>
                                {/* Horizontal on mobile */}
                                <svg className="h-4 w-4 lg:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                        d="M16 7H4m0 0l4-4M4 7l4 4M8 17h12m0 0l-4-4m4 4l-4 4" />
                                </svg>
                            </button>
                        </div>

                        {/* ── Output panel (read-only) ── */}
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
            </div>
        </div>
    );
};

export default JsonYamlCsvConverter;