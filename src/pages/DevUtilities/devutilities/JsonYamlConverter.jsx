import { useState } from "react";
import { Link } from "react-router-dom";
import { dump, load } from "js-yaml";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const SAMPLE_PAYLOAD = {
  app: {
    name: "DevTasks",
    environment: "development",
    version: "1.0.0",
    debug: true,
  },
  server: {
    host: "localhost",
    port: 5173,
    cors: {
      enabled: true,
      origins: ["http://localhost:5173", "https://dev-tasks-beta.vercel.app"],
    },
  },
  features: [
    { key: "taskManagement", enabled: true },
    { key: "snippetVault", enabled: true },
    { key: "resourceHub", enabled: false },
  ],
  limits: {
    maxUploadMb: 10,
    retryAttempts: 3,
  },
};

const YAML_OPTIONS = {
  indent: 2,
  lineWidth: -1,
  noRefs: true,
  sortKeys: false,
};

const formatJsonParseError = (error, source) => {
  const message = error instanceof Error ? error.message : "Invalid JSON syntax.";

  if (/line\s+\d+\s+column\s+\d+/i.test(message)) {
    return message;
  }

  const positionMatch = message.match(/position\s+(\d+)/i);

  if (!positionMatch) {
    return message;
  }

  const position = Number(positionMatch[1]);
  if (Number.isNaN(position)) {
    return message;
  }

  const beforeError = source.slice(0, position);
  const line = beforeError.split("\n").length;
  const column = beforeError.length - beforeError.lastIndexOf("\n");

  return `${message} (line ${line}, column ${column})`;
};

const formatYamlParseError = (error) => {
  const message = error instanceof Error ? error.message : "Invalid YAML syntax.";

  if (error?.mark) {
    const line = error.mark.line + 1;
    const column = error.mark.column + 1;
    return `${error.reason || message} (line ${line}, column ${column})`;
  }

  return message;
};

const jsonToYaml = (source) => {
  const parsed = JSON.parse(source);
  return dump(parsed, YAML_OPTIONS);
};

const yamlToJson = (source) => {
  const parsed = load(source);
  return JSON.stringify(parsed ?? null, null, 2);
};

const JsonYamlConverter = () => {
  const { dark } = useTheme();
  const [jsonText, setJsonText] = useState("");
  const [yamlText, setYamlText] = useState("");
  const [activePane, setActivePane] = useState("json");
  const [error, setError] = useState(null);

  const theme = {
    light: {
      page: "bg-[#F7F7F7]",
      panel: "bg-white border-neutral-200",
      input:
        "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black",
      inputError:
        "bg-neutral-50 border-red-400 text-black placeholder-neutral-400 focus:border-red-500 focus:ring-1 focus:ring-red-500",
      softButton:
        "bg-white border-neutral-200 text-zinc-600 hover:text-black hover:border-neutral-400",
      primaryButton: "bg-black text-white border-black hover:bg-zinc-800",
      label: "text-neutral-500 group-focus-within:text-black",
      errorBox: "bg-red-50 border-red-200 text-red-700",
      errorLabel: "text-red-800",
    },
    dark: {
      page: "bg-zinc-950",
      panel: "bg-zinc-900 border-zinc-800",
      input:
        "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white",
      inputError:
        "bg-zinc-950 border-red-500/70 text-white placeholder-zinc-700 focus:border-red-400 focus:ring-1 focus:ring-red-400",
      softButton:
        "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500",
      primaryButton: "bg-white text-black border-white hover:bg-zinc-200",
      label: "text-zinc-400 group-focus-within:text-white",
      errorBox: "bg-red-950/30 border-red-900/70 text-red-200",
      errorLabel: "text-red-100",
    },
  };

  const t = dark ? theme.dark : theme.light;

  const clearError = () => setError(null);

  const handleJsonChange = (value) => {
    setActivePane("json");
    setJsonText(value);

    if (!value.trim()) {
      setYamlText("");
      clearError();
      return;
    }

    try {
      setYamlText(jsonToYaml(value));
      clearError();
    } catch (parseError) {
      setError({
        pane: "json",
        title: "Invalid JSON",
        message: formatJsonParseError(parseError, value),
      });
    }
  };

  const handleYamlChange = (value) => {
    setActivePane("yaml");
    setYamlText(value);

    if (!value.trim()) {
      setJsonText("");
      clearError();
      return;
    }

    try {
      setJsonText(yamlToJson(value));
      clearError();
    } catch (parseError) {
      setError({
        pane: "yaml",
        title: "Invalid YAML",
        message: formatYamlParseError(parseError),
      });
    }
  };

  const applyPayload = (payload, pane = activePane) => {
    const nextJson = JSON.stringify(payload, null, 2);
    const nextYaml = dump(payload, YAML_OPTIONS);

    setJsonText(nextJson);
    setYamlText(nextYaml);
    setActivePane(pane);
    clearError();
  };

  const handleSample = () => {
    applyPayload(SAMPLE_PAYLOAD);
  };

  const handleFormat = () => {
    const source = activePane === "json" ? jsonText : yamlText;

    if (!source.trim()) return;

    try {
      const parsed = activePane === "json" ? JSON.parse(source) : load(source);
      applyPayload(parsed ?? null, activePane);
      toast.success("Formatted successfully");
    } catch (parseError) {
      setError({
        pane: activePane,
        title: activePane === "json" ? "Invalid JSON" : "Invalid YAML",
        message:
          activePane === "json"
            ? formatJsonParseError(parseError, source)
            : formatYamlParseError(parseError),
      });
      toast.error("Fix syntax errors before formatting");
    }
  };

  const handleCopy = async (value, label) => {
    if (!value.trim()) {
      toast.error(`No ${label} to copy`);
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error(`Failed to copy ${label}`);
    }
  };

  const handleClear = () => {
    setJsonText("");
    setYamlText("");
    setActivePane("json");
    clearError();
  };

  const actions = [
    { label: "Sample Data", onClick: handleSample, primary: true },
    { label: "Format / Beautify", onClick: handleFormat },
    { label: "Clear", onClick: handleClear },
  ];

  const renderEditor = ({ pane, label, value, onChange, placeholder }) => {
    const hasError = error?.pane === pane;

    return (
      <section className="group flex min-h-0 flex-col gap-3">
        <div className="flex min-h-8 flex-wrap items-center justify-between gap-3">
          <label
            className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${t.label}`}
          >
            {label}
          </label>
          <button
            type="button"
            onClick={() => handleCopy(value, label)}
            className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${t.softButton}`}
          >
            Copy
          </button>
        </div>

        <textarea
          value={value}
          onFocus={() => setActivePane(pane)}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          className={`min-h-[320px] lg:min-h-[460px] w-full flex-1 resize-none rounded-2xl border px-4 py-3 font-mono text-sm leading-6 outline-none transition-all duration-300 ${
            hasError ? t.inputError : t.input
          }`}
        />
      </section>
    );
  };

  return (
    <div
      className={`min-h-[calc(100vh-76px)] px-4 py-6 transition-colors duration-300 sm:px-6 ${t.page}`}
    >
      <title>JSON YAML Converter - DevTasks</title>
      <meta
        name="description"
        content="Convert JSON to YAML and YAML to JSON offline with live validation."
      />

      <div
        className={`mx-auto flex w-full max-w-7xl flex-col overflow-hidden rounded-3xl border shadow-xl transition-colors duration-300 ${t.panel}`}
      >
        <div className={`h-2 w-full ${dark ? "bg-white" : "bg-black"}`} />

        <header className="flex flex-col gap-5 px-5 pt-6 sm:px-8 sm:pt-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/devutilities"
              className={`flex shrink-0 items-center justify-center rounded-xl border p-2.5 transition-all duration-200 active:scale-95 ${t.softButton}`}
              title="Back to Workspace"
            >
              <svg
                className="h-4 w-4"
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
              <h1
                className={`text-xl font-black uppercase tracking-tight transition-colors duration-300 sm:text-2xl ${
                  dark ? "text-white" : "text-black"
                }`}
              >
                JSON YAML Converter
              </h1>
              <p
                className={`mt-1 text-sm font-medium ${
                  dark ? "text-zinc-500" : "text-neutral-500"
                }`}
              >
                Active pane: {activePane === "json" ? "JSON" : "YAML"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={`rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${
                  action.primary ? t.primaryButton : t.softButton
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </header>

        <main className="flex flex-col gap-5 p-5 sm:p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {renderEditor({
              pane: "json",
              label: "JSON",
              value: jsonText,
              onChange: handleJsonChange,
              placeholder: '{\n  "app": {\n    "name": "DevTasks"\n  }\n}',
            })}

            {renderEditor({
              pane: "yaml",
              label: "YAML",
              value: yamlText,
              onChange: handleYamlChange,
              placeholder: "app:\n  name: DevTasks",
            })}
          </div>

          {error && (
            <div
              className={`rounded-2xl border px-4 py-3 font-mono text-sm transition-colors duration-300 ${t.errorBox}`}
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

export default JsonYamlConverter;
