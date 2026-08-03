import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import bcrypt from "bcryptjs";
import { useTheme } from "../../../context/ThemeContext";
import {
  FaKey,
  FaLock,
  FaCopy,
  FaClock,
  FaShieldAlt,
  FaInfoCircle,
} from "react-icons/fa";

const KEYTYPES = [
  { key: "RSA-OAEP", label: "RSA-OAEP" },
  { key: "RSA-PSS", label: "RSA-PSS" },
  { key: "ECDSA", label: "ECDSA" },
];

const KEYSIZES = [
  { key: 1024, label: "1024 bits" },
  { key: 2048, label: "2048 bits" },
  { key: 4096, label: "4096 bits" },
];

const HASH_ALGORITHMS = [
  { key: "SHA-256", label: "SHA-256" },
  { key: "SHA-384", label: "SHA-384" },
  { key: "SHA-512", label: "SHA-512" },
];

const CURVES = [
  { key: "P-256", label: "P-256" },
  { key: "P-384", label: "P-384" },
  { key: "P-521", label: "P-521" },
];

const KeyPairGenerator = () => {
  const { dark } = useTheme();

  const [keyType, setKeyType] = useState("RSA-OAEP");
  const [keySize, setKeySize] = useState(2048);
  const [hashAlgorithm, setHashAlgorithm] = useState("SHA-256");
  const [curve, setCurve] = useState("P-256");

  const [rsaSelected, setRsaSelected] = useState(true);

  // generated PEMs
  const [privatePem, setPrivatePem] = useState("");
  const [publicPem, setPublicPem] = useState("");

  useEffect(() => {
    if (keyType === "RSA-OAEP" || keyType === "RSA-PSS") {
      setRsaSelected(true);
    } else {
      setRsaSelected(false);
    }
  }, [keyType]);

  // Generate key pair and export to PEM format (PKCS#8 private, SPKI public)
  const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    let binary = "";
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  };

  const arrayBufferToPem = (buffer, label) => {
    const base64 = arrayBufferToBase64(buffer);
    const lines = base64.match(/.{1,64}/g)?.join("\n") || base64;
    return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----\n`;
  };

  const generateKeyPair = async (keyType, keySize, hashAlgorithm, curve) => {

    try {
      let keyPairPem = null;

      if (keyType === "RSA-OAEP" || keyType === "RSA-PSS") {
        const algorithm = {
          name: keyType,
          modulusLength: keySize,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: { name: hashAlgorithm },
        };

        const usages = keyType === "RSA-OAEP" ? ["encrypt", "decrypt"] : ["sign", "verify"];

        const kp = await window.crypto.subtle.generateKey(algorithm, true, usages);

        const exportedPriv = await window.crypto.subtle.exportKey("pkcs8", kp.privateKey);
        const exportedPub = await window.crypto.subtle.exportKey("spki", kp.publicKey);

        keyPairPem = {
          privateKey: arrayBufferToPem(exportedPriv, "PRIVATE KEY"),
          publicKey: arrayBufferToPem(exportedPub, "PUBLIC KEY"),
        };
      } else if (keyType === "ECDSA") {
        const algorithm = {
          name: "ECDSA",
          namedCurve: curve,
        };

        const kp = await window.crypto.subtle.generateKey(algorithm, true, ["sign", "verify"]);

        const exportedPriv = await window.crypto.subtle.exportKey("pkcs8", kp.privateKey);
        const exportedPub = await window.crypto.subtle.exportKey("spki", kp.publicKey);

        keyPairPem = {
          privateKey: arrayBufferToPem(exportedPriv, "PRIVATE KEY"),
          publicKey: arrayBufferToPem(exportedPub, "PUBLIC KEY"),
        };
      } else {
        toast.error("Unsupported key type");
        return;
      }


      toast.success("Key pair generated");
      setPrivatePem(keyPairPem.privateKey || "");
      setPublicPem(keyPairPem.publicKey || "");
    } catch (err) {
      toast.error("Failed to generate key pair: " + (err?.message || err));
    }
  };

  const copyPem = async (pem, label) => {
    if (!pem) return;
    try {
      await navigator.clipboard.writeText(pem);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  const downloadPem = (pem, filename) => {
    if (!pem) return;
    const blob = new Blob([pem], { type: "application/x-pem-file" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };



  const clearAll = () => {
    setKeyType("RSA-OAEP");
    setKeySize(2048);
    setHashAlgorithm("SHA-384");
    setCurve("P-256");
    setPublicPem("");
    setPrivatePem("");
  };

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      heading: "text-zinc-900",
      subtext: "text-zinc-500",
      card: "bg-white border-zinc-200/85 shadow-sm",
      input:
        "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 focus:outline-none",
      select:
        "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-400 focus:outline-none",
      buttonPrimary:
        "bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-sm",
      buttonSecondary:
        "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-colors",
      label: "text-zinc-500 font-semibold tracking-wider text-xs uppercase",
      result: "bg-zinc-50 border-zinc-200 text-zinc-700",
      infoCard: "bg-zinc-50/55 border-zinc-150/85 text-zinc-600",
      badge: "bg-zinc-100 text-zinc-700",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      heading: "text-zinc-100",
      subtext: "text-zinc-400",
      card: "bg-zinc-900/50 border-zinc-800/85 backdrop-blur-md shadow-lg",
      input:
        "bg-zinc-950/70 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-zinc-600 focus:ring-2 focus:ring-white/5 focus:outline-none",
      select:
        "bg-zinc-950/70 border-zinc-800 text-zinc-100 focus:border-zinc-750 focus:outline-none",
      buttonPrimary:
        "bg-white text-zinc-950 hover:bg-zinc-200 transition-colors shadow-sm",
      buttonSecondary:
        "bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white transition-colors",
      label: "text-zinc-400 font-semibold tracking-wider text-xs uppercase",
      result: "bg-zinc-950/80 border-zinc-800 text-zinc-300",
      infoCard: "bg-zinc-900/40 border-zinc-800/60 text-zinc-400",
      badge: "bg-zinc-800/50 text-zinc-300",
    },
  };

  const t = dark ? theme.dark : theme.light;

  return (
    <div
      className={`min-h-screen ${t.wrapper} px-4 sm:px-6 py-10 transition-colors duration-300 relative overflow-x-hidden`}
    >
      <title>Key Pair Generator</title>
      <meta
        name="description"
        content="Generate and export public/private key pairs for secure communication and encryption."
      />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${
              dark
                ? "bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700"
                : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-350"
            }`}
            title="Back to Workspace"
          >
            <svg
              className="w-4.5 h-4.5"
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
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${t.heading}`}>
              Key Pair Generator
            </h1>
            <p className={`mt-1 text-sm ${t.subtext}`}>
              Generate and export public/private key pairs for secure
              communication and encryption.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* Configuration */}
          <div className="space-y-6">
            <div
              className={`rounded-3xl border ${t.card} p-6 sm:p-8 space-y-6 relative overflow-hidden`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <FaKey className="text-zinc-500 w-4.5 h-4.5" />
                  <h2
                    className={`font-bold text-lg tracking-tight ${t.heading}`}
                  >
                    Configuration
                  </h2>
                </div>
                <button
                  onClick={clearAll}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer ${t.buttonSecondary}`}
                >
                  Clear All
                </button>
              </div>

              <div className="flex flex-col  items-center gap-2.5 h-[250px] ">
                <div className="flex flex-col w-fit gap-2.5 ">
                  {/*Key Types: RSA-OAEP, RSA-PSS, ECDSA */}
                  <div className="flex flex-col w-fit gap-2.5 ">
                    <h1
                      className={`font-bold text-lg tracking-tight ${t.label} uppercase text-xs self-start`}
                    >
                      Key Type
                    </h1>
                    <div
                      className={`flex items-center gap-1 p-1 border rounded-xl w-fit justify-center ${
                        dark
                          ? "border-zinc-700 bg-zinc-800"
                          : "border-neutral-200 bg-neutral-50"
                      }`}
                    >
                      {KEYTYPES.map((k) => (
                        <button
                          key={k.key}
                          type="button"
                          onClick={() => setKeyType(k.key)}
                          className={`px-3 py-1.5 h-[36px] w-[150px] rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer whitespace-nowrap ${
                            keyType === k.key
                              ? dark
                                ? "bg-white text-black"
                                : "bg-black text-white"
                              : dark
                                ? "text-neutral-400 hover:text-white"
                                : "text-neutral-400 hover:text-black"
                          }`}
                        >
                          {k.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {rsaSelected ? 
                    <>
                    {/* Key Sizes: 1024, 2048, 4096 */}
                      <div className="flex flex-col w-fit gap-2.5">
                        <h1
                          className={`font-bold text-lg tracking-tight ${t.label} uppercase text-xs self-start`}
                        >
                          Key Size
                        </h1>
                        <div
                          className={`flex items-center gap-1 p-1 border rounded-xl w-fit justify-center ${
                            dark
                              ? "border-zinc-700 bg-zinc-800"
                              : "border-neutral-200 bg-neutral-50"
                          }`}
                        >
                          {KEYSIZES.map((k) => (
                            <button
                              key={k.key}
                              type="button"
                              onClick={() => setKeySize(k.key)}
                              className={`px-3 py-1.5 h-[36px] w-[150px] rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer whitespace-nowrap ${
                                keySize === k.key
                                  ? dark
                                    ? "bg-white text-black"
                                    : "bg-black text-white"
                                  : dark
                                    ? "text-neutral-400 hover:text-white"
                                    : "text-neutral-400 hover:text-black"
                              }`}
                            >
                              {k.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Hash Algorithm: SHA-256, SHA-384, SHA-512 */}
                      <div className="flex flex-col w-fit gap-2.5">
                        <h1
                          className={`font-bold text-lg tracking-tight ${t.label} uppercase text-xs self-start`}
                        >
                          Hash Algorithm
                        </h1>
                        <div
                          className={`flex items-center gap-1 p-1 border rounded-xl w-fit justify-center ${
                            dark
                              ? "border-zinc-700 bg-zinc-800"
                              : "border-neutral-200 bg-neutral-50"
                          }`}
                        >
                          {HASH_ALGORITHMS.map((k) => (
                            <button
                              key={k.key}
                              type="button"
                              onClick={() => setHashAlgorithm(k.key)}
                              className={`px-3 py-1.5 h-[36px] w-[150px] rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer whitespace-nowrap ${
                                hashAlgorithm === k.key
                                  ? dark
                                    ? "bg-white text-black"
                                    : "bg-black text-white"
                                  : dark
                                    ? "text-neutral-400 hover:text-white"
                                    : "text-neutral-400 hover:text-black"
                              }`}
                            >
                              {k.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                   : 
                    
                    <>
                    {/* Curve: P-256, P-384, P-521 */}
                    <div className="flex flex-col w-fit gap-2.5">
                      <h1
                        className={`font-bold text-lg tracking-tight ${t.label} uppercase text-xs self-start`}
                      >
                        Curve
                      </h1>
                      <div
                        className={`flex items-center gap-1 p-1 border rounded-xl w-fit justify-center ${
                          dark
                            ? "border-zinc-700 bg-zinc-800"
                            : "border-neutral-200 bg-neutral-50"
                        }`}
                      >
                        {CURVES.map((k) => (
                          <button
                            key={k.key}
                            type="button"
                            onClick={() => setCurve(k.key)}
                            className={`px-3 py-1.5 h-[36px] w-[150px] rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer whitespace-nowrap ${
                              curve === k.key
                                ? dark
                                  ? "bg-white text-black"
                                  : "bg-black text-white"
                                : dark
                                  ? "text-neutral-400 hover:text-white"
                                  : "text-neutral-400 hover:text-black"
                            }`}
                          >
                            {k.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    </>
                  }
                </div>
              </div>

              {/* Generate Key Pair */}
              <div className="flex flex-col items-center gap-2.5">
                <button
                  onClick={() =>
                    generateKeyPair(keyType, keySize, hashAlgorithm, curve)
                  }
                  className={`w-[50%] h-[48px]  py-4 rounded-2xl font-bold uppercase tracking-wider transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer ${t.buttonPrimary}`}
                >
                  Generate Key Pair
                </button>
              </div>
            </div>
          </div>

          {/* Generated Keys Display */}
          <div className="space-y-6">
            <div className={`rounded-3xl border ${t.card} p-6 sm:p-8 space-y-4`}>
              <div className="flex items-center gap-2.5">
                <FaLock className="text-zinc-500 w-4.5 h-4.5" />
                <h3 className={`font-bold text-md tracking-tight ${t.heading}`}>
                  Generated Keys (PEM)
                </h3>
              </div>

              <div className="space-y-3.5">
                <label className={t.label}>Private Key (PKCS#8 PEM)</label>
                <div className={`p-4 rounded-2xl border ${t.result} font-mono text-sm whitespace-pre-wrap break-words`}>
                  {privatePem ? (
                    <pre className="whitespace-pre-wrap break-words">{privatePem}</pre>
                  ) : (
                    <div className={`text-sm ${t.subtext}`}>No private key generated yet.</div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyPem(privatePem, "Private key")}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer ${t.buttonSecondary}`}
                  >
                    <FaCopy className="inline-block mr-2" /> Copy Private
                  </button>
                  <button
                    onClick={() => downloadPem(privatePem, "private_key.pem")}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer ${t.buttonPrimary}`}
                  >
                    Download Private
                  </button>
                </div>

                <label className={t.label}>Public Key (SPKI PEM)</label>
                <div className={`p-4 rounded-2xl border ${t.result} font-mono text-sm whitespace-pre-wrap break-words`}>
                  {publicPem ? (
                    <pre className="whitespace-pre-wrap break-words">{publicPem}</pre>
                  ) : (
                    <div className={`text-sm ${t.subtext}`}>No public key generated yet.</div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyPem(publicPem, "Public key")}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer ${t.buttonSecondary}`}
                  >
                    <FaCopy className="inline-block mr-2" /> Copy Public
                  </button>
                  <button
                    onClick={() => downloadPem(publicPem, "public_key.pem")}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer ${t.buttonPrimary}`}
                  >
                    Download Public
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* Info & FAQ Card */}
            <div
              className={`rounded-3xl border ${t.card} p-6 sm:p-8 space-y-4`}
            >
              <div className="flex items-center gap-2.5">
                <FaInfoCircle className="text-zinc-500 w-4.5 h-4.5" />
                <h3 className={`font-bold text-md tracking-tight ${t.heading}`}>
                  What is Key Pair Generator?
                </h3>
              </div>

              <div className="space-y-3.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                <p>
                  Key Pair Generator generates browser-based public/private key pairs
                  using the Web Crypto API and exports them in standard PEM
                  format.
                </p>
                <div
                  className={`p-4 rounded-2xl border ${t.infoCard} space-y-3`}
                >
                  <div className="font-bold text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Key Features
                  </div>
                  <ul className="list-disc pl-4 space-y-2 text-xs">
                    <li>
                      <strong className={t.heading}>RSA and ECDSA support:</strong>{" "}
                      Generate RSA-OAEP, RSA-PSS, and ECDSA key pairs from the
                      same interface.
                    </li>
                    <li>
                      <strong className={t.heading}>PEM export:</strong>{" "}
                      Private keys are exported as PKCS#8 and public keys as
                      SPKI, then wrapped into PEM blocks.
                    </li>
                    <li>
                      <strong className={t.heading}>Copy and download:</strong>{" "}
                      Each key can be copied to clipboard or downloaded as a
                      .pem file directly from the page.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyPairGenerator;
