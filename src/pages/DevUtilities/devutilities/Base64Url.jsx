import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const MODES = [
  { key: "base64", label: "Base64" },
  { key: "url", label: "URL" },
];

const encodeBase64 = (str) => {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const decodeBase64 = (str) => {
  const binary = atob(str);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

const Base64Url = () => {
  const { dark } = useTheme();
  const [mode, setMode] = useState("base64");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setOutput("");
  };

  const handleEncode = () => {
    if (!input.trim()) return;
    try {
      if (mode === "base64") {
        setOutput(encodeBase64(input));
      } else {
        setOutput(encodeURIComponent(input));
      }
    } catch (error) {
      toast.error("Failed to encode input.");
    }
  };

  const handleDecode = () => {
    if (!input.trim()) return;
    try {
      if (mode === "base64") {
        setOutput(decodeBase64(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
    } catch (error) {
      toast.error(
        mode === "base64"
          ? "Invalid Base64 string."
          : "Invalid URL-encoded string.",
      );
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };
const handleSample = () => {
  if (mode === "base64") {
    setInput("SGVsbG8gRGV2VGFza3Mh");
  } else {
    setInput("Hello%20DevTasks%21");
  }

  setOutput("");
};
  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const actionButtons = [
    { label: "Encode", onClick: handleEncode },
    { label: "Decode", onClick: handleDecode },
    { label: "Clear", onClick: handleClear },
    { label: "Copy", onClick: handleCopy },
  ];

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 font-sans antialiased transition-colors duration-300 overflow-x-hidden ${
        dark ? "bg-zinc-950" : "bg-[#FDFDFD]"
      }`}
    >
      <title>Base64 & URL Converter | DevTasks</title>
      <meta
        name="description"
        content="Offline Base64 and URL encoding/decoding utility tool."
      />

      <div
        className={`w-full max-w-6xl md:mx-auto rounded-3xl sm:rounded-4xl shadow-lg p-4 sm:p-8 border transition-colors duration-300 ${
          dark ? "bg-zinc-900 border-zinc-700" : "bg-white border-neutral-100"
        }`}
      >
        {/* Header Area */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-3 w-full min-w-0">
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
                className={`text-xl sm:text-2xl font-black uppercase tracking-tight transition-colors duration-300 min-w-0 flex-1 ${
                  dark ? "text-white" : "text-black"
                }`}
              >
                Base64 Encoder & Decoder
              </h1>
            </div>

            {/* Mode Selector */}
            <div
              className={`flex items-center gap-2 p-1 border rounded-2xl ${
                dark
                  ? "border-zinc-700 bg-zinc-800"
                  : "border-neutral-200 bg-neutral-50"
              }`}
            >
              {MODES.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleModeChange(opt.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                    mode === opt.key
                      ? dark
                        ? "bg-white text-black"
                        : "bg-black text-white"
                      : dark
                        ? "text-neutral-400 hover:text-white"
                        : "text-neutral-400 hover:text-black"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="mb-8">
          {/* 2-Column Grid Layout matching the reference image */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
            {/* LEFT COLUMN: Input */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-3 h-8">
                <label
                  className={`text-xs font-black uppercase tracking-widest ${
                    dark ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  Input
                </label>

                <button
                  type="button"
                  onClick={handleSample}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
  dark
    ? "bg-white text-black hover:bg-zinc-200"
    : "bg-black text-white hover:bg-zinc-800"
}`}
                >
                  Sample
                </button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className={`w-full h-64 p-4 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-zinc-200"
                    : "bg-neutral-50 border-neutral-200 text-zinc-800"
                }`}
                placeholder={
                  mode === "base64"
                    ? "Enter text or Base64 here"
                    : "Enter text or URL-encoded string here"
                }
              ></textarea>
            </div>

            {/* RIGHT COLUMN: Output */}
            <div className="flex flex-col">
              <div className="flex items-center mb-3 h-8">
                <label
                  className={`text-xs font-black uppercase tracking-widest ${dark ? "text-zinc-400" : "text-zinc-500"}`}
                >
                  Output
                </label>
              </div>
              <textarea
                value={output}
                readOnly
                className={`w-full h-64 p-4 rounded-xl border resize-none focus:outline-none transition-colors ${
                  dark
                    ? `bg-zinc-900/50 border-zinc-800 ${output ? "text-zinc-200" : "text-zinc-500"}`
                    : `bg-neutral-100 border-neutral-200 ${output ? "text-zinc-800" : "text-zinc-400"}`
                }`}
                placeholder="Result will appear here..."
              ></textarea>
            </div>
          </div>

          {/* Action Buttons (Centered at bottom) */}
          <div className="flex flex-wrap justify-center gap-4">
            {actionButtons.map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={btn.onClick}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${
                  dark
                    ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
                    : "bg-white border-neutral-200 text-zinc-600 hover:text-black hover:border-neutral-400"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Base64Url;
