import { useState } from "react";
import { toast } from "sonner";

export default function Base64Url() {
  const [mode, setMode] = useState("base64");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const encode = () => {
    try {
      if (mode === "base64") setOutput(btoa(input));
      else setOutput(encodeURIComponent(input));
    } catch { toast.error("Encode failed"); }
  };

  const decode = () => {
    try {
      if (mode === "base64") setOutput(atob(input));
      else setOutput(decodeURIComponent(input));
    } catch { toast.error("Decode failed"); }
  };

  return (
    <div className="p-4">
      <h1>Base64 & URL Converter</h1>
      <div>
        <button onClick={() => setMode("base64")}>Base64</button>
        <button onClick={() => setMode("url")}>URL</button>
      </div>
      <textarea rows="4" value={input} onChange={e => setInput(e.target.value)} />
      <textarea rows="4" value={output} readOnly />
      <button onClick={encode}>Encode</button>
      <button onClick={decode}>Decode</button>
      <button onClick={() => { setInput(""); setOutput(""); }}>Clear</button>
      <button onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied!"); }}>Copy</button>
    </div>
  );
}import { useState } from "react";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

export default function Base64Url() {
  const { dark } = useTheme();
  const [mode, setMode] = useState("base64");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const encode = () => {
    try {
      if (mode === "base64") setOutput(btoa(input));
      else setOutput(encodeURIComponent(input));
    } catch { toast.error("Encode failed"); }
  };

  const decode = () => {
    try {
      if (mode === "base64") setOutput(atob(input));
      else setOutput(decodeURIComponent(input));
    } catch { toast.error("Decode failed"); }
  };

  return (
    <div className={`min-h-screen p-4 sm:p-6 font-medium ${dark ? "bg-zinc-950" : "bg-[#FDFDFD]"}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${dark ? "text-white" : "text-zinc-900"}`}>
            Base64 & URL Converter
          </h1>
          <button
            onClick={() => window.history.back()}
            className={`px-4 py-2 rounded ${dark ? "bg-zinc-800 text-white" : "bg-gray-200 text-black"}`}
          >
            Back
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setMode("base64")}
            className={`px-4 py-2 rounded ${mode === "base64" ? "bg-blue-600 text-white" : dark ? "bg-zinc-800 text-gray-300" : "bg-gray-200 text-gray-700"}`}
          >
            Base64
          </button>
          <button
            onClick={() => setMode("url")}
            className={`px-4 py-2 rounded ${mode === "url" ? "bg-blue-600 text-white" : dark ? "bg-zinc-800 text-gray-300" : "bg-gray-200 text-gray-700"}`}
          >
            URL
          </button>
        </div>

        <textarea
          className={`w-full p-3 rounded mb-4 ${dark ? "bg-zinc-800 text-white border-zinc-700" : "bg-white text-black border-gray-300"} border`}
          rows="6"
          placeholder="Enter text to encode/decode..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <textarea
          className={`w-full p-3 rounded mb-4 ${dark ? "bg-zinc-800 text-white border-zinc-700" : "bg-white text-black border-gray-300"} border`}
          rows="6"
          placeholder="Output will appear here..."
          value={output}
          readOnly
        />

        <div className="flex gap-3 flex-wrap">
          <button onClick={encode} className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700">Encode</button>
          <button onClick={decode} className="px-5 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">Decode</button>
          <button onClick={() => { setInput(""); setOutput(""); }} className="px-5 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Clear</button>
          <button onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied!"); }} className="px-5 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Copy</button>
        </div>
      </div>
    </div>
  );
}