import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

const sampleSQL = `CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  profile_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status BOOLEAN DEFAULT TRUE,
  CONSTRAINT fk_profile FOREIGN KEY (profile_id) REFERENCES profiles(id)
);`;

const SQL_TO_JSON = {
  INT: "integer",
  INTEGER: "integer",
  BIGINT: "integer",
  SMALLINT: "integer",
  TINYINT: "integer",

  VARCHAR: "string",
  CHAR: "string",
  TEXT: "string",

  BOOLEAN: "boolean",
  BOOL: "boolean",

  FLOAT: "number",
  DOUBLE: "number",
  DECIMAL: "number",
  NUMERIC: "number",

  DATE: "string",
  DATETIME: "string",
  TIMESTAMP: "string",
  TIME: "string",

  JSON: "object",
  JSONB: "object",
};

function inferJSONType(sqlType) {
  const base = sqlType.replace(/\(.+\)/, "").toUpperCase();
  return SQL_TO_JSON[base] || "string";
}

function normalizeDefault(value) {
  if (value === undefined) return undefined;

  value = value.trim();

  if (/^NULL$/i.test(value)) return null;
  if (/^TRUE$/i.test(value)) return true;
  if (/^FALSE$/i.test(value)) return false;

  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);

  if (/^'.*'$/.test(value)) return value.slice(1, -1);

  return value;
}

function parseSQL(sql) {
  sql = sql.trim();

  if (!sql.length) throw new Error("Empty SQL");

  const tableMatch = sql.match(/CREATE\s+TABLE\s+([A-Za-z_][A-Za-z0-9_]*)/i);

  if (!tableMatch) throw new Error("Invalid CREATE TABLE statement");

  const tableName = tableMatch[1];

  const body = sql.match(/\(([\s\S]*)\)\s*;?$/);

  if (!body) throw new Error("Cannot find table body");

  const items = body[1]
    .split(/,(?![^()]*\))/)
    .map((i) => i.trim())
    .filter(Boolean);

  const columns = [];
  const tableConstraints = [];

  for (const item of items) {
    if (/^(PRIMARY|FOREIGN|UNIQUE|CHECK|CONSTRAINT)/i.test(item)) {
      tableConstraints.push(item);
      continue;
    }

    const parts = item.split(/\s+/);
    const name = parts.shift();
    let type = parts.shift();

    while (type.includes("(") && !type.includes(")") && parts.length) {
      type += " " + parts.shift();
    }

    const rest = parts.join(" ");

    const column = {
      name,
      type,
      primaryKey: /PRIMARY\s+KEY/i.test(rest),
      nullable: !/NOT\s+NULL/i.test(rest),
      unique: /UNIQUE/i.test(rest),
      default: undefined,
      foreignKey: null,
    };

    const defaultMatch = rest.match(/DEFAULT\s+(.+)$/i);

    if (defaultMatch) column.default = defaultMatch[1].trim();

    const ref = rest.match(/REFERENCES\s+(\w+)\((\w+)\)/i);

    if (ref) {
      column.foreignKey = {
        table: ref[1],

        column: ref[2],
      };
    }

    if (column.primaryKey) column.nullable = false;

    columns.push(column);
  }

  // Parse table-level constraints
  for (const constraint of tableConstraints) {
    // PRIMARY KEY (id)
    const pkMatch = constraint.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);

    if (pkMatch) {
      const keys = pkMatch[1].split(",").map((x) => x.trim());

      keys.forEach((key) => {
        const col = columns.find((c) => c.name === key);

        if (col) {
          col.primaryKey = true;
          col.nullable = false;
        }
      });
    }

    // FOREIGN KEY (profile_id) REFERENCES profiles(id)

    const fkMatch = constraint.match(
      /FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]+)\)/i,
    );

    if (fkMatch) {
      const fkColumns = fkMatch[1].split(",").map((x) => x.trim());

      const refColumns = fkMatch[3].split(",").map((x) => x.trim());

      fkColumns.forEach((columnName, index) => {
        const column = columns.find((c) => c.name === columnName);

        if (!column) return;

        column.foreignKey = {
          table: fkMatch[2],

          column: refColumns[index] || refColumns[0],
        };
      });
    }
  }

  return {
    tableName,
    columns,
  };
}

function generateJSONSchema(parsed) {
  const properties = {};
  const required = [];

  parsed.columns.forEach((col) => {
    properties[col.name] = {
      type: inferJSONType(col.type),
    };

    if (col.default !== undefined) {
      properties[col.name].default = normalizeDefault(col.default, col.type);
    }

    if (col.unique) {
      properties[col.name].unique = true;
    }

    if (col.foreignKey) {
      properties[col.name].foreignKey = {
        table: col.foreignKey.table,

        column: col.foreignKey.column,
      };
    }

    if (!col.nullable) required.push(col.name);
  });

  const schema = {
    title: parsed.tableName,
    type: "object",
    properties,
  };

  if (required.length) schema.required = required;

  return JSON.stringify(schema, null, 2);
}

function generateMockJSON(parsed) {
  const mock = {};

  parsed.columns.forEach((col) => {
    if (col.default !== undefined) {
      mock[col.name] = normalizeDefault(col.default);
      return;
    }

    const type = inferJSONType(col.type);

    switch (type) {
      case "integer":
        mock[col.name] = 1;
        break;

      case "number":
        mock[col.name] = 0.0;
        break;

      case "boolean":
        mock[col.name] = true;
        break;

      case "object":
        mock[col.name] = {};
        break;

      case "array":
        mock[col.name] = [];
        break;

      case "string":
        if (/DATE/i.test(col.type)) {
          mock[col.name] = "2026-01-01";
        } else if (/TIME|TIMESTAMP|DATETIME/i.test(col.type)) {
          mock[col.name] = "2026-01-01T00:00:00Z";
        } else {
          mock[col.name] = "string";
        }
        break;

      default:
        mock[col.name] = null;
    }
  });

  return JSON.stringify(mock, null, 2);
}

function generateMarkdownTable(parsed) {
  const headers = ["Column Name", "Data Type", "Constraints", "Default Value"];

  const lines = [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
  ];

  parsed.columns.forEach((col) => {
    const constraints = [];

    if (col.primaryKey) constraints.push("Primary Key");
    if (!col.nullable) constraints.push("Not Null");
    else constraints.push("Nullable");

    if (col.unique) constraints.push("Unique");

    if (col.foreignKey) {
      constraints.push(
        `FK → ${col.foreignKey.table}(${col.foreignKey.column})`,
      );
    }

    lines.push(
      `| ${col.name} | ${col.type} | ${constraints.join(", ") || "-"} | ${
        col.default !== undefined ? `\`${col.default}\`` : "-"
      } |`,
    );
  });

  return lines.join("\n");
}

function markdownToRows(markdown) {
  return markdown
    .trim()
    .split("\n")
    .filter((_, i) => i !== 1) // remove separator line
    .map((line) =>
      line
        .slice(1, -1)
        .split("|")
        .map((cell) => cell.trim()),
    );
}

function SqlSchemaConverter() {
  const { dark } = useTheme();
  const [input, setInput] = useState("");
  // const [output, setOutput] = useState("");
  const [isMinified, setIsMinified] = useState(false);
  const [format, setFormat] = useState("schema");

  const parsed = useMemo(() => {
    try {
      return parseSQL(input);
    } catch {
      return null;
    }
  }, [input]);

  const output = useMemo(() => {
    if (!parsed) return "";

    let result;

    switch (format) {
      case "mock":
        result = generateMockJSON(parsed);
        break;

      case "markdown":
        result = generateMarkdownTable(parsed);
        break;

      default:
        result = generateJSONSchema(parsed);
    }

    if (isMinified && format !== "markdown") {
      return JSON.stringify(JSON.parse(result));
    }

    return result;
  }, [parsed, format, isMinified]);

  const handleSample = () => {
    setInput(sampleSQL);
    toast.success("Sample SQL loaded");
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setIsMinified(false);
  };

  const handleMinify = () => setIsMinified(true);

  const handleBeautify = () => setIsMinified(false);

  const handleCopy = async () => {
    try {
      if (!output) return;
      await navigator.clipboard.writeText(output);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleClear = () => {
    setInput("");
    setIsMinified(false);
    toast.success("Editor cleared");
  };

  const rows = markdownToRows(output);

  const buttons = [
    { label: "Beautify", onClick: handleBeautify },
    { label: "Minify", onClick: handleMinify },
    { label: "Copy", onClick: handleCopy },
    { label: "Clear", onClick: handleClear },
  ];

  const formats = [
    { label: "JSON Schema", value: "schema" },
    { label: "Mock JSON", value: "mock" },
    { label: "Markdown", value: "markdown" },
  ];

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 font-sans antialiased transition-colors duration-300 overflow-x-hidden ${
        dark ? "bg-zinc-950" : "bg-[#FDFDFD]"
      }`}
    >
      <title>SQL Schema Converter</title>

      <meta
        name="description"
        content="View SQL queries client-side in Markdown or JSON format."
      />

      <div
        className={`w-full max-w-6xl md:mx-auto rounded-3xl shadow-lg p-4 sm:p-8 border transition-colors duration-300 ${
          dark ? "bg-zinc-900 border-zinc-700" : "bg-white border-neutral-100"
        }`}
      >
        {/* Header */}
        <div className="flex flex-col gap-4 mb-5">
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
              <div>
                <h1
                  className={`text-xl sm:text-2xl font-black uppercase tracking-tight transition-colors duration-300 min-w-0 flex-1 ${
                    dark ? "text-white" : "text-black"
                  }`}
                >
                  SQL SCHEMA CONVERTER
                </h1>

                <label
                  className={`text-xs font-black uppercase tracking-widest ${
                    dark ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  Live conversion into JSON Schema and Markdown Tables
                </label>
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
                onChange={handleInputChange}
                spellCheck={false}
                placeholder="Paste a CREATE TABLE statement...
Example:
  CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(255)
);"
                className={`w-full h-84 p-4 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors font-mono text-sm ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-zinc-200 placeholder-zinc-600"
                    : "bg-neutral-50 border-neutral-200 text-zinc-800 placeholder-neutral-400"
                }`}
              />
            </div>

            {/* Output */}
            <div className="flex flex-col">
              <div className="flex items-center mb-3 h-8 gap-10">
                <label
                  className={`text-xs font-black uppercase tracking-widest ${
                    dark ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  Output
                </label>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {formats.map((btn) => (
                    <button
                      key={btn.value}
                      onClick={() => setFormat(btn.value)}
                      type="button"
                      className={`w-full px-4 py-2 rounded-xl border font-bold text-sm text-center transition-all duration-300 active:scale-95 ${
                        format === btn.value
                          ? dark
                            ? "bg-white text-black border-white"
                            : "bg-black text-white border-black"
                          : dark
                          ? "border-white text-white hover:bg-white hover:text-black"
                          : "border-black text-black hover:bg-black hover:text-white"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={output}
                readOnly
                spellCheck={false}
                className={`w-full h-84 p-4 rounded-xl border resize-none focus:outline-none transition-colors font-mono text-sm ${
                  dark
                    ? `bg-zinc-900/50 border-zinc-800 ${
                        output ? "text-zinc-200" : "text-zinc-500"
                      }`
                    : `bg-neutral-100 border-neutral-200 ${
                        output ? "text-zinc-800" : "text-zinc-400"
                      }`
                }`}
                placeholder={
                  format === "schema"
                    ? "Generated JSON Schema will appear here..."
                    : format === "mock"
                    ? "Generated mock JSON will appear here..."
                    : "Generated Markdown table will appear here..."
                }
              />

              {/* Action Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-4">
                {buttons.map((btn) => (
                  <button
                    key={btn.label}
                    onClick={btn.onClick}
                    type="button"
                    className={`w-full px-4 py-2 rounded-xl border font-bold text-sm text-center transition-all duration-300 active:scale-95 ${
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
          </div>
          {/* Markdown preview */}

          {/* <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 lg:gap-8 mb-8"> */}
          <div className="">
            {format === "markdown" && (
              <>
                <label
                  className={`text-xs font-black uppercase tracking-widest ${
                    dark ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  Markdown Preview
                </label>

                <div className="mt-5 overflow-x-auto rounded-xl border border-zinc-700">
                  <table className="w-full border-collapse">
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td key={j} className="border border-zinc-700 p-2">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SqlSchemaConverter;
