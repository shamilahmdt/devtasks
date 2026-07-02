import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
useEffect(() => {
  try {
    const parsed = JSON.parse(jsonInput);

    setError("");

    if (language === "typescript") {
  setOutput(generateTypeScript(parsed, rootName));
} else {
  setOutput(generateGoStruct(parsed, rootName));
}
  } catch {
    setError("Invalid JSON");

    setOutput("");
  }
}, [jsonInput, language, rootName, tsMode, exportFields]);
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

  return interfaces;
}
function generateGoStruct(obj, name) {
  let structs = "";

  function parse(current, structName) {
    let body = "";

    Object.entries(current).forEach(([key, value]) => {

      const field = exportFields
        ? key.charAt(0).toUpperCase() + key.slice(1)
        : key;

      // Array
      if (Array.isArray(value)) {

        if (value.length > 0 && typeof value[0] === "object") {

          const child =
            key.charAt(0).toUpperCase() + key.slice(1);

          parse(value[0], child);

          body += `    ${field} []${child} \`json:"${key}"\`\n`;

        } else {

          body += `    ${field} ${goType(value)} \`json:"${key}"\`\n`;

        }

      }

      // Nested Object
      else if (
        typeof value === "object" &&
        value !== null
      ) {

        const child =
          key.charAt(0).toUpperCase() + key.slice(1);

        parse(value, child);

        body += `    ${field} ${child} \`json:"${key}"\`\n`;

      }

      // Primitive
      else {

        body += `    ${field} ${goType(value)} \`json:"${key}"\`\n`;

      }

    });

    structs += `type ${structName} struct {\n${body}}\n\n`;
  }

  parse(obj, name);

  return structs;
}
function goType(value) {
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]interface{}";

    if (typeof value[0] === "object") {
      return "[]Item";
    }

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

  return (
  <div
    className={`min-h-screen p-6 ${
      dark ? "bg-zinc-950 text-white" : "bg-white text-black"
    }`}
  >
    <Link
      to="/devutilities"
      className="inline-block mb-6 px-4 py-2 rounded-xl border"
    >
      ← Back
    </Link>

    <h1 className="text-3xl font-bold">
      JSON → TypeScript & Go Converter
    </h1>

    <p className="opacity-70 mt-2">
      Convert JSON into TypeScript interfaces or Go structs.
    </p>

    <div className="grid lg:grid-cols-2 gap-6 mt-8">

      {/* LEFT PANEL */}
      <div
        className={`rounded-xl border p-5 ${
          dark
            ? "bg-zinc-900 border-zinc-700"
            : "bg-white border-zinc-300"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">
          JSON Input
        </h2>
<div className="flex gap-3 mb-4">

  <input
    value={rootName}
    onChange={(e) => setRootName(e.target.value)}
    placeholder="Root Name"
    className={`px-3 py-2 rounded border ${
      dark
        ? "bg-zinc-950 border-zinc-700"
        : "bg-white border-zinc-300"
    }`}
  />
<button
  onClick={() =>
    setJsonInput(`{
  "id": 1,
  "name": "Sarthak",
  "email": "abc@gmail.com",
  "isStudent": true,
  "skills": ["React", "Node"],
  "address": {
    "city": "Jaipur",
    "country": "India"
  }
}`)
  }
  className={`px-3 py-2 rounded border ${
    dark
      ? "bg-zinc-950 border-zinc-700"
      : "bg-white border-zinc-300"
  }`}
>
  Sample
</button>
  <select
    value={language}
    onChange={(e) => setLanguage(e.target.value)}
    className={`px-3 py-2 rounded border ${
      dark
        ? "bg-zinc-950 border-zinc-700"
        : "bg-white border-zinc-300"
    }`}
  >

    <option value="typescript">TypeScript</option>
    <option value="go">Go</option>
  </select>
  {language === "typescript" && (
  <select
    value={tsMode}
    onChange={(e) => setTsMode(e.target.value)}
    className={`px-3 py-2 rounded border ${
      dark
        ? "bg-zinc-950 border-zinc-700"
        : "bg-white border-zinc-300"
    }`}
  >
    <option value="interface">Interface</option>
    <option value="type">Type Alias</option>
  </select>
)}
{language === "go" && (
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={exportFields}
      onChange={(e) => setExportFields(e.target.checked)}
    />
    Export Fields
  </label>
)}
  {error && (
  <p className="text-red-500 mt-3 font-medium">
    {error}
  </p>
)}

</div>
        <textarea
  value={jsonInput}
  onChange={(e) => setJsonInput(e.target.value)}
  className={`w-full h-96 rounded-lg border p-4 font-mono ${
    dark
      ? "bg-zinc-950 border-zinc-700"
      : "bg-zinc-50 border-zinc-300"
  }`}
/>
      </div>

      {/* RIGHT PANEL */}
      <div
        className={`rounded-xl border p-5 ${
          dark
            ? "bg-zinc-900 border-zinc-700"
            : "bg-white border-zinc-300"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">
          Generated Types
        </h2>
<button
  onClick={() => navigator.clipboard.writeText(output)}
  className={`mb-4 px-4 py-2 rounded border ${
    dark
      ? "bg-zinc-950 border-zinc-700"
      : "bg-white border-zinc-300"
  }`}
>
  Copy
</button>
        <pre
          className={`rounded-lg p-4 h-96 overflow-auto ${
            dark
              ? "bg-zinc-950"
              : "bg-zinc-100"
          }`}
        >
{output || "No output yet..."}
        </pre>
      </div>

    </div>
  </div>
);
}