import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const FONTGRID = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10011", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10101", "10011", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  0: ["01110", "10011", "10101", "10101", "11001", "10001", "01110"],
  1: ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  2: ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  3: ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  4: ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  5: ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  6: ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  7: ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  8: ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  9: ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  ":": ["00000", "00100", "00000", "00000", "00000", "00100", "00000"],
  ";": ["00000", "00100", "00000", "00000", "00000", "00100", "01000"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  '"': ["01010", "01010", "10100", "00000", "00000", "00000", "00000"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "@": ["01110", "10001", "10111", "10101", "10111", "10000", "01111"],
  "#": ["01010", "11111", "01010", "01010", "11111", "01010", "00000"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  "?": ["01110", "10001", "00001", "00010", "00100", "00000", "00100"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
};

const glyphFor = (char) => FONTGRID[char.toUpperCase()] || FONTGRID[" "];


const BlockOutline_GLYPHS = {
  "A": [
    "  █████╗  ",
    " ██╔══██╗ ",
    " ███████║ ",
    " ██╔══██║ ",
    " ██║  ██║ ",
    " ╚═╝  ╚═╝ ",
    "          ",
    "          "
  ],
  "B": [
    " ██████╗  ",
    " ██╔══██╗ ",
    " ██████╔╝ ",
    " ██╔══██╗ ",
    " ██████╔╝ ",
    " ╚═════╝  ",
    "          ",
    "          "
  ],
  "C": [
    "  ██████╗ ",
    " ██╔════╝ ",
    " ██║      ",
    " ██║      ",
    " ╚██████╗ ",
    "  ╚═════╝ ",
    "          ",
    "          "
  ],
  "D": [
    " ██████╗  ",
    " ██╔══██╗ ",
    " ██║  ██║ ",
    " ██║  ██║ ",
    " ██████╔╝ ",
    " ╚═════╝  ",
    "          ",
    "          "
  ],
  "E": [
    " ███████╗ ",
    " ██╔════╝ ",
    " █████╗   ",
    " ██╔══╝   ",
    " ███████╗ ",
    " ╚══════╝ ",
    "          ",
    "          "
  ],
  "F": [
    " ███████╗ ",
    " ██╔════╝ ",
    " █████╗   ",
    " ██╔══╝   ",
    " ██║      ",
    " ╚═╝      ",
    "          ",
    "          "
  ],
  "G": [
    "  ██████╗ ",
    " ██╔════╝ ",
    " ██║  ███╗",
    " ██║   ██║",
    " ╚██████╔╝",
    "  ╚═════╝ ",
    "          ",
    "          "
  ],
  "H": [
    " ██╗  ██╗",
    " ██║  ██║",
    " ███████║",
    " ██╔══██║",
    " ██║  ██║",
    " ╚═╝  ╚═╝",
    "         ",
    "         "
  ],
  "I": [
    " ██████╗ ",
    " ╚═██╔═╝ ",
    "   ██║   ",
    "   ██║   ",
    " ██████╗ ",
    " ╚═════╝ ",
    "         ",
    "         "
  ],
  "J": [
    "      ██╗ ",
    "      ██║ ",
    "      ██║ ",
    " ██   ██║ ",
    " ╚█████╔╝ ",
    "  ╚════╝  ",
    "          ",
    "          "
  ],
  "K": [
    " ██╗ ██╗",
    " ██║██╔╝",
    " █████╔╝ ",
    " ██╔═██╗ ",
    " ██║  ██╗",
    " ╚═╝  ╚═╝",
    "         ",
    "         "
  ],
  "L": [
    "  ██╗     ",
    "  ██║     ",
    "  ██║     ",
    "  ██║     ",
    "  ███████╗",
    "  ╚══════╝",
    "          ",
    "          "
  ],
  "M": [
    "  ███╗   ███╗ ",
    "  ████╗ ████║ ",
    "  ██╔████╔██║ ",
    "  ██║╚██╔╝██║ ",
    "  ██║ ╚═╝ ██║ ",
    "  ╚═╝     ╚═╝ ",
    "              ",
    "              "
  ],
  "N": [
    " ██╗   ██╗",
    " ████╗ ██║",
    " ██╔██╗██║",
    " ██║╚████║",
    " ██║ ╚███║",
    " ╚═╝  ╚══╝",
    "          ",
    "          "
  ],
  "O": [
    "   ██████╗  ",
    "  ██╔═══██╗ ",
    "  ██║   ██║ ",
    "  ██║   ██║ ",
    "  ╚██████╔╝ ",
    "   ╚═════╝  ",
    "            ",
    "            "
  ],
  "P": [
    "  ██████╗  ",
    "  ██╔══██╗ ",
    "  ██████╔╝ ",
    "  ██╔═══╝  ",
    "  ██║      ",
    "  ╚═╝      ",
    "           ",
    "           "
  ],
  "Q": [
    "   ██████╗  ",
    "  ██╔═══██╗ ",
    "  ██║   ██║ ",
    "  ██║▄▄ ██║ ",
    "  ╚██████╔╝ ",
    "   ╚════▀▀  ",
    "            ",
    "            "
  ],
  "R": [
    "  ██████╗  ",
    "  ██╔══██╗ ",
    "  ██████╔╝ ",
    "  ██╔══██╗ ",
    "  ██║  ██║ ",
    "  ╚═╝  ╚═╝  ",
    "           ",
    "           "
  ],
  "S": [
    "  ███████╗ ",
    "  ██╔════╝ ",
    "  ███████╗ ",
    "  ╚════██║ ",
    "  ███████║ ",
    "  ╚══════╝ ",
    "           ",
    "           "
  ],
  "T": [
    "  ████████╗ ",
    "  ╚══██╔══╝ ",
    "     ██║    ",
    "     ██║    ",
    "     ██║    ",
    "     ╚═╝    ",
    "            ",
    "            "
  ],
  "U": [
    "  ██╗  ██╗ ",
    "  ██║  ██║ ",
    "  ██║  ██║ ",
    "  ██║  ██║ ",
    "  ╚██████╔╝ ",
    "   ╚═════╝  ",
    "            ",
    "            "
  ],
  "V": [
    "  ██╗   ██╗ ",
    "  ██║   ██║ ",
    "  ██║   ██║ ",
    "  ╚██╗ ██╔╝ ",
    "   ╚████╔╝  ",
    "    ╚═══╝   ",
    "            ",
    "            "
  ],
  "W": [
    " ██╗   ██╗ ",
    " ██║   ██║ ",
    " ██║ █╗██║ ",
    " ████████║ ",
    " ███╔╝███║ ",
    " ╚══╝ ╚══╝ ",
    "           ",
    "           "
  ],
  "X": [
    "  ██╗  ██╗ ",
    "  ╚██╗██╔╝ ",
    "   ╚███╔╝  ",
    "   ██╔██╗  ",
    "  ██╔╝ ██╗ ",
    "  ╚═╝  ╚═╝ ",
    "           ",
    "           "
  ],
  "Y": [
    "  ██╗  ██╗ ",
    "  ╚██╗██╔╝ ",
    "   ╚███╔╝  ",
    "    ██║    ",
    "    ██║    ",
    "    ╚═╝    ",
    "           ",
    "           "
  ],
  "Z": [
    "  ███████╗ ",
    "  ╚══███╔╝ ",
    "    ███╔╝  ",
    "   ███╔╝   ",
    "  ███████╗ ",
    "  ╚══════╝ ",
    "           ",
    "           "
  ],
  " ": [
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        "
  ],
  "0": [
    "   ██████╗  ",
    "  ██╔═══██╗ ",
    "  ██║   ██║ ",
    "  ██║   ██║ ",
    "  ╚██████╔╝ ",
    "   ╚═════╝  ",
    "            ",
    "            "
  ],
  "1": [
    "  ██╗   ",
    " ███║   ",
    " ╚██║   ",
    "  ██║   ",
    "  ██║   ",
    "  ╚═╝   ",
    "        ",
    "        "
  ],
  "2": [
    "  ██████╗  ",
    "  ╚════██╗ ",
    "   █████╔╝ ",
    "  ██╔═══╝  ",
    "  ███████╗ ",
    "  ╚══════╝ ",
    "           ",
    "           "
  ],
  "3": [
    "  ██████╗  ",
    "  ╚════██╗ ",
    "   █████╔╝ ",
    "   ╚═══██╗ ",
    "  ██████╔╝ ",
    "  ╚═════╝  ",
    "           ",
    "           "
  ],
  "4": [
    "  ██╗  ██╗ ",
    "  ██║  ██║ ",
    "  ███████║ ",
    "  ╚════██║ ",
    "       ██║ ",
    "       ╚═╝ ",
    "           ",
    "           "
  ],
  "5": [
    "  ███████╗ ",
    "  ██╔════╝ ",
    "  ███████╗ ",
    "  ╚════██║ ",
    "  ███████║ ",
    "  ╚══════╝ ",
    "           ",
    "           "
  ],
  "6": [
    "  ██████╗  ",
    "  ██╔════╝ ",
    "  ███████╗ ",
    "  ██╔═══██╗",
    "  ╚██████╔╝",
    "   ╚═════╝ ",
    "           ",
    "           "
  ],
  "7": [
    "  ████████╗ ",
    "  ╚═══███╔╝ ",
    "     ███╔╝  ",
    "    ███╔╝   ",
    "    ███╔╝   ",
    "    ╚══╝    ",
    "            ",
    "            "
  ],
  "8": [
    "   ██████╗  ",
    "  ██╔═══██╗ ",
    "  ╚█████╔╝  ",
    "  ██╔═══██╗ ",
    "  ╚██████╔╝ ",
    "   ╚═════╝  ",
    "            ",
    "            "
  ],
  "9": [
    "  ██████╗ ",
    " ██╔═══██╗",
    " ██║   ██║",
    " ╚███████║",
    "  ╚════██║",
    "  ██████╔╝",
    "  ╚═════╝ ",
    "          "
  ],
"!": [
    " ██╗",
    " ██║",
    " ██║",
    " ██║",
    " ╚═╝",
    " ██╗",
    " ╚═╝",
    "    "
  ],
"?": [
    " ██████╗ ",
    " ╚════██╗",
    "  ▄███╔═╝",
    "  ▀▀══╝  ",
    "    ██╗  ",
    "    ╚═╝  ",
    "         ",
    "         "
  ],
".": [
    "    ",
    "    ",
    "    ",
    "    ",
    " ██╗",
    " ╚═╝",
    "    ",
    "    "
  ],
",": [
    "     ",
    "     ",
    "     ",
    "     ",
    " ██╗ ",
    " ╚██╗",
    "  ╚═╝",
    "     "
  ],
"-": [
    "          ",
    "          ",
    "          ",
    " ███████╗ ",
    " ╚══════╝ ",
    "          ",
    "          ",
    "          "
  ],
"_": [
    "          ",
    "          ",
    "          ",
    "          ",
    "          ",
    "          ",
    " ███████╗ ",
    " ╚══════╝ "
  ],
};

const BlockOutlineGlyphFor = (char) =>
  BlockOutline_GLYPHS[char.toUpperCase()] || BlockOutline_GLYPHS[" "];

// ---- Font style renderers ---------------------------------------------------
const FONTS = {
  Block: (line, fill) => {
    const glyphs = line.split("").map(glyphFor);
    const rows = [];
    for (let r = 0; r < 7; r++) {
      let out = "";
      glyphs.forEach((glyph) => {
        for (const bit of glyph[r]) out += bit === "1" ? fill + fill : "  ";
        out += " ";
      });
      rows.push(out.trimEnd());
    }
    return rows.join("\n");
  },
  Standard: (line, fill) => {
    const glyphs = line.split("").map(glyphFor);
    const rows = [];
    for (let r = 0; r < 7; r++) {
      let out = "";
      glyphs.forEach((glyph) => {
        for (const bit of glyph[r]) out += bit === "1" ? fill : " ";
        out += " ";
      });
      rows.push(out.trimEnd());
    }
    return rows.join("\n");
  },
  "ANSI Shadow": (line, fill) => {
    const shadowChar = "\u2591";
    const glyphs = line.split("").map(glyphFor);
    const glyphWidth = 5 * 2;
    const gap = 1;
    const totalWidth = glyphs.length * (glyphWidth + gap) + 1;
    const totalHeight = 7 + 1;
    const grid = Array.from({ length: totalHeight }, () =>
      Array(totalWidth).fill(" ")
    );

    let colOffset = 0;
    glyphs.forEach((glyph) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 5; c++) {
          if (glyph[r][c] === "1") {
            const sc = colOffset + c * 2 + 1;
            grid[r + 1][sc] = shadowChar;
            grid[r + 1][sc + 1] = shadowChar;
          }
        }
      }
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 5; c++) {
          if (glyph[r][c] === "1") {
            const mc = colOffset + c * 2;
            grid[r][mc] = fill;
            grid[r][mc + 1] = fill;
          }
        }
      }
      colOffset += glyphWidth + gap;
    });

    return grid.map((row) => row.join("").replace(/\s+$/, "")).join("\n");
  },
  
  "BlockOutline": (line) => {
    const glyphs = line.split("").map((char) => {
      const raw = BlockOutlineGlyphFor(char);
      const width = Math.max(...raw.map((row) => row.length));
      return raw.map((row) => row.padEnd(width, " "));
    });
    const rows = [];
    for (let r = 0; r < 7; r++) {
      let out = "";
      glyphs.forEach((g) => (out += g[r]));
      rows.push(out);
    }
    while (rows.length && rows[rows.length - 1].trim() === "") rows.pop();
    return rows.map((row) => row.replace(/\s+$/, "")).join("\n");
  },
};

const FONTS_WITHOUT_FILL = new Set(["BlockOutline"]);

function generateBanner(text, font, fill) {
  const safeFill = fill && fill.trim() ? fill.trim()[0] : "#";
  const cleanText = text || "";
  const renderer = FONTS[font] || FONTS.Standard;
  return renderer(cleanText, safeFill);
}

const FILL_PRESETS = ["\u2588", "\u2593", "#", "*", "@"];

// ---- Component ---------------------------------------------------------------

const AsciiArtGenerator = () => {
  const { dark } = useTheme();

  const [text, setText] = useState("DevTasks");
  const [font, setFont] = useState("Block");
  const [fillChar, setFillChar] = useState("\u2588");

  const handleClear = () => {
    setText("");
  };

  const output = useMemo(
    () => generateBanner(text, font, fillChar),
    [text, font, fillChar]
  );

  const fillDisabled = FONTS_WITHOUT_FILL.has(font);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Banner copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ascii-banner.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded ascii-banner.txt");
  };

  const inputClass = `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all duration-300 ${
    dark
      ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 focus:border-white focus:ring-1 focus:ring-white"
      : "bg-white border-neutral-300 text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black"
  }`;

  const labelClass = `text-xs font-black uppercase tracking-widest ${
    dark ? "text-zinc-400" : "text-neutral-500"
  }`;

  return (
    <div
      className={`min-h-[calc(100vh-76px)] md:h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto overflow-x-hidden md:overflow-hidden relative flex flex-col justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>ASCII Art Generator — DevTasks</title>
      <meta
        name="description"
        content="Convert text strings into custom ASCII art banners for code comments and terminals."
      />

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

      <div
        className={`relative z-10 w-full max-w-5xl md:mx-auto rounded-[32px] border shadow-xl flex flex-col max-h-full md:max-h-[85vh] overflow-hidden transition-all duration-300 ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        <div
          className={`h-2 w-full transition-colors duration-500 ${
            dark ? "bg-white" : "bg-black"
          }`}
        />

        {/* Header */}
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 flex items-center gap-3 w-full min-w-0">
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
            className={`text-xl sm:text-2xl font-black uppercase tracking-tight transition-colors duration-300 min-w-0 flex-1 ${
              dark ? "text-white" : "text-black"
            }`}
          >
            ASCII Art Generator
          </h1>
        </div>

        {/* Content Wrapper */}
        <div className="w-full flex-1 min-h-0 pt-2 pb-5 sm:pb-8 px-5 sm:px-8 flex flex-col gap-4">
          {/* Text input */}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type something..."
            maxLength={60}
            className={inputClass}
          />

          {/* Toolbar: Font + Fill + Clear */}
          <div
            className={`rounded-2xl border px-4 py-3 flex flex-col gap-3 ${
              dark
                ? "bg-zinc-950 border-zinc-800"
                : "bg-neutral-50 border-neutral-200"
            }`}
          >
            {/* Font row */}
            <div className="flex flex-wrap items-center gap-3">
              <span className={labelClass}>Font</span>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(FONTS).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFont(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      font === f
                        ? "border-pink-500 text-pink-500 bg-pink-500/10"
                        : dark
                        ? "border-transparent text-zinc-400 hover:text-white"
                        : "border-transparent text-neutral-500 hover:text-black"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Fill row */}
            <div className="flex flex-wrap items-center gap-3">
              <span className={labelClass}>
                Fill{fillDisabled ? " (n/a)" : ""}
              </span>
              <div
                className={`flex flex-wrap items-center gap-1.5 transition-opacity ${
                  fillDisabled ? "opacity-40 pointer-events-none" : ""
                }`}
              >
                {FILL_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setFillChar(preset)}
                    disabled={fillDisabled}
                    title={`Fill with "${preset}"`}
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-mono transition-colors ${
                      fillChar === preset
                        ? "border-pink-500 text-pink-500 bg-pink-500/10"
                        : dark
                        ? "border-zinc-800 text-zinc-300 hover:border-zinc-600"
                        : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <button
                onClick={handleClear}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ml-auto ${
                  dark
                    ? "text-zinc-400 hover:text-white"
                    : "text-neutral-500 hover:text-black"
                }`}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9.5 3h5a1 1 0 011 1v2h-7V4a1 1 0 011-1z"
                  />
                </svg>
                Clear
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <label className={labelClass}>Preview</label>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                    dark
                      ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                      : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                  }`}
                >
                  Copy
                </button>
                <button
                  onClick={handleDownload}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                    dark
                      ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                      : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                  }`}
                >
                  Download
                </button>
              </div>
            </div>

            <div className="relative flex-1 flex flex-col rounded-2xl overflow-hidden border bg-[#0D1117] border-zinc-800 shadow-inner min-h-[280px] overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 px-4 py-3 bg-[#161B22] border-b border-zinc-800 sticky top-0">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <pre className="flex-1 p-5 overflow-auto font-mono text-sm text-emerald-400 whitespace-pre leading-tight">
                {output}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsciiArtGenerator;