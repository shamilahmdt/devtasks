import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const DEFAULT_HEX = "#2563EB";
const DEFAULT_FOREGROUND = "#111111";
const DEFAULT_BACKGROUND = "#FFFFFF";
const SAMPLE_HEX = "#DB2777";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toHexByte(value) {
  return Math.round(clamp(value, 0, 255)).toString(16).padStart(2, "0").toUpperCase();
}

function normalizeHex(input) {
  if (!input) return null;
  const cleaned = input.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(cleaned)) {
    return `#${cleaned
      .split("")
      .map((char) => `${char}${char}`)
      .join("")
      .toUpperCase()}`;
  }
  if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    return `#${cleaned.toUpperCase()}`;
  }
  return null;
}

function hexToRgb(input) {
  const hex = normalizeHex(input);
  if (!hex) return null;
  const value = hex.slice(1);
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
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

function hslToRgb(h, s, l) {
  const hue = ((h % 360) + 360) % 360;
  const sat = clamp(s, 0, 100) / 100;
  const light = clamp(l, 0, 100) / 100;

  const chroma = (1 - Math.abs(2 * light - 1)) * sat;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const match = light - chroma / 2;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (hue < 60) {
    red = chroma;
    green = x;
  } else if (hue < 120) {
    red = x;
    green = chroma;
  } else if (hue < 180) {
    green = chroma;
    blue = x;
  } else if (hue < 240) {
    green = x;
    blue = chroma;
  } else if (hue < 300) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  return {
    r: Math.round((red + match) * 255),
    g: Math.round((green + match) * 255),
    b: Math.round((blue + match) * 255),
  };
}

function rgbToCmyk(r, g, b) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;

  const k = 1 - Math.max(red, green, blue);
  if (k >= 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = (1 - red - k) / (1 - k);
  const m = (1 - green - k) / (1 - k);
  const y = (1 - blue - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

function cmykToRgb(c, m, y, k) {
  const cyan = c / 100;
  const magenta = m / 100;
  const yellow = y / 100;
  const key = k / 100;

  return {
    r: Math.round(255 * (1 - cyan) * (1 - key)),
    g: Math.round(255 * (1 - magenta) * (1 - key)),
    b: Math.round(255 * (1 - yellow) * (1 - key)),
  };
}

function parseNumberList(input) {
  return input.match(/-?\d+(?:\.\d+)?/g)?.map((value) => Number(value)) ?? null;
}

function parseRgbInput(input) {
  const values = parseNumberList(input);
  if (!values || values.length < 3) return null;
  const [r, g, b] = values;
  if ([r, g, b].some((value) => Number.isNaN(value))) return null;
  if ([r, g, b].some((value) => value < 0 || value > 255)) return null;
  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b),
  };
}

function parseHslInput(input) {
  const values = parseNumberList(input);
  if (!values || values.length < 3) return null;
  const [h, s, l] = values;
  if ([h, s, l].some((value) => Number.isNaN(value))) return null;
  if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) return null;
  return {
    h: Math.round(h),
    s: Math.round(s),
    l: Math.round(l),
  };
}

function parseCmykInput(input) {
  const values = parseNumberList(input);
  if (!values || values.length < 4) return null;
  const [c, m, y, k] = values;
  if ([c, m, y, k].some((value) => Number.isNaN(value))) return null;
  if ([c, m, y, k].some((value) => value < 0 || value > 100)) return null;
  return {
    c: Math.round(c),
    m: Math.round(m),
    y: Math.round(y),
    k: Math.round(k),
  };
}

function relativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const channel = (value) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  const r = channel(rgb.r);
  const g = channel(rgb.g);
  const b = channel(rgb.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground, background) {
  const lumA = relativeLuminance(foreground);
  const lumB = relativeLuminance(background);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

function readableTextColor(hex) {
  return relativeLuminance(hex) > 0.55 ? "#111827" : "#FFFFFF";
}

function formatRgb(rgb) {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

function formatHsl(hsl) {
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

function formatCmyk(cmyk) {
  return `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
}

function buildPalette(hex) {
  const rgb = hexToRgb(hex) || hexToRgb(DEFAULT_HEX);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const buildHex = (h, s, l) => rgbToHex(hslToRgb(h, s, l));

  return {
    complementary: [
      hex,
      buildHex(hsl.h + 180, hsl.s, hsl.l),
    ],
    triadic: [
      hex,
      buildHex(hsl.h + 120, hsl.s, hsl.l),
      buildHex(hsl.h + 240, hsl.s, hsl.l),
    ],
    analogous: [
      buildHex(hsl.h - 30, hsl.s, hsl.l),
      hex,
      buildHex(hsl.h + 30, hsl.s, hsl.l),
    ],
    monochromatic: [
      buildHex(hsl.h, hsl.s, 20),
      buildHex(hsl.h, hsl.s, 35),
      hex,
      buildHex(hsl.h, clamp(hsl.s - 10, 20, 100), 68),
      buildHex(hsl.h, clamp(hsl.s - 16, 12, 100), 84),
    ],
  };
}

function FormatCard({
  dark,
  label,
  helper,
  inputValue,
  onInputChange,
  onApply,
  currentValue,
  placeholder,
  onCopy,
}) {
  return (
    <div
      className={`rounded-3xl border p-4 sm:p-5 transition-colors duration-300 overflow-hidden ${
        dark ? "bg-zinc-950/40 border-zinc-800/80" : "bg-neutral-50 border-neutral-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p
            className={`text-xs font-black uppercase tracking-widest ${
              dark ? "text-zinc-400" : "text-neutral-500"
            }`}
          >
            {label}
          </p>
          <p className={`text-[11px] mt-1 ${dark ? "text-zinc-500" : "text-neutral-400"}`}>
            {helper}
          </p>
        </div>

        <button
          type="button"
          onClick={onApply}
          className={`shrink-0 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 ${
            dark
              ? "bg-white text-black border-white hover:bg-zinc-200"
              : "bg-black text-white border-black hover:bg-zinc-800"
          }`}
        >
          Apply
        </button>
      </div>

      <input
        type="text"
        value={inputValue}
        onChange={(event) => onInputChange(event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className={`w-full min-w-0 px-4 py-3 rounded-2xl border text-sm font-mono outline-none transition-all duration-300 ${
          dark
            ? "bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-white focus:ring-1 focus:ring-white"
            : "bg-white border-neutral-200 text-zinc-900 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
        }`}
      />

      <div
        className={`mt-3 rounded-2xl border px-4 py-3 flex items-center justify-between gap-3 min-w-0 ${
          dark ? "bg-zinc-900/80 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        <span className="font-mono text-sm break-all tabular-nums min-w-0">{currentValue}</span>
        <button
          type="button"
          onClick={() => onCopy(currentValue, label)}
          className={`shrink-0 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 ${
            dark
              ? "border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              : "border-neutral-300 text-zinc-600 hover:bg-neutral-100 hover:text-black"
          }`}
        >
          Copy
        </button>
      </div>
    </div>
  );
}

function PaletteGroup({ dark, title, description, colors, onCopy }) {
  return (
    <div
      className={`rounded-3xl border p-4 sm:p-5 transition-colors duration-300 ${
        dark ? "bg-zinc-950/40 border-zinc-800/80" : "bg-neutral-50 border-neutral-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p
            className={`text-xs font-black uppercase tracking-widest ${
              dark ? "text-zinc-400" : "text-neutral-500"
            }`}
          >
            {title}
          </p>
          <p className={`text-[11px] mt-1 ${dark ? "text-zinc-500" : "text-neutral-400"}`}>
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onCopy(colors.join(" | "), `${title} palette`)}
          className={`shrink-0 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 ${
            dark
              ? "bg-white text-black border-white hover:bg-zinc-200"
              : "bg-black text-white border-black hover:bg-zinc-800"
          }`}
        >
          Copy set
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {colors.map((color) => {
          const textColor = readableTextColor(color);
          return (
            <button
              key={color}
              type="button"
              onClick={() => onCopy(color, `${title} swatch`)}
              style={{ backgroundColor: color, color: textColor }}
              className="min-h-[110px] rounded-2xl border border-black/10 shadow-sm p-3 flex flex-col justify-between text-left transition-transform duration-200 hover:-translate-y-0.5"
            >
              <span className="text-[10px] font-black uppercase tracking-widest">
                Copy
              </span>
              <span className="font-mono text-sm font-semibold break-all">{color}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ColorConverter() {
  const { dark } = useTheme();
  const [hex, setHex] = useState(DEFAULT_HEX);
  const [hexInput, setHexInput] = useState(DEFAULT_HEX);
  const [rgbInput, setRgbInput] = useState("37, 99, 235");
  const [hslInput, setHslInput] = useState("221, 83%, 53%");
  const [cmykInput, setCmykInput] = useState("84%, 58%, 0%, 8%");
  const [foreground, setForeground] = useState(DEFAULT_FOREGROUND);
  const [background, setBackground] = useState(DEFAULT_BACKGROUND);
  const [foregroundInput, setForegroundInput] = useState(DEFAULT_FOREGROUND);
  const [backgroundInput, setBackgroundInput] = useState(DEFAULT_BACKGROUND);

  useEffect(() => {
    const rgb = hexToRgb(hex);
    if (!rgb) return;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

    setHexInput(hex);
    setRgbInput(`${rgb.r}, ${rgb.g}, ${rgb.b}`);
    setHslInput(`${hsl.h}, ${hsl.s}%, ${hsl.l}%`);
    setCmykInput(`${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`);
  }, [hex]);

  useEffect(() => {
    setForegroundInput(foreground);
  }, [foreground]);

  useEffect(() => {
    setBackgroundInput(background);
  }, [background]);

  const rgb = useMemo(() => hexToRgb(hex) || hexToRgb(DEFAULT_HEX), [hex]);
  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);
  const cmyk = useMemo(() => rgbToCmyk(rgb.r, rgb.g, rgb.b), [rgb]);
  const palettes = useMemo(() => buildPalette(hex), [hex]);

  const contrast = useMemo(() => {
    const ratio = contrastRatio(foreground, background);
    return {
      ratio,
      aaNormal: ratio >= 4.5,
      aaLarge: ratio >= 3,
      aaaNormal: ratio >= 7,
      aaaLarge: ratio >= 4.5,
    };
  }, [foreground, background]);

  const copyText = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied to clipboard.`);
    } catch (error) {
      toast.error("Failed to copy to clipboard.");
    }
  };

  const handleCopyAll = async () => {
    const payload = [
      `HEX: ${hex}`,
      `RGB: ${formatRgb(rgb)}`,
      `HSL: ${formatHsl(hsl)}`,
      `CMYK: ${formatCmyk(cmyk)}`,
    ].join("\n");

    await copyText(payload, "All formats");
  };

  const handleHexApply = () => {
    const next = normalizeHex(hexInput);
    if (!next) {
      toast.error("Enter a valid HEX color like #2563EB.");
      return;
    }
    setHex(next);
  };

  const handleRgbApply = () => {
    const next = parseRgbInput(rgbInput);
    if (!next) {
      toast.error("Enter RGB as three values between 0 and 255.");
      return;
    }
    setHex(rgbToHex(next));
  };

  const handleHslApply = () => {
    const next = parseHslInput(hslInput);
    if (!next) {
      toast.error("Enter HSL as hue, saturation%, lightness%.");
      return;
    }
    setHex(rgbToHex(hslToRgb(next.h, next.s, next.l)));
  };

  const handleCmykApply = () => {
    const next = parseCmykInput(cmykInput);
    if (!next) {
      toast.error("Enter CMYK as four values from 0 to 100.");
      return;
    }
    setHex(rgbToHex(cmykToRgb(next.c, next.m, next.y, next.k)));
  };

  const handleSample = () => {
    setHex(SAMPLE_HEX);
  };

  const formatCards = [
    {
      label: "HEX",
      helper: "Paste a HEX value and apply it.",
      inputValue: hexInput,
      onInputChange: setHexInput,
      onApply: handleHexApply,
      currentValue: hex,
      placeholder: "#2563EB",
    },
    {
      label: "RGB",
      helper: "Use comma-separated RGB values.",
      inputValue: rgbInput,
      onInputChange: setRgbInput,
      onApply: handleRgbApply,
      currentValue: formatRgb(rgb),
      placeholder: "37, 99, 235",
    },
    {
      label: "HSL",
      helper: "Use hue, saturation%, and lightness%.",
      inputValue: hslInput,
      onInputChange: setHslInput,
      onApply: handleHslApply,
      currentValue: formatHsl(hsl),
      placeholder: "221, 83%, 53%",
    },
    {
      label: "CMYK",
      helper: "Use cyan, magenta, yellow, and key values.",
      inputValue: cmykInput,
      onInputChange: setCmykInput,
      onApply: handleCmykApply,
      currentValue: formatCmyk(cmyk),
      placeholder: "84%, 58%, 0%, 8%",
    },
  ];

  const paletteGroups = [
    {
      title: "Complementary",
      description: "Two opposite hues for bold contrast.",
      colors: palettes.complementary,
    },
    {
      title: "Triadic",
      description: "Three evenly spaced colors for balance.",
      colors: palettes.triadic,
    },
    {
      title: "Analogous",
      description: "Neighboring hues for a smooth blend.",
      colors: palettes.analogous,
    },
    {
      title: "Monochromatic",
      description: "One hue across multiple lightness levels.",
      colors: palettes.monochromatic,
    },
  ];

  const criteria = [
    { label: "WCAG AA • Normal text", minimum: 4.5 },
    { label: "WCAG AA • Large text", minimum: 3 },
    { label: "WCAG AAA • Normal text", minimum: 7 },
    { label: "WCAG AAA • Large text", minimum: 4.5 },
  ];

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      card: "bg-white border-zinc-200/85",
      cardSoft: "bg-zinc-50 border-zinc-200/85",
      input:
        "bg-white border-neutral-200 text-zinc-900 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black",
      subtext: "text-neutral-500",
      muted: "text-zinc-500",
      button: "bg-black text-white hover:bg-zinc-800 border-black",
      buttonSoft:
        "bg-white text-zinc-700 border-neutral-200 hover:text-black hover:border-neutral-400",
      chip: "bg-neutral-100 text-zinc-700 border-neutral-200",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      card: "bg-zinc-900/50 border-zinc-800/85",
      cardSoft: "bg-zinc-950/50 border-zinc-800/80",
      input:
        "bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-white focus:ring-1 focus:ring-white",
      subtext: "text-zinc-500",
      muted: "text-zinc-400",
      button: "bg-white text-black hover:bg-zinc-200 border-white",
      buttonSoft:
        "bg-zinc-800 text-zinc-200 border-zinc-700 hover:text-white hover:border-zinc-500",
      chip: "bg-zinc-800/70 text-zinc-300 border-zinc-700/60",
    },
  };

  const t = dark ? theme.dark : theme.light;

  return (
    <div
      className={`relative min-h-screen p-4 sm:p-6 font-sans antialiased transition-colors duration-300 overflow-x-hidden ${
        dark ? "bg-zinc-950" : "bg-[#FDFDFD]"
      }`}
    >
      <title>Color Converter & Contrast Checker — DevTasks</title>
      <meta
        name="description"
        content="Convert HEX, RGB, HSL, and CMYK colors, generate harmonious palettes, and check WCAG contrast ratios offline."
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
        className={`relative z-10 w-full max-w-7xl mx-auto rounded-[32px] border shadow-xl flex flex-col overflow-hidden transition-all duration-300 ${
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
                : "bg-white border-neutral-200 text-neutral-600 hover:text-black"
            }`}
            title="Back to Workspace"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>

          <div className="min-w-0">
            <h1
              className={`text-xl sm:text-2xl font-black uppercase tracking-tight transition-colors duration-300 ${
                dark ? "text-white" : "text-black"
              }`}
            >
              Color Converter & Contrast Checker
            </h1>
            <p className={`text-sm mt-1 ${t.subtext}`}>
              Convert colors, generate harmonies, and verify WCAG contrast entirely in the browser.
            </p>
          </div>
        </div>

        <div className="px-5 sm:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 xl:grid-cols-[1.12fr_0.88fr] gap-6">
            <div className="space-y-6">
              <section className={`rounded-[28px] border p-5 sm:p-6 ${t.card}`}>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <p className={`text-xs font-black uppercase tracking-widest ${t.muted}`}>
                      Source color
                    </p>
                    <h2 className="text-2xl font-black uppercase tracking-tight">
                      Instant format conversion
                    </h2>
                    <p className={`text-sm max-w-2xl ${t.subtext}`}>
                      Choose a color with the native picker or type a value in any format. Every
                      format stays in sync after you apply it.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <input
                      type="color"
                      value={hex.toLowerCase()}
                      onChange={(event) => setHex(event.target.value.toUpperCase())}
                      className="h-12 w-14 rounded-2xl border border-neutral-200 bg-transparent p-1 cursor-pointer"
                      aria-label="Native color picker"
                    />
                    <div
                      className={`min-w-[140px] rounded-2xl border px-4 py-3 ${
                        dark ? "bg-zinc-950 border-zinc-800" : "bg-neutral-50 border-neutral-200"
                      }`}
                    >
                      <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        Selected hex
                      </div>
                      <div className="font-mono text-lg font-semibold mt-1">{hex}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleSample}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 ${t.button}`}
                  >
                    Sample
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyAll}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 ${t.buttonSoft}`}
                  >
                    Copy all formats
                  </button>
                </div>
              </section>

              <section className={`rounded-[28px] border p-5 sm:p-6 ${t.cardSoft}`}>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="min-w-0">
                    <p className={`text-xs font-black uppercase tracking-widest ${t.muted}`}>
                      Conversion fields
                    </p>
                    <h2 className="text-xl font-black uppercase tracking-tight mt-1">
                      HEX, RGB, HSL, CMYK
                    </h2>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${t.chip}`}>
                    Client-side only
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formatCards.map((card) => (
                    <FormatCard
                      key={card.label}
                      dark={dark}
                      label={card.label}
                      helper={card.helper}
                      inputValue={card.inputValue}
                      onInputChange={card.onInputChange}
                      onApply={card.onApply}
                      currentValue={card.currentValue}
                      placeholder={card.placeholder}
                      onCopy={copyText}
                    />
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className={`rounded-[28px] border p-5 sm:p-6 ${t.card}`}>
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="min-w-0">
                    <p className={`text-xs font-black uppercase tracking-widest ${t.muted}`}>
                      Harmony palettes
                    </p>
                    <h2 className="text-xl font-black uppercase tracking-tight mt-1">
                      Generated from {hex}
                    </h2>
                    <p className={`text-sm mt-2 ${t.subtext}`}>
                      Copy individual swatches or whole palette sets directly.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {paletteGroups.map((group) => (
                    <PaletteGroup
                      key={group.title}
                      dark={dark}
                      title={group.title}
                      description={group.description}
                      colors={group.colors}
                      onCopy={copyText}
                    />
                  ))}
                </div>
              </section>
            </div>
          </div>

          <section className={`mt-6 rounded-[28px] border p-5 sm:p-6 ${t.card}`}>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
              <div className="min-w-0">
                <p className={`text-xs font-black uppercase tracking-widest ${t.muted}`}>
                  WCAG contrast checker
                </p>
                <h2 className="text-xl font-black uppercase tracking-tight mt-1">
                  Foreground vs background
                </h2>
                <p className={`text-sm mt-2 ${t.subtext}`}>
                  Check contrast ratios for normal and large text, then swap or reuse the main
                  converter color.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const nextForeground = background;
                  const nextBackground = foreground;
                  setForeground(nextForeground);
                  setBackground(nextBackground);
                }}
                className={`shrink-0 px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 ${t.buttonSoft}`}
              >
                Swap
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className={`rounded-3xl border p-4 overflow-hidden ${t.cardSoft}`}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className={`text-xs font-black uppercase tracking-widest ${t.muted}`}>
                    Foreground
                  </p>
                  <button
                    type="button"
                    onClick={() => setForeground(hex)}
                    className={`shrink-0 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-all duration-300 ${t.buttonSoft}`}
                  >
                    Use current color
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[auto_minmax(0,1fr)] gap-3 items-center">
                  <input
                    type="color"
                    value={foreground.toLowerCase()}
                    onChange={(event) => setForeground(event.target.value.toUpperCase())}
                    className="h-12 w-14 rounded-2xl border border-neutral-200 bg-transparent p-1 cursor-pointer shrink-0"
                    aria-label="Foreground color picker"
                  />
                  <input
                    type="text"
                    value={foregroundInput}
                    onChange={(event) => setForegroundInput(event.target.value)}
                    onBlur={() => {
                      const next = normalizeHex(foregroundInput);
                      if (!next) {
                        toast.error("Enter a valid foreground HEX color.");
                        setForegroundInput(foreground);
                        return;
                      }
                      setForeground(next);
                    }}
                    placeholder="#111111"
                    spellCheck={false}
                    className={`w-full min-w-0 px-4 py-3 rounded-2xl border text-sm font-mono outline-none transition-all duration-300 ${t.input}`}
                  />
                </div>
              </div>

              <div className={`rounded-3xl border p-4 overflow-hidden ${t.cardSoft}`}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className={`text-xs font-black uppercase tracking-widest ${t.muted}`}>
                    Background
                  </p>
                  <button
                    type="button"
                    onClick={() => setBackground(hex)}
                    className={`shrink-0 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-all duration-300 ${t.buttonSoft}`}
                  >
                    Use current color
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[auto_minmax(0,1fr)] gap-3 items-center">
                  <input
                    type="color"
                    value={background.toLowerCase()}
                    onChange={(event) => setBackground(event.target.value.toUpperCase())}
                    className="h-12 w-14 rounded-2xl border border-neutral-200 bg-transparent p-1 cursor-pointer shrink-0"
                    aria-label="Background color picker"
                  />
                  <input
                    type="text"
                    value={backgroundInput}
                    onChange={(event) => setBackgroundInput(event.target.value)}
                    onBlur={() => {
                      const next = normalizeHex(backgroundInput);
                      if (!next) {
                        toast.error("Enter a valid background HEX color.");
                        setBackgroundInput(background);
                        return;
                      }
                      setBackground(next);
                    }}
                    placeholder="#FFFFFF"
                    spellCheck={false}
                    className={`w-full min-w-0 px-4 py-3 rounded-2xl border text-sm font-mono outline-none transition-all duration-300 ${t.input}`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border p-5 sm:p-6 bg-zinc-950 text-white">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Contrast ratio
                  </p>
                  <div className="mt-2 flex items-end gap-3">
                    <span className="text-4xl font-black tracking-tight">
                      {contrast.ratio.toFixed(2)}
                    </span>
                    <span className="pb-1 text-sm text-zinc-400">: 1</span>
                  </div>
                </div>

                <div
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                    contrast.aaNormal
                      ? "bg-white text-black border-white"
                      : "bg-zinc-900 text-zinc-300 border-zinc-700"
                  }`}
                >
                  {contrast.aaNormal ? "AA Normal Pass" : "AA Normal Fail"}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {criteria.map((item) => {
                  const passed = contrast.ratio >= item.minimum;
                  return (
                    <div
                      key={item.label}
                      className={`rounded-2xl border px-4 py-3 ${
                        passed
                          ? "bg-white text-black border-white"
                          : "bg-zinc-900 text-zinc-300 border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {item.label}
                        </span>
                        <span className="font-black text-[10px] uppercase tracking-widest">
                          {passed ? "Pass" : "Fail"}
                        </span>
                      </div>
                      <div className="mt-2 text-sm font-mono">{item.minimum.toFixed(1)}:1 minimum</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
