import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const TextCaseConverter = () => {
  const { dark } = useTheme();
  const [text, setText] = useState("");

  const handleSample = () => {
    setText(`The quick brown fox jumps over the lazy dog.
This sample paragraph demonstrates text conversion and statistics.
Perfect for testing multiple case transformations.`);
  };

  const handleClear = () => {
    setText("");
  };

  const handleCopy = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const normalizeWords = (str) =>
    str
      .trim()
      .split(/[\s_-]+/)
      .filter(Boolean);

  const toCamelCase = (str) =>
    normalizeWords(str)
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join("");

  const toPascalCase = (str) =>
    normalizeWords(str)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");

  const toSnakeCase = (str) =>
    normalizeWords(str)
      .map((word) => word.toLowerCase())
      .join("_");

  const toKebabCase = (str) =>
    normalizeWords(str)
      .map((word) => word.toLowerCase())
      .join("-");

  const toTitleCase = (str) =>
    normalizeWords(str)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const toSlug = (str) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const characterCount = text.length;
  const characterWithoutSpaces = text.replace(/\s/g, "").length;
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const lineCount = text.trim() === "" ? 0 : text.split("\n").length;
  const readingTime = wordCount === 0 ? 0: Math.ceil(wordCount / 200);

  const transformations = [
    {
      label: "camelCase",
      value: toCamelCase(text),
    },
    {
      label: "snake_case",
      value: toSnakeCase(text),
    },
    {
      label: "kebab-case",
      value: toKebabCase(text),
    },
    {
      label: "PascalCase",
      value: toPascalCase(text),
    },
    {
      label: "UPPERCASE",
      value: text.toUpperCase(),
    },
    {
      label: "lowercase",
      value: text.toLowerCase(),
    },
    {
      label: "Title Case",
      value: toTitleCase(text),
    },
    {
      label: "URL Slug",
      value: toSlug(text),
    },
  ];

  const stats = [
    {
      label: "Characters",
      value: characterCount,
    },
    {
      label: "No Spaces",
      value: characterWithoutSpaces,
    },
    {
      label: "Words",
      value: wordCount,
    },
    {
      label: "Lines",
      value: lineCount,
    },
    {
      label: "Reading Time",
      value: `${readingTime} min`,
    },
  ];

  return (
    <div
      className={`min-h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-hidden relative flex flex-col  ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>Text Case Converter — DevTasks</title>

      <div
        className={`absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-30 ${
          dark ? "bg-zinc-800" : "bg-neutral-200"
        }`}
      />

      <div
        className={`absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-30 ${
          dark ? "bg-zinc-900" : "bg-neutral-100"
        }`}
      />

      <div
  className={`relative z-10 w-full max-w-6xl mx-auto rounded-[32px] border shadow-xl overflow-hidden max-h-[85vh] flex flex-col ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        <div className={`h-2 w-full ${dark ? "bg-white" : "bg-black"}`} />

        <div className="px-5 sm:px-8 pt-6 sm:pt-8 flex items-center gap-3">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${
              dark
                ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                : "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350"
            }`}
            title="Back to Utilities"
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
            className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${
              dark ? "text-white" : "text-black"
            }`}
          >
            Text Case Converter
          </h1>
        </div>

        <div className="p-5 sm:p-8 space-y-6 overflow-y-auto flex-1">
          <div className="flex justify-end gap-3">
            <button
              onClick={handleSample}
              className={`px-4 py-2 rounded-xl font-bold text-sm border cursor-pointer ${
                dark
                  ? "border-white text-white hover:bg-white hover:text-black"
                  : "border-black text-black hover:bg-black hover:text-white"
              }`}
            >
              Sample
            </button>

            <button
              onClick={handleClear}
              className={`px-4 py-2 rounded-xl font-bold text-sm border cursor-pointer ${
                dark
                  ? "border-white text-white hover:bg-white hover:text-black"
                  : "border-black text-black hover:bg-black hover:text-white"
              }`}
            >
              Clear
            </button>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text here..."
            className={`w-full h-48 px-4 py-3 rounded-2xl border text-sm outline-none resize-none ${
              dark
                ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600"
                : "bg-neutral-50 border-neutral-300 text-black"
            }`}
          />

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`rounded-2xl border p-4 ${
                  dark
                    ? "bg-zinc-950 border-zinc-800"
                    : "bg-neutral-50 border-neutral-300"
                }`}
              >
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  {stat.label}
                </div>

                <div className="mt-2 text-xl font-black">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {transformations.map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border p-4 ${
                  dark
                    ? "bg-zinc-950 border-zinc-800"
                    : "bg-neutral-50 border-neutral-300"
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-black text-sm uppercase">{item.label}</h3>

                  <button
                    onClick={() => handleCopy(item.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                      dark
                        ? "border-white text-white hover:bg-white hover:text-black"
                        : "border-black text-black hover:bg-black hover:text-white"
                    }`}
                  >
                    Copy
                  </button>
                </div>

                <div
                  className={`text-sm break-words whitespace-pre-wrap max-h-32 overflow-y-auto rounded-lg p-2 ${
                    dark ? "bg-zinc-900" : "bg-white"
                  }`}
                >
                  {item.value || "-"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextCaseConverter;
