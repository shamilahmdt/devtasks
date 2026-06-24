import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

// ─── LCS-based diff algorithm ────────────────────────────────────────────────
function computeDiff(original, modified) {
  const origLines = original === "" ? [] : original.split("\n");
  const modLines  = modified  === "" ? [] : modified.split("\n");
  const m = origLines.length;
  const n = modLines.length;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        origLines[i - 1] === modLines[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const result = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origLines[i - 1] === modLines[j - 1]) {
      result.unshift({ type: "same", value: origLines[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: "added", value: modLines[j - 1] });
      j--;
    } else {
      result.unshift({ type: "removed", value: origLines[i - 1] });
      i--;
    }
  }
  return result;
}

// ─── Build paired row data for split view ────────────────────────────────────
function buildSplitRows(diff) {
  const rows    = [];
  let leftNum   = 1;
  let rightNum  = 1;
  let i         = 0;

  while (i < diff.length) {
    if (diff[i].type === "same") {
      rows.push({
        left:  { type: "same", value: diff[i].value, lineNum: leftNum++  },
        right: { type: "same", value: diff[i].value, lineNum: rightNum++ },
      });
      i++;
    } else {
      const removed = [];
      const added   = [];
      while (i < diff.length && diff[i].type !== "same") {
        if (diff[i].type === "removed") removed.push(diff[i].value);
        else                             added.push(diff[i].value);
        i++;
      }
      const maxLen = Math.max(removed.length, added.length);
      for (let k = 0; k < maxLen; k++) {
        rows.push({
          left: k < removed.length
            ? { type: "removed", value: removed[k], lineNum: leftNum++  }
            : { type: "empty",   value: ""                              },
          right: k < added.length
            ? { type: "added", value: added[k],   lineNum: rightNum++ }
            : { type: "empty", value: ""                              },
        });
      }
    }
  }
  return rows;
}

// ─── Style helpers ────────────────────────────────────────────────────────────
function rowCls(type, dark) {
  if (type === "added")   return dark ? "bg-green-950/40" : "bg-green-50";
  if (type === "removed") return dark ? "bg-red-950/40"   : "bg-red-50";
  if (type === "empty")   return dark ? "bg-zinc-900/30"  : "bg-neutral-100/30";
  return "";
}

function inlineRowCls(type, dark) {
  if (type === "added")   return dark ? "bg-green-950/40 border-l-2 border-green-500" : "bg-green-50 border-l-2 border-green-500";
  if (type === "removed") return dark ? "bg-red-950/40 border-l-2 border-red-500"     : "bg-red-50 border-l-2 border-red-500";
  return "";
}

function lineNumCls(type, dark) {
  if (type === "added")   return dark ? "text-green-600 bg-green-950/60"  : "text-green-700 bg-green-100";
  if (type === "removed") return dark ? "text-red-500   bg-red-950/60"    : "text-red-600   bg-red-100";
  if (type === "empty")   return dark ? "text-zinc-800  bg-zinc-900/20"   : "text-neutral-200 bg-neutral-50";
  return dark ? "text-zinc-600 bg-zinc-800/30" : "text-neutral-400 bg-neutral-50";
}

function textCls(type, dark) {
  if (type === "added")   return dark ? "text-green-400"                       : "text-green-800";
  if (type === "removed") return dark ? "text-red-400 line-through opacity-70" : "text-red-700 line-through opacity-70";
  if (type === "empty")   return "text-transparent select-none";
  return dark ? "text-zinc-300" : "text-zinc-700";
}

// ─── Constants ────────────────────────────────────────────────────────────────
const VIEWS = [
  { key: "split",  label: "Split"  },
  { key: "inline", label: "Inline" },
];

const SAMPLE_ORIGINAL = `function greet(name) {
  console.log("Hello, " + name);
  return name;
}`;

const SAMPLE_MODIFIED = `function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  return greeting + " " + name;
}`;

// ─── Main component ───────────────────────────────────────────────────────────
const DiffChecker = () => {
  const { dark } = useTheme();

  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [viewMode, setViewMode] = useState("split");
  const [diff,     setDiff]     = useState(null);

  const stats = useMemo(() => {
    if (!diff) return { added: 0, removed: 0, same: 0 };
    return {
      added:   diff.filter((d) => d.type === "added").length,
      removed: diff.filter((d) => d.type === "removed").length,
      same:    diff.filter((d) => d.type === "same").length,
    };
  }, [diff]);

  const splitRows = useMemo(() => (diff ? buildSplitRows(diff) : []), [diff]);

  const inlineLines = useMemo(() => {
    if (!diff) return [];
    let origNum = 0;
    let modNum  = 0;
    return diff.map((line) => {
      if (line.type === "removed") { origNum++; return { ...line, lineNum: origNum, prefix: "−" }; }
      if (line.type === "added")   { modNum++;  return { ...line, lineNum: modNum,  prefix: "+" }; }
      origNum++;
      modNum++;
      return { ...line, lineNum: origNum, prefix: " " };
    });
  }, [diff]);

  const handleCompare = () => {
    if (!original && !modified) {
      toast.error("Please enter text in at least one field.");
      return;
    }
    const result = computeDiff(original, modified);
    setDiff(result);
    const hasChanges = result.some((d) => d.type !== "same");
    if (hasChanges) {
      toast.success("Diff computed successfully.");
    } else {
      toast.success("Texts are identical — no differences found.");
    }
  };

  const handleClear = () => {
    setOriginal("");
    setModified("");
    setDiff(null);
  };

  const handleSample = () => {
    setOriginal(SAMPLE_ORIGINAL);
    setModified(SAMPLE_MODIFIED);
    setDiff(null);
  };

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 font-sans antialiased transition-colors duration-300 overflow-x-hidden ${
        dark ? "bg-zinc-950" : "bg-[#FDFDFD]"
      }`}
    >
      <title>Diff Checker | DevTasks</title>
      <meta
        name="description"
        content="Compare two text blocks client-side and highlight differences instantly."
      />

      <div
        className={`w-full max-w-6xl md:mx-auto rounded-3xl shadow-lg p-4 sm:p-8 border transition-colors duration-300 ${
          dark ? "bg-zinc-900 border-zinc-700" : "bg-white border-neutral-100"
        }`}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-3 w-full min-w-0">
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
                Diff Checker
              </h1>
            </div>

            {/* View mode toggle */}
            <div
              className={`flex items-center gap-2 p-1 border rounded-2xl self-start sm:self-auto ${
                dark
                  ? "border-zinc-700 bg-zinc-800"
                  : "border-neutral-200 bg-neutral-50"
              }`}
            >
              {VIEWS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setViewMode(opt.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                    viewMode === opt.key
                      ? dark
                        ? "bg-white text-black"
                        : "bg-black text-white"
                      : dark
                        ? "text-neutral-400 hover:text-white"
                        : "text-neutral-400 hover:text-black"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Input textareas ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Original */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-3 h-8">
              <label
                className={`text-xs font-black uppercase tracking-widest ${
                  dark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Original Text
              </label>
              <button
                type="button"
                onClick={handleSample}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-300 ${
                  dark
                    ? "bg-white text-black border-white hover:bg-zinc-200"
                    : "bg-black text-white border-black hover:bg-zinc-800"
                }`}
              >
                Sample
              </button>
            </div>
            <textarea
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              spellCheck={false}
              placeholder="Paste original text here..."
              className={`w-full h-48 p-4 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors font-mono text-sm ${
                dark
                  ? "bg-zinc-950 border-zinc-800 text-zinc-200 placeholder-zinc-600"
                  : "bg-neutral-50 border-neutral-200 text-zinc-800 placeholder-neutral-400"
              }`}
            />
          </div>

          {/* Modified */}
          <div className="flex flex-col">
            <div className="flex items-center mb-3 h-8">
              <label
                className={`text-xs font-black uppercase tracking-widest ${
                  dark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Modified Text
              </label>
            </div>
            <textarea
              value={modified}
              onChange={(e) => setModified(e.target.value)}
              spellCheck={false}
              placeholder="Paste modified text here..."
              className={`w-full h-48 p-4 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors font-mono text-sm ${
                dark
                  ? "bg-zinc-950 border-zinc-800 text-zinc-200 placeholder-zinc-600"
                  : "bg-neutral-50 border-neutral-200 text-zinc-800 placeholder-neutral-400"
              }`}
            />
          </div>
        </div>

        {/* ── Action buttons ───────────────────────────────────────────────── */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            type="button"
            onClick={handleCompare}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${
              dark
                ? "bg-white text-black border-white hover:bg-zinc-200"
                : "bg-black text-white border-black hover:bg-neutral-800"
            }`}
          >
            Compare
          </button>
          <button
            type="button"
            onClick={handleClear}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${
              dark
                ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
                : "bg-white border-neutral-200 text-zinc-600 hover:text-black hover:border-neutral-400"
            }`}
          >
            Clear
          </button>
        </div>

        {/* ── Diff output ──────────────────────────────────────────────────── */}
        {diff && (
          <>
            {/* Stats bar */}
            <div
              className={`flex flex-wrap items-center gap-3 mb-4 px-4 py-3 rounded-xl border ${
                dark
                  ? "border-zinc-800 bg-zinc-950/50"
                  : "border-neutral-200 bg-neutral-50"
              }`}
            >
              <span
                className={`text-xs font-black uppercase tracking-widest ${
                  dark ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                Results:
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  dark
                    ? "bg-green-950/50 text-green-400"
                    : "bg-green-50 text-green-700"
                }`}
              >
                +{stats.added} Added
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  dark
                    ? "bg-red-950/50 text-red-400"
                    : "bg-red-50 text-red-700"
                }`}
              >
                −{stats.removed} Removed
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  dark
                    ? "bg-zinc-800 text-zinc-400"
                    : "bg-neutral-100 text-zinc-500"
                }`}
              >
                {stats.same} Unchanged
              </span>
            </div>

            {/* Split view */}
            {viewMode === "split" && (
              <div
                className={`rounded-xl border overflow-hidden ${
                  dark ? "border-zinc-800" : "border-neutral-200"
                }`}
              >
                {/* Column headers */}
                <div
                  className={`grid grid-cols-2 border-b ${
                    dark ? "border-zinc-800" : "border-neutral-200"
                  }`}
                >
                  <div
                    className={`px-4 py-2 text-xs font-black uppercase tracking-widest border-r ${
                      dark
                        ? "bg-zinc-800 text-zinc-400 border-zinc-700"
                        : "bg-neutral-100 text-zinc-500 border-neutral-200"
                    }`}
                  >
                    Original
                  </div>
                  <div
                    className={`px-4 py-2 text-xs font-black uppercase tracking-widest ${
                      dark
                        ? "bg-zinc-800 text-zinc-400"
                        : "bg-neutral-100 text-zinc-500"
                    }`}
                  >
                    Modified
                  </div>
                </div>

                {/* Diff rows */}
                <div className="max-h-96 overflow-y-auto">
                  {splitRows.map((row, idx) => (
                    <div
                      key={idx}
                      className={`grid grid-cols-2 border-b last:border-0 ${
                        dark ? "border-zinc-800/50" : "border-neutral-100"
                      }`}
                    >
                      {/* Left cell */}
                      <div
                        className={`flex items-start border-r font-mono text-xs ${rowCls(row.left.type, dark)} ${
                          dark ? "border-zinc-800" : "border-neutral-200"
                        }`}
                      >
                        <span
                          className={`w-10 shrink-0 px-2 py-1 text-right text-[11px] select-none leading-5 ${lineNumCls(row.left.type, dark)}`}
                        >
                          {row.left.type !== "empty" ? row.left.lineNum : ""}
                        </span>
                        <span
                          className={`px-3 py-1 whitespace-pre-wrap break-all leading-5 ${textCls(row.left.type, dark)}`}
                        >
                          {row.left.type !== "empty" && row.left.value === ""
                            ? "\u00A0"
                            : row.left.value || "\u00A0"}
                        </span>
                      </div>

                      {/* Right cell */}
                      <div
                        className={`flex items-start font-mono text-xs ${rowCls(row.right.type, dark)}`}
                      >
                        <span
                          className={`w-10 shrink-0 px-2 py-1 text-right text-[11px] select-none leading-5 ${lineNumCls(row.right.type, dark)}`}
                        >
                          {row.right.type !== "empty" ? row.right.lineNum : ""}
                        </span>
                        <span
                          className={`px-3 py-1 whitespace-pre-wrap break-all leading-5 ${textCls(row.right.type, dark)}`}
                        >
                          {row.right.type !== "empty" && row.right.value === ""
                            ? "\u00A0"
                            : row.right.value || "\u00A0"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inline view */}
            {viewMode === "inline" && (
              <div
                className={`rounded-xl border overflow-hidden ${
                  dark ? "border-zinc-800" : "border-neutral-200"
                }`}
              >
                <div
                  className={`px-4 py-2 text-xs font-black uppercase tracking-widest border-b ${
                    dark
                      ? "bg-zinc-800 text-zinc-400 border-zinc-700"
                      : "bg-neutral-100 text-zinc-500 border-neutral-200"
                  }`}
                >
                  Inline Diff
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {inlineLines.map((line, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start font-mono text-xs border-b last:border-0 ${inlineRowCls(line.type, dark)} ${
                        dark ? "border-zinc-800/50" : "border-neutral-100"
                      }`}
                    >
                      <span
                        className={`w-6 shrink-0 px-1 py-1 text-center font-bold leading-5 select-none ${
                          line.type === "added"
                            ? "text-green-500"
                            : line.type === "removed"
                              ? "text-red-500"
                              : dark
                                ? "text-zinc-700"
                                : "text-neutral-300"
                        }`}
                      >
                        {line.prefix}
                      </span>
                      <span
                        className={`w-10 shrink-0 px-2 py-1 text-right text-[11px] select-none leading-5 ${lineNumCls(line.type, dark)}`}
                      >
                        {line.lineNum}
                      </span>
                      <span
                        className={`px-3 py-1 whitespace-pre-wrap break-all leading-5 ${textCls(line.type, dark)}`}
                      >
                        {line.value === "" ? "\u00A0" : line.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DiffChecker;