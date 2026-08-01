import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { FaArrowLeft, FaCopy, FaPlay, FaStop, FaUndo } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";

const GRAPH = { minX: -0.3, minY: -0.6, width: 1.6, height: 2.2 };
const GRID_LINES = [0.25, 0.5, 0.75];
const GRAB_RADIUS_PX = 28;

const CURVE_COLOR = "#6366f1"; // indigo-500
const HANDLE_COLOR = "#ec4899"; // pink-500

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const round2 = (n) => Math.round(n * 100) / 100;

const toSvgPoint = ([time, progress]) => ({ x: time, y: 1 - progress });

const toClientPoint = ({ x, y }, rect) => ({
  x: rect.left + ((x - GRAPH.minX) / GRAPH.width) * rect.width,
  y: rect.top + ((y - GRAPH.minY) / GRAPH.height) * rect.height,
});

const toControlPoint = (clientX, clientY, svg) => {
  if (!svg) return null;

  const rect = svg.getBoundingClientRect();
  const x = GRAPH.minX + ((clientX - rect.left) / rect.width) * GRAPH.width;
  const y = GRAPH.minY + ((clientY - rect.top) / rect.height) * GRAPH.height;

  return { time: round2(clamp(x, 0, 1)), progress: round2(1 - y) };
};

const PRESETS = [
  { name: "linear", value: [0, 0, 1, 1] },
  { name: "ease", value: [0.25, 0.1, 0.25, 1] },
  { name: "ease-in", value: [0.42, 0, 1, 1] },
  { name: "ease-out", value: [0, 0, 0.58, 1] },
  { name: "ease-in-out", value: [0.42, 0, 0.58, 1] },
];

const DEFAULT_BEZIER = PRESETS[4].value;
const DEFAULT_COMPARE = "linear";
const DEFAULT_DURATION = 0.6;

const toCubicBezier = (b) => `cubic-bezier(${b[0]}, ${b[1]}, ${b[2]}, ${b[3]})`;
const presetValue = (name) => PRESETS.find((p) => p.name === name).value;
const sameBezier = (a, b) => a.every((n, i) => n === b[i]);

const THEME = {
  light: {
    wrapper: "bg-[#F8F9FA] text-zinc-900",
    heading: "text-zinc-900",
    subtext: "text-zinc-500",
    card: "bg-white border-zinc-200/85 shadow-sm",
    activeBtn: "bg-zinc-900 text-white border-zinc-900",
    secondaryBtn:
      "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50 transition-all duration-200",
    backLink:
      "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350",
    codeBox: "bg-zinc-900 text-zinc-100 border-zinc-800",
    canvasBg: "#fafafa",
    track: "bg-zinc-100",
    grid: "#e4e4e7",
    axis: "#a1a1aa",
  },
  dark: {
    wrapper: "bg-[#090A0F] text-zinc-100",
    heading: "text-zinc-100",
    subtext: "text-zinc-500",
    card: "bg-zinc-900/50 border-zinc-800/85 backdrop-blur-md shadow-md",
    activeBtn: "bg-white text-zinc-900 border-white",
    secondaryBtn:
      "bg-zinc-800/50 text-zinc-300 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-200",
    backLink:
      "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600",
    codeBox: "bg-black/40 text-emerald-400 border-zinc-800/80 font-mono",
    canvasBg: "#18181b",
    track: "bg-zinc-800",
    grid: "#3f3f46",
    axis: "#52525b",
  },
};

const useThemeTokens = () => {
  const { dark } = useTheme();
  return dark ? THEME.dark : THEME.light;
};

const PREVIEW_KEYFRAMES =
  "@keyframes dtBezierRun { from { left: 0 } to { left: calc(100% - 1.5rem) } }";

function useControlPointDrag(svgRef, points, onChange) {
  const draggingRef = useRef(null); // "p1" | "p2" | null

  const onPointerDown = (e) => {
    const svg = svgRef.current;
    
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const distanceTo = (point) => {
      const { x, y } = toClientPoint(point, rect);

      return Math.hypot(e.clientX - x, e.clientY - y);
    };
    const d1 = distanceTo(points.p1);
    const d2 = distanceTo(points.p2);

    if (Math.min(d1, d2) > GRAB_RADIUS_PX) return;

    e.preventDefault();
    draggingRef.current = d1 <= d2 ? "p1" : "p2";
  };

  useEffect(() => {
    const handleMove = (e) => {
      const which = draggingRef.current;

      if (!which) return;

      const point = toControlPoint(e.clientX, e.clientY, svgRef.current);

      if (!point) return;

      onChange((prev) =>
        which === "p1"
          ? [point.time, point.progress, prev[2], prev[3]]
          : [prev[0], prev[1], point.time, point.progress],
      );
    };
    const stop = () => {
      draggingRef.current = null;
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [svgRef, onChange]);

  return onPointerDown;
}

export default function CubicBezierGenerator() {
  const t = useThemeTokens();
  const [bezier, setBezier] = useState(DEFAULT_BEZIER);
  const [comparePreset, setComparePreset] = useState(DEFAULT_COMPARE);
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [playing, setPlaying] = useState(false);

  const cubicValue = toCubicBezier(bezier);
  const cssOutput = `.custom-transition {\n  transition: all ${duration}s ${cubicValue};\n}`;

  const reset = () => {
    setBezier([...DEFAULT_BEZIER]);
    setComparePreset(DEFAULT_COMPARE);
    setDuration(DEFAULT_DURATION);
    setPlaying(false);
  };

  const copyCss = () => {
    navigator.clipboard.writeText(cssOutput);
    toast.success("Copied CSS to clipboard!");
  };

  return (
    <div
      className={`min-h-screen ${t.wrapper} px-4 sm:px-6 py-6 sm:py-10 transition-colors duration-300`}
    >
      <title>CSS Cubic-Bezier Generator — DevTasks</title>
      <meta
        name="description"
        content="Design custom transition easing curves visually and preview animations in real time. Fully offline."
      />

      <div className="max-w-6xl mx-auto">
        <PageHeader />

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Left / Top: curve editor */}
          <div className="space-y-6">
            <EasingGraph value={bezier} onChange={setBezier} onReset={reset} />
            <EasingPresets value={bezier} onSelect={(v) => setBezier([...v])} />
          </div>

          {/* Right / Bottom: preview & output */}
          <div className="space-y-6">
            <DurationSlider value={duration} onChange={setDuration} />
            <AnimationPreview
              cubicValue={cubicValue}
              comparePreset={comparePreset}
              onCompareChange={setComparePreset}
              duration={duration}
              playing={playing}
              onTogglePlay={() => setPlaying((p) => !p)}
            />
            <CssOutput css={cssOutput} onCopy={copyCss} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({ className = "", children }) {
  const t = useThemeTokens();
  return (
    <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  const t = useThemeTokens();
  return (
    <h2 className={`text-lg font-semibold tracking-tight ${t.heading}`}>
      {children}
    </h2>
  );
}

function PageHeader() {
  const t = useThemeTokens();
  return (
    <header className="flex items-center gap-3 mb-6 sm:mb-8">
      <Link
        to="/devutilities"
        title="Back to Utilities"
        className={`p-2 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${t.backLink}`}
      >
        <FaArrowLeft className="w-4 h-4" />
      </Link>
      <div>
        <h1
          className={`text-xl sm:text-2xl font-semibold tracking-tight ${t.heading}`}
        >
          CSS Cubic-Bezier Generator
        </h1>
        <p className={`mt-0.5 text-xs sm:text-sm ${t.subtext}`}>
          Design custom transition easing curves visually and preview animations
          in real time. Fully offline.
        </p>
      </div>
    </header>
  );
}

function EasingGraph({ value, onChange, onReset }) {
  const t = useThemeTokens();
  const svgRef = useRef(null);
  const [x1, y1, x2, y2] = value;

  const points = {
    start: { x: 0, y: 1 },
    end: { x: 1, y: 0 },
    p1: toSvgPoint([x1, y1]),
    p2: toSvgPoint([x2, y2]),
  };
  const curve = `M 0 1 C ${points.p1.x} ${points.p1.y}, ${points.p2.x} ${points.p2.y}, 1 0`;

  const onPointerDown = useControlPointDrag(svgRef, points, onChange);

  return (
    <Panel className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle>Easing Graph</SectionTitle>
        <button
          onClick={onReset}
          title="Reset"
          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center gap-1.5 border ${t.secondaryBtn}`}
        >
          <FaUndo className="w-3 h-3" /> Reset
        </button>
      </div>

      <svg
        ref={svgRef}
        onPointerDown={onPointerDown}
        viewBox={`${GRAPH.minX} ${GRAPH.minY} ${GRAPH.width} ${GRAPH.height}`}
        className="w-full h-auto rounded-2xl border touch-none select-none"
        style={{ background: t.canvasBg, borderColor: t.grid }}
      >
        {/* Overshoot zones above and below the unit square */}
        <rect x={0} y={GRAPH.minY} width={1} height={-GRAPH.minY} fill={t.axis} opacity="0.06" />
        <rect x={0} y={1} width={1} height={GRAPH.minY + GRAPH.height - 1} fill={t.axis} opacity="0.06" />

        {/* Gridlines */}
        {GRID_LINES.map((g) => (
          <line key={`v${g}`} x1={g} y1={0} x2={g} y2={1} stroke={t.grid} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        {GRID_LINES.map((g) => (
          <line key={`h${g}`} x1={0} y1={g} x2={1} y2={g} stroke={t.grid} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}

        {/* Unit square (start / end baselines) */}
        <rect x={0} y={0} width={1} height={1} fill="none" stroke={t.axis} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />

        <GuideLine from={points.start} to={points.p1} />
        <GuideLine from={points.end} to={points.p2} />
        <path d={curve} fill="none" stroke={CURVE_COLOR} strokeWidth="3.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />

        <Anchor point={points.start} color={t.axis} />
        <Anchor point={points.end} color={t.axis} />
        <Handle point={points.p1} />
        <Handle point={points.p2} />
      </svg>

      <div
        className={`flex items-center justify-center gap-1 text-xs font-mono ${t.subtext}`}
      >
        <span>cubic-bezier(</span>
        <span className="text-pink-500 font-semibold">
          {x1}, {y1}, {x2}, {y2}
        </span>
        <span>)</span>
      </div>
    </Panel>
  );
}

function GuideLine({ from, to }) {
  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={HANDLE_COLOR}
      strokeWidth="2"
      strokeDasharray="5 5"
      vectorEffect="non-scaling-stroke"
    />
  );
}

function Anchor({ point, color }) {
  return <circle cx={point.x} cy={point.y} r="0.02" fill={color} />;
}

function Handle({ point }) {
  return (
    <circle
      cx={point.x}
      cy={point.y}
      r="0.03"
      fill={HANDLE_COLOR}
      stroke="#fff"
      strokeWidth="2.5"
      vectorEffect="non-scaling-stroke"
      style={{ cursor: "grab" }}
    />
  );
}

function EasingPresets({ value, onSelect }) {
  const t = useThemeTokens();
  return (
    <Panel className="space-y-4">
      <SectionTitle>Easing Presets</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PRESETS.map((preset) => {
          const active = sameBezier(preset.value, value);
          return (
            <button
              key={preset.name}
              onClick={() => onSelect(preset.value)}
              className={`px-2 py-2 rounded-xl border text-[11px] font-semibold text-center transition-all duration-200 ${
                active ? t.activeBtn : t.secondaryBtn
              }`}
            >
              {preset.name}
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

function DurationSlider({ value, onChange }) {
  const t = useThemeTokens();
  return (
    <Panel className="space-y-3">
      <div className="flex items-center justify-between">
        <SectionTitle>Duration</SectionTitle>
        <span className={`text-sm font-mono font-semibold ${t.heading}`}>
          {value.toFixed(1)}s
        </span>
      </div>
      <input
        type="range"
        min="0.5"
        max="5"
        step="0.1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-indigo-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
      />
    </Panel>
  );
}

function AnimationPreview({
  cubicValue,
  comparePreset,
  onCompareChange,
  duration,
  playing,
  onTogglePlay,
}) {
  const t = useThemeTokens();
  return (
    <Panel className="space-y-4">
      <style>{PREVIEW_KEYFRAMES}</style>

      <div className="flex items-center justify-between">
        <SectionTitle>Animation Preview</SectionTitle>
        <PlayButton playing={playing} onClick={onTogglePlay} />
      </div>

      <PreviewTrack
        timing={cubicValue}
        duration={duration}
        playing={playing}
        ballClass="bg-indigo-500"
        label={
          <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-500">
            Custom
          </span>
        }
      />

      <PreviewTrack
        timing={toCubicBezier(presetValue(comparePreset))}
        duration={duration}
        playing={playing}
        ballClass="bg-zinc-400 dark:bg-zinc-500"
        label={
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider ${t.subtext}`}
            >
              Comparison
            </span>
            <select
              value={comparePreset}
              onChange={(e) => onCompareChange(e.target.value)}
              title="Comparison easing"
              className={`px-2 py-1 rounded-lg border text-[11px] font-semibold ${t.secondaryBtn}`}
            >
              {PRESETS.map((preset) => (
                <option key={preset.name} value={preset.name}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <p className={`text-[11px] ${t.subtext}`}>
        Press Play to loop both blocks and compare the custom curve against the
        selected preset. Adjust the curve or duration while it runs.
      </p>
    </Panel>
  );
}

function PlayButton({ playing, onClick }) {
  return (
    <button
      onClick={onClick}
      title={playing ? "Stop animation" : "Play animation"}
      className={`px-4 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-white transition-colors active:scale-95 shadow-md ${
        playing ? "bg-rose-600 hover:bg-rose-500" : "bg-indigo-600 hover:bg-indigo-500"
      }`}
    >
      {playing ? (
        <>
          <FaStop className="w-3 h-3" /> Stop
        </>
      ) : (
        <>
          <FaPlay className="w-3 h-3" /> Play
        </>
      )}
    </button>
  );
}

function PreviewTrack({ label, ballClass, timing, duration, playing }) {
  const t = useThemeTokens();
  const style = playing
    ? { animation: `dtBezierRun ${duration}s ${timing} infinite` }
    : undefined;
  return (
    <div className="space-y-1.5">
      {label}
      <div className={`relative h-6 rounded-full overflow-visible ${t.track}`}>
        <div
          className={`absolute top-0 left-0 w-6 h-6 rounded-full shadow-md ${ballClass}`}
          style={style}
        />
      </div>
    </div>
  );
}

function CssOutput({ css, onCopy }) {
  const t = useThemeTokens();
  return (
    <Panel className="space-y-3">
      <SectionTitle>CSS Output</SectionTitle>
      <div className="relative">
        <pre
          className={`p-4 rounded-2xl border text-xs overflow-x-auto whitespace-pre select-all ${t.codeBox}`}
        >
          {css}
        </pre>
        <button
          onClick={onCopy}
          title="Copy to clipboard"
          className="absolute right-3 top-3 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors active:scale-95 flex items-center gap-1.5 text-xs font-semibold shadow-md"
        >
          <FaCopy className="w-3 h-3" /> Copy CSS
        </button>
      </div>
    </Panel>
  );
}
