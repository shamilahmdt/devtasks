import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const JsonFormatter = () => {
  const { dark } = useTheme();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleFormat = () => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch (error) {
      toast.error("Invalid JSON format");
    }
  };

  const handleMinify = () => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
    } catch (error) {
      toast.error("Invalid JSON format");
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  const handleCopy = async () => {
    try {
      if (!output) return;
      await navigator.clipboard.writeText(output);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const buttons = [
    { label: "Format", onClick: handleFormat },
    { label: "Minify", onClick: handleMinify },
    { label: "Clear", onClick: handleClear },
  ];
  return (
    <div
      className={`min-h-[calc(100vh-76px)] md:h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto md:overflow-hidden relative flex flex-col justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>JSON Formatter — DevTasks</title>
      <meta
        name="description"
        content="Easily format, validate, and beautify your JSON data with our online JSON Formatter."
      />

      <div
        className={`absolute top-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-30 transition-colors duration-500 ${
          dark ? "bg-zinc-800" : "bg-neutral-200"
        }`}
      />
      <div
        className={`absolute bottom-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-30 transition-colors duration-500 ${
          dark ? "bg-zinc-900" : "bg-neutral-100"
        }`}
      />

      <div
        className={`relative z-10 w-full max-w-5xl mx-4 sm:mx-6 md:mx-auto rounded-[32px] border shadow-xl flex flex-col max-h-full md:max-h-[85vh] overflow-hidden transition-all duration-300 ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        <div
          className={`h-2 w-full transition-colors duration-500 ${
            dark ? "bg-white" : "bg-black"
          }`}
        />

        {/* Header */}
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 flex flex-col gap-4">
          <Link
            to="/devutilities"
            className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all duration-300 w-fit ${
              dark
                ? "text-neutral-400 hover:text-white"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            <span>← Back to Workspace</span>
          </Link>
          <h1
            className={`text-xl sm:text-2xl font-black uppercase tracking-tight transition-colors duration-300 ${
              dark ? "text-white" : "text-black"
            }`}
          >
            JSON Formatter
          </h1>
        </div>

        <div className="w-full md:h-[464px] p-5 sm:p-8 overflow-y-auto">
          <div className="w-full h-full flex flex-col md:flex-row gap-4"> 
            <div className="group w-full flex flex-col space-y-2">
              <label
                className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                  dark
                    ? "text-zinc-400 group-focus-within:text-white"
                    : "text-neutral-500 group-focus-within:text-black"
                }`}
              >
                Input
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='{"title":"devtask"}'
                className={`md:h-full h-40 px-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 resize-none ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                    : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                }`}
              />
              <div className="grid grid-cols-3 gap-3">
                {buttons.map((btn) => (
                  <button
                    key={btn.label}
                    onClick={btn.onClick}
                    type="button"
                    className={`w-full px-4 py-2 rounded-xl border font-bold text-sm text-center transition-all duration-300 active:scale-95 ${
                      dark
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
              <label
                className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                  dark
                    ? "text-zinc-400 group-focus-within:text-white"
                    : "text-neutral-500 group-focus-within:text-black"
                }`}
              >
                Output
              </label>
              <textarea
                value={output}
                readOnly
                className={`md:h-full h-40 px-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 resize-none ${
                  dark
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

export default JsonFormatter;
