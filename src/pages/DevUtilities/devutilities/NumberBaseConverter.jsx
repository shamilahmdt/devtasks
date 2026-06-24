import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

// Constants -------------------------------------------------------------------

const BASES = {
  DEC: { label: "Decimal", radix: 10, pattern: /^-?[0-9]+$/ },
  HEX: { label: "Hexadecimal", radix: 16, pattern: /^-?[0-9a-fA-F]+$/ },
  BIN: { label: "Binary", radix: 2, pattern: /^-?[01]+$/ },
  OCT: { label: "Octal", radix: 8, pattern: /^-?[0-7]+$/ },
};

const OPERATORS = [
  { key: "AND", symbol: "&", label: "AND" },
  { key: "OR", symbol: "|", label: "OR" },
  { key: "XOR", symbol: "^", label: "XOR" },
  { key: "NOT", symbol: "~", label: "NOT (A only)" },
  { key: "LSHIFT", symbol: "<<", label: "LSHIFT" },
  { key: "RSHIFT", symbol: ">>", label: "RSHIFT" },
];

const BIT_WIDTHS = [8, 16];

// Core Logic --------------------------------------------------------------------

/**
 * Parses a string in a given base into a JS number.
 * Returns: number on success, null for empty input, undefined for invalid characters.
 */
const parseToDecimal = (value, baseKey) => {
  if (value === "" || value === null || value === undefined) return null;
  const cleaned = String(value).trim();
  if (cleaned === "" || cleaned === "-") return null;

  const { pattern, radix } = BASES[baseKey];
  if (!pattern.test(cleaned)) return undefined;

  const parsed = parseInt(cleaned, radix);
  if (!Number.isFinite(parsed)) return undefined;
  if (Math.abs(parsed) > Number.MAX_SAFE_INTEGER) return undefined;

  return parsed;
};

const decimalToAllBases = (decimalValue) => {
  if (decimalValue === null) {
    return { DEC: "", HEX: "", BIN: "", OCT: "" };
  }
  const isNegative = decimalValue < 0;
  const abs = Math.abs(decimalValue);
  const sign = isNegative ? "-" : "";

  return {
    DEC: String(decimalValue),
    HEX: sign + abs.toString(16).toUpperCase(),
    BIN: sign + abs.toString(2),
    OCT: sign + abs.toString(8),
  };
};

/** Force a value into unsigned 32-bit space for bitwise display/operations. */
const toUint32 = (n) => n >>> 0;

const runBitwiseOp = (a, b, opKey) => {
  const safeA = Number.isFinite(a) ? a : 0;
  const safeB = Number.isFinite(b) ? b : 0;

  switch (opKey) {
    case "AND":
      return (safeA & safeB) >>> 0;
    case "OR":
      return (safeA | safeB) >>> 0;
    case "XOR":
      return (safeA ^ safeB) >>> 0;
    case "NOT":
      return ~safeA >>> 0;
    case "LSHIFT":
      // Shift amounts are taken mod 32, matching JS semantics, to avoid nonsensical huge shifts.
      return (safeA << (safeB & 31)) >>> 0;
    case "RSHIFT":
      return safeA >>> (safeB & 31);
    default:
      return 0;
  }
};

/** Returns an array of 0/1, most-significant bit first, sliced to bitWidth. */
const getBitArray = (value, bitWidth) => {
  const v = toUint32(value);
  const bits = [];
  for (let i = bitWidth - 1; i >= 0; i--) {
    bits.push((v >>> i) & 1);
  }
  return bits;
};

const formatBytes = (n) => n.toLocaleString();

// Reusable Sub-Components --------------------------------------------------------

const BaseInputField = ({ baseKey, label, value, onChange, error, t }) => (
  <div className="flex flex-col space-y-1.5">
    <label
      className={`text-xs font-semibold uppercase tracking-widest ${t.subtext}`}
    >
      {label}
    </label>
    <input
      type="text"
      inputMode="text"
      autoComplete="off"
      spellCheck={false}
      value={value}
      onChange={(e) => onChange(baseKey, e.target.value)}
      placeholder="0"
      className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono outline-none transition-colors duration-200 ${
        error ? t.inputError : t.input
      }`}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const BitGrid = ({ bits, bitWidth, t, highlight }) => (
  <div className="flex flex-wrap gap-1">
    {bits.map((bit, idx) => {
      const bitIndex = bitWidth - 1 - idx;
      const isByteBoundary = bitIndex % 8 === 0 && idx !== bits.length - 1;
      return (
        <div key={idx} className={`flex items-center ${isByteBoundary ? "mr-2" : ""}`}>
          <div
            className={`w-7 h-7 flex items-center justify-center rounded-lg border text-xs font-mono font-semibold transition-colors duration-150 ${
              bit === 1
                ? highlight
                  ? t.bitOnHighlight
                  : t.bitOn
                : t.bitOff
            }`}
            title={`bit ${bitIndex}`}
          >
            {bit}
          </div>
        </div>
      );
    })}
  </div>
);

// Main Component ------------------------------------------------------------------

const NumberBaseConverter = () => {
  const { dark } = useTheme();

  // --- Base converter panel state ---
  const [values, setValues] = useState({ DEC: "", HEX: "", BIN: "", OCT: "" });
  const [errors, setErrors] = useState({ DEC: "", HEX: "", BIN: "", OCT: "" });

  // --- Bitwise calculator panel state ---
  const [valueA, setValueA] = useState("255");
  const [baseA, setBaseA] = useState("DEC");
  const [valueB, setValueB] = useState("15");
  const [baseB, setBaseB] = useState("DEC");
  const [operator, setOperator] = useState("AND");
  const [bitWidth, setBitWidth] = useState(8);

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      heading: "text-zinc-900",
      subtext: "text-zinc-500",
      card: "bg-white border-zinc-200/85",
      input:
        "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400",
      inputError: "bg-red-50 border-red-300 text-red-700 placeholder-red-300",
      select:
        "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-400 outline-none",
      sampleBtn: "bg-black text-white border-black hover:bg-zinc-800",
      clearBtn: "bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-100",
      copyBtn:
        "border-zinc-300 text-zinc-600 hover:bg-zinc-100 hover:text-black",
      opBtn: "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100",
      opBtnActive: "bg-zinc-900 text-white border-zinc-900",
      widthBtn: "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100",
      widthBtnActive: "bg-zinc-900 text-white border-zinc-900",
      bitOn: "bg-zinc-900 text-white border-zinc-900",
      bitOnHighlight: "bg-emerald-600 text-white border-emerald-600",
      bitOff: "bg-zinc-100 text-zinc-400 border-zinc-200",
      resultCard: "bg-zinc-50 border-zinc-200",
      backLink:
        "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      heading: "text-zinc-100",
      subtext: "text-zinc-500",
      card: "bg-zinc-900/50 border-zinc-800/85",
      input:
        "bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500",
      inputError: "bg-red-950/40 border-red-800 text-red-300 placeholder-red-700",
      select:
        "bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-zinc-500 outline-none",
      sampleBtn: "bg-white text-black border-white hover:bg-zinc-200",
      clearBtn: "bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700",
      copyBtn:
        "border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white",
      opBtn: "bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800",
      opBtnActive: "bg-white text-zinc-900 border-white",
      widthBtn: "bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800",
      widthBtnActive: "bg-white text-zinc-900 border-white",
      bitOn: "bg-white text-zinc-900 border-white",
      bitOnHighlight: "bg-emerald-500 text-zinc-950 border-emerald-500",
      bitOff: "bg-zinc-900 text-zinc-600 border-zinc-800",
      resultCard: "bg-zinc-900/70 border-zinc-800",
      backLink:
        "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600",
    },
  };

  const t = dark ? theme.dark : theme.light;

  // --- Base converter handlers ---
  const handleBaseChange = useCallback((changedBase, rawValue) => {
    const parsed = parseToDecimal(rawValue, changedBase);

    if (parsed === undefined) {
      // Invalid characters for this base: keep the field editable, flag the error,
      // and don't touch the other fields so the user can fix the typo in place.
      setValues((prev) => ({ ...prev, [changedBase]: rawValue }));
      setErrors((prev) => ({
        ...prev,
        [changedBase]: `Invalid ${BASES[changedBase].label.toLowerCase()} digit`,
      }));
      return;
    }

    const allBases = decimalToAllBases(parsed);
    setValues(allBases);
    setErrors({ DEC: "", HEX: "", BIN: "", OCT: "" });
  }, []);

  const handleSample = () => {
    const allBases = decimalToAllBases(255);
    setValues(allBases);
    setErrors({ DEC: "", HEX: "", BIN: "", OCT: "" });
  };

  const handleClearConverter = () => {
    setValues({ DEC: "", HEX: "", BIN: "", OCT: "" });
    setErrors({ DEC: "", HEX: "", BIN: "", OCT: "" });
  };

  const handleCopy = async (value, label) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error(`Failed to copy ${label}`);
    }
  };

  // --- Bitwise calculator derived state ---
  const parsedA = useMemo(() => parseToDecimal(valueA, baseA), [valueA, baseA]);
  const parsedB = useMemo(() => parseToDecimal(valueB, baseB), [valueB, baseB]);

  const safeA = typeof parsedA === "number" ? parsedA : 0;
  const safeB = typeof parsedB === "number" ? parsedB : 0;
  const aIsInvalid = parsedA === undefined;
  const bIsInvalid = parsedB === undefined;

  const result = useMemo(
    () => runBitwiseOp(safeA, safeB, operator),
    [safeA, safeB, operator]
  );

  const bitsA = useMemo(() => getBitArray(safeA, bitWidth), [safeA, bitWidth]);
  const bitsB = useMemo(() => getBitArray(safeB, bitWidth), [safeB, bitWidth]);
  const bitsResult = useMemo(
    () => getBitArray(result, bitWidth),
    [result, bitWidth]
  );

  const handleSampleBitwise = () => {
    setValueA("255");
    setBaseA("DEC");
    setValueB("0xFA".replace("0x", ""));
    setBaseB("HEX");
    setOperator("AND");
  };

  const handleClearBitwise = () => {
    setValueA("");
    setValueB("");
    setOperator("AND");
  };

  return (
    <div className={`min-h-screen ${t.wrapper} px-6 py-10`}>
      <title>Number Base Converter — DevTasks</title>
      <meta
        name="description"
        content="Convert numbers between decimal, hexadecimal, binary, and octal, and visualize bitwise operations bit by bit."
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${t.backLink}`}
            title="Back to Workspace"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${t.heading}`}>
              Number Base Converter
            </h1>
            <p className={`mt-1 text-sm ${t.subtext}`}>
              Convert between bases and visualize bitwise operations in real time.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Base Converter Panel */}
          <div className={`rounded-3xl border ${t.card} p-6`}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <p className={`text-xs uppercase tracking-widest font-medium ${t.subtext}`}>
                Base Converter
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSample}
                  className={`px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 ${t.sampleBtn}`}
                >
                  Sample Value
                </button>
                <button
                  type="button"
                  onClick={handleClearConverter}
                  className={`px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 ${t.clearBtn}`}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(BASES).map(([baseKey, { label }]) => (
                <div key={baseKey} className="flex items-end gap-2">
                  <div className="flex-1">
                    <BaseInputField
                      baseKey={baseKey}
                      label={label}
                      value={values[baseKey]}
                      onChange={handleBaseChange}
                      error={errors[baseKey]}
                      t={t}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(values[baseKey], label)}
                    disabled={!values[baseKey]}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all duration-200 active:scale-95 disabled:opacity-40 ${t.copyBtn}`}
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bitwise Calculator Panel */}
          <div className={`rounded-3xl border ${t.card} p-6`}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <p className={`text-xs uppercase tracking-widest font-medium ${t.subtext}`}>
                Bitwise Calculator
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSampleBitwise}
                  className={`px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 ${t.sampleBtn}`}
                >
                  Sample Values
                </button>
                <button
                  type="button"
                  onClick={handleClearBitwise}
                  className={`px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 ${t.clearBtn}`}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Inputs A / B */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="flex flex-col space-y-1.5">
                <label className={`text-xs font-semibold uppercase tracking-widest ${t.subtext}`}>
                  Value A
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    value={valueA}
                    onChange={(e) => setValueA(e.target.value)}
                    placeholder="0"
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-mono outline-none transition-colors duration-200 ${
                      aIsInvalid ? t.inputError : t.input
                    }`}
                  />
                  <select
                    value={baseA}
                    onChange={(e) => setBaseA(e.target.value)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-semibold uppercase ${t.select}`}
                  >
                    {Object.entries(BASES)
                      .filter(([k]) => k !== "OCT")
                      .map(([k, { label }]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                  </select>
                </div>
                {aIsInvalid && (
                  <p className="text-xs text-red-500">Invalid digit for selected base</p>
                )}
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className={`text-xs font-semibold uppercase tracking-widest ${t.subtext}`}>
                  Value B {operator === "NOT" && <span className="opacity-60">(unused)</span>}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    value={valueB}
                    onChange={(e) => setValueB(e.target.value)}
                    placeholder="0"
                    disabled={operator === "NOT"}
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-mono outline-none transition-colors duration-200 disabled:opacity-40 ${
                      bIsInvalid ? t.inputError : t.input
                    }`}
                  />
                  <select
                    value={baseB}
                    onChange={(e) => setBaseB(e.target.value)}
                    disabled={operator === "NOT"}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-semibold uppercase disabled:opacity-40 ${t.select}`}
                  >
                    {Object.entries(BASES)
                      .filter(([k]) => k !== "OCT")
                      .map(([k, { label }]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                  </select>
                </div>
                {bIsInvalid && operator !== "NOT" && (
                  <p className="text-xs text-red-500">Invalid digit for selected base</p>
                )}
              </div>
            </div>

            {/* Operator + bit width selectors */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex flex-wrap gap-2">
                {OPERATORS.map(({ key, symbol, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setOperator(key)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold uppercase tracking-wide transition-all duration-200 ${
                      operator === key ? t.opBtnActive : t.opBtn
                    }`}
                    title={label}
                  >
                    {symbol} {key}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 ml-auto">
                {BIT_WIDTHS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setBitWidth(w)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all duration-200 ${
                      bitWidth === w ? t.widthBtnActive : t.widthBtn
                    }`}
                  >
                    {w}-bit
                  </button>
                ))}
              </div>
            </div>

            {/* Bit grids */}
            <div className="space-y-4">
              <div>
                <p className={`text-xs uppercase tracking-widest font-medium mb-2 ${t.subtext}`}>
                  Input A ({safeA.toLocaleString()})
                </p>
                <BitGrid bits={bitsA} bitWidth={bitWidth} t={t} />
              </div>

              {operator !== "NOT" && (
                <div>
                  <p className={`text-xs uppercase tracking-widest font-medium mb-2 ${t.subtext}`}>
                    Input B ({safeB.toLocaleString()})
                  </p>
                  <BitGrid bits={bitsB} bitWidth={bitWidth} t={t} />
                </div>
              )}

              <div className={`rounded-2xl border ${t.resultCard} p-4`}>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <p className={`text-xs uppercase tracking-widest font-medium ${t.subtext}`}>
                    Result — Decimal {formatBytes(result)} · Hex{" "}
                    {result.toString(16).toUpperCase()} · Bin {result.toString(2)}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopy(String(result), "Result")}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-widest transition-all duration-200 active:scale-95 ${t.copyBtn}`}
                  >
                    Copy
                  </button>
                </div>
                <BitGrid bits={bitsResult} bitWidth={bitWidth} t={t} highlight />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberBaseConverter;