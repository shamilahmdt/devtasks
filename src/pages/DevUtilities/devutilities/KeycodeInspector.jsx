import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

const KeyboardKey = ({ label, code, activeCode, activeClass, inactiveClass, className = "", width = "w-8 md:w-10 lg:w-12", height = "h-8 md:h-10 lg:h-12" }) => {
  const isActive = activeCode === code;
  const widthClass = width || "w-8 md:w-10 lg:w-12";
  const heightClass = height || "h-8 md:h-10 lg:h-12";

  return (
    <div
      className={`border rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-100 ${heightClass} ${widthClass} ${
        isActive ? activeClass : inactiveClass
      } ${className}`}
    >
      {label}
    </div>
  );
};

export default function KeycodeInspector() {
  const { dark } = useTheme();

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      card: "bg-white border-zinc-200/85 shadow-sm",
      cardSoft: "bg-zinc-50 border-zinc-200/85",
      border: "border-zinc-200",
      textMuted: "text-zinc-500",
      activeKey: "bg-black text-white border-black shadow-[0_4px_12px_rgba(0,0,0,0.15)] scale-[0.97]",
      inactiveKey: "bg-white border-zinc-250 text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50",
      modifierActive: "bg-black text-white border-black font-black",
      modifierInactive: "bg-white border-zinc-250 text-zinc-500",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      card: "bg-zinc-900/40 border-zinc-800/85 backdrop-blur-md shadow-lg",
      cardSoft: "bg-zinc-950/50 border-zinc-800/80",
      border: "border-zinc-850",
      textMuted: "text-zinc-500",
      activeKey: "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.35)] scale-[0.97]",
      inactiveKey: "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800/80",
      modifierActive: "bg-white text-black border-white font-black",
      modifierInactive: "bg-zinc-900/60 border-zinc-800 text-zinc-500",
    },
  };

  const t = dark ? theme.dark : theme.light;

  const [eventData, setEventData] = useState({
    key: "Press any key",
    code: "-",
    keyCode: "-",
    location: "-",
    ctrl: false,
    shift: false,
    alt: false,
    meta: false,
  });

  const [history, setHistory] = useState([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target.tagName;

      // Don't intercept if typing in input/textarea
      if (
        target === "INPUT" ||
        target === "TEXTAREA" ||
        e.target.isContentEditable
      ) {
        return;
      }

      // Prevent default browser actions for keys that scroll or navigate
      if (["Space", "ArrowUp", "ArrowDown", "Tab", "Backspace"].includes(e.code)) {
        e.preventDefault();
      }

      const locationText =
        e.location === 0
          ? "Standard"
          : e.location === 1
          ? "Left"
          : e.location === 2
          ? "Right"
          : "Numpad";

      setEventData({
        key: e.key === " " ? "Space" : e.key,
        code: e.code,
        keyCode: e.keyCode || e.which,
        location: locationText,
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
        meta: e.metaKey,
      });

      setHistory((prev) => [
        {
          key: e.key === " " ? "Space" : e.key,
          code: e.code,
          keyCode: e.keyCode || e.which,
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ].slice(0, 10));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Keyboard Rows definition
  const keyboardRows = [
    // Row 0 (Function Row)
    [
      { label: "Esc", code: "Escape", width: "w-10 md:w-12" },
      { label: "", code: "Spacer1", width: "w-2 md:w-4", isSpacer: true },
      { label: "F1", code: "F1" },
      { label: "F2", code: "F2" },
      { label: "F3", code: "F3" },
      { label: "F4", code: "F4" },
      { label: "", code: "Spacer2", width: "w-2 md:w-4", isSpacer: true },
      { label: "F5", code: "F5" },
      { label: "F6", code: "F6" },
      { label: "F7", code: "F7" },
      { label: "F8", code: "F8" },
      { label: "", code: "Spacer3", width: "w-2 md:w-4", isSpacer: true },
      { label: "F9", code: "F9" },
      { label: "F10", code: "F10" },
      { label: "F11", code: "F11" },
      { label: "F12", code: "F12" },
    ],
    // Row 1 (Numbers & Backtick)
    [
      { label: "`", code: "Backquote" },
      { label: "1", code: "Digit1" },
      { label: "2", code: "Digit2" },
      { label: "3", code: "Digit3" },
      { label: "4", code: "Digit4" },
      { label: "5", code: "Digit5" },
      { label: "6", code: "Digit6" },
      { label: "7", code: "Digit7" },
      { label: "8", code: "Digit8" },
      { label: "9", code: "Digit9" },
      { label: "0", code: "Digit0" },
      { label: "-", code: "Minus" },
      { label: "=", code: "Equal" },
      { label: "⌫", code: "Backspace", width: "flex-1 min-w-[40px]" },
    ],
    // Row 2 (QWERTY)
    [
      { label: "Tab", code: "Tab", width: "w-12 md:w-14" },
      { label: "Q", code: "KeyQ" },
      { label: "W", code: "KeyW" },
      { label: "E", code: "KeyE" },
      { label: "R", code: "KeyR" },
      { label: "T", code: "KeyT" },
      { label: "Y", code: "KeyY" },
      { label: "U", code: "KeyU" },
      { label: "I", code: "KeyI" },
      { label: "O", code: "KeyO" },
      { label: "P", code: "KeyP" },
      { label: "[", code: "BracketLeft" },
      { label: "]", code: "BracketRight" },
      { label: "\\", code: "Backslash" },
    ],
    // Row 3 (ASDF)
    [
      { label: "Caps", code: "CapsLock", width: "w-14 md:w-16" },
      { label: "A", code: "KeyA" },
      { label: "S", code: "KeyS" },
      { label: "D", code: "KeyD" },
      { label: "F", code: "KeyF" },
      { label: "G", code: "KeyG" },
      { label: "H", code: "KeyH" },
      { label: "J", code: "KeyJ" },
      { label: "K", code: "KeyK" },
      { label: "L", code: "KeyL" },
      { label: ";", code: "Semicolon" },
      { label: "'", code: "Quote" },
      { label: "Enter", code: "Enter", width: "flex-1 min-w-[55px]" },
    ],
    // Row 4 (ZXCV)
    [
      { label: "Shift", code: "ShiftLeft", width: "w-16 md:w-20" },
      { label: "Z", code: "KeyZ" },
      { label: "X", code: "KeyX" },
      { label: "C", code: "KeyC" },
      { label: "V", code: "KeyV" },
      { label: "B", code: "KeyB" },
      { label: "N", code: "KeyN" },
      { label: "M", code: "KeyM" },
      { label: ",", code: "Comma" },
      { label: ".", code: "Period" },
      { label: "/", code: "Slash" },
      { label: "Shift", code: "ShiftRight", width: "flex-1 min-w-[60px]" },
    ],
    // Row 5 (Modifiers & Space)
    [
      { label: "Ctrl", code: "ControlLeft", width: "w-10 md:w-12" },
      { label: "Win", code: "MetaLeft", width: "w-10 md:w-12" },
      { label: "Alt", code: "AltLeft", width: "w-10 md:w-12" },
      { label: "Space", code: "Space", width: "flex-[4] min-w-[100px]" },
      { label: "Alt", code: "AltRight", width: "w-10 md:w-12" },
      { label: "Win", code: "MetaRight", width: "w-10 md:w-12" },
      { label: "Ctrl", code: "ControlRight", width: "w-10 md:w-12" },
    ],
  ];

  const renderKey = (label, code, className = "", width = "", height = "", isSpacer = false) => {
    if (isSpacer) {
      return <div key={code} className={`${width || "w-4"} h-1`} />;
    }
    return (
      <KeyboardKey
        label={label}
        code={code}
        activeCode={eventData.code}
        activeClass={t.activeKey}
        inactiveClass={t.inactiveKey}
        className={className}
        width={width}
        height={height}
      />
    );
  };
  return (
    <div
      className={`relative min-h-screen p-4 sm:p-6 font-sans antialiased transition-colors duration-300 overflow-x-hidden ${
        dark ? "bg-zinc-950" : "bg-[#FDFDFD]"
      }`}
    >
      <title>Keycode Inspector — DevTasks</title>
      <meta
        name="description"
        content="Inspect keyboard event keycodes, locations, modifier states, and view an interactive ANSI desktop keyboard layout."
      />

      {/* Decorative Blobs */}
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

      {/* Card Wrapper */}
      <div
        className={`relative z-10 w-full max-w-7xl mx-auto rounded-[32px] border shadow-xl flex flex-col overflow-hidden transition-all duration-300 ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        {/* Top Accent Line */}
        <div
          className={`h-2 w-full transition-colors duration-500 ${
            dark ? "bg-white" : "bg-black"
          }`}
        />

        {/* Header */}
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 flex items-center gap-3">
          <Link
            to="/devutilities"
            className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${
              dark
                ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                : "bg-white border-neutral-200 text-neutral-600 hover:text-black"
            }`}
            title="Back to Workspace"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>

          <div className="min-w-0">
            <h1
              className={`text-xl sm:text-2xl font-black uppercase tracking-tight transition-colors duration-300 ${
                dark ? "text-white" : "text-black"
              }`}
            >
              Keycode Inspector
            </h1>
            <p className={`text-sm mt-1 ${t.textMuted}`}>
              Press any key on your keyboard to inspect its event values, keycode, and modifier states.
            </p>
          </div>
        </div>

        {/* Top Section: Details & History */}
        <div className="px-5 sm:px-8 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left Column: Giant Display & Modifiers */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              
              {/* Giant Keycode Display */}
              <div className={`p-4 border rounded-3xl flex flex-col sm:flex-row items-center gap-4 ${t.card}`}>
                
                {/* Big Circle/Square Code Display */}
                <div className={`w-20 h-20 shrink-0 rounded-2xl border flex flex-col items-center justify-center ${t.cardSoft}`}>
                  <span className={`text-[8px] font-black uppercase tracking-wider ${t.textMuted}`}>
                    event.keyCode
                  </span>
                  <span className="text-3xl font-black tracking-tight mt-0.5 tabular-nums">
                    {eventData.keyCode}
                  </span>
                </div>

                {/* Data Table */}
                <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2">
                  {[
                    { label: "event.key", value: eventData.key },
                    { label: "event.code", value: eventData.code },
                    { label: "event.location", value: eventData.location },
                    { label: "event.which", value: eventData.keyCode },
                  ].map((item) => (
                    <div key={item.label} className="min-w-0">
                      <div className={`text-[8px] font-black uppercase tracking-wider ${t.textMuted}`}>
                        {item.label}
                      </div>
                      <div className="text-sm font-bold mt-0.5 truncate font-mono">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modifier Keys State */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: "Ctrl", active: eventData.ctrl },
                  { name: "Shift", active: eventData.shift },
                  { name: "Alt", active: eventData.alt },
                  { name: "Meta / Win", active: eventData.meta },
                ].map((mod) => (
                  <div
                    key={mod.name}
                    className={`border rounded-xl py-1.5 px-3 text-center text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                      mod.active ? t.modifierActive : t.modifierInactive
                    }`}
                  >
                    {mod.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: History Log */}
            <div className={`border rounded-3xl p-4 flex flex-col h-[148px] ${t.card}`}>
              <h3 className="text-xs font-black uppercase tracking-wider mb-2">
                Key Event History
              </h3>
              
              <div className={`flex-1 min-h-0 overflow-y-auto divide-y pr-1 ${dark ? "divide-zinc-800/60" : "divide-zinc-200"}`}>
                {history.length === 0 ? (
                  <div className={`p-4 text-center text-xs font-medium ${t.textMuted} h-full flex items-center justify-center`}>
                    Press any key to record history log...
                  </div>
                ) : (
                  history.map((item, index) => (
                    <div
                      key={index}
                      className="py-1.5 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div>
                          <p className="font-bold truncate">{item.key}</p>
                          <p className={`text-[8px] ${t.textMuted}`}>{item.code}</p>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0 ml-2">
                        <span className="font-bold tabular-nums">
                          {item.keyCode}
                        </span>
                        <p className={`text-[7px] ${t.textMuted}`}>
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Visual Keyboard (Full Width, Bottom) */}
        <div className="px-5 sm:px-8 py-6 sm:py-8">
          <div className={`p-5 border rounded-3xl hidden md:flex flex-col gap-2.5 ${t.card}`}>
            <div className="flex justify-between items-center mb-2 px-1">
              <h3 className="text-xs font-black uppercase tracking-wider">
                Interactive Keyboard Layout
              </h3>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${t.textMuted}`}>
                Full Desktop Layout
              </span>
            </div>

            <div className="flex gap-4 lg:gap-6 justify-between items-start w-full select-none">
              {/* Main Keyboard */}
              <div className="flex flex-col gap-1.5 md:gap-2 flex-1 min-w-[550px]">
                {keyboardRows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-1.5 md:gap-2 w-full justify-between">
                    {row.map((key) => renderKey(key.label, key.code, "", key.width, "", key.isSpacer))}
                  </div>
                ))}
              </div>

              {/* Vertical Divider */}
              <div className={`w-[1px] self-stretch ${dark ? "bg-zinc-800" : "bg-zinc-200"}`} />

              {/* Navigation & Arrow Cluster */}
              <div className="grid grid-cols-3 gap-1.5 md:gap-2 w-[100px] md:w-[115px] lg:w-[135px] shrink-0">
                {/* Row 0: Print Screen, Scroll Lock, Pause */}
                {renderKey("Prt", "PrintScreen", "", "w-full")}
                {renderKey("Scr", "ScrollLock", "", "w-full")}
                {renderKey("Pse", "Pause", "", "w-full")}

                {/* Row 1: Insert, Home, PageUp */}
                {renderKey("Ins", "Insert", "", "w-full")}
                {renderKey("Hm", "Home", "", "w-full")}
                {renderKey("PU", "PageUp", "", "w-full")}

                {/* Row 2: Delete, End, PageDown */}
                {renderKey("Del", "Delete", "", "w-full")}
                {renderKey("End", "End", "", "w-full")}
                {renderKey("PD", "PageDown", "", "w-full")}

                {/* Row 3: Spacer */}
                <div className="col-span-3 h-8 md:h-10 lg:h-12" />

                {/* Row 4: Arrow Up */}
                <div />
                {renderKey("▲", "ArrowUp", "", "w-full")}
                <div />

                {/* Row 5: Arrow Left, Down, Right */}
                {renderKey("◀", "ArrowLeft", "", "w-full")}
                {renderKey("▼", "ArrowDown", "", "w-full")}
                {renderKey("▶", "ArrowRight", "", "w-full")}
              </div>

              {/* Vertical Divider */}
              <div className={`w-[1px] self-stretch ${dark ? "bg-zinc-800" : "bg-zinc-200"}`} />

              {/* Numpad */}
              <div className="grid grid-cols-4 gap-1.5 md:gap-2 w-[140px] md:w-[160px] lg:w-[185px] shrink-0">
                {/* Row 1 */}
                {renderKey("Num", "NumLock", "", "w-full")}
                {renderKey("/", "NumpadDivide", "", "w-full")}
                {renderKey("*", "NumpadMultiply", "", "w-full")}
                {renderKey("-", "NumpadSubtract", "", "w-full")}

                {/* Row 2 & 3 */}
                {renderKey("7", "Numpad7", "", "w-full")}
                {renderKey("8", "Numpad8", "", "w-full")}
                {renderKey("9", "Numpad9", "", "w-full")}
                {renderKey("+", "NumpadAdd", "row-span-2", "w-full", "h-full")}

                {renderKey("4", "Numpad4", "", "w-full")}
                {renderKey("5", "Numpad5", "", "w-full")}
                {renderKey("6", "Numpad6", "", "w-full")}

                {/* Row 4 & 5 */}
                {renderKey("1", "Numpad1", "", "w-full")}
                {renderKey("2", "Numpad2", "", "w-full")}
                {renderKey("3", "Numpad3", "", "w-full")}
                {renderKey("Enter", "NumpadEnter", "row-span-2", "w-full", "h-full")}

                {renderKey("0", "Numpad0", "col-span-2", "w-full")}
                {renderKey(".", "NumpadDecimal", "", "w-full")}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}