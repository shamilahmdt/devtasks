import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

// Constants ------------------------------------------------------------------

const READING_WPM = 200;
const SPEAKING_WPM = 130;

const STOP_WORDS = new Set([
  "the", "is", "at", "which", "on", "a", "an", "and", "or", "of", "to", "in",
  "for", "it", "with", "as", "by", "this", "that", "be", "are", "was", "were",
  "from", "but", "not", "have", "has", "had", "you", "your", "i", "we", "they",
  "he", "she", "his", "her", "its", "their", "our", "if", "then", "so", "than",
  "do", "does", "did", "can", "could", "will", "would", "should", "there",
]);

const SAMPLE_TEXT = `The String Inspector is a small client-side tool that helps developers and writers understand the shape of their text. Paste any paragraph, article, or block of code comments, and it will instantly break down how many characters, words, sentences, and paragraphs you have written.

Word frequency analysis is especially useful for SEO writers and copywriters. It reveals which terms appear most often, helping you spot repetition, keyword stuffing, or simply understand the focus of a piece of writing. You can toggle common stop words on or off depending on whether you want raw frequency or a more meaningful keyword density.

Reading time and speaking time estimates are calculated using standard averages: about two hundred words per minute for silent reading, and roughly one hundred thirty words per minute for spoken delivery. These numbers are rough guides, not exact science, but they are useful for blog posts, scripts, and presentations alike.

Everything here runs entirely offline, directly in your browser. No text is ever uploaded, stored, or sent anywhere. Try pasting your own text above to see the metrics update in real time!`;

// Core Logic Functions ---------------------------------------------------------

/**
 * Splits text into words using a robust regex that:
 * - Treats any run of unicode letters/numbers/apostrophes as a single word
 * - Ignores multiple spaces, tabs, and line breaks
 * - Does not count stray punctuation as its own "word"
 */
const extractWords = (text) => {
  if (!text) return [];
  const matches = text.match(/[A-Za-z0-9\u00C0-\u024F']+/g);
  return matches || [];
};

const countCharacters = (text) => ({
  withSpaces: text.length,
  withoutSpaces: text.replace(/\s/g, "").length,
});

const countSentences = (text) => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  // Split on sentence terminators (. ! ?) followed by space/newline/end-of-string.
  // Filters out empty fragments caused by ellipses, decimals, or trailing punctuation.
  const matches = trimmed.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g);
  if (!matches) return trimmed.length > 0 ? 1 : 0;
  return matches.filter((s) => s.trim().length > 0).length;
};

const countParagraphs = (text) => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  // Paragraphs are separated by one or more blank lines. Handles \r\n safely.
  const blocks = trimmed
    .split(/\r?\n\s*\r?\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  return blocks.length || (trimmed.length > 0 ? 1 : 0);
};

const getByteSize = (text) => new Blob([text]).size;

const formatDuration = (totalMinutesFloat) => {
  const totalSeconds = Math.round(totalMinutesFloat * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
};

const cleanWord = (word) =>
  word
    .toLowerCase()
    // Strip leading/trailing punctuation/quotes safely, keep internal apostrophes (e.g. don't)
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

const analyzeText = (text, excludeStopWords) => {
  const words = extractWords(text);
  const wordCount = words.length;
  const { withSpaces, withoutSpaces } = countCharacters(text);

  return {
    charsWithSpaces: withSpaces,
    charsWithoutSpaces: withoutSpaces,
    wordCount,
    sentenceCount: countSentences(text),
    paragraphCount: countParagraphs(text),
    byteSize: getByteSize(text),
    readingTime: wordCount / READING_WPM,
    speakingTime: wordCount / SPEAKING_WPM,
    frequency: getWordFrequency(words, excludeStopWords),
  };
};

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(2)} KB`;
};

// Main Component --------------------------------------------------------------

const StringInspector = () => {
  const { dark } = useTheme();
  const [text, setText] = useState("");
  const [excludeStopWords, setExcludeStopWords] = useState(false);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(
    () => analyzeText(text, excludeStopWords),
    [text, excludeStopWords]
  );

  const topWords = stats.frequency.slice(0, 15);

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      heading: "text-zinc-900",
      subtext: "text-zinc-500",
      card: "bg-white border-zinc-200/85",
      input:
        "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none",
      sampleBtn: "bg-black text-white border-black hover:bg-zinc-800",
      clearBtn: "bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-100",
      copyBtn: "bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-700",
      copyBtnSuccess: "bg-green-600 text-white border-green-600",
      statCard: "bg-white border-zinc-200/85",
      statLabel: "text-zinc-500",
      statValue: "text-zinc-900",
      tableHead: "text-zinc-500 border-zinc-200",
      tableRow: "border-zinc-100 hover:bg-zinc-50",
      tableBar: "bg-zinc-200",
      tableBarFill: "bg-zinc-900",
      toggleOn: "bg-zinc-900",
      toggleOff: "bg-zinc-300",
      backLink:
        "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350",
      emptyText: "text-zinc-400",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      heading: "text-zinc-100",
      subtext: "text-zinc-500",
      card: "bg-zinc-900/50 border-zinc-800/85",
      input:
        "bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none",
      sampleBtn: "bg-white text-black border-white hover:bg-zinc-200",
      clearBtn: "bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700",
      copyBtn: "bg-white text-zinc-900 border-white hover:bg-zinc-200",
      copyBtnSuccess: "bg-green-500 text-white border-green-500",
      statCard: "bg-zinc-900/50 border-zinc-800/85",
      statLabel: "text-zinc-500",
      statValue: "text-zinc-100",
      tableHead: "text-zinc-500 border-zinc-800",
      tableRow: "border-zinc-800/60 hover:bg-zinc-800/40",
      tableBar: "bg-zinc-800",
      tableBarFill: "bg-white",
      toggleOn: "bg-white",
      toggleOff: "bg-zinc-700",
      backLink:
        "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600",
      emptyText: "text-zinc-600",
    },
  };

  const t = dark ? theme.dark : theme.light;

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Unable to copy text", error);
    }
  };

  const handleClear = () => {
    setText("");
    setCopied(false);
  };

  const summaryStats = [
    { label: "Characters", value: stats.charsWithSpaces.toLocaleString() },
    { label: "No Spaces", value: stats.charsWithoutSpaces.toLocaleString() },
    { label: "Words", value: stats.wordCount.toLocaleString() },
    { label: "Sentences", value: stats.sentenceCount.toLocaleString() },
    { label: "Paragraphs", value: stats.paragraphCount.toLocaleString() },
    { label: "Size", value: formatBytes(stats.byteSize) },
    { label: "Reading Time", value: formatDuration(stats.readingTime) },
    { label: "Speaking Time", value: formatDuration(stats.speakingTime) },
  ];

  return (
    <div className={`min-h-screen ${t.wrapper} px-6 py-10`}>
      <title>String Inspector — DevTasks</title>
      <meta
        name="description"
        content="Analyze text in detail: character, word, sentence, and paragraph counts, byte size, reading/speaking time, and word frequency density."
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${t.backLink}`}
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
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${t.heading}`}>
              String Inspector
            </h1>
            <p className={`mt-1 text-sm ${t.subtext}`}>
              Analyze text metrics and word frequency density in real time.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Input Card */}
          <div className={`rounded-3xl border ${t.card} p-6`}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <p
                className={`text-xs uppercase tracking-widest font-medium ${t.subtext}`}
              >
                Input Text
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setText(SAMPLE_TEXT)}
                  className={`px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 ${t.sampleBtn}`}
                >
                  Sample Text
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!text}
                  className={`px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 ${
                    copied ? t.copyBtnSuccess : t.copyBtn
                  }`}
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className={`px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 ${t.clearBtn}`}
                >
                  Clear
                </button>
              </div>
            </div>
            <textarea
              className={`w-full px-4 py-3 rounded-xl border text-sm font-mono resize-none ${t.input}`}
              rows={10}
              placeholder="Paste or type text here to inspect it..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
            />
          </div>

          {/* Metrics Grid */}
          <div className={`rounded-3xl border ${t.card} p-6`}>
            <p
              className={`text-xs uppercase tracking-widest font-medium mb-4 ${t.subtext}`}
            >
              Metrics
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {summaryStats.map(({ label, value }) => (
                <div
                  key={label}
                  className={`rounded-2xl border ${t.statCard} p-4`}
                >
                  <p
                    className={`text-xs uppercase tracking-widest font-medium ${t.statLabel}`}
                  >
                    {label}
                  </p>
                  <p
                    className={`text-2xl font-semibold tabular-nums mt-2 ${t.statValue}`}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Word Frequency Table */}
          <div className={`rounded-3xl border ${t.card} p-6`}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <p
                className={`text-xs uppercase tracking-widest font-medium ${t.subtext}`}
              >
                Word Frequency & Density
              </p>

              {/* Stop Words Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className={`text-xs font-medium ${t.subtext}`}>
                  Exclude Stop Words
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={excludeStopWords}
                  onClick={() => setExcludeStopWords((v) => !v)}
                  className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
                    excludeStopWords ? t.toggleOn : t.toggleOff
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                      excludeStopWords ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>
            </div>

            {topWords.length === 0 ? (
              <p className={`text-sm py-8 text-center ${t.emptyText}`}>
                Start typing or load sample text to see word frequency.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className={`text-xs uppercase tracking-widest font-medium border-b ${t.tableHead}`}
                    >
                      <th className="text-left py-2 px-2 font-medium">#</th>
                      <th className="text-left py-2 px-2 font-medium">Word</th>
                      <th className="text-right py-2 px-2 font-medium">
                        Occurrences
                      </th>
                      <th className="text-right py-2 px-2 font-medium">
                        Density
                      </th>
                      <th className="text-left py-2 px-2 font-medium w-32">
                        Share
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topWords.map((entry, idx) => (
                      <tr
                        key={entry.word}
                        className={`border-b transition-colors ${t.tableRow}`}
                      >
                        <td className={`py-2 px-2 ${t.subtext}`}>{idx + 1}</td>
                        <td
                          className={`py-2 px-2 font-mono ${t.statValue}`}
                        >
                          {entry.word}
                        </td>
                        <td
                          className={`py-2 px-2 text-right tabular-nums ${t.statValue}`}
                        >
                          {entry.count}
                        </td>
                        <td
                          className={`py-2 px-2 text-right tabular-nums ${t.subtext}`}
                        >
                          {entry.density.toFixed(1)}%
                        </td>
                        <td className="py-2 px-2">
                          <div
                            className={`h-1.5 w-full rounded-full overflow-hidden ${t.tableBar}`}
                          >
                            <div
                              className={`h-full rounded-full ${t.tableBarFill}`}
                              style={{
                                width: `${Math.min(entry.density, 100)}%`,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StringInspector;