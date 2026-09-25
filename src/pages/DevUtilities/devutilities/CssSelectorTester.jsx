import React, { useMemo, useState } from "react";
import { SearchCheck, AlertCircle, CheckCircle2 } from "lucide-react";

const DEFAULT_HTML = `<div class="container">
  <h1>Hello Developer</h1>
  <p class="text">First paragraph</p>
  <p class="text">Second paragraph</p>
  <button class="btn">Click Me</button>
</div>`;

const DEFAULT_SELECTOR = ".text";

export default function CssSelectorTester() {
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [selector, setSelector] = useState(DEFAULT_SELECTOR);

  const result = useMemo(() => {
    if (!selector.trim()) {
      return {
        valid: true,
        count: 0,
        matches: [],
        message: "Enter a CSS selector.",
      };
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const matches = Array.from(doc.querySelectorAll(selector));

      return {
        valid: true,
        count: matches.length,
        matches,
        message:
          matches.length > 0
            ? `${matches.length} element${matches.length === 1 ? "" : "s"} matched`
            : "No elements matched this selector.",
      };
    } catch (error) {
      return {
        valid: false,
        count: 0,
        matches: [],
        message: "Invalid CSS selector.",
      };
    }
  }, [html, selector]);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <SearchCheck size={30} />
            <h1 className="text-2xl md:text-3xl font-bold">
              CSS Selector Tester
            </h1>
          </div>

          <p className="text-sm opacity-70">
            Test CSS selectors against HTML instantly in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* HTML Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              HTML
            </label>

            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              spellCheck={false}
              className="w-full min-h-[350px] rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-4 font-mono text-sm outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
              placeholder="Enter HTML here..."
            />
          </div>

          {/* Selector Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              CSS Selector
            </label>

            <input
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
              spellCheck={false}
              className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-4 font-mono text-sm outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
              placeholder=".class, #id, div > p, etc."
            />

            <div className="mt-4 rounded-xl border border-black/10 dark:border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                {result.valid ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}

                <span className="font-medium">
                  {result.valid ? "Valid selector" : "Invalid selector"}
                </span>
              </div>

              <p className="text-sm opacity-70">
                {result.message}
              </p>

              <div className="mt-4 text-3xl font-bold">
                {result.count}
              </div>

              <div className="text-xs opacity-60">
                Matching elements
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">
            Matched Elements
          </h2>

          {result.matches.length === 0 ? (
            <div className="rounded-xl border border-dashed border-black/10 dark:border-white/10 p-8 text-center text-sm opacity-60">
              No matching elements to display.
            </div>
          ) : (
            <div className="space-y-3">
              {result.matches.map((element, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] p-4"
                >
                  <div className="text-xs opacity-50 mb-2">
                    Match {index + 1}
                  </div>

                  <pre className="overflow-x-auto whitespace-pre-wrap break-words text-sm font-mono">
                    {element.outerHTML}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-xs opacity-50">
          100% client-side — no HTML or selector data is sent to a server.
        </div>
      </div>
    </div>
  );
}