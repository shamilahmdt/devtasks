import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const DIALECTS = [
  { key: "standard", label: "Standard SQL" },
  { key: "mysql", label: "MySQL" },
  { key: "postgresql", label: "PostgreSQL" },
];

const INDENTATIONS = [
  { key: "2", label: "2 Spaces" },
  { key: "4", label: "4 Spaces" },
  { key: "tab", label: "Tabs" },
];

const INDENT_MAP = { "2": "  ", "4": "    ", tab: "\t" };

// Sorted by length descending so longer multi-word keywords match before
// shorter ones (e.g. "LEFT OUTER JOIN" before "LEFT JOIN" before "JOIN").
const NEWLINE_KEYWORDS = [
  "INSERT INTO",
  "DELETE FROM",
  "CREATE TABLE",
  "CREATE INDEX",
  "CREATE VIEW",
  "ALTER TABLE",
  "DROP TABLE",
  "FULL OUTER JOIN",
  "LEFT OUTER JOIN",
  "RIGHT OUTER JOIN",
  "UNION ALL",
  "INNER JOIN",
  "CROSS JOIN",
  "FULL JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "GROUP BY",
  "ORDER BY",
  "SELECT",
  "FROM",
  "WHERE",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "UNION",
  "INTERSECT",
  "EXCEPT",
  "INSERT",
  "UPDATE",
  "VALUES",
  "DELETE",
  "SET",
  "WITH",
  "ON",
  "JOIN",
];

const SQL_KEYWORDS = [
  "SELECT", "DISTINCT", "TOP", "FROM", "WHERE", "AND", "OR", "NOT",
  "IN", "EXISTS", "BETWEEN", "LIKE", "ILIKE", "IS", "NULL", "INNER",
  "LEFT", "RIGHT", "FULL", "OUTER", "JOIN", "CROSS", "ON", "GROUP",
  "BY", "HAVING", "ORDER", "ASC", "DESC", "LIMIT", "OFFSET", "FETCH",
  "NEXT", "ROWS", "ONLY", "UNION", "ALL", "INTERSECT", "EXCEPT",
  "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "CREATE",
  "TABLE", "INDEX", "VIEW", "ALTER", "DROP", "TRUNCATE", "ADD",
  "COLUMN", "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "UNIQUE",
  "CHECK", "DEFAULT", "CONSTRAINT", "IF", "CASE", "WHEN", "THEN",
  "ELSE", "END", "AS", "WITH", "OVER", "PARTITION", "RECURSIVE",
  "MERGE", "USING", "MATCHED", "RETURNING", "TIES", "RANGE",
  "PRECEDING", "FOLLOWING", "CURRENT", "ROW", "FIRST", "LAST",
  "UNBOUNDED", "ROLLUP", "CUBE", "EXPLAIN", "ANALYZE", "VERBOSE",
  "COUNT", "SUM", "AVG", "MIN", "MAX", "COALESCE", "NULLIF",
  "CAST", "CONVERT", "ROW_NUMBER", "RANK", "DENSE_RANK", "LAG",
  "LEAD", "FIRST_VALUE", "LAST_VALUE", "NTILE", "PERCENT_RANK",
  "CUME_DIST", "SERIAL", "AUTO_INCREMENT", "AUTOINCREMENT",
];

const SAMPLE_SQL = `select c.customer_id, c.name, c.email, count(o.order_id) as total_orders, sum(o.total_amount) as total_spent from customers c inner join orders o on c.customer_id = o.customer_id left join (select order_id, count(*) as item_count from order_items where status != 'cancelled' group by order_id) oi on o.order_id = oi.order_id where c.status = 'active' and o.created_at >= '2024-01-01' group by c.customer_id, c.name, c.email having count(o.order_id) > 2 order by total_spent desc limit 100;`;

// ─── Core formatting logic ─────────────────────────────────────────────────────

// Replace string literals and comments with null-byte placeholders so the
// formatting passes never touch their contents.
function extractLiterals(sql) {
  const saved = [];
  const ph = (i) => `\x00PH${i}\x00`;
  let safe = sql;
  const patterns = [
    /\/\*[\s\S]*?\*\//g,
    /--[^\n]*/g,
    /\$\$[\s\S]*?\$\$/g,
    /'(?:[^'\\]|\\.)*'/g,
    /"(?:[^"\\]|\\.)*"/g,
    /`[^`]*`/g,
  ];
  for (const pattern of patterns) {
    safe = safe.replace(pattern, (m) => {
      const i = saved.length;
      saved.push(m);
      return ph(i);
    });
  }
  return { safe, saved, ph };
}

function restoreLiterals(text, saved, ph) {
  let result = text;
  for (let i = 0; i < saved.length; i++) {
    result = result.split(ph(i)).join(saved[i]);
  }
  return result;
}

function uppercaseKeywords(text) {
  const sorted = [...SQL_KEYWORDS].sort((a, b) => b.length - a.length);
  let result = text;
  for (const kw of sorted) {
    result = result.replace(new RegExp(`\\b${kw}\\b`, "gi"), kw);
  }
  return result;
}

function beautify(sql, indentStr) {
  if (!sql.trim()) return "";

  const { safe, saved, ph } = extractLiterals(sql);

  let formatted = uppercaseKeywords(safe);

  // Collapse all whitespace to single spaces.
  formatted = formatted.replace(/\s+/g, " ").trim();

  // Insert a newline before each clause keyword.  Spaces inside multi-word
  // keywords are escaped to \s+ so they match after normalisation.
  for (const kw of NEWLINE_KEYWORDS) {
    const escapedKw = kw.replace(/\s/g, "\\s+");
    const re = new RegExp(`\\s+(${escapedKw})(?=[\\s\\(;]|$)`, "gi");
    formatted = formatted.replace(re, (_, matched) => `\n${matched.toUpperCase()}`);
  }

  // Apply indentation by tracking parenthesis depth.
  const lines = formatted.split("\n");
  let depth = 0;
  const result = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const startsWithClose = line.startsWith(")");
    if (startsWithClose) depth = Math.max(0, depth - 1);

    result.push(indentStr.repeat(depth) + line);

    const opens = (line.match(/\(/g) || []).length;
    let closes = (line.match(/\)/g) || []).length;
    if (startsWithClose) closes = Math.max(0, closes - 1);

    depth = Math.max(0, depth + opens - closes);
  }

  return restoreLiterals(result.join("\n"), saved, ph);
}

function minify(sql) {
  if (!sql.trim()) return "";
  let result = sql.replace(/--[^\n]*/g, "");
  result = result.replace(/\/\*[\s\S]*?\*\//g, "");
  result = result.replace(/\s+/g, " ").trim();
  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────

const SqlFormatter = () => {
  const { dark } = useTheme();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [dialect, setDialect] = useState("standard");
  const [indentation, setIndentation] = useState("2");

  const handleBeautify = () => {
    if (!input.trim()) {
      toast.error("Please enter a SQL query first.");
      return;
    }
    try {
      const result = beautify(input, INDENT_MAP[indentation]);
      setOutput(result);
      toast.success("SQL formatted successfully.");
    } catch (error) {
      toast.error("Failed to format SQL. Please check your input.");
    }
  };

  const handleMinify = () => {
    if (!input.trim()) {
      toast.error("Please enter a SQL query first.");
      return;
    }
    try {
      const result = minify(input);
      setOutput(result);
      toast.success("SQL minified successfully.");
    } catch (error) {
      toast.error("Failed to minify SQL. Please check your input.");
    }
  };

  const handleSample = () => {
    setInput(SAMPLE_SQL);
    setOutput("");
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  const handleCopy = async () => {
    if (!output) {
      toast.error("Nothing to copy yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Copied to clipboard.");
    } catch (error) {
      toast.error("Failed to copy.");
    }
  };

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 font-sans antialiased transition-colors duration-300 overflow-x-hidden ${
        dark ? "bg-zinc-950" : "bg-[#FDFDFD]"
      }`}
    >
      <title>SQL Formatter & Minifier | DevTasks</title>
      <meta
        name="description"
        content="Format and minify SQL queries client-side with dialect and indentation options."
      />

      <div
        className={`w-full max-w-6xl md:mx-auto rounded-3xl shadow-lg p-4 sm:p-8 border transition-colors duration-300 ${
          dark ? "bg-zinc-900 border-zinc-700" : "bg-white border-neutral-100"
        }`}
      >
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
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
                className={`text-xl sm:text-2xl font-black uppercase tracking-tight transition-colors duration-300 min-w-0 flex-1 ${
                  dark ? "text-white" : "text-black"
                }`}
              >
                SQL Formatter & Minifier
              </h1>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Dialect selector */}
              <div
                className={`flex items-center gap-1 p-1 border rounded-2xl ${
                  dark
                    ? "border-zinc-700 bg-zinc-800"
                    : "border-neutral-200 bg-neutral-50"
                }`}
              >
                {DIALECTS.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setDialect(d.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer whitespace-nowrap ${
                      dialect === d.key
                        ? dark
                          ? "bg-white text-black"
                          : "bg-black text-white"
                        : dark
                          ? "text-neutral-400 hover:text-white"
                          : "text-neutral-400 hover:text-black"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              {/* Indentation selector */}
              <div
                className={`flex items-center gap-1 p-1 border rounded-2xl ${
                  dark
                    ? "border-zinc-700 bg-zinc-800"
                    : "border-neutral-200 bg-neutral-50"
                }`}
              >
                {INDENTATIONS.map((ind) => (
                  <button
                    key={ind.key}
                    type="button"
                    onClick={() => setIndentation(ind.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer whitespace-nowrap ${
                      indentation === ind.key
                        ? dark
                          ? "bg-white text-black"
                          : "bg-black text-white"
                        : dark
                          ? "text-neutral-400 hover:text-white"
                          : "text-neutral-400 hover:text-black"
                    }`}
                  >
                    {ind.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
            {/* Input */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-3 h-8">
                <label
                  className={`text-xs font-black uppercase tracking-widest ${
                    dark ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  Input SQL
                </label>
                <button
                  type="button"
                  onClick={handleSample}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    dark
                      ? "bg-white text-black hover:bg-zinc-200"
                      : "bg-black text-white hover:bg-zinc-800"
                  }`}
                >
                  Sample
                </button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                spellCheck={false}
                placeholder="Paste your SQL query here..."
                className={`w-full h-64 p-4 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors font-mono text-sm ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-zinc-200 placeholder-zinc-600"
                    : "bg-neutral-50 border-neutral-200 text-zinc-800 placeholder-neutral-400"
                }`}
              />
            </div>

            {/* Output */}
            <div className="flex flex-col">
              <div className="flex items-center mb-3 h-8">
                <label
                  className={`text-xs font-black uppercase tracking-widest ${
                    dark ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  Output
                </label>
              </div>
              <textarea
                value={output}
                readOnly
                spellCheck={false}
                className={`w-full h-64 p-4 rounded-xl border resize-none focus:outline-none transition-colors font-mono text-sm ${
                  dark
                    ? `bg-zinc-900/50 border-zinc-800 ${output ? "text-zinc-200" : "text-zinc-500"}`
                    : `bg-neutral-100 border-neutral-200 ${output ? "text-zinc-800" : "text-zinc-400"}`
                }`}
                placeholder="Formatted or minified SQL will appear here..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={handleBeautify}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${
                dark
                  ? "bg-white text-black border-white hover:bg-zinc-200"
                  : "bg-black text-white border-black hover:bg-zinc-800"
              }`}
            >
              Beautify
            </button>
            <button
              type="button"
              onClick={handleMinify}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${
                dark
                  ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
                  : "bg-white border-neutral-200 text-zinc-600 hover:text-black hover:border-neutral-400"
              }`}
            >
              Minify
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${
                dark
                  ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
                  : "bg-white border-neutral-200 text-zinc-600 hover:text-black hover:border-neutral-400"
              }`}
            >
              Copy
            </button>
            <button
              type="button"
              onClick={handleClear}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${
                dark
                  ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
                  : "bg-white border-neutral-200 text-zinc-600 hover:text-black hover:border-neutral-400"
              }`}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SqlFormatter;