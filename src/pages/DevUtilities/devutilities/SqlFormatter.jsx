import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

// SQL Formatter utility functions
const SQL_KEYWORDS = new Set([
  "SELECT",
  "DISTINCT",
  "FROM",
  "WHERE",
  "AND",
  "OR",
  "NOT",
  "IN",
  "JOIN",
  "INNER",
  "LEFT",
  "RIGHT",
  "OUTER",
  "CROSS",
  "ON",
  "USING",
  "GROUP",
  "BY",
  "HAVING",
  "ORDER",
  "ASC",
  "DESC",
  "LIMIT",
  "OFFSET",
  "UNION",
  "ALL",
  "INTERSECT",
  "EXCEPT",
  "INSERT",
  "INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE",
  "CREATE",
  "TABLE",
  "ALTER",
  "DROP",
  "INDEX",
  "VIEW",
  "DATABASE",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  "AS",
  "WITH",
  "RECURSIVE",
  "CAST",
  "BETWEEN",
  "LIKE",
  "IS",
  "NULL",
  "EXISTS",
  "AGGREGATE",
  "CONSTRAINT",
  "PRIMARY",
  "KEY",
  "FOREIGN",
  "UNIQUE",
  "CHECK",
  "DEFAULT",
  "COLLATE",
]);

const INDENT_KEYWORDS = new Set([
  "SELECT",
  "FROM",
  "WHERE",
  "AND",
  "OR",
  "JOIN",
  "LEFT",
  "RIGHT",
  "INNER",
  "CROSS",
  "OUTER",
  "ON",
  "GROUP",
  "HAVING",
  "ORDER",
  "LIMIT",
  "OFFSET",
  "UNION",
  "INTERSECT",
  "EXCEPT",
  "INSERT",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE",
  "CASE",
  "WHEN",
  "ELSE",
  "END",
  "WITH",
]);

const removeComments = (sql) => {
  // Remove line comments (--)
  let result = sql.replace(/--[^\n]*/g, "");
  // Remove block comments (/* */)
  result = result.replace(/\/\*[\s\S]*?\*\//g, "");
  return result;
};

const capitalizeKeywords = (sql) => {
  // Split by word boundaries and capitalize SQL keywords
  return sql.replace(/\b\w+\b/g, (word) => {
    const upperWord = word.toUpperCase();
    return SQL_KEYWORDS.has(upperWord) ? upperWord : word;
  });
};

const formatSQL = (sql, indent = "  ") => {
  if (!sql.trim()) return "";

  // Remove comments first
  let cleaned = removeComments(sql);

  // Capitalize keywords
  cleaned = capitalizeKeywords(cleaned);

  // Normalize whitespace
  cleaned = cleaned
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s*\(\s*/g, "(")
    .replace(/\s*\)\s*/g, ")");

  // Add line breaks before indent keywords
  let indentLevel = 0;
  let result = "";
  let inString = false;
  let stringChar = "";
  let i = 0;

  while (i < cleaned.length) {
    const char = cleaned[i];

    // Handle string literals
    if ((char === '"' || char === "'") && (i === 0 || cleaned[i - 1] !== "\\")) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
      result += char;
      i++;
      continue;
    }

    if (inString) {
      result += char;
      i++;
      continue;
    }

    // Check for keywords at word boundaries
    let foundKeyword = false;
    for (const keyword of INDENT_KEYWORDS) {
      if (cleaned.substr(i).toUpperCase().startsWith(keyword)) {
        const nextCharIndex = i + keyword.length;
        const nextChar = cleaned[nextCharIndex];

        // Check if it's a real keyword (followed by non-word character)
        if (!nextChar || /\s|\(|,|;/.test(nextChar)) {
          // Don't add newline at the start
          if (result.trim() && result.trim() !== "(") {
            result = result.trimEnd() + "\n";
          }

          // Handle closing parenthesis before keyword
          if (keyword === "FROM" && result.trim().endsWith(")")) {
            // Already handled
          }

          result += indent.repeat(Math.max(0, indentLevel)) + keyword;
          i += keyword.length;
          foundKeyword = true;
          break;
        }
      }
    }

    if (foundKeyword) {
      continue;
    }

    // Handle parentheses for indentation
    if (char === "(") {
      result += char;
      // Look ahead for newline-needing keywords
      if (cleaned.substr(i + 1).match(/^\s*(SELECT|WITH)/i)) {
        indentLevel++;
        result += "\n";
      }
      i++;
    } else if (char === ")") {
      if (indentLevel > 0) {
        indentLevel--;
        result = result.trimEnd() + "\n" + indent.repeat(indentLevel);
      }
      result += char;
      i++;
    } else {
      result += char;
      i++;
    }
  }

  // Clean up the result
  result = result
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");

  return result;
};

const minifySQL = (sql) => {
  if (!sql.trim()) return "";

  // Remove comments
  let result = removeComments(sql);

  // Remove extra whitespace
  result = result.replace(/\s+/g, " ").trim();

  return result;
};

const CodeBlock = ({ code, dark }) => (
  <pre
    className={`text-xs font-mono leading-relaxed whitespace-pre-wrap break-all overflow-auto h-full ${
      dark ? "text-zinc-300" : "text-zinc-700"
    }`}
  >
    {code}
  </pre>
);

const SAMPLE_QUERY = `-- Complex SQL Query with Joins and Subqueries
SELECT 
  u.id, 
  u.username, 
  COUNT(o.id) as order_count,
  SUM(o.total) as total_spent,
  CASE 
    WHEN SUM(o.total) > 1000 THEN 'VIP'
    WHEN SUM(o.total) > 500 THEN 'Premium'
    ELSE 'Standard'
  END as customer_tier
FROM users u
  LEFT JOIN orders o ON u.id = o.user_id
  INNER JOIN addresses a ON u.id = a.user_id
WHERE 
  u.created_at >= '2023-01-01'
  AND o.status IN ('completed', 'shipped')
  AND a.country = 'US'
GROUP BY u.id, u.username
HAVING COUNT(o.id) > 5
ORDER BY total_spent DESC
LIMIT 100
OFFSET 0;`;

const SqlFormatter = () => {
  const { dark } = useTheme();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [dialect, setDialect] = useState("sql");
  const [indentation, setIndentation] = useState("2spaces");
  const [mode, setMode] = useState("format");

  const getIndentString = () => {
    switch (indentation) {
      case "tabs":
        return "\t";
      case "2spaces":
        return "  ";
      case "4spaces":
        return "    ";
      default:
        return "  ";
    }
  };

  const handleFormat = () => {
    if (!input.trim()) {
      toast.error("Please enter a SQL query");
      return;
    }
    try {
      const indent = getIndentString();
      const formatted = formatSQL(input, indent);
      setOutput(formatted);
      setMode("format");
      toast.success("SQL formatted successfully");
    } catch (error) {
      toast.error("Error formatting SQL");
    }
  };

  const handleMinify = () => {
    if (!input.trim()) {
      toast.error("Please enter a SQL query");
      return;
    }
    try {
      const minified = minifySQL(input);
      setOutput(minified);
      setMode("minify");
      toast.success("SQL minified successfully");
    } catch (error) {
      toast.error("Error minifying SQL");
    }
  };

  const handleSample = () => {
    setInput(SAMPLE_QUERY);
    setOutput("");
    toast.success("Sample query loaded");
  };

  const handleCopy = async () => {
    if (!output.trim()) {
      toast.error("Nothing to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  return (
    <div
      className={`h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-hidden relative flex flex-col justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>SQL Formatter & Minifier — Dev Utilities</title>
      <meta
        name="description"
        content="Format and minify SQL queries client-side with support for multiple dialects and indentation styles."
      />

      {/* Background blurs */}
      <div
        className={`absolute top-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-30 transition-colors duration-500 ${
          dark ? "bg-zinc-800" : "bg-neutral-200"
        }`}
      />
      <div
        className={`absolute bottom-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-30 transition-colors duration-500 ${
          dark ? "bg-zinc-900" : "bg-neutral-100"
        }`}
      />

      {/* Main container */}
      <div
        className={`relative z-10 w-[85%] max-w-none mx-auto rounded-[32px] border shadow-xl flex flex-col max-h-full overflow-hidden transition-all duration-300 ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        <div
          className={`h-2 w-full transition-colors duration-500 ${
            dark ? "bg-white" : "bg-black"
          }`}
        />

        {/* Header */}
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 flex items-center gap-3">
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
            className={`text-xl sm:text-2xl font-black uppercase tracking-tight transition-colors duration-300 ${
              dark ? "text-white" : "text-black"
            }`}
          >
            SQL Formatter
          </h1>
        </div>

        {/* Controls Bar */}
        <div className="px-5 sm:px-8 pt-4 pb-4 flex flex-wrap gap-3 items-center border-b" style={{borderColor: dark ? '#3f3f46' : '#e5e7eb'}}>
          {/* Dialect Selector */}
          <div className="flex flex-col gap-1">
            <label
              className={`text-[10px] font-black uppercase tracking-widest ${
                dark ? "text-zinc-500" : "text-neutral-600"
              }`}
            >
              Dialect
            </label>
            <select
              value={dialect}
              onChange={(e) => setDialect(e.target.value)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono outline-none transition-all duration-300 ${
                dark
                  ? "bg-zinc-950 border-zinc-800 text-white focus:border-white focus:ring-1 focus:ring-white"
                  : "bg-neutral-50 border-neutral-300 text-black focus:border-black focus:ring-1 focus:ring-black"
              }`}
            >
              <option value="sql">Standard SQL</option>
              <option value="mysql">MySQL</option>
              <option value="postgresql">PostgreSQL</option>
            </select>
          </div>

          {/* Indentation Selector */}
          <div className="flex flex-col gap-1">
            <label
              className={`text-[10px] font-black uppercase tracking-widest ${
                dark ? "text-zinc-500" : "text-neutral-600"
              }`}
            >
              Indent
            </label>
            <select
              value={indentation}
              onChange={(e) => setIndentation(e.target.value)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono outline-none transition-all duration-300 ${
                dark
                  ? "bg-zinc-950 border-zinc-800 text-white focus:border-white focus:ring-1 focus:ring-white"
                  : "bg-neutral-50 border-neutral-300 text-black focus:border-black focus:ring-1 focus:ring-black"
              }`}
            >
              <option value="tabs">Tabs</option>
              <option value="2spaces">2 Spaces</option>
              <option value="4spaces">4 Spaces</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 ml-auto flex-wrap">
            <button
              onClick={handleFormat}
              type="button"
              className={`px-4 py-1.5 rounded-lg border font-bold text-xs text-center transition-all duration-300 active:scale-95 ${
                dark
                  ? "border-white bg-white text-black hover:bg-zinc-200"
                  : "border-black bg-black text-white hover:bg-zinc-800"
              }`}
            >
              Format
            </button>
            <button
              onClick={handleMinify}
              type="button"
              className={`px-4 py-1.5 rounded-lg border font-bold text-xs text-center transition-all duration-300 active:scale-95 ${
                dark
                  ? "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  : "border-neutral-300 text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              Minify
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="w-full flex-1 p-5 sm:p-8 overflow-y-auto">
          <div className="w-full h-full flex flex-col lg:flex-row gap-6">
            {/* LEFT: Input Editor */}
            <div className="w-full lg:flex-1 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label
                  className={`text-xs font-black uppercase tracking-widest ${
                    dark ? "text-zinc-400" : "text-neutral-500"
                  }`}
                >
                  Input SQL
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={handleSample}
                    type="button"
                    className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      dark
                        ? "text-zinc-500 hover:text-white"
                        : "text-zinc-400 hover:text-black"
                    }`}
                  >
                    Sample
                  </button>
                  <button
                    onClick={handleClear}
                    type="button"
                    className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      dark
                        ? "text-zinc-500 hover:text-white"
                        : "text-zinc-400 hover:text-black"
                    }`}
                  >
                    Clear
                  </button>
                </div>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your SQL query here…"
                spellCheck={false}
                className={`flex-1 min-h-[300px] px-4 py-3 rounded-2xl border text-sm font-mono outline-none transition-all duration-300 resize-none ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                    : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                }`}
              />
            </div>

            {/* RIGHT: Output Editor */}
            <div className="w-full lg:flex-1 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label
                  className={`text-xs font-black uppercase tracking-widest ${
                    dark ? "text-zinc-400" : "text-neutral-500"
                  }`}
                >
                  Output {mode === "format" ? "(Formatted)" : "(Minified)"}
                </label>
                {output && (
                  <button
                    onClick={handleCopy}
                    type="button"
                    className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      dark
                        ? "text-zinc-500 hover:text-white"
                        : "text-zinc-400 hover:text-black"
                    }`}
                  >
                    Copy
                  </button>
                )}
              </div>
              <div
                className={`flex-1 min-h-[300px] px-4 py-3 rounded-2xl border text-sm font-mono outline-none transition-all duration-300 overflow-auto ${
                  dark
                    ? "bg-zinc-950 border-zinc-800"
                    : "bg-neutral-50 border-neutral-300"
                }`}
              >
                {output ? (
                  <CodeBlock code={output} dark={dark} />
                ) : (
                  <span
                    className={`text-xs font-mono ${
                      dark ? "text-zinc-600" : "text-neutral-400"
                    }`}
                  >
                    Formatted/minified output will appear here…
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SqlFormatter;