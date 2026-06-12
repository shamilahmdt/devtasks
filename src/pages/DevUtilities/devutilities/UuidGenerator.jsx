import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const UuidGenerator = () => {
  const { dark } = useTheme();
  const [quantity, setQuantity] = useState(1);
  const [uppercase, setUppercase] = useState(false);
  const [noHyphens, setNoHyphens] = useState(false);
  const [output, setOutput] = useState("");

  const generateUUIDv4 = () => {
    if (crypto && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const handleGenerate = () => {
    try {
      const count = Math.min(Math.max(1, parseInt(quantity) || 1), 1000);
      let newUuids = [];
      for (let i = 0; i < count; i++) {
        let uuid = generateUUIDv4();
        if (uppercase) uuid = uuid.toUpperCase();
        if (noHyphens) uuid = uuid.replace(/-/g, "");
        newUuids.push(uuid);
      }
      setOutput(newUuids.join("\n"));
    } catch (error) {
      toast.error("Failed to generate UUIDs");
    }
  };

  const handleClear = () => {
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

  return (
    <div
      className={`h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-hidden relative flex flex-col justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>UUID Generator — Dev Utilities</title>
      <meta
        name="description"
        content="Generate valid v4 UUIDs offline quickly and easily."
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
        className={`relative z-10 w-[85%] max-w-none mx-auto rounded-[32px] border shadow-xl flex flex-col max-h-full overflow-hidden transition-all duration-300 ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        <div
          className={`h-2 w-full transition-colors duration-500 ${
            dark ? "bg-white" : "bg-black"
          }`}
        />

        <div className="px-5 sm:px-8 pt-6 sm:pt-8 flex items-center gap-3">
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
            className={`text-xl sm:text-2xl font-black uppercase tracking-tight transition-colors duration-300 ${
              dark ? "text-white" : "text-black"
            }`}
          >
            UUID Generator
          </h1>
        </div>

        <div className="w-full md:h-[464px] p-5 sm:p-8 overflow-y-auto">
          <div className="w-full h-full flex flex-col md:flex-row gap-4">
            <div className="group w-full flex flex-col space-y-4">
              <div className="flex flex-col space-y-2">
                <label
                  className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                    dark
                      ? "text-zinc-400 group-focus-within:text-white"
                      : "text-neutral-500 group-focus-within:text-black"
                  }`}
                >
                  Quantity (Max 1000)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 ${
                    dark
                      ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                      : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                  }`}
                />
              </div>

              <div className="flex flex-col space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group/label">
                  <input
                    type="checkbox"
                    checked={uppercase}
                    onChange={(e) => setUppercase(e.target.checked)}
                    className="w-5 h-5 rounded-md border-zinc-300 accent-black dark:accent-white cursor-pointer"
                  />
                  <span
                    className={`text-sm font-bold transition-colors ${
                      dark ? "text-zinc-300 group-hover/label:text-white" : "text-neutral-600 group-hover/label:text-black"
                    }`}
                  >
                    Uppercase Output
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group/label">
                  <input
                    type="checkbox"
                    checked={noHyphens}
                    onChange={(e) => setNoHyphens(e.target.checked)}
                    className="w-5 h-5 rounded-md border-zinc-300 accent-black dark:accent-white cursor-pointer"
                  />
                  <span
                    className={`text-sm font-bold transition-colors ${
                      dark ? "text-zinc-300 group-hover/label:text-white" : "text-neutral-600 group-hover/label:text-black"
                    }`}
                  >
                    Remove Hyphens
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  onClick={handleGenerate}
                  type="button"
                  className={`w-full px-4 py-3 rounded-xl border font-bold text-sm text-center transition-all duration-300 active:scale-95 ${
                    dark
                      ? "border-white bg-white text-black hover:bg-zinc-200 hover:border-zinc-200"
                      : "border-black bg-black text-white hover:bg-zinc-800 hover:border-zinc-800"
                  }`}
                >
                  Generate
                </button>
                <button
                  onClick={handleClear}
                  type="button"
                  className={`w-full px-4 py-3 rounded-xl border font-bold text-sm text-center transition-all duration-300 active:scale-95 ${
                    dark
                      ? "border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      : "border-neutral-300 text-neutral-600 hover:bg-neutral-100 hover:text-black"
                  }`}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="group w-full flex flex-col space-y-2 mt-6 md:mt-0">
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
                placeholder="Generated UUIDs will appear here..."
                className={`md:h-full h-40 px-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 resize-none font-mono ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                    : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                }`}
              />
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleCopy}
                  type="button"
                  className={`w-full md:w-40 px-4 py-2 rounded-xl border font-bold text-sm text-center transition-all duration-300 active:scale-95 ${
                    dark
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

export default UuidGenerator;
