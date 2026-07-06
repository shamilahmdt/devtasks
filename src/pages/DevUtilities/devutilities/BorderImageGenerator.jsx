import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { toast } from "sonner";
import {
  FaArrowLeft,
  FaBorderStyle,
  FaCopy,
  FaImage,
  FaLink,
  FaUnlink,
  FaUpload,
} from "react-icons/fa";

// Centers of the 8 outer cells of a 90x90 asset sliced into a 3x3 grid of 30px cells
const CELL_CENTERS = [
  [15, 15],
  [45, 15],
  [75, 15],
  [15, 45],
  [75, 45],
  [15, 75],
  [45, 75],
  [75, 75],
];

const makeSvg = (shapes) =>
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 90">${shapes}</svg>`
  );

const defaultAssets = [
  {
    name: "Diamonds",
    slice: 30,
    url: makeSvg(
      CELL_CENTERS.map(
        ([x, y]) =>
          `<path d="M${x} ${y - 11}L${x + 11} ${y}L${x} ${y + 11}L${x - 11} ${y}Z" fill="#6366f1"/>`
      ).join("")
    ),
  },
  {
    name: "Dots",
    slice: 30,
    url: makeSvg(
      CELL_CENTERS.map(
        ([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#10b981"/>`
      ).join("")
    ),
  },
  {
    name: "Frame",
    slice: 30,
    url: makeSvg(
      `<rect x="7" y="7" width="76" height="76" fill="none" stroke="#f59e0b" stroke-width="6"/>` +
        `<rect x="3" y="3" width="20" height="20" fill="#f59e0b"/>` +
        `<rect x="67" y="3" width="20" height="20" fill="#f59e0b"/>` +
        `<rect x="3" y="67" width="20" height="20" fill="#f59e0b"/>` +
        `<rect x="67" y="67" width="20" height="20" fill="#f59e0b"/>`
    ),
  },
  {
    name: "Stripes",
    slice: 30,
    url: makeSvg(
      `<defs><pattern id="s" width="12" height="12" patternTransform="rotate(45)" patternUnits="userSpaceOnUse"><rect width="6" height="12" fill="#ec4899"/></pattern></defs>` +
        `<rect width="90" height="90" fill="url(#s)"/>`
    ),
  },
];

const repeatOptions = ["stretch", "repeat", "round", "space"];
const sliceSides = ["top", "right", "bottom", "left"];

export default function BorderImageGenerator() {
  const { dark } = useTheme();
  const fileInputRef = useRef(null);

  const [source, setSource] = useState(defaultAssets[0].url);
  const [sourceName, setSourceName] = useState(defaultAssets[0].name);
  const [slices, setSlices] = useState({ top: 30, right: 30, bottom: 30, left: 30 });
  const [linked, setLinked] = useState(true);
  const [sliceUnit, setSliceUnit] = useState("");
  const [fill, setFill] = useState(false);
  const [repeatX, setRepeatX] = useState("round");
  const [repeatY, setRepeatY] = useState("round");
  const [borderWidth, setBorderWidth] = useState(20);
  const [dragging, setDragging] = useState(false);

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      heading: "text-zinc-900",
      subtext: "text-zinc-500",
      card: "bg-white border-zinc-200/85 shadow-sm",
      input: "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-400 focus:outline-none",
      secondaryBtn: "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50 transition-all duration-200",
      backLink: "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350",
      codeBox: "bg-zinc-900 text-zinc-100 border-zinc-800",
      dropzone: "border-zinc-300 bg-zinc-50/60 text-zinc-500",
      dropzoneActive: "border-indigo-400 bg-indigo-50 text-indigo-600",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      heading: "text-zinc-100",
      subtext: "text-zinc-500",
      card: "bg-zinc-900/50 border-zinc-800/85 backdrop-blur-md shadow-md",
      input: "bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-zinc-500 focus:outline-none",
      secondaryBtn: "bg-zinc-800/50 text-zinc-300 border-zinc-700 hover:bg-zinc-700/50 transition-all duration-200",
      backLink: "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600",
      codeBox: "bg-black/40 text-emerald-400 border-zinc-800/80 font-mono",
      dropzone: "border-zinc-700 bg-zinc-900/40 text-zinc-500",
      dropzoneActive: "border-indigo-500 bg-indigo-500/10 text-indigo-400",
    },
  };

  const t = dark ? theme.dark : theme.light;

  const updateSlice = (side, rawValue) => {
    const value = Math.min(100, Math.max(0, Number(rawValue) || 0));
    if (linked) {
      setSlices({ top: value, right: value, bottom: value, left: value });
    } else {
      setSlices((prev) => ({ ...prev, [side]: value }));
    }
  };

  const loadDefaultAsset = (asset) => {
    setSource(asset.url);
    setSourceName(asset.name);
    setSlices({ top: asset.slice, right: asset.slice, bottom: asset.slice, left: asset.slice });
    setSliceUnit("");
    toast.success(`Loaded ${asset.name} asset`);
  };

  const loadFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please drop an image file (SVG, PNG, JPG, ...)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSource(reader.result);
      setSourceName(file.name);
      toast.success(`Loaded ${file.name}`);
    };
    reader.onerror = () => toast.error("Could not read the image file");
    reader.readAsDataURL(file);
  };

  const sliceValue = `${sliceSides.map((s) => `${slices[s]}${sliceUnit}`).join(" ")}${fill ? " fill" : ""}`;
  const repeatValue = repeatX === repeatY ? repeatX : `${repeatX} ${repeatY}`;

  const buildCSS = (url) =>
    [
      `border-style: solid;`,
      `border-width: ${borderWidth}px;`,
      `border-image-source: url('${url}');`,
      `border-image-slice: ${sliceValue};`,
      `border-image-repeat: ${repeatValue};`,
    ].join("\n");

  const displayUrl = source.length > 72 ? `${source.slice(0, 72)}…` : source;

  const copyCSS = () => {
    navigator.clipboard.writeText(buildCSS(source));
    toast.success("Copied CSS to clipboard!");
  };

  const previewStyle = {
    borderStyle: "solid",
    borderWidth: `${borderWidth}px`,
    borderImageSource: `url('${source}')`,
    borderImageSlice: sliceValue,
    borderImageRepeat: repeatValue,
    resize: "both",
    overflow: "auto",
  };

  return (
    <div className={`min-h-screen ${t.wrapper} px-4 sm:px-6 py-6 sm:py-10 transition-colors duration-300`}>
      <title>CSS Border-Image Generator — DevTasks</title>
      <meta
        name="description"
        content="Design custom sliced image borders visually with slice guides, repeat modes, live preview, and copy-ready border-image CSS."
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
              CSS Border-Image Generator
            </h1>
            <p className={`mt-0.5 text-xs sm:text-sm ${t.subtext}`}>
              Slice a border asset visually and export copy-paste border-image CSS.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Left: Controls & Slice Guides */}
          <div className="space-y-6">
            {/* Asset loader */}
            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-4`}>
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <FaImage className="text-indigo-500 w-4 h-4" />
                Load Asset
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {defaultAssets.map((asset) => (
                  <button
                    key={asset.name}
                    onClick={() => loadDefaultAsset(asset)}
                    className={`group p-2 rounded-2xl border text-left flex flex-col gap-2 transition-all duration-200 focus:outline-none ${
                      sourceName === asset.name
                        ? "border-indigo-500"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div
                      className="h-14 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
                      style={{
                        backgroundImage: `url('${asset.url}')`,
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      }}
                    />
                    <span className="text-xs font-bold truncate px-1">{asset.name}</span>
                  </button>
                ))}
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  loadFile(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition-colors duration-200 ${
                  dragging ? t.dropzoneActive : t.dropzone
                }`}
              >
                <FaUpload className="w-4 h-4 mx-auto mb-2" />
                <p className="text-xs font-semibold">
                  Drag &amp; drop a custom border image here, or click to browse
                </p>
                <p className="text-[11px] mt-1 opacity-70">
                  Loaded: <span className="font-mono">{sourceName}</span>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    loadFile(e.target.files[0]);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>

            {/* Slice guides */}
            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-5`}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                  <FaBorderStyle className="text-indigo-500 w-4 h-4" />
                  Slice Guides
                </h2>
                <div className="flex items-center gap-2">
                  <select
                    value={sliceUnit}
                    onChange={(e) => setSliceUnit(e.target.value)}
                    className={`px-2 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${t.input}`}
                    title="Slice unit"
                  >
                    <option value="">number</option>
                    <option value="%">%</option>
                  </select>
                  <button
                    onClick={() => {
                      if (!linked) {
                        setSlices((prev) => ({
                          top: prev.top,
                          right: prev.top,
                          bottom: prev.top,
                          left: prev.top,
                        }));
                      }
                      setLinked(!linked);
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${t.secondaryBtn}`}
                    title={linked ? "Unlink sides" : "Link all sides"}
                  >
                    {linked ? <FaLink className="w-3 h-3" /> : <FaUnlink className="w-3 h-3" />}
                    {linked ? "Linked" : "Unlinked"}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {sliceSides.map((side) => (
                  <div key={side} className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex justify-between">
                      <span>{side}</span>
                      <span className="font-mono text-zinc-400">
                        {slices[side]}
                        {sliceUnit}
                      </span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={slices[side]}
                        onChange={(e) => updateSlice(side, e.target.value)}
                        className="flex-1 accent-indigo-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={slices[side]}
                        onChange={(e) => updateSlice(side, e.target.value)}
                        className={`w-16 px-2 py-1 rounded-lg border text-xs font-semibold text-center ${t.input}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-500 cursor-pointer pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                <input
                  type="checkbox"
                  checked={fill}
                  onChange={(e) => setFill(e.target.checked)}
                  className="accent-indigo-500 w-3.5 h-3.5"
                />
                Add <code className="font-mono">fill</code> keyword (draws the middle region inside the box)
              </label>
            </div>

            {/* Repeat & width */}
            <div className={`rounded-3xl border ${t.card} p-5 sm:p-6 space-y-5`}>
              <h2 className="text-lg font-semibold tracking-tight">Repeat &amp; Border Width</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Repeat (horizontal edges)
                  </label>
                  <select
                    value={repeatX}
                    onChange={(e) => setRepeatX(e.target.value)}
                    className={`px-3 py-2 rounded-xl border text-sm font-semibold cursor-pointer ${t.input}`}
                  >
                    {repeatOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Repeat (vertical edges)
                  </label>
                  <select
                    value={repeatY}
                    onChange={(e) => setRepeatY(e.target.value)}
                    className={`px-3 py-2 rounded-xl border text-sm font-semibold cursor-pointer ${t.input}`}
                  >
                    {repeatOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex justify-between">
                  <span>Border Width</span>
                  <span className="font-mono text-zinc-400">{borderWidth}px</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={borderWidth}
                  onChange={(e) => setBorderWidth(Number(e.target.value))}
                  className="flex-1 accent-indigo-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right: Live Preview & Code Output */}
          <div className="space-y-6">
            <div className={`rounded-3xl border ${t.card} p-6 space-y-4`}>
              <h2 className="text-lg font-semibold tracking-tight">Live Preview</h2>
              <p className={`text-xs ${t.subtext}`}>
                Drag the bottom-right corner of the box to resize it and see how the border adapts.
              </p>

              <div className="flex justify-center p-4 rounded-2xl bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px]">
                <div
                  className="w-64 h-44 min-w-[8rem] min-h-[6rem] max-w-full flex items-center justify-center text-xs font-semibold text-zinc-500 bg-white/60 dark:bg-zinc-950/60"
                  style={previewStyle}
                >
                  Resizable preview
                </div>
              </div>
            </div>

            <div className={`rounded-3xl border ${t.card} p-6 space-y-4`}>
              <h2 className="text-lg font-semibold tracking-tight">CSS Code Output</h2>
              <div className="relative">
                <pre
                  className={`p-4 rounded-2xl border text-xs overflow-x-auto whitespace-pre-wrap break-all select-all ${t.codeBox}`}
                >
                  {buildCSS(displayUrl)}
                </pre>
                <button
                  onClick={copyCSS}
                  className="absolute right-3 top-3 p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-white transition-colors active:scale-95 flex items-center gap-1.5 text-xs font-semibold shadow-md"
                  title="Copy to clipboard"
                >
                  <FaCopy className="w-3 h-3" /> Copy CSS
                </button>
              </div>
              <p className={`text-[11px] ${t.subtext}`}>
                Long image URLs are truncated in the display above — the copied CSS always contains the
                full <code className="font-mono">border-image-source</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
