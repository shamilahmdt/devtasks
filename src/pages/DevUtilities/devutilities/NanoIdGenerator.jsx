import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";
import { FaCopy, FaSync, FaCheck, FaInfoCircle, FaKey, FaClock, FaShieldAlt } from "react-icons/fa";

// ULID Crockford Base32 characters
const CROCKFORD_BASE32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

// Custom NanoID generator using crypto.getRandomValues
function generateNanoId(alphabet, length) {
  if (!alphabet || length <= 0) return "";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let id = "";
  const mask = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1;
  const step = Math.ceil((1.6 * mask * length) / alphabet.length);

  let i = 0;
  while (i < length) {
    const randomBytes = new Uint8Array(step);
    crypto.getRandomValues(randomBytes);
    for (let j = 0; j < randomBytes.length && i < length; j++) {
      const byte = randomBytes[j] & mask;
      if (alphabet[byte]) {
        id += alphabet[byte];
        i++;
      }
    }
  }
  return id;
}

// Generate Crockford Base32 encoding for timestamp (48 bits / 10 chars)
function encodeTime(now, len = 10) {
  let mod;
  let str = "";
  for (let i = len; i > 0; i--) {
    mod = now % 32;
    str = CROCKFORD_BASE32[mod] + str;
    now = Math.floor(now / 32);
  }
  return str;
}

// Generate random Crockford Base32 characters (80 bits / 16 chars)
function encodeRandom(len = 16) {
  let str = "";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < len; i++) {
    str += CROCKFORD_BASE32[bytes[i] % 32];
  }
  return str;
}

// Generate full ULID (26 chars)
function generateUlid(timestamp = Date.now()) {
  return encodeTime(timestamp, 10) + encodeRandom(16);
}

// Decode timestamp from ULID
function decodeUlidTime(ulid) {
  if (!ulid || ulid.length < 10) return null;
  const timeStr = ulid.slice(0, 10).toUpperCase();
  let time = 0;
  for (let i = 0; i < timeStr.length; i++) {
    const char = timeStr[i];
    const index = CROCKFORD_BASE32.indexOf(char);
    if (index === -1) return null;
    time = time * 32 + index;
  }
  return new Date(time);
}

const PRESET_ALPHABETS = {
  default: "A-Za-z0-9_- (Standard NanoID)",
  alphanumeric: "A-Za-z0-9 (Alphanumeric)",
  lowercase: "a-z0-9 (Lowercase)",
  uppercase: "A-Z0-9 (Uppercase)",
  hex: "0123456789abcdef (Hexadecimal)",
  numbers: "0123456789 (Numeric)",
};

const ALPHABET_MAP = {
  default: "useModule32456789BFGHIJKLMNOPQRSTUVXYZ_abcdefghijklmnopqrstuvwxyz",
  alphanumeric: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  lowercase: "0123456789abcdefghijklmnopqrstuvwxyz",
  uppercase: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  hex: "0123456789abcdef",
  numbers: "0123456789",
};

export default function NanoIdGenerator() {
  const { dark } = useTheme();

  // Settings state
  const [generatorType, setGeneratorType] = useState("nanoid"); // nanoid | ulid
  const [preset, setPreset] = useState("default");
  const [customAlphabet, setCustomAlphabet] = useState("");
  const [length, setLength] = useState(21);
  const [batchSize, setBatchSize] = useState(1);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // ULID Inspector state
  const [inspectUlid, setInspectUlid] = useState("");

  const activeAlphabet = useMemo(() => {
    if (preset === "custom") return customAlphabet || ALPHABET_MAP.default;
    return ALPHABET_MAP[preset] || ALPHABET_MAP.default;
  }, [preset, customAlphabet]);

  // Generate IDs
  const [generatedIds, setGeneratedIds] = useState(() => [
    generateNanoId(ALPHABET_MAP.default, 21),
  ]);

  const handleGenerate = useCallback(() => {
    const count = Math.max(1, Math.min(100, batchSize));
    const newIds = [];

    for (let i = 0; i < count; i++) {
      if (generatorType === "nanoid") {
        newIds.push(generateNanoId(activeAlphabet, length));
      } else {
        newIds.push(generateUlid());
      }
    }
    setGeneratedIds(newIds);
    setCopiedIndex(null);
    setCopiedAll(false);
  }, [generatorType, activeAlphabet, length, batchSize]);

  // Copy single ID
  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Copy all generated IDs
  const copyAll = () => {
    const text = generatedIds.join("\n");
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    toast.success(`Copied ${generatedIds.length} ID(s) to clipboard!`);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Collision estimation
  const collisionEstimate = useMemo(() => {
    if (generatorType === "ulid") {
      return "~108 years at 1,000,000 IDs/sec (80-bit randomness)";
    }
    const alphabetSize = activeAlphabet.length;
    if (alphabetSize < 2) return "N/A";
    const bitsPerChar = Math.log2(alphabetSize);
    const totalBits = bitsPerChar * length;
    const idsFor1PercentCollision = Math.pow(2, totalBits / 2) * 0.14;

    if (idsFor1PercentCollision > 1e15) return `> 1 Trillion IDs required for 1% collision risk (${totalBits.toFixed(1)} bits entropy)`;
    if (idsFor1PercentCollision > 1e9) return `~${(idsFor1PercentCollision / 1e9).toFixed(1)} Billion IDs for 1% collision risk`;
    if (idsFor1PercentCollision > 1e6) return `~${(idsFor1PercentCollision / 1e6).toFixed(1)} Million IDs for 1% collision risk`;
    return `~${Math.round(idsFor1PercentCollision)} IDs for 1% collision risk`;
  }, [generatorType, activeAlphabet, length]);

  // Decoded timestamp from inspector
  const decodedDate = useMemo(() => {
    if (!inspectUlid.trim()) return null;
    return decodeUlidTime(inspectUlid.trim());
  }, [inspectUlid]);

  const t = {
    wrapper: dark ? "bg-zinc-950 text-zinc-100" : "bg-[#F7F7F7] text-zinc-900",
    card: dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200 shadow-sm",
    headerBtn: dark
      ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
      : "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350",
    input: dark
      ? "bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-zinc-600"
      : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-400",
    subtext: dark ? "text-zinc-400" : "text-zinc-600",
    badge: dark ? "bg-zinc-800 text-zinc-300 border-zinc-700" : "bg-zinc-100 text-zinc-700 border-zinc-200",
    codeBox: dark ? "bg-zinc-950 border-zinc-800 text-emerald-400" : "bg-zinc-900 text-emerald-300 border-zinc-800",
    primaryBtn: dark
      ? "bg-white text-zinc-900 hover:bg-zinc-200 font-semibold"
      : "bg-zinc-900 text-white hover:bg-zinc-800 font-semibold",
    secondaryBtn: dark
      ? "bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700"
      : "bg-zinc-100 text-zinc-800 border-zinc-200 hover:bg-zinc-200",
  };

  return (
    <div className={`min-h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 ${t.wrapper}`}>
      <title>NanoID & ULID Generator — DevTasks</title>
      <meta
        name="description"
        content="Generate collision-resistant NanoID and ULID unique identifiers with custom alphabets, size controls, and timestamp decoding."
      />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className={`p-6 sm:p-8 rounded-3xl border ${t.card} relative overflow-hidden`}>
          <div className="flex items-center gap-4">
            <Link to="/devutilities" className={`p-3 rounded-2xl border transition-all ${t.headerBtn}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                  NanoID & ULID Generator
                </h1>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-mono ${t.badge}`}>
                  Security & Crypto
                </span>
              </div>
              <p className={`text-sm mt-1 ${t.subtext}`}>
                Create secure, compact, URL-friendly unique IDs (NanoID) or lexicographically sortable IDs (ULID).
              </p>
            </div>
          </div>
        </div>

        {/* Generator Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-1 p-6 rounded-3xl border ${t.card} space-y-5`}>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FaKey className="text-emerald-500" /> Generator Configuration
            </h2>

            {/* ID Type Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Identifier Standard</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setGeneratorType("nanoid");
                    handleGenerate();
                  }}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                    generatorType === "nanoid" ? t.primaryBtn : t.secondaryBtn
                  }`}
                >
                  NanoID
                </button>
                <button
                  onClick={() => {
                    setGeneratorType("ulid");
                    handleGenerate();
                  }}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                    generatorType === "ulid" ? t.primaryBtn : t.secondaryBtn
                  }`}
                >
                  ULID
                </button>
              </div>
            </div>

            {generatorType === "nanoid" && (
              <>
                {/* Alphabet Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Alphabet Preset</label>
                  <select
                    value={preset}
                    onChange={(e) => setPreset(e.target.value)}
                    className={`w-full p-2.5 rounded-xl text-sm border outline-none ${t.input}`}
                  >
                    {Object.entries(PRESET_ALPHABETS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                    <option value="custom">Custom Alphabet...</option>
                  </select>
                </div>

                {preset === "custom" && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Custom Symbols</label>
                    <input
                      type="text"
                      value={customAlphabet}
                      onChange={(e) => setCustomAlphabet(e.target.value)}
                      placeholder="e.g. 0123456789ABCDEF!@#"
                      className={`w-full p-2.5 rounded-xl text-sm border font-mono outline-none ${t.input}`}
                    />
                  </div>
                )}

                {/* Length Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider">ID Length</label>
                    <span className="text-sm font-mono font-bold">{length} chars</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={128}
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </>
            )}

            {/* Batch Count */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider">Batch Size</label>
                <span className="text-sm font-mono font-bold">{batchSize}</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${t.primaryBtn}`}
            >
              <FaSync /> Regenerate
            </button>
          </div>

          {/* Output Display */}
          <div className={`lg:col-span-2 p-6 rounded-3xl border ${t.card} flex flex-col justify-between space-y-4`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FaShieldAlt className="text-blue-500" /> Generated Output ({generatedIds.length})
                </h2>
                {generatedIds.length > 1 && (
                  <button
                    onClick={copyAll}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${t.secondaryBtn}`}
                  >
                    {copiedAll ? <FaCheck className="text-emerald-500" /> : <FaCopy />} Copy All
                  </button>
                )}
              </div>

              {/* Generated ID Box */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {generatedIds.map((id, index) => (
                  <div
                    key={index}
                    className={`p-3.5 rounded-xl border font-mono text-sm sm:text-base flex items-center justify-between gap-3 ${t.codeBox}`}
                  >
                    <span className="break-all">{id}</span>
                    <button
                      onClick={() => copyToClipboard(id, index)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all shrink-0 text-white"
                      title="Copy ID"
                    >
                      {copiedIndex === index ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Collision Analysis Info */}
            <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${t.badge}`}>
              <FaInfoCircle className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
              <div>
                <div className="font-bold mb-0.5">Entropy & Collision Analysis</div>
                <div>{collisionEstimate}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ULID Timestamp Inspector Section */}
        <div className={`p-6 sm:p-8 rounded-3xl border ${t.card} space-y-4`}>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FaClock className="text-purple-500" /> ULID Timestamp Decoder
          </h2>
          <p className={`text-sm ${t.subtext}`}>
            Paste any 26-character Crockford Base32 ULID to extract its creation timestamp.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              value={inspectUlid}
              onChange={(e) => setInspectUlid(e.target.value)}
              placeholder="e.g. 01ARZ3NDEKTSV4RRFFQ69G5FAV"
              className={`sm:col-span-2 p-3 rounded-xl text-sm font-mono border outline-none ${t.input}`}
            />
            <button
              onClick={() => setInspectUlid(generateUlid())}
              className={`p-3 rounded-xl text-sm border font-medium transition-all ${t.secondaryBtn}`}
            >
              Paste Sample ULID
            </button>
          </div>

          {inspectUlid && (
            <div className={`p-4 rounded-2xl border text-sm space-y-2 ${t.codeBox}`}>
              {decodedDate ? (
                <div>
                  <div className="text-xs uppercase font-semibold text-zinc-400">Decoded UTC Timestamp</div>
                  <div className="font-mono text-base font-bold">{decodedDate.toUTCString()}</div>
                  <div className="text-xs text-zinc-400 mt-1">Local: {decodedDate.toLocaleString()}</div>
                </div>
              ) : (
                <div className="text-rose-400 text-xs">Invalid ULID string format or Crockford Base32 character encountered.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
