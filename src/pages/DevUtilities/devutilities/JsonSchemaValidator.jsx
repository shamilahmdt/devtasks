import { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { toast } from "sonner";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { Link } from "react-router-dom";

const JsonSchemaValidator = () => {
  const { dark } = useTheme();

  // LEFT = SCHEMA
  const [schemaInput, setSchemaInput] = useState("");

  // RIGHT = JSON
  const [jsonInput, setJsonInput] = useState("");

  const [result, setResult] = useState("");

  const ajv = new Ajv({
    allErrors: true,
    strict: false,
  });

  addFormats(ajv);

  const validateJSON = () => {
    try {
      if (!jsonInput.trim() || !schemaInput.trim()) {
        toast.error("Both JSON and Schema are required");
        return;
      }

      const schemaData = JSON.parse(schemaInput);
      const jsonData = JSON.parse(jsonInput);

      const validate = ajv.compile(schemaData);

      const valid = validate(jsonData);

      if (valid) {
        setResult("✅ JSON is VALID");
        toast.success("JSON is valid");
      } else {
        const errorMsg = ajv.errorsText(validate.errors, {
          separator: "\n",
        });

        setResult("❌ Invalid JSON:\n" + errorMsg);
        toast.error("Invalid JSON");
      }
    } catch (err) {
      setResult("❌ Error: " + err.message);
      toast.error("Invalid JSON or Schema format");
    }
  };

  const handleClear = () => {
    setSchemaInput("");
    setJsonInput("");
    setResult("");
  };

  const handleSample = () => {
    const sampleSchema = {
      type: "object",

      required: ["name", "age", "email", "isStudent"],

      properties: {
        name: {
          type: "string",
          minLength: 2,
        },

        age: {
          type: "integer",
          minimum: 18,
          maximum: 100,
        },

        email: {
          type: "string",
          format: "email",
        },

        isStudent: {
          type: "boolean",
        },
      },

      additionalProperties: false,
    };

    const sampleJson = {
      name: "Rahul",
      age: 22,
      email: "rahul@gmail.com",
      isStudent: true,
    };

    setSchemaInput(JSON.stringify(sampleSchema, null, 2));
    setJsonInput(JSON.stringify(sampleJson, null, 2));
    setResult("");
  };

  return (
    <div
      className={`min-h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 relative flex items-center justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      {/* Background */}
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

      {/* Card */}
      <div
        className={`relative z-10 w-full max-w-6xl rounded-[32px] border shadow-xl overflow-hidden ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        {/* Top Bar */}
        <div className={`h-2 w-full ${dark ? "bg-white" : "bg-black"}`} />

        {/* Header */}
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
              JSON Schema Validator
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSample}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                dark
                  ? "bg-white text-black border-white hover:bg-zinc-200"
                  : "bg-black text-white border-black hover:bg-zinc-800"
              }`}
            >
              Sample
            </button>

            <button
              onClick={handleClear}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                dark
                  ? "border-zinc-700 text-white hover:bg-zinc-800"
                  : "border-neutral-300 text-black hover:bg-neutral-100"
              }`}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SCHEMA */}
            <div className="flex flex-col gap-2">
              <label
                className={`text-xs font-black uppercase tracking-widest ${
                  dark ? "text-zinc-400" : "text-neutral-500"
                }`}
              >
                JSON Schema
              </label>

              <textarea
                value={schemaInput}
                onChange={(e) => setSchemaInput(e.target.value)}
                placeholder='{"type":"object"}'
                className={`h-[420px] px-4 py-3 rounded-2xl border text-sm resize-none outline-none font-mono ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white"
                    : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black"
                }`}
              />
            </div>

            {/* JSON INPUT */}
            <div className="flex flex-col gap-2">
              <label
                className={`text-xs font-black uppercase tracking-widest ${
                  dark ? "text-zinc-400" : "text-neutral-500"
                }`}
              >
                JSON Input
              </label>

              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"name":"Rahul"}'
                className={`h-[420px] px-4 py-3 rounded-2xl border text-sm resize-none outline-none font-mono ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white"
                    : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black"
                }`}
              />
            </div>
          </div>

          {/* Validate Button */}
          <button
            onClick={validateJSON}
            className={`mt-6 w-full py-3 rounded-2xl border text-sm font-black transition-all active:scale-[0.99] ${
              dark
                ? "border-white text-white hover:bg-white hover:text-black"
                : "border-black text-black hover:bg-black hover:text-white"
            }`}
          >
            Validate JSON
          </button>

          {/* Result */}
          {result && (
            <div
              className={`mt-5 p-4 rounded-2xl border whitespace-pre-wrap break-words text-sm ${
                dark
                  ? "bg-zinc-950 border-zinc-700 text-white"
                  : "bg-neutral-50 border-neutral-300 text-black"
              }`}
            >
              {result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JsonSchemaValidator;
