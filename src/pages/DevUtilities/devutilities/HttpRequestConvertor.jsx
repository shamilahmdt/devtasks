import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { toast } from "sonner";

// ─── Supported Formats ─────────────────────────────────────────────────────────

const FORMATS = ["curl", "fetch", "axios"];

// ─── Default Starter Snippets ──────────────────────────────────────────────────

const DEFAULT_SNIPPETS = {
    curl: `curl https://api.example.com/users`,

    fetch: `fetch("https://api.example.com/users");`,

    axios: `axios.get("https://api.example.com/users");`,
};

// ─── Sample Requests ───────────────────────────────────────────────────────────

const SAMPLE_REQUESTS = {
    curl: `curl -X POST "https://api.example.com/users" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
}'`,

    fetch: `fetch("https://api.example.com/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_TOKEN"
  },
  body: JSON.stringify({
    name: "John Doe",
    email: "john@example.com"
  })
});`,

    axios: `axios.post(
  "https://api.example.com/users",
  {
    name: "John Doe",
    email: "john@example.com"
  },
  {
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_TOKEN"
    }
  }
);`,
};

// ─── Error Formatters ──────────────────────────────────────────────────────────

const formatCurlParseError = (error) => ({
    title: "Invalid cURL Request",
    message:
        error?.message ||
        "Unable to parse the cURL command. Check the syntax, quotes, or flags.",
});

const formatFetchParseError = (error) => ({
    title: "Invalid Fetch Request",
    message:
        error?.message ||
        "Unable to parse the Fetch API request. Ensure it follows fetch(url, options).",
});

const formatAxiosParseError = (error) => ({
    title: "Invalid Axios Request",
    message:
        error?.message ||
        "Unable to parse the Axios request. Check the request syntax.",
});

const formatErrorFor = (format, error) => {
    switch (format) {
        case "curl":
            return formatCurlParseError(error);

        case "fetch":
            return formatFetchParseError(error);

        case "axios":
            return formatAxiosParseError(error);

        default:
            return {
                title: "Conversion Error",
                message: error?.message || "An unexpected error occurred.",
            };
    }
};

// ─── Parsers & Helpers ──────────────────────────────────────────

function stripQuotes(value) {
    if (typeof value !== "string") {
        return value;
    }
    value = value.trim();
    if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
    ) {
        return value.slice(1, -1);
    }

    return value;
}

function parseCurl(curlCommand) {
    if (!curlCommand.trim()) {
        throw new Error("cURL command cannot be empty.");
    }

    curlCommand = curlCommand.replace(/\\\s*\n/g, " ");

    const tokens = curlCommand.match(/"[^"]*"|'[^']*'|\S+/g);

    if (!tokens || tokens.length === 0) {
        throw new Error("Invalid cURL command.");
    }

    if (tokens[0] !== "curl") {
        throw new Error('Command must start with "curl".');
    }

    let method = "GET";
    let url = "";
    const headers = {};
    let body = null;

    for (let i = 1; i < tokens.length; i++) {
        const token = tokens[i];

        switch (token) {
            case "-X":
            case "--request": {
                if (i + 1 >= tokens.length) {
                    throw new Error("Missing HTTP method after -X.");
                }
                method = tokens[++i]
                    .replace(/^['"]|['"]$/g, "")
                    .toUpperCase();
                break;
            }

            case "-H":
            case "--header": {
                if (i + 1 >= tokens.length) {
                    throw new Error("Missing header after -H.");
                }
                const header = tokens[++i].replace(/^['"]|['"]$/g, "");
                const separator = header.indexOf(":");
                if (separator === -1) {
                    throw new Error(`Invalid header "${header}".`);
                }

                const key = header.slice(0, separator).trim();
                const value = header.slice(separator + 1).trim();
                headers[key] = value;
                break;
            }

            case "-d":
            case "--data": {
                if (i + 1 >= tokens.length) {
                    throw new Error("Missing request body after -d.");
                }
                body = tokens[++i].replace(/^['"]|['"]$/g, "");
                break;
            }

            default: {
                const value = stripQuotes(token);

                if (/^https?:\/\//i.test(value)) {
                    url = value;
                }

                break;
            }
        }
    }

    if (!url) {
        throw new Error("Missing request URL.");
    }
    if (body && method === "GET") {
        method = "POST";
    }

    return {
        method,
        url,
        headers,
        body,
    };
}

function extractBalanced(text, startIndex, openChar, closeChar) {
    let depth = 0;

    for (let i = startIndex; i < text.length; i++) {
        if (text[i] === openChar) depth++;
        else if (text[i] === closeChar) depth--;

        if (depth === 0) {
            return text.slice(startIndex, i + 1);
        }
    }

    return null;
}

function findTopLevelProperty(options, property) {
    const propertyRegex = new RegExp(
        `(?:^|[,{]\\s*)["']?${property}["']?\\s*:`
    );
    const match = propertyRegex.exec(options);

    if (!match) return null;

    let index = match.index + match[0].length;

    while (index < options.length && /\s/.test(options[index])) {
        index++;
    }

    const start = index;

    let braceDepth = 0;
    let bracketDepth = 0;
    let parenDepth = 0;
    let inQuote = null;

    while (index < options.length) {
        const char = options[index];

        if (inQuote) {
            if (char === "\\" && index + 1 < options.length) {
                index += 2;
                continue;
            }

            if (char === inQuote) {
                inQuote = null;
            }

            index++;
            continue;
        }

        if (char === '"' || char === "'") {
            inQuote = char;
            index++;
            continue;
        }

        switch (char) {
            case "{":
                braceDepth++;
                break;

            case "}":
                if (braceDepth === 0 && bracketDepth === 0 && parenDepth === 0) {
                    return options.slice(start, index).trim();
                }
                braceDepth--;
                break;

            case "(":
                parenDepth++;
                break;

            case ")":
                parenDepth--;
                break;

            case "[":
                bracketDepth++;
                break;

            case "]":
                bracketDepth--;
                break;

            case ",":
                if (
                    braceDepth === 0 &&
                    bracketDepth === 0 &&
                    parenDepth === 0
                ) {
                    return options.slice(start, index).trim();
                }
                break;
        }

        index++;
    }

    return options.slice(start).trim();
}

function splitTopLevel(text, delimiter = ",") {
    if (!text.trim()) {
        return [];
    }

    const parts = [];
    let start = 0;
    let braceDepth = 0;
    let bracketDepth = 0;
    let parenDepth = 0;
    let inQuote = null;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (inQuote) {
            if (char === "\\" && i + 1 < text.length) {
                i++;
                continue;
            }
            if (char === inQuote) {
                inQuote = null;
            }
            continue;
        }
        if (char === '"' || char === "'") {
            inQuote = char;
            continue;
        }

        switch (char) {
            case "{":
                braceDepth++;
                break;
            case "}":
                braceDepth--;
                break;
            case "[":
                bracketDepth++;
                break;
            case "]":
                bracketDepth--;
                break;
            case "(":
                parenDepth++;
                break;
            case ")":
                parenDepth--;
                break;

            default:
                if (
                    char === delimiter &&
                    braceDepth === 0 &&
                    bracketDepth === 0 &&
                    parenDepth === 0
                ) {
                    parts.push(text.slice(start, i).trim());
                    start = i + 1;
                }
        }
    }

    const lastPart = text.slice(start).trim();

    if (lastPart) {
        parts.push(lastPart);
    }

    return parts;
}

function parseHeaders(headersString) {
    if (!headersString) {
        return {};
    }
    headersString = headersString.trim();

    if (
        !headersString.startsWith("{") ||
        !headersString.endsWith("}")
    ) {
        throw new Error("Headers must be an object.");
    }

    const parsedHeaders = {};

    const entries = splitTopLevel(headersString.slice(1, -1).trim());
    if (!entries) {
        return parsedHeaders;
    }
    for (const entry of entries) {
        const separator = entry.indexOf(":");
        if (separator === -1) {
            throw new Error(`Invalid header: ${entry}`);
        }

        const key = stripQuotes(
            entry.slice(0, separator).trim()
        );
        const value = stripQuotes(
            entry.slice(separator + 1).trim()
        );
        parsedHeaders[key] = value;
    }

    return parsedHeaders;
}

function parseBody(bodyString) {
    if (!bodyString) {
        return null;
    }
    bodyString = bodyString.trim();

    if (bodyString.startsWith("JSON.stringify")) {
        const parenIndex = bodyString.indexOf("(");
        const extracted = extractBalanced(
            bodyString,
            parenIndex,
            "(",
            ")"
        );
        if (!extracted) {
            throw new Error("Invalid JSON.stringify() call.");
        }
        return extracted.slice(1, -1).trim();
    }

    const trimmed = bodyString.trim();
    if (
        (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
        const unquoted = stripQuotes(trimmed);
        const looksLikeJson =
            unquoted.startsWith("{") || unquoted.startsWith("[");
        if (looksLikeJson) {
            return unquoted;
        }
        return JSON.stringify(unquoted);
    }
    return trimmed;
}

function parseFetch(fetchCode) {
    if (!fetchCode.trim()) {
        throw new Error("Fetch request cannot be empty.");
    }

    fetchCode = fetchCode.trim();
    if (!fetchCode.startsWith("fetch")) {
        throw new Error('Request must start with "fetch".');
    }

    const urlMatch = fetchCode.match(
        /fetch\s*\(\s*(['"])(.*?)\1/
    );
    if (!urlMatch) {
        throw new Error("Could not find request URL.");
    }
    const url = urlMatch[2];

    let method = "GET";
    let headers = {};
    let body = null;

    const commaIndex = fetchCode.indexOf(",", urlMatch.index);
    if (commaIndex !== -1) {
        const optionsStart = fetchCode.indexOf("{", commaIndex);
        if (optionsStart === -1) {
            throw new Error("Invalid Fetch options object.");
        }
        const options = extractBalanced(
            fetchCode,
            optionsStart,
            "{",
            "}"
        );
        if (!options) {
            throw new Error("Unclosed Fetch options object.");
        }

        const parsedMethod = findTopLevelProperty(options, "method");
        if (parsedMethod) {
            method = stripQuotes(parsedMethod).toUpperCase();
        }
        headers = parseHeaders(
            findTopLevelProperty(options, "headers")
        );
        body = parseBody(
            findTopLevelProperty(options, "body")
        );
        if (body && method === "GET") {
            method = "POST";
        }
    }

    return {
        method,
        url,
        headers,
        body,
    };
}

function parseAxiosConfig(axiosCode) {
    if (!axiosCode.trim()) {
        throw new Error("Axios request cannot be empty.");
    }
    axiosCode = axiosCode.trim();
    if (!axiosCode.startsWith("axios(")) {
        throw new Error('Request must start with "axios(".');
    }

    const objectStart = axiosCode.indexOf("{");
    if (objectStart === -1) {
        throw new Error("Invalid Axios config object.");
    }

    const config = extractBalanced(
        axiosCode,
        objectStart,
        "{",
        "}"
    );
    if (!config) {
        throw new Error("Unclosed Axios config object.");
    }

    let method = "GET";
    let url = "";
    let headers = {};
    let body = null;

    // Method
    const parsedMethod = findTopLevelProperty(config, "method");
    if (parsedMethod) {
        method = stripQuotes(parsedMethod).toUpperCase();
    }

    // URL
    const parsedUrl = findTopLevelProperty(config, "url");
    if (!parsedUrl) {
        throw new Error("Missing request URL.");
    }
    url = stripQuotes(parsedUrl);

    // Headers
    headers = parseHeaders(
        findTopLevelProperty(config, "headers")
    );

    body = parseBody(
        findTopLevelProperty(config, "data")
    );
    if (body && method === "GET") {
        method = "POST";
    }

    return {
        method,
        url,
        headers,
        body,
    };
}

function parseAxiosMethod(axiosCode) {
    if (!axiosCode.trim()) {
        throw new Error("Axios request cannot be empty.");
    }
    axiosCode = axiosCode.trim();

    const match = axiosCode.match(/^axios\.(\w+)\s*\(/);
    if (!match) {
        throw new Error("Invalid Axios request.");
    }

    let method = match[1].toUpperCase();
    const parenStart = axiosCode.indexOf("(");

    const argsString = extractBalanced(
        axiosCode,
        parenStart,
        "(",
        ")"
    );
    if (!argsString) {
        throw new Error("Invalid Axios arguments.");
    }

    const args = splitTopLevel(
        argsString.slice(1, -1).trim()
    );
    if (args.length === 0) {
        throw new Error("Missing request URL.");
    }

    const url = stripQuotes(args[0]);
    let headers = {};
    let body = null;

    switch (method) {

        case "GET":
        case "DELETE":
            if (args[1]) {
                headers = parseHeaders(
                    findTopLevelProperty(args[1], "headers")
                );
            }
            break;
        case "POST":
        case "PUT":
        case "PATCH":
            body = parseBody(args[1]);
            if (args[2]) {
                headers = parseHeaders(
                    findTopLevelProperty(args[2], "headers")
                );
            }
            break;

        default:
            throw new Error(
                `Unsupported Axios method: ${method}`
            );
    }

    return {
        method,
        url,
        headers,
        body,
    };
}

function parseAxios(axiosCode) {
    axiosCode = axiosCode.trim();

    if (axiosCode.startsWith("axios({")) {
        return parseAxiosConfig(axiosCode);
    }

    return parseAxiosMethod(axiosCode);
}

// ── Generators ───────────────────────────────────────────────────────────────

function indent(text, spaces = 4) {
    if (text == null) {
        return "";
    }
    const padding = " ".repeat(spaces);

    return String(text)
        .split("\n")
        .map((line) => padding + line)
        .join("\n");
}

function generateCurl(request) {
    const { method, url, headers, body } = request;
    const parts = [];

    if (method && method !== "GET") {
        parts.push(`-X ${method}`);
    }

    Object.entries(headers).forEach(([key, value]) => {
        parts.push(`-H "${key}: ${value}"`);
    });

    if (body) {

        let curlBody = body;

        if (
            (curlBody.startsWith('"') && curlBody.endsWith('"')) ||
            (curlBody.startsWith("'") && curlBody.endsWith("'"))
        ) {
            curlBody = stripQuotes(curlBody);
        }

        parts.push(`-d '${curlBody}'`);
    }
    parts.push(url);

    return `curl ${parts.join(" \\\n  ")}`;
}

function generateFetch(request) {
    const { method, url, headers, body } = request;

    const options = [];

    if (method && method !== "GET") {
        options.push(`method: "${method}"`);
    }

    if (Object.keys(headers).length > 0) {
        const headerLines = Object.entries(headers)
            .map(([key, value]) => `"${key}": "${value}"`)
            .join(",\n");

        options.push(
            [
                "headers: {",
                indent(headerLines, 8),
                "}"
            ].join("\n")
        );
    }

    if (body) {
        const trimmedBody = body.trim();
        const isJson =
            trimmedBody.startsWith("{") || trimmedBody.startsWith("[");

        if (isJson) {
            options.push(
                [
                    "body: JSON.stringify(",
                    indent(body, 8),
                    ")"
                ].join("\n")
            );
        } else {
            options.push(`body: ${JSON.stringify(body)}`);
        }
    }

    if (options.length === 0) {
        return `fetch("${url}");`;
    }

    return `fetch("${url}", {
        ${indent(options.join(",\n\n"), 4)}
    });`;
}

function generateAxios(request) {
    const { method, url, headers, body } = request;
    const options = [];

    options.push(`url: "${url}"`);
    if (method && method !== "GET") {
        options.push(`method: "${method}"`);
    }

    if (Object.keys(headers).length > 0) {
        const headerLines = Object.entries(headers)
            .map(([key, value]) => `"${key}": "${value}"`)
            .join(",\n");

        options.push(
            [
                "headers: {",
                indent(headerLines, 8),
                "}"
            ].join("\n")
        );
    }

    if (body) {
        options.push(`data: ${body}`);
    }

    return `axios({
        ${indent(options.join(",\n\n"), 4)}
    });`;
}

// ─── Core Conversion Engine ───────────────────────────────────────────────────

function parseSource(sourceFormat, sourceCode) {
    switch (sourceFormat) {
        case "curl":
            return parseCurl(sourceCode);
        case "fetch":
            return parseFetch(sourceCode);
        case "axios":
            return parseAxios(sourceCode);

        default:
            throw new Error(`Unsupported source format: ${sourceFormat}`);
    }
}

function generateTarget(targetFormat, request) {
    switch (targetFormat) {
        case "curl":
            return generateCurl(request);
        case "fetch":
            return generateFetch(request);
        case "axios":
            return generateAxios(request);

        default:
            throw new Error(`Unsupported target format: ${targetFormat}`);
    }
}

function runConvert(sourceFormat, targetFormat, sourceCode) {
    const request = parseSource(sourceFormat, sourceCode);

    return generateTarget(targetFormat, request);
}

function getSample(format) {
    return SAMPLE_REQUESTS[format] || "";
}

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
    <div
        className={`flex rounded-lg border overflow-hidden text-[11px] ${t.fmtWrap}`}
    >
        {FORMATS.map((format) => (
            <button
                key={format}
                type="button"
                onClick={() => onChange(format)}
                aria-pressed={value === format}
                className={`px-3 py-1.5 font-black uppercase tracking-widest transition-all duration-150 ${value === format ? t.fmtActive : t.fmtInactive
                    }`}
            >
                {format}
            </button>
        ))}
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const HttpRequestConvertor = () => {
    const { dark } = useTheme();
    const t = buildTheme(dark);

    const [sourceFormat, setSourceFormat] = useState("curl");
    const [targetFormat, setTargetFormat] = useState("fetch");

    const [sourceCode, setSourceCode] = useState("");
    const [outputCode, setOutputCode] = useState("");

    const [error, setError] = useState(null);

    const handleSample = () => {
        setSourceCode(getSample(sourceFormat));
        setOutputCode("");
        setError(null);
    };

    const handleClear = () => {
        setSourceCode("");
        setOutputCode("");
        setError(null);
    };

    const handleCopy = async (text, label) => {
        if (!text.trim()) {
            toast.error("Nothing to copy");
            return;
        }
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${label} copied`);
        } catch {
            toast.error("Failed to copy");
        }
    };

    const handleSwap = () => {
        setSourceFormat(targetFormat);
        setTargetFormat(sourceFormat);

        setSourceCode(outputCode);
        setOutputCode(sourceCode);

        setError(null);
    };

    const handleConvert = () => {
        if (!sourceCode.trim()) {
            toast.error("Please enter a request to convert.");
            return;
        }

        try {
            const converted = runConvert(
                sourceFormat,
                targetFormat,
                sourceCode
            );

            setOutputCode(converted);
            setError(null);
        } catch (err) {
            setOutputCode("");
            setError({
                title: "Conversion Error",
                message: err.message,
            });

            toast.error("Conversion failed.");
        }
    };

    return (
        <div className={`min-h-[calc(100vh-76px)] px-4 py-6 transition-colors duration-300 sm:px-6 ${t.page}`}>
            <title>HTTP Request Converter — DevTasks</title>
            <meta
                name="description" content="Convert between cURL, Fetch API, and Axios request formats offline with accurate request parsing."
            />

            <div className={`mx-auto flex w-full max-w-7xl flex-col overflow-hidden rounded-3xl border shadow-xl transition-colors duration-300 ${t.panel}`}>

                {/* Accent bar */}
                <div className={`h-2 w-full ${dark ? "bg-white" : "bg-black"}`} />
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
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                            </Link>

                            <div>
                                <h1 className={`text-xl font-black uppercase tracking-tight sm:text-2xl ${t.heading}`}>
                                    cURL · Fetch · Axios Converter
                                </h1>

                                <p className={`mt-0.5 text-sm font-medium ${t.subtext}`}>
                                    Convert HTTP request snippets offline · no data leaves your browser
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={handleSample}
                                className={`rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${t.primaryBtn}`}
                            >
                                Sample Request
                            </button>

                            <button
                                type="button"
                                onClick={handleClear}
                                className={`rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${t.softBtn}`}
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </header>
                <main className="flex flex-col gap-5 p-5 sm:p-8">
                    <div className="grid grid-cols-1 items-center gap-3 lg:grid-cols-[1fr_auto_1fr]">
                        {/* ── Source panel ── */}
                        <section className="flex flex-col gap-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className={`text-[11px] font-black uppercase tracking-widest ${t.label}`}>
                                        Source
                                    </span>

                                    <FormatPills
                                        value={sourceFormat}
                                        onChange={setSourceFormat}
                                        t={t}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleCopy(sourceCode, `${sourceFormat.toUpperCase()} source`)}
                                    className={`rounded-xl border px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${t.softBtn}`}
                                >
                                    Copy
                                </button>
                            </div>

                            <textarea
                                value={sourceCode}
                                onChange={(e) => setSourceCode(e.target.value)}
                                spellCheck={false}
                                placeholder={
                                    sourceFormat === "curl"
                                        ? 'curl -X POST https://api.example.com/users'
                                        : sourceFormat === "fetch"
                                            ? 'fetch("https://api.example.com/users", {\n    method: "POST"\n});'
                                            : 'axios({\n    url: "https://api.example.com/users"\n});'
                                }
                                className={`min-h-[340px] lg:min-h-[460px] w-full resize-none rounded-2xl border px-4 py-3 font-mono text-sm leading-6 outline-none transition-all duration-200 ${error ? t.textareaError : t.textarea
                                    }`}
                            />
                        </section>
                        {/* ── Swap button ── */}
                        <div className="flex flex-row lg:flex-col items-center justify-center gap-8 pt-0 lg:pt-10">
                            <button
                                type="button"
                                onClick={handleSwap}
                                title="Swap source and output"
                                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 active:scale-95 ${t.swapBtn}`}
                            >
                                {/* Vertical on desktop */}
                                <svg className="hidden h-4 w-4 lg:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"
                                    />
                                </svg>

                                {/* Horizontal on mobile */}
                                <svg className="h-4 w-4 lg:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M16 7H4m0 0l4-4M4 7l4 4M8 17h12m0 0l-4-4m4 4l-4 4"
                                    />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={handleConvert}
                                className={`rounded-xl border px-3 py-2  text-[12px] font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${t.primaryBtn}`}
                            >
                                Convert
                            </button>
                        </div>
                        {/* ── Output panel (read-only) ── */}
                        <section className="flex flex-col gap-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className={`text-[11px] font-black uppercase tracking-widest ${t.label}`}>
                                        Output
                                    </span>

                                    <FormatPills
                                        value={targetFormat}
                                        onChange={setTargetFormat}
                                        t={t}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleCopy(outputCode, `${targetFormat.toUpperCase()} output`)}
                                    className={`rounded-xl border px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${t.softBtn}`}
                                >
                                    Copy
                                </button>
                            </div>

                            <textarea
                                value={outputCode}
                                readOnly
                                spellCheck={false}
                                placeholder={`Converted ${targetFormat.toUpperCase()} request appears here...`}
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
                            <span
                                className={`mr-2 font-black uppercase tracking-widest ${t.errorLabel}`}
                            >
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

export default HttpRequestConvertor;