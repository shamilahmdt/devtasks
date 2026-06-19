import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CryptoJS from "crypto-js";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const DEFAULT_HEADER = {
  alg: "HS256",
  typ: "JWT",
};

const SAMPLE_PAYLOAD = {
  sub: "1234567890",
  name: "John Doe",
  iat: 1516239022,
};

const base64UrlEncode = (str) => {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const signJwt = (
  header,
  payload,
  secret,
  algorithm,
  base64Secret = false
) => {
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  const data = `${encodedHeader}.${encodedPayload}`;

  let key = secret;

  if (base64Secret) {
    key = CryptoJS.enc.Base64.parse(secret);
  }

  let signature;

  switch (algorithm) {
    case "HS384":
      signature = CryptoJS.HmacSHA384(data, key);
      break;

    case "HS512":
      signature = CryptoJS.HmacSHA512(data, key);
      break;

    default:
      signature = CryptoJS.HmacSHA256(data, key);
  }

  const signatureBase64Url = CryptoJS.enc.Base64.stringify(signature)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${data}.${signatureBase64Url}`;
};

const JwtEncoder = () => {
  const { dark } = useTheme();

  const [headerText, setHeaderText] = useState(
    JSON.stringify(DEFAULT_HEADER, null, 2)
  );

  const [payloadText, setPayloadText] = useState(
    JSON.stringify(SAMPLE_PAYLOAD, null, 2)
  );

  const [secret, setSecret] = useState("");
  const [algorithm, setAlgorithm] = useState("HS256");
  const [base64Secret, setBase64Secret] = useState(false);

  const [headerError, setHeaderError] = useState("");
  const [payloadError, setPayloadError] = useState("");

  const [jwt, setJwt] = useState("");

  useEffect(() => {
    try {
      const parsedHeader = JSON.parse(headerText);
      parsedHeader.alg = algorithm;

      setHeaderError("");

      const parsedPayload = JSON.parse(payloadText);

      setPayloadError("");

      const token = signJwt(
        parsedHeader,
        parsedPayload,
        secret,
        algorithm,
        base64Secret
      );

      setJwt(token);
    } catch (err) {
      if (err.message.includes("JSON")) {
        try {
          JSON.parse(headerText);
          setHeaderError("");
        } catch {
          setHeaderError("Invalid Header JSON");
        }

        try {
          JSON.parse(payloadText);
          setPayloadError("");
        } catch {
          setPayloadError("Invalid Payload JSON");
        }
      }

      setJwt("");
    }
  }, [
    headerText,
    payloadText,
    secret,
    algorithm,
    base64Secret,
  ]);

  const handleCopy = async () => {
    if (!jwt) return;

    try {
      await navigator.clipboard.writeText(jwt);
      toast.success("JWT copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleSample = () => {
    setPayloadText(JSON.stringify(SAMPLE_PAYLOAD, null, 2));
  };

  const handleClear = () => {
    setPayloadText("{}");
    setSecret("");
    setJwt("");
  };

  return (
    <div
      className={`h-[calc(100vh-76px)] px-4 sm:px-6 py-6 overflow-hidden relative flex flex-col justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>JWT Encoder — Dev Utilities</title>

      <div
        className={`absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-30 ${
          dark ? "bg-zinc-800" : "bg-neutral-200"
        }`}
      />

      <div
        className={`absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-30 ${
          dark ? "bg-zinc-900" : "bg-neutral-100"
        }`}
      />

      <div
        className={`relative z-10 w-[90%] mx-auto rounded-[32px] border shadow-xl flex flex-col overflow-hidden ${
          dark
            ? "bg-zinc-900 border-zinc-800"
            : "bg-white border-neutral-200"
        }`}
      >
        <div
          className={`h-2 w-full ${
            dark ? "bg-white" : "bg-black"
          }`}
        />

        <div className="px-6 pt-6 flex items-center gap-3">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border ${
              dark
                ? "bg-zinc-800 border-zinc-700 text-zinc-300"
                : "bg-white border-neutral-200 text-neutral-600"
            }`}
          >
            ←
          </Link>

          <h1
            className={`text-2xl font-black uppercase ${
              dark ? "text-white" : "text-black"
            }`}
          >
            JWT Encoder
          </h1>
        </div>

        <div className="p-6 grid lg:grid-cols-2 gap-5">

          {/* Header */}

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest">
              Header JSON
            </label>

            <textarea
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              spellCheck={false}
              className={`w-full h-52 rounded-2xl border p-4 font-mono text-sm resize-none ${
                dark
                  ? "bg-zinc-950 border-zinc-800 text-white"
                  : "bg-neutral-50 border-neutral-300"
              }`}
            />

            {headerError && (
              <p className="text-xs text-red-500">
                {headerError}
              </p>
            )}
          </div>

          {/* Payload */}

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest">
              Payload JSON
            </label>

            <textarea
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              spellCheck={false}
              className={`w-full h-52 rounded-2xl border p-4 font-mono text-sm resize-none ${
                dark
                  ? "bg-zinc-950 border-zinc-800 text-white"
                  : "bg-neutral-50 border-neutral-300"
              }`}
            />

            {payloadError && (
              <p className="text-xs text-red-500">
                {payloadError}
              </p>
            )}
          </div>

          {/* Config */}

          <div className="space-y-4 lg:col-span-2">

            <input
              type="text"
              placeholder="Secret Key"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className={`w-full rounded-2xl border px-4 py-3 ${
                dark
                  ? "bg-zinc-950 border-zinc-800 text-white"
                  : "bg-neutral-50 border-neutral-300"
              }`}
            />

            <div className="flex flex-wrap gap-4 items-center">

              <select
                value={algorithm}
                onChange={(e) =>
                  setAlgorithm(e.target.value)
                }
                className={`rounded-xl border px-4 py-3 ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-white"
                    : "bg-neutral-50 border-neutral-300"
                }`}
              >
                <option>HS256</option>
                <option>HS384</option>
                <option>HS512</option>
              </select>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={base64Secret}
                  onChange={(e) =>
                    setBase64Secret(e.target.checked)
                  }
                />
                Base64 Secret
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleSample}
                className="rounded-xl border px-4 py-3 font-bold"
              >
                Sample Payload
              </button>

              <button
                onClick={handleCopy}
                className={`rounded-xl px-4 py-3 font-bold ${
                  dark
                    ? "bg-white text-black"
                    : "bg-black text-white"
                }`}
              >
                Copy JWT
              </button>

              <button
                onClick={handleClear}
                className="rounded-xl border px-4 py-3 font-bold"
              >
                Clear
              </button>
            </div>

            <div
              className={`rounded-2xl border p-4 font-mono text-xs break-all ${
                dark
                  ? "bg-zinc-950 border-zinc-800 text-zinc-300"
                  : "bg-neutral-50 border-neutral-300"
              }`}
            >
              {jwt || "Generated JWT will appear here..."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JwtEncoder;