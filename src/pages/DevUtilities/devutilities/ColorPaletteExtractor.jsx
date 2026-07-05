import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const BUCKET_BITS = 4;
const BUCKET_SHIFT = 8 - BUCKET_BITS;
const COLOR_NAMES = [
  "primary",
  "secondary",
  "accent",
  "muted",
  "surface",
  "highlight",
  "neutral",
  "contrast",
];
const EXPORT_TABS = ["CSS", "Tailwind", "Sass", "JSON"];
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toHexByte(value) {
  return Math.round(clamp(value, 0, 255))
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();
}

function rgbToHex({ r, g, b }) {
  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
}

function rgbToHsl(r, g, b) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));

    switch (max) {
      case red:
        hue = 60 * (((green - blue) / delta) % 6);
        break;
      case green:
        hue = 60 * ((blue - red) / delta + 2);
        break;
      default:
        hue = 60 * ((red - green) / delta + 4);
        break;
    }
  }

  return {
    h: Math.round((hue + 360) % 360),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

function rgbToHslString(r, g, b) {
  const { h, s, l } = rgbToHsl(r, g, b);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function bucketKey(r, g, b) {
  return (
    ((r >> BUCKET_SHIFT) << (BUCKET_BITS * 2)) |
    ((g >> BUCKET_SHIFT) << BUCKET_BITS) |
    (b >> BUCKET_SHIFT)
  );
}

function isNearWhite({ r, g, b }) {
  return r > 240 && g > 240 && b > 240;
}

function isNearBlack({ r, g, b }) {
  return r < 15 && g < 15 && b < 15;
}

function colorDistance(a, b) {
  return Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);
}

function analyzeImage(img, canvas) {
  const maxDimension = 150;
  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}

function extractPalette(imageData, { maxColors = 6, minShare = 0.02 } = {}) {
  const { data } = imageData;
  const buckets = new Map();
  let total = 0;

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha < 128) continue;

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key = bucketKey(r, g, b);

    let entry = buckets.get(key);
    if (!entry) {
      entry = { r: 0, g: 0, b: 0, count: 0 };
      buckets.set(key, entry);
    }

    entry.r += r;
    entry.g += g;
    entry.b += b;
    entry.count += 1;
    total += 1;
  }

  if (total === 0) return [];

  const candidates = [...buckets.values()]
    .map(({ r, g, b, count }) => {
      const avg = {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count),
      };
      return { ...avg, count, share: count / total };
    })
    .sort((a, b) => b.count - a.count);

  const filtered = candidates.filter((color, index) => {
    if (color.share < minShare) return false;
    if (isNearWhite(color) || isNearBlack(color)) {
      return index < 2;
    }
    return true;
  });

  const merged = [];
  for (const color of filtered) {
    const duplicate = merged.find((entry) => colorDistance(entry, color) < 30);
    if (duplicate) {
      duplicate.count += color.count;
      duplicate.share += color.share;
      duplicate.r = Math.round((duplicate.r + color.r) / 2);
      duplicate.g = Math.round((duplicate.g + color.g) / 2);
      duplicate.b = Math.round((duplicate.b + color.b) / 2);
    } else {
      merged.push({ ...color });
    }
  }

  return merged
    .sort((a, b) => b.count - a.count)
    .slice(0, maxColors)
    .map((color) => ({
      hex: rgbToHex(color),
      rgb: `rgb(${color.r}, ${color.g}, ${color.b})`,
      hsl: rgbToHslString(color.r, color.g, color.b),
      share: Math.round(color.share * 100),
    }));
}

function colorName(index) {
  return COLOR_NAMES[index] ?? `palette-${index + 1}`;
}

function generateCSS(palette) {
  const lines = [":root {"];
  palette.forEach((color, index) => {
    lines.push(`  --color-${colorName(index)}: ${color.hex};`);
  });
  lines.push("}");
  return lines.join("\n");
}

function generateTailwind(palette) {
  const entries = palette
    .map((color, index) => `        '${colorName(index)}': '${color.hex}',`)
    .join("\n");

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
${entries}
      },
    },
  },
};`;
}

function generateSass(palette) {
  return palette
    .map((color, index) => `$color-${colorName(index)}: ${color.hex};`)
    .join("\n");
}

function generateJSON(palette) {
  return JSON.stringify(palette.map((color) => color.hex), null, 2);
}

export default function ColorPaletteExtractor() {
  const { dark } = useTheme();
  const canvasRef = useRef(null);
  const previewUrlRef = useRef(null);
  const prevMaxColorsRef = useRef(6);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [palette, setPalette] = useState([]);
  const [maxColors, setMaxColors] = useState(6);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [exportTab, setExportTab] = useState("CSS");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const analyzeFromImage = useCallback((img) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setError("Canvas is not available in this browser.");
      setIsAnalyzing(false);
      return;
    }

    const imageData = analyzeImage(img, canvas);
    if (!imageData) {
      setError("Could not read image pixels.");
      setIsAnalyzing(false);
      return;
    }

    const extracted = extractPalette(imageData, { maxColors });
    setPalette(extracted);
    setIsAnalyzing(false);

    if (extracted.length === 0) {
      toast.error("No dominant colors found in this image.");
    } else {
      toast.success(`Extracted ${extracted.length} dominant colors`);
    }
  }, [maxColors]);

  const loadFile = useCallback(
    (selectedFile) => {
      if (!selectedFile) return;

      if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
        setError("Please upload a PNG, JPG, or WebP image.");
        return;
      }

      if (selectedFile.size > 20 * 1024 * 1024) {
        setError("Please upload an image smaller than 20 MB.");
        return;
      }

      setError("");
      setIsAnalyzing(true);
      setPalette([]);
      prevMaxColorsRef.current = maxColors;

      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);

      const imageUrl = URL.createObjectURL(selectedFile);
      previewUrlRef.current = imageUrl;
      setPreview(imageUrl);
      setFile(selectedFile);

      const img = new Image();
      img.onload = () => analyzeFromImage(img);
      img.onerror = () => {
        setError("Could not read this image file.");
        setIsAnalyzing(false);
      };
      img.src = imageUrl;
    },
    [analyzeFromImage],
  );

  useEffect(() => {
    if (!preview || !file) return;
    if (prevMaxColorsRef.current === maxColors) return;

    prevMaxColorsRef.current = maxColors;
    setIsAnalyzing(true);

    const img = new Image();
    img.onload = () => analyzeFromImage(img);
    img.onerror = () => {
      setError("Could not re-analyze this image.");
      setIsAnalyzing(false);
    };
    img.src = preview;
  }, [maxColors, analyzeFromImage, preview, file]);

  const handleFile = (event) => {
    loadFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    loadFile(event.dataTransfer.files?.[0]);
  };

  const handleClear = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    prevMaxColorsRef.current = 6;
    setFile(null);
    setPreview(null);
    setPalette([]);
    setError("");
  };

  const copyHex = async (hex) => {
    try {
      await navigator.clipboard.writeText(hex);
      toast.success(`Copied ${hex}`);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const exportCode = useMemo(() => {
    if (palette.length === 0) return "";
    if (exportTab === "CSS") return generateCSS(palette);
    if (exportTab === "Tailwind") return generateTailwind(palette);
    if (exportTab === "Sass") return generateSass(palette);
    return generateJSON(palette);
  }, [exportTab, palette]);

  const handleCopyExport = async () => {
    if (!exportCode) return;
    try {
      await navigator.clipboard.writeText(exportCode);
      toast.success("Copied to clipboard");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const smallBtnCls = `px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
    dark
      ? "bg-white text-black hover:bg-zinc-200"
      : "bg-black text-white hover:bg-zinc-800"
  }`;

  return (
    <div
      className={`relative min-h-screen p-4 sm:p-6 transition-colors duration-300 ${
        dark ? "bg-zinc-950" : "bg-[#FDFDFD]"
      }`}
    >
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      <div
        className={`absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[120px] opacity-30 ${
          dark ? "bg-zinc-800" : "bg-neutral-200"
        }`}
      />
      <div
        className={`absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[120px] opacity-30 ${
          dark ? "bg-zinc-900" : "bg-neutral-100"
        }`}
      />

      <div
        className={`relative z-10 max-w-7xl mx-auto rounded-[32px] border shadow-xl overflow-hidden ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
        }`}
      >
        <div className={`h-2 ${dark ? "bg-white" : "bg-black"}`} />

        <div className="flex items-center gap-4 px-6 pt-8">
          <Link
            to="/devutilities"
            className={`p-3 rounded-xl border ${
              dark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200"
            }`}
          >
            ←
          </Link>
          <div>
            <h1 className="text-3xl font-black uppercase">
              Image Color Palette Extractor
            </h1>
            <p
              className={`mt-1 text-sm ${dark ? "text-zinc-400" : "text-zinc-500"}`}
            >
              Extract dominant color palettes from any image completely offline.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 p-6">
          <div
            className={`rounded-3xl border p-6 space-y-6 ${
              dark
                ? "bg-zinc-900/50 border-zinc-800"
                : "bg-zinc-50 border-zinc-200"
            }`}
          >
            <h2 className="text-xs font-black uppercase tracking-widest">
              Upload & Preview
            </h2>

            <label
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                isDragging
                  ? dark
                    ? "border-white bg-zinc-800/50"
                    : "border-black bg-zinc-100"
                  : dark
                    ? "border-zinc-700 text-zinc-400"
                    : "border-zinc-300 text-zinc-500"
              }`}
            >
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFile}
                className="hidden"
              />
              <div className="text-5xl mb-4">🎨</div>
              <p className="font-bold text-center px-4">
                {file ? file.name : "Drag & Drop or Click to Upload Image"}
              </p>
              <p className="text-xs mt-1 opacity-70">PNG, JPG, WebP — Max 20 MB</p>
            </label>

            {error && <p className="text-sm font-bold text-red-500">{error}</p>}

            <div
              className={`rounded-2xl h-64 flex items-center justify-center border overflow-hidden ${
                dark ? "border-zinc-800 bg-zinc-950/40" : "border-zinc-200 bg-white"
              }`}
            >
              {preview ? (
                <img
                  src={preview}
                  alt={file?.name ?? "Uploaded preview"}
                  className="w-full h-full object-contain"
                />
              ) : (
                <p className={`text-sm ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                  Image preview will appear here
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <label className="text-xs font-black uppercase">
                  Palette Size ({maxColors} colors)
                </label>
                <input
                  type="range"
                  min="5"
                  max="8"
                  value={maxColors}
                  onChange={(event) => setMaxColors(Number(event.target.value))}
                  disabled={!preview}
                  className="w-full mt-3 accent-purple-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer disabled:opacity-40"
                />
              </div>
              {file && (
                <button
                  type="button"
                  onClick={handleClear}
                  className={`shrink-0 rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest ${
                    dark
                      ? "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      : "border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div
            className={`rounded-3xl border p-6 space-y-6 ${
              dark
                ? "bg-zinc-900/50 border-zinc-800"
                : "bg-zinc-50 border-zinc-200"
            }`}
          >
            <h2 className="text-xs font-black uppercase tracking-widest">
              Color Palette
            </h2>

            {isAnalyzing ? (
              <p className="text-sm animate-pulse">Analyzing image pixels…</p>
            ) : palette.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {palette.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => copyHex(color.hex)}
                    className={`rounded-2xl border overflow-hidden text-left transition-transform hover:scale-[1.02] ${
                      dark ? "border-zinc-700" : "border-zinc-200"
                    }`}
                    title={`Copy ${color.hex}`}
                  >
                    <div
                      className="h-20 w-full"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="p-3 font-mono text-sm">
                      <p className="font-bold">{color.hex}</p>
                      <p className={`text-xs mt-1 ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
                        {color.rgb}
                      </p>
                      <p className={`text-xs ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
                        {color.hsl}
                      </p>
                      <p className={`text-xs mt-1 ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                        {color.share}% of image
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                Upload an image to extract its dominant colors. Click any swatch to
                copy its HEX value.
              </p>
            )}

            <div
              className={`rounded-2xl border transition-colors ${
                dark
                  ? "bg-zinc-800/60 border-zinc-700"
                  : "bg-neutral-50 border-neutral-200"
              }`}
            >
              <div
                className={`flex items-center justify-between px-5 pt-4 pb-3 border-b ${
                  dark ? "border-zinc-700" : "border-neutral-200"
                }`}
              >
                <div
                  className={`flex items-center gap-1 p-1 border rounded-2xl ${
                    dark
                      ? "border-zinc-700 bg-zinc-800"
                      : "border-neutral-200 bg-neutral-100"
                  }`}
                >
                  {EXPORT_TABS.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setExportTab(tab)}
                      disabled={palette.length === 0}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 disabled:opacity-40 ${
                        exportTab === tab
                          ? dark
                            ? "bg-white text-black"
                            : "bg-black text-white"
                          : dark
                            ? "text-neutral-400 hover:text-white"
                            : "text-neutral-400 hover:text-black"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleCopyExport}
                  disabled={!exportCode}
                  className={`${smallBtnCls} disabled:opacity-40`}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <textarea
                readOnly
                value={exportCode}
                placeholder="Export output will appear here after extraction."
                className={`w-full min-h-48 p-5 text-xs font-mono leading-relaxed resize-none bg-transparent focus:outline-none ${
                  dark ? "text-zinc-300" : "text-zinc-700"
                }`}
              />

              <div
                className={`px-5 pb-4 text-[10px] font-medium ${
                  dark ? "text-zinc-600" : "text-zinc-400"
                }`}
              >
                Generated client-side — no data leaves your browser
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
