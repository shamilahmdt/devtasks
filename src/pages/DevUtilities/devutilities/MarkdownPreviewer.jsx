import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";
import { marked } from "marked";
import DOMPurify from "dompurify";

marked.setOptions({
  gfm: true,
  breaks: true,
});

const MarkdownPreviewer = () => {
  const { dark } = useTheme();

  const sampleMarkdown = `# 🚀 Markdown Previewer

A **live markdown editor** with HTML preview.

## Features

- Live Preview
- Copy HTML
- Download Markdown
- Dark Mode Support

### Table Example

| Feature | Status |
|----------|----------|
| Preview | ✅ |
| Copy HTML | ✅ |
| Download MD | ✅ |

### Code Example

\`\`\`javascript
console.log("Hello World");
\`\`\`

[Visit DevTasks](https://dev-tasks-beta.vercel.app/)
`;

  const [input, setInput] = useState(sampleMarkdown);

  const htmlOutput = DOMPurify.sanitize(marked.parse(input || ""));

  const handleSample = () => {
    setInput(sampleMarkdown);
  };

  const handleClear = () => {
    setInput("");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlOutput);
      toast.success("HTML copied");
    } catch {
      toast.error("Failed to copy");
    }
  };
  const handleDownload = () => {
    try {
      const blob = new Blob([input], {
        type: "text/markdown;charset=utf-8",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "markdown-preview.md";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      toast.success("Markdown downloaded");
    } catch {
      toast.error("Download failed");
    }
  };

  const buttons = [
    { label: "Sample", onClick: handleSample },
    { label: "Clear", onClick: handleClear },
  ];

  return (
    <div
      className={`min-h-[calc(100vh-76px)] md:h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto overflow-x-hidden md:overflow-hidden relative flex flex-col justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <div
        className={`absolute top-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-30 ${
          dark ? "bg-zinc-800" : "bg-neutral-200"
        }`}
      />

      <div
        className={`absolute bottom-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-30 ${
          dark ? "bg-zinc-900" : "bg-neutral-100"
        }`}
      />

      <div
        className={`relative z-10 w-full max-w-5xl mx-auto rounded-[32px] border shadow-xl flex flex-col max-h-full md:max-h-[85vh] overflow-hidden ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        <div className={`h-2 w-full ${dark ? "bg-white" : "bg-black"}`} />

        <div className="px-5 sm:px-8 pt-6 sm:pt-8 flex items-center gap-3">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border ${
              dark
                ? "bg-zinc-800 border-zinc-700 text-zinc-300"
                : "bg-white border-neutral-200 text-neutral-600"
            }`}
          >
            ←
          </Link>

          <h1
            className={`text-xl sm:text-2xl font-black uppercase ${
              dark ? "text-white" : "text-black"
            }`}
          >
            Markdown Previewer
          </h1>
        </div>

        <div className="w-full md:h-[464px] p-5 sm:p-8 overflow-y-auto">
          <div className="w-full h-full flex flex-col md:flex-row gap-4">
            <div className="w-full flex flex-col space-y-2">
              <div className="flex items-center justify-between h-8">
                <label
                  className={`text-xs font-black uppercase tracking-widest ${
                    dark ? "text-zinc-400" : "text-neutral-500"
                  }`}
                >
                  Markdown Input
                </label>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="# Write markdown here..."
                className={`md:h-full h-40 px-4 py-3 rounded-2xl border text-sm resize-none ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-white"
                    : "bg-neutral-50 border-neutral-300 text-black"
                }`}
              />

              <div className="grid grid-cols-2 gap-3">
                {buttons.map((btn) => (
                  <button
                    key={btn.label}
                    onClick={btn.onClick}
                    className={`px-4 py-2 rounded-xl border font-bold text-sm ${
                      dark
                        ? "border-white text-white hover:bg-white hover:text-black"
                        : "border-black text-black hover:bg-black hover:text-white"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full flex flex-col space-y-2">
              <label
                className={`text-xs font-black uppercase tracking-widest ${
                  dark ? "text-zinc-400" : "text-neutral-500"
                }`}
              >
                HTML Preview
              </label>

              <div
                className={`md:h-full h-40 px-4 py-3 rounded-2xl border overflow-auto prose prose-zinc max-w-none ${
                  dark
                    ? "prose-invert bg-zinc-950 border-zinc-800"
                    : "bg-neutral-50 border-neutral-300"
                }`}
                dangerouslySetInnerHTML={{ __html: htmlOutput }}
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleDownload}
                  className={`w-40 px-4 py-2 rounded-xl border font-bold text-sm ${
                    dark
                      ? "border-white text-white hover:bg-white hover:text-black"
                      : "border-black text-black hover:bg-black hover:text-white"
                  }`}
                >
                  Download MD
                </button>
                <button
                  onClick={handleCopy}
                  className={`w-40 px-4 py-2 rounded-xl border font-bold text-sm ${
                    dark
                      ? "border-white text-white hover:bg-white hover:text-black"
                      : "border-black text-black hover:bg-black hover:text-white"
                  }`}
                >
                  Copy HTML
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownPreviewer;
