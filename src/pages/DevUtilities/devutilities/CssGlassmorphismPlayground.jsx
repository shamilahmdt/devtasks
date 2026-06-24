import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { toast } from "sonner";
import { FaArrowLeft, FaCopy, FaImage, FaPalette, FaRandom } from "react-icons/fa";

const backgroundPresets = [
  {
    name: "Sunset Gradient",
    value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    name: "Ocean Breeze",
    value: "linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)",
  },
  {
    name: "Forest Green",
    value: "linear-gradient(120deg, #a8edea 0%, #fed6e3 100%)",
  },
  {
    name: "Purple Dream",
    value: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
  },
  {
    name: "Warm Flame",
    value: "linear-gradient(45deg, #ff9a56 0%, #ff6a88 100%)",
  },
  {
    name: "Cool Blues",
    value: "linear-gradient(135deg, #2af598 0%, #009efd 100%)",
  },
  {
    name: "Mesh Pattern",
    value: "radial-gradient(at 40% 20%, hsla(28,100%,74%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(340,100%,76%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(22,100%,77%,1) 0px, transparent 50%), radial-gradient(at 80% 100%, hsla(242,100%,70%,1) 0px, transparent 50%), radial-gradient(at 0% 0%, hsla(343,100%,76%,1) 0px, transparent 50%)",
  },
];

export default function CssGlassmorphismPlayground() {
  const { dark } = useTheme();

  // Glassmorphism controls
  const [blur, setBlur] = useState(10);
  const [bgOpacity, setBgOpacity] = useState(0.25);
  const [borderRadius, setBorderRadius] = useState(20);
  const [borderThickness, setBorderThickness] = useState(1);
  const [cardColor, setCardColor] = useState("#ffffff");

  // Box shadow controls
  const [shadowX, setShadowX] = useState(0);
  const [shadowY, setShadowY] = useState(8);
  const [shadowBlur, setShadowBlur] = useState(32);
  const [shadowSpread, setShadowSpread] = useState(0);
  const [shadowOpacity, setShadowOpacity] = useState(0.18);
  const [shadowColor, setShadowColor] = useState("#000000");

  // Background controls
  const [backgroundType, setBackgroundType] = useState("gradient");
  const [solidBgColor, setSolidBgColor] = useState("#667eea");
  const [gradientBg, setGradientBg] = useState(backgroundPresets[0].value);
  const [imageUrl, setImageUrl] = useState("");

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      heading: "text-zinc-900",
      subtext: "text-zinc-500",
      card: "bg-white border-zinc-200/85 shadow-sm",
      input: "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-400 focus:outline-none",
      button: "bg-zinc-900 text-white hover:bg-zinc-800 transition-all duration-200 shadow-sm",
      secondaryBtn: "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50 transition-all duration-200",
      backLink: "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350",
      badge: "bg-zinc-100 text-zinc-800 border-zinc-200",
      codeBox: "bg-zinc-900 text-zinc-100 border-zinc-800",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      heading: "text-zinc-100",
      subtext: "text-zinc-500",
      card: "bg-zinc-900/50 border-zinc-800/85 backdrop-blur-md shadow-md",
      input: "bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-zinc-500 focus:outline-none",
      button: "bg-white text-zinc-900 hover:bg-zinc-100 transition-all duration-200 shadow-sm",
      secondaryBtn: "bg-zinc-800/50 text-zinc-300 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-200",
      backLink: "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600",
      badge: "bg-zinc-800 text-zinc-300 border-zinc-700",
      codeBox: "bg-black/40 text-emerald-400 border-zinc-800/80 font-mono",
    },
  };

  const t = dark ? theme.dark : theme.light;

  // Generate background style
  const getBackgroundStyle = () => {
    switch (backgroundType) {
      case "solid":
        return { background: solidBgColor };
      case "gradient":
        return { background: gradientBg };
      case "image":
        return imageUrl
          ? { backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
          : { background: gradientBg };
      default:
        return { background: gradientBg };
    }
  };

  // Generate glassmorphism card style
  const getCardStyle = () => {
    const rgbaBackground = hexToRgba(cardColor, bgOpacity);
    const rgbaShadow = hexToRgba(shadowColor, shadowOpacity);

    return {
      background: rgbaBackground,
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`,
      borderRadius: `${borderRadius}px`,
      border: `${borderThickness}px solid rgba(255, 255, 255, 0.18)`,
      boxShadow: `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${rgbaShadow}`,
    };
  };

  // Generate CSS code
  const generateCSS = () => {
    const rgbaBackground = hexToRgba(cardColor, bgOpacity);
    const rgbaShadow = hexToRgba(shadowColor, shadowOpacity);

    return `/* Glassmorphism Effect */
background: ${rgbaBackground};
backdrop-filter: blur(${blur}px);
-webkit-backdrop-filter: blur(${blur}px);
border-radius: ${borderRadius}px;
border: ${borderThickness}px solid rgba(255, 255, 255, 0.18);
box-shadow: ${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${rgbaShadow};`;
  };

  // Hex to RGBA converter
  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Copy CSS to clipboard
  const copyCSS = () => {
    navigator.clipboard.writeText(generateCSS());
    toast.success("CSS copied to clipboard!");
  };

  // Randomize settings
  const randomize = () => {
    setBlur(Math.floor(Math.random() * 40));
    setBgOpacity(Math.random());
    setBorderRadius(Math.floor(Math.random() * 50));
    setBorderThickness(Math.floor(Math.random() * 10) + 1);
    setShadowX(Math.floor(Math.random() * 40) - 20);
    setShadowY(Math.floor(Math.random() * 40));
    setShadowBlur(Math.floor(Math.random() * 100));
    setShadowSpread(Math.floor(Math.random() * 40) - 20);
    setShadowOpacity(Math.random());
    setGradientBg(backgroundPresets[Math.floor(Math.random() * backgroundPresets.length)].value);
    toast.success("Settings randomized!");
  };

  return (
    <div className={`min-h-screen ${t.wrapper} px-4 sm:px-6 py-6 sm:py-10 transition-colors duration-300`}>
      <title>CSS Glassmorphism & Box-Shadow Playground — DevTasks</title>
      <meta
        name="description"
        content="Design modern glassmorphism effects with backdrop blur, box shadows, and live CSS export. Fully offline playground."
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <Link
            to="/devutilities"
            className={`p-2 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${t.backLink}`}
            title="Back to Utilities"
          >
            <FaArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className={`text-xl sm:text-2xl font-semibold tracking-tight ${t.heading}`}>
              CSS Glassmorphism & Box-Shadow Playground
            </h1>
            <p className={`mt-0.5 text-xs sm:text-sm ${t.subtext}`}>
              Design modern frosted-glass effects with backdrop blur, shadows, and live CSS export.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Left: Controls */}
          <div className="space-y-6">
            {/* Glassmorphism Controls */}
            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-6`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                  <FaPalette className="text-purple-500 w-4 h-4" />
                  Glassmorphism Settings
                </h2>
                <button
                  onClick={randomize}
                  className={`px-3 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 ${t.secondaryBtn}`}
                >
                  <FaRandom className="w-3 h-3" /> Random
                </button>
              </div>

              {/* Blur Slider */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex justify-between">
                  <span>Backdrop Blur</span>
                  <span className="font-mono text-zinc-400">{blur}px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={blur}
                  onChange={(e) => setBlur(Number(e.target.value))}
                  className="w-full accent-purple-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Background Opacity */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex justify-between">
                  <span>Background Opacity</span>
                  <span className="font-mono text-zinc-400">{bgOpacity.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={bgOpacity}
                  onChange={(e) => setBgOpacity(Number(e.target.value))}
                  className="w-full accent-purple-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Card Color Picker */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Card Base Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={cardColor}
                    onChange={(e) => setCardColor(e.target.value)}
                    className="h-10 w-16 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent p-1 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={cardColor}
                    onChange={(e) => setCardColor(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-xl border text-sm font-mono ${t.input}`}
                  />
                </div>
              </div>

              {/* Border Radius */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex justify-between">
                  <span>Border Radius</span>
                  <span className="font-mono text-zinc-400">{borderRadius}px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(Number(e.target.value))}
                  className="w-full accent-purple-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Border Thickness */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex justify-between">
                  <span>Border Thickness</span>
                  <span className="font-mono text-zinc-400">{borderThickness}px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={borderThickness}
                  onChange={(e) => setBorderThickness(Number(e.target.value))}
                  className="w-full accent-purple-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Box Shadow Controls */}
            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-6`}>
              <h2 className="text-lg font-semibold tracking-tight">Box Shadow Settings</h2>

              {/* Shadow X Offset */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex justify-between">
                  <span>Offset X</span>
                  <span className="font-mono text-zinc-400">{shadowX}px</span>
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={shadowX}
                  onChange={(e) => setShadowX(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Shadow Y Offset */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex justify-between">
                  <span>Offset Y</span>
                  <span className="font-mono text-zinc-400">{shadowY}px</span>
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={shadowY}
                  onChange={(e) => setShadowY(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Shadow Blur */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex justify-between">
                  <span>Blur Radius</span>
                  <span className="font-mono text-zinc-400">{shadowBlur}px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={shadowBlur}
                  onChange={(e) => setShadowBlur(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Shadow Spread */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex justify-between">
                  <span>Spread Radius</span>
                  <span className="font-mono text-zinc-400">{shadowSpread}px</span>
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={shadowSpread}
                  onChange={(e) => setShadowSpread(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Shadow Opacity */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex justify-between">
                  <span>Shadow Opacity</span>
                  <span className="font-mono text-zinc-400">{shadowOpacity.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={shadowOpacity}
                  onChange={(e) => setShadowOpacity(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Shadow Color */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Shadow Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={shadowColor}
                    onChange={(e) => setShadowColor(e.target.value)}
                    className="h-10 w-16 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent p-1 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={shadowColor}
                    onChange={(e) => setShadowColor(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-xl border text-sm font-mono ${t.input}`}
                  />
                </div>
              </div>
            </div>

            {/* Background Controls */}
            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-4`}>
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <FaImage className="text-blue-500 w-4 h-4" />
                Preview Background
              </h2>

              {/* Background Type Tabs */}
              <div className="flex gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900/50">
                <button
                  onClick={() => setBackgroundType("solid")}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    backgroundType === "solid"
                      ? "bg-white dark:bg-zinc-800 shadow-sm"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  Solid
                </button>
                <button
                  onClick={() => setBackgroundType("gradient")}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    backgroundType === "gradient"
                      ? "bg-white dark:bg-zinc-800 shadow-sm"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  Gradient
                </button>
                <button
                  onClick={() => setBackgroundType("image")}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    backgroundType === "image"
                      ? "bg-white dark:bg-zinc-800 shadow-sm"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  Image
                </button>
              </div>

              {/* Solid Color */}
              {backgroundType === "solid" && (
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={solidBgColor}
                    onChange={(e) => setSolidBgColor(e.target.value)}
                    className="h-10 w-16 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent p-1 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={solidBgColor}
                    onChange={(e) => setSolidBgColor(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-xl border text-sm font-mono ${t.input}`}
                  />
                </div>
              )}

              {/* Gradient Presets */}
              {backgroundType === "gradient" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {backgroundPresets.map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => setGradientBg(preset.value)}
                      className={`group p-2 rounded-2xl border transition-all duration-300 ${
                        gradientBg === preset.value
                          ? "border-purple-500 ring-2 ring-purple-500/20"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-purple-300 dark:hover:border-purple-700"
                      }`}
                    >
                      <div
                        className="h-16 rounded-xl shadow-sm"
                        style={{ background: preset.value }}
                      />
                      <span className="text-[10px] font-bold mt-1.5 block text-center truncate">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Image URL */}
              {backgroundType === "image" && (
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL..."
                  className={`w-full px-3 py-2 rounded-xl border text-sm ${t.input}`}
                />
              )}
            </div>
          </div>

          {/* Right: Preview & Code */}
          <div className="space-y-6">
            {/* Live Preview */}
            <div className={`rounded-3xl border ${t.card} p-6 space-y-4`}>
              <h2 className="text-lg font-semibold tracking-tight">Live Preview</h2>

              <div
                className="relative h-80 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner overflow-hidden flex items-center justify-center p-8"
                style={getBackgroundStyle()}
              >
                <div
                  className="w-full max-w-sm p-8 text-center"
                  style={getCardStyle()}
                >
                  <h3 className="text-2xl font-black mb-3 text-white drop-shadow-lg">
                    Glassmorphism
                  </h3>
                  <p className="text-sm text-white/90 mb-4 drop-shadow">
                    This card demonstrates the frosted-glass effect with backdrop blur and custom shadows.
                  </p>
                  <div className="inline-block px-4 py-2 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold backdrop-blur-sm">
                    Beautiful UI
                  </div>
                </div>
              </div>
            </div>

            {/* Generated CSS */}
            <div className={`rounded-3xl border ${t.card} p-6 space-y-4`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">Generated CSS</h2>
                <button
                  onClick={copyCSS}
                  className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 ${t.button}`}
                >
                  <FaCopy className="w-3 h-3" /> Copy CSS
                </button>
              </div>

              <div className="relative">
                <pre className={`p-4 rounded-2xl border text-xs overflow-x-auto whitespace-pre ${t.codeBox}`}>
                  {generateCSS()}
                </pre>
              </div>

              <div className="text-xs text-zinc-500 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                All properties are vendor-prefixed for maximum browser compatibility.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
