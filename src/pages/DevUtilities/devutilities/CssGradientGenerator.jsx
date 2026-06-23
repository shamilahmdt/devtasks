import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { toast } from "sonner";
import { FaPlus, FaTrash, FaCopy, FaRandom, FaArrowLeft, FaPalette } from "react-icons/fa";

const presets = [
  {
    name: "Sunset Ember",
    type: "linear",
    angle: 90,
    stops: [
      { color: "#ff512f", pos: 0 },
      { color: "#dd2476", pos: 100 },
    ],
  },
  {
    name: "Oceanic Dream",
    type: "linear",
    angle: 120,
    stops: [
      { color: "#2193b0", pos: 0 },
      { color: "#6dd5ed", pos: 100 },
    ],
  },
  {
    name: "Purple Bliss",
    type: "radial",
    angle: 0,
    stops: [
      { color: "#360033", pos: 0 },
      { color: "#0b8793", pos: 100 },
    ],
  },
  {
    name: "Neon Glow",
    type: "linear",
    angle: 45,
    stops: [
      { color: "#00f2fe", pos: 0 },
      { color: "#4facfe", pos: 50 },
      { color: "#000000", pos: 100 },
    ],
  },
  {
    name: "Cherry Blossom",
    type: "linear",
    angle: 135,
    stops: [
      { color: "#fbc2eb", pos: 0 },
      { color: "#a6c1ee", pos: 100 },
    ],
  },
  {
    name: "Northern Lights",
    type: "linear",
    angle: 90,
    stops: [
      { color: "#0575e6", pos: 0 },
      { color: "#00f260", pos: 100 },
    ],
  },
];

export default function CssGradientGenerator() {
  const { dark } = useTheme();
  const [type, setType] = useState("linear");
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState([
    { color: "#4facfe", pos: 0 },
    { color: "#00f2fe", pos: 100 },
  ]);

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

  const gradient = () => {
    const sorted = [...stops].sort((a, b) => a.pos - b.pos);
    const stopStr = sorted.map((s) => `${s.color} ${s.pos}%`).join(", ");

    if (type === "radial") {
      return `radial-gradient(circle, ${stopStr})`;
    }
    return `linear-gradient(${angle}deg, ${stopStr})`;
  };

  const addStop = () => {
    if (stops.length >= 8) {
      toast.error("Maximum 8 color stops allowed");
      return;
    }
    const newPos = Math.min(
      100,
      Math.max(0, Math.round(stops.reduce((acc, curr) => acc + curr.pos, 0) / stops.length) + 10)
    );
    setStops([...stops, { color: "#ffffff", pos: newPos }]);
    toast.success("Added new color stop");
  };

  const updateStop = (i, key, value) => {
    const copy = [...stops];
    if (key === "pos") {
      copy[i][key] = Math.min(100, Math.max(0, Number(value)));
    } else {
      copy[i][key] = value;
    }
    setStops(copy);
  };

  const removeStop = (i) => {
    if (stops.length <= 2) {
      toast.error("At least 2 color stops are required");
      return;
    }
    setStops(stops.filter((_, idx) => idx !== i));
    toast.success("Removed color stop");
  };

  const randomize = () => {
    const randColor = () =>
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0");

    const numStops = Math.floor(Math.random() * 3) + 2; // 2 to 4 stops
    const newStops = [];
    for (let j = 0; j < numStops; j++) {
      newStops.push({
        color: randColor(),
        pos: Math.round((j / (numStops - 1)) * 100),
      });
    }

    setStops(newStops);
    setAngle(Math.floor(Math.random() * 8) * 45); // 0, 45, 90, etc.
    toast.success("Generated random gradient configuration");
  };

  const copyCSS = () => {
    const cssString = `background: ${gradient()};`;
    navigator.clipboard.writeText(cssString);
    toast.success("Copied CSS to clipboard!");
  };

  return (
    <div className={`min-h-screen ${t.wrapper} px-4 sm:px-6 py-6 sm:py-10 transition-colors duration-300`}>
      <title>CSS Gradient Generator — DevTasks</title>
      <meta
        name="description"
        content="Create beautiful CSS linear and radial gradients with customizable color stops, randomizer, and copy-ready code."
      />

      <div className="max-w-6xl mx-auto">
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
              CSS Gradient Generator
            </h1>
            <p className={`mt-0.5 text-xs sm:text-sm ${t.subtext}`}>
              Design linear and radial gradients and export copy-paste CSS code.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Left: Editor Controls */}
          <div className="space-y-6">
            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-6`}>
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <FaPalette className="text-indigo-500 w-4 h-4" />
                Gradient Parameters
              </h2>

              {/* Type and Direction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Gradient Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className={`px-3 py-2 rounded-xl border text-sm font-semibold cursor-pointer ${t.input}`}
                  >
                    <option value="linear">Linear</option>
                    <option value="radial">Radial</option>
                  </select>
                </div>

                {type === "linear" && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex justify-between">
                      <span>Angle</span>
                      <span className="font-mono text-zinc-400">{angle}°</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={angle}
                        onChange={(e) => setAngle(Number(e.target.value))}
                        className="flex-1 accent-indigo-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                      />
                      <input
                        type="number"
                        min="0"
                        max="360"
                        value={angle}
                        onChange={(e) => setAngle(Number(e.target.value))}
                        className={`w-16 px-2 py-1 rounded-lg border text-xs font-semibold text-center ${t.input}`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions toolbar */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                <button
                  onClick={addStop}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 ${t.secondaryBtn}`}
                >
                  <FaPlus className="w-3.5 h-3.5" /> Add Stop
                </button>
                <button
                  onClick={randomize}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 ${t.secondaryBtn}`}
                >
                  <FaRandom className="w-3.5 h-3.5" /> Randomize
                </button>
              </div>
            </div>

            {/* Color Stops List */}
            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-4`}>
              <h2 className="text-lg font-semibold tracking-tight">Color Stops</h2>
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {stops.map((s, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/30 dark:bg-zinc-900/30"
                  >
                    <div className="flex items-center gap-3">
                      {/* Color Input */}
                      <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
                        <input
                          type="color"
                          value={s.color}
                          onChange={(e) => updateStop(i, "color", e.target.value)}
                          className="absolute inset-0 w-full h-full p-0 border-none cursor-pointer scale-150"
                        />
                      </div>

                      {/* Color Text Hex */}
                      <input
                        type="text"
                        value={s.color}
                        onChange={(e) => updateStop(i, "color", e.target.value)}
                        className={`w-24 px-2 py-1.5 rounded-lg border text-xs font-mono text-center uppercase ${t.input}`}
                      />

                      <div className="flex-1" />

                      {/* Delete Stop on mobile */}
                      <button
                        onClick={() => removeStop(i)}
                        className="sm:hidden p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Remove Color Stop"
                      >
                        <FaTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Position Range & Input */}
                    <div className="flex-1 flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={s.pos}
                        onChange={(e) => updateStop(i, "pos", Number(e.target.value))}
                        className="flex-1 accent-indigo-500 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                      />
                      <div className="flex items-center gap-0.5 shrink-0">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={s.pos}
                          onChange={(e) => updateStop(i, "pos", Number(e.target.value))}
                          className={`w-12 px-1.5 py-1 rounded-lg border text-xs font-semibold text-center ${t.input}`}
                        />
                        <span className="text-xs text-zinc-500 font-semibold">%</span>
                      </div>
                    </div>

                    {/* Delete Stop on desktop */}
                    <button
                      onClick={() => removeStop(i)}
                      className="hidden sm:block p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                      title="Remove Color Stop"
                    >
                      <FaTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Live Preview & Presets */}
          <div className="space-y-6">
            {/* Live Preview Card */}
            <div className={`rounded-3xl border ${t.card} p-6 space-y-4`}>
              <h2 className="text-lg font-semibold tracking-tight">Live Output Preview</h2>

              <div
                className="h-56 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner relative overflow-hidden group"
                style={{ background: gradient() }}
              >
                {/* Visual grid behind transparent colors */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
              </div>

              {/* Code output display */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  CSS Code block
                </label>
                <div className="relative">
                  <pre
                    className={`p-4 rounded-2xl border text-xs overflow-x-auto whitespace-pre-wrap select-all ${t.codeBox}`}
                  >
                    {`background: ${gradient()};`}
                  </pre>
                  <button
                    onClick={copyCSS}
                    className="absolute right-3 top-3 p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-white transition-colors active:scale-95 flex items-center gap-1.5 text-xs font-semibold shadow-md"
                    title="Copy to clipboard"
                  >
                    <FaCopy className="w-3 h-3" /> Copy CSS
                  </button>
                </div>
              </div>
            </div>

            {/* Presets List */}
            <div className={`rounded-3xl border ${t.card} p-6 space-y-4`}>
              <h2 className={`text-lg font-semibold tracking-tight ${t.heading}`}>Curated Gradient Presets</h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {presets.map((p, i) => {
                  const presetGradient =
                    p.type === "linear"
                      ? `linear-gradient(${p.angle}deg, ${p.stops
                          .map((s) => `${s.color} ${s.pos}%`)
                          .join(", ")})`
                      : `radial-gradient(circle, ${p.stops
                          .map((s) => `${s.color} ${s.pos}%`)
                          .join(", ")})`;

                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setType(p.type);
                        setAngle(p.angle);
                        setStops(p.stops);
                        toast.success(`Applied ${p.name} preset`);
                      }}
                      className="group p-2 rounded-2xl border border-zinc-200 dark:border-zinc-850 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-300 text-left flex flex-col gap-2 focus:outline-none"
                    >
                      <div
                        className="h-16 rounded-xl border border-zinc-250 dark:border-zinc-800 shadow-sm"
                        style={{ background: presetGradient }}
                      />
                      <span className="text-xs font-bold truncate px-1 text-black transition-colors">
                        {p.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}