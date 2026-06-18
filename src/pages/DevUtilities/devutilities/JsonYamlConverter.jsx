import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import yaml from "js-yaml";
import { useTheme } from "../../../context/ThemeContext";

const JsonYamlConverter = () => {
  const { dark } = useTheme();

  const [jsonText, setJsonText] = useState("");
  const [yamlText, setYamlText] = useState("");

  const [jsonError, setJsonError] = useState("");
  const [yamlError, setYamlError] = useState("");

  const handleJsonChange = (value) => {
    setJsonText(value);
    setJsonError("");

    if (!value.trim()) {
      setYamlText("");
      return;
    }

    try {
      const parsed = JSON.parse(value);
      setYamlText(yaml.dump(parsed));
    } catch (err) {
      setJsonError(err.message);
    }
  };

  const handleYamlChange = (value) => {
    setYamlText(value);
    setYamlError("");

    if (!value.trim()) {
      setJsonText("");
      return;
    }

    try {
      const parsed = yaml.load(value);
      setJsonText(JSON.stringify(parsed, null, 2));
    } catch (err) {
      setYamlError(err.message);
    }
  };

  const handleSample = () => {
    const sample = {
      app: {
        name: "DevTasks",
        version: "1.0.0",
        debug: true,
      },
      database: {
        host: "localhost",
        port: 5432,
      },
      features: ["json", "yaml", "regex", "uuid"],
      limits: {
        requestsPerMinute: 100,
        timeout: 5000,
      },
    };

    const formattedJson = JSON.stringify(sample, null, 2);

    setJsonText(formattedJson);
    setYamlText(yaml.dump(sample));

    setJsonError("");
    setYamlError("");
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setJsonError("");
      toast.success("JSON formatted");
    } catch (err) {
      setJsonError(err.message);
      toast.error("Invalid JSON");
    }
  };

  const handleClear = () => {
    setJsonText("");
    setYamlText("");
    setJsonError("");
    setYamlError("");
  };

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copied`);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div
      className={`min-h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto relative flex flex-col ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>JSON ↔ YAML Converter — DevTasks</title>

      <div
        className={`absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-30 ${
          dark ? "bg-zinc-800" : "bg-neutral-200"
        }`}
      />

      <div
        className={`absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-30 ${
          dark ? "bg-zinc-900" : "bg-neutral-100"
        }`}
      />

      <div
        className={`relative z-10 w-full max-w-6xl mx-auto rounded-[32px] border shadow-xl flex flex-col max-h-[85vh] overflow-hidden ${
          dark
            ? "bg-zinc-900 border-zinc-800"
            : "bg-white border-neutral-200"
        }`}
      >
        <div className={`h-2 w-full ${dark ? "bg-white" : "bg-black"}`} />

        <div className="px-5 sm:px-8 pt-6 sm:pt-8 flex items-center gap-3">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${
              dark
                ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                : "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350"
            }`}
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
            className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${
              dark ? "text-white" : "text-black"
            }`}
          >
            JSON ↔ YAML Converter
          </h1>
        </div>

        <div className="p-5 sm:p-8 overflow-y-auto flex-1">
          <div className="flex flex-wrap justify-end gap-3 mb-6">
            <button
              onClick={handleSample}
              className={`px-4 py-2 rounded-xl font-bold text-sm border cursor-pointer ${
                dark
                  ? "border-white text-white hover:bg-white hover:text-black"
                  : "border-black text-black hover:bg-black hover:text-white"
              }`}
            >
              Sample
            </button>

            <button
              onClick={handleFormat}
              className={`px-4 py-2 rounded-xl font-bold text-sm border cursor-pointer ${
                dark
                  ? "border-white text-white hover:bg-white hover:text-black"
                  : "border-black text-black hover:bg-black hover:text-white"
              }`}
            >
              Format JSON
            </button>

            <button
              onClick={handleClear}
              className={`px-4 py-2 rounded-xl font-bold text-sm border cursor-pointer ${
                dark
                  ? "border-white text-white hover:bg-white hover:text-black"
                  : "border-black text-black hover:bg-black hover:text-white"
              }`}
            >
              Clear
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h3
                  className={`font-black uppercase text-sm ${
                    dark ? "text-white" : "text-black"
                  }`}
                >
                  JSON
                </h3>

                <button
                  onClick={() => handleCopy(jsonText, "JSON")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                    dark
                      ? "border-white text-white hover:bg-white hover:text-black"
                      : "border-black text-black hover:bg-black hover:text-white"
                  }`}
                >
                  Copy
                </button>
              </div>

              <textarea
                value={jsonText}
                onChange={(e) => handleJsonChange(e.target.value)}
                placeholder='{"name":"DevTasks"}'
                className={`h-80 px-4 py-3 rounded-2xl border text-sm outline-none resize-none ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-white"
                    : "bg-neutral-50 border-neutral-300 text-black"
                }`}
              />

              {jsonError && (
                <div className="mt-2 text-sm text-red-500 break-words">
                  {jsonError}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h3
                  className={`font-black uppercase text-sm ${
                    dark ? "text-white" : "text-black"
                  }`}
                >
                  YAML
                </h3>

                <button
                  onClick={() => handleCopy(yamlText, "YAML")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                    dark
                      ? "border-white text-white hover:bg-white hover:text-black"
                      : "border-black text-black hover:bg-black hover:text-white"
                  }`}
                >
                  Copy
                </button>
              </div>

              <textarea
                value={yamlText}
                onChange={(e) => handleYamlChange(e.target.value)}
                placeholder="name: DevTasks"
                className={`h-80 px-4 py-3 rounded-2xl border text-sm outline-none resize-none ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-white"
                    : "bg-neutral-50 border-neutral-300 text-black"
                }`}
              />

              {yamlError && (
                <div className="mt-2 text-sm text-red-500 break-words">
                  {yamlError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonYamlConverter;