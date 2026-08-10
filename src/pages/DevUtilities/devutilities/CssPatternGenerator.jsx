import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { toast } from "sonner";
import { FaCopy, FaArrowLeft, FaPalette } from "react-icons/fa";

export default function CssPatternGenerator() {
  const { dark } = useTheme();
  const [pattern, setPattern] = useState("Grid");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [patternColor, setPatternColor] = useState("#d1d5db");
  const [patternSize, setPatternSize] = useState(24);
  const [lineThickness, setLineThickness] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(1);

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      heading: "text-zinc-900",
      subtext: "text-zinc-500",
      card: "bg-white border-zinc-200/85 shadow-sm",
      input:
        "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-400 focus:outline-none",
      button:
        "bg-zinc-900 text-white hover:bg-zinc-800 transition-all duration-200 shadow-sm",
      secondaryBtn:
        "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50 transition-all duration-200",
      backLink:
        "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350",
      badge: "bg-zinc-100 text-zinc-800 border-zinc-200",
      codeBox: "bg-zinc-900 text-zinc-100 border-zinc-800",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      heading: "text-zinc-100",
      subtext: "text-zinc-500",
      card: "bg-zinc-900/50 border-zinc-800/85 backdrop-blur-md shadow-md",
      input:
        "bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-zinc-500 focus:outline-none",
      button:
        "bg-white text-zinc-900 hover:bg-zinc-100 transition-all duration-200 shadow-sm",
      secondaryBtn:
        "bg-zinc-800/50 text-zinc-300 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-200",
      backLink:
        "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600",
      badge: "bg-zinc-800 text-zinc-300 border-zinc-700",
      codeBox: "bg-black/40 text-emerald-400 border-zinc-800/80 font-mono",
    },
  };

  const t = dark ? theme.dark : theme.light;

  //   const gradient = () => {
  //   return `
  //     linear-gradient(${patternColor} ${lineThickness}px, transparent ${lineThickness}px),
  //     linear-gradient(90deg, ${patternColor} ${lineThickness}px, transparent ${lineThickness}px)
  //   `;
  // };
  //   const addStop = () => {
  //     if (stops.length >= 8) {
  //       toast.error("Maximum 8 color stops allowed");
  //       return;
  //     }
  //     const newPos = Math.min(
  //       100,
  //       Math.max(
  //         0,
  //         Math.round(
  //           stops.reduce((acc, curr) => acc + curr.pos, 0) / stops.length,
  //         ) + 10,
  //       ),
  //     );
  //     setStops([...stops, { color: "#ffffff", pos: newPos }]);
  //     toast.success("Added new color stop");
  //   };

  //   const updateStop = (i, key, value) => {
  //     const copy = [...stops];
  //     if (key === "pos") {
  //       copy[i][key] = Math.min(100, Math.max(0, Number(value)));
  //     } else {
  //       copy[i][key] = value;
  //     }
  //     setStops(copy);
  //   };

  //   const removeStop = (i) => {
  //     if (stops.length <= 2) {
  //       toast.error("At least 2 color stops are required");
  //       return;
  //     }
  //     setStops(stops.filter((_, idx) => idx !== i));
  //     toast.success("Removed color stop");
  //   };

  //   const randomize = () => {
  //     const randColor = () =>
  //       "#" +
  //       Math.floor(Math.random() * 16777215)
  //         .toString(16)
  //         .padStart(6, "0");

  //     const numStops = Math.floor(Math.random() * 3) + 2; // 2 to 4 stops
  //     const newStops = [];
  //     for (let j = 0; j < numStops; j++) {
  //       newStops.push({
  //         color: randColor(),
  //         pos: Math.round((j / (numStops - 1)) * 100),
  //       });
  //     }

  //     setStops(newStops);
  //     setAngle(Math.floor(Math.random() * 8) * 45); // 0, 45, 90, etc.
  //     toast.success("Generated random gradient configuration");
  //   };
  const generatePattern = () => {
    switch (pattern) {
      case "Grid":
        return {
          backgroundColor,
          backgroundImage: `
          linear-gradient(${rotation}deg,
            ${patternColor} ${lineThickness}px,
            transparent ${lineThickness}px),
          linear-gradient(${rotation + 90}deg,
            ${patternColor} ${lineThickness}px,
            transparent ${lineThickness}px)
        `,
          backgroundSize: `${patternSize}px ${patternSize}px`,
          opacity,
        };

      case "Polka Dots":
        return {
          backgroundColor,
          backgroundImage: `radial-gradient(${patternColor} ${lineThickness}px, transparent ${lineThickness}px)`,
          backgroundSize: `${patternSize}px ${patternSize}px`,
          opacity,
        };

      case "Blueprint":
        return {
          backgroundColor: "#0c3b63",
          backgroundImage: `
          linear-gradient(${patternColor} 1px, transparent 1px),
          linear-gradient(90deg, ${patternColor} 1px, transparent 1px)
        `,
          backgroundSize: `${patternSize}px ${patternSize}px`,
          opacity,
        };

      case "Stripes":
        return {
          backgroundColor,
          backgroundImage: `repeating-linear-gradient(
          ${rotation}deg,
          ${patternColor},
          ${patternColor} ${lineThickness}px,
          transparent ${lineThickness}px,
          transparent ${patternSize}px
        )`,
          opacity,
        };

      case "Checkerboard":
        return {
          backgroundColor,
          backgroundImage: `
          linear-gradient(45deg, ${patternColor} 25%, transparent 25%),
          linear-gradient(-45deg, ${patternColor} 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, ${patternColor} 75%),
          linear-gradient(-45deg, transparent 75%, ${patternColor} 75%)
        `,
          backgroundSize: `${patternSize}px ${patternSize}px`,
          opacity,
        };

      case "Chevron":
        return {
          backgroundColor,
          backgroundImage: `
          repeating-linear-gradient(
            45deg,
            ${patternColor} 0,
            ${patternColor} ${lineThickness}px,
            transparent ${lineThickness}px,
            transparent ${patternSize}px
          ),
          repeating-linear-gradient(
            -45deg,
            ${patternColor} 0,
            ${patternColor} ${lineThickness}px,
            transparent ${lineThickness}px,
            transparent ${patternSize}px
          )
        `,
          opacity,
        };

      default:
        return {
          backgroundColor,
        };
    }
  };
  const getCSS = () => {
  switch (pattern) {
    case "Grid":
      return `background-color: ${backgroundColor};
background-image:
linear-gradient(${rotation}deg, ${patternColor} ${lineThickness}px, transparent ${lineThickness}px),
linear-gradient(${rotation + 90}deg, ${patternColor} ${lineThickness}px, transparent ${lineThickness}px);
background-size: ${patternSize}px ${patternSize}px;`;

    case "Polka Dots":
      return `background-color: ${backgroundColor};
background-image:
radial-gradient(${patternColor} ${lineThickness}px, transparent ${lineThickness}px);
background-size: ${patternSize}px ${patternSize}px;`;

    case "Blueprint":
      return `background-color: #0c3b63;
background-image:
linear-gradient(${patternColor} 1px, transparent 1px),
linear-gradient(90deg, ${patternColor} 1px, transparent 1px);
background-size: ${patternSize}px ${patternSize}px;`;

    case "Stripes":
      return `background-color: ${backgroundColor};
background-image:
repeating-linear-gradient(${rotation}deg,
${patternColor},
${patternColor} ${lineThickness}px,
transparent ${lineThickness}px,
transparent ${patternSize}px);`;

    case "Checkerboard":
      return `background-color: ${backgroundColor};
background-image:
linear-gradient(45deg, ${patternColor} 25%, transparent 25%),
linear-gradient(-45deg, ${patternColor} 25%, transparent 25%);
background-size: ${patternSize}px ${patternSize}px;`;

    case "Chevron":
      return `background-color: ${backgroundColor};
background-image:
repeating-linear-gradient(
45deg,
${patternColor},
${patternColor} ${lineThickness}px,
transparent ${lineThickness}px,
transparent ${patternSize}px
);`;

    default:
      return "";
  }
};
  const copyCSS = () => {
  navigator.clipboard.writeText(getCSS());
  toast.success("Copied CSS!");
};
  return (
    <div
      className={`min-h-screen ${t.wrapper} px-4 sm:px-6 py-6 sm:py-10 transition-colors duration-300`}
    >
      <title>CSS Background Pattern Generator — DevTasks</title>
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
            <h1
              className={`text-xl sm:text-2xl font-semibold tracking-tight ${t.heading}`}
            >
              CSS Background Pattern Generator
            </h1>
            <p className={`mt-0.5 text-xs sm:text-sm ${t.subtext}`}>
              Create customizable CSS background patterns using pure CSS
              gradients.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Left: Editor Controls */}
          <div className="space-y-6">
            <div
              className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-6`}
            >
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <FaPalette className="text-indigo-500 w-4 h-4" />
                Pattern Parameters
              </h2>

              {/* Type and Direction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Pattern Preset
                  </label>
                  <label>Background Color</label>

                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                  />
                  <label>Pattern Color</label>

                  <input
                    type="color"
                    value={patternColor}
                    onChange={(e) => setPatternColor(e.target.value)}
                  />
                  <label>Pattern Size ({patternSize}px)</label>

                  <input
                    type="range"
                    min="5"
                    max="200"
                    value={patternSize}
                    onChange={(e) => setPatternSize(Number(e.target.value))}
                  />
                  <label>Line Thickness ({lineThickness}px)</label>

                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={lineThickness}
                    onChange={(e) => setLineThickness(Number(e.target.value))}
                  />
                  <label>Rotation ({rotation}°)</label>

                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                  />
                  <label>Opacity ({opacity})</label>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                  />

                  <select
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    className={`px-3 py-2 rounded-xl border text-sm font-semibold cursor-pointer ${t.input}`}
                  >
                    <option value="Grid">Grid</option>
                    <option value="Polka Dots">Polka Dots</option>
                    <option value="Blueprint">Blueprint</option>
                    <option value="Stripes">Stripes</option>
                    <option value="Checkerboard">Checkerboard</option>
                    <option value="Chevron">Chevron</option>
                  </select>
                </div>

                {/* {type === "linear" && (
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
                )} */}
              </div>

              {/* Actions toolbar */}
              {/* <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
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
              </div> */}
            </div>
          </div>

          {/* Right: Live Preview & Presets */}
          <div className="space-y-6">
            {/* Live Preview Card */}
            <div className={`rounded-3xl border ${t.card} p-6 space-y-4`}>
              <h2 className="text-lg font-semibold tracking-tight">
                Live Output Preview
              </h2>

              <div
                className="h-56 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner relative overflow-hidden group"
                style={generatePattern()}
              >
                {/* Visual grid behind transparent colors */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
              </div>

              {/* Code output display */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  CSS Code Block
                </label>

                <div className="relative">
                  <pre
                    className={`p-4 rounded-2xl border text-xs overflow-x-auto whitespace-pre-wrap select-all ${t.codeBox}`}
                  >
                   {getCSS()}
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
          </div>
        </div>
      </div>
    </div>
  );
}
