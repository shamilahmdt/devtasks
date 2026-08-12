import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  FaArrowLeft,
  FaCopy,
  FaImage,
  FaRedo,
  FaUpload,
} from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";

const DEFAULT_FILTERS = {
  blur: 0,
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  hueRotate: 0,
  invert: 0,
  opacity: 100,
  saturate: 100,
  sepia: 0,
};

const FILTER_LIMITS = {
  blur: { min: 0, max: 50, unit: "px", label: "Blur" },
  brightness: { min: 0, max: 300, unit: "%", label: "Brightness" },
  contrast: { min: 0, max: 300, unit: "%", label: "Contrast" },
  grayscale: { min: 0, max: 100, unit: "%", label: "Grayscale" },
  hueRotate: { min: 0, max: 360, unit: "deg", label: "Hue rotate" },
  invert: { min: 0, max: 100, unit: "%", label: "Invert" },
  opacity: { min: 0, max: 100, unit: "%", label: "Opacity" },
  saturate: { min: 0, max: 500, unit: "%", label: "Saturate" },
  sepia: { min: 0, max: 100, unit: "%", label: "Sepia" },
};

const PRESETS = [
  {
    id: "vintage",
    name: "Vintage",
    description: "Warm, faded film tones",
    filters: {
      blur: 0,
      brightness: 105,
      contrast: 90,
      grayscale: 15,
      hueRotate: 340,
      invert: 0,
      opacity: 100,
      saturate: 75,
      sepia: 45,
    },
  },
  {
    id: "noir",
    name: "Noir",
    description: "High-contrast black and white",
    filters: {
      blur: 0,
      brightness: 90,
      contrast: 145,
      grayscale: 100,
      hueRotate: 0,
      invert: 0,
      opacity: 100,
      saturate: 0,
      sepia: 0,
    },
  },
  {
    id: "warm-glow",
    name: "Warm glow",
    description: "Bright golden highlights",
    filters: {
      blur: 1,
      brightness: 115,
      contrast: 105,
      grayscale: 0,
      hueRotate: 8,
      invert: 0,
      opacity: 100,
      saturate: 145,
      sepia: 18,
    },
  },
  {
    id: "cold-cyberpunk",
    name: "Cold cyberpunk",
    description: "Crisp neon-blue contrast",
    filters: {
      blur: 0,
      brightness: 105,
      contrast: 135,
      grayscale: 10,
      hueRotate: 175,
      invert: 5,
      opacity: 100,
      saturate: 185,
      sepia: 0,
    },
  },
  {
    id: "frosted-glass",
    name: "Frosted glass",
    description: "Soft translucent backdrop",
    filters: {
      blur: 12,
      brightness: 110,
      contrast: 95,
      grayscale: 15,
      hueRotate: 0,
      invert: 0,
      opacity: 100,
      saturate: 165,
      sepia: 0,
    },
  },
  {
    id: "muted",
    name: "Muted",
    description: "Low-saturation editorial look",
    filters: {
      blur: 0,
      brightness: 100,
      contrast: 95,
      grayscale: 35,
      hueRotate: 0,
      invert: 0,
      opacity: 100,
      saturate: 55,
      sepia: 8,
    },
  },
];

const DEFAULT_IMAGE = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
    <defs>
      <linearGradient id="sky" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#111827" />
        <stop offset="0.5" stop-color="#4f46e5" />
        <stop offset="1" stop-color="#f97316" />
      </linearGradient>
      <radialGradient id="glow" cx="72%" cy="22%" r="54%">
        <stop offset="0" stop-color="#fde68a" stop-opacity="0.95" />
        <stop offset="1" stop-color="#fde68a" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#sky)" />
    <rect width="1200" height="800" fill="url(#glow)" />
    <circle cx="880" cy="190" r="112" fill="#fff7ed" fill-opacity="0.8" />
    <path d="M0 620 C180 490 280 560 420 625 C590 705 710 560 880 610 C1030 655 1100 575 1200 530 V800 H0Z" fill="#111827" fill-opacity="0.82" />
    <path d="M0 700 C210 620 310 675 505 720 C710 770 890 650 1200 685 V800 H0Z" fill="#030712" fill-opacity="0.88" />
    <g fill="#fff" fill-opacity="0.65">
      <circle cx="170" cy="145" r="4" /><circle cx="260" cy="230" r="3" /><circle cx="445" cy="105" r="4" />
      <circle cx="600" cy="205" r="3" /><circle cx="1010" cy="85" r="4" /><circle cx="1080" cy="290" r="3" />
    </g>
  </svg>`,
)}`;

const filterString = (filters) =>
  [
    `blur(${filters.blur}px)`,
    `brightness(${filters.brightness}%)`,
    `contrast(${filters.contrast}%)`,
    `grayscale(${filters.grayscale}%)`,
    `hue-rotate(${filters.hueRotate}deg)`,
    `invert(${filters.invert}%)`,
    `opacity(${filters.opacity}%)`,
    `saturate(${filters.saturate}%)`,
    `sepia(${filters.sepia}%)`,
  ].join(" ");

const RangeControl = ({ dark, label, max, min, onChange, unit, value }) => {
  const inputClass = dark
    ? "bg-zinc-950 border-zinc-800 text-zinc-100"
    : "bg-white border-zinc-200 text-zinc-800";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {label}
        </label>
        <span className="font-mono text-xs text-zinc-400">
          {value}
          {unit}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <input
          aria-label={label}
          className="h-1.5 min-w-0 flex-1 cursor-pointer accent-zinc-500"
          max={max}
          min={min}
          onChange={(event) => onChange(event.target.value)}
          type="range"
          value={value}
        />
        <input
          aria-label={`${label} value`}
          className={`w-20 rounded-lg border px-2 py-1.5 text-center text-xs font-mono outline-none focus:border-zinc-500 ${inputClass}`}
          max={max}
          min={min}
          onChange={(event) => onChange(event.target.value)}
          type="number"
          value={value}
        />
      </div>
    </div>
  );
};

export default function CssFilterPlayground() {
  const { dark } = useTheme();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [mode, setMode] = useState("filter");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [codeMode, setCodeMode] = useState("css");
  const [includeWebkit, setIncludeWebkit] = useState(true);
  const [previewImage, setPreviewImage] = useState(DEFAULT_IMAGE);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageLabel, setImageLabel] = useState("Built-in abstract image");
  const [imageError, setImageError] = useState(false);
  const uploadedUrlRef = useRef(null);

  const theme = dark
    ? {
        wrapper: "bg-[#090A0F] text-zinc-100",
        card: "border-zinc-800/85 bg-zinc-900/50",
        input: "bg-zinc-950 border-zinc-800 text-zinc-100",
        code: "bg-zinc-950 border-zinc-800 text-zinc-300",
        muted: "text-zinc-400",
        secondaryButton:
          "border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800",
        activeButton: "border-zinc-200 bg-zinc-100 text-zinc-900",
      }
    : {
        wrapper: "bg-[#F8F9FA] text-zinc-900",
        card: "border-zinc-200/85 bg-white",
        input: "bg-white border-zinc-200 text-zinc-800",
        code: "bg-zinc-50 border-zinc-200 text-zinc-700",
        muted: "text-zinc-500",
        secondaryButton:
          "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50",
        activeButton: "border-zinc-900 bg-zinc-900 text-white",
      };

  const activeFilterString = filterString(filters);
  const cssProperty = mode === "filter" ? "filter" : "backdrop-filter";
  const cssSelector = mode === "filter" ? ".filtered-image" : ".glass-panel";
  const cssOutput = `${cssSelector} {\n  ${
    includeWebkit
      ? `-webkit-${cssProperty}: ${activeFilterString};\n  `
      : ""
  }${cssProperty}: ${activeFilterString};\n}`;
  const tailwindValue = activeFilterString.replace(/\s+/g, "_");
  const tailwindOutput = `[${cssProperty}:${tailwindValue}]`;
  const displayedCode = codeMode === "css" ? cssOutput : tailwindOutput;

  useEffect(() => {
    return () => {
      if (uploadedUrlRef.current) {
        URL.revokeObjectURL(uploadedUrlRef.current);
      }
    };
  }, []);

  const updateFilter = (key, value) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return;

    const { max, min } = FILTER_LIMITS[key];
    const nextValue = Math.min(max, Math.max(min, numericValue));
    setFilters((current) => ({ ...current, [key]: nextValue }));
    setSelectedPreset("");
  };

  const applyPreset = (preset) => {
    setFilters(preset.filters);
    setSelectedPreset(preset.id);
    if (preset.id === "frosted-glass") setMode("backdrop");
    toast.success(`${preset.name} preset applied`);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSelectedPreset("");
    setMode("filter");
    toast.success("Filters reset");
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(displayedCode);
      toast.success(`${codeMode === "css" ? "CSS" : "Tailwind"} copied`);
    } catch {
      toast.error("Clipboard access is unavailable");
    }
  };

  const resetUploadedImage = () => {
    if (uploadedUrlRef.current) {
      URL.revokeObjectURL(uploadedUrlRef.current);
      uploadedUrlRef.current = null;
    }
    setPreviewImage(DEFAULT_IMAGE);
    setImageUrlInput("");
    setImageLabel("Built-in abstract image");
    setImageError(false);
  };

  const applyImageUrl = () => {
    const value = imageUrlInput.trim();
    if (!value) {
      resetUploadedImage();
      return;
    }

    if (!/^https?:\/\//i.test(value) && !value.startsWith("data:image/")) {
      toast.error("Enter an http(s) image URL");
      return;
    }

    if (uploadedUrlRef.current) {
      URL.revokeObjectURL(uploadedUrlRef.current);
      uploadedUrlRef.current = null;
    }
    setPreviewImage(value);
    setImageLabel("Custom image URL");
    setImageError(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file");
      return;
    }

    if (uploadedUrlRef.current) URL.revokeObjectURL(uploadedUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    uploadedUrlRef.current = objectUrl;
    setPreviewImage(objectUrl);
    setImageUrlInput("");
    setImageLabel(file.name);
    setImageError(false);
  };

  return (
    <div className={`min-h-screen px-4 py-6 transition-colors duration-300 sm:px-6 sm:py-10 ${theme.wrapper}`}>
      <title>CSS Filter Playground — DevTasks</title>
      <meta
        name="description"
        content="Experiment with CSS filter and backdrop-filter effects, preview them live, and copy ready-to-use CSS."
      />

      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex items-start gap-3 sm:mb-8">
          <Link
            className={`mt-0.5 flex shrink-0 items-center justify-center rounded-xl border p-2 transition-all active:scale-95 ${theme.secondaryButton}`}
            title="Back to Utilities"
            to="/devutilities"
          >
            <FaArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                CSS Filter Playground
              </h1>
              <span className="rounded-full border border-zinc-400/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Offline
              </span>
            </div>
            <p className={`mt-1 max-w-3xl text-xs sm:text-sm ${theme.muted}`}>
              Tune image filters or backdrop effects in real time, then copy the exact CSS for your next interface.
            </p>
          </div>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="space-y-6">
            <section className={`rounded-3xl border p-5 sm:p-6 ${theme.card}`}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold tracking-tight">Filter controls</p>
                  <p className={`mt-1 text-xs ${theme.muted}`}>
                    Every value is applied locally in your browser.
                  </p>
                </div>
                <button
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${theme.secondaryButton}`}
                  onClick={resetFilters}
                  type="button"
                >
                  <FaRedo className="h-3 w-3" /> Reset
                </button>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PRESETS.map((preset) => (
                  <button
                    className={`rounded-xl border px-3 py-3 text-left transition-all active:scale-[0.98] ${
                      selectedPreset === preset.id
                        ? theme.activeButton
                        : theme.secondaryButton
                    }`}
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    type="button"
                  >
                    <span className="block text-xs font-bold">{preset.name}</span>
                    <span className="mt-1 block text-[10px] leading-tight opacity-60">
                      {preset.description}
                    </span>
                  </button>
                ))}
              </div>

              <div className="space-y-5">
                {Object.entries(FILTER_LIMITS).map(([key, config]) => (
                  <RangeControl
                    dark={dark}
                    key={key}
                    label={config.label}
                    max={config.max}
                    min={config.min}
                    onChange={(value) => updateFilter(key, value)}
                    unit={config.unit}
                    value={filters[key]}
                  />
                ))}
              </div>
            </section>

            <section className={`rounded-3xl border p-5 sm:p-6 ${theme.card}`}>
              <div className="mb-4 flex items-center gap-2">
                <FaImage className="h-4 w-4 text-zinc-500" />
                <h2 className="text-lg font-semibold tracking-tight">Preview image</h2>
              </div>
              <p className={`mb-4 truncate text-xs ${theme.muted}`} title={imageLabel}>
                {imageLabel}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  aria-label="Image URL"
                  className={`min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-xs outline-none transition-colors focus:border-zinc-500 ${theme.input}`}
                  onChange={(event) => setImageUrlInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") applyImageUrl();
                  }}
                  placeholder="Paste an image URL (https://...)"
                  type="url"
                  value={imageUrlInput}
                />
                <button
                  className={`rounded-xl border px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${theme.secondaryButton}`}
                  onClick={applyImageUrl}
                  type="button"
                >
                  Apply URL
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${theme.secondaryButton}`}>
                  <FaUpload className="h-3 w-3" /> Upload image
                  <input accept="image/*" className="sr-only" onChange={handleFileChange} type="file" />
                </label>
                <button
                  className={`rounded-xl border px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${theme.secondaryButton}`}
                  onClick={resetUploadedImage}
                  type="button"
                >
                  Use built-in
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className={`rounded-3xl border p-5 sm:p-6 ${theme.card}`}>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">Live preview</h2>
                  <p className={`mt-1 text-xs ${theme.muted}`}>
                    Switch modes to see how the same values behave on an image or a translucent panel.
                  </p>
                </div>
                <div className={`flex rounded-xl border p-1 ${dark ? "border-zinc-800 bg-zinc-950" : "border-zinc-200 bg-zinc-50"}`} role="tablist">
                  {[
                    ["filter", "Filter image"],
                    ["backdrop", "Backdrop"],
                  ].map(([value, label]) => (
                    <button
                      aria-selected={mode === value}
                      className={`rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                        mode === value ? theme.activeButton : "text-zinc-500"
                      }`}
                      key={value}
                      onClick={() => setMode(value)}
                      role="tab"
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative h-[320px] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 sm:h-[430px]">
                {!imageError && (
                  <img
                    alt="Filter playground preview"
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={() => setImageError(true)}
                    src={previewImage}
                    style={{ filter: mode === "filter" ? activeFilterString : "none" }}
                  />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
                {mode === "backdrop" && (
                  <div
                    className={`absolute inset-8 flex items-center justify-center rounded-3xl border border-white/40 p-6 text-center shadow-2xl backdrop-saturate-150 sm:inset-12 ${dark ? "bg-zinc-950/30" : "bg-white/30"}`}
                    style={{
                      WebkitBackdropFilter: activeFilterString,
                      backdropFilter: activeFilterString,
                    }}
                  >
                    <div className="max-w-xs">
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
                        Backdrop filter
                      </span>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
                        Glass panel
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-white/75">
                        The image stays untouched while the panel filters what is behind it.
                      </p>
                    </div>
                  </div>
                )}
                {mode === "filter" && (
                  <div className="absolute bottom-4 left-4 rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white/80 backdrop-blur-sm">
                    Filter applied to image
                  </div>
                )}
                {imageError && (
                  <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                    <div>
                      <FaImage className="mx-auto h-8 w-8 text-zinc-400" />
                      <p className="mt-3 text-sm font-semibold">Image could not be loaded</p>
                      <p className={`mt-1 text-xs ${theme.muted}`}>Try another URL or use the built-in image.</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className={`rounded-3xl border p-5 sm:p-6 ${theme.card}`}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">Generated code</h2>
                  <p className={`mt-1 text-xs ${theme.muted}`}>
                    Ready for a filtered image or a glass panel.
                  </p>
                </div>
                <button
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${theme.secondaryButton}`}
                  onClick={() => setIncludeWebkit((current) => !current)}
                  type="button"
                >
                  <span className={`h-2 w-2 rounded-full ${includeWebkit ? "bg-emerald-500" : "bg-zinc-400"}`} />
                  Webkit prefix
                </button>
              </div>

              <div className="mb-3 flex gap-2">
                {["css", "tailwind"].map((value) => (
                  <button
                    className={`rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                      codeMode === value ? theme.activeButton : theme.secondaryButton
                    }`}
                    key={value}
                    onClick={() => setCodeMode(value)}
                    type="button"
                  >
                    {value === "css" ? "CSS" : "Tailwind"}
                  </button>
                ))}
              </div>

              <div className="relative">
                <pre className={`min-h-28 overflow-x-auto whitespace-pre-wrap rounded-2xl border p-4 pr-20 text-xs leading-relaxed ${theme.code}`}>
                  {displayedCode}
                </pre>
                <button
                  aria-label="Copy generated code"
                  className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-zinc-900 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-zinc-700 active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                  onClick={copyCode}
                  title="Copy generated code"
                  type="button"
                >
                  <FaCopy className="h-3 w-3" /> Copy
                </button>
              </div>
              {codeMode === "tailwind" && (
                <p className={`mt-3 text-[11px] leading-relaxed ${theme.muted}`}>
                  This arbitrary-property class uses the generated filter string. Add it to a Tailwind safelist when building class names dynamically.
                </p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
