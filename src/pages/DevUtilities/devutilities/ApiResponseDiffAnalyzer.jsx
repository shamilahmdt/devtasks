
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const SAMPLE_A = `{
  "id": 101,
  "name": "Charu",
  "active": true,
  "profile": {
    "role": "Developer",
    "skills": ["React", "JavaScript"],
    "experience": 1
  },
  "settings": {
    "theme": "light"
  }
}`;

const SAMPLE_B = `{
  "id": 101,
  "name": "Charu Singla",
  "active": "true",
  "profile": {
    "role": "Software Engineer",
    "skills": ["React", "JavaScript", "Node.js"],
    "experience": 1
  },
  "settings": {
    "theme": "dark"
  },
  "email": "charu@example.com"
}`;

const FILTERS = [
  { key: "all", label: "All Differences" },
  { key: "added", label: "Added" },
  { key: "removed", label: "Removed" },
  { key: "modified", label: "Modified" },
  { key: "type changed", label: "Type Changed" },
];

function getType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function formatValue(value) {
  if (value === undefined) return "(missing)";
  return JSON.stringify(value, null, 2);
}

function safeParseJSON(text) {
  try {
    return {
      data: JSON.parse(text),
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error.message,
    };
  }
}

function isContainer(value) {
  return value !== null && typeof value === "object";
}

// Recursive JSON comparison
function compareJSON(original, modified) {
  const differences = [];

  function walk(a, b, path) {
    const typeA = getType(a);
    const typeB = getType(b);

    if (typeA !== typeB) {
      differences.push({
        path: path || "$",
        type: "type changed",
        oldValue: a,
        newValue: b,
      });
      return;
    }

    if (!isContainer(a) || !isContainer(b)) {
      if (!Object.is(a, b)) {
        differences.push({
          path: path || "$",
          type: "modified",
          oldValue: a,
          newValue: b,
        });
      }
      return;
    }

    if (Array.isArray(a)) {
      const maxLength = Math.max(a.length, b.length);

      for (let i = 0; i < maxLength; i++) {
        const itemPath = `${path}[${i}]`;

        if (i >= a.length) {
          differences.push({
            path: itemPath,
            type: "added",
            oldValue: undefined,
            newValue: b[i],
          });
        } else if (i >= b.length) {
          differences.push({
            path: itemPath,
            type: "removed",
            oldValue: a[i],
            newValue: undefined,
          });
        } else {
          walk(a[i], b[i], itemPath);
        }
      }

      return;
    }

    const keys = new Set([
      ...Object.keys(a),
      ...Object.keys(b),
    ]);

    for (const key of keys) {
      const hasA = Object.prototype.hasOwnProperty.call(a, key);
      const hasB = Object.prototype.hasOwnProperty.call(b, key);
      const itemPath = path
        ? `${path}.${key}`
        : `$.${key}`;

      if (!hasA) {
        differences.push({
          path: itemPath,
          type: "added",
          oldValue: undefined,
          newValue: b[key],
        });
      } else if (!hasB) {
        differences.push({
          path: itemPath,
          type: "removed",
          oldValue: a[key],
          newValue: undefined,
        });
      } else {
        walk(a[key], b[key], itemPath);
      }
    }
  }

  walk(original, modified, "$");
  return differences;
}

function getStyles(dark) {
  return {
    page: dark
      ? "bg-zinc-950 text-zinc-100"
      : "bg-[#FDFDFD] text-black",

    container: dark
      ? "bg-zinc-900 border-zinc-700"
      : "bg-white border-neutral-100",

    input: dark
      ? "bg-zinc-950 border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:ring-zinc-500"
      : "bg-neutral-50 border-neutral-200 text-zinc-800 placeholder-neutral-400 focus:ring-zinc-500",

    panel: dark
      ? "bg-zinc-950/50 border-zinc-800"
      : "bg-neutral-50 border-neutral-200",

    heading: dark ? "text-white" : "text-black",

    muted: dark ? "text-zinc-400" : "text-zinc-500",

    secondaryButton: dark
      ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
      : "bg-white border-neutral-200 text-zinc-600 hover:text-black hover:border-neutral-400",

    primaryButton: dark
      ? "bg-white text-black border-white hover:bg-zinc-200"
      : "bg-black text-white border-black hover:bg-neutral-800",

    divider: dark ? "border-zinc-800" : "border-neutral-200",
  };
}

function getTypeClasses(type, dark) {
  const classes = {
    added: dark
      ? "bg-green-950/50 text-green-400 border-green-900/60"
      : "bg-green-50 text-green-700 border-green-200",

    removed: dark
      ? "bg-red-950/50 text-red-400 border-red-900/60"
      : "bg-red-50 text-red-700 border-red-200",

    modified: dark
      ? "bg-yellow-950/50 text-yellow-400 border-yellow-900/60"
      : "bg-yellow-50 text-yellow-700 border-yellow-200",

    "type changed": dark
      ? "bg-purple-950/50 text-purple-400 border-purple-900/60"
      : "bg-purple-50 text-purple-700 border-purple-200",
  };

  return classes[type] || "";
}

function getPrefix(type) {
  if (type === "added") return "+";
  if (type === "removed") return "−";
  if (type === "modified") return "~";
  if (type === "type changed") return "≠";
  return "";
}

function getLabel(type) {
  if (type === "type changed") return "Type Changed";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function getReport(differences) {
  const summary = {
    added: 0,
    removed: 0,
    modified: 0,
    "type changed": 0,
  };

  differences.forEach((item) => {
    summary[item.type]++;
  });

  return {
    generatedAt: new Date().toISOString(),
    totalDifferences: differences.length,
    summary,
    differences: differences.map((item) => ({
      path: item.path,
      category: item.type,
      oldValue: item.oldValue,
      newValue: item.newValue,
    })),
  };
}

const ApiResponseDiffAnalyzer = () => {
  const { dark } = useTheme();
  const styles = getStyles(dark);

  const [responseA, setResponseA] = useState("");
  const [responseB, setResponseB] = useState("");
  const [differences, setDifferences] = useState(null);
  const [jsonError, setJsonError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedPath, setSelectedPath] = useState(null);

  const stats = useMemo(() => {
    const result = {
      added: 0,
      removed: 0,
      modified: 0,
      "type changed": 0,
    };

    (differences || []).forEach((item) => {
      result[item.type]++;
    });

    return result;
  }, [differences]);

  const filteredDifferences = useMemo(() => {
    if (!differences) return [];

    return filter === "all"
      ? differences
      : differences.filter((item) => item.type === filter);
  }, [differences, filter]);

  const selectedDifference = useMemo(
    () => differences?.find((item) => item.path === selectedPath),
    [differences, selectedPath]
  );

  const totalDifferences = differences?.length ?? 0;

  const invalidateResults = () => {
    setDifferences(null);
    setJsonError(null);
    setSelectedPath(null);
  };

  const handleCompare = () => {
    if (!responseA.trim() || !responseB.trim()) {
      setDifferences(null);
      setJsonError(null);
      toast.error("Please enter both API responses.");
      return;
    }

    const parsedA = safeParseJSON(responseA);
    const parsedB = safeParseJSON(responseB);

    if (parsedA.error || parsedB.error) {
      const errorMessage = parsedA.error
        ? `Response A: ${parsedA.error}`
        : `Response B: ${parsedB.error}`;

      setJsonError(errorMessage);
      setDifferences(null);
      setSelectedPath(null);

      toast.error("Invalid JSON. Please fix the syntax errors.");
      return;
    }

    const result = compareJSON(parsedA.data, parsedB.data);

    setJsonError(null);
    setDifferences(result);
    setSelectedPath(null);
    setFilter("all");

    if (result.length === 0) {
      toast.success("Responses are identical.");
    } else {
      toast.success("API response comparison completed.");
    }
  };

  const handleClear = () => {
    setResponseA("");
    setResponseB("");
    setFilter("all");
    invalidateResults();
    toast.success("Response panels cleared.");
  };

  const handleSample = () => {
    setResponseA(SAMPLE_A);
    setResponseB(SAMPLE_B);
    setFilter("all");
    invalidateResults();
    toast.success("Sample responses loaded.");
  };

  const handleFormat = () => {
    const parsedA = safeParseJSON(responseA);
    const parsedB = safeParseJSON(responseB);

    if (parsedA.error || parsedB.error) {
      toast.error(
        parsedA.error
          ? `Response A: ${parsedA.error}`
          : `Response B: ${parsedB.error}`
      );
      return;
    }

    setResponseA(JSON.stringify(parsedA.data, null, 2));
    setResponseB(JSON.stringify(parsedB.data, null, 2));
    invalidateResults();
    toast.success("Both responses formatted.");
  };

  const handleMinify = () => {
    const parsedA = safeParseJSON(responseA);
    const parsedB = safeParseJSON(responseB);

    if (parsedA.error || parsedB.error) {
      toast.error(
        parsedA.error
          ? `Response A: ${parsedA.error}`
          : `Response B: ${parsedB.error}`
      );
      return;
    }

    setResponseA(JSON.stringify(parsedA.data));
    setResponseB(JSON.stringify(parsedB.data));
    invalidateResults();
    toast.success("Both responses minified.");
  };

  const handleCopyReport = async () => {
    if (!differences) {
      toast.error("Compare the responses first.");
      return;
    }

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(getReport(differences), null, 2)
      );
      toast.success("Diff report copied to clipboard.");
    } catch {
      toast.error(
        "Could not access clipboard. Check your browser permissions."
      );
    }
  };

  const handleExport = () => {
    if (!differences) {
      toast.error("Compare the responses before exporting.");
      return;
    }

    const blob = new Blob(
      [JSON.stringify(getReport(differences), null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "api-response-diff-report.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    toast.success("Diff report exported.");
  };

  const statCards = [
    {
      key: "all",
      label: "Total Differences",
      value: totalDifferences,
      color: dark ? "text-white" : "text-black",
    },
    {
      key: "added",
      label: "Added",
      value: stats.added,
      color: dark ? "text-green-400" : "text-green-700",
    },
    {
      key: "removed",
      label: "Removed",
      value: stats.removed,
      color: dark ? "text-red-400" : "text-red-700",
    },
    {
      key: "modified",
      label: "Modified",
      value: stats.modified,
      color: dark ? "text-yellow-400" : "text-yellow-700",
    },
    {
      key: "type changed",
      label: "Type Changed",
      value: stats["type changed"],
      color: dark ? "text-purple-400" : "text-purple-700",
    },
  ];

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 font-sans antialiased transition-colors duration-300 overflow-x-hidden ${styles.page}`}
    >
      <title>API Response Diff Analyzer | DevTasks</title>
      <meta
        name="description"
        content="Compare JSON API responses, inspect nested differences, and export a structured diff report."
      />

      <div
        className={`w-full max-w-6xl md:mx-auto rounded-3xl shadow-lg p-4 sm:p-8 border transition-colors duration-300 ${styles.container}`}
      >
        {/* Header */}
        <div className="flex flex-col gap-5 mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                to="/devutilities"
                className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 shrink-0 ${styles.secondaryButton}`}
                title="Back to Workspace"
                aria-label="Back to Developer Utilities"
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

              <div className="min-w-0">
                <h1
                  className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${styles.heading}`}
                >
                  API Response Diff Analyzer
                </h1>
                <p className={`text-xs mt-1 ${styles.muted}`}>
                  Compare JSON responses and inspect every change.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopyReport}
                disabled={!differences}
                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${styles.secondaryButton}`}
              >
                Copy Report
              </button>

              <button
                type="button"
                onClick={handleExport}
                disabled={!differences}
                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${styles.primaryButton}`}
              >
                Export JSON
              </button>
            </div>
          </div>

          <div
            className={`flex flex-wrap items-center gap-2 p-1 border rounded-2xl self-start ${dark ? "border-zinc-700 bg-zinc-800" : "border-neutral-200 bg-neutral-50"}`}
          >
            <span
              className={`px-3 text-xs font-black uppercase tracking-widest ${styles.muted}`}
            >
              Compare Mode
            </span>
            <span
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${styles.primaryButton}`}
            >
              Structural JSON Diff
            </span>
          </div>
        </div>

        {/* Input panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-3 min-h-8">
              <label
                htmlFor="response-a"
                className={`text-xs font-black uppercase tracking-widest ${styles.muted}`}
              >
                Response A · Original
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSample}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${styles.primaryButton}`}
                >
                  Sample
                </button>
              </div>
            </div>

            <textarea
              id="response-a"
              value={responseA}
              onChange={(event) => {
                setResponseA(event.target.value);
                invalidateResults();
              }}
              spellCheck={false}
              placeholder="Paste original API JSON response..."
              className={`w-full h-64 p-4 rounded-xl border resize-y focus:outline-none focus:ring-2 transition-colors font-mono text-sm ${styles.input}`}
            />
            <p className={`mt-2 text-xs ${styles.muted}`}>
              {responseA.length.toLocaleString()} characters
            </p>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-3 min-h-8">
              <label
                htmlFor="response-b"
                className={`text-xs font-black uppercase tracking-widest ${styles.muted}`}
              >
                Response B · Updated
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleFormat}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${styles.secondaryButton}`}
                >
                  Format
                </button>

                <button
                  type="button"
                  onClick={handleMinify}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${styles.secondaryButton}`}
                >
                  Minify
                </button>
              </div>
            </div>

            <textarea
              id="response-b"
              value={responseB}
              onChange={(event) => {
                setResponseB(event.target.value);
                invalidateResults();
              }}
              spellCheck={false}
              placeholder="Paste updated API JSON response..."
              className={`w-full h-64 p-4 rounded-xl border resize-y focus:outline-none focus:ring-2 transition-colors font-mono text-sm ${styles.input}`}
            />

            <p className={`mt-2 text-xs ${styles.muted}`}>
              {responseB.length.toLocaleString()} characters
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            type="button"
            onClick={handleCompare}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${styles.primaryButton}`}
          >
            Compare Responses
          </button>

          <button
            type="button"
            onClick={handleClear}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${styles.secondaryButton}`}
          >
            Clear
          </button>
        </div>

        {/* JSON validation error */}
        {jsonError && (
          <div
            role="alert"
            className={`mb-6 px-4 py-3 rounded-xl border text-xs font-mono break-words ${dark ? "border-red-900 bg-red-950/40 text-red-400" : "border-red-200 bg-red-50 text-red-700"}`}
          >
            <div className="font-black uppercase tracking-widest mb-2">
              JSON Parsing Error
            </div>
            {jsonError}
          </div>
        )}

        {/* Results */}
        {differences !== null && !jsonError && (
          <>
            {/* Summary */}
            <div
              className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6`}
            >
              {statCards.map((stat) => (
                <button
                  key={stat.key}
                  type="button"
                  onClick={() => setFilter(stat.key)}
                  aria-pressed={filter === stat.key}
                  className={`p-4 rounded-xl border text-left transition-all duration-200 hover:scale-[1.02] ${
                    filter === stat.key
                      ? dark
                        ? "border-white bg-zinc-800 ring-1 ring-white/20"
                        : "border-black bg-neutral-50 ring-1 ring-black/10"
                      : dark
                        ? "border-zinc-800 bg-zinc-950/50 hover:border-zinc-600"
                        : "border-neutral-200 bg-neutral-50 hover:border-neutral-400"
                  }`}
                >
                  <div
                    className={`text-[10px] sm:text-xs font-black uppercase tracking-wider mb-3 ${styles.muted}`}
                  >
                    {stat.label}
                  </div>

                  <div
                    className={`text-2xl sm:text-3xl font-black ${stat.color}`}
                  >
                    {stat.value}
                  </div>
                </button>
              ))}
            </div>

            {/* Filter bar */}
            <div
              className={`flex flex-wrap items-center gap-2 p-3 mb-4 rounded-xl border ${styles.panel}`}
            >
              <span
                className={`text-xs font-black uppercase tracking-widest mr-1 ${styles.muted}`}
              >
                Filter:
              </span>

              {FILTERS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                    filter === item.key
                      ? styles.primaryButton
                      : styles.secondaryButton
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Difference table */}
            <div
              className={`rounded-xl border overflow-hidden ${styles.divider}`}
            >
              <div
                className={`flex flex-wrap justify-between items-center gap-2 px-4 py-3 border-b ${styles.divider} ${dark ? "bg-zinc-800 text-zinc-400" : "bg-neutral-100 text-zinc-500"}`}
              >
                <span className="text-xs font-black uppercase tracking-widest">
                  Difference Explorer
                </span>

                <span className="text-xs font-bold">
                  {filteredDifferences.length} result(s)
                </span>
              </div>

              {filteredDifferences.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <div
                    className={`text-lg font-black mb-2 ${styles.heading}`}
                  >
                    {totalDifferences === 0
                      ? "Responses are identical"
                      : "No differences in this category"}
                  </div>

                  <p className={`text-xs ${styles.muted}`}>
                    {totalDifferences === 0
                      ? "Both JSON responses contain the same values and types."
                      : "Select another filter to view differences."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr
                        className={dark ? "bg-zinc-800/70" : "bg-neutral-50"}
                      >
                        {[
                          "Type",
                          "JSON Path",
                          "Old Value",
                          "New Value",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${styles.muted}`}
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredDifferences.map((item, index) => {
                        const selected = selectedPath === item.path;

                        return (
                          <tr
                            key={`${item.path}-${index}`}
                            onClick={() =>
                              setSelectedPath(
                                selected ? null : item.path
                              )
                            }
                            className={`border-t cursor-pointer transition-colors ${styles.divider} ${
                              selected
                                ? dark
                                  ? "bg-zinc-800"
                                  : "bg-neutral-100"
                                : dark
                                  ? "hover:bg-zinc-800/50"
                                  : "hover:bg-neutral-50"
                            }`}
                          >
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase whitespace-nowrap ${getTypeClasses(item.type, dark)}`}
                              >
                                {getPrefix(item.type)} {getLabel(item.type)}
                              </span>
                            </td>

                            <td
                              className={`px-4 py-3 font-mono text-xs whitespace-nowrap ${dark ? "text-zinc-300" : "text-zinc-700"}`}
                            >
                              {item.path}
                            </td>

                            <td
                              className={`px-4 py-3 font-mono text-xs min-w-36 max-w-64 break-all whitespace-pre-wrap ${dark ? "text-red-400" : "text-red-700"}`}
                            >
                              {formatValue(item.oldValue)}
                            </td>

                            <td
                              className={`px-4 py-3 font-mono text-xs min-w-36 max-w-64 break-all whitespace-pre-wrap ${dark ? "text-green-400" : "text-green-700"}`}
                            >
                              {formatValue(item.newValue)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Selected path detail */}
            {selectedDifference && (
              <div
                className={`mt-5 p-4 sm:p-5 rounded-xl border ${styles.panel}`}
              >
                <div
                  className={`text-xs font-black uppercase tracking-widest mb-3 ${styles.muted}`}
                >
                  Selected Difference
                </div>

                <div
                  className={`font-mono text-sm break-all mb-4 ${styles.heading}`}
                >
                  {selectedDifference.path}
                </div>

                <div className="mb-4">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase ${getTypeClasses(selectedDifference.type, dark)}`}
                  >
                    {getLabel(selectedDifference.type)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Old Value",
                      value: selectedDifference.oldValue,
                      color: dark ? "text-red-400" : "text-red-700",
                    },
                    {
                      label: "New Value",
                      value: selectedDifference.newValue,
                      color: dark ? "text-green-400" : "text-green-700",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`p-4 rounded-xl border min-w-0 ${styles.divider} ${dark ? "bg-zinc-900" : "bg-white"}`}
                    >
                      <div
                        className={`text-[10px] font-black uppercase tracking-widest mb-3 ${styles.muted}`}
                      >
                        {item.label}
                      </div>

                      <pre
                        className={`font-mono text-xs whitespace-pre-wrap break-all ${item.color}`}
                      >
                        {formatValue(item.value)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Initial state */}
        {differences === null && !jsonError && (
          <div
            className={`rounded-xl border p-8 sm:p-12 text-center ${styles.panel}`}
          >
            <div
              className={`text-sm font-black uppercase tracking-widest mb-3 ${styles.heading}`}
            >
              Ready to Compare
            </div>

            <p className={`text-xs leading-6 max-w-md mx-auto ${styles.muted}`}>
              Paste two JSON API responses and click Compare Responses.
              Your data is compared locally in your browser.
            </p>

            <button
              type="button"
              onClick={handleSample}
              className={`mt-5 px-5 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${styles.secondaryButton}`}
            >
              Load Sample Responses
            </button>
          </div>
        )}

        <div
          className={`mt-6 pt-5 border-t text-center text-[10px] uppercase tracking-widest ${styles.divider} ${styles.muted}`}
        >
          API Response Diff Analyzer · Client-side JSON comparison
        </div>
      </div>
    </div>
  );
};

export default ApiResponseDiffAnalyzer;
