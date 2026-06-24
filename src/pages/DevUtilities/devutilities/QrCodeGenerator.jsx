import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const SIZE_OPTIONS = [128, 256, 512];
const MARGIN_OPTIONS = [0, 1, 2, 4, 8];

const HEX_PATTERN = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

function normalizeHex(value, fallback) {
  if (!value || !HEX_PATTERN.test(value.trim())) return fallback;
  const hex = value.trim().replace(/^#/, "");
  if (hex.length === 3) {
    return `#${hex
      .split("")
      .map((c) => c + c)
      .join("")}`;
  }
  return `#${hex}`;
}

function ColorSwatchPicker({ value, onChange, label, dark }) {
  return (
    <label
      className={`group relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-2xl border p-1 transition-all duration-300 hover:scale-105 active:scale-95 ${
        dark
          ? "border-zinc-700 hover:border-zinc-500 group-focus-within:border-white group-focus-within:ring-1 group-focus-within:ring-white"
          : "border-neutral-300 hover:border-neutral-400 group-focus-within:border-black group-focus-within:ring-1 group-focus-within:ring-black"
      }`}
    >
      <span className="relative block h-full w-full overflow-hidden rounded-xl shadow-inner">
        <span
          className={`absolute inset-0 ${
            dark ? "opacity-20" : "opacity-50"
          }`}
          style={{
            backgroundImage:
              "linear-gradient(45deg, #d4d4d4 25%, transparent 25%), linear-gradient(-45deg, #d4d4d4 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d4d4d4 75%), linear-gradient(-45deg, transparent 75%, #d4d4d4 75%)",
            backgroundSize: "8px 8px",
            backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0",
          }}
          aria-hidden="true"
        />
        <span
          className="absolute inset-0"
          style={{ backgroundColor: value }}
          aria-hidden="true"
        />
      </span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-label={label}
      />
    </label>
  );
}

const QrCodeGenerator = () => {
  const { dark } = useTheme();
  const canvasRef = useRef(null);
  const [text, setText] = useState("https://dev-tasks-beta.vercel.app");
  const [size, setSize] = useState(256);
  const [margin, setMargin] = useState(2);
  const [foreground, setForeground] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");
  const [fgInput, setFgInput] = useState("#000000");
  const [bgInput, setBgInput] = useState("#ffffff");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    const content = text.trim();

    const draw = async () => {
      if (!content) {
        const ctx = canvas.getContext("2d");
        canvas.width = size;
        canvas.height = size;
        ctx.fillStyle = normalizeHex(background, "#ffffff");
        ctx.fillRect(0, 0, size, size);
        return;
      }

      try {
        await QRCode.toCanvas(canvas, content, {
          width: size,
          margin,
          color: {
            dark: normalizeHex(foreground, "#000000"),
            light: normalizeHex(background, "#ffffff"),
          },
          errorCorrectionLevel: "M",
        });
      } catch (err) {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : "Failed to generate QR code",
          );
        }
      }
    };

    draw();
    return () => {
      cancelled = true;
    };
  }, [text, size, margin, foreground, background]);

  const handleColorChange = (type, value) => {
    if (type === "fg") {
      setFgInput(value);
      if (HEX_PATTERN.test(value.trim())) {
        setForeground(normalizeHex(value, foreground));
      }
    } else {
      setBgInput(value);
      if (HEX_PATTERN.test(value.trim())) {
        setBackground(normalizeHex(value, background));
      }
    }
  };

  const handleColorPicker = (type, value) => {
    if (type === "fg") {
      setForeground(value);
      setFgInput(value);
    } else {
      setBackground(value);
      setBgInput(value);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !text.trim()) {
      toast.error("Enter text or a URL to download");
      return;
    }

    try {
      const link = document.createElement("a");
      link.download = "qrcode.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("QR code downloaded");
    } catch {
      toast.error("Failed to download QR code");
    }
  };

  const handleClear = () => {
    setText("");
  };

  const handleSample = () => {
    setText("https://github.com");
    setSize(256);
    setMargin(2);
  };

  return (
    <div
      className={`min-h-[calc(100vh-76px)] md:h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto overflow-x-hidden md:overflow-hidden relative flex flex-col justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>QR Code Generator — DevTasks</title>
      <meta
        name="description"
        content="Generate customizable QR codes from text or URLs entirely in your browser."
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
            QR Code Generator
          </h1>
        </div>

        <div className="w-full p-5 sm:p-8 overflow-y-auto">
          <div className="w-full flex flex-col lg:flex-row gap-6 lg:gap-8">
            <div className="w-full lg:w-1/2 min-w-0 flex flex-col space-y-4">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                      dark ? "text-zinc-400" : "text-neutral-500"
                    }`}
                  >
                    Text or URL
                  </label>
                  <button
                    type="button"
                    onClick={handleSample}
                    className={`px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 ${
                      dark
                        ? "bg-white text-black border-white hover:bg-zinc-200"
                        : "bg-black text-white border-black hover:bg-zinc-800"
                    }`}
                  >
                    Sample
                  </button>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text or URL..."
                  rows={3}
                  className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 resize-none ${
                    dark
                      ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                      : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <label
                    className={`text-xs font-black uppercase tracking-widest ${
                      dark ? "text-zinc-400" : "text-neutral-500"
                    }`}
                  >
                    Size
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 cursor-pointer ${
                      dark
                        ? "bg-zinc-950 border-zinc-800 text-white focus:border-white focus:ring-1 focus:ring-white"
                        : "bg-neutral-50 border-neutral-300 text-black focus:border-black focus:ring-1 focus:ring-black"
                    }`}
                  >
                    {SIZE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}px
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col space-y-2">
                  <label
                    className={`text-xs font-black uppercase tracking-widest ${
                      dark ? "text-zinc-400" : "text-neutral-500"
                    }`}
                  >
                    Margin
                  </label>
                  <select
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-300 cursor-pointer ${
                      dark
                        ? "bg-zinc-950 border-zinc-800 text-white focus:border-white focus:ring-1 focus:ring-white"
                        : "bg-neutral-50 border-neutral-300 text-black focus:border-black focus:ring-1 focus:ring-black"
                    }`}
                  >
                    {MARGIN_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option} modules
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="flex flex-col space-y-2 min-w-0">
                  <label
                    className={`text-xs font-black uppercase tracking-widest ${
                      dark ? "text-zinc-400" : "text-neutral-500"
                    }`}
                  >
                    Foreground
                  </label>
                  <div className="flex items-center gap-3 min-w-0">
                    <ColorSwatchPicker
                      value={foreground}
                      onChange={(value) => handleColorPicker("fg", value)}
                      label="Foreground color picker"
                      dark={dark}
                    />
                    <input
                      type="text"
                      value={fgInput}
                      onChange={(e) => handleColorChange("fg", e.target.value)}
                      placeholder="#000000"
                      className={`flex-1 min-w-0 px-4 py-3 rounded-2xl border text-sm font-mono outline-none transition-all duration-300 ${
                        dark
                          ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                          : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                      }`}
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-2 min-w-0">
                  <label
                    className={`text-xs font-black uppercase tracking-widest ${
                      dark ? "text-zinc-400" : "text-neutral-500"
                    }`}
                  >
                    Background
                  </label>
                  <div className="flex items-center gap-3 min-w-0">
                    <ColorSwatchPicker
                      value={background}
                      onChange={(value) => handleColorPicker("bg", value)}
                      label="Background color picker"
                      dark={dark}
                    />
                    <input
                      type="text"
                      value={bgInput}
                      onChange={(e) => handleColorChange("bg", e.target.value)}
                      placeholder="#ffffff"
                      className={`flex-1 min-w-0 px-4 py-3 rounded-2xl border text-sm font-mono outline-none transition-all duration-300 ${
                        dark
                          ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700 focus:border-white focus:ring-1 focus:ring-white"
                          : "bg-neutral-50 border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleDownload}
                  type="button"
                  className={`w-full px-4 py-3 rounded-xl border font-bold text-sm text-center transition-all duration-300 active:scale-95 ${
                    dark
                      ? "border-white bg-white text-black hover:bg-zinc-200 hover:border-zinc-200"
                      : "border-black bg-black text-white hover:bg-zinc-800 hover:border-zinc-800"
                  }`}
                >
                  Download PNG
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

            <div className="w-full lg:w-1/2 flex flex-col space-y-2">
              <label
                className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${
                  dark ? "text-zinc-400" : "text-neutral-500"
                }`}
              >
                Preview
              </label>
              <div
                className={`flex-1 min-h-[280px] flex items-center justify-center rounded-2xl border p-6 transition-all duration-300 ${
                  dark
                    ? "bg-zinc-950 border-zinc-800"
                    : "bg-neutral-50 border-neutral-300"
                }`}
              >
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto rounded-lg shadow-sm"
                  aria-label="QR code preview"
                />
              </div>
              <p
                className={`text-[10px] font-bold uppercase tracking-widest text-center ${
                  dark ? "text-zinc-600" : "text-neutral-400"
                }`}
              >
                Updates in real time · Processed locally
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrCodeGenerator;
