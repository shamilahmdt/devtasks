import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";
import {
  FaPlay,
  FaPause,
  FaRedo,
  FaCopy,
  FaStar,
  FaHeart,
  FaSmile,
  FaChevronLeft,
  FaUndo,
} from "react-icons/fa";
import CubicBezierEditor from "./CubicBezierEditor";

export default function CssAnimationGenerator() {
  const { dark } = useTheme();

  // State values
  const [preset, setPreset] = useState("spin");
  const [duration, setDuration] = useState(2);
  const [delay, setDelay] = useState(0);
  const [timing, setTiming] = useState("ease");
  const [iteration, setIteration] = useState("infinite");
  const [direction, setDirection] = useState("normal");
  const [fillMode, setFillMode] = useState("both");
  const [playState, setPlayState] = useState("running");
  
  const [bezier, setBezier] = useState([0.25, 0.1, 0.25, 1.0]);

  const [shape, setShape] = useState("rounded");
  const [colorPreset, setColorPreset] = useState("blue");
  const [content, setContent] = useState("spark");

  const [codeMode, setCodeMode] = useState("css"); // 'css' or 'tailwind'
  const [animationKey, setAnimationKey] = useState(0);

  const actualTiming = timing === "custom" ? `cubic-bezier(${bezier.join(", ")})` : timing;

  // Keyframes configuration
  const keyframesData = {
    spin: `  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }`,
    pulse: `  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.18); }`,
    bounce: `  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-32px); }`,
    fade: `  0%, 100% { opacity: 1; }
  50% { opacity: 0.25; }`,
    slide: `  0% { transform: translateX(-40px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }`,
    shake: `  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
  20%, 40%, 60%, 80% { transform: translateX(6px); }`,
    flip: `  0% { transform: perspective(400px) rotateY(0deg); }
  100% { transform: perspective(400px) rotateY(360deg); }`,
    swing: `  20% { transform: rotate(15deg); }
  40% { transform: rotate(-10deg); }
  60% { transform: rotate(5deg); }
  80% { transform: rotate(-5deg); }
  100% { transform: rotate(0deg); }`,
  };

  const getAnimationOnlyCss = () => {
    return `.animate-${preset} {
  animation: ${preset} ${duration}s ${actualTiming} ${delay}s ${iteration};
  animation-direction: ${direction};
  animation-fill-mode: ${fillMode};
}

@keyframes ${preset} {
${keyframesData[preset]}
}`;
  };

  const getFullElementCss = () => {
    const shapeStyles = {
      square: `  width: 5rem; /* 80px */
  height: 5rem; /* 80px */
  border-radius: 0.375rem; /* 6px */`,
      rounded: `  width: 5rem; /* 80px */
  height: 5rem; /* 80px */
  border-radius: 1rem; /* 16px */`,
      circle: `  width: 5rem; /* 80px */
  height: 5rem; /* 80px */
  border-radius: 9999px;`,
      pill: `  width: 7rem; /* 112px */
  height: 3rem; /* 48px */
  border-radius: 9999px;`,
    };

    const gradientCss = {
      blue: "linear-gradient(45deg, #3b82f6, #6366f1, #8b5cf6)",
      sunset: "linear-gradient(45deg, #f97316, #f43f5e, #dc2626)",
      emerald: "linear-gradient(45deg, #34d399, #14b8a6, #0891b2)",
      purple: "linear-gradient(45deg, #ec4899, #d946ef, #6d28d9)",
      amber: "linear-gradient(45deg, #facc15, #f59e0b, #ea580c)",
    };

    const iconComment = {
      spark: "/* Inside Content: Star Icon */",
      heart: "/* Inside Content: Heart Icon */",
      smile: "/* Inside Content: Smile Icon */",
      text: "/* Inside Content: 'CSS' Text */",
      none: "/* Inside Content: None */",
    };

    return `/* Shape, Color & Shadow Styles */
.animated-element {
${shapeStyles[shape]}
  background: ${gradientCss[colorPreset]};
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  ${iconComment[content]}
}`;
  };

  const getAnimationOnlyTailwind = () => {
    return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        '${preset}': '${preset} ${duration}s ${actualTiming} ${delay}s ${iteration} ${direction} ${fillMode}',
      },
      keyframes: {
        '${preset}': {
${keyframesData[preset]
  .split("\n")
  .map((line) => "          " + line.trim())
  .join("\n")}
        }
      }
    }
  }
}`;
  };

  const getFullElementTailwind = () => {
    const shapeTw = {
      square: "w-20 h-20 rounded-md",
      rounded: "w-20 h-20 rounded-2xl",
      circle: "w-20 h-20 rounded-full",
      pill: "w-28 h-12 rounded-full",
    };

    const colorTw = {
      blue: "bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600",
      sunset: "bg-gradient-to-tr from-orange-500 via-rose-500 to-red-600",
      emerald: "bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-600",
      purple: "bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-violet-700",
      amber: "bg-gradient-to-tr from-yellow-400 via-amber-500 to-orange-600",
    };

    const iconHtml = {
      spark: '  <FaStar className="w-6 h-6 animate-pulse" />',
      heart: '  <FaHeart className="w-6 h-6 animate-pulse" />',
      smile: '  <FaSmile className="w-6 h-6 animate-pulse" />',
      text: '  <span className="font-black text-sm tracking-widest">CSS</span>',
      none: "",
    };

    const htmlContent = iconHtml[content] 
      ? `\n${iconHtml[content]}\n`
      : "";

    return `<!-- HTML Element with Tailwind Classes -->
<div className="animate-${preset} ${shapeTw[shape]} ${colorTw[colorPreset]} shadow-xl flex items-center justify-center text-white">${htmlContent}</div>`;
  };

  const resetAll = () => {
    setPreset("spin");
    setDuration(2);
    setDelay(0);
    setTiming("ease");
    setBezier([0.25, 0.1, 0.25, 1.0]);
    setIteration("infinite");
    setDirection("normal");
    setFillMode("both");
    setShape("rounded");
    setColorPreset("blue");
    setContent("spark");
    setPlayState("running");
    setAnimationKey((prev) => prev + 1);
    toast.success("Configuration reset to defaults");
  };

  // Color mappings
  const colorClasses = {
    blue: "bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600",
    sunset: "bg-gradient-to-tr from-orange-500 via-rose-500 to-red-600",
    emerald: "bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-600",
    purple: "bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-violet-700",
    amber: "bg-gradient-to-tr from-yellow-400 via-amber-500 to-orange-600",
  };

  // Shape mappings
  const shapeClasses = {
    square: "w-20 h-20 rounded-md",
    rounded: "w-20 h-20 rounded-2xl",
    circle: "w-20 h-20 rounded-full",
    pill: "w-28 h-12 rounded-full",
  };

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      heading: "text-zinc-900",
      subtext: "text-zinc-500",
      card: "bg-white border-zinc-200/85 shadow-sm",
      input:
        "bg-zinc-50 border-zinc-250 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 focus:outline-none",
      select:
        "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-400 focus:outline-none p-2.5 rounded-xl text-sm",
      buttonPrimary: "bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-sm",
      buttonSecondary: "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-colors",
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
        "bg-zinc-950/70 border-zinc-800 text-zinc-100 focus:border-zinc-750 focus:outline-none p-2.5 rounded-xl text-sm",
      buttonPrimary: "bg-white text-zinc-950 hover:bg-zinc-200 transition-colors shadow-sm",
      buttonSecondary: "bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white transition-colors",
      label: "text-zinc-400 font-semibold tracking-wider text-xs uppercase",
      result: "bg-zinc-950/80 border-zinc-800 text-zinc-300",
      infoCard: "bg-zinc-900/40 border-zinc-800/60 text-zinc-400",
      badge: "bg-zinc-800/50 text-zinc-300",
    },
  };

  const t = dark ? theme.dark : theme.light;

  return (
    <div className={`min-h-screen ${t.wrapper} px-4 sm:px-6 py-10 transition-colors duration-300 relative overflow-x-hidden`}>
      <title>CSS Keyframe Animation Generator — DevTasks</title>
      <meta
        name="description"
        content="Create keyframe animations, tune duration, delay, timing, and copy copy-paste CSS code dynamically."
      />

      {/* Stylesheet injector for preview */}
      <style>{`
        @keyframes ${preset} {
          ${keyframesData[preset]}
        }
        
        .animation-grid-bg-light {
          background-image: radial-gradient(circle, #e4e4e7 1px, transparent 1px);
          background-size: 16px 16px;
        }
        
        .animation-grid-bg-dark {
          background-image: radial-gradient(circle, #27272a 1px, transparent 1px);
          background-size: 16px 16px;
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
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
            <FaChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${t.heading}`}>
              CSS Animation Generator
            </h1>
            <p className={`mt-1 text-sm ${t.subtext}`}>
              Generate dynamic CSS keyframe animations and preview the results with custom settings in real time.
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Column (7/12) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Presets Card */}
            <div className={`rounded-2xl border p-6 ${t.card}`}>
              <h2 className="text-sm font-bold tracking-wide uppercase text-blue-500 mb-4">
                1. Select Animation Preset
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.keys(keyframesData).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPreset(p);
                      setAnimationKey((k) => k + 1);
                      setPlayState("running");
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-semibold text-xs capitalize ${
                      preset === p
                        ? "border-blue-500 bg-blue-500/10 text-blue-500 dark:border-blue-400 dark:bg-blue-400/10 dark:text-blue-400"
                        : dark
                        ? "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                        : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Animation Configuration Card */}
            <div className={`rounded-2xl border p-6 ${t.card} flex flex-col gap-6`}>
              <h2 className="text-sm font-bold tracking-wide uppercase text-blue-500">
                2. Configure Parameters
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Duration */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className={t.label}>Duration</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">
                      {duration}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="8"
                    step="0.1"
                    value={duration}
                    onChange={(e) => setDuration(parseFloat(e.target.value))}
                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-800 accent-blue-600"
                  />
                </div>

                {/* Delay */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className={t.label}>Delay</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">
                      {delay}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    step="0.1"
                    value={delay}
                    onChange={(e) => setDelay(parseFloat(e.target.value))}
                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-800 accent-blue-600"
                  />
                </div>

                {/* Timing Function */}
                <div className="flex flex-col gap-2">
                  <span className={t.label}>Timing Function</span>
                  <select
                    value={timing}
                    onChange={(e) => setTiming(e.target.value)}
                    className={t.select}
                  >
                    <option value="linear">Linear</option>
                    <option value="ease">Ease</option>
                    <option value="ease-in">Ease In</option>
                    <option value="ease-out">Ease Out</option>
                    <option value="ease-in-out">Ease In Out</option>
                    <option value="custom">Custom (Cubic-Bezier)</option>
                  </select>
                </div>

                {timing === "custom" && (
                  <div className="sm:col-span-2 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 shadow-sm flex flex-col gap-4">
                    <span className={t.label}>Custom Cubic-Bezier Editor</span>
                    <CubicBezierEditor bezier={bezier} onChange={setBezier} dark={dark} />
                  </div>
                )}

                {/* Iteration Count */}
                <div className="flex flex-col gap-2">
                  <span className={t.label}>Iteration Count</span>
                  <select
                    value={iteration}
                    onChange={(e) => setIteration(e.target.value)}
                    className={t.select}
                  >
                    <option value="1">1 Time</option>
                    <option value="2">2 Times</option>
                    <option value="3">3 Times</option>
                    <option value="5">5 Times</option>
                    <option value="infinite">Infinite Loop</option>
                  </select>
                </div>

                {/* Direction */}
                <div className="flex flex-col gap-2">
                  <span className={t.label}>Direction</span>
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    className={t.select}
                  >
                    <option value="normal">Normal</option>
                    <option value="reverse">Reverse</option>
                    <option value="alternate">Alternate</option>
                    <option value="alternate-reverse">Alternate Reverse</option>
                  </select>
                </div>

                {/* Fill Mode */}
                <div className="flex flex-col gap-2">
                  <span className={t.label}>Fill Mode</span>
                  <select
                    value={fillMode}
                    onChange={(e) => setFillMode(e.target.value)}
                    className={t.select}
                  >
                    <option value="none">None</option>
                    <option value="forwards">Forwards</option>
                    <option value="backwards">Backwards</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Appearance Card */}
            <div className={`rounded-2xl border p-6 ${t.card} flex flex-col gap-5`}>
              <h2 className="text-sm font-bold tracking-wide uppercase text-blue-500">
                3. Customize Appearance
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Shape selection */}
                <div className="flex flex-col gap-2.5">
                  <span className={t.label}>Shape</span>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(shapeClasses).map((s) => (
                      <button
                        key={s}
                        onClick={() => setShape(s)}
                        className={`py-1.5 px-2 rounded-lg border text-xs font-semibold capitalize transition-all cursor-pointer ${
                          shape === s
                            ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-950"
                            : dark
                            ? "border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                            : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Scheme */}
                <div className="flex flex-col gap-2.5">
                  <span className={t.label}>Color Gradient</span>
                  <div className="flex flex-wrap gap-2 pt-1.5">
                    {Object.keys(colorClasses).map((col) => (
                      <button
                        key={col}
                        onClick={() => setColorPreset(col)}
                        className={`w-6 h-6 rounded-full cursor-pointer transition-transform duration-200 ${
                          colorClasses[col]
                        } ${
                          colorPreset === col
                            ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-zinc-950 scale-110"
                            : "opacity-85 hover:opacity-100 hover:scale-105"
                        }`}
                        title={col}
                      />
                    ))}
                  </div>
                </div>

                {/* Inside Content */}
                <div className="flex flex-col gap-2.5">
                  <span className={t.label}>Icon Overlay</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "spark", label: "Star" },
                      { id: "heart", label: "Heart" },
                      { id: "smile", label: "Smile" },
                      { id: "text", label: "CSS" },
                      { id: "none", label: "None" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setContent(item.id)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          content === item.id
                            ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-950"
                            : dark
                            ? "border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                            : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview & Code Column (5/12) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Live Preview Card */}
            <div className={`rounded-2xl border p-6 ${t.card} flex flex-col gap-4`}>
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold tracking-wide uppercase text-blue-500">
                  Live Preview
                </h2>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${
                    playState === "running"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-amber-500/10 text-amber-500"
                  }`}
                >
                  {playState}
                </span>
              </div>

              {/* Dotted Playground area */}
              <div
                className={`w-full h-64 rounded-xl border flex items-center justify-center relative overflow-hidden ${
                  dark ? "border-zinc-800 animation-grid-bg-dark bg-zinc-950/60" : "border-zinc-200 animation-grid-bg-light bg-zinc-50/60"
                }`}
              >
                <div className="absolute top-3 left-3 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Preset: {preset}
                </div>

                <div
                  key={animationKey}
                  className={`${colorClasses[colorPreset]} ${shapeClasses[shape]} shadow-xl flex items-center justify-center text-white select-none transition-all duration-300`}
                  style={{
                    animationName: preset,
                    animationDuration: `${duration}s`,
                    animationTimingFunction: actualTiming,
                    animationDelay: `${delay}s`,
                    animationIterationCount: iteration,
                    animationDirection: direction,
                    animationFillMode: fillMode,
                    animationPlayState: playState,
                  }}
                >
                  {content === "spark" && <FaStar className="w-6 h-6 animate-pulse" />}
                  {content === "heart" && <FaHeart className="w-6 h-6 animate-pulse" />}
                  {content === "smile" && <FaSmile className="w-6 h-6 animate-pulse" />}
                  {content === "text" && <span className="font-black text-sm tracking-widest">CSS</span>}
                </div>
              </div>

              {/* Preview Controller Buttons */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setPlayState("running")}
                  disabled={playState === "running"}
                  className={`py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer transition-all active:scale-95 ${
                    playState === "running"
                      ? "bg-zinc-800/20 text-zinc-500 border border-transparent dark:bg-zinc-800/10"
                      : dark
                      ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                      : "bg-emerald-600 text-white hover:bg-emerald-500"
                  }`}
                  title="Resume Animation"
                >
                  <FaPlay className="w-2.5 h-2.5" /> Run
                </button>

                <button
                  onClick={() => setPlayState("paused")}
                  disabled={playState === "paused"}
                  className={`py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer transition-all active:scale-95 ${
                    playState === "paused"
                      ? "bg-zinc-800/20 text-zinc-500 border border-transparent dark:bg-zinc-800/10"
                      : dark
                      ? "bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700"
                      : "bg-zinc-100 border border-zinc-200 text-zinc-700 hover:bg-zinc-200"
                  }`}
                  title="Pause Animation"
                >
                  <FaPause className="w-2.5 h-2.5" /> Pause
                </button>

                <button
                  onClick={() => {
                    setAnimationKey((prev) => prev + 1);
                    setPlayState("running");
                  }}
                  className={`py-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer transition-all active:scale-95 ${
                    dark
                      ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white"
                      : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                  title="Restart from Beginning"
                >
                  <FaRedo className="w-2.5 h-2.5" /> Replay
                </button>

                <button
                  onClick={resetAll}
                  className={`py-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer transition-all active:scale-95 ${
                    dark
                      ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white"
                      : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                  title="Reset Configuration"
                >
                  <FaUndo className="w-2.5 h-2.5" /> Reset
                </button>
              </div>
            </div>

            {/* Generated Code Card */}
            <div className={`rounded-2xl border p-6 ${t.card} flex flex-col gap-5`}>
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold tracking-wide uppercase text-blue-500">
                  Export Code
                </h2>
                
                {/* Code Type Switcher */}
                <div className="flex rounded-lg p-0.5 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => setCodeMode("css")}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md tracking-wider transition-all cursor-pointer ${
                      codeMode === "css"
                        ? "bg-zinc-900 text-white dark:bg-zinc-900 dark:text-zinc-100"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                    }`}
                  >
                    CSS
                  </button>
                  <button
                    onClick={() => setCodeMode("tailwind")}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md tracking-wider transition-all cursor-pointer ${
                      codeMode === "tailwind"
                        ? "bg-zinc-900 text-white dark:bg-zinc-900 dark:text-zinc-100"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                    }`}
                  >
                    TAILWIND
                  </button>
                </div>
              </div>

              {/* Box 1: Animation Code Only */}
              <div className="flex flex-col gap-2">
                <span className={t.label}>1. Animation Code Only</span>
                <div className="relative">
                  <pre
                    className={`p-4 rounded-xl overflow-x-auto text-xs font-mono h-36 border max-w-full ${
                      dark
                        ? "bg-zinc-950/90 border-zinc-800/80 text-zinc-300"
                        : "bg-zinc-50 border-zinc-200 text-zinc-800"
                    }`}
                  >
                    <code>{codeMode === "css" ? getAnimationOnlyCss() : getAnimationOnlyTailwind()}</code>
                  </pre>

                  <button
                    onClick={async () => {
                      const code = codeMode === "css" ? getAnimationOnlyCss() : getAnimationOnlyTailwind();
                      try {
                        await navigator.clipboard.writeText(code);
                        toast.success("Animation code copied!");
                      } catch (err) {
                        toast.error("Failed to copy code");
                      }
                    }}
                    className={`absolute right-3.5 top-3.5 p-2 rounded-lg border shadow-sm transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center ${
                      dark
                        ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                        : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-950 hover:border-zinc-300"
                    }`}
                    title="Copy Animation Code"
                  >
                    <FaCopy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Box 2: Full Code (Animation + Element Layout) */}
              <div className="flex flex-col gap-2">
                <span className={t.label}>2. Full Element & Animation Code</span>
                <div className="relative">
                  <pre
                    className={`p-4 rounded-xl overflow-x-auto text-xs font-mono h-48 border max-w-full ${
                      dark
                        ? "bg-zinc-950/90 border-zinc-800/80 text-zinc-300"
                        : "bg-zinc-50 border-zinc-200 text-zinc-800"
                    }`}
                  >
                    <code>
                      {codeMode === "css" 
                        ? `${getAnimationOnlyCss()}\n\n${getFullElementCss()}` 
                        : `${getFullElementTailwind()}\n\n${getAnimationOnlyTailwind()}`}
                    </code>
                  </pre>

                  <button
                    onClick={async () => {
                      const code = codeMode === "css" 
                        ? `${getAnimationOnlyCss()}\n\n${getFullElementCss()}` 
                        : `${getFullElementTailwind()}\n\n${getAnimationOnlyTailwind()}`;
                      try {
                        await navigator.clipboard.writeText(code);
                        toast.success("Full code copied!");
                      } catch (err) {
                        toast.error("Failed to copy code");
                      }
                    }}
                    className={`absolute right-3.5 top-3.5 p-2 rounded-lg border shadow-sm transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center ${
                      dark
                        ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                        : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-950 hover:border-zinc-300"
                    }`}
                    title="Copy Full Code"
                  >
                    <FaCopy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}