import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const ALGORITHMS = { SHA1: "SHA-1", SHA256: "SHA-256", SHA512: "SHA-512" };

// Decode a base32 string (RFC 4648) into bytes. Spaces, dashes and padding are ignored.
const base32Decode = (input) => {
  const clean = input.replace(/[\s-]/g, "").replace(/=+$/, "").toUpperCase();
  if (!clean) throw new Error("Enter a base32 secret.");

  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid base32 character "${char}". Use A-Z and 2-7.`);
    }
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >>> bits) & 0xff);
    }
  }
  return new Uint8Array(bytes);
};

const base32Encode = (bytes) => {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      output += BASE32_ALPHABET[(value >>> bits) & 31];
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
};

// RFC 4226 HOTP using the Web Crypto API (runs fully in the browser).
const generateHotp = async (keyBytes, counter, algorithm, digits) => {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: ALGORITHMS[algorithm] },
    false,
    ["sign"],
  );

  const message = new ArrayBuffer(8);
  const view = new DataView(message);
  view.setUint32(0, Math.floor(counter / 2 ** 32));
  view.setUint32(4, counter >>> 0);

  const hmac = new Uint8Array(await crypto.subtle.sign("HMAC", key, message));
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3];

  return String(binary % 10 ** digits).padStart(digits, "0");
};

// RFC 6238 TOTP: HOTP where the counter is the number of periods since the Unix epoch.
const generateTotp = (keyBytes, timeMs, { algorithm, digits, period }) =>
  generateHotp(keyBytes, Math.floor(timeMs / 1000 / period), algorithm, digits);

const parseOtpauthUri = (uri) => {
  const url = new URL(uri.trim());
  if (url.protocol !== "otpauth:" || url.hostname !== "totp") {
    throw new Error("Only otpauth://totp/ links are supported.");
  }
  const params = url.searchParams;
  const secret = params.get("secret");
  if (!secret) throw new Error("The otpauth link has no secret parameter.");

  const algorithm = (params.get("algorithm") || "SHA1").toUpperCase();
  const digits = Number(params.get("digits") || 6);
  const period = Number(params.get("period") || 30);

  return {
    secret,
    algorithm: ALGORITHMS[algorithm] ? algorithm : "SHA1",
    digits: digits === 8 ? 8 : 6,
    period: Number.isInteger(period) && period > 0 ? period : 30,
    label: decodeURIComponent(url.pathname.replace(/^\//, "")),
    issuer: params.get("issuer") || "",
  };
};

const formatCode = (code) =>
  code.length === 8
    ? `${code.slice(0, 4)} ${code.slice(4)}`
    : `${code.slice(0, 3)} ${code.slice(3)}`;

const TotpGenerator = () => {
  const { dark } = useTheme();
  const [secret, setSecret] = useState("");
  const [algorithm, setAlgorithm] = useState("SHA1");
  const [digits, setDigits] = useState(6);
  const [period, setPeriod] = useState(30);
  const [account, setAccount] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [codes, setCodes] = useState({ current: "", next: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);

  const counter = Math.floor(now / 1000 / period);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!secret.trim()) {
        setError("");
        setCodes({ current: "", next: "" });
        return;
      }
      try {
        const keyBytes = base32Decode(secret);
        const options = { algorithm, digits, period };
        const [current, next] = await Promise.all([
          generateTotp(keyBytes, counter * period * 1000, options),
          generateTotp(keyBytes, (counter + 1) * period * 1000, options),
        ]);
        if (cancelled) return;
        setError("");
        setCodes({ current, next });
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Could not generate a code.");
        setCodes({ current: "", next: "" });
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [secret, algorithm, digits, period, counter]);

  const secondsLeft = period - ((now / 1000) % period);
  const progress = Math.min(100, Math.max(0, (secondsLeft / period) * 100));

  const handleSecretChange = (value) => {
    if (value.trim().toLowerCase().startsWith("otpauth://")) {
      try {
        const parsed = parseOtpauthUri(value);
        setSecret(parsed.secret);
        setAlgorithm(parsed.algorithm);
        setDigits(parsed.digits);
        setPeriod(parsed.period);
        setAccount(
          [parsed.issuer, parsed.label].filter(Boolean).join(" — "),
        );
        toast.success("otpauth link imported");
      } catch (err) {
        setSecret(value);
        setError(err.message);
      }
      return;
    }
    setAccount("");
    setSecret(value);
  };

  const handleRandomSecret = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(20));
    setAccount("");
    setSecret(base32Encode(bytes));
  };

  const handleClear = () => {
    setSecret("");
    setAccount("");
    setAlgorithm("SHA1");
    setDigits(6);
    setPeriod(30);
  };

  const handleCopy = async () => {
    if (!codes.current) return;
    try {
      await navigator.clipboard.writeText(codes.current);
      toast.success("Code copied");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const secretLooksValid = useMemo(() => {
    if (!secret.trim()) return null;
    try {
      base32Decode(secret);
      return true;
    } catch {
      return false;
    }
  }, [secret]);

  const labelClass = `text-xs font-black uppercase tracking-widest ${
    dark ? "text-zinc-400" : "text-neutral-500"
  }`;
  const fieldClass = `w-full rounded-xl border px-4 py-3 text-sm font-mono outline-none transition-all duration-300 ${
    dark
      ? "bg-zinc-950 border-zinc-700 text-zinc-100 focus:border-white"
      : "bg-white border-neutral-300 text-neutral-900 focus:border-black"
  }`;
  const buttonClass = `px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 ${
    dark
      ? "border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
      : "border-neutral-300 text-neutral-600 hover:bg-neutral-100 hover:text-black"
  }`;

  return (
    <div
      className={`min-h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto overflow-x-hidden relative flex flex-col justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>TOTP Generator — DevTasks</title>
      <meta
        name="description"
        content="Generate time-based one-time passwords (RFC 6238) from a base32 secret or otpauth link, fully offline in your browser."
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
        className={`relative z-10 w-full max-w-5xl md:w-[85%] mx-auto rounded-[32px] border shadow-xl flex flex-col overflow-hidden transition-all duration-300 ${
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
            TOTP Generator
          </h1>
        </div>

        <div className="w-full p-5 sm:p-8">
          <div className="w-full flex flex-col md:flex-row gap-6">
            {/* Left side: secret and settings */}
            <div className="w-full md:w-1/2 flex flex-col space-y-4">
              <div className="flex justify-between items-center gap-2">
                <label htmlFor="totp-secret" className={labelClass}>
                  Secret or otpauth link
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleRandomSecret}
                    className={buttonClass}
                  >
                    Random
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className={buttonClass}
                  >
                    Clear
                  </button>
                </div>
              </div>
              <textarea
                id="totp-secret"
                value={secret}
                onChange={(e) => handleSecretChange(e.target.value)}
                rows={4}
                spellCheck={false}
                autoComplete="off"
                placeholder="JBSWY3DPEHPK3PXP  or  otpauth://totp/Example:me@example.com?secret=..."
                className={`${fieldClass} resize-none`}
              />
              {secretLooksValid === false && !error && (
                <p className="text-xs font-bold text-red-500">
                  Secret is not valid base32.
                </p>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="totp-algorithm" className={labelClass}>
                    Algorithm
                  </label>
                  <select
                    id="totp-algorithm"
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    className={fieldClass}
                  >
                    {Object.keys(ALGORITHMS).map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col space-y-2">
                  <label htmlFor="totp-digits" className={labelClass}>
                    Digits
                  </label>
                  <select
                    id="totp-digits"
                    value={digits}
                    onChange={(e) => setDigits(Number(e.target.value))}
                    className={fieldClass}
                  >
                    <option value={6}>6</option>
                    <option value={8}>8</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-2">
                  <label htmlFor="totp-period" className={labelClass}>
                    Period (s)
                  </label>
                  <input
                    id="totp-period"
                    type="number"
                    min={1}
                    max={300}
                    value={period}
                    onChange={(e) =>
                      setPeriod(Math.max(1, Number(e.target.value) || 30))
                    }
                    className={fieldClass}
                  />
                </div>
              </div>

              <p
                className={`text-xs leading-relaxed ${
                  dark ? "text-zinc-500" : "text-neutral-500"
                }`}
              >
                Everything runs in your browser with the Web Crypto API. Your
                secret is never sent anywhere or saved. Use test secrets when
                you can.
              </p>
            </div>

            {/* Right side: output */}
            <div className="w-full md:w-1/2 flex flex-col space-y-4">
              <span className={labelClass}>Current code</span>
              <div
                className={`rounded-2xl border p-6 flex flex-col items-center justify-center space-y-4 min-h-[220px] ${
                  dark
                    ? "bg-zinc-950 border-zinc-800"
                    : "bg-neutral-50 border-neutral-200"
                }`}
                aria-live="polite"
              >
                {error ? (
                  <p className="text-sm font-bold text-red-500 text-center">
                    {error}
                  </p>
                ) : codes.current ? (
                  <>
                    {account && (
                      <p
                        className={`text-xs font-bold text-center break-all ${
                          dark ? "text-zinc-400" : "text-neutral-500"
                        }`}
                      >
                        {account}
                      </p>
                    )}
                    <p
                      className={`text-4xl sm:text-5xl font-black font-mono tracking-widest ${
                        dark ? "text-white" : "text-black"
                      }`}
                    >
                      {formatCode(codes.current)}
                    </p>
                    <div className="w-full space-y-1">
                      <div
                        className={`h-2 w-full rounded-full overflow-hidden ${
                          dark ? "bg-zinc-800" : "bg-neutral-200"
                        }`}
                      >
                        <div
                          className={`h-full transition-[width] duration-200 ease-linear ${
                            dark ? "bg-white" : "bg-black"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p
                        className={`text-xs font-bold text-right ${
                          dark ? "text-zinc-400" : "text-neutral-500"
                        }`}
                      >
                        Refreshes in {Math.ceil(secondsLeft)}s
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className={buttonClass}
                    >
                      Copy code
                    </button>
                  </>
                ) : (
                  <p
                    className={`text-sm text-center ${
                      dark ? "text-zinc-500" : "text-neutral-400"
                    }`}
                  >
                    Enter a secret to see a live code.
                  </p>
                )}
              </div>

              {codes.next && !error && (
                <div
                  className={`rounded-xl border px-4 py-3 flex items-center justify-between ${
                    dark ? "border-zinc-800" : "border-neutral-200"
                  }`}
                >
                  <span className={labelClass}>Next code</span>
                  <span
                    className={`font-mono font-black tracking-widest ${
                      dark ? "text-zinc-300" : "text-neutral-700"
                    }`}
                  >
                    {formatCode(codes.next)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotpGenerator;
