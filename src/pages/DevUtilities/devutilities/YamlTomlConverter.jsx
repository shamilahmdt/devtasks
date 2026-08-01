import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const YamlTomlConverter = () => {
  const { dark } = useTheme();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("yaml-to-toml");

  const parseYaml = (yamlStr) => {
    const lines = yamlStr.split("\n");
    const result = {};
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const colonIndex = trimmed.indexOf(":");
      if (colonIndex === -1) continue;
      const key = trimmed.slice(0, colonIndex).trim();
      const value = trimmed.slice(colonIndex + 1).trim();
      if (key) result[key] = value;
    }
    return result;
  };

  const objectToToml = (obj) => {
    return Object.entries(obj)
      .map(([key, value]) => {
        if (value === "" || value === null || value === undefined) return `${key} = ""`;
        const num = Number(value);
        if (!isNaN(num) && value !== "") return `${key} = ${num}`;
        if (value === "true" || value === "false") return `${key} = ${value}`;
        return `${key} = "${value}"`;
      })
      .join("\n");
  };

  const parseToml = (tomlStr) => {
    const lines = tomlStr.split("\n");
    const result = {};
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      if (key) result[key] = value;
    }
    return result;
  };

  const objectToYaml = (obj) => {
    return Object.entries(obj)
      .map(([key, value]) => {
        if (value === "" || value === null || value === undefined) return `${key}: ""`;
        const num = Number(value);
        if (!isNaN(num) && value !== "") return `${key}: ${num}`;
        if (value === "true" || value === "false") return `${key}: ${value}`;
        return `${key}: ${value}`;
      })
      .join("\n");
  };

  const handleConvert = () => {
    if (!input.trim()) return;
    try {
      if (mode === "yaml-to-toml") {
        const parsed = parseYaml(input);
        setOutput(objectToToml(parsed));
      } else {
        const parsed = parseToml(input);
        setOutput(objectToYaml(parsed));
      }
    } catch {
      toast.error("Invalid input. Please check your syntax.");
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  const handleSample = () => {
    if (mode === "yaml-to-toml") {
      setInput(`name: my-app\nversion: 1.0.0\ndebug: true\nport: 8080\nauthor: Habtamu`);
    } else {
      setInput(`name = "my-app"\nversion = "1.0.0"\ndebug = true\nport = 8080\nauthor = "Habtamu"`);
    }
    setOutput("");
  };

  const handleCopy = async () => {
    try {
      if (!output) return;
      await navigator.clipboard.writeText(output);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div
      className={`min-h-[calc(100vh-76px)] md:h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto overflow-x-hidden md:overflow-hidden relative flex flex-col justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>YAML ↔ TOML Converter — DevTasks</title>
      <meta name="description" content="Convert between YAML and TOML configuration formats completely offline." />

      <div className={`absolute top-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-30 transition-colors duration-500 ${dark ? "bg-zinc-800" : "bg-neutral-200"}`} />
      <div className={`absolute bottom-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-30 transition-colors duration-500 ${dark ? "bg-zinc-900" : "bg-neutral-100"}`} />

      <div className={`relative z-10 w-full max-w-5xl md:mx-auto rounded-[32px] border shadow-xl flex flex-col max-h-full md:max-h-[85vh] overflow-hidden transition-all duration-300 ${dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"}`}>
        <div className={`h-2 w-full transition-colors duration-500 ${dark ? "bg-white" : "bg-black"}`} />

        {/* Header */}
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 flex items-center gap-3 w-full min-w-0">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${dark ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600" : "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350"}`}
            title="Back to Workspace"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className={`text-xl sm:text-2xl font-black uppercase tracking-tight transition-colors duration-300 min-w-0 flex-1 ${dark ? "text-white" : "text-black"}`}>
            YAML ↔ TOML Converter
          </h1>
        </div>

        {/* Mode Toggle */}
        <div className="px-5 sm:px-8 pt-4 flex gap-3">
          {["yaml-to-toml", "toml-to-yaml"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); handleClear(); }}
              type="button"
              className={`px-4 py-2 rounded-xl border font-bold text-sm transition-all duration-300 active:scale-95 ${
                mode === m
                  ? dark ? "bg-white text-black border-white" : "bg-black text-white border-black"
                  : dark ? "border-zinc-700 text-zinc-400 hover:border-white hover:text-white" : "border-neutral-300 text-neutral-500 hover:border-black hover:text-black"
              }`}
            >
              {m === "yaml-to-toml" ? "YAML → TOML" : "TOML → YAML"}
            </button>
          ))}
        </div>

        <div className="w-full md:h-[420px] p-5 sm:p-8 overflow-y-auto">
          <div className="w-full h-full flex flex-col md:flex-row gap-4">

            {/* Input */}
            <div className="group w-full flex flex-col space-y-2">
              <div className="flex items-center justify-between h-8">
                <label className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${dark ? "text-zinc-400 group-focus-within:text-white" : "text-neutral-500 group-focus-within:text-black"}`}>
                  {mode === "yaml-to-toml" ? "YAML Input" : "TOML Input"}
                </label>
                <button
                  type="button"
                  onClick={handleSample}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-300 ${dark ? "bg-white text-black border-white hover:bg-zinc-200" : "bg-black text-white border-black hover:bg-zinc-800"}`}
                >
                  Sample
                </button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === "yaml-to-toml" ? "Paste YAML here..." : "Paste TOML here..."}
                className={`md:h-full h-40 px-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 resize-none font-mono ${dark ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white" : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"}`}
              />
              <div className="grid grid-cols-2 gap-3">
                {[{ label: "Convert", onClick: handleConvert }, { label: "Clear", onClick: handleClear }].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={btn.onClick}
                    type="button"
                    className={`w-full px-4 py-2 rounded-xl border font-bold text-sm text-center transition-all duration-300 active:scale-95 ${dark ? "border-white text-white hover:bg-white hover:text-black" : "border-black text-black hover:bg-black hover:text-white"}`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Output */}
            <div className="group w-full flex flex-col space-y-2">
              <div className="flex items-center h-8">
                <label className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${dark ? "text-zinc-400 group-focus-within:text-white" : "text-neutral-500 group-focus-within:text-black"}`}>
                  {mode === "yaml-to-toml" ? "TOML Output" : "YAML Output"}
                </label>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="Output will appear here..."
                className={`md:h-full h-40 px-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 resize-none font-mono ${dark ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700" : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400"}`}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleCopy}
                  type="button"
                  className={`w-40 px-4 py-2 rounded-xl border font-bold text-sm text-center transition-all duration-300 active:scale-95 ${dark ? "border-white text-white hover:bg-white hover:text-black" : "border-black text-black hover:bg-black hover:text-white"}`}
                >
                  Copy
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default YamlTomlConverter;