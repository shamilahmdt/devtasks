import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const MarkdownTableGenerator = () => {
  const { dark } = useTheme();

  const [csvInput, setCsvInput] = useState("");

  const [tableData, setTableData] = useState([
    ["Name", "Role", "Experience"],
    ["John", "Frontend Developer", "3"],
    ["Sarah", "Backend Developer", "5"],
  ]);

  const [alignments, setAlignments] = useState(["left", "center", "right"]);

  const parseCsv = (text) => {
    if (!text.trim()) return;

    const delimiter = text.includes("\t") ? "\t" : ",";

    const rows = text
      .trim()
      .split("\n")
      .map((row) => row.split(delimiter).map((cell) => cell.trim()));

    setTableData(rows);
    setAlignments(Array(rows[0].length).fill("left"));
  };

  const updateCell = (rowIndex, colIndex, value) => {
    const updated = [...tableData];
    updated[rowIndex][colIndex] = value;
    setTableData(updated);
  };

  const updateAlignment = (index, value) => {
    const updated = [...alignments];
    updated[index] = value;
    setAlignments(updated);
  };

  const markdownOutput = useMemo(() => {
    if (!tableData.length) return "";

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

  const handleSample = () => {
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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdownOutput);
    toast.success("Markdown copied");
  };

  const handleClear = () => {
    setCsvInput("");
    setTableData([[""]]);
    setAlignments(["left"]);
  };
  const addRow = () => {
    const cols = tableData[0]?.length || 1;
    setTableData([...tableData, Array(cols).fill("")]);
  };

  const removeRow = () => {
    if (tableData.length <= 1) return;
    setTableData(tableData.slice(0, -1));
  };

  const addColumn = () => {
    setTableData(tableData.map((row) => [...row, ""]));
    setAlignments([...alignments, "left"]);
  };

  const removeColumn = () => {
    if (tableData[0]?.length <= 1) return;

    setTableData(tableData.map((row) => row.slice(0, -1)));
    setAlignments(alignments.slice(0, -1));
  };

  const formatMarkdown = () => {
    toast.success("Markdown formatted");
  };

  const buttonClass = `px-4 py-2 rounded-xl border font-bold text-sm text-center transition-all duration-300 active:scale-95 ${
    dark
      ? "border-white text-white hover:bg-white hover:text-black"
      : "border-black text-black hover:bg-black hover:text-white"
  }`;

  return (
    <div
      className={`min-h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto overflow-x-hidden relative ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <div
        className={`relative z-10 w-full max-w-6xl mx-auto rounded-[32px] border shadow-xl overflow-hidden ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        <div className={`h-2 w-full ${dark ? "bg-white" : "bg-black"}`} />

        <div className="px-5 sm:px-8 pt-6 flex items-center gap-3">
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
            className={`text-xl sm:text-2xl font-black uppercase ${
              dark ? "text-white" : "text-black"
            }`}
          >
            Markdown Table Generator
          </h1>
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          <div className="flex flex-wrap gap-3 justify-end">
            <button onClick={handleSample} className={buttonClass}>
              Sample
            </button>

            <button onClick={handleClear} className={buttonClass}>
              Clear
            </button>
          </div>

          <div>
            <label className="font-bold text-sm">CSV / TSV Import</label>

            <textarea
              value={csvInput}
              onChange={(e) => {
                setCsvInput(e.target.value);
                parseCsv(e.target.value);
              }}
              placeholder="Paste CSV or TSV data..."
              className={`w-full h-32 mt-2 rounded-2xl border p-4 ${
                dark
                  ? "bg-zinc-950 border-zinc-800 text-white"
                  : "bg-neutral-50 border-neutral-300 text-black"
              }`}
            />
          </div>
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <h2
              className={`text-sm font-black uppercase tracking-wider ${
                dark ? "text-zinc-400" : "text-neutral-600"
              }`}
            >
              Grid Editor
            </h2>

            <div className="flex flex-wrap gap-3">
              <button onClick={addRow} className={buttonClass}>
                + Row
              </button>

              <button onClick={removeRow} className={buttonClass}>
                - Row
              </button>

              <button onClick={addColumn} className={buttonClass}>
                + Column
              </button>

              <button onClick={removeColumn} className={buttonClass}>
                - Column
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="border border-zinc-700 p-1">
                        {rowIndex === 0 && (
                          <select
                            value={alignments[colIndex]}
                            onChange={(e) =>
                              updateAlignment(colIndex, e.target.value)
                            }
                            className="w-full mb-1 text-xs"
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </select>
                        )}

                        <input
                          value={cell}
                          onChange={(e) =>
                            updateCell(rowIndex, colIndex, e.target.value)
                          }
                          className="w-full bg-transparent p-2"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <label className="font-bold text-sm">Markdown Output</label>

            <textarea
              readOnly
              value={markdownOutput}
              className={`w-full h-48 mt-2 rounded-2xl border p-4 font-mono ${
                dark
                  ? "bg-zinc-950 border-zinc-800 text-white"
                  : "bg-neutral-50 border-neutral-300 text-black"
              }`}
            />
          </div>
          <div className="flex flex-wrap gap-3 justify-end">
            <button onClick={formatMarkdown} className={buttonClass}>
              Format
            </button>

            <button onClick={handleCopy} className={buttonClass}>
              Copy Markdown
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownTableGenerator;
