import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

// Core Logic Functions -------------------------------------------------------

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

const toUpperCase = (str) => str.toUpperCase();
const toLowerCase = (str) => str.toLowerCase();

const toSlug = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

// Text Statistics ----------------------------------------------------------

const getStats = (text) => {
  const charsWithSpaces = text.length;
  const charsWithoutSpaces = text.replace(/\s/g, "").length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text.trim() ? text.split("\n").length : 0;
  const readingTime = Math.ceil(words / 200);

  return { charsWithSpaces, charsWithoutSpaces, words, lines, readingTime };
};

const sampleText =
  "Hello world! This is a sample text to demonstrate case conversion and string inspection tools.";

// Main Component -----------------------------------------------------------

const TextCaseConverter = () => {
  const { dark } = useTheme();
  const [text, setText] = useState("");

  const stats = getStats(text);

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      heading: "text-zinc-900",
      subtext: "text-zinc-500",
      card: "bg-white border-zinc-200/85",
      input:
        "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none",
      button: "bg-zinc-900 text-white hover:bg-zinc-700 transition-colors",
      sampleBtn:
        "bg-black text-white border-black hover:bg-zinc-800",
      clearBtn:
        "bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-100",
      statCard: "bg-white border-zinc-200/85",
      statLabel: "text-zinc-500",
      statValue: "text-zinc-900",
      caseCard: "bg-white border-zinc-200/85",
      caseLabel: "text-zinc-500",
      caseValue: "text-zinc-800",
      copyBtn:
        "bg-zinc-900 text-white hover:bg-zinc-700",
      copyBtnSuccess: "bg-green-600 text-white",
      backLink:
        "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      heading: "text-zinc-100",
      subtext: "text-zinc-500",
      card: "bg-zinc-900/50 border-zinc-800/85",
      input:
        "bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none",
      button: "bg-white text-zinc-900 hover:bg-zinc-200 transition-colors",
      sampleBtn:
        "bg-white text-black border-white hover:bg-zinc-200",
      clearBtn:
        "bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700",
      statCard: "bg-zinc-900/50 border-zinc-800/85",
      statLabel: "text-zinc-500",
      statValue: "text-zinc-100",
      caseCard: "bg-zinc-900/50 border-zinc-800/85",
      caseLabel: "text-zinc-500",
      caseValue: "text-zinc-300",
      copyBtn:
        "bg-white text-zinc-900 hover:bg-zinc-200",
      copyBtnSuccess: "bg-green-500 text-white",
      backLink:
        "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600",
    },
  };

  const t = dark ? theme.dark : theme.light;

  const conversions = [
    { label: "camelCase", value: toCamelCase(text) },
    { label: "snake_case", value: toSnakeCase(text) },
    { label: "kebab-case", value: toKebabCase(text) },
    { label: "PascalCase", value: toPascalCase(text) },
    { label: "UPPERCASE", value: toUpperCase(text) },
    { label: "lowercase", value: toLowerCase(text) },
    { label: "Title Case", value: toTitleCase(text) },
    { label: "URL Slug", value: toSlug(text) },
  ];

  return (
    <div className={`min-h-screen ${t.wrapper} px-6 py-10`}>
      <title>Text Case Converter — DevTasks</title>
      <meta
        name="description"
        content="Convert text between camelCase, snake_case, kebab-case, PascalCase and more."
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${t.backLink}`}
            title="Back to Workspace"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${t.heading}`}>
              Text Case Converter
            </h1>
            <p className={`mt-1 text-sm ${t.subtext}`}>
              Convert and inspect text in multiple formats.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Input Card */}
          <div className={`rounded-3xl border ${t.card} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <p className={`text-xs uppercase tracking-widest font-medium ${t.subtext}`}>
                Input Text
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setText(sampleText)}
                  className={`px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 ${t.sampleBtn}`}
                >
                  Sample
                </button>
                <button
                  type="button"
                  onClick={() => setText("")}
                  className={`px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 ${t.clearBtn}`}
                >
                  Clear
                </button>
              </div>
            </div>
            <textarea
              className={`w-full px-4 py-3 rounded-xl border text-sm font-mono resize-none ${t.input}`}
              rows={6}
              placeholder="Enter text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {/* Stats Card */}
          <div className={`rounded-3xl border ${t.card} p-6`}>
            <p className={`text-xs uppercase tracking-widest font-medium mb-4 ${t.subtext}`}>
              Statistics
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[
                { label: "Characters", value: stats.charsWithSpaces },
                { label: "No Spaces", value: stats.charsWithoutSpaces },
                { label: "Words", value: stats.words },
                { label: "Lines", value: stats.lines },
                { label: "Reading Time", value: `${stats.readingTime} min` },
              ].map(({ label, value }) => (
                <div key={label} className={`rounded-2xl border ${t.statCard} p-4`}>
                  <p className={`text-xs uppercase tracking-widest font-medium ${t.statLabel}`}>
                    {label}
                  </p>
                  <p className={`text-2xl font-semibold tabular-nums mt-2 ${t.statValue}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Case Conversions Card */}
          <div className={`rounded-3xl border ${t.card} p-6`}>
            <p className={`text-xs uppercase tracking-widest font-medium mb-4 ${t.subtext}`}>
              Case Conversions
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {conversions.map(({ label, value }) => (
                <CaseRow
                  key={label}
                  label={label}
                  value={value}
                  cardClass={`rounded-2xl border ${t.caseCard}`}
                  labelClass={t.caseLabel}
                  valueClass={t.caseValue}
                  copyBtnClass={t.copyBtn}
                  copyBtnSuccessClass={t.copyBtnSuccess}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// CaseRow Sub-component ------------------------------------------------------

const CaseRow = ({ label, value, cardClass, labelClass, valueClass, copyBtnClass, copyBtnSuccessClass }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${cardClass} p-4 flex flex-col gap-2`}>
      <div className="flex items-center justify-between gap-3">
        <p className={`text-xs uppercase tracking-widest font-medium ${labelClass}`}>
          {label}
        </p>
        <button
          onClick={copyToClipboard}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 whitespace-nowrap ${
            copied ? copyBtnSuccessClass : copyBtnClass
          }`}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <p className={`text-sm font-mono truncate ${valueClass}`}>
        {value || "—"}
      </p>
    </div>
  );
};

export default TextCaseConverter;