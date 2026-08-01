import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";
import { marked } from "marked";
import DOMPurify from "dompurify";

marked.setOptions({
  gfm: true,
  breaks: true,
});

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

const MarkdownPreviewer = () => {
  const { dark } = useTheme();
  const [activeTab, setActiveTab] = useState("previewer"); // previewer | table-gen

  // --- PREVIEWER STATE ---
  const [markdownInput, setMarkdownInput] = useState(sampleMarkdown);
  const htmlOutput = useMemo(() => {
    return DOMPurify.sanitize(marked.parse(markdownInput || ""));
  }, [markdownInput]);

  // --- TABLE GENERATOR STATE ---
  const [csvInput, setCsvInput] = useState("");
  const [tableData, setTableData] = useState([
    ["Name", "Role", "Experience"],
    ["John", "Frontend Developer", "3"],
    ["Sarah", "Backend Developer", "5"],
  ]);
  const [alignments, setAlignments] = useState(["left", "center", "right"]);

  // --- PREVIEWER HANDLERS ---
  const handlePreviewSample = () => {
    setMarkdownInput(sampleMarkdown);
  };
  const handlePreviewClear = () => {
    setMarkdownInput("");
  };
  const handlePreviewCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(htmlOutput);
      toast.success("HTML copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };
  const handlePreviewDownload = () => {
    try {
      const blob = new Blob([markdownInput], { type: "text/markdown;charset=utf-8" });
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

  // --- TABLE GENERATOR HANDLERS/LOGIC ---
  const parseCsvToTable = (text) => {
    if (!text.trim()) return;
    const delimiter = text.includes("\t") ? "\t" : ",";
    const rows = text
      .trim()
      .split("\n")
      .map((row) => row.split(delimiter).map((cell) => cell.trim()));
    setTableData(rows);
    setAlignments(Array(rows[0].length).fill("left"));
  };

  const updateTableCell = (rowIndex, colIndex, value) => {
    const updated = [...tableData];
    updated[rowIndex][colIndex] = value;
    setTableData(updated);
  };

  const updateTableAlignment = (index, value) => {
    const updated = [...alignments];
    updated[index] = value;
    setAlignments(updated);
  };

  const markdownTableOutput = useMemo(() => {
    if (!tableData.length || !tableData[0]) return "";
    const header = `| ${tableData[0].join(" | ")} |`;
    const alignmentRow =
      "| " +
      alignments
        .map((a) => {
          if (a === "center") return ":---:";
          if (a === "right") return "---:";
          return ":---";
        })
        .join(" | ") +
      " |";
    const rows = tableData.slice(1).map((row) => `| ${row.join(" | ")} |`);
    return [header, alignmentRow, ...rows].join("\n");
  }, [tableData, alignments]);

  const handleTableSample = () => {
    setTableData([
      ["Name", "Role", "Experience"],
      ["John Doe", "Frontend Developer", "3"],
      ["Sarah Smith", "Backend Developer", "5"],
      ["Mike Wilson", "DevOps Engineer", "4"],
      ["Emma Brown", "Product Manager", "6"],
    ]);
    setAlignments(["left", "center", "right"]);
    toast.success("Sample table loaded");
  };

  const handleTableCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownTableOutput);
      toast.success("Markdown Table copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleTableClear = () => {
    setCsvInput("");
    setTableData([[""]]);
    setAlignments(["left"]);
  };

  const addTableRow = () => {
    const cols = tableData[0]?.length || 1;
    setTableData([...tableData, Array(cols).fill("")]);
  };

  const removeTableRow = () => {
    if (tableData.length <= 1) return;
    setTableData(tableData.slice(0, -1));
  };

  const addTableColumn = () => {
    setTableData(tableData.map((row) => [...row, ""]));
    setAlignments([...alignments, "left"]);
  };

  const removeTableColumn = () => {
    if (tableData[0]?.length <= 1) return;
    setTableData(tableData.map((row) => row.slice(0, -1)));
    setAlignments(alignments.slice(0, -1));
  };

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 font-sans antialiased transition-colors duration-300 overflow-x-hidden ${
        dark ? "bg-zinc-950" : "bg-[#FDFDFD]"
      }`}
    >
      <title>Markdown Studio | DevTasks</title>
      <meta
        name="description"
        content="Offline Markdown workspace. Interactive Live Previewer, visual grid table builder, and CSV to Markdown converter."
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
                  Markdown Studio
                </h1>
                <p className={`text-xs ${dark ? "text-zinc-500" : "text-zinc-400"} mt-0.5`}>
                  Design, compile, and format Markdown files and tables.
                </p>
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex border rounded-2xl p-1 bg-zinc-100 dark:bg-zinc-800 border-neutral-200 dark:border-zinc-750 shrink-0 self-start sm:self-center">
              <button
                onClick={() => setActiveTab("previewer")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                  activeTab === "previewer"
                    ? dark
                      ? "bg-white text-black"
                      : "bg-black text-white"
                    : "bg-transparent text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Live Editor
              </button>
              <button
                onClick={() => setActiveTab("table-gen")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                  activeTab === "table-gen"
                    ? dark
                      ? "bg-white text-black"
                      : "bg-black text-white"
                    : "bg-transparent text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Table Builder
              </button>
            </div>
          </div>
        </div>

        {/* ── Tab 1: Previewer ── */}
        {activeTab === "previewer" && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
              {/* Editor */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-3 h-8">
                  <label className={`text-xs font-black uppercase tracking-widest ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
                    Markdown Source
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePreviewSample}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        dark ? "bg-zinc-800 text-zinc-300 hover:text-white" : "bg-neutral-100 text-zinc-655 hover:text-black"
                      }`}
                    >
                      Sample
                    </button>
                    <button
                      onClick={handlePreviewClear}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        dark ? "bg-zinc-800 text-zinc-300 hover:text-white" : "bg-neutral-100 text-zinc-655 hover:text-black"
                      }`}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <textarea
                  value={markdownInput}
                  onChange={(e) => setMarkdownInput(e.target.value)}
                  className={`w-full h-96 p-4 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors font-mono text-sm leading-relaxed ${
                    dark ? "bg-zinc-950 border-zinc-800 text-zinc-205" : "bg-neutral-50 border-neutral-200 text-zinc-800"
                  }`}
                  placeholder="Start typing markdown here..."
                />
              </div>

              {/* Preview */}
              <div className="flex flex-col">
                <div className="flex items-center mb-3 h-8">
                  <label className={`text-xs font-black uppercase tracking-widest ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
                    HTML Compilation Output
                  </label>
                </div>
                <div
                  className={`w-full h-96 p-6 rounded-xl border overflow-auto prose dark:prose-invert max-w-none transition-colors ${
                    dark ? "bg-zinc-950/40 border-zinc-800" : "bg-neutral-50 border-neutral-200"
                  }`}
                  dangerouslySetInnerHTML={{ __html: htmlOutput }}
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handlePreviewCopyHtml}
                disabled={!htmlOutput}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:scale-100 ${
                  dark
                    ? "bg-white text-black hover:bg-zinc-200 border-white"
                    : "bg-black text-white hover:bg-zinc-800 border-black"
                }`}
              >
                Copy HTML
              </button>
              <button
                onClick={handlePreviewDownload}
                disabled={!markdownInput}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:scale-100 ${
                  dark
                    ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                    : "bg-white border-neutral-200 text-zinc-650 hover:text-black"
                }`}
              >
                Download MD File
              </button>
            </div>
          </div>
        )}

        {/* ── Tab 2: Visual Table Builder ── */}
        {activeTab === "table-gen" && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
              {/* Table Grid & Actions */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {/* Visual Editor Card */}
                <div className={`p-6 rounded-3xl border ${dark ? "bg-zinc-950 border-zinc-850" : "bg-neutral-50 border-neutral-200"}`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-xs font-black uppercase tracking-widest ${dark ? "text-zinc-400" : "text-zinc-650"}`}>
                      Visual Grid
                    </h3>

                    {/* Resize Controls */}
                    <div className="flex gap-2">
                      <button
                        onClick={addRow}
                        className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${
                          dark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-neutral-250 text-black"
                        }`}
                      >
                        + Row
                      </button>
                      <button
                        onClick={removeTableRow}
                        className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${
                          dark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-neutral-250 text-black"
                        }`}
                      >
                        - Row
                      </button>
                      <button
                        onClick={addColumn}
                        className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${
                          dark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-neutral-250 text-black"
                        }`}
                      >
                        + Col
                      </button>
                      <button
                        onClick={removeTableColumn}
                        className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${
                          dark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-neutral-250 text-black"
                        }`}
                      >
                        - Col
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr>
                          {alignments.map((align, idx) => (
                            <th key={idx} className="pb-3 pr-2">
                              <select
                                value={align}
                                onChange={(e) => updateTableAlignment(idx, e.target.value)}
                                className={`w-full px-2 py-1 rounded-md border text-[10px] font-bold focus:outline-none ${
                                  dark ? "bg-zinc-900 border-zinc-750 text-white" : "bg-white border-neutral-250 text-black"
                                }`}
                              >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                              </select>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="pb-2 pr-2">
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={(e) => updateTableCell(rIdx, cIdx, e.target.value)}
                                  className={`w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-zinc-450 ${
                                    dark
                                      ? `border-zinc-800 ${rIdx === 0 ? "bg-zinc-900 font-bold text-white" : "bg-zinc-950 text-zinc-300"}`
                                      : `border-neutral-250 ${rIdx === 0 ? "bg-neutral-100 font-bold text-black" : "bg-white text-zinc-800"}`
                                  }`}
                                  placeholder={rIdx === 0 ? "Header" : "Value"}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* CSV/TSV Parser Card */}
                <div className={`p-6 rounded-3xl border ${dark ? "bg-zinc-950 border-zinc-850" : "bg-neutral-50 border-neutral-200"}`}>
                  <h3 className={`text-xs font-black uppercase tracking-widest mb-4 ${dark ? "text-zinc-400" : "text-zinc-650"}`}>
                    Import CSV or TSV
                  </h3>
                  <div className="flex flex-col gap-3">
                    <textarea
                      value={csvInput}
                      onChange={(e) => setCsvInput(e.target.value)}
                      placeholder="Paste comma-separated or tab-separated text here..."
                      rows={3}
                      className={`w-full p-3 rounded-xl border text-xs font-mono resize-none focus:outline-none ${
                        dark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-neutral-250 text-black"
                      }`}
                    />
                    <button
                      onClick={() => parseCsvToTable(csvInput)}
                      disabled={!csvInput.trim()}
                      className={`py-2 px-4 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                        dark
                          ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
                          : "bg-white border-neutral-250 text-zinc-650 hover:text-black"
                      } disabled:opacity-40 disabled:scale-100`}
                    >
                      Import & Replace Grid
                    </button>
                  </div>
                </div>
              </div>

              {/* Table Output Code */}
              <div className="lg:col-span-5 flex flex-col gap-3 h-full">
                <div className="flex items-center mb-3 h-8">
                  <label className={`text-xs font-black uppercase tracking-widest ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
                    Markdown Table Output
                  </label>
                </div>
                <textarea
                  value={markdownTableOutput}
                  readOnly
                  className={`w-full flex-1 min-h-[300px] lg:h-[460px] p-4 rounded-2xl border resize-none focus:outline-none font-mono text-xs leading-relaxed ${
                    dark ? "bg-zinc-950 border-zinc-800 text-zinc-300" : "bg-neutral-50 border-neutral-200 text-zinc-650"
                  }`}
                  placeholder="Output table code..."
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleTableCopy}
                disabled={!markdownTableOutput}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:scale-100 ${
                  dark
                    ? "bg-white text-black hover:bg-zinc-200 border-white"
                    : "bg-black text-white hover:bg-zinc-800 border-black"
                }`}
              >
                Copy Markdown Table
              </button>
              <button
                onClick={handleTableSample}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${
                  dark
                    ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                    : "bg-white border-neutral-200 text-zinc-650 hover:text-black"
                }`}
              >
                Load Sample
              </button>
              <button
                onClick={handleTableClear}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${
                  dark
                    ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                    : "bg-white border-neutral-200 text-zinc-650 hover:text-black"
                }`}
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownPreviewer;
