import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { toast } from "sonner";
import { FaArrowLeft, FaCopy, FaUndo, FaSun, FaMoon, FaCheck } from "react-icons/fa";

// Helper to convert hex to RGB
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Helper to adjust color brightness
function adjustColor(hex, percent) {
  const { r, g, b } = hexToRgb(hex);
  const factor = percent / 100;
  const adjust = (val) => Math.min(255, Math.max(0, Math.round(val + (factor > 0 ? (255 - val) * factor : val * factor))));
  const rNew = adjust(r).toString(16).padStart(2, "0");
  const gNew = adjust(g).toString(16).padStart(2, "0");
  const bNew = adjust(b).toString(16).padStart(2, "0");
  return `#${rNew}${gNew}${bNew}`;
}

const colorPresets = {
  light: ["#e0e5ec", "#f0f3f8", "#edf2f7", "#e2e8f0", "#f8fafc", "#f3f4f6"],
  dark: ["#18181b", "#27272a", "#212529", "#1f2937", "#0f172a", "#1e1e24"],
};

export default function CssNeumorphismGenerator() {
  const { dark } = useTheme();

  // Control state
  const [bgColor, setBgColor] = useState(dark ? "#27272a" : "#e0e5ec");
  const [shape, setShape] = useState("flat"); // "flat" | "concave" | "convex" | "pressed"
  const [lightSource, setLightSource] = useState("top-left"); // "top-left" | "top-right" | "bottom-left" | "bottom-right"
  const [size, setSize] = useState(200);
  const [radius, setRadius] = useState(30);
  const [distance, setDistance] = useState(15);
  const [blur, setBlur] = useState(30);
  const [intensity, setIntensity] = useState(15);
  const [copied, setCopied] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Compute shadow offsets based on light direction
  const offset = useMemo(() => {
    switch (lightSource) {
      case "top-right":
        return { lightX: -distance, lightY: distance, darkX: distance, darkY: -distance };
      case "bottom-left":
        return { lightX: distance, lightY: -distance, darkX: -distance, darkY: distance };
      case "bottom-right":
        return { lightX: -distance, lightY: -distance, darkX: distance, darkY: distance };
      case "top-left":
      default:
        return { lightX: distance, lightY: distance, darkX: -distance, darkY: -distance };
    }
  }, [lightSource, distance]);

  // Compute highlight and shadow colors
  const { lightColor, darkColor } = useMemo(() => {
    const light = adjustColor(bgColor, intensity);
    const darkCol = adjustColor(bgColor, -intensity);
    return { lightColor: light, darkColor: darkCol };
  }, [bgColor, intensity]);

  // Compute CSS background and box-shadow
  const { backgroundCss, boxShadowCss } = useMemo(() => {
    const isInset = shape === "pressed" || (shape === "flat" && isPressed);
    const insetText = isInset ? "inset " : "";

    let bg = bgColor;
    if (shape === "concave") {
      const gStart = adjustColor(bgColor, -intensity / 2);
      const gEnd = adjustColor(bgColor, intensity / 2);
      bg = `linear-gradient(145deg, ${gStart}, ${gEnd})`;
    } else if (shape === "convex") {
      const gStart = adjustColor(bgColor, intensity / 2);
      const gEnd = adjustColor(bgColor, -intensity / 2);
      bg = `linear-gradient(145deg, ${gStart}, ${gEnd})`;
    }

    const shadow1 = `${insetText}${offset.lightX}px ${offset.lightY}px ${blur}px ${darkColor}`;
    const shadow2 = `${insetText}${offset.darkX}px ${offset.darkY}px ${blur}px ${lightColor}`;
    const shadow = `${shadow1}, ${shadow2}`;

    return { backgroundCss: bg, boxShadowCss: shadow };
  }, [shape, isPressed, bgColor, offset, blur, darkColor, lightColor, intensity]);

  const generatedCss = useMemo(() => {
    return `border-radius: ${radius}px;\nbackground: ${backgroundCss};\nbox-shadow: ${boxShadowCss};`;
  }, [radius, backgroundCss, boxShadowCss]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCss);
    setCopied(true);
    toast.success("CSS copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const resetDefaults = () => {
    const defBg = dark ? "#27272a" : "#e0e5ec";
    setBgColor(defBg);
    setShape("flat");
    setLightSource("top-left");
    setSize(200);
    setRadius(30);
    setDistance(15);
    setBlur(30);
    setIntensity(15);
    setIsPressed(false);
    toast.info("Reset to default parameters");
  };

  return (
    <div className={`min-h-screen px-4 py-8 sm:px-6 lg:px-8 transition-colors duration-300 ${dark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Link
              to="/devutilities"
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              title="Back to Dev Utilities"
            >
              <FaArrowLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">CSS Neumorphism & Soft UI Studio</h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                Design soft UI shadows with flat, concave, convex, and inset shapes.
              </p>
            </div>
          </div>
          <button
            onClick={resetDefaults}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <FaUndo className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-5 space-y-5">
            <div className={`p-5 rounded-2xl border ${dark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"} space-y-4`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Shape & Style</h2>

              {/* Shape Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "flat", label: "Flat" },
                  { id: "concave", label: "Concave" },
                  { id: "convex", label: "Convex" },
                  { id: "pressed", label: "Pressed" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setShape(s.id)}
                    className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                      shape === s.id
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent shadow-sm"
                        : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Light Source Direction */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Light Direction</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "top-left", label: "Top-Left ↖" },
                    { id: "top-right", label: "Top-Right ↗" },
                    { id: "bottom-left", label: "Bottom-Left ↙" },
                    { id: "bottom-right", label: "Bottom-Right ↘" },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setLightSource(d.id)}
                      className={`py-1.5 px-2 text-[11px] font-medium rounded-lg border transition-all text-center ${
                        lightSource === d.id
                          ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 border-transparent"
                          : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/40"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Controls */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300 flex justify-between items-center">
                  <span>Base Background Color</span>
                  <span className="font-mono text-[11px] text-zinc-500 uppercase">{bgColor}</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-zinc-300 dark:border-zinc-700 bg-transparent p-0.5"
                  />
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {(dark ? colorPresets.dark : colorPresets.light).map((c) => (
                      <button
                        key={c}
                        onClick={() => setBgColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-7 h-7 rounded-lg border transition-transform hover:scale-105 ${
                          bgColor.toLowerCase() === c.toLowerCase() ? "ring-2 ring-zinc-500 border-white" : "border-zinc-300 dark:border-zinc-700"
                        }`}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-3.5 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">Size ({size}px)</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="320"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="w-full accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">Border Radius ({radius}px)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="160"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">Distance ({distance}px)</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="45"
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">Blur ({blur}px)</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="70"
                    value={blur}
                    onChange={(e) => setBlur(Number(e.target.value))}
                    className="w-full accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">Intensity ({intensity}%)</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Preview & Code Output */}
          <div className="lg:col-span-7 space-y-5">
            {/* Live Canvas Viewport */}
            <div
              style={{ backgroundColor: bgColor }}
              className="w-full h-80 sm:h-96 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300"
            >
              <span className="absolute top-3 left-4 text-[11px] font-mono opacity-40 uppercase tracking-widest select-none">
                Interactive Preview (Click to press)
              </span>

              {/* Neumorphic Object */}
              <div
                onClick={() => setIsPressed(!isPressed)}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  borderRadius: `${radius}px`,
                  background: backgroundCss,
                  boxShadow: boxShadowCss,
                  cursor: "pointer",
                }}
                className="flex flex-col items-center justify-center transition-all duration-200 select-none hover:scale-[1.01] active:scale-[0.99]"
              >
                <span className="text-xs font-semibold uppercase tracking-wider opacity-60">
                  {shape.toUpperCase()}
                </span>
                <span className="text-[10px] opacity-40 mt-1 font-mono">
                  {size} × {size}
                </span>
              </div>
            </div>

            {/* Generated CSS Snippet */}
            <div className={`p-5 rounded-2xl border ${dark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"} space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Generated CSS Output
                </span>
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
                >
                  {copied ? <FaCheck className="w-3.5 h-3.5" /> : <FaCopy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy CSS"}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-950/80 font-mono text-xs overflow-x-auto text-zinc-800 dark:text-zinc-200 border border-zinc-200/70 dark:border-zinc-800/70 leading-relaxed">
                {generatedCss}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

