import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

// ─── Constants & Logic Helpers ───────────────────────────────────────────────

const STOP_WORDS = new Set([
  "the", "is", "at", "which", "on", "a", "an", "and", "or", "of", "to", "in",
  "for", "it", "with", "as", "by", "this", "that", "be", "are", "was", "were",
  "from", "but", "not", "have", "has", "had", "you", "your", "i", "we", "they",
  "he", "she", "his", "her", "its", "their", "our", "if", "then", "so", "than",
  "do", "does", "did", "can", "could", "will", "would", "should", "there",
]);

const toCamelCase = (str) => {
  return str
    .toLowerCase()
    .trim()
    .split(/[\s_-]+/)
    .map((word, i) =>
      i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join("");
};

const toSnakeCase = (str) =>
  str.trim().toLowerCase().replace(/\s+/g, "_");

const toKebabCase = (str) =>
  str.trim().toLowerCase().replace(/\s+/g, "-");

const toPascalCase = (str) =>
  str
    .toLowerCase()
    .trim()
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

const toTitleCase = (str) =>
  str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const toSlug = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const extractWords = (text) => {
  if (!text) return [];
  const matches = text.match(/[A-Za-z0-9\u00C0-\u024F']+/g);
  return matches || [];
};

const countSentences = (text) => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const matches = trimmed.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g);
  if (!matches) return trimmed.length > 0 ? 1 : 0;
  return matches.filter((s) => s.trim().length > 0).length;
};

const countParagraphs = (text) => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const blocks = trimmed
    .split(/\r?\n\s*\r?\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  return blocks.length || (trimmed.length > 0 ? 1 : 0);
};

const cleanWord = (word) =>
  word
    .toLowerCase()
    .replace(/^[^a-z0-9\u00C0-\u024F]+|[^a-z0-9\u00C0-\u024F]+$/gi, "");

const getWordFrequency = (words, excludeStopWords) => {
  const freq = new Map();
  for (const raw of words) {
    const word = cleanWord(raw);
    if (!word) continue;
    if (excludeStopWords && STOP_WORDS.has(word)) continue;
    freq.set(word, (freq.get(word) || 0) + 1);
  }
  const total = Array.from(freq.values()).reduce((sum, n) => sum + n, 0);
  return Array.from(freq.entries())
    .map(([word, count]) => ({
      word,
      count,
      density: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
};

const formatDuration = (totalMinutesFloat) => {
  const totalSeconds = Math.round(totalMinutesFloat * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const TextCaseConverter = () => {
  const { dark } = useTheme();
  const [activeTab, setActiveTab] = useState("case"); // case | inspector | list

  // --- GENERAL/CASE STATE ---
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");

  // --- INSPECTOR STATE ---
  const [inspectorText, setInspectorText] = useState("");
  const [excludeStopWords, setExcludeStopWords] = useState(true);

  // --- LIST CLEANER STATE ---
  const [listText, setListText] = useState("");

  // --- CASE CONVERTER HANDLERS ---
  const handleCaseChange = (conversionFn) => {
    if (!inputText) return;
    try {
      setOutputText(conversionFn(inputText));
    } catch {
      toast.error("Failed to convert case");
    }
  };

  const handleCaseCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleCaseSample = () => {
    setInputText("Hello world! This is a sample text to convert into different cases.");
    setOutputText("");
  };

  const handleCaseClear = () => {
    setInputText("");
    setOutputText("");
  };

  // --- INSPECTOR LOGIC ---
  const wordsArray = useMemo(() => extractWords(inspectorText), [inspectorText]);
  const wordFreq = useMemo(() => getWordFrequency(wordsArray, excludeStopWords), [wordsArray, excludeStopWords]);

  const inspectorStats = useMemo(() => {
    const charsWithSpaces = inspectorText.length;
    const charsWithoutSpaces = inspectorText.replace(/\s/g, "").length;
    const words = wordsArray.length;
    const sentences = countSentences(inspectorText);
    const paragraphs = countParagraphs(inspectorText);
    const byteSize = new Blob([inspectorText]).size;
    const readingTime = formatDuration(words / 200);
    const speakingTime = formatDuration(words / 130);

    return {
      charsWithSpaces,
      charsWithoutSpaces,
      words,
      sentences,
      paragraphs,
      byteSize,
      readingTime,
      speakingTime,
    };
  }, [inspectorText, wordsArray]);

  const handleInspectorSample = () => {
    setInspectorText(
      "The String Inspector is a client-side utility that helps writers and developers understand text layout. Paste code comments or articles here to check metrics instantly in real-time."
    );
  };

  // --- LIST CLEANER LOGIC ---
  const listLinesCount = useMemo(() => {
    if (!listText.trim()) return 0;
    return listText.split(/\r?\n/).length;
  }, [listText]);

  const listTransform = (transformFunction) => {
    const lines = listText.split(/\r?\n/);
    const result = transformFunction(lines);
    setListText(result.join("\n"));
  };

  const handleListSort = (direction) => {
    listTransform((lines) =>
      [...lines].sort((a, b) => {
        const cmp = a.trim().localeCompare(b.trim(), undefined, { sensitivity: "base" });
        return direction === "asc" ? cmp : -cmp;
      })
    );
    toast.success(`Sorted list ${direction === "asc" ? "A-Z" : "Z-A"}`);
  };

  const handleListRemoveDuplicates = () => {
    listTransform((lines) => {
      const seen = new Set();
      return lines.filter((l) => {
        const norm = l.trim().toLowerCase();
        if (seen.has(norm)) return false;
        seen.add(norm);
        return true;
      });
    });
    toast.success("Duplicate lines removed");
  };

  const handleListTrim = () => {
    listTransform((lines) => lines.map((l) => l.trim()));
    toast.success("Whitespace trimmed from lines");
  };

  const handleListRemoveEmpty = () => {
    listTransform((lines) => lines.filter((l) => l.trim() !== ""));
    toast.success("Empty lines removed");
  };

  const handleListCleanAll = () => {
    listTransform((lines) => {
      const seen = new Set();
      return lines
        .map((l) => l.trim())
        .filter((l) => l !== "")
        .filter((l) => {
          const norm = l.toLowerCase();
          if (seen.has(norm)) return false;
          seen.add(norm);
          return true;
        });
    });
    toast.success("Full list cleanup complete!");
  };

  const handleListCopy = async () => {
    if (!listText) return;
    try {
      await navigator.clipboard.writeText(listText);
      toast.success("List copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleListSample = () => {
    setListText("  banana\n\nApple\nbanana\norange\napple\n  grape\norange  ");
  };

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 font-sans antialiased transition-colors duration-300 overflow-x-hidden ${
        dark ? "bg-zinc-950" : "bg-[#FDFDFD]"
      }`}
    >
      <title>Text Processing Suite | DevTasks</title>
      <meta
        name="description"
        content="Offline text processing utility. Convert string cases, inspect text layout statistics, analyze word frequencies, and clean/sort lists."
      />

      <div
        className={`w-full max-w-6xl md:mx-auto rounded-3xl sm:rounded-4xl shadow-lg p-4 sm:p-8 border transition-colors duration-300 ${
          dark ? "bg-zinc-900 border-zinc-700" : "bg-white border-neutral-100"
        }`}
      >
        {/* Header Area */}
        <div className="flex flex-col gap-6 mb-8">
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
                  className="w-4.5 h-4.5"
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
                  className={`text-xl sm:text-2xl font-black uppercase tracking-tight transition-colors duration-300 min-w-0 flex-1 ${
                    dark ? "text-white" : "text-black"
                  }`}
                >
                  Text Processing Suite
                </h1>
                <p className={`text-xs ${dark ? "text-zinc-500" : "text-zinc-400"} mt-0.5`}>
                  All-in-one offline text cases, metrics, and list sanitizer suite.
                </p>
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex border rounded-2xl p-1 bg-zinc-100 dark:bg-zinc-800 border-neutral-200 dark:border-zinc-750 shrink-0 self-start sm:self-center">
              <button
                onClick={() => setActiveTab("case")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                  activeTab === "case"
                    ? dark
                      ? "bg-white text-black"
                      : "bg-black text-white"
                    : "bg-transparent text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Case Converter
              </button>
              <button
                onClick={() => setActiveTab("inspector")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                  activeTab === "inspector"
                    ? dark
                      ? "bg-white text-black"
                      : "bg-black text-white"
                    : "bg-transparent text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Text Inspector
              </button>
              <button
                onClick={() => setActiveTab("list")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                  activeTab === "list"
                    ? dark
                      ? "bg-white text-black"
                      : "bg-black text-white"
                    : "bg-transparent text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                }`}
              >
                List Cleaner
              </button>
            </div>
          </div>
        </div>

        {/* ── Tab 1: Case Converter ── */}
        {activeTab === "case" && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
              {/* Input */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-3 h-8">
                  <label className={`text-xs font-black uppercase tracking-widest ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
                    Input String
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCaseSample}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        dark ? "bg-zinc-800 text-zinc-300 hover:text-white" : "bg-neutral-100 text-zinc-650 hover:text-black"
                      }`}
                    >
                      Sample
                    </button>
                    <button
                      onClick={handleCaseClear}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        dark ? "bg-zinc-800 text-zinc-300 hover:text-white" : "bg-neutral-100 text-zinc-650 hover:text-black"
                      }`}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className={`w-full h-64 p-4 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors ${
                    dark ? "bg-zinc-950 border-zinc-800 text-zinc-200" : "bg-neutral-50 border-neutral-200 text-zinc-800"
                  }`}
                  placeholder="Type or paste text to convert..."
                />
              </div>

              {/* Output */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-3 h-8">
                  <label className={`text-xs font-black uppercase tracking-widest ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
                    Converted Result
                  </label>
                  {outputText && (
                    <button
                      onClick={handleCaseCopy}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        dark ? "bg-zinc-800 text-zinc-300 hover:text-white" : "bg-neutral-100 text-zinc-650 hover:text-black"
                      }`}
                    >
                      Copy Result
                    </button>
                  )}
                </div>
                <textarea
                  value={outputText}
                  readOnly
                  className={`w-full h-64 p-4 rounded-xl border resize-none focus:outline-none transition-colors ${
                    dark
                      ? `bg-zinc-900/50 border-zinc-800 ${outputText ? "text-zinc-200" : "text-zinc-500"}`
                      : `bg-neutral-100 border-neutral-200 ${outputText ? "text-zinc-800" : "text-zinc-400"}`
                  }`}
                  placeholder="Result will appear here..."
                />
              </div>
            </div>

            {/* Cases Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "UPPERCASE", fn: toUpperCase },
                { label: "lowercase", fn: toLowerCase },
                { label: "camelCase", fn: toCamelCase },
                { label: "snake_case", fn: toSnakeCase },
                { label: "kebab-case", fn: toKebabCase },
                { label: "PascalCase", fn: toPascalCase },
                { label: "Title Case", fn: toTitleCase },
                { label: "URL slug", fn: toSlug },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => handleCaseChange(btn.fn)}
                  className={`py-3.5 px-4 rounded-2xl text-xs font-bold border transition-all duration-200 hover:scale-105 active:scale-95 ${
                    dark
                      ? "bg-zinc-900 border-zinc-805 text-zinc-300 hover:text-white hover:border-zinc-700"
                      : "bg-white border-neutral-200 text-zinc-650 hover:text-black hover:border-neutral-350"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 2: Text Inspector ── */}
        {activeTab === "inspector" && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
              {/* Text Input area */}
              <div className="lg:col-span-8 flex flex-col gap-3">
                <div className="flex justify-between items-center h-8">
                  <label className={`text-xs font-black uppercase tracking-widest ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
                    Source Text
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleInspectorSample}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        dark ? "bg-zinc-800 text-zinc-300 hover:text-white" : "bg-neutral-100 text-zinc-650 hover:text-black"
                      }`}
                    >
                      Sample
                    </button>
                    <button
                      onClick={() => setInspectorText("")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        dark ? "bg-zinc-800 text-zinc-300 hover:text-white" : "bg-neutral-100 text-zinc-650 hover:text-black"
                      }`}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <textarea
                  value={inspectorText}
                  onChange={(e) => setInspectorText(e.target.value)}
                  className={`w-full h-72 p-4 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors ${
                    dark ? "bg-zinc-950 border-zinc-800 text-zinc-200" : "bg-neutral-50 border-neutral-200 text-zinc-800"
                  }`}
                  placeholder="Paste your text to inspect..."
                />
              </div>

              {/* Quick stats sidebar */}
              <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                {[
                  { label: "Characters (with spaces)", val: inspectorStats.charsWithSpaces },
                  { label: "Characters (no spaces)", val: inspectorStats.charsWithoutSpaces },
                  { label: "Words count", val: inspectorStats.words },
                  { label: "Sentences count", val: inspectorStats.sentences },
                  { label: "Paragraphs", val: inspectorStats.paragraphs },
                  { label: "Byte size", val: `${inspectorStats.byteSize} B` },
                  { label: "Reading time", val: inspectorStats.readingTime },
                  { label: "Speaking time", val: inspectorStats.speakingTime },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`p-4 rounded-2xl border text-center ${
                      dark ? "bg-zinc-950 border-zinc-800/80" : "bg-neutral-50 border-neutral-200"
                    }`}
                  >
                    <div className={`text-[10px] font-black uppercase tracking-widest leading-normal mb-1.5 ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                      {s.label}
                    </div>
                    <div className={`text-base font-black tracking-tight ${dark ? "text-white" : "text-black"}`}>
                      {s.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Word frequency analysis table */}
            {wordsArray.length > 0 && (
              <div className={`rounded-3xl border p-6 ${dark ? "bg-zinc-950 border-zinc-850" : "bg-neutral-50 border-neutral-200"}`}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                  <h3 className={`text-sm font-black uppercase tracking-widest ${dark ? "text-zinc-300" : "text-zinc-650"}`}>
                    Word Density Analysis
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={excludeStopWords}
                      onChange={(e) => setExcludeStopWords(e.target.checked)}
                      className="rounded text-zinc-900"
                    />
                    <span className={`text-xs font-semibold ${dark ? "text-zinc-400" : "text-zinc-600"}`}>
                      Exclude common stop words
                    </span>
                  </label>
                </div>

                <div className="overflow-x-auto max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={`border-b ${dark ? "border-zinc-800 text-zinc-500" : "border-neutral-250 text-neutral-450"}`}>
                        <th className="pb-3 font-bold uppercase tracking-wider">Word</th>
                        <th className="pb-3 font-bold uppercase tracking-wider text-center">Count</th>
                        <th className="pb-3 font-bold uppercase tracking-wider text-right">Density</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wordFreq.slice(0, 15).map((row) => (
                        <tr key={row.word} className={`border-b last:border-0 ${dark ? "border-zinc-850/50" : "border-neutral-200/50"}`}>
                          <td className="py-2.5 font-bold">{row.word}</td>
                          <td className="py-2.5 font-black text-center">{row.count}</td>
                          <td className="py-2.5 font-mono text-right">{row.density.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab 3: List Cleaner ── */}
        {activeTab === "list" && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
              {/* List Input */}
              <div className="lg:col-span-8 flex flex-col gap-3">
                <div className="flex justify-between items-center h-8">
                  <label className={`text-xs font-black uppercase tracking-widest ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
                    List Elements (line by line)
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleListSample}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        dark ? "bg-zinc-800 text-zinc-300 hover:text-white" : "bg-neutral-100 text-zinc-650 hover:text-black"
                      }`}
                    >
                      Sample
                    </button>
                    <button
                      onClick={() => setListText("")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        dark ? "bg-zinc-800 text-zinc-300 hover:text-white" : "bg-neutral-100 text-zinc-650 hover:text-black"
                      }`}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <textarea
                  value={listText}
                  onChange={(e) => setListText(e.target.value)}
                  className={`w-full h-80 p-4 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors text-xs font-mono leading-relaxed ${
                    dark ? "bg-zinc-950 border-zinc-800 text-zinc-200" : "bg-neutral-50 border-neutral-200 text-zinc-850"
                  }`}
                  placeholder="Paste lists here, each entry on its own line..."
                />
              </div>

              {/* Actions & Metrics Sidebar */}
              <div className="lg:col-span-4 flex flex-col gap-5">
                <div className={`p-5 rounded-2xl border text-center ${dark ? "bg-zinc-950 border-zinc-800" : "bg-neutral-50 border-neutral-200"}`}>
                  <div className={`text-[10px] font-black uppercase tracking-widest leading-normal mb-1 ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                    Line Count
                  </div>
                  <div className={`text-2xl font-black tracking-tight ${dark ? "text-white" : "text-black"}`}>
                    {listLinesCount}
                  </div>
                </div>

                {/* Sorter Actions grid */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleListSort("asc")}
                    className={`py-3.5 px-4 rounded-2xl text-xs font-bold border transition-all duration-200 hover:scale-105 active:scale-95 text-center ${
                      dark ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white" : "bg-white border-neutral-250 text-zinc-650 hover:text-black"
                    }`}
                  >
                    Sort List A-Z
                  </button>
                  <button
                    onClick={() => handleListSort("desc")}
                    className={`py-3.5 px-4 rounded-2xl text-xs font-bold border transition-all duration-200 hover:scale-105 active:scale-95 text-center ${
                      dark ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white" : "bg-white border-neutral-250 text-zinc-650 hover:text-black"
                    }`}
                  >
                    Sort List Z-A
                  </button>
                  <button
                    onClick={handleListRemoveDuplicates}
                    className={`py-3.5 px-4 rounded-2xl text-xs font-bold border transition-all duration-200 hover:scale-105 active:scale-95 text-center ${
                      dark ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white" : "bg-white border-neutral-250 text-zinc-650 hover:text-black"
                    }`}
                  >
                    Remove Duplicates
                  </button>
                  <button
                    onClick={handleListTrim}
                    className={`py-3.5 px-4 rounded-2xl text-xs font-bold border transition-all duration-200 hover:scale-105 active:scale-95 text-center ${
                      dark ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white" : "bg-white border-neutral-250 text-zinc-650 hover:text-black"
                    }`}
                  >
                    Trim Line Spaces
                  </button>
                  <button
                    onClick={handleListRemoveEmpty}
                    className={`py-3.5 px-4 rounded-2xl text-xs font-bold border transition-all duration-200 hover:scale-105 active:scale-95 text-center ${
                      dark ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white" : "bg-white border-neutral-250 text-zinc-650 hover:text-black"
                    }`}
                  >
                    Remove Empty Lines
                  </button>
                  <button
                    onClick={handleListCleanAll}
                    className={`py-3.5 px-4 rounded-2xl text-xs font-bold border transition-all duration-200 hover:scale-105 active:scale-95 text-center ${
                      dark
                        ? "bg-white text-black hover:bg-zinc-200 border-white"
                        : "bg-black text-white hover:bg-zinc-800 border-black"
                    }`}
                  >
                    Clean All (Trim, Dedupe, Empty)
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleListCopy}
                disabled={!listText}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:scale-100 ${
                  dark ? "bg-white text-black hover:bg-zinc-200 border-white" : "bg-black text-white hover:bg-zinc-800 border-black"
                }`}
              >
                Copy Cleaned List
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextCaseConverter;