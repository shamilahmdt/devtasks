import { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const FLAG_DEFS = [
  { key: "g", label: "g", title: "Global — find all matches" },
  { key: "i", label: "i", title: "Case-insensitive" },
  { key: "m", label: "m", title: "Multiline — ^ and $ match line boundaries" },
];

function buildSegments(text, matches) {
  const segments = [];
  let cursor = 0;
  for (let i = 0; i < matches.length; i++) {
    const { index, end, value } = matches[i];
    if (index > cursor) {
      segments.push({
        type: "text",
        value: text.slice(cursor, index),
        key: `pre-${i}`,
      });
    }
    segments.push({ type: "match", value, key: `match-${i}` });
    cursor = end;
  }
  if (cursor < text.length) {
    segments.push({ type: "text", value: text.slice(cursor), key: "tail" });
  }
  return segments;
}

const HighlightedText = ({ text, matches, dark }) => {
  if (!matches.length) {
    return (
      <span className={dark ? "text-zinc-400" : "text-zinc-600"}>{text}</span>
    );
  }
  const segments = buildSegments(text, matches);
  return (
    <>
      {segments.map((seg) =>
        seg.type === "match" ? (
          <mark
            key={seg.key}
            className={`rounded px-0.5 font-semibold not-italic ${
              dark ? "bg-zinc-600 text-white" : "bg-neutral-300 text-black"
            }`}
          >
            {seg.value}
          </mark>
        ) : (
          <span
            key={seg.key}
            className={dark ? "text-zinc-300" : "text-zinc-700"}
          >
            {seg.value}
          </span>
        ),
      )}
    </>
  );
};

const RegexTester = () => {
  const { dark } = useTheme();

  const [pattern, setPattern] = useState("");
  const [testText, setTestText] = useState("");
  const [flags, setFlags] = useState({ g: true, i: false, m: false });

  const activeFlags = useMemo(
    () =>
      FLAG_DEFS.filter((f) => flags[f.key])
        .map((f) => f.key)
        .join(""),
    [flags],
  );

  const regexLiteral = pattern ? `/${pattern}/${activeFlags}` : "";

  const { matchResults, error } = useMemo(() => {
    if (!pattern) return { matchResults: [], error: null };
    try {
      const loopFlags = activeFlags.includes("g")
        ? activeFlags
        : activeFlags + "g";
      const regex = new RegExp(pattern, loopFlags);
      const results = [];
      let match;
      while ((match = regex.exec(testText)) !== null) {
        results.push({
          matchIndex: results.length + 1,
          index: match.index,
          end: match.index + match[0].length,
          value: match[0],
          groups: Array.from(match)
            .slice(1)
            .map((g, i) => ({ groupNum: i + 1, value: g ?? "undefined" })),
        });
        if (match[0].length === 0) regex.lastIndex++;
        if (!flags.g) break;
      }
      return { matchResults: results, error: null };
    } catch (e) {
      return { matchResults: [], error: e.message };
    }
  }, [pattern, testText, flags, activeFlags]);

  const toggleFlag = useCallback((key) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleClear = useCallback(() => {
    setPattern("");
    setTestText("");
    setFlags({ g: true, i: false, m: false });
  }, []);
const handleSample = useCallback(() => {
  setPattern("\\b\\w+@\\w+\\.\\w+\\b");
  setTestText(`john@example.com
hello world
jane@test.com
support@company.org`);

  setFlags({
    g: true,
    i: true,
    m: false,
  });
}, []);
  const handleCopyPattern = useCallback(() => {
    if (!pattern) {
      toast.error("No pattern to copy.");
      return;
    }
    navigator.clipboard
      .writeText(regexLiteral)
      .then(() => toast.success("Pattern copied to clipboard!"))
      .catch(() => toast.error("Failed to copy to clipboard."));
  }, [pattern, regexLiteral]);

  const matchCountLabel =
    !pattern || error
      ? null
      : matchResults.length === 0
        ? "No matches found"
        : `${matchResults.length} match${matchResults.length !== 1 ? "es" : ""} found`;

  return (
    <div
      className={`min-h-[calc(100vh-76px)] md:h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto overflow-x-hidden md:overflow-hidden relative flex flex-col justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>Regex Tester — DevTasks</title>
      <meta
        name="description"
        content="Test and validate regular expressions against a test string with configurable flags."
      />

      {/* Background glows */}
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

      {/* Main card */}
      <div
        className={`relative z-10 w-full max-w-5xl md:mx-auto rounded-[32px] border shadow-xl flex flex-col max-h-full md:max-h-[85vh] overflow-hidden transition-all duration-300 ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        {/* Top accent bar */}
        <div
          className={`h-2 w-full transition-colors duration-500 ${
            dark ? "bg-white" : "bg-black"
          }`}
        />

        {/* Header */}
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
            Regex Tester
          </h1>
        </div>

        {/* Content area */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto min-h-0">
          {/* ── TOP PANEL: Pattern + Flags + Literal preview ── */}
          <div className="flex flex-col gap-4 mb-6">
            {/* Pattern input */}
            <div className="group flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <label
                  className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                    dark
                      ? "text-zinc-400 group-focus-within:text-white"
                      : "text-neutral-500 group-focus-within:text-black"
                  }`}
                >
                  Pattern
                </label>

              </div>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="e.g. \b\w+\b or (\w+): (\d+)"
                spellCheck={false}
                autoComplete="off"
                className={`w-full px-4 py-3 rounded-2xl border text-sm font-mono outline-none transition-all duration-300 ${
                  error
                    ? dark
                      ? "bg-zinc-950 border-zinc-600 text-zinc-200 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                      : "bg-neutral-50 border-neutral-400 text-zinc-800 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
                    : dark
                      ? "bg-zinc-950 border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:border-white focus:ring-1 focus:ring-white"
                      : "bg-neutral-50 border-neutral-200 text-zinc-800 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                }`}
              />
            </div>

            {/* Flags + Literal preview + Actions row */}
            <div className="flex flex-wrap items-end justify-between gap-6 w-full">
              <div className="flex flex-wrap items-end gap-6">
                {/* Flags */}
                <div className="flex flex-col space-y-2">
                  <label
                    className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                      dark ? "text-zinc-400" : "text-neutral-500"
                    }`}
                  >
                    Flags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FLAG_DEFS.map((flag) => (
                      <button
                        key={flag.key}
                        type="button"
                        title={flag.title}
                        onClick={() => toggleFlag(flag.key)}
                        className={`px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 ${
                          flags[flag.key]
                            ? dark
                              ? "bg-white text-black border-white"
                              : "bg-black text-white border-black"
                            : dark
                              ? "border-zinc-700 text-zinc-300 hover:border-white hover:text-white"
                              : "border-neutral-200 text-zinc-600 hover:text-black"
                        }`}
                      >
                        {flag.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Regex literal preview */}
                {regexLiteral && (
                  <div className="flex flex-col space-y-2">
                    <label
                      className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                        dark ? "text-zinc-400" : "text-neutral-500"
                      }`}
                    >
                      Regex Literal
                    </label>
                    <span
                      className={`font-mono text-sm px-4 py-2 rounded-2xl border select-all transition-colors duration-300 ${
                        error
                          ? dark
                            ? "bg-zinc-950 border-zinc-700 text-zinc-500 line-through"
                            : "bg-neutral-100 border-neutral-300 text-zinc-400 line-through"
                          : dark
                            ? "bg-zinc-950 border-zinc-700 text-zinc-300"
                            : "bg-neutral-100 border-neutral-300 text-zinc-600"
                      }`}
                    >
                      {regexLiteral}
                    </span>
                  </div>
                )}
              </div>

              {/* Action buttons aligned to the right side end */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClear}
                  className={`px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 ${
                    dark
                      ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
                      : "bg-white border-neutral-200 text-zinc-600 hover:text-black hover:border-neutral-400"
                  }`}
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleSample}
                  className={`px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 ${
                   dark
                    ? "bg-white text-black border-white hover:bg-zinc-200"
                    : "bg-black text-white border-black hover:bg-zinc-800"
                 }`}
                >
                 Sample
                </button>
                <button
                  type="button"
                  onClick={handleCopyPattern}
                  className={`px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 ${
                    dark
                      ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
                      : "bg-white border-neutral-200 text-zinc-600 hover:text-black hover:border-neutral-400"
                  }`}
                >
                  Copy Pattern
                </button>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div
                className={`px-4 py-3 rounded-2xl border text-sm font-mono transition-colors duration-300 ${
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
                  Invalid Regex:
                </span>
                {error}
              </div>
            )}
          </div>

          {/* ── TWO-COLUMN GRID ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-5">
            {/* LEFT: Test Text */}
            <div className="flex flex-col space-y-2">
              <label
                className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                  dark ? "text-zinc-400" : "text-neutral-500"
                }`}
              >
                Test Text
              </label>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter test string here..."
                spellCheck={false}
                className={`w-full h-36 px-4 py-3 rounded-2xl border text-sm font-mono outline-none transition-all duration-300 resize-none ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:border-white focus:ring-1 focus:ring-white"
                    : "bg-neutral-50 border-neutral-200 text-zinc-800 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                }`}
              />
            </div>

            {/* RIGHT: Match stats + highlighted preview + match list */}
            <div className="flex flex-col space-y-2">
              <label
                className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                  dark ? "text-zinc-400" : "text-neutral-500"
                }`}
              >
                {matchCountLabel ?? "Matches"}
              </label>

              <div className="flex flex-col gap-3 flex-1 min-h-0">
                <div
                  className={`w-full h-36 overflow-y-auto px-4 py-3 rounded-2xl border text-sm font-mono transition-all duration-300 leading-relaxed whitespace-pre-wrap break-all ${
                    dark
                      ? "bg-zinc-950/50 border-zinc-800 text-zinc-200"
                      : "bg-neutral-100 border-neutral-200 text-zinc-800"
                  }`}
                >
                  {testText ? (
                    <HighlightedText
                      text={testText}
                      matches={error ? [] : matchResults}
                      dark={dark}
                    />
                  ) : (
                    <span className={dark ? "text-zinc-600" : "text-zinc-400"}>
                      Highlighted matches will appear here...
                    </span>
                  )}
                </div>

                {/* Match list with capturing groups */}
                {!error && matchResults.length > 0 && (
                  <div
                    className={`rounded-2xl border overflow-hidden transition-colors duration-300 ${
                      dark ? "border-zinc-800" : "border-neutral-200"
                    }`}
                  >
                    <div
                      className={`max-h-24 overflow-y-auto divide-y ${
                        dark ? "divide-zinc-800" : "divide-neutral-100"
                      }`}
                    >
                      {matchResults.map((match) => (
                        <div
                          key={match.matchIndex}
                          className={`px-4 py-2.5 text-xs font-mono transition-colors duration-300 ${
                            dark ? "text-zinc-300" : "text-zinc-700"
                          }`}
                        >
                          <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="font-black uppercase tracking-widest text-[10px]">
                              Match {match.matchIndex}
                            </span>
                            <span
                              className={`text-[10px] font-normal normal-case tracking-normal ${
                                dark ? "text-zinc-500" : "text-zinc-400"
                              }`}
                            >
                              index {match.index}–{match.end - 1}
                            </span>
                          </div>
                          <div
                            className={`truncate ${
                              dark ? "text-zinc-200" : "text-zinc-800"
                            }`}
                          >
                            &ldquo;{match.value}&rdquo;
                          </div>
                          {match.groups.length > 0 && (
                            <div
                              className={`mt-1 pl-2 border-l flex flex-col gap-0.5 ${
                                dark ? "border-zinc-700" : "border-neutral-300"
                              }`}
                            >
                              {match.groups.map((group) => (
                                <div
                                  key={group.groupNum}
                                  className={
                                    dark
                                      ? "text-zinc-500 text-[10px]"
                                      : "text-zinc-400 text-[10px]"
                                  }
                                >
                                  Group {group.groupNum}: {group.value}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegexTester;
