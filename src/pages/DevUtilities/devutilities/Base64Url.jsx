import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const Base64Url = () => {
  const { dark } = useTheme();
  const [mode, setMode] = useState("base64");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleEncode = () => {
    try {
      if (mode === "base64") {
        setOutput(btoa(input));
      } else {
        setOutput(encodeURIComponent(input));
      }
      toast.success("Encoded successfully");
    } catch {
      toast.error("Encoding failed");
    }
  };

  const handleDecode = () => {
    try {
      if (mode === "base64") {
        setOutput(atob(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
      toast.success("Decoded successfully");
    } catch {
      toast.error("Decoding failed");
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    toast.info("Cleared");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className={`min-h-screen p-4 sm:p-6 font-medium ${dark ? "bg-zinc-950" : "bg-[#FDFDFD]"}`}>
      <title>Base64 & URL Converter | DevTasks</title>
      <meta name="description" content="Offline Base64 and URL encoding/decoding utility tool." />
      
      <div className="flex justify-between items-center mb-6">
        <Link to="/devutilities" className="inline-flex items-center gap-2">
          <span className={`${dark ? "text-neutral-400" : "text-neutral-600"}`}>← Back</span>
        </Link>
        <h1 className={`text-2xl font-bold ${dark ? "text-white" : "text-zinc-900"}`}>
          Base64 & URL Converter
        </h1>
        <div className="w-16"></div>
      </div>

      <div className={`w-full max-w-6xl mx-auto rounded-2xl shadow-lg p-6 border transition-colors ${dark ? "bg-zinc-900 border-zinc-700" : "bg-white border-neutral-100"}`}>
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setMode("base64")}
            className={`px-5 py-2 rounded-lg font-medium transition-colors ${
              mode === "base64"
                ? "bg-blue-600 text-white"
                : dark
                ? "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Base64
          </button>
          <button
            onClick={() => setMode("url")}
            className={`px-5 py-2 rounded-lg font-medium transition-colors ${
              mode === "url"
                ? "bg-blue-600 text-white"
                : dark
                ? "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            URL
          </button>
        </div>

        <textarea
          rows="5"
          className={`w-full p-3 rounded-xl border resize-none focus:outline-none focus:ring-2 transition-all ${
            dark
              ? "bg-zinc-800 text-white border-zinc-700 focus:ring-blue-500"
              : "bg-white text-black border-gray-300 focus:ring-blue-500"
          }`}
          placeholder="Enter text to encode/decode..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <textarea
          rows="5"
          className={`w-full p-3 rounded-xl border resize-none focus:outline-none mt-4 ${
            dark
              ? "bg-zinc-800 text-white border-zinc-700"
              : "bg-white text-black border-gray-300"
          }`}
          placeholder="Output will appear here..."
          value={output}
          readOnly
        />

        <div className="flex flex-wrap gap-3 mt-6">
          <button onClick={handleEncode} className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Encode</button>
          <button onClick={handleDecode} className="px-5 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">Decode</button>
          <button onClick={handleClear} className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">Clear</button>
          <button onClick={handleCopy} className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">Copy</button>
        </div>
      </div>
    </div>
  );
};

export default Base64Url;