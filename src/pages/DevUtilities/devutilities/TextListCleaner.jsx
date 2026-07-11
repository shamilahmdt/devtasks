import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

const SAMPLE_TEXT = `  banana

Apple
banana
orange
apple
  grape
orange  `;

const TextListCleaner = () => {
  const { dark } = useTheme();

  const [text, setText] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const lines = useMemo(() => {
    if (text === "") {
      return [];
    }

    return text.split(/\r?\n/);
  }, [text]);

  const nonEmptyLines = useMemo(
    () => lines.filter((line) => line.trim() !== ""),
    [lines],
  );

  const uniqueLineCount = useMemo(() => {
    const uniqueLines = new Set(
      nonEmptyLines.map((line) => line.trim().toLowerCase()),
    );

    return uniqueLines.size;
  }, [nonEmptyLines]);

  const updateText = (newText) => {
    setText(newText);
    setCopyStatus("");
  };

  const transformLines = (transformFunction) => {
    const currentLines = text.split(/\r?\n/);
    const updatedLines = transformFunction(currentLines);

    updateText(updatedLines.join("\n"));
  };

  const sortLines = (direction) => {
    transformLines((currentLines) =>
      [...currentLines].sort((firstLine, secondLine) => {
        const comparison = firstLine
          .trim()
          .localeCompare(secondLine.trim(), undefined, {
            sensitivity: "base",
          });

        return direction === "asc" ? comparison : -comparison;
      }),
    );
  };

  const removeDuplicates = () => {
    transformLines((currentLines) => {
      const seenLines = new Set();

      return currentLines.filter((line) => {
        const normalizedLine = line.trim().toLowerCase();

        if (seenLines.has(normalizedLine)) {
          return false;
        }

        seenLines.add(normalizedLine);
        return true;
      });
    });
  };

  const trimWhitespace = () => {
    transformLines((currentLines) =>
      currentLines.map((line) => line.trim()),
    );
  };

  const removeEmptyLines = () => {
    transformLines((currentLines) =>
      currentLines.filter((line) => line.trim() !== ""),
    );
  };

  const cleanAll = () => {
    transformLines((currentLines) => {
      const seenLines = new Set();

      return currentLines
        .map((line) => line.trim())
        .filter((line) => line !== "")
        .filter((line) => {
          const normalizedLine = line.toLowerCase();

          if (seenLines.has(normalizedLine)) {
            return false;
          }

          seenLines.add(normalizedLine);
          return true;
        });
    });
  };

  const loadSample = () => {
    updateText(SAMPLE_TEXT);
  };

  const clearText = () => {
    updateText("");
  };

  const copyText = async () => {
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Copied!");
    } catch {
      setCopyStatus("Copy failed");
    }
  };

  const actionButtons = [
    {
      label: "Sort A-Z",
      onClick: () => sortLines("asc"),
    },
    {
      label: "Sort Z-A",
      onClick: () => sortLines("desc"),
    },
    {
      label: "Remove Duplicates",
      onClick: removeDuplicates,
    },
    {
      label: "Trim Whitespace",
      onClick: trimWhitespace,
    },
    {
      label: "Remove Empty Lines",
      onClick: removeEmptyLines,
    },
    {
      label: "Clean All",
      onClick: cleanAll,
    },
  ];

  const actionButtonClass = `
    w-full rounded-xl border px-4 py-3
    text-sm font-bold
    transition-all duration-300
    active:scale-95
    disabled:cursor-not-allowed disabled:opacity-40
    ${
      dark
        ? "border-zinc-700 bg-zinc-950 text-white hover:border-white hover:bg-white hover:text-black"
        : "border-zinc-300 bg-white text-black hover:border-black hover:bg-black hover:text-white"
    }
  `;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        dark
          ? "bg-[#090A0F] text-zinc-100"
          : "bg-[#F8F9FA] text-zinc-900"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/devutilities"
          className={`mb-6 inline-flex items-center text-sm font-semibold transition-colors ${
            dark
              ? "text-zinc-400 hover:text-white"
              : "text-zinc-600 hover:text-black"
          }`}
        >
          ← Back to Dev Utilities
        </Link>

        <div className="mb-8">
          <p
            className={`mb-2 text-xs font-bold uppercase tracking-[0.2em] ${
              dark ? "text-zinc-500" : "text-zinc-500"
            }`}
          >
            Developer Utility
          </p>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Text List Cleaner
          </h1>

          <p
            className={`mt-3 max-w-3xl text-sm leading-6 sm:text-base ${
              dark ? "text-zinc-400" : "text-zinc-600"
            }`}
          >
            Sort text lines, remove duplicates, trim whitespace, and remove
            empty lines directly in your browser.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <section
            className={`rounded-3xl border p-5 transition-colors sm:p-6 ${
              dark
                ? "border-zinc-800 bg-zinc-900/50"
                : "border-zinc-200 bg-white"
            }`}
          >
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label
                htmlFor="text-list-input"
                className="text-sm font-bold"
              >
                List Input
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={loadSample}
                  className={`rounded-lg border px-3 py-2 text-xs font-bold transition-all active:scale-95 ${
                    dark
                      ? "border-zinc-700 text-zinc-300 hover:border-white hover:text-white"
                      : "border-zinc-300 text-zinc-700 hover:border-black hover:text-black"
                  }`}
                >
                  Load Sample
                </button>

                <button
                  type="button"
                  onClick={clearText}
                  disabled={!text}
                  className={`rounded-lg border px-3 py-2 text-xs font-bold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                    dark
                      ? "border-zinc-700 text-zinc-300 hover:border-white hover:text-white"
                      : "border-zinc-300 text-zinc-700 hover:border-black hover:text-black"
                  }`}
                >
                  Clear
                </button>
              </div>
            </div>

            <textarea
              id="text-list-input"
              value={text}
              onChange={(event) => updateText(event.target.value)}
              placeholder={`Enter one item per line...

Example:
Apple
Banana
Apple
Orange`}
              spellCheck="false"
              className={`min-h-[360px] w-full resize-y rounded-2xl border px-4 py-4 font-mono text-sm outline-none transition-all duration-300 ${
                dark
                  ? "border-zinc-800 bg-zinc-950 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                  : "border-zinc-300 bg-neutral-50 text-black placeholder-zinc-400 focus:border-black focus:ring-1 focus:ring-black"
              }`}
            />

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {actionButtons.map((button) => (
                <button
                  key={button.label}
                  type="button"
                  onClick={button.onClick}
                  disabled={!text}
                  className={actionButtonClass}
                >
                  {button.label}
                </button>
              ))}
            </div>

            <div
              className={`mt-5 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between ${
                dark ? "border-zinc-800" : "border-zinc-200"
              }`}
            >
              <p
                className={`text-xs ${
                  dark ? "text-zinc-500" : "text-zinc-500"
                }`}
              >
                All processing happens locally in your browser.
              </p>

              <div className="flex items-center gap-3">
                <span
                  aria-live="polite"
                  className={`text-xs font-bold ${
                    copyStatus === "Copied!"
                      ? dark
                        ? "text-white"
                        : "text-black"
                      : "text-zinc-500"
                  }`}
                >
                  {copyStatus}
                </span>

                <button
                  type="button"
                  onClick={copyText}
                  disabled={!text}
                  className={`rounded-xl px-5 py-3 text-sm font-bold transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                    dark
                      ? "bg-white text-black hover:bg-zinc-200"
                      : "bg-black text-white hover:bg-zinc-800"
                  }`}
                >
                  Copy Text
                </button>
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-6">
            <div
              className={`rounded-3xl border p-5 ${
                dark
                  ? "border-zinc-800 bg-zinc-900/50"
                  : "border-zinc-200 bg-white"
              }`}
            >
              <h2 className="mb-5 text-lg font-black">List Statistics</h2>

              <div className="space-y-4">
                <div
                  className={`flex items-center justify-between border-b pb-3 ${
                    dark ? "border-zinc-800" : "border-zinc-200"
                  }`}
                >
                  <span
                    className={`text-sm ${
                      dark ? "text-zinc-400" : "text-zinc-600"
                    }`}
                  >
                    Total Lines
                  </span>

                  <span className="text-lg font-black">{lines.length}</span>
                </div>

                <div
                  className={`flex items-center justify-between border-b pb-3 ${
                    dark ? "border-zinc-800" : "border-zinc-200"
                  }`}
                >
                  <span
                    className={`text-sm ${
                      dark ? "text-zinc-400" : "text-zinc-600"
                    }`}
                  >
                    Non-Empty
                  </span>

                  <span className="text-lg font-black">
                    {nonEmptyLines.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm ${
                      dark ? "text-zinc-400" : "text-zinc-600"
                    }`}
                  >
                    Unique Lines
                  </span>

                  <span className="text-lg font-black">
                    {uniqueLineCount}
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`rounded-3xl border p-5 ${
                dark
                  ? "border-zinc-800 bg-zinc-900/50"
                  : "border-zinc-200 bg-white"
              }`}
            >
              <h2 className="mb-3 text-lg font-black">How It Works</h2>

              <p
                className={`text-sm leading-6 ${
                  dark ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                Enter one item per line, then choose an action. The Clean All
                option trims whitespace, removes blank lines, and removes
                duplicates while keeping the first occurrence.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default TextListCleaner;