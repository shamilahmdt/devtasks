import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const ENV_KEY = /^[A-Za-z_][A-Za-z0-9_]*$/;

const SAMPLE_ENV = `# App config
PORT=3000
API_URL="https://api.example.com"
DEBUG=true
export DATABASE_URL=postgres://localhost:5432/app
EMPTY=
QUOTED="hello world"
`;

const SAMPLE_JSON = `{
  "PORT": "3000",
  "API_URL": "https://api.example.com",
  "DEBUG": "true",
  "DATABASE_URL": "postgres://localhost:5432/app",
  "EMPTY": "",
  "QUOTED": "hello world"
}`;

function parseEnvValue(raw, lineNumber) {
  const value = raw.trimStart();

  if (value.startsWith('"')) {
    let result = "";
    let escaped = false;

    for (let i = 1; i < value.length; i += 1) {
      const char = value[i];

      if (escaped) {
        result += char === "n" ? "\n" : char === "t" ? "\t" : char;
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === '"') {
        return result;
      }

      result += char;
    }

    throw new Error(`Line ${lineNumber}: unclosed double quote.`);
  }

  if (value.startsWith("'")) {
    const end = value.indexOf("'", 1);

    if (end === -1) {
      throw new Error(`Line ${lineNumber}: unclosed single quote.`);
    }

    return value.slice(1, end);
  }

  const commentAt = value.search(/\s+#/);
  const unquoted = commentAt === -1 ? value : value.slice(0, commentAt);
  return unquoted.trim();
}

function envToJson(text) {
  if (!text.trim()) {
    throw new Error("Please paste .env content to convert.");
  }

  const result = {};
  let found = false;

  text.split(/\r?\n/).forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const withoutExport = trimmed.replace(/^export\s+/, "");
    const eq = withoutExport.indexOf("=");

    if (eq === -1) {
      throw new Error(`Line ${lineNumber}: missing '='.`);
    }

    const key = withoutExport.slice(0, eq).trim();
    const rawValue = withoutExport.slice(eq + 1);

    if (!key) {
      throw new Error(`Line ${lineNumber}: missing variable name.`);
    }

    if (!ENV_KEY.test(key)) {
      throw new Error(`Line ${lineNumber}: invalid variable name "${key}".`);
    }

    result[key] = parseEnvValue(rawValue, lineNumber);
    found = true;
  });

  if (!found) {
    throw new Error("No environment variables were found.");
  }

  return JSON.stringify(result, null, 2);
}

function formatEnvValue(value) {
  if (value === "") {
    return "";
  }

  if (/[\s#"']/.test(value) || value.includes("\\") || value.includes("\n")) {
    const escaped = value
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n");
    return `"${escaped}"`;
  }

  return value;
}

function jsonToEnv(text) {
  if (!text.trim()) {
    throw new Error("Please paste JSON to convert.");
  }

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON. Please check your JSON syntax.");
  }

  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("JSON must be a flat object.");
  }

  const lines = Object.entries(data).map(([key, value]) => {
    if (!ENV_KEY.test(key)) {
      throw new Error(`Invalid env key "${key}".`);
    }

    if (value !== null && typeof value === "object") {
      throw new Error(
        "JSON must be a flat object. Nested objects and arrays are not supported.",
      );
    }

    if (typeof value === "number" && !Number.isFinite(value)) {
      throw new Error(`Key "${key}" contains a non-finite number.`);
    }

    const stringValue = value === null || value === undefined ? "" : String(value);
    return `${key}=${formatEnvValue(stringValue)}`;
  });

  if (lines.length === 0) {
    throw new Error("JSON object must contain at least one property.");
  }

  return lines.join("\n");
}

const EnvJsonConverter = () => {
  const { dark } = useTheme();

  const [mode, setMode] = useState("env-to-json");
  const [input, setInput] = useState(SAMPLE_ENV);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleConvert = useCallback(() => {
    setError("");

    try {
      const result = mode === "env-to-json" ? envToJson(input) : jsonToEnv(input);
      setOutput(result);
      toast.success("Conversion completed successfully.");
    } catch (conversionError) {
      setOutput("");
      setError(conversionError.message);
      toast.error(conversionError.message);
    }
  }, [input, mode]);

  const handleCopy = useCallback(() => {
    if (!output) {
      toast.error("Nothing to copy.");
      return;
    }

    navigator.clipboard
      .writeText(output)
      .then(() => toast.success("Output copied to clipboard."))
      .catch(() => toast.error("Failed to copy to clipboard."));
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setError("");
  }, []);

  const handleSample = useCallback(() => {
    setInput(mode === "env-to-json" ? SAMPLE_ENV : SAMPLE_JSON);
    setOutput("");
    setError("");
  }, [mode]);

  const switchMode = useCallback((nextMode) => {
    setMode(nextMode);
    setInput(nextMode === "env-to-json" ? SAMPLE_ENV : SAMPLE_JSON);
    setOutput("");
    setError("");
  }, []);

  const fieldClass = error
    ? dark
      ? "bg-zinc-950 border-zinc-600 text-zinc-200 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
      : "bg-neutral-50 border-neutral-400 text-zinc-800 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
    : dark
      ? "bg-zinc-950 border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:border-white focus:ring-1 focus:ring-white"
      : "bg-neutral-50 border-neutral-200 text-zinc-800 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black";

  const secondaryButtonClass = `px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 ${
    dark
      ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
      : "bg-white border-neutral-200 text-zinc-600 hover:text-black hover:border-neutral-400"
  }`;

  const primaryButtonClass = `px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 ${
    dark
      ? "bg-white text-black border-white hover:bg-zinc-200"
      : "bg-black text-white border-black hover:bg-zinc-800"
  }`;

  return (
    <div
      className={`min-h-[calc(100vh-76px)] md:h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto overflow-x-hidden md:overflow-hidden relative flex flex-col justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>.env ⇄ JSON Converter — DevTasks</title>
      <meta
        name="description"
        content="Convert .env files to JSON objects and JSON objects back to .env syntax, entirely offline."
      />

      <div
        className={`absolute top-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-30 transition-colors duration-500 ${
          dark ? "bg-zinc-800" : "bg-neutral-200"
        }`}
      />
      <div
        className={`absolute bottom-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-30 transition-colors duration-500 ${
          dark ? "bg-zinc-900" : "bg-neutral-100"
        }`}
      />

      <div
        className={`relative z-10 w-full max-w-5xl md:mx-auto rounded-[32px] border shadow-xl flex flex-col max-h-full md:max-h-[85vh] overflow-hidden transition-all duration-300 ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        <div
          className={`h-2 w-full transition-colors duration-500 ${
            dark ? "bg-white" : "bg-black"
          }`}
        />

        <div className="px-5 sm:px-8 pt-6 sm:pt-8 flex items-center gap-3 w-full min-w-0">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${
              dark
                ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                : "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350"
            }`}
            title="Back to Workspace"
          >
            <svg
              className="w-4 h-4"
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
          <h1
            className={`text-xl sm:text-2xl font-black uppercase tracking-tight transition-colors duration-300 min-w-0 flex-1 ${
              dark ? "text-white" : "text-black"
            }`}
          >
            .env ⇄ JSON Converter
          </h1>
        </div>

        <div className="p-5 sm:p-6 flex-1 overflow-y-auto min-h-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => switchMode("env-to-json")}
                className={
                  mode === "env-to-json"
                    ? primaryButtonClass
                    : secondaryButtonClass
                }
              >
                .env → JSON
              </button>
              <button
                type="button"
                onClick={() => switchMode("json-to-env")}
                className={
                  mode === "json-to-env"
                    ? primaryButtonClass
                    : secondaryButtonClass
                }
              >
                JSON → .env
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSample}
                className={secondaryButtonClass}
              >
                Sample
              </button>
              <button
                type="button"
                onClick={handleClear}
                className={secondaryButtonClass}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleConvert}
                className={primaryButtonClass}
              >
                Convert
              </button>
            </div>
          </div>

          {error && (
            <div
              className={`mb-5 px-4 py-3 rounded-2xl border text-sm font-mono transition-colors duration-300 ${
                dark
                  ? "bg-zinc-950 border-zinc-700 text-zinc-400"
                  : "bg-neutral-100 border-neutral-300 text-zinc-500"
              }`}
            >
              <span
                className={`font-black uppercase tracking-widest text-xs mr-2 ${
                  dark ? "text-zinc-300" : "text-zinc-700"
                }`}
              >
                {mode === "env-to-json" ? "Invalid .env:" : "Invalid JSON:"}
              </span>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-5">
            <div className="flex flex-col space-y-2">
              <label
                className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                  dark ? "text-zinc-400" : "text-neutral-500"
                }`}
              >
                {mode === "env-to-json" ? "Input .env" : "Input JSON"}
              </label>
              <textarea
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                  setError("");
                }}
                placeholder={
                  mode === "env-to-json"
                    ? "PORT=3000\nAPI_URL=https://api.example.com"
                    : '{ "PORT": "3000" }'
                }
                spellCheck={false}
                className={`w-full h-56 px-4 py-3 rounded-2xl border text-sm font-mono outline-none transition-all duration-300 resize-none ${fieldClass}`}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label
                  className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                    dark ? "text-zinc-400" : "text-neutral-500"
                  }`}
                >
                  {mode === "env-to-json" ? "Output JSON" : "Output .env"}
                </label>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={secondaryButtonClass}
                >
                  Copy
                </button>
              </div>
              <textarea
                value={output}
                readOnly
                spellCheck={false}
                placeholder="Converted output will appear here..."
                className={`w-full h-56 px-4 py-3 rounded-2xl border text-sm font-mono outline-none transition-all duration-300 resize-none ${
                  dark
                    ? "bg-zinc-950/50 border-zinc-800 text-zinc-200 placeholder-zinc-600"
                    : "bg-neutral-100 border-neutral-200 text-zinc-800 placeholder-neutral-400"
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvJsonConverter;
