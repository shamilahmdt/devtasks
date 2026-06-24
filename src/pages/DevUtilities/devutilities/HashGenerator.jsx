import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import CryptoJS from "crypto-js";
import { useTheme } from "../../../context/ThemeContext";

const HashGenerator = () => {
  const { dark } = useTheme();
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState({
    md5: "",
    sha1: "",
    sha256: "",
    sha512: "",
  });

  useEffect(() => {
    if (!input) {
      setHashes({ md5: "", sha1: "", sha256: "", sha512: "" });
      return;
    }
    
    // Generate hashes using crypto-js
    try {
      setHashes({
        md5: CryptoJS.MD5(input).toString(),
        sha1: CryptoJS.SHA1(input).toString(),
        sha256: CryptoJS.SHA256(input).toString(),
        sha512: CryptoJS.SHA512(input).toString(),
      });
    } catch (error) {
      console.error("Error generating hashes", error);
    }
  }, [input]);

  const handleCopy = async (hashValue, hashName) => {
    try {
      if (!hashValue) return;
      await navigator.clipboard.writeText(hashValue);
      toast.success(`${hashName} copied to clipboard`);
    } catch (error) {
      toast.error(`Failed to copy ${hashName}`);
    }
  };

  const handleClear = () => {
    setInput("");
  };

  const HashOutput = ({ name, value }) => (
    <div className="flex flex-col space-y-2 mb-4">
      <div className="flex justify-between items-center">
        <label
          className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
            dark ? "text-zinc-400 group-focus-within:text-white" : "text-neutral-500 group-focus-within:text-black"
          }`}
        >
          {name}
        </label>
        <button
          onClick={() => handleCopy(value, name)}
          type="button"
          disabled={!value}
          className={`px-3 py-1 rounded-lg border font-bold text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 ${
            !value 
              ? "opacity-50 cursor-not-allowed border-transparent text-gray-400"
              : dark
                ? "border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                : "border-neutral-300 text-neutral-600 hover:bg-neutral-100 hover:text-black"
          }`}
        >
          Copy
        </button>
      </div>
      <input
        type="text"
        value={value}
        readOnly
        placeholder={`${name} hash will appear here...`}
        className={`w-full px-4 py-2 rounded-xl border text-sm outline-none transition-all duration-300 font-mono ${
          dark
            ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white"
            : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black"
        }`}
      />
    </div>
  );

  return (
    <div
      className={`min-h-[calc(100vh-76px)] md:h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto overflow-x-hidden md:overflow-hidden relative flex flex-col justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>Hash Generator — DevTasks</title>
      <meta
        name="description"
        content="Generate common cryptographic hashes directly in the browser."
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
        className={`relative z-10 w-full max-w-5xl md:w-[85%] mx-auto rounded-[32px] border shadow-xl flex flex-col max-h-full overflow-hidden transition-all duration-300 ${
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
            Hash Generator
          </h1>
        </div>

        <div className="w-full flex-1 p-5 sm:p-8 overflow-y-auto">
          <div className="w-full h-full flex flex-col md:flex-row gap-6">
            {/* Left side: Input */}
            <div className="group w-full md:w-1/2 flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <label
                  className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                    dark
                      ? "text-zinc-400 group-focus-within:text-white"
                      : "text-neutral-500 group-focus-within:text-black"
                  }`}
                >
                  Input Text
                </label>
                <button
                  onClick={handleClear}
                  type="button"
                  className={`px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 ${
                    dark
                      ? "border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      : "border-neutral-300 text-neutral-600 hover:bg-neutral-100 hover:text-black"
                  }`}
                >
                  Clear
                </button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to hash..."
                className={`flex-1 min-h-[200px] md:min-h-[350px] px-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 resize-none font-mono ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                    : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                }`}
              />
            </div>

            {/* Right side: Outputs */}
            <div className="group w-full md:w-1/2 flex flex-col h-full overflow-y-auto pr-2">
              <HashOutput name="MD5" value={hashes.md5} />
              <HashOutput name="SHA-1" value={hashes.sha1} />
              <HashOutput name="SHA-256" value={hashes.sha256} />
              <HashOutput name="SHA-512" value={hashes.sha512} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HashGenerator;
