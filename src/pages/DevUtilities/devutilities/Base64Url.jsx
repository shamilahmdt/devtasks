import { useState } from "react";
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
      toast.success("Encoded successfully");
    } catch { toast.error("Encoding failed"); }
  };

  const decode = () => {
    try {
      if (mode === "base64") setOutput(atob(input));
      else setOutput(decodeURIComponent(input));
      toast.success("Decoded successfully");
    } catch { toast.error("Decoding failed"); }
  };

  return (
    <div className={`min-h-screen p-4 sm:p-6 font-medium ${dark ? "bg-zinc-950" : "bg-[#FDFDFD]"}`}>
      <div className="max-w-6xl mx-auto">
        <h1 className={`text-2xl font-bold mb-6 ${dark ? "text-white" : "text-zinc-900"}`}>
          Base64 & URL Converter
        </h1>
        <div className="flex gap-4 mb-6">
          <button onClick={() => setMode("base64")} className={`px-4 py-2 rounded ${mode === "base64" ? "bg-blue-600 text-white" : "bg-gray-300"}`}>Base64</button>
          <button onClick={() => setMode("url")} className={`px-4 py-2 rounded ${mode === "url" ? "bg-blue-600 text-white" : "bg-gray-300"}`}>URL</button>
        </div>
        <textarea rows={4} className="w-full p-2 border rounded mb-2" value={input} onChange={e => setInput(e.target.value)} />
        <textarea rows={4} className="w-full p-2 border rounded mb-4" value={output} readOnly />
        <div className="flex gap-2">
          <button onClick={encode} className="px-4 py-2 bg-green-600 text-white rounded">Encode</button>
          <button onClick={decode} className="px-4 py-2 bg-yellow-600 text-white rounded">Decode</button>
          <button onClick={() => { setInput(""); setOutput(""); toast.info("Cleared"); }} className="px-4 py-2 bg-gray-600 text-white rounded">Clear</button>
          <button onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied!"); }} className="px-4 py-2 bg-purple-600 text-white rounded">Copy</button>
        </div>
      </div>
    </div>
  );
}