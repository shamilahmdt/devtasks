import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import bcrypt from "bcryptjs";
import { useTheme } from "../../../context/ThemeContext";

const BcryptGenerator = () => {
  const { dark } = useTheme();

  const [password, setPassword] = useState("");
  const [cost, setCost] = useState(10);

  const [hash, setHash] = useState("");
  const [generationTime, setGenerationTime] = useState("");

  const [verifyText, setVerifyText] = useState("");
  const [verifyHash, setVerifyHash] = useState("");

  const [match, setMatch] = useState(null);

  const generateHash = () => {
    if (!password.trim()) {
      toast.error("Please enter a password");
      return;
    }

    try {
      const start = performance.now();

      const generated = bcrypt.hashSync(
        password,
        cost
      );

      const end = performance.now();

      setHash(generated);

      setGenerationTime(
        (end - start).toFixed(2)
      );

      toast.success(
        "Bcrypt hash generated"
      );
    } catch {
      toast.error(
        "Failed to generate hash"
      );
    }
  };

  const verifyPassword = () => {
    if (!verifyText || !verifyHash) {
      toast.error(
        "Fill all fields"
      );

      return;
    }

    try {
      const result = bcrypt.compareSync(
        verifyText,
        verifyHash
      );

      setMatch(result);

      if (result) {
        toast.success("Match found");
      } else {
        toast.error("No match");
      }
    } catch {
      toast.error(
        "Invalid bcrypt hash"
      );
    }
  };

  const copyHash = async () => {
    if (!hash) return;

    try {
      await navigator.clipboard.writeText(
        hash
      );

      toast.success(
        "Hash copied"
      );
    } catch {
      toast.error(
        "Copy failed"
      );
    }
  };

  const clearAll = () => {
    setPassword("");
    setHash("");
    setGenerationTime("");

    setVerifyText("");

    setVerifyHash("");

    setMatch(null);

    setCost(10);
  };

  return (
    <div
      className={`min-h-[calc(100vh-76px)] md:h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto relative flex flex-col justify-center ${
        dark
          ? "bg-zinc-950"
          : "bg-[#F7F7F7]"
      }`}
    >
      <div
        className={`absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-30 ${
          dark
            ? "bg-zinc-800"
            : "bg-neutral-200"
        }`}
      />

      <div
        className={`absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-30 ${
          dark
            ? "bg-zinc-900"
            : "bg-neutral-100"
        }`}
      />

      <div
        className={`relative z-10 w-full max-w-6xl mx-auto rounded-[32px] border shadow-xl overflow-hidden ${
          dark
            ? "bg-zinc-900 border-zinc-800"
            : "bg-white border-neutral-200"
        }`}
      >
        <div
          className={`h-2 ${
            dark
              ? "bg-white"
              : "bg-black"
          }`}
        />

        <div className="px-8 pt-8 flex items-center gap-3">

          <Link
            to="/devutilities"
            className={`p-3 rounded-xl border ${
              dark
                ? "border-zinc-700 text-zinc-300"
                : "border-neutral-300 text-neutral-600"
            }`}
          >
            ←
          </Link>

          <h1
            className={`text-2xl font-black uppercase ${
              dark
                ? "text-white"
                : "text-black"
            }`}
          >
            Bcrypt Generator
          </h1>

        </div>

        <div className="p-8">

          <div className="flex flex-col lg:flex-row gap-8">

            {/* Left */}

            <div className="w-full lg:w-1/2 space-y-6">

              <div>

                <div className="flex justify-between items-center mb-3">

                  <label className="text-xs font-black uppercase tracking-widest">
                    Password
                  </label>

                  <button
                    onClick={clearAll}
                    className={`px-4 py-2 rounded-xl border text-xs font-black uppercase ${
                      dark
                        ? "border-zinc-700"
                        : "border-neutral-300"
                    }`}
                  >
                    Clear
                  </button>

                </div>

                <textarea
                  rows={6}
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter password..."
                  className={`w-full p-4 rounded-2xl border outline-none ${
                    dark
                      ? "bg-zinc-950 border-zinc-800 text-white"
                      : "bg-neutral-50 border-neutral-300"
                  }`}
                />

              </div>

              <div>

                <label className="text-xs font-black uppercase tracking-widest">
                  Cost Factor
                </label>

                <select
                  value={cost}
                  onChange={(e) =>
                    setCost(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className={`w-full mt-2 p-4 rounded-2xl border ${
                    dark
                      ? "bg-zinc-950 border-zinc-800 text-white"
                      : "bg-neutral-50 border-neutral-300"
                  }`}
                >
                  {[...Array(13)].map(
                    (_, i) => {
                      const value =
                        i + 4;

                      return (
                        <option
                          key={value}
                          value={value}
                        >
                          {value}
                        </option>
                      );
                    }
                  )}
                </select>

              </div>

              <button
                onClick={generateHash}
                className={`w-full py-4 rounded-2xl font-black uppercase ${
                  dark
                    ? "bg-white text-black"
                    : "bg-black text-white"
                }`}
              >
                Generate Hash
              </button>

              <textarea
                rows={5}
                readOnly
                value={hash}
                placeholder="Generated hash"
                className={`w-full p-4 rounded-2xl border font-mono break-all ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-white"
                    : "bg-neutral-50 border-neutral-300"
                }`}
              />

              <div className="flex gap-4 flex-wrap">

                <button
                  onClick={copyHash}
                  className={`px-4 py-2 rounded-xl border font-black text-xs uppercase ${
                    dark
                      ? "border-zinc-700"
                      : "border-neutral-300"
                  }`}
                >
                  Copy Hash
                </button>

                {generationTime && (
                  <div className="text-sm font-bold">
                    {generationTime} ms
                  </div>
                )}

              </div>

            </div>

            {/* Right */}

            <div className="w-full lg:w-1/2 space-y-6">

              <h2 className="font-black uppercase">
                Verify Hash
              </h2>

              <input
                value={verifyText}
                onChange={(e) =>
                  setVerifyText(
                    e.target.value
                  )
                }
                placeholder="Plain text"
                className={`w-full p-4 rounded-2xl border ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-white"
                    : "bg-neutral-50 border-neutral-300"
                }`}
              />

              <textarea
                rows={5}
                value={verifyHash}
                onChange={(e) =>
                  setVerifyHash(
                    e.target.value
                  )
                }
                placeholder="Paste bcrypt hash"
                className={`w-full p-4 rounded-2xl border font-mono ${
                  dark
                    ? "bg-zinc-950 border-zinc-800 text-white"
                    : "bg-neutral-50 border-neutral-300"
                }`}
              />

              <button
                onClick={verifyPassword}
                className={`w-full py-4 rounded-2xl font-black uppercase ${
                  dark
                    ? "bg-white text-black"
                    : "bg-black text-white"
                }`}
              >
                Verify
              </button>

              {match !== null && (

                <div
                  className={`text-xl font-black ${
                    match
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {match
                    ? "Match ✅"
                    : "No Match ❌"}
                </div>

              )}

              <div
                className={`p-6 rounded-2xl border ${
                  dark
                    ? "border-zinc-800"
                    : "border-neutral-300"
                }`}
              >
                <h3 className="font-black mb-4">
                  What is bcrypt?
                </h3>

                <p className="text-sm mb-3">
                  Bcrypt is a password
                  hashing algorithm
                  designed for secure
                  password storage.
                </p>

                <p className="text-sm mb-3">
                  Higher cost factors
                  increase security but
                  also increase
                  processing time.
                </p>

                <p className="text-sm font-bold mb-2">
                  Common uses:
                </p>

                <ul className="text-sm list-disc pl-5 space-y-1">
                  <li>Password storage</li>

                  <li>User authentication</li>

                  <li>Security testing</li>

                </ul>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default BcryptGenerator;