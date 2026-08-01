import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import CryptoJS from "crypto-js";
import { useTheme } from "../../../context/ThemeContext";

// --- DECODER HELPERS ---
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

// --- ENCODER CONSTANTS ---
const defaultHeader = JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2);
const samplePayload = JSON.stringify(
  {
    sub: "1234567890",
    name: "John Doe",
    iat: 1516239022,
  },
  null,
  2
);

const base64UrlEncode = (value) =>
  CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(value))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const wordArrayToBase64Url = (wordArray) =>
  CryptoJS.enc.Base64.stringify(wordArray)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const JwtDecoder = () => {
  const { dark } = useTheme();
  const [activeTab, setActiveTab] = useState("decode"); // decode | encode

  // --- DECODER STATE ---
  const [decodeInput, setDecodeInput] = useState("");
  const [decoded, setDecoded] = useState(null);
  const [decodeError, setDecodeError] = useState("");

  // --- ENCODER STATE ---
  const [encodeHeader, setEncodeHeader] = useState(defaultHeader);
  const [encodePayload, setEncodePayload] = useState(samplePayload);
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [algorithm, setAlgorithm] = useState("HS256");
  const [isBase64Secret, setIsBase64Secret] = useState(false);

  // --- DECODER HANDLERS ---
  const handleDecode = () => {
    if (!decodeInput.trim()) return;
    try {
      const result = decodeJwt(decodeInput);
      setDecoded(result);
      setDecodeError("");
    } catch (err) {
      setDecoded(null);
      setDecodeError(err.message);
    }
  };

  const handleDecodeClear = () => {
    setDecodeInput("");
    setDecoded(null);
    setDecodeError("");
  };

  const handleDecodeSample = () => {
    const sampleToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJyb2xlIjoiRGV2ZWxvcGVyIn0.c2lnbmF0dXJl";
    setDecodeInput(sampleToken);
    try {
      const result = decodeJwt(sampleToken);
      setDecoded(result);
      setDecodeError("");
    } catch (err) {
      setDecoded(null);
      setDecodeError(err.message);
    }
  };

  const handleDecodeCopy = async (data, label) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Failed to copy");
    }
  };

  // --- ENCODER COMPUTE ---
  const encoderResult = useMemo(() => {
    try {
      const parsedHeader = JSON.parse(encodeHeader);
      const parsedPayload = JSON.parse(encodePayload);

      const finalHeader = {
        ...parsedHeader,
        alg: algorithm,
        typ: parsedHeader.typ || "JWT",
      };

      const encodedHeader = base64UrlEncode(JSON.stringify(finalHeader));
      const encodedPayload = base64UrlEncode(JSON.stringify(parsedPayload));
      const signingInput = `${encodedHeader}.${encodedPayload}`;

      const key = isBase64Secret ? CryptoJS.enc.Base64.parse(secret) : secret;

      const signature =
        algorithm === "HS384"
          ? CryptoJS.HmacSHA384(signingInput, key)
          : algorithm === "HS512"
          ? CryptoJS.HmacSHA512(signingInput, key)
          : CryptoJS.HmacSHA256(signingInput, key);

      return {
        token: `${signingInput}.${wordArrayToBase64Url(signature)}`,
        headerError: "",
        payloadError: "",
      };
    } catch (error) {
      const message = error.message || "Invalid JSON";
      return {
        token: "",
        headerError: encodeHeader.trim() ? message : "Header JSON is required.",
        payloadError: encodePayload.trim() ? message : "Payload JSON is required.",
      };
    }
  }, [encodeHeader, encodePayload, secret, algorithm, isBase64Secret]);

  const handleEncodeCopy = async () => {
    if (!encoderResult.token) return;
    try {
      await navigator.clipboard.writeText(encoderResult.token);
      toast.success("JWT Token copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleEncodeClear = () => {
    setEncodeHeader(defaultHeader);
    setEncodePayload("");
    setSecret("");
    setAlgorithm("HS256");
    setIsBase64Secret(false);
  };

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 font-sans antialiased transition-colors duration-300 overflow-x-hidden ${
        dark ? "bg-zinc-950" : "bg-[#FDFDFD]"
      }`}
    >
      <title>JWT Studio | DevTasks</title>
      <meta
        name="description"
        content="Decode, sign, and encode JSON Web Tokens (JWT) offline using HS256, HS384, and HS512."
      />

      <div
        className={`w-full max-w-6xl md:mx-auto rounded-3xl sm:rounded-4xl shadow-lg p-4 sm:p-8 border transition-colors duration-300 ${
          dark ? "bg-zinc-900 border-zinc-700" : "bg-white border-neutral-100"
        }`}
      >
        {/* Header Area */}
        <div className="flex flex-col gap-6 mb-8">
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
                JWT Studio
              </h1>
            </div>

            {/* View Tabs */}
            <div className="flex border rounded-2xl p-1 bg-zinc-100 dark:bg-zinc-800 border-neutral-200 dark:border-zinc-750 shrink-0">
              <button
                onClick={() => setActiveTab("decode")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                  activeTab === "decode"
                    ? dark
                      ? "bg-white text-black"
                      : "bg-black text-white"
                    : "bg-transparent text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Decode Token
              </button>
              <button
                onClick={() => setActiveTab("encode")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                  activeTab === "encode"
                    ? dark
                      ? "bg-white text-black"
                      : "bg-black text-white"
                    : "bg-transparent text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Encode / Sign
              </button>
            </div>
          </div>
        </div>

        {/* ── Tab 1: JWT DECODER ── */}
        {activeTab === "decode" && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
              {/* Token Input */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-3 h-8">
                  <label
                    className={`text-xs font-black uppercase tracking-widest ${
                      dark ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    JWT Token
                  </label>
                  <button
                    type="button"
                    onClick={handleDecodeSample}
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
                  value={decodeInput}
                  onChange={(e) => setDecodeInput(e.target.value)}
                  className={`w-full h-[360px] p-4 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors text-xs font-mono break-all leading-relaxed ${
                    dark
                      ? "bg-zinc-950 border-zinc-800 text-zinc-200"
                      : "bg-neutral-50 border-neutral-200 text-zinc-800"
                  }`}
                  placeholder="Paste your JWT encoded string here..."
                />
              </div>

              {/* Decoded Content */}
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex-1 flex flex-col min-h-[140px]">
                  <div className="flex justify-between items-center mb-2">
                    <label
                      className={`text-xs font-black uppercase tracking-widest ${
                        dark ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      Header
                    </label>
                    {decoded?.header && (
                      <button
                        onClick={() => handleDecodeCopy(decoded.header, "Header")}
                        className={`text-xs font-bold ${dark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-black"}`}
                      >
                        Copy
                      </button>
                    )}
                  </div>
                  <div
                    className={`flex-1 p-4 rounded-xl border overflow-auto ${
                      dark ? "bg-zinc-950 border-zinc-800" : "bg-neutral-50 border-neutral-200"
                    }`}
                  >
                    {decoded?.header ? (
                      <JsonBlock data={decoded.header} dark={dark} />
                    ) : (
                      <span className={`text-xs ${dark ? "text-zinc-650" : "text-zinc-400"}`}>
                        Header will display here
                      </span>
                    )}
                  </div>
                </div>

                {/* Payload */}
                <div className="flex-2 flex flex-col min-h-[220px]">
                  <div className="flex justify-between items-center mb-2">
                    <label
                      className={`text-xs font-black uppercase tracking-widest ${
                        dark ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      Payload
                    </label>
                    {decoded?.payload && (
                      <button
                        onClick={() => handleDecodeCopy(decoded.payload, "Payload")}
                        className={`text-xs font-bold ${dark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-black"}`}
                      >
                        Copy
                      </button>
                    )}
                  </div>
                  <div
                    className={`flex-1 p-4 rounded-xl border overflow-auto ${
                      dark ? "bg-zinc-950 border-zinc-800" : "bg-neutral-50 border-neutral-200"
                    }`}
                  >
                    {decoded?.payload ? (
                      <JsonBlock data={decoded.payload} dark={dark} />
                    ) : (
                      <span className={`text-xs ${dark ? "text-zinc-650" : "text-zinc-400"}`}>
                        Payload will display here
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {decodeError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold leading-relaxed">
                {decodeError}
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleDecode}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${
                  dark
                    ? "bg-white text-black hover:bg-zinc-200 border-white"
                    : "bg-black text-white hover:bg-zinc-800 border-black"
                }`}
              >
                Decode Token
              </button>
              <button
                onClick={handleDecodeClear}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${
                  dark
                    ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                    : "bg-white border-neutral-200 text-zinc-600 hover:text-black"
                }`}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* ── Tab 2: JWT ENCODER & SIGNER ── */}
        {activeTab === "encode" && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
              {/* Inputs Column */}
              <div className="flex flex-col gap-6">
                {/* Header JSON */}
                <div className="flex flex-col">
                  <label
                    className={`mb-3 text-xs font-black uppercase tracking-widest ${
                      dark ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    Header JSON
                  </label>
                  <textarea
                    value={encodeHeader}
                    onChange={(e) => setEncodeHeader(e.target.value)}
                    className={`w-full h-36 p-4 rounded-xl border resize-y focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors text-xs font-mono ${
                      dark
                        ? "bg-zinc-950 border-zinc-800 text-zinc-200"
                        : "bg-neutral-50 border-neutral-200 text-zinc-800"
                    }`}
                  />
                  {encoderResult.headerError && (
                    <p className="text-red-500 text-xs font-bold mt-1">
                      {encoderResult.headerError}
                    </p>
                  )}
                </div>

                {/* Payload JSON */}
                <div className="flex flex-col">
                  <label
                    className={`mb-3 text-xs font-black uppercase tracking-widest ${
                      dark ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    Payload JSON
                  </label>
                  <textarea
                    value={encodePayload}
                    onChange={(e) => setEncodePayload(e.target.value)}
                    className={`w-full h-48 p-4 rounded-xl border resize-y focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors text-xs font-mono ${
                      dark
                        ? "bg-zinc-950 border-zinc-800 text-zinc-200"
                        : "bg-neutral-50 border-neutral-200 text-zinc-800"
                    }`}
                  />
                  {encoderResult.payloadError && (
                    <p className="text-red-500 text-xs font-bold mt-1">
                      {encoderResult.payloadError}
                    </p>
                  )}
                </div>
              </div>

              {/* Signing Settings + Token Result Column */}
              <div className="flex flex-col gap-6">
                {/* Signature Settings */}
                <div
                  className={`p-4 sm:p-6 rounded-xl border ${
                    dark ? "bg-zinc-950 border-zinc-800" : "bg-neutral-50 border-neutral-250"
                  }`}
                >
                  <h3
                    className={`text-xs font-black uppercase tracking-widest mb-4 ${
                      dark ? "text-zinc-400" : "text-zinc-650"
                    }`}
                  >
                    Signature Settings
                  </h3>

                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold ${dark ? "text-zinc-300" : "text-zinc-700"}`}>
                        Signing Algorithm
                      </span>
                      <span className={`text-[10px] ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                        Select HMAC hashing algorithm
                      </span>
                    </div>
                    <select
                      value={algorithm}
                      onChange={(e) => setAlgorithm(e.target.value)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold focus:outline-none transition-colors ${
                        dark
                          ? "bg-zinc-900 border-zinc-750 text-white"
                          : "bg-white border-neutral-250 text-black"
                      }`}
                    >
                      <option value="HS256">HS256 (HMAC-SHA256)</option>
                      <option value="HS384">HS384 (HMAC-SHA384)</option>
                      <option value="HS512">HS512 (HMAC-SHA512)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-bold ${dark ? "text-zinc-300" : "text-zinc-700"}`}>
                        Secret Key
                      </span>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isBase64Secret}
                          onChange={(e) => setIsBase64Secret(e.target.checked)}
                          className="rounded text-zinc-900 dark:text-white"
                        />
                        <span className={`text-[10px] font-medium ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
                          Base64 Secret
                        </span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      placeholder="Signing secret..."
                      className={`w-full px-3 py-2 rounded-lg border text-xs font-mono focus:outline-none transition-colors ${
                        dark
                          ? "bg-zinc-900 border-zinc-750 text-white"
                          : "bg-white border-neutral-250 text-black"
                      }`}
                    />
                  </div>
                </div>

                {/* Generated Token */}
                <div className="flex flex-col flex-1">
                  <label
                    className={`mb-2 text-xs font-black uppercase tracking-widest ${
                      dark ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    Encoded Token Result
                  </label>
                  <textarea
                    value={encoderResult.token}
                    readOnly
                    className={`w-full flex-1 min-h-[140px] p-4 rounded-xl border resize-none focus:outline-none transition-colors text-xs font-mono break-all leading-relaxed ${
                      dark
                        ? "bg-zinc-950 border-zinc-800 text-zinc-300"
                        : "bg-neutral-50 border-neutral-200 text-zinc-650"
                    }`}
                    placeholder="Signature will generate token here..."
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleEncodeCopy}
                disabled={!encoderResult.token}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:scale-100 ${
                  dark
                    ? "bg-white text-black hover:bg-zinc-200 border-white"
                    : "bg-black text-white hover:bg-zinc-800 border-black"
                }`}
              >
                Copy Token
              </button>
              <button
                onClick={handleEncodeClear}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${
                  dark
                    ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                    : "bg-white border-neutral-200 text-zinc-600 hover:text-black"
                }`}
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JwtDecoder;
