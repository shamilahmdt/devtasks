import { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const JsonToSchemaGenerator = () => {
  const { dark } = useTheme();
  const [jsonInput, setJsonInput] = useState("");
  const [schemaOutput, setSchemaOutput] = useState("");
  const [allRequired, setAllRequired] = useState(false);
  const [inferFormats, setInferFormats] = useState(true);
  const [addMetadata, setAddMetadata] = useState(true);
  const [strictInteger, setStrictInteger] = useState(true);

  const inferType = (value) => {
    if (value === null || value === undefined) return "null";
    if (Array.isArray(value)) return "array";
    return typeof value;
  };

  const isEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  const isDate = (str) => !isNaN(Date.parse(str));
  const isUri = (str) => /^https?:\/\/.+/.test(str);
  const isIpv4 = (str) =>
    /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(str);

  const inferFormat = (str) => {
    if (!inferFormats || typeof str !== "string") return undefined;
    if (isEmail(str)) return "email";
    if (isUri(str)) return "uri";
    if (isIpv4(str)) return "ipv4";
    if (isDate(str)) return "date-time";
    return undefined;
  };

  const generateSchema = (data, path = "#") => {
    const type = inferType(data);

    if (type === "object") {
      const properties = {};
      const required = [];
      for (const key of Object.keys(data)) {
        properties[key] = generateSchema(data[key], `${path}/properties/${key}`);
        if (allRequired) required.push(key);
      }
      const schema = {
        type: "object",
        properties,
        ...(required.length > 0 && { required: required.sort() }),
      };
      return schema;
    }

    if (type === "array") {
      if (data.length === 0) {
        return { type: "array" };
      }
      const itemSchemas = data.map((item, i) =>
        generateSchema(item, `${path}/items/${i}`)
      );
      const allSame = itemSchemas.every(
        (s) => JSON.stringify(s) === JSON.stringify(itemSchemas[0])
      );
      return {
        type: "array",
        items: allSame ? itemSchemas[0] : itemSchemas,
      };
    }

    if (type === "string") {
      const schema = { type: "string" };
      const fmt = inferFormat(data);
      if (fmt) schema.format = fmt;
      return schema;
    }

    if (type === "number") {
      if (strictInteger && Number.isInteger(data)) {
        return { type: "integer" };
      }
      return { type: "number" };
    }

    if (type === "boolean") {
      return { type: "boolean" };
    }

    return { type: "null" };
  };

  const handleGenerate = () => {
    try {
      if (!jsonInput.trim()) {
        toast.error("Please enter JSON data");
        return;
      }
      const parsed = JSON.parse(jsonInput);
      const schema = generateSchema(parsed);
      if (addMetadata) {
        schema.$schema = "http://json-schema.org/draft-07/schema#";
        schema.title = "Generated Schema";
        schema.description = "Auto-generated from JSON data";
      }
      setSchemaOutput(JSON.stringify(schema, null, 2));
      toast.success("Schema generated");
    } catch (err) {
      toast.error("Invalid JSON: " + err.message);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      toast.success("JSON formatted");
    } catch {
      toast.error("Cannot format invalid JSON");
    }
  };

  const handleClear = () => {
    setJsonInput("");
    setSchemaOutput("");
  };

  const handleSample = () => {
    const sample = {
      name: "Alice Johnson",
      age: 30,
      email: "alice@example.com",
      website: "https://alice.dev",
      isActive: true,
      role: "admin",
      metadata: {
        joined: "2024-01-15T08:00:00Z",
        score: 95.5,
      },
      tags: ["developer", "open-source"],
      projects: [
        { name: "Project A", stars: 120 },
        { name: "Project B", stars: 45 },
      ],
    };
    setJsonInput(JSON.stringify(sample, null, 2));
    setSchemaOutput("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(schemaOutput);
    toast.success("Schema copied to clipboard");
  };

  const handleDownload = () => {
    const blob = new Blob([schemaOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schema.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputBg = dark
    ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white"
    : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black";

  const labelCls = dark ? "text-zinc-400" : "text-neutral-500";

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
        className={`relative z-10 w-full max-w-6xl rounded-[32px] border shadow-xl overflow-hidden ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        <div className={`h-2 w-full ${dark ? "bg-white" : "bg-black"}`} />

        <div className="px-6 sm:px-8 pt-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/devutilities"
              className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${
                dark
                  ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                  : "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
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

          <div className="flex gap-2 flex-wrap">
            <button onClick={handleSample} className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
              dark
                ? "bg-white text-black border-white hover:bg-zinc-200"
                : "bg-black text-white border-black hover:bg-zinc-800"
            }`}>
              Sample
            </button>
            <button onClick={handleFormat} className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
              dark
                ? "border-zinc-700 text-white hover:bg-zinc-800"
                : "border-neutral-300 text-black hover:bg-neutral-100"
            }`}>
              Format
            </button>
            <button onClick={handleClear} className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
              dark
                ? "border-zinc-700 text-white hover:bg-zinc-800"
                : "border-neutral-300 text-black hover:bg-neutral-100"
            }`}>
              Clear
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <label className={`text-xs font-black uppercase tracking-widest ${labelCls}`}>
                JSON Input
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"key": "value"}'
                className={`h-[280px] px-4 py-3 rounded-2xl border text-sm resize-none outline-none font-mono ${inputBg}`}
              />

              <div className="flex flex-col gap-2">
                <span className={`text-xs font-black uppercase tracking-widest ${labelCls}`}>
                  Options
                </span>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={allRequired} onChange={() => setAllRequired(!allRequired)} className="rounded" />
                  <span className={dark ? "text-zinc-300" : "text-neutral-700"}>All properties required</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={inferFormats} onChange={() => setInferFormats(!inferFormats)} className="rounded" />
                  <span className={dark ? "text-zinc-300" : "text-neutral-700"}>Infer string formats (email, date, uri)</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={addMetadata} onChange={() => setAddMetadata(!addMetadata)} className="rounded" />
                  <span className={dark ? "text-zinc-300" : "text-neutral-700"}>Add $schema, title, description</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={strictInteger} onChange={() => setStrictInteger(!strictInteger)} className="rounded" />
                  <span className={dark ? "text-zinc-300" : "text-neutral-700"}>Strict integer type detection</span>
                </label>
              </div>

              <button
                onClick={handleGenerate}
                className={`w-full py-3 rounded-2xl border text-sm font-black transition-all active:scale-[0.99] ${
                  dark
                    ? "border-white text-white hover:bg-white hover:text-black"
                    : "border-black text-black hover:bg-black hover:text-white"
                }`}
              >
                Generate Schema
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-black uppercase tracking-widest ${labelCls}`}>
                  JSON Schema Output
                </label>
                {schemaOutput && (
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border transition-all ${
                      dark
                        ? "border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                        : "border-neutral-300 text-neutral-600 hover:text-black hover:border-neutral-400"
                    }`}>
                      Copy
                    </button>
                    <button onClick={handleDownload} className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border transition-all ${
                      dark
                        ? "border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                        : "border-neutral-300 text-neutral-600 hover:text-black hover:border-neutral-400"
                    }`}>
                      Download
                    </button>
                  </div>
                )}
              </div>
              <textarea
                value={schemaOutput}
                readOnly
                placeholder="Generated schema will appear here..."
                className={`h-[420px] px-4 py-3 rounded-2xl border text-sm resize-none outline-none font-mono ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700"
                    : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400"
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
