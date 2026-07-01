import { useState } from "react";
import { toast } from "sonner";

import { useTheme } from "../../../context/ThemeContext";
export default function CssAnimationGenerator() {
  const { dark } = useTheme();

  const [duration, setDuration] = useState(2);
  const [delay, setDelay] = useState(0);
  const [iteration, setIteration] = useState("infinite");
  const [direction, setDirection] = useState("normal");
  const [fillMode, setFillMode] = useState("forwards");
  const [timing, setTiming] = useState("ease");
  const [playState, setPlayState] = useState("running");
  const [animationKey, setAnimationKey] = useState(0);
  const [shape, setShape] = useState("square");
  const [preset, setPreset] = useState("spin");
  const cssCode = `.animate-custom {
  animation: demo ${duration}s ${timing} ${delay}s ${iteration};
  animation-direction: ${direction};
  animation-fill-mode: ${fillMode};
}

@keyframes demo {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
}`;

const copyCss = async () => {
  await navigator.clipboard.writeText(cssCode);
  toast.success("CSS Copied");
};

  return (
    
    <div className="w-full p-5 sm:p-8 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6">
        CSS Animation Generator
      </h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT PANEL */}
        <div
          className={`rounded-2xl border p-5 ${
            dark
              ? "bg-zinc-950 border-zinc-800"
              : "bg-neutral-50 border-neutral-300"
          }`}
        >
            <div className="mt-8">
  <h2 className="font-bold text-xl mb-3">Generated CSS</h2>

  <pre
    className={`p-4 rounded-xl overflow-x-auto text-sm ${
      dark
        ? "bg-zinc-900 border border-zinc-700"
        : "bg-gray-100 border border-gray-300"
    }`}
  >
    
{`.animate-custom {
  animation: demo ${duration}s ${timing} ${delay}s ${iteration};
  animation-direction: ${direction};
  animation-fill-mode: ${fillMode};
}

@keyframes demo {
  0% {
    transform: scale(1) rotate(0deg);
  }

  50% {
    transform: scale(1.2) rotate(180deg);
  }

  100% {
    transform: scale(1) rotate(360deg);
  }
}`}
  </pre>
</div>

<button
  onClick={copyCss}
  className={`mt-4 px-4 py-2 rounded-xl border ${
    dark
      ? "border-white text-white"
      : "border-black text-black"
  }`}
>
  Copy CSS
</button>


          <h2 className="font-bold text-xl mb-5">
            Animation Controls
          </h2>

          {/* Duration */}
          <div className="mb-5">
            <label className="block mb-2">
              Duration ({duration}s)
            </label>

            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Delay */}
          <div className="mb-5">
            <label className="block mb-2">
              Delay ({delay}s)
            </label>

            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={delay}
              onChange={(e) => setDelay(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Timing Function */}
          <div className="mb-5">
            <label className="block mb-2">
              Timing Function
            </label>

            <select
              value={timing}
              onChange={(e) => setTiming(e.target.value)}
              className="w-full p-3 rounded-xl border"
            >
              <option value="linear">Linear</option>
              <option value="ease">Ease</option>
              <option value="ease-in">Ease In</option>
              <option value="ease-out">Ease Out</option>
              <option value="ease-in-out">Ease In Out</option>
            </select>
          </div>

          {/* Iteration */}
          <div className="mb-5">
            <label className="block mb-2">
              Iteration
            </label>

            <select
              value={iteration}
              onChange={(e) => setIteration(e.target.value)}
              className="w-full p-3 rounded-xl border"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="infinite">Infinite</option>
            </select>
          </div>

          {/* Direction */}
          <div className="mb-5">
            <label className="block mb-2">
              Direction
            </label>

            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="w-full p-3 rounded-xl border"
            >
              <option value="normal">Normal</option>
              <option value="reverse">Reverse</option>
              <option value="alternate">Alternate</option>
              <option value="alternate-reverse">
                Alternate Reverse
              </option>
            </select>
          </div>

          {/* Fill Mode */}
          <div className="mb-5">
            <label className="block mb-2">
              Fill Mode
            </label>

            <select
              value={fillMode}
              onChange={(e) => setFillMode(e.target.value)}
              className="w-full p-3 rounded-xl border"
            >
              <option value="none">None</option>
              <option value="forwards">Forwards</option>
              <option value="backwards">Backwards</option>
              <option value="both">Both</option>
            </select>
          </div>

          {/* Preview Object */}
          <div className="mb-5">
            <label className="block mb-2">
              Preview Object
            </label>

            <select
              value={shape}
              onChange={(e) => setShape(e.target.value)}
              className="w-full p-3 rounded-xl border"
            >
              <option value="square">Square</option>
              <option value="circle">Circle</option>
            </select>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div
          className={`rounded-2xl border p-5 ${
            dark
              ? "bg-zinc-950 border-zinc-800"
              : "bg-neutral-50 border-neutral-300"
          }`}
        >
          <h2 className="font-bold text-xl mb-5">
            Live Preview
          </h2>

          <div className="flex justify-center items-center h-72">
            <div
  key={animationKey}
  className={`bg-blue-500 ${
    shape === "circle"
      ? "w-24 h-24 rounded-full"
      : "w-24 h-24 rounded-xl"
  }`}
  style={{
    animation: `demo ${duration}s ${timing} ${delay}s ${iteration}`,
    animationDirection: direction,
    animationFillMode: fillMode,
    animationPlayState: playState,
  }}
/>
          </div>
          <div className="flex justify-center gap-3 mt-6">
  <button
    onClick={() => setPlayState("running")}
    className={`px-4 py-2 rounded-xl border ${
      dark
        ? "border-white text-white"
        : "border-black text-black"
    }`}
  >
    ▶ Play
  </button>

  <button
    onClick={() => setPlayState("paused")}
    className={`px-4 py-2 rounded-xl border ${
      dark
        ? "border-white text-white"
        : "border-black text-black"
    }`}
  >
    ⏸ Pause
  </button>

  <button
    onClick={() => {
      setAnimationKey((prev) => prev + 1);
      setPlayState("running");
    }}
    className={`px-4 py-2 rounded-xl border ${
      dark
        ? "border-white text-white"
        : "border-black text-black"
    }`}
  >
    🔄 Restart
  </button>
</div>

          <style>{`
            @keyframes demo {
              0% {
                transform: scale(1) rotate(0deg);
              }

              50% {
                transform: scale(1.2) rotate(180deg);
              }

              100% {
                transform: scale(1) rotate(360deg);
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}