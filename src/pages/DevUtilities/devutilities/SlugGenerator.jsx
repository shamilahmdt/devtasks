import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { FaArrowLeft, FaCopy } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";

// --- Core Logic ------------------------------------------------------------

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "of", "to", "in", "on", "at",
  "for", "with", "by", "is", "it", "this", "that", "as", "be", "are",
]);

// Strip accents/diacritics using Unicode normalization (native, no libs).
const removeAccents = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const generateSlug = (text, options) => {
  const { separator, lowercase, stripAccents, removeStopWords, stripSpecial } = options;

  let result = text;

  if (stripAccents) {
    result = removeAccents(result);
  }

  if (lowercase) {
    result = result.toLowerCase();
  }

  // Treat existing whitespace, underscores, and dashes as word separators
  // before stripping special characters, so "Keep_This" -> "keep this"
  // instead of being collapsed into "keepthis".
  result = result.replace(/[\s_-]+/g, " ");

  if (stripSpecial) {
    // Strip emojis, symbols and punctuation, keep letters, numbers, and whitespace.
    result = result
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
      .replace(/[^\p{L}\p{N}\s]/gu, "");
  }

  result = result.replace(/\s+/g, " ").trim();

  let words = result.split(" ").filter(Boolean);

  if (removeStopWords) {
    words = words.filter((w) => !STOP_WORDS.has(w.toLowerCase()));
  }

  return words.join(separator);
};

// --- Main Component ---------------------------------------------------------

export default function SlugGenerator() {
  const { dark } = useTheme();
  const [text, setText] = useState("My First Blog Post! 🚀 – Café Ünïcode Edition");

  const [separator, setSeparator] = useState("-");
  const [lowercase, setLowercase] = useState(true);
  const [stripAccents, setStripAccents] = useState(true);
  const [removeStopWords, setRemoveStopWords] = useState(false);
  const [stripSpecial, setStripSpecial] = useState(true);

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      heading: "text-zinc-900",
      subtext: "text-zinc-500",
      card: "bg-white border-zinc-200/85 shadow-sm",
      input:
        "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none",
      secondaryBtn:
        "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50 transition-all duration-200",
      activeBtn: "bg-zinc-900 text-white border-zinc-900",
      backLink:
        "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350",
      codeBox: "bg-zinc-900 text-zinc-100 border-zinc-800",
      optionRow: "border-zinc-100 hover:bg-zinc-50/60",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      heading: "text-zinc-100",
      subtext: "text-zinc-500",
      card: "bg-zinc-900/50 border-zinc-800/85 backdrop-blur-md shadow-md",
      input:
        "bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none",
      secondaryBtn:
        "bg-zinc-800/50 text-zinc-300 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-200",
      activeBtn: "bg-white text-zinc-900 border-white",
      backLink:
        "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600",
      codeBox: "bg-black/40 text-emerald-400 border-zinc-800/80 font-mono",
      optionRow: "border-zinc-800/60 hover:bg-zinc-800/30",
    },
  };
  const t = dark ? theme.dark : theme.light;

  const slug = useMemo(
    () =>
      generateSlug(text, {
        separator,
        lowercase,
        stripAccents,
        removeStopWords,
        stripSpecial,
      }),
    [text, separator, lowercase, stripAccents, removeStopWords, stripSpecial]
  );

  const copySlug = () => {
    navigator.clipboard.writeText(slug);
    toast.success("Copied slug to clipboard!");
  };

  const toggles = [
    {
      key: "lowercase",
      label: "Lowercase",
      description: "Convert all text to lowercase (default). Turn off to keep original casing.",
      checked: lowercase,
      onChange: () => setLowercase((v) => !v),
    },
    {
      key: "stripAccents",
      label: "Remove Accents",
      description: "Convert accented letters to their standard Latin form (é → e, ü → u).",
      checked: stripAccents,
      onChange: () => setStripAccents((v) => !v),
    },
    {
      key: "removeStopWords",
      label: "Remove Common Stop Words",
      description: "Filter out words like a, an, the, and, or, but, of, to for shorter URLs.",
      checked: removeStopWords,
      onChange: () => setRemoveStopWords((v) => !v),
    },
    {
      key: "stripSpecial",
      label: "Strip Special Characters",
      description: "Remove emojis, punctuation, symbols, and extra spaces.",
      checked: stripSpecial,
      onChange: () => setStripSpecial((v) => !v),
    },
  ];

  return (
    <div className={`min-h-screen ${t.wrapper} px-4 sm:px-6 py-6 sm:py-10 transition-colors duration-300`}>
      <title>URL Slug Generator & Text Sanitizer — DevTasks</title>
      <meta
        name="description"
        content="Convert raw text into clean, URL-safe slugs with customizable separators, casing, accent stripping, and stop-word filtering."
      />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <Link
            to="/devutilities"
            className={`p-2 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${t.backLink}`}
            title="Back to Utilities"
          >
            <FaArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className={`text-xl sm:text-2xl font-semibold tracking-tight ${t.heading}`}>
              URL Slug Generator & Text Sanitizer
            </h1>
            <p className={`mt-0.5 text-xs sm:text-sm ${t.subtext}`}>
              Turn any title or sentence into a clean, URL-safe slug. Fully offline.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Input */}
          <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-3`}>
            <p className={`text-xs uppercase tracking-widest font-medium ${t.subtext}`}>
              Input Text
            </p>
            <textarea
              className={`w-full px-4 py-3 rounded-xl border text-sm resize-none ${t.input}`}
              rows={4}
              placeholder="Enter a title or sentence..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {/* Formatting Options */}
          <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-4`}>
            <p className={`text-xs uppercase tracking-widest font-medium ${t.subtext}`}>
              Formatting Options
            </p>

            {/* Separator */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className={`text-sm font-medium ${t.heading}`}>Separator</span>
              <div className="flex gap-2">
                {[
                  { label: "Dash ( - )", value: "-" },
                  { label: "Underscore ( _ )", value: "_" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSeparator(opt.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all duration-200 ${
                      separator === opt.value ? t.activeBtn : t.secondaryBtn
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 border-t border-zinc-100 dark:border-zinc-800/60 pt-2">
              {toggles.map((opt) => (
                <label
                  key={opt.key}
                  className={`flex items-start gap-3 py-3 px-2 rounded-xl cursor-pointer transition-colors ${t.optionRow}`}
                >
                  <input
                    type="checkbox"
                    checked={opt.checked}
                    onChange={opt.onChange}
                    className="mt-0.5 w-4 h-4 accent-indigo-500 shrink-0 cursor-pointer"
                  />
                  <span className="flex-1">
                    <span className={`block text-sm font-semibold ${t.heading}`}>
                      {opt.label}
                    </span>
                    <span className={`block text-xs mt-0.5 ${t.subtext}`}>
                      {opt.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Output */}
          <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-3`}>
            <p className={`text-xs uppercase tracking-widest font-medium ${t.subtext}`}>
              Generated Slug
            </p>
            <div className="relative">
              <pre
                className={`p-4 rounded-2xl border text-sm overflow-x-auto whitespace-pre-wrap break-all select-all min-h-[3.25rem] ${t.codeBox}`}
              >
                {slug || " "}
              </pre>
              <button
                onClick={copySlug}
                className="absolute right-3 top-3 p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-white transition-colors active:scale-95 flex items-center gap-1.5 text-xs font-semibold shadow-md"
                title="Copy slug to clipboard"
              >
                <FaCopy className="w-3 h-3" /> Copy Slug
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}