import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const DEFAULT_HEX = "#2563EB";
const GRAY_TONE = "#808080";

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
        hue = 60 * (((green - blue) / delta + 6) % 6);
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

function rgbToHsv(r, g, b) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === red) hue = 60 * (((green - blue) / delta) % 6);
    else if (max === green) hue = 60 * ((blue - red) / delta + 2);
    else hue = 60 * ((red - green) / delta + 4);
  }

  const saturation = max === 0 ? 0 : (delta / max) * 100;
  const value = max * 100;

  return {
    h: Math.round((hue + 360) % 360),
    s: Math.round(saturation),
    v: Math.round(value),
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

  return {
    c: Math.round(((1 - red - k) / (1 - k)) * 100),
    m: Math.round(((1 - green - k) / (1 - k)) * 100),
    y: Math.round(((1 - blue - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

function rgbToXyz(r, g, b) {
  const convert = (channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  const red = convert(r);
  const green = convert(g);
  const blue = convert(b);

  return {
    x: (red * 0.4124564 + green * 0.3575761 + blue * 0.1804375) * 100,
    y: (red * 0.2126729 + green * 0.7151522 + blue * 0.072175) * 100,
    z: (red * 0.0193339 + green * 0.119192 + blue * 0.9503041) * 100,
  };
}

function xyzToLab(x, y, z) {
  const refX = 95.047;
  const refY = 100;
  const refZ = 108.883;

  const transform = (value, reference) => {
    const ratio = value / reference;
    return ratio > 0.008856 ? ratio ** (1 / 3) : 7.787 * ratio + 16 / 116;
  };

  const fx = transform(x, refX);
  const fy = transform(y, refY);
  const fz = transform(z, refZ);

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

function rgbToColorRef(r, g, b) {
  return r + g * 256 + b * 65536;
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

  return (
    0.2126 * channel(rgb.r) +
    0.7152 * channel(rgb.g) +
    0.0722 * channel(rgb.b)
  );
}

function contrastRatio(foreground, background) {
  const lumA = relativeLuminance(foreground);
  const lumB = relativeLuminance(background);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

function recommendedTextColor(hex) {
  const whiteContrast = contrastRatio("#FFFFFF", hex);
  const blackContrast = contrastRatio("#000000", hex);
  return whiteContrast >= blackContrast ? "#FFFFFF" : "#000000";
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
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}

function parseHslInput(input) {
  const values = parseNumberList(input);
  if (!values || values.length < 3) return null;
  const [h, s, l] = values;
  if ([h, s, l].some((value) => Number.isNaN(value))) return null;
  if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) return null;
  return { h: Math.round(h), s: Math.round(s), l: Math.round(l) };
}

function parseColorInput(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const hex = normalizeHex(trimmed);
  if (hex) return hex;

  if (/^rgb/i.test(trimmed)) {
    const rgb = parseRgbInput(trimmed);
    return rgb ? rgbToHex(rgb) : null;
  }

  if (/^hsl/i.test(trimmed)) {
    const hsl = parseHslInput(trimmed);
    return hsl ? rgbToHex(hslToRgb(hsl.h, hsl.s, hsl.l)) : null;
  }

  const rgb = parseRgbInput(trimmed);
  if (rgb) return rgbToHex(rgb);

  const hsl = parseHslInput(trimmed);
  if (hsl) return rgbToHex(hslToRgb(hsl.h, hsl.s, hsl.l));

  return null;
}

function mixColors(fromHex, toHex, factor) {
  const from = hexToRgb(fromHex);
  const to = hexToRgb(toHex);
  if (!from || !to) return fromHex;

  return rgbToHex({
    r: Math.round(from.r + (to.r - from.r) * factor),
    g: Math.round(from.g + (to.g - from.g) * factor),
    b: Math.round(from.b + (to.b - from.b) * factor),
  });
}

function uniqueColors(colors) {
  return [...new Set(colors)];
}

function getHarmonyHsl(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  let boosted = false;

  if (hsl.s < 12) {
    boosted = true;
    return { ...hsl, s: 65, l: clamp(hsl.l, 28, 72), boosted };
  }

  if (hsl.l > 92 || hsl.l < 8) {
    boosted = true;
    return { ...hsl, l: clamp(hsl.l, 28, 72), boosted };
  }

  return { ...hsl, boosted };
}

function buildHarmony(hex, offsets) {
  const base = normalizeHex(hex);
  if (!base) return [];

  const harmony = getHarmonyHsl(base);
  if (!harmony) return [];

  const related = offsets.map((offset) =>
    rgbToHex(hslToRgb(harmony.h + offset, harmony.s, harmony.l)),
  );

  return uniqueColors([base, ...related]);
}

function buildMixScale(hex, targetHex) {
  const mixed = uniqueColors(
    Array.from({ length: 10 }, (_, index) =>
      mixColors(hex, targetHex, (index + 1) / 10),
    ),
  );

  return mixed.map((color, index) => ({
    percent: ((index + 1) / mixed.length) * 100,
    hex: color,
  }));
}

function generateCssVariables(hex, harmonies) {
  const lines = [":root {"];
  lines.push(`  --color-primary: ${hex};`);
  Object.entries(harmonies).forEach(([name, colors]) => {
    colors.forEach((color, index) => {
      lines.push(`  --color-${name}-${index + 1}: ${color};`);
    });
  });
  lines.push("}");
  return lines.join("\n");
}

function generateCssClasses(hex) {
  const text = recommendedTextColor(hex);
  return `.bg-primary {
  background-color: ${hex};
}

.text-primary {
  color: ${hex};
}

.text-on-primary {
  color: ${text};
  background-color: ${hex};
}`;
}

function generateTailwind(hex, harmonies) {
  const harmonyEntries = Object.entries(harmonies)
    .flatMap(([name, colors]) =>
      colors.map(
        (color, index) => `          '${name}-${index + 1}': '${color}',`,
      ),
    )
    .join("\n");

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '${hex}',
        harmony: {
${harmonyEntries}
        },
      },
    },
  },
};`;
}

function generateSass(hex, harmonies) {
  const lines = [`$color-primary: ${hex};`];
  Object.entries(harmonies).forEach(([name, colors]) => {
    colors.forEach((color, index) => {
      lines.push(`$color-${name}-${index + 1}: ${color};`);
    });
  });
  return lines.join("\n");
}

function SpecRow({ dark, label, value, onCopy }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 min-w-0 ${
        dark ? "bg-zinc-950/50 border-zinc-800" : "bg-white border-neutral-200"
      }`}
    >
      <div className="min-w-0">
        <p
          className={`text-[10px] font-black uppercase tracking-widest ${
            dark ? "text-zinc-500" : "text-neutral-400"
          }`}
        >
          {label}
        </p>
        <p className="font-mono text-sm break-all mt-1">{value}</p>
      </div>
      <button
        type="button"
        onClick={() => onCopy(value, label)}
        className={`shrink-0 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 ${
          dark
            ? "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            : "border-neutral-300 text-zinc-600 hover:bg-neutral-100"
        }`}
      >
        Copy
      </button>
    </div>
  );
}

function SwatchRow({ title, colors, activeHex, onSelect, dark }) {
  return (
    <div className="space-y-3">
      <p
        className={`text-xs font-black uppercase tracking-widest ${
          dark ? "text-zinc-400" : "text-neutral-500"
        }`}
      >
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {colors.map((color, index) => {
          const isActive = color === activeHex;
          return (
            <button
              key={`${title}-${index}-${color}`}
              type="button"
              onClick={() => onSelect(color)}
              className={`flex flex-col items-center gap-2 transition-transform duration-200 hover:-translate-y-0.5 ${
                isActive ? "scale-105" : ""
              }`}
              title={`Set active color to ${color}`}
            >
              <span
                style={{ backgroundColor: color }}
                className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl border shadow-sm ${
                  isActive
                    ? "ring-2 ring-offset-2 ring-black dark:ring-white dark:ring-offset-zinc-900"
                    : "border-black/10"
                }`}
              />
              <span
                className={`font-mono text-[10px] sm:text-xs ${
                  dark ? "text-zinc-400" : "text-neutral-500"
                }`}
              >
                {color}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VariationRow({ title, steps, activeHex, onSelect, dark }) {
  return (
    <div className="space-y-3">
      <p
        className={`text-xs font-black uppercase tracking-widest ${
          dark ? "text-zinc-400" : "text-neutral-500"
        }`}
      >
        {title}
      </p>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {steps.map((step) => {
            const isActive = step.hex === activeHex;
            return (
              <button
                key={`${title}-${step.percent}`}
                type="button"
                onClick={() => onSelect(step.hex)}
                className={`flex flex-col items-center gap-2 min-w-[56px] transition-transform duration-200 hover:-translate-y-0.5 ${
                  isActive ? "scale-105" : ""
                }`}
                title={`${step.percent}% — ${step.hex}`}
              >
                <span
                  style={{ backgroundColor: step.hex }}
                  className={`h-12 w-full min-w-[56px] rounded-lg border ${
                    isActive
                      ? "ring-2 ring-offset-1 ring-black dark:ring-white dark:ring-offset-zinc-900"
                      : "border-black/10"
                  }`}
                />
                <span
                  className={`font-mono text-[10px] ${
                    dark ? "text-zinc-400" : "text-neutral-500"
                  }`}
                >
                  {step.hex}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const PANEL_TABS = ["Harmonies", "Variations", "Code Export"];
const EXPORT_TABS = ["CSS Variables", "CSS Classes", "Tailwind", "Sass"];

export default function AdvancedColorAnalyzer() {
  const { dark } = useTheme();
  const [hex, setHex] = useState(DEFAULT_HEX);
  const [colorInput, setColorInput] = useState(DEFAULT_HEX);
  const [panelTab, setPanelTab] = useState("Harmonies");
  const [exportTab, setExportTab] = useState("CSS Variables");

  useEffect(() => {
    setColorInput(hex);
  }, [hex]);

  const rgb = useMemo(() => hexToRgb(hex) || hexToRgb(DEFAULT_HEX), [hex]);
  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);
  const hsv = useMemo(() => rgbToHsv(rgb.r, rgb.g, rgb.b), [rgb]);
  const cmyk = useMemo(() => rgbToCmyk(rgb.r, rgb.g, rgb.b), [rgb]);
  const xyz = useMemo(() => rgbToXyz(rgb.r, rgb.g, rgb.b), [rgb]);
  const lab = useMemo(() => xyzToLab(xyz.x, xyz.y, xyz.z), [xyz]);
  const colorRef = useMemo(() => rgbToColorRef(rgb.r, rgb.g, rgb.b), [rgb]);
  const decimal = useMemo(
    () => parseInt(hex.slice(1), 16),
    [hex],
  );

  const isLight = relativeLuminance(hex) > 0.179;
  const textColor = recommendedTextColor(hex);
  const contrastWithText = contrastRatio(textColor, hex);

  const harmonyMeta = useMemo(() => getHarmonyHsl(hex), [hex]);

  const harmonies = useMemo(
    () => ({
      complementary: buildHarmony(hex, [180]),
      analogous: buildHarmony(hex, [-30, 30]),
      triadic: buildHarmony(hex, [120, 240]),
      splitComplementary: buildHarmony(hex, [150, 210]),
      square: buildHarmony(hex, [90, 180, 270]),
    }),
    [hex],
  );

  const variations = useMemo(
    () => ({
      tints: buildMixScale(hex, "#FFFFFF"),
      shades: buildMixScale(hex, "#000000"),
      tones: buildMixScale(hex, GRAY_TONE),
    }),
    [hex],
  );

  const exportCode = useMemo(() => {
    if (exportTab === "CSS Variables") return generateCssVariables(hex, harmonies);
    if (exportTab === "CSS Classes") return generateCssClasses(hex);
    if (exportTab === "Tailwind") return generateTailwind(hex, harmonies);
    return generateSass(hex, harmonies);
  }, [exportTab, hex, harmonies]);

  const copyText = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied to clipboard.`);
    } catch {
      toast.error("Failed to copy to clipboard.");
    }
  };

  const updateColor = (value) => {
    const next = normalizeHex(value);
    if (next) setHex(next);
  };

  const applyInput = () => {
    const next = parseColorInput(colorInput);
    if (!next) {
      toast.error("Enter a valid HEX, RGB, or HSL color.");
      setColorInput(hex);
      return;
    }
    updateColor(next);
  };

  const specs = [
    { label: "HEX", value: hex },
    { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    {
      label: "RGB %",
      value: `rgb(${(rgb.r / 255 * 100).toFixed(1)}%, ${(rgb.g / 255 * 100).toFixed(1)}%, ${(rgb.b / 255 * 100).toFixed(1)}%)`,
    },
    { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: "HSV / HSB", value: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` },
    {
      label: "CMYK",
      value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
    },
    {
      label: "XYZ",
      value: `xyz(${xyz.x.toFixed(2)}, ${xyz.y.toFixed(2)}, ${xyz.z.toFixed(2)})`,
    },
    {
      label: "CIELab",
      value: `lab(${lab.l.toFixed(2)}, ${lab.a.toFixed(2)}, ${lab.b.toFixed(2)})`,
    },
    { label: "Decimal", value: String(decimal) },
    { label: "Win32 COLORREF", value: String(colorRef) },
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
      tabActive: "bg-black text-white border-black",
      tabIdle: "bg-white text-zinc-600 border-neutral-200 hover:border-neutral-400",
      codeBox: "bg-zinc-900 text-zinc-100 border-zinc-800",
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
      tabActive: "bg-white text-black border-white",
      tabIdle: "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500",
      codeBox: "bg-black/40 text-emerald-400 border-zinc-800/80 font-mono",
    },
  };

  const t = dark ? theme.dark : theme.light;

  const harmonySections = [
    { title: "Complementary", colors: harmonies.complementary },
    { title: "Analogous", colors: harmonies.analogous },
    { title: "Triadic", colors: harmonies.triadic },
    { title: "Split-complementary", colors: harmonies.splitComplementary },
    { title: "Square / Tetradic", colors: harmonies.square },
  ];

  return (
    <div
      className={`relative min-h-screen p-4 sm:p-6 font-sans antialiased transition-colors duration-300 overflow-x-hidden ${
        dark ? "bg-zinc-950" : "bg-[#FDFDFD]"
      }`}
    >
      <title>Advanced Color Analyzer — DevTasks</title>
      <meta
        name="description"
        content="Analyze colors offline with 10+ color spaces, harmonies, monochromatic variations, and copy-ready CSS export."
      />

      <div
        className={`absolute top-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-30 ${
          dark ? "bg-zinc-800" : "bg-neutral-200"
        }`}
      />

      <div
        className={`relative z-10 w-full max-w-7xl mx-auto rounded-[32px] border shadow-xl flex flex-col overflow-hidden ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        <div className={`h-2 w-full ${dark ? "bg-white" : "bg-black"}`} />

        <div className="px-5 sm:px-8 pt-6 sm:pt-8 flex items-center gap-3">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${
              dark
                ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white"
                : "bg-white border-neutral-200 text-neutral-600 hover:text-black"
            }`}
            title="Back to Dev Utilities"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
              Advanced Color Analyzer
            </h1>
            <p className={`text-sm mt-1 ${t.subtext}`}>
              Color harmonies, variations, and 10+ color space conversions — fully offline.
            </p>
          </div>
        </div>

        <div className="px-5 sm:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-6">
              <section className={`rounded-[28px] border p-5 sm:p-6 ${t.card}`}>
                <p className={`text-xs font-black uppercase tracking-widest ${t.muted}`}>
                  Input & Specs
                </p>
                <h2 className="text-xl font-black uppercase tracking-tight mt-1">
                  Active color
                </h2>

                <div className="mt-5 flex flex-col sm:flex-row gap-4">
                  <input
                    type="color"
                    value={hex.toLowerCase()}
                    onChange={(event) => updateColor(event.target.value)}
                    className="h-14 w-16 rounded-2xl border border-neutral-200 bg-transparent p-1 cursor-pointer shrink-0"
                    aria-label="Color picker"
                  />
                  <div className="flex-1 min-w-0 flex gap-2">
                    <input
                      type="text"
                      value={colorInput}
                      onChange={(event) => setColorInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") applyInput();
                      }}
                      onBlur={() => {
                        if (document.activeElement?.type === "color") return;
                        applyInput();
                      }}
                      placeholder="#2563EB or rgb(37, 99, 235) or hsl(221, 83%, 53%)"
                      spellCheck={false}
                      className={`flex-1 min-w-0 px-4 py-3 rounded-2xl border text-sm font-mono outline-none ${t.input}`}
                    />
                    <button
                      type="button"
                      onClick={applyInput}
                      className={`shrink-0 px-4 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest ${t.button}`}
                    >
                      Apply
                    </button>
                  </div>
                </div>

                <div
                  className="mt-5 rounded-2xl border p-5 flex items-center justify-between gap-4"
                  style={{ backgroundColor: hex, color: textColor }}
                >
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                      Contrast preview
                    </p>
                    <p className="text-lg font-black mt-1">Sample text on {hex}</p>
                    <p className="text-sm opacity-90 mt-1">
                      Ratio {contrastWithText.toFixed(2)}:1 with {textColor}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                      Classification
                    </p>
                    <p className="text-2xl font-black mt-1">{isLight ? "Light" : "Dark"}</p>
                  </div>
                </div>
              </section>

              <section className={`rounded-[28px] border p-5 sm:p-6 ${t.cardSoft}`}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest ${t.muted}`}>
                      Conversions
                    </p>
                    <h2 className="text-lg font-black uppercase tracking-tight mt-1">
                      10+ color spaces
                    </h2>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${t.chip}`}>
                    Offline
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {specs.map((spec) => (
                    <SpecRow
                      key={spec.label}
                      dark={dark}
                      label={spec.label}
                      value={spec.value}
                      onCopy={copyText}
                    />
                  ))}
                </div>
              </section>
            </div>

            <section className={`rounded-[28px] border p-5 sm:p-6 ${t.card}`}>
              <p className={`text-xs font-black uppercase tracking-widest ${t.muted}`}>
                Harmonies & Code
              </p>
              <h2 className="text-xl font-black uppercase tracking-tight mt-1">
                Palettes & export
              </h2>

              <div className="mt-5 flex flex-wrap gap-2">
                {PANEL_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setPanelTab(tab)}
                    className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                      panelTab === tab ? t.tabActive : t.tabIdle
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                {panelTab === "Harmonies" && (
                  <div className="space-y-6">
                    {harmonyMeta?.boosted && (
                      <p
                        className={`rounded-2xl border px-4 py-3 text-xs font-medium ${
                          dark
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                            : "border-amber-300 bg-amber-50 text-amber-800"
                        }`}
                      >
                        Very light or grey tones do not shift much on the color wheel, so
                        harmony previews are nudged to keep the palette readable.
                      </p>
                    )}
                    {harmonySections.map((section) => (
                      <SwatchRow
                        key={section.title}
                        title={section.title}
                        colors={section.colors}
                        activeHex={hex}
                        onSelect={updateColor}
                        dark={dark}
                      />
                    ))}
                  </div>
                )}

                {panelTab === "Variations" && (
                  <div className="space-y-8">
                    <VariationRow
                      title="Tints (mix with white)"
                      steps={variations.tints}
                      activeHex={hex}
                      onSelect={updateColor}
                      dark={dark}
                    />
                    <VariationRow
                      title="Shades (mix with black)"
                      steps={variations.shades}
                      activeHex={hex}
                      onSelect={updateColor}
                      dark={dark}
                    />
                    <VariationRow
                      title="Tones (mix with #808080)"
                      steps={variations.tones}
                      activeHex={hex}
                      onSelect={updateColor}
                      dark={dark}
                    />
                  </div>
                )}

                {panelTab === "Code Export" && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {EXPORT_TABS.map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setExportTab(tab)}
                          className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                            exportTab === tab ? t.tabActive : t.tabIdle
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    <div className={`rounded-2xl border p-4 ${t.codeBox}`}>
                      <pre className="text-xs sm:text-sm whitespace-pre-wrap break-words overflow-x-auto">
                        {exportCode}
                      </pre>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyText(exportCode, exportTab)}
                      className={`w-full px-4 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all duration-300 active:scale-95 ${t.button}`}
                    >
                      Copy {exportTab}
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
