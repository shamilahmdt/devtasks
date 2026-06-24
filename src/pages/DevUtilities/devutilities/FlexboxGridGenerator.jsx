import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const CodeBlock = ({ code, dark }) => (
  <pre
    className={`text-xs font-mono leading-relaxed whitespace-pre-wrap break-all overflow-auto h-full ${
      dark ? "text-zinc-300" : "text-zinc-700"
    }`}
  >
    {code}
  </pre>
);

const FlexboxGridGenerator = () => {
  const { dark } = useTheme();

  // Mode state
  const [mode, setMode] = useState("flexbox");

  // Flexbox properties
  const [flexDirection, setFlexDirection] = useState("row");
  const [flexWrap, setFlexWrap] = useState("nowrap");
  const [justifyContent, setJustifyContent] = useState("flex-start");
  const [alignItems, setAlignItems] = useState("stretch");
  const [flexGap, setFlexGap] = useState(16);

  // Grid properties
  const [gridColumns, setGridColumns] = useState(3);
  const [gridRows, setGridRows] = useState(2);
  const [gridGap, setGridGap] = useState(16);
  const [gridJustifyItems, setGridJustifyItems] = useState("stretch");
  const [gridAlignItems, setGridAlignItems] = useState("stretch");

  // Common state
  const [itemCount, setItemCount] = useState(6);
  const [outputTab, setOutputTab] = useState("css");

  // Generate CSS for flexbox
  const generateFlexboxCSS = () => {
    return `.container {
  display: flex;
  flex-direction: ${flexDirection};
  flex-wrap: ${flexWrap};
  justify-content: ${justifyContent};
  align-items: ${alignItems};
  gap: ${flexGap}px;
  padding: 24px;
}

.item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: #e4e4e7;
  border-radius: 12px;
  font-weight: bold;
  font-size: 14px;
  min-width: 60px;
  min-height: 60px;
}`;
  };

  // Generate CSS for grid
  const generateGridCSS = () => {
    return `.container {
  display: grid;
  grid-template-columns: repeat(${gridColumns}, 1fr);
  grid-template-rows: repeat(${gridRows}, auto);
  gap: ${gridGap}px;
  justify-items: ${gridJustifyItems};
  align-items: ${gridAlignItems};
  padding: 24px;
}

.item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: #e4e4e7;
  border-radius: 12px;
  font-weight: bold;
  font-size: 14px;
  min-height: 60px;
}`;
  };

  // Generate HTML
  const generateHTML = () => {
    const items = Array.from({ length: itemCount }, (_, i) => `  <div class="item">${i + 1}</div>`).join("\n");
    return `<div class="container">\n${items}\n</div>`;
  };

  // Handle copy
  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Failed to copy");
    }
  };

  // Reset to defaults
  const handleReset = () => {
    if (mode === "flexbox") {
      setFlexDirection("row");
      setFlexWrap("nowrap");
      setJustifyContent("flex-start");
      setAlignItems("stretch");
      setFlexGap(16);
    } else {
      setGridColumns(3);
      setGridRows(2);
      setGridGap(16);
      setGridJustifyItems("stretch");
      setGridAlignItems("stretch");
    }
    setItemCount(6);
  };

  const currentCSS = mode === "flexbox" ? generateFlexboxCSS() : generateGridCSS();
  const currentHTML = generateHTML();

  // Get inline styles for preview
  const getPreviewStyles = () => {
    if (mode === "flexbox") {
      return {
        display: "flex",
        flexDirection: flexDirection,
        flexWrap: flexWrap,
        justifyContent: justifyContent,
        alignItems: alignItems,
        gap: `${flexGap}px`,
      };
    } else {
      return {
        display: "grid",
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        gridTemplateRows: `repeat(${gridRows}, auto)`,
        gap: `${gridGap}px`,
        justifyItems: gridJustifyItems,
        alignItems: gridAlignItems,
      };
    }
  };

  return (
    <div
      className={`min-h-[calc(100vh-76px)] md:h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto overflow-x-hidden md:overflow-hidden relative flex flex-col justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>Flexbox & Grid Generator — Dev Utilities</title>
      <meta
        name="description"
        content="Interactive Flexbox and CSS Grid layout builder with live preview and code generation."
      />

      {/* Background blurs */}
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

      {/* Main container */}
      <div
        className={`relative z-10 w-full max-w-5xl md:w-[85%] mx-auto rounded-[32px] border shadow-xl flex flex-col max-h-full overflow-hidden transition-all duration-300 ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        <div
          className={`h-2 w-full transition-colors duration-500 ${
            dark ? "bg-white" : "bg-black"
          }`}
        />

        {/* Header */}
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/devutilities"
              className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${
                dark
                  ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                  : "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350"
              }`}
              title="Back to Workspace"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h1
              className={`text-lg sm:text-2xl font-black uppercase tracking-tight transition-colors duration-300 ${
                dark ? "text-white" : "text-black"
              }`}
            >
              Flexbox & Grid
            </h1>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMode("flexbox");
                setOutputTab("css");
              }}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                mode === "flexbox"
                  ? dark
                    ? "bg-white text-black"
                    : "bg-black text-white"
                  : dark
                  ? "text-zinc-400 border border-zinc-700 hover:text-white"
                  : "text-neutral-600 border border-neutral-300 hover:text-black"
              }`}
            >
              Flex
            </button>
            <button
              onClick={() => {
                setMode("grid");
                setOutputTab("css");
              }}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                mode === "grid"
                  ? dark
                    ? "bg-white text-black"
                    : "bg-black text-white"
                  : dark
                  ? "text-zinc-400 border border-zinc-700 hover:text-white"
                  : "text-neutral-600 border border-neutral-300 hover:text-black"
              }`}
            >
              Grid
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="w-full md:h-[calc(100%-120px)] p-5 sm:p-8 overflow-y-auto">
          <div className="w-full h-full flex flex-col lg:flex-row gap-6">
            {/* LEFT: Controls Panel */}
            <div className="w-full lg:w-64 flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                <h2
                  className={`text-xs font-black uppercase tracking-widest ${
                    dark ? "text-zinc-400" : "text-neutral-500"
                  }`}
                >
                  Properties
                </h2>

                {/* Flexbox Controls */}
                {mode === "flexbox" && (
                  <div className="flex flex-col gap-4 space-y-4">
                    {/* flex-direction */}
                    <div className="flex flex-col gap-2">
                      <label
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          dark ? "text-zinc-500" : "text-neutral-600"
                        }`}
                      >
                        Direction
                      </label>
                      <select
                        value={flexDirection}
                        onChange={(e) => setFlexDirection(e.target.value)}
                        className={`px-3 py-2 rounded-xl border text-xs font-mono outline-none transition-all duration-300 ${
                          dark
                            ? "bg-zinc-950 border-zinc-800 text-white focus:border-white focus:ring-1 focus:ring-white"
                            : "bg-neutral-50 border-neutral-300 text-black focus:border-black focus:ring-1 focus:ring-black"
                        }`}
                      >
                        <option value="row">row</option>
                        <option value="column">column</option>
                        <option value="row-reverse">row-reverse</option>
                        <option value="column-reverse">column-reverse</option>
                      </select>
                    </div>

                    {/* flex-wrap */}
                    <div className="flex flex-col gap-2">
                      <label
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          dark ? "text-zinc-500" : "text-neutral-600"
                        }`}
                      >
                        Wrap
                      </label>
                      <select
                        value={flexWrap}
                        onChange={(e) => setFlexWrap(e.target.value)}
                        className={`px-3 py-2 rounded-xl border text-xs font-mono outline-none transition-all duration-300 ${
                          dark
                            ? "bg-zinc-950 border-zinc-800 text-white focus:border-white focus:ring-1 focus:ring-white"
                            : "bg-neutral-50 border-neutral-300 text-black focus:border-black focus:ring-1 focus:ring-black"
                        }`}
                      >
                        <option value="nowrap">nowrap</option>
                        <option value="wrap">wrap</option>
                        <option value="wrap-reverse">wrap-reverse</option>
                      </select>
                    </div>

                    {/* justify-content */}
                    <div className="flex flex-col gap-2">
                      <label
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          dark ? "text-zinc-500" : "text-neutral-600"
                        }`}
                      >
                        Justify Content
                      </label>
                      <select
                        value={justifyContent}
                        onChange={(e) => setJustifyContent(e.target.value)}
                        className={`px-3 py-2 rounded-xl border text-xs font-mono outline-none transition-all duration-300 ${
                          dark
                            ? "bg-zinc-950 border-zinc-800 text-white focus:border-white focus:ring-1 focus:ring-white"
                            : "bg-neutral-50 border-neutral-300 text-black focus:border-black focus:ring-1 focus:ring-black"
                        }`}
                      >
                        <option value="flex-start">flex-start</option>
                        <option value="flex-end">flex-end</option>
                        <option value="center">center</option>
                        <option value="space-between">space-between</option>
                        <option value="space-around">space-around</option>
                        <option value="space-evenly">space-evenly</option>
                      </select>
                    </div>

                    {/* align-items */}
                    <div className="flex flex-col gap-2">
                      <label
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          dark ? "text-zinc-500" : "text-neutral-600"
                        }`}
                      >
                        Align Items
                      </label>
                      <select
                        value={alignItems}
                        onChange={(e) => setAlignItems(e.target.value)}
                        className={`px-3 py-2 rounded-xl border text-xs font-mono outline-none transition-all duration-300 ${
                          dark
                            ? "bg-zinc-950 border-zinc-800 text-white focus:border-white focus:ring-1 focus:ring-white"
                            : "bg-neutral-50 border-neutral-300 text-black focus:border-black focus:ring-1 focus:ring-black"
                        }`}
                      >
                        <option value="stretch">stretch</option>
                        <option value="flex-start">flex-start</option>
                        <option value="flex-end">flex-end</option>
                        <option value="center">center</option>
                        <option value="baseline">baseline</option>
                      </select>
                    </div>

                    {/* gap slider */}
                    <div className="flex flex-col gap-2">
                      <label
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          dark ? "text-zinc-500" : "text-neutral-600"
                        }`}
                      >
                        Gap: <span className="text-zinc-300">{flexGap}px</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="64"
                        value={flexGap}
                        onChange={(e) => setFlexGap(parseInt(e.target.value))}
                        className="w-full cursor-pointer accent-white"
                      />
                    </div>
                  </div>
                )}

                {/* Grid Controls */}
                {mode === "grid" && (
                  <div className="flex flex-col gap-4 space-y-4">
                    {/* Columns */}
                    <div className="flex flex-col gap-2">
                      <label
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          dark ? "text-zinc-500" : "text-neutral-600"
                        }`}
                      >
                        Columns
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={gridColumns}
                        onChange={(e) => setGridColumns(parseInt(e.target.value))}
                        className={`px-3 py-2 rounded-xl border text-xs font-mono outline-none transition-all duration-300 ${
                          dark
                            ? "bg-zinc-950 border-zinc-800 text-white focus:border-white focus:ring-1 focus:ring-white"
                            : "bg-neutral-50 border-neutral-300 text-black focus:border-black focus:ring-1 focus:ring-black"
                        }`}
                      />
                    </div>

                    {/* Rows */}
                    <div className="flex flex-col gap-2">
                      <label
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          dark ? "text-zinc-500" : "text-neutral-600"
                        }`}
                      >
                        Rows
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={gridRows}
                        onChange={(e) => setGridRows(parseInt(e.target.value))}
                        className={`px-3 py-2 rounded-xl border text-xs font-mono outline-none transition-all duration-300 ${
                          dark
                            ? "bg-zinc-950 border-zinc-800 text-white focus:border-white focus:ring-1 focus:ring-white"
                            : "bg-neutral-50 border-neutral-300 text-black focus:border-black focus:ring-1 focus:ring-black"
                        }`}
                      />
                    </div>

                    {/* Gap slider */}
                    <div className="flex flex-col gap-2">
                      <label
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          dark ? "text-zinc-500" : "text-neutral-600"
                        }`}
                      >
                        Gap: <span className="text-zinc-300">{gridGap}px</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="64"
                        value={gridGap}
                        onChange={(e) => setGridGap(parseInt(e.target.value))}
                        className="w-full cursor-pointer accent-white"
                      />
                    </div>

                    {/* Justify Items */}
                    <div className="flex flex-col gap-2">
                      <label
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          dark ? "text-zinc-500" : "text-neutral-600"
                        }`}
                      >
                        Justify Items
                      </label>
                      <select
                        value={gridJustifyItems}
                        onChange={(e) => setGridJustifyItems(e.target.value)}
                        className={`px-3 py-2 rounded-xl border text-xs font-mono outline-none transition-all duration-300 ${
                          dark
                            ? "bg-zinc-950 border-zinc-800 text-white focus:border-white focus:ring-1 focus:ring-white"
                            : "bg-neutral-50 border-neutral-300 text-black focus:border-black focus:ring-1 focus:ring-black"
                        }`}
                      >
                        <option value="stretch">stretch</option>
                        <option value="start">start</option>
                        <option value="end">end</option>
                        <option value="center">center</option>
                      </select>
                    </div>

                    {/* Align Items */}
                    <div className="flex flex-col gap-2">
                      <label
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          dark ? "text-zinc-500" : "text-neutral-600"
                        }`}
                      >
                        Align Items
                      </label>
                      <select
                        value={gridAlignItems}
                        onChange={(e) => setGridAlignItems(e.target.value)}
                        className={`px-3 py-2 rounded-xl border text-xs font-mono outline-none transition-all duration-300 ${
                          dark
                            ? "bg-zinc-950 border-zinc-800 text-white focus:border-white focus:ring-1 focus:ring-white"
                            : "bg-neutral-50 border-neutral-300 text-black focus:border-black focus:ring-1 focus:ring-black"
                        }`}
                      >
                        <option value="stretch">stretch</option>
                        <option value="start">start</option>
                        <option value="end">end</option>
                        <option value="center">center</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Item count */}
                <div className="flex flex-col gap-2 mt-2 pt-4 border-t" style={{borderColor: dark ? '#3f3f46' : '#e5e7eb'}}>
                  <label
                    className={`text-[10px] font-black uppercase tracking-widest ${
                      dark ? "text-zinc-500" : "text-neutral-600"
                    }`}
                  >
                    Items: <span className="text-zinc-300">{itemCount}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={itemCount}
                    onChange={(e) => setItemCount(parseInt(e.target.value))}
                    className="w-full cursor-pointer accent-white"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t" style={{borderColor: dark ? '#3f3f46' : '#e5e7eb'}}>
                <button
                  onClick={() => handleCopy(currentCSS, "CSS")}
                  type="button"
                  className={`w-full px-3 py-2.5 rounded-xl border font-bold text-xs text-center transition-all duration-300 active:scale-95 ${
                    dark
                      ? "border-white bg-white text-black hover:bg-zinc-200 hover:border-zinc-200"
                      : "border-black bg-black text-white hover:bg-zinc-800 hover:border-zinc-800"
                  }`}
                >
                  Copy CSS
                </button>
                <button
                  onClick={() => handleCopy(currentHTML, "HTML")}
                  type="button"
                  className={`w-full px-3 py-2.5 rounded-xl border font-bold text-xs text-center transition-all duration-300 active:scale-95 ${
                    dark
                      ? "border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      : "border-neutral-300 text-neutral-600 hover:bg-neutral-100 hover:text-black"
                  }`}
                >
                  Copy HTML
                </button>
              </div>

              <button
                onClick={handleReset}
                type="button"
                className={`w-full px-3 py-2.5 rounded-xl border font-bold text-xs text-center transition-all duration-300 active:scale-95 ${
                  dark
                    ? "border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    : "border-neutral-300 text-neutral-600 hover:bg-neutral-100 hover:text-black"
                }`}
              >
                Reset
              </button>
            </div>

            {/* RIGHT: Preview + Code Output */}
            <div className="w-full flex flex-col gap-6">
              {/* Preview Section */}
              <div className="flex flex-col gap-2 flex-1 min-h-[280px]">
                <label
                  className={`text-xs font-black uppercase tracking-widest ${
                    dark ? "text-zinc-400" : "text-neutral-500"
                  }`}
                >
                  Preview
                </label>
                <div
                  className={`flex-1 min-h-full p-6 rounded-2xl border transition-all duration-300 overflow-auto ${
                    dark
                      ? "bg-zinc-950 border-zinc-800"
                      : "bg-neutral-50 border-neutral-300"
                  }`}
                  style={getPreviewStyles()}
                >
                  {Array.from({ length: itemCount }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-center font-bold rounded-lg transition-colors duration-300 ${
                        dark
                          ? "bg-zinc-800 text-white"
                          : "bg-neutral-200 text-black"
                      }`}
                      style={{
                        padding: "16px",
                        minWidth: "60px",
                        minHeight: "60px",
                        fontSize: "14px",
                        flex: "0 0 auto",
                      }}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Output Section */}
              <div className="flex flex-col gap-2 flex-1 min-h-[280px]">
                <div className="flex items-center justify-between">
                  <label
                    className={`text-xs font-black uppercase tracking-widest ${
                      dark ? "text-zinc-400" : "text-neutral-500"
                    }`}
                  >
                    Code
                  </label>
                </div>

                {/* Tab buttons */}
                <div className="flex gap-2 border-b" style={{borderColor: dark ? '#3f3f46' : '#e5e7eb'}}>
                  <button
                    onClick={() => setOutputTab("css")}
                    type="button"
                    className={`px-3 py-2 text-xs font-bold uppercase tracking-widest transition-colors duration-300 border-b-2 outline-none ${
                      outputTab === "css"
                        ? dark
                          ? "text-white border-white"
                          : "text-black border-black"
                        : dark
                        ? "text-zinc-500 border-transparent hover:text-white"
                        : "text-neutral-500 border-transparent hover:text-black"
                    }`}
                  >
                    CSS
                  </button>
                  <button
                    onClick={() => setOutputTab("html")}
                    type="button"
                    className={`px-3 py-2 text-xs font-bold uppercase tracking-widest transition-colors duration-300 border-b-2 outline-none ${
                      outputTab === "html"
                        ? dark
                          ? "text-white border-white"
                          : "text-black border-black"
                        : dark
                        ? "text-zinc-500 border-transparent hover:text-white"
                        : "text-neutral-500 border-transparent hover:text-black"
                    }`}
                  >
                    HTML
                  </button>
                </div>

                {/* Code Display */}
                <div
                  className={`flex-1 min-h-full px-4 py-3 rounded-2xl border text-xs font-mono transition-all duration-300 overflow-auto ${
                    dark
                      ? "bg-zinc-950 border-zinc-800"
                      : "bg-neutral-50 border-neutral-300"
                  }`}
                >
                  <CodeBlock
                    code={outputTab === "css" ? currentCSS : currentHTML}
                    dark={dark}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlexboxGridGenerator;