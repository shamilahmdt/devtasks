import { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const JsonToSchemaGenerator = () => {
  const { dark } = useTheme();

  const [jsonInput, setJsonInput] = useState("");
  const [schemaOutput, setSchemaOutput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [options, setOptions] = useState({
    allRequired: false,
    inferFormats: true,
    addMetadata: true,
    numberPrecision: "number", // "number" or "integer"
  });

  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const inferSchema = (data, opts) => {
    const { allRequired, inferFormats, numberPrecision } = opts;

    const getType = (val) => {
      if (val === null) return "null";
      if (Array.isArray(val)) return "array";
      return typeof val;
    };

    const processNode = (node) => {
      const type = getType(node);

      if (type === "object") {
        const properties = {};
        const required = [];
        for (const key in node) {
          properties[key] = processNode(node[key]);
          if (allRequired) required.push(key);
        }
        const schema = { type: "object" };
        if (Object.keys(properties).length > 0) {
          schema.properties = properties;
        }
        if (required.length > 0) schema.required = required;
        return schema;
      }

      if (type === "array") {
        if (node.length === 0) {
          return { type: "array", items: {} };
        }
        // Using the first item's structure as the array type
        const itemType = processNode(node[0]);
        return { type: "array", items: itemType };
      }

      if (type === "string") {
        const schema = { type: "string" };
        if (inferFormats && node.length > 0) {
          if (/^\S+@\S+\.\S+$/.test(node)) schema.format = "email";
          else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(node))
            schema.format = "date-time";
          else if (/^\d{4}-\d{2}-\d{2}$/.test(node)) schema.format = "date";
          else if (/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(node))
            schema.format = "uri";
          else if (
            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
              node
            )
          )
            schema.format = "ipv4";
        }
        return schema;
      }

      if (type === "number") {
        if (numberPrecision === "integer" && Number.isInteger(node)) {
          return { type: "integer" };
        }
        return { type: "number" };
      }

      if (type === "boolean") {
        return { type: "boolean" };
      }

      return { type: "null" };
    };

    let baseSchema = processNode(data);

    if (opts.addMetadata) {
      baseSchema = {
        $schema: "http://json-schema.org/draft-07/schema#",
        title: "Generated Schema",
        description: "Schema generated from JSON payload",
        ...baseSchema,
      };
    }

    return baseSchema;
  };

  useEffect(() => {
    if (!jsonInput.trim()) {
      setSchemaOutput("");
      setErrorMsg("");
      return;
    }

    try {
      const parsedJson = JSON.parse(jsonInput);
      const schema = inferSchema(parsedJson, options);
      setSchemaOutput(JSON.stringify(schema, null, 2));
      setErrorMsg("");
    } catch (err) {
      setErrorMsg("Invalid JSON: " + err.message);
    }
  }, [jsonInput, options]);

  const handleFormat = () => {
    try {
      if (jsonInput.trim()) {
        const parsed = JSON.parse(jsonInput);
        setJsonInput(JSON.stringify(parsed, null, 2));
      }
    } catch (err) {
      toast.error("Cannot format invalid JSON");
    }
  };

  const copyToClipboard = () => {
    if (!schemaOutput) return;
    navigator.clipboard.writeText(schemaOutput);
    toast.success("Schema copied to clipboard!");
  };

  const downloadSchema = () => {
    if (!schemaOutput) return;
    const blob = new Blob([schemaOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schema.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Schema downloaded");
  };

  return (
    <div
      className={`min-h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 relative flex items-center justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <div
        className={`absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 ${
          dark ? "bg-zinc-800" : "bg-neutral-300"
        }`}
      />
      <div
        className={`absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 ${
          dark ? "bg-zinc-900" : "bg-neutral-200"
        }`}
      />

      <div
        className={`relative z-10 w-full max-w-7xl rounded-[32px] border shadow-xl overflow-hidden ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        <div className={`h-2 w-full ${dark ? "bg-white" : "bg-black"}`} />

        <div className="px-6 sm:px-8 pt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
              className={`text-2xl font-black uppercase tracking-tight ${
                dark ? "text-white" : "text-black"
              }`}
            >
              JSON to Schema
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleFormat}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                dark
                  ? "border-zinc-700 text-white hover:bg-zinc-800"
                  : "border-neutral-300 text-black hover:bg-neutral-100"
              }`}
            >
              Format JSON
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <label
                  className={`text-xs font-black uppercase tracking-widest ${
                    dark ? "text-zinc-400" : "text-neutral-500"
                  }`}
                >
                  Raw JSON Input
                </label>
                {errorMsg && (
                  <span className="text-red-500 text-xs font-bold">{errorMsg}</span>
                )}
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"name": "Dev Tasks", "isAwesome": true}'
                className={`h-[420px] px-4 py-3 rounded-2xl border text-sm resize-none outline-none font-mono ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white"
                    : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black"
                }`}
              />

              <div
                className={`p-4 rounded-2xl border ${
                  dark ? "bg-zinc-950 border-zinc-800" : "bg-neutral-50 border-neutral-200"
                }`}
              >
                <h3
                  className={`text-sm font-bold mb-3 ${
                    dark ? "text-white" : "text-black"
                  }`}
                >
                  Schema Customization Settings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.allRequired}
                      onChange={(e) =>
                        handleOptionChange("allRequired", e.target.checked)
                      }
                      className="w-4 h-4 rounded"
                    />
                    <span className={dark ? "text-zinc-300" : "text-zinc-700"}>
                      All Properties Required
                    </span>
                  </label>

                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.inferFormats}
                      onChange={(e) =>
                        handleOptionChange("inferFormats", e.target.checked)
                      }
                      className="w-4 h-4 rounded"
                    />
                    <span className={dark ? "text-zinc-300" : "text-zinc-700"}>
                      Infer String Formats
                    </span>
                  </label>

                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.addMetadata}
                      onChange={(e) =>
                        handleOptionChange("addMetadata", e.target.checked)
                      }
                      className="w-4 h-4 rounded"
                    />
                    <span className={dark ? "text-zinc-300" : "text-zinc-700"}>
                      Add Default Metadata
                    </span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <span className={dark ? "text-zinc-300" : "text-zinc-700"}>
                      Numbers as:
                    </span>
                    <select
                      value={options.numberPrecision}
                      onChange={(e) =>
                        handleOptionChange("numberPrecision", e.target.value)
                      }
                      className={`ml-1 bg-transparent border-b ${
                        dark
                          ? "border-zinc-700 text-white outline-none"
                          : "border-neutral-300 text-black outline-none"
                      }`}
                    >
                      <option value="number">Number</option>
                      <option value="integer">Integer</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <label
                  className={`text-xs font-black uppercase tracking-widest ${
                    dark ? "text-zinc-400" : "text-neutral-500"
                  }`}
                >
                  Schema Output
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    disabled={!schemaOutput}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all disabled:opacity-50 ${
                      dark
                        ? "bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700"
                        : "bg-white text-black border-neutral-300 hover:bg-neutral-100"
                    }`}
                  >
                    Copy
                  </button>
                  <button
                    onClick={downloadSchema}
                    disabled={!schemaOutput}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all disabled:opacity-50 ${
                      dark
                        ? "bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700"
                        : "bg-white text-black border-neutral-300 hover:bg-neutral-100"
                    }`}
                  >
                    Download JSON
                  </button>
                </div>
              </div>

              <textarea
                readOnly
                value={schemaOutput || "Schema will appear here..."}
                className={`h-[560px] px-4 py-3 rounded-2xl border text-sm resize-none outline-none font-mono ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white"
                    : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black"
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonToSchemaGenerator;
