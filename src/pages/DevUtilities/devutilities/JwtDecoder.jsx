import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const base64UrlDecode = (str) => {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

const decodeJwt = (token) => {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT: must have exactly 3 parts separated by dots.");
  }
  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1]));
  return { header, payload, signature: parts[2] };
};

const JsonBlock = ({ data, dark }) => (
  <pre
    className={`text-xs font-mono leading-relaxed whitespace-pre-wrap break-all overflow-auto h-full ${
      dark ? "text-zinc-300" : "text-zinc-700"
    }`}
  >
    {JSON.stringify(data, null, 2)}
  </pre>
);

const JwtDecoder = () => {
  const { dark } = useTheme();
  const [input, setInput] = useState("");
  const [decoded, setDecoded] = useState(null);
  const [error, setError] = useState("");

  const handleDecode = () => {
    if (!input.trim()) return;
    try {
      const result = decodeJwt(input);
      setDecoded(result);
      setError("");
    } catch (err) {
      setDecoded(null);
      setError(err.message);
    }
  };

  const handleClear = () => {
    setInput("");
    setDecoded(null);
    setError("");
  };
  const handleSample = () => {
  const sampleToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJyb2xlIjoiRGV2ZWxvcGVyIn0.c2lnbmF0dXJl";

  setInput(sampleToken);

  try {
    const result = decodeJwt(sampleToken);
    setDecoded(result);
    setError("");
  } catch (err) {
    setDecoded(null);
    setError(err.message);
  }
};
  const handleCopy = async (data, label) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      toast.success(`${label} copied to clipboard`);
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
      <title>JWT Decoder — Dev Utilities</title>
      <meta
        name="description"
        content="Decode and inspect JSON Web Tokens (JWT) client-side, offline."
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
            JWT Decoder
          </h1>
        </div>

        <div className="w-full md:h-[464px] p-5 sm:p-8 overflow-y-auto">
          <div className="w-full h-full flex flex-col md:flex-row gap-4">

            {/* LEFT: Input + Actions */}
            <div className="group w-full flex flex-col space-y-4">
              <div className="flex flex-col space-y-2 flex-1">
                <label
                  className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                    dark
                      ? "text-zinc-400 group-focus-within:text-white"
                      : "text-neutral-500 group-focus-within:text-black"
                  }`}
                >
                  JWT Token
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste your JWT here…"
                  spellCheck={false}
                  className={`md:h-full h-40 px-4 py-3 rounded-2xl border text-sm font-mono outline-none transition-all duration-300 resize-none ${
                    dark
                      ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                      : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                  }`}
                />
              </div>

              {error && (
                <div
                  className={`px-4 py-3 rounded-2xl border text-xs font-mono transition-colors duration-300 ${
                    dark
                      ? "bg-zinc-950 border-zinc-700 text-zinc-400"
                      : "bg-neutral-100 border-neutral-300 text-zinc-500"
                  }`}
                >
                  <span
                    className={`font-black uppercase tracking-widest text-[10px] mr-2 ${
                      dark ? "text-zinc-300" : "text-zinc-700"
                    }`}
                  >
                    Error:
                  </span>
                  {error}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleDecode}
                  type="button"
                  className={`w-full px-4 py-3 rounded-xl border font-bold text-sm text-center transition-all duration-300 active:scale-95 ${
                    dark
                      ? "border-white bg-white text-black hover:bg-zinc-200 hover:border-zinc-200"
                      : "border-black bg-black text-white hover:bg-zinc-800 hover:border-zinc-800"
                  }`}
                >
                  Decode
                </button>
                <button
  onClick={handleSample}
  type="button"
  className={`w-full px-4 py-3 rounded-xl border font-bold text-sm text-center transition-all duration-300 active:scale-95 ${
    dark
      ? "border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
      : "border-neutral-300 text-neutral-600 hover:bg-neutral-100 hover:text-black"
  }`}
>
  Sample
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

            {/* RIGHT: Decoded Output */}
            <div className="w-full flex flex-col gap-4 mt-6 md:mt-0">

              {/* Header panel */}
              <div className="flex flex-col space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <label
                    className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                      dark ? "text-zinc-400" : "text-neutral-500"
                    }`}
                  >
                    Header
                  </label>
                  {decoded && (
                    <button
                      type="button"
                      onClick={() => handleCopy(decoded.header, "Header")}
                      className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                        dark
                          ? "text-zinc-500 hover:text-white"
                          : "text-zinc-400 hover:text-black"
                      }`}
                    >
                      Copy
                    </button>
                  )}
                </div>
                <div
                  className={`flex-1 min-h-[80px] px-4 py-3 rounded-2xl border text-sm transition-all duration-300 overflow-auto ${
                    dark
                      ? "bg-zinc-950 border-zinc-800"
                      : "bg-neutral-50 border-neutral-300"
                  }`}
                >
                  {decoded ? (
                    <JsonBlock data={decoded.header} dark={dark} />
                  ) : (
                    <span
                      className={`text-xs font-mono ${
                        dark ? "text-zinc-600" : "text-neutral-400"
                      }`}
                    >
                      Decoded header will appear here…
                    </span>
                  )}
                </div>
              </div>

              {/* Payload panel */}
              <div className="flex flex-col space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <label
                    className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                      dark ? "text-zinc-400" : "text-neutral-500"
                    }`}
                  >
                    Payload
                  </label>
                  {decoded && (
                    <button
                      type="button"
                      onClick={() => handleCopy(decoded.payload, "Payload")}
                      className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                        dark
                          ? "text-zinc-500 hover:text-white"
                          : "text-zinc-400 hover:text-black"
                      }`}
                    >
                      Copy
                    </button>
                  )}
                </div>
                <div
                  className={`flex-1 min-h-[80px] px-4 py-3 rounded-2xl border text-sm transition-all duration-300 overflow-auto ${
                    dark
                      ? "bg-zinc-950 border-zinc-800"
                      : "bg-neutral-50 border-neutral-300"
                  }`}
                >
                  {decoded ? (
                    <JsonBlock data={decoded.payload} dark={dark} />
                  ) : (
                    <span
                      className={`text-xs font-mono ${
                        dark ? "text-zinc-600" : "text-neutral-400"
                      }`}
                    >
                      Decoded payload will appear here…
                    </span>
                  )}
                </div>
              </div>

              <p
                className={`text-[10px] font-bold uppercase tracking-widest text-right transition-colors ${
                  dark ? "text-zinc-600" : "text-neutral-400"
                }`}
              >
                Signature not verified — client-side only
              </p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JwtDecoder;
