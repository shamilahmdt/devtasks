import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

const Base64Url = () => {
  const { dark } = useTheme();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("base64");
  const [error, setError] = useState("");

  const handleEncode = () => {
    setError("");
    try {
      if (mode === "base64") {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(encodeURIComponent(input));
      }
    } catch (e) {
      setError("Encoding failed: " + e.message);
    }
  };

  const handleDecode = () => {
    setError("");
    try {
      if (mode === "base64") {
        setOutput(decodeURIComponent(escape(atob(input))));
      } else {
        setOutput(decodeURIComponent(input));
      }
    } catch (e) {
      setError("Decoding failed: invalid input.");
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const handleCopy = () => {
    if (output) navigator.clipboard.writeText(output);
  };

  const theme = {
    light: { wrapper: "bg-[#FDFDFD]", card: "bg-white border-neutral-100", label: "text-zinc-500", textarea: "bg-neutral-50 border-neutral-200 text-zinc-800", outputArea: "bg-neutral-100 border-neutral-200 text-zinc-600", btn: "bg-white border-neutral-200 text-zinc-600 hover:text-black hover:border-neutral-400", toggle: "bg-neutral-100 border-neutral-200", activeToggle: "bg-black text-white", nav: "border-neutral-100 text-neutral-500 hover:text-black" },
    dark: { wrapper: "bg-zinc-950", card: "bg-zinc-900 border-zinc-700", label: "text-zinc-400", textarea: "bg-zinc-950 border-zinc-800 text-zinc-200", outputArea: "bg-zinc-900/50 border-zinc-800 text-zinc-300", btn: "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500", toggle: "bg-zinc-800 border-zinc-700", activeToggle: "bg-white text-black", nav: "border-zinc-800 text-neutral-400 hover:text-white" },
  };
  const t = dark ? theme.dark : theme.light;

  return (
    <div className={`min-h-screen p-4 sm:p-6 font-sans antialiased transition-colors duration-300 overflow-x-hidden ${t.wrapper}`}>
      <title>Base64 & URL Converter | DevTasks</title>
      <meta name="description" content="Offline Base64 and URL encoding/decoding utility tool." />

      <div className={`w-[90%] max-w-6xl mx-auto rounded-3xl sm:rounded-4xl shadow-lg p-4 sm:p-8 border transition-colors duration-300 ${t.card}`}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className={`text-2xl sm:text-3xl font-black uppercase ${dark ? "text-white" : "text-black"}`}>
            Base64 & URL Converter
          </h1>
          {/* Mode toggle */}
          <div className={`flex rounded-xl border overflow-hidden text-xs font-black uppercase tracking-widest ${t.toggle}`}>
            {["base64", "url"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setOutput(""); setError(""); }}
                className={`px-4 py-2 transition-colors ${mode === m ? t.activeToggle : ""}`}>
                {m === "base64" ? "Base64" : "URL"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6">
          {/* Input */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <label className={`text-xs font-black uppercase tracking-widest ${t.label}`}>Input</label>
              <button onClick={handleClear} className={`text-xs font-bold transition-colors ${dark ? "text-zinc-500 hover:text-white" : "text-zinc-400 hover:text-black"}`}>
                Clear
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`w-full h-64 p-4 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors ${t.textarea}`}
              placeholder={mode === "base64" ? "Enter text or Base64 here" : "Enter text or URL-encoded string"}
            />
          </div>

          {/* Output */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <label className={`text-xs font-black uppercase tracking-widest ${t.label}`}>Output</label>
              <button onClick={handleCopy} className={`text-xs font-bold transition-colors ${dark ? "text-zinc-500 hover:text-white" : "text-zinc-400 hover:text-black"}`}>
                Copy
              </button>
            </div>
            <textarea
              readOnly
              value={output}
              className={`w-full h-64 p-4 rounded-xl border resize-none focus:outline-none transition-colors ${t.outputArea}`}
              placeholder="Result will appear here..."
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-xs font-bold mb-4 text-center">{error}</p>}

        <div className="flex flex-wrap justify-center gap-4">
          {[["Encode", handleEncode], ["Decode", handleDecode]].map(([label, handler]) => (
            <button key={label} onClick={handler}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${t.btn}`}>
              {label}
            </button>
          ))}
        </div>

        <div className={`mt-12 border-t pt-6 ${dark ? "border-zinc-800" : "border-neutral-100"}`}>
          <Link to="/devutilities"
            className={`inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-300 ${t.nav}`}>
            <span>←</span><span>Back to Workspace</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Base64Url;
