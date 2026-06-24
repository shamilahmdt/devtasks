import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CryptoJS from "crypto-js";
import { useTheme } from "../../../context/ThemeContext";

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

const JwtEncoder = () => {
  const { dark } = useTheme();

  const [header, setHeader] = useState(defaultHeader);
  const [payload, setPayload] = useState(samplePayload);
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [algorithm, setAlgorithm] = useState("HS256");
  const [isBase64Secret, setIsBase64Secret] = useState(false);
  const [copied, setCopied] = useState(false);

  const theme = {
    wrapper: dark ? "bg-[#090A0F] text-zinc-100" : "bg-[#F8F9FA] text-zinc-900",
    panel: dark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200",
    input: dark
      ? "bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
      : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400",
    button: dark
      ? "bg-white text-black hover:bg-zinc-200"
      : "bg-black text-white hover:bg-zinc-800",
    ghost: dark ? "border-zinc-700 hover:bg-zinc-800" : "border-zinc-200 hover:bg-zinc-100",
  };

  const result = useMemo(() => {
    try {
      const parsedHeader = JSON.parse(header);
      const parsedPayload = JSON.parse(payload);

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
        headerError: header.trim() ? message : "Header JSON is required.",
        payloadError: payload.trim() ? message : "Payload JSON is required.",
      };
    }
  }, [header, payload, secret, algorithm, isBase64Secret]);

  const copyJwt = async () => {
    if (!result.token) return;
    await navigator.clipboard.writeText(result.token);
    setCopied(true);
  };

  const clearAll = () => {
    setHeader(defaultHeader);
    setPayload("");
    setSecret("");
    setAlgorithm("HS256");
    setIsBase64Secret(false);
    setCopied(false);
  };

  return (
    <div className={`${theme.wrapper} min-h-screen w-full p-4 md:p-8 transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto">
        <Link
          to="/devutilities"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-current mb-8"
        >
          ← Back to Dev Utilities
        </Link>

        <header className="mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            JWT Encoder & Signature Generator
          </h1>
          <p className="text-zinc-500 font-medium mt-2">
            Create signed JWT tokens offline using HS256, HS384, and HS512.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className={`${theme.panel} border rounded-3xl p-5 md:p-6`}>
            <h2 className="text-xl font-black uppercase tracking-tight mb-5">
              Header JSON
            </h2>
            <textarea
              value={header}
              onChange={(e) => {
                setHeader(e.target.value);
                setCopied(false);
              }}
              className={`${theme.input} w-full min-h-[180px] border rounded-2xl p-4 outline-none font-mono text-sm resize-y`}
            />
            {result.headerError && (
              <p className="text-red-500 text-sm font-semibold mt-3">
                {result.headerError}
              </p>
            )}
          </section>

          <section className={`${theme.panel} border rounded-3xl p-5 md:p-6`}>
            <h2 className="text-xl font-black uppercase tracking-tight mb-5">
              Payload JSON
            </h2>
            <textarea
              value={payload}
              onChange={(e) => {
                setPayload(e.target.value);
                setCopied(false);
              }}
              className={`${theme.input} w-full min-h-[180px] border rounded-2xl p-4 outline-none font-mono text-sm resize-y`}
            />
            {result.payloadError && (
              <p className="text-red-500 text-sm font-semibold mt-3">
                {result.payloadError}
              </p>
            )}
          </section>
        </div>

        <section className={`${theme.panel} border rounded-3xl p-5 md:p-6 mt-6`}>
          <h2 className="text-xl font-black uppercase tracking-tight mb-5">
            Signature Config
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              value={secret}
              onChange={(e) => {
                setSecret(e.target.value);
                setCopied(false);
              }}
              placeholder="HMAC secret"
              className={`${theme.input} border rounded-xl px-4 py-3 outline-none font-mono text-sm`}
            />

            <select
              value={algorithm}
              onChange={(e) => {
                setAlgorithm(e.target.value);
                setCopied(false);
              }}
              className={`${theme.input} border rounded-xl px-4 py-3 outline-none font-mono text-sm`}
            >
              <option value="HS256">HS256</option>
              <option value="HS384">HS384</option>
              <option value="HS512">HS512</option>
            </select>

            <label className={`${theme.ghost} border rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-bold`}>
              <input
                type="checkbox"
                checked={isBase64Secret}
                onChange={(e) => setIsBase64Secret(e.target.checked)}
              />
              Base64 Secret
            </label>
          </div>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => setPayload(samplePayload)}
              className={`${theme.button} px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest`}
            >
              Sample Payload
            </button>
            <button
              onClick={copyJwt}
              className={`${theme.ghost} border px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest`}
            >
              {copied ? "Copied" : "Copy JWT"}
            </button>
            <button
              onClick={clearAll}
              className={`${theme.ghost} border px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest`}
            >
              Clear
            </button>
          </div>
        </section>

        <section className={`${theme.panel} border rounded-3xl p-5 md:p-6 mt-6`}>
          <h2 className="text-xl font-black uppercase tracking-tight mb-5">
            Encoded JWT Output
          </h2>
          <textarea
            readOnly
            value={result.token}
            placeholder="Generated JWT will appear here..."
            className={`${theme.input} w-full min-h-[160px] border rounded-2xl p-4 outline-none font-mono text-sm resize-y break-all`}
          />
        </section>
      </div>
    </div>
  );
};

export default JwtEncoder;