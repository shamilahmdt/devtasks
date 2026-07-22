import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

export default function JsonTypesConverter() {
  const { dark } = useTheme();

  const [jsonInput, setJsonInput] = useState(`{
  "id": 1,
  "name": "Sarthak",
  "email": "abc@gmail.com",
  "isStudent": true,
  "skills": ["React", "Node"],
  "address": {
    "city": "Jaipur",
    "country": "India"
  }
}`);

  const [rootName, setRootName] = useState("RootObject");
  const [language, setLanguage] = useState("typescript");
  const [exportFields, setExportFields] = useState(true);
  const [tsMode, setTsMode] = useState("interface");
  const [zodImport, setZodImport] = useState(true);
  const [zodInferType, setZodInferType] = useState(true);
  const [zodOptional, setZodOptional] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  function getType(value) {
    if (Array.isArray(value)) {
      if (value.length === 0) return "any[]";
      return `${getType(value[0])}[]`;
    }
    if (value === null) return "null";
    if (typeof value === "object") return "object";
    if (typeof value === "string") return "string";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    return "any";
  }

  function goType(value) {
    if (Array.isArray(value)) {
      if (value.length === 0) return "[]interface{}";
      if (typeof value[0] === "object") return "[]Item";
      if (typeof value[0] === "string") return "[]string";
      if (typeof value[0] === "number") return "[]int";
      if (typeof value[0] === "boolean") return "[]bool";
    }
    if (typeof value === "string") return "string";
    if (typeof value === "number") return "int";
    if (typeof value === "boolean") return "bool";
    if (typeof value === "object") return "struct";
    return "interface{}";
  }

  function generateTypeScript(obj, name) {
    let interfaces = "";

    function parse(current, interfaceName) {
      let body = "";

      Object.entries(current).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (value.length > 0 && typeof value[0] === "object") {
            const child = key.charAt(0).toUpperCase() + key.slice(1);
            parse(value[0], child);
            body += `  ${key}: ${child}[];\n`;
          } else {
            body += `  ${key}: ${getType(value)};\n`;
          }
        } else if (typeof value === "object" && value !== null) {
          const child = key.charAt(0).toUpperCase() + key.slice(1);
          parse(value, child);
          body += `  ${key}: ${child};\n`;
        } else {
          body += `  ${key}: ${getType(value)};\n`;
        }
      });

      if (tsMode === "interface") {
        interfaces += `interface ${interfaceName} {\n${body}}\n\n`;
      } else {
        interfaces += `type ${interfaceName} = {\n${body}}\n\n`;
      }
    }

    parse(obj, name);
    return interfaces.trim();
  }

  function generateGoStruct(obj, name) {
    let structs = "";

    function parse(current, structName) {
      let body = "";

      Object.entries(current).forEach(([key, value]) => {
        const field = exportFields
          ? key.charAt(0).toUpperCase() + key.slice(1)
          : key;

        if (Array.isArray(value)) {
          if (value.length > 0 && typeof value[0] === "object") {
            const child = key.charAt(0).toUpperCase() + key.slice(1);
            parse(value[0], child);
            body += `    ${field} []${child} \`json:"${key}"\`\n`;
          } else {
            body += `    ${field} ${goType(value)} \`json:"${key}"\`\n`;
          }
        } else if (typeof value === "object" && value !== null) {
          const child = key.charAt(0).toUpperCase() + key.slice(1);
          parse(value, child);
          body += `    ${field} ${child} \`json:"${key}"\`\n`;
        } else {
          body += `    ${field} ${goType(value)} \`json:"${key}"\`\n`;
        }
      });

      structs += `type ${structName} struct {\n${body}}\n\n`;
    }

    parse(obj, name);
    return structs.trim();
  }

  function generateZodSchema(obj, name) {
    function toZodType(value) {
      if (value === null) return "z.any().nullable()";
      if (Array.isArray(value)) {
        if (value.length === 0) return "z.array(z.any())";
        return `z.array(${toZodType(value[0])})`;
      }
      if (typeof value === "object") return "z.object";
      if (typeof value === "string") return "z.string()";
      if (typeof value === "boolean") return "z.boolean()";
      if (typeof value === "number") {
        return Number.isInteger(value) ? "z.number().int()" : "z.number()";
      }
      return "z.any()";
    }

    let schemas = "";

    function parse(current, schemaName) {
      let body = "";

      Object.entries(current).forEach(([key, value]) => {
        let schema;
        if (Array.isArray(value)) {
          if (value.length > 0 && typeof value[0] === "object") {
            const child = key.charAt(0).toUpperCase() + key.slice(1);
            parse(value[0], child);
            schema = `z.array(${child}Schema)`;
          } else {
            schema = toZodType(value);
          }
        } else if (typeof value === "object" && value !== null) {
          const child = key.charAt(0).toUpperCase() + key.slice(1);
          parse(value, child);
          schema = `${child}Schema`;
        } else {
          schema = toZodType(value);
        }

        if (zodOptional) {
          schema += ".optional()";
        }

        body += `  ${key}: ${schema},\n`;
      });

      schemas += `const ${schemaName}Schema = z.object({\n${body}});\n\n`;
    }

    parse(obj, name);

    const parts = [];

    if (zodImport) {
      parts.push('import { z } from "zod";\n');
    }

    parts.push(schemas.trim());

    if (zodInferType) {
      const camelName = name.charAt(0).toLowerCase() + name.slice(1);
      parts.push(`\nexport type ${name} = z.infer<typeof ${camelName}Schema>;`);
    }

    return parts.join("\n");
  }

  useEffect(() => {
    if (!jsonInput.trim()) {
      setError("");
      setOutput("");
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      setError("");

      const cleanRootName = rootName.trim()
        ? rootName.replace(/[^a-zA-Z0-9_]/g, "")
        : "RootObject";

      if (language === "typescript") {
        setOutput(generateTypeScript(parsed, cleanRootName));
      } else if (language === "zod") {
        setOutput(generateZodSchema(parsed, cleanRootName));
      } else {
        setOutput(generateGoStruct(parsed, cleanRootName));
      }
    } catch (e) {
      setError("Invalid JSON format");
      setOutput("");
    }
  }, [jsonInput, language, rootName, tsMode, exportFields, zodImport, zodInferType, zodOptional]);

  const handleSample = () => {
    setJsonInput(
      JSON.stringify(
        {
          id: 1,
          name: "Sarthak",
          email: "abc@gmail.com",
          isStudent: true,
          skills: ["React", "Node"],
          address: {
            city: "Jaipur",
            country: "India",
          },
        },
        null,
        2
      )
    );
    setError("");
    toast.success("Loaded sample JSON data");
  };

  const handleClear = () => {
    setJsonInput("");
    setOutput("");
    setError("");
    toast.success("Cleared inputs");
  };

  const handleCopy = async () => {
    try {
      if (!output) return;
      await navigator.clipboard.writeText(output);
      toast.success("Copied generated code to clipboard!");
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };
  
  
const handleDownload = () => {
  if (!output) return;

  const extension = language === "typescript" || language === "zod" ? "ts" : "go";

  const cleanRootName = rootName.trim()
    ? rootName.replace(/[^a-zA-Z0-9_]/g, "")
    : "types";

  const filename = `${cleanRootName.toLowerCase()}.${extension}`;

  const blob = new Blob([output], {
    type: "text/plain;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);

  toast.success(`Downloaded ${filename}`);
};
  return (
    <div
      className={`min-h-[calc(100vh-76px)] md:h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto overflow-x-hidden md:overflow-hidden relative flex flex-col justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>JSON to Types & Zod Converter — DevTasks</title>
      <meta
        name="description"
        content="Instantly convert JSON objects into TypeScript interfaces/types, Go structs, or Zod schemas with customizable configurations."
      />

      {/* Background blobs */}
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

      <div
        className={`relative z-10 w-full max-w-5xl md:mx-auto rounded-[32px] border shadow-xl flex flex-col max-h-full md:max-h-[85vh] overflow-hidden transition-all duration-300 ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        {/* Top Accent Line */}
        <div
          className={`h-2 w-full transition-colors duration-500 ${
            dark ? "bg-white" : "bg-black"
          }`}
        />

        {/* Header */}
        <div className="px-5 sm:px-8 pt-6 flex items-center gap-3 w-full min-w-0">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${
              dark
                ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                : "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350"
            }`}
            title="Back to Dev Utilities"
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
          <div className="min-w-0 flex-1">
            <h1
              className={`text-xl sm:text-2xl font-black uppercase tracking-tight transition-colors duration-300 ${
                dark ? "text-white" : "text-black"
              }`}
            >
              JSON → Types & Zod Converter
            </h1>
            <p className={`text-xs font-semibold mt-0.5 ${dark ? "text-zinc-500" : "text-neutral-400"}`}>
              Offline generator for TypeScript interfaces, type aliases, Go structs, and Zod schemas
            </p>
          </div>
        </div>

        {/* Settings Bar */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 sm:px-8 mt-5 border-y transition-colors duration-300 ${
            dark ? "border-zinc-800 bg-zinc-950/20" : "border-neutral-150 bg-neutral-50/50"
          }`}
        >
          {/* Root object name */}
          <div className="flex flex-col gap-1.5">
            <label
              className={`text-[10px] font-black uppercase tracking-widest ${
                dark ? "text-zinc-400" : "text-neutral-500"
              }`}
            >
              Root Object Name
            </label>
            <input
              type="text"
              value={rootName}
              onChange={(e) => setRootName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
              placeholder="e.g. RootObject"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-semibold outline-none transition-all duration-300 ${
                dark
                  ? "bg-zinc-950/60 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white/20"
                  : "bg-white border-neutral-250 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black/5"
              }`}
            />
          </div>

          {/* Target language */}
          <div className="flex flex-col gap-1.5">
            <label
              className={`text-[10px] font-black uppercase tracking-widest ${
                dark ? "text-zinc-400" : "text-neutral-500"
              }`}
            >
              Target Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-semibold outline-none transition-all duration-300 ${
                dark
                  ? "bg-zinc-950/60 border-zinc-800 text-white focus:border-white focus:ring-1 focus:ring-white/20"
                  : "bg-white border-neutral-250 text-black focus:border-black focus:ring-1 focus:ring-black/5"
              }`}
            >
              <option value="typescript">TypeScript</option>
              <option value="go">Go Structs</option>
              <option value="zod">Zod Schema</option>
            </select>
          </div>

          {/* Config options */}
          <div className="flex flex-col gap-1.5">
            {language === "typescript" && (
              <>
                <label
                  className={`text-[10px] font-black uppercase tracking-widest ${
                    dark ? "text-zinc-400" : "text-neutral-500"
                  }`}
                >
                  Output Mode
                </label>
                <select
                  value={tsMode}
                  onChange={(e) => setTsMode(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-semibold outline-none transition-all duration-300 ${
                    dark
                      ? "bg-zinc-950/60 border-zinc-800 text-white focus:border-white focus:ring-1 focus:ring-white/20"
                      : "bg-white border-neutral-250 text-black focus:border-black focus:ring-1 focus:ring-black/5"
                  }`}
                >
                  <option value="interface">interface</option>
                  <option value="type">type alias</option>
                </select>
              </>
            )}
            {language === "go" && (
              <>
                <label
                  className={`text-[10px] font-black uppercase tracking-widest ${
                    dark ? "text-zinc-400" : "text-neutral-500"
                  }`}
                >
                  Struct Visibility
                </label>
                <label
                  className={`flex items-center gap-2.5 h-full px-1 text-xs font-bold uppercase cursor-pointer select-none transition-colors ${
                    dark ? "text-zinc-300 hover:text-white" : "text-neutral-700 hover:text-black"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={exportFields}
                    onChange={(e) => setExportFields(e.target.checked)}
                    className={`rounded transition-all duration-205 focus:ring-0 w-4 h-4 ${
                      dark
                        ? "bg-zinc-950 border-zinc-800 text-white checked:bg-white checked:border-white"
                        : "bg-white border-neutral-250 text-black checked:bg-black checked:border-black"
                    }`}
                  />
                  Export Fields (Upper Camel Case)
                </label>
              </>
            )}
            {language === "zod" && (
              <div className="flex flex-col gap-2">
                <label
                  className={`flex items-center gap-2.5 text-xs font-bold uppercase cursor-pointer select-none transition-colors ${
                    dark ? "text-zinc-300 hover:text-white" : "text-neutral-700 hover:text-black"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={zodImport}
                    onChange={(e) => setZodImport(e.target.checked)}
                    className={`rounded transition-all duration-205 focus:ring-0 w-4 h-4 ${
                      dark
                        ? "bg-zinc-950 border-zinc-800 text-white checked:bg-white checked:border-white"
                        : "bg-white border-neutral-250 text-black checked:bg-black checked:border-black"
                    }`}
                  />
                  Prepend Zod Import
                </label>
                <label
                  className={`flex items-center gap-2.5 text-xs font-bold uppercase cursor-pointer select-none transition-colors ${
                    dark ? "text-zinc-300 hover:text-white" : "text-neutral-700 hover:text-black"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={zodInferType}
                    onChange={(e) => setZodInferType(e.target.checked)}
                    className={`rounded transition-all duration-205 focus:ring-0 w-4 h-4 ${
                      dark
                        ? "bg-zinc-950 border-zinc-800 text-white checked:bg-white checked:border-white"
                        : "bg-white border-neutral-250 text-black checked:bg-black checked:border-black"
                    }`}
                  />
                  Generate Type Inference
                </label>
                <label
                  className={`flex items-center gap-2.5 text-xs font-bold uppercase cursor-pointer select-none transition-colors ${
                    dark ? "text-zinc-300 hover:text-white" : "text-neutral-700 hover:text-black"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={zodOptional}
                    onChange={(e) => setZodOptional(e.target.checked)}
                    className={`rounded transition-all duration-205 focus:ring-0 w-4 h-4 ${
                      dark
                        ? "bg-zinc-950 border-zinc-800 text-white checked:bg-white checked:border-white"
                        : "bg-white border-neutral-250 text-black checked:bg-black checked:border-black"
                    }`}
                  />
                  Make All Fields Optional
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Editor Columns */}
        <div className="flex-1 min-h-0 p-5 sm:p-8 overflow-y-auto">
          <div className="w-full h-full flex flex-col md:flex-row gap-6">
            
            {/* Input pane */}
            <div className="group w-full md:w-1/2 flex flex-col space-y-2.5 h-full">
              <div className="flex items-center justify-between">
                <label
                  className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                    dark
                      ? "text-zinc-400 group-focus-within:text-white"
                      : "text-neutral-500 group-focus-within:text-black"
                  }`}
                >
                  Input JSON
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSample}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 active:scale-95 ${
                      dark
                        ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                        : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-black"
                    }`}
                  >
                    Sample
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 active:scale-95 ${
                      dark
                        ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-red-950/20 hover:border-red-900 hover:text-red-400"
                        : "bg-white border-neutral-200 text-neutral-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                    }`}
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="relative flex-1 min-h-0">
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder="Paste or type raw JSON here..."
                  className={`w-full h-72 md:h-full rounded-2xl border p-4 font-mono text-xs leading-relaxed resize-none outline-none transition-all duration-300 ${
                    dark
                      ? "bg-zinc-950/60 border-zinc-800 text-zinc-200 placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white/10"
                      : "bg-neutral-50/50 border-neutral-250 text-zinc-800 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black/5"
                  }`}
                />
                {error && (
                  <div
                    className={`absolute bottom-3 left-3 right-3 px-3.5 py-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${
                      dark
                        ? "bg-red-950/40 border-red-900/50 text-red-400"
                        : "bg-red-50 border-red-200 text-red-600"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Output pane */}
            <div className="group w-full md:w-1/2 flex flex-col space-y-2.5 h-full">
              <div className="flex items-center justify-between">
                <label
                  className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                    dark ? "text-zinc-400" : "text-neutral-500"
                  }`}
                >
                  Generated {language === "typescript" ? "TypeScript" : language === "zod" ? "Zod Schema" : "Go Structs"}
                </label>
                <div className="flex gap-2">
                  <div className="flex gap-2">
  <button
    onClick={handleCopy}
    className="border rounded px-4 py-2"
  >
    Copy
  </button>

  
</div>
                  <button
  onClick={handleDownload}
  className="border rounded px-4 py-2"
>
  Download
</button>
                </div>
              </div>

              <div className="flex-1 min-h-0 relative">
                <pre
                  className={`w-full h-72 md:h-full rounded-2xl border p-4 font-mono text-xs leading-relaxed overflow-auto transition-colors duration-300 ${
                    dark
                      ? "bg-zinc-950/40 border-zinc-850 text-indigo-300"
                      : "bg-neutral-50/30 border-neutral-200 text-indigo-900"
                  }`}
                >
                  {output ? (
                    <code className={dark ? "text-zinc-200" : "text-zinc-800"}>{output}</code>
                  ) : (
                    <span className={dark ? "text-zinc-600" : "text-neutral-400"}>
                      No output generated yet...
                    </span>
                  )}
                </pre>
                
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}