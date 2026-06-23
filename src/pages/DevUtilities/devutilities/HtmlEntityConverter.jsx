import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const HtmlEntityConverter = () => {
  const { dark } = useTheme();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("named");
  const [realTime, setRealTime] = useState(false);

  const encodeNamed = (text) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const encodeNumeric = (text) =>
    text.replace(/[<>&"']/g, (char) => `&#${char.charCodeAt(0)};`);

  const decodeHtml = (text) => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  };

  const handleEncode = () => {
    const result =
      mode === "named"
        ? encodeNamed(input)
        : encodeNumeric(input);

    setOutput(result);
  };

  const handleDecode = () => {
    setOutput(decodeHtml(input));
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  const handleSample = () => {
    setInput('<div class="container">Hello & Welcome</div>');
    setOutput("");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleCopyInput = async () => {
    try {
      await navigator.clipboard.writeText(input);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const buttons = [
    { label: "Encode", onClick: handleEncode },
    { label: "Decode", onClick: handleDecode },
    { label: "Clear", onClick: handleClear },
  ];

  return (
    <div
      className={`min-h-[calc(100vh-76px)] md:h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto overflow-x-hidden md:overflow-hidden relative flex flex-col justify-center ${dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
        }`}
    >
      <title>HTML Entity Converter — DevTasks</title>
      <meta
        name="description"
        content="Easily encode and decode HTML entities with our online HTML Entity Converter."
      />

      <div
        className={`absolute top-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-30 transition-colors duration-500 ${dark ? "bg-zinc-800" : "bg-neutral-200"
          }`}
      />
      <div
        className={`absolute bottom-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-30 transition-colors duration-500 ${dark ? "bg-zinc-900" : "bg-neutral-100"
          }`}
      />

      <div
        className={`relative z-10 w-full max-w-5xl md:mx-auto rounded-[32px] border shadow-xl flex flex-col max-h-full md:max-h-[85vh] overflow-hidden transition-all duration-300 ${dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
          }`}
      >
        <div
          className={`h-2 w-full transition-colors duration-500 ${dark ? "bg-white" : "bg-black"
            }`}
        />

        {/* Header */}
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 flex items-center gap-3 w-full min-w-0">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${dark
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
            className={`text-xl sm:text-2xl font-black uppercase tracking-tight transition-colors duration-300 min-w-0 flex-1 ${dark ? "text-white" : "text-black"
              }`}
          >
            HTML Entity Converter
          </h1>
        </div>

        <div className="w-full md:h-[464px] p-5 sm:p-8 overflow-y-auto">
          <div className="w-full h-full flex flex-col md:flex-row gap-4">
            <div className="group w-full flex flex-col space-y-2">
              <div className="flex items-center justify-between h-8">
                <label
                  className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${dark
                      ? "text-zinc-400 group-focus-within:text-white"
                      : "text-neutral-500 group-focus-within:text-black"
                    }`}
                >
                  Input
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSample}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-300 ${dark
                        ? "bg-white text-black border-white hover:bg-zinc-200"
                        : "bg-black text-white border-black hover:bg-zinc-800"
                      }`}
                  >
                    Sample
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyInput}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-300 ${dark
                        ? "border-white text-white hover:bg-white hover:text-black"
                        : "border-black text-black hover:bg-black hover:text-white"
                      }`}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-2 text-sm">
                <label className={dark ? "text-zinc-300" : "text-neutral-700"}>
                  <input
                    type="radio"
                    checked={mode === "named"}
                    onChange={() => setMode("named")}
                  />{" "}
                  Named
                </label>

                <label className={dark ? "text-zinc-300" : "text-neutral-700"}>
                  <input
                    type="radio"
                    checked={mode === "numeric"}
                    onChange={() => setMode("numeric")}
                  />{" "}
                  Numeric
                </label>

                <label className={dark ? "text-zinc-300" : "text-neutral-700"}>
                  <input
                    type="checkbox"
                    checked={realTime}
                    onChange={() => setRealTime(!realTime)}
                  />{" "}
                  Real-Time
                </label>
              </div>

              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);

                  if (realTime) {
                    const result =
                      mode === "named"
                        ? encodeNamed(e.target.value)
                        : encodeNumeric(e.target.value);

                    setOutput(result);
                  }
                }}
                placeholder='<div class="container">Hello & Welcome</div>'
                className={`md:h-full h-40 px-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 resize-none ${dark
                    ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                    : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                  }`}
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {buttons.map((btn) => (
                  <button
                    key={btn.label}
                    onClick={btn.onClick}
                    type="button"
                    className={`w-full px-4 py-2 rounded-xl border font-bold text-sm text-center transition-all duration-300 active:scale-95 ${dark
                        ? "border-white text-white hover:bg-white hover:text-black"
                        : "border-black text-black hover:bg-black hover:text-white"
                      }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="group w-full flex flex-col space-y-2">
              <div className="flex items-center h-8">
                <label
                  className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${dark
                      ? "text-zinc-400 group-focus-within:text-white"
                      : "text-neutral-500 group-focus-within:text-black"
                    }`}
                >
                  Output
                </label>
              </div>
              <textarea
                value={output}
                readOnly
                className={`md:h-full h-40 px-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 resize-none ${dark
                    ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                    : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                  }`}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleCopy}
                  type="button"
                  className={`w-40 px-4 py-2 rounded-xl border font-bold text-sm text-center transition-all duration-300 active:scale-95
                    ${dark
                      ? "border-white text-white hover:bg-white hover:text-black"
                      : "border-black text-black hover:bg-black hover:text-white"
                    }`}
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

export default HtmlEntityConverter;