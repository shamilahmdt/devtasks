import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const SAMPLE_JSON = `[
  {
    "id": 1,
    "name": "Ayesha",
    "email": "ayesha@example.com",
    "active": true,
    "score": 95.5
  },
  {
    "id": 2,
    "name": "Ali",
    "email": "ali@example.com",
    "active": false,
    "score": 88
  }
]`;

const SAMPLE_SQL = `INSERT INTO users (id, name, email, active, score)
VALUES
  (1, 'Ayesha', 'ayesha@example.com', TRUE, 95.5),
  (2, 'Ali', 'ali@example.com', FALSE, 88);`;

function escapeSqlString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "''");
}

function valueToSql(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("JSON contains a non-finite number.");
    }

    return String(value);
  }

  if (typeof value === "string") {
    return `'${escapeSqlString(value)}'`;
  }

  throw new Error(
    "Nested objects and arrays are not supported as SQL scalar values.",
  );
}

function jsonToSql(jsonText, tableName) {
  if (!tableName.trim()) {
    throw new Error("Please enter a table name.");
  }

  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(tableName.trim())) {
    throw new Error(
      "Table name can only contain letters, numbers, and underscores.",
    );
  }

  let data;

  try {
    data = JSON.parse(jsonText);
  } catch {
    throw new Error("Invalid JSON. Please check your JSON syntax.");
  }

  if (!Array.isArray(data)) {
    throw new Error("JSON must be an array of objects.");
  }

  if (data.length === 0) {
    throw new Error("JSON array cannot be empty.");
  }

  if (
    !data.every(
      (item) => item && typeof item === "object" && !Array.isArray(item),
    )
  ) {
    throw new Error("Every item in the JSON array must be an object.");
  }

  const columns = [...new Set(data.flatMap((item) => Object.keys(item)))];

  if (columns.length === 0) {
    throw new Error("JSON objects must contain at least one property.");
  }

  const rows = data.map((item) => {
    const values = columns.map((column) => valueToSql(item[column]));
    return `  (${values.join(", ")})`;
  });

  return `INSERT INTO ${tableName.trim()} (${columns.join(", ")})
VALUES
${rows.join(",\n")};`;
}

function splitSqlValues(valueText) {
  const values = [];
  let current = "";
  let inString = false;
  let depth = 0;

  for (let i = 0; i < valueText.length; i += 1) {
    const char = valueText[i];
    const next = valueText[i + 1];

    if (char === "'" && inString && next === "'") {
      current += "''";
      i += 1;
      continue;
    }

    if (char === "'") {
      inString = !inString;
      current += char;
      continue;
    }

    if (!inString) {
      if (char === "(") depth += 1;
      if (char === ")") depth -= 1;

      if (char === "," && depth === 0) {
        values.push(current.trim());
        current = "";
        continue;
      }
    }

    current += char;
  }

  if (current.trim()) {
    values.push(current.trim());
  }

  if (inString) {
    throw new Error("Unclosed SQL string literal.");
  }

  return values;
}

function splitRows(valuesText) {
  const rows = [];
  let current = "";
  let depth = 0;
  let inString = false;

  for (let i = 0; i < valuesText.length; i += 1) {
    const char = valuesText[i];
    const next = valuesText[i + 1];

    if (char === "'" && inString && next === "'") {
      current += "''";
      i += 1;
      continue;
    }

    if (char === "'") {
      inString = !inString;
      current += char;
      continue;
    }

    if (!inString) {
      if (char === "(") {
        if (depth === 0) {
          current = "";
        }

        depth += 1;
        current += char;
        continue;
      }

      if (char === ")") {
        depth -= 1;
        current += char;

        if (depth === 0) {
          rows.push(current.trim());
          current = "";
        }

        continue;
      }
    }

    if (depth > 0) {
      current += char;
    }
  }

  if (inString || depth !== 0) {
    throw new Error("Invalid VALUES section.");
  }

  return rows;
}

function sqlValueToJson(value) {
  const trimmed = value.trim();

  if (/^NULL$/i.test(trimmed)) {
    return null;
  }

  if (/^(TRUE|FALSE)$/i.test(trimmed)) {
    return trimmed.toLowerCase() === "true";
  }

  if (/^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }

  return trimmed;
}

function sqlToJson(sqlText) {
  const sql = sqlText.trim();

  if (!sql) {
    throw new Error("Please enter an SQL INSERT statement.");
  }

  const match = sql.match(
    /^INSERT\s+INTO\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s*\(([^)]*)\))?\s+VALUES\s+([\s\S]*?)\s*;?\s*$/i,
  );

  if (!match) {
    throw new Error(
      "Only INSERT INTO ... VALUES ... statements are supported.",
    );
  }

  const columnsText = match[2];

  if (!columnsText) {
    throw new Error(
      "Please include column names, for example: INSERT INTO users (id, name) VALUES (...).",
    );
  }

  const columns = columnsText
    .split(",")
    .map((column) => column.trim())
    .filter(Boolean);

  if (columns.length === 0) {
    throw new Error("No columns were found.");
  }

  if (columns.some((column) => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(column))) {
    throw new Error("Column names must be simple SQL identifiers.");
  }

  const rows = splitRows(match[3]);

  if (rows.length === 0) {
    throw new Error("No VALUES rows were found.");
  }

  const result = rows.map((row) => {
    const content = row.slice(1, -1);
    const values = splitSqlValues(content);

    if (values.length !== columns.length) {
      throw new Error(
        `Column/value count mismatch. Expected ${columns.length}, found ${values.length}.`,
      );
    }

    return Object.fromEntries(
      columns.map((column, index) => [column, sqlValueToJson(values[index])]),
    );
  });

  return JSON.stringify(result, null, 2);
}

const JsonSqlConverter = () => {
  const { dark } = useTheme();

  const [mode, setMode] = useState("json-to-sql");
  const [tableName, setTableName] = useState("users");
  const [input, setInput] = useState(SAMPLE_JSON);
  const [output, setOutput] = useState("");

  const [error, setError] = useState("");

  const theme = useMemo(
    () =>
      dark
        ? {
            page: "bg-zinc-950 text-zinc-100",
            panel: "bg-zinc-900/60 border-zinc-800",
            input:
              "bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600",
            muted: "text-zinc-400",
            button: "bg-white text-black hover:bg-zinc-200",
            secondary: "border-zinc-700 text-zinc-200 hover:bg-zinc-800",
          }
        : {
            page: "bg-[#F8F9FA] text-zinc-900",
            panel: "bg-white border-zinc-200",
            input:
              "bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400",
            muted: "text-zinc-500",
            button: "bg-black text-white hover:bg-zinc-800",
            secondary: "border-zinc-300 text-zinc-700 hover:bg-zinc-100",
          },
    [dark],
  );

  const handleConvert = () => {
    setError("");

    try {
      const result =
        mode === "json-to-sql" ? jsonToSql(input, tableName) : sqlToJson(input);

      setOutput(result);
      toast.success("Conversion completed successfully.");
    } catch (conversionError) {
      setOutput("");
      setError(conversionError.message);
      toast.error(conversionError.message);
    }
  };

  const handleCopy = async () => {
    if (!output) {
      toast.error("Nothing to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      toast.success("Output copied to clipboard.");
    } catch {
      toast.error("Unable to copy output.");
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const loadSample = () => {
    if (mode === "json-to-sql") {
      setTableName("users");
      setInput(SAMPLE_JSON);
    } else {
      setInput(SAMPLE_SQL);
    }

    setOutput("");
    setError("");
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setOutput("");
    setError("");

    if (nextMode === "json-to-sql") {
      setTableName("users");
      setInput(SAMPLE_JSON);
    } else {
      setInput(SAMPLE_SQL);
    }
  };

  return (
    <div
      className={`min-h-screen ${theme.page} transition-colors duration-300`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/devutilities"
            className={`mb-4 inline-flex text-sm ${theme.muted} hover:underline`}
          >
            ← Back to Dev Utilities
          </Link>

          <h1 className="text-3xl font-bold tracking-tight">
            JSON ↔ SQL INSERT Converter
          </h1>

          <p className={`mt-2 max-w-3xl ${theme.muted}`}>
            Convert JSON arrays into SQL INSERT statements or convert supported
            SQL INSERT statements back into JSON completely offline.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => switchMode("json-to-sql")}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              mode === "json-to-sql" ? theme.button : theme.secondary
            }`}
          >
            JSON → SQL
          </button>

          <button
            type="button"
            onClick={() => switchMode("sql-to-json")}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              mode === "sql-to-json" ? theme.button : theme.secondary
            }`}
          >
            SQL → JSON
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section
            className={`rounded-2xl border p-5 shadow-sm ${theme.panel}`}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Input</h2>
                <p className={`text-sm ${theme.muted}`}>
                  {mode === "json-to-sql"
                    ? "Enter a JSON array of objects."
                    : "Enter an INSERT INTO ... VALUES statement."}
                </p>
              </div>

              <button
                type="button"
                onClick={loadSample}
                className={`rounded-lg border px-3 py-2 text-sm ${theme.secondary}`}
              >
                Load sample
              </button>
            </div>

            {mode === "json-to-sql" && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">
                  Table name
                </label>

                <input
                  value={tableName}
                  onChange={(event) => setTableName(event.target.value)}
                  placeholder="users"
                  className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 ${theme.input}`}
                />
              </div>
            )}

            <textarea
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setError("");
              }}
              spellCheck={false}
              className={`min-h-[420px] w-full resize-y rounded-xl border p-4 font-mono text-sm outline-none focus:ring-2 focus:ring-zinc-400 ${theme.input}`}
              placeholder={
                mode === "json-to-sql"
                  ? '[{"id": 1, "name": "Ayesha"}]'
                  : "INSERT INTO users (id, name) VALUES (1, 'Ayesha');"
              }
            />

            {error && (
              <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleConvert}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${theme.button}`}
              >
                Convert
              </button>

              <button
                type="button"
                onClick={handleClear}
                className={`rounded-lg border px-4 py-2 text-sm ${theme.secondary}`}
              >
                Clear
              </button>
            </div>
          </section>

          <section
            className={`rounded-2xl border p-5 shadow-sm ${theme.panel}`}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Output</h2>
                <p className={`text-sm ${theme.muted}`}>Generated result</p>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!output}
                className={`rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 ${theme.secondary}`}
              >
                Copy
              </button>
            </div>

            <textarea
              value={output}
              readOnly
              spellCheck={false}
              className={`min-h-[420px] w-full resize-y rounded-xl border p-4 font-mono text-sm outline-none ${theme.input}`}
              placeholder="Your converted output will appear here..."
            />
          </section>
        </div>

        <div className={`mt-6 rounded-2xl border p-5 ${theme.panel}`}>
          <h2 className="font-semibold">Supported values</h2>

          <ul
            className={`mt-3 grid gap-2 text-sm sm:grid-cols-2 ${theme.muted}`}
          >
            <li>• Strings with SQL quote escaping</li>
            <li>• Numbers and decimals</li>
            <li>• Boolean values</li>
            <li>• NULL values</li>
            <li>• Multiple JSON rows</li>
            <li>• Multiple SQL VALUES rows</li>
          </ul>

          <p className={`mt-4 text-xs ${theme.muted}`}>
            This converter intentionally handles scalar JSON values and standard
            INSERT ... VALUES statements. It does not execute SQL or connect to
            a database.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JsonSqlConverter;
