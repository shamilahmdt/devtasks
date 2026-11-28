import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import figlet from "figlet";
import { useTheme } from "../../../context/ThemeContext";
import Standard from "figlet/importable-fonts/Standard.js";
import Slant from "figlet/importable-fonts/Slant.js";
import Big from "figlet/importable-fonts/Big.js";
import Small from "figlet/importable-fonts/Small.js";
import Block from "figlet/importable-fonts/Block.js";
import Banner from "figlet/importable-fonts/Banner.js";
import Doom from "figlet/importable-fonts/Doom.js";
import Shadow from "figlet/importable-fonts/Shadow.js";
import ThreeD from "figlet/importable-fonts/3-D.js";
import Graffiti from "figlet/importable-fonts/Graffiti.js";
import AnsiShadow from "figlet/importable-fonts/ANSI Shadow.js";
import Speed from "figlet/importable-fonts/Speed.js";
import StarWars from "figlet/importable-fonts/Star Wars.js";
import Ghost from "figlet/importable-fonts/Ghost.js";
import Isometric1 from "figlet/importable-fonts/Isometric1.js";

const BUNDLED_FONTS = {
  Standard,
  Slant,
  Big,
  Small,
  Block,
  Banner,
  Doom,
  Shadow,
  "3-D": ThreeD,
  Graffiti,
  "ANSI Shadow": AnsiShadow,
  Speed,
  "Star Wars": StarWars,
  Ghost,
  Isometric1,
};

Object.entries(BUNDLED_FONTS).forEach(([name, data]) => {
  figlet.parseFont(name, data);
});

const FONT_NAMES = Object.keys(BUNDLED_FONTS);

function FigletGenerator() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [text, setText] = useState("Hello");
  const [font, setFont] = useState("Standard");
  const [output, setOutput] = useState("");
  const fonts = FONT_NAMES;

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: isDark ? "#171717" : "#ffffff",
      borderColor: state.isFocused
        ? isDark
          ? "#525252"
          : "#171717"
        : isDark
          ? "#262626"
          : "#e5e5e5",
      borderRadius: "0.75rem",
      padding: "0.25rem",
      boxShadow: "none",
      "&:hover": {
        borderColor: isDark ? "#525252" : "#171717",
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? "#171717" : "#ffffff",
      border: `1px solid ${isDark ? "#262626" : "#e5e5e5"}`,
      borderRadius: "0.75rem",
      overflow: "hidden",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? isDark
          ? "#ffffff"
          : "#171717"
        : state.isFocused
          ? isDark
            ? "#262626"
            : "#f5f5f5"
          : "transparent",
      color: state.isSelected
        ? isDark
          ? "#171717"
          : "#ffffff"
        : isDark
          ? "#e5e5e5"
          : "#171717",
      cursor: "pointer",
    }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? "#f5f5f5" : "#171717",
    }),
    input: (base) => ({
      ...base,
      color: isDark ? "#f5f5f5" : "#171717",
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: isDark ? "#262626" : "#e5e5e5",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: isDark ? "#a3a3a3" : "#737373",
      "&:hover": {
        color: isDark ? "#f5f5f5" : "#171717",
      },
    }),
  };

  useEffect(() => {
    if (!text.trim()) {
      setOutput("");
      return;
    }

    figlet.text(
      text,
      {
        font,
        horizontalLayout: "default",
        verticalLayout: "default"
      },
      (error, result) => {
        if (!error) {
          setOutput(result);
        }
      }
    );
  }, [text, font]);

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output);
  };

  const downloadOutput = () => {
    const blob = new Blob([output], {
      type: "text/plain"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "figlet-output.txt";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/devutilities"
          className={`mb-4 inline-flex items-center gap-2 text-sm font-medium transition ${
            isDark
              ? "text-neutral-400 hover:text-white"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          ← Back to Utilities
        </Link>

        <h1 className="mb-2 text-3xl font-bold">
          FIGlet Generator
        </h1>

        <p className="mb-6 text-gray-500">
          Generate ASCII text using FIGlet fonts.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block font-medium">
                Text
              </label>

              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text"
                className={`w-full rounded-xl border p-3 outline-none ${
                  isDark
                    ? "border-neutral-800 bg-neutral-900 text-neutral-100 focus:border-neutral-500"
                    : "border-neutral-200 bg-white text-neutral-900 focus:border-neutral-900"
                }`}
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Font
              </label>

              <Select
                value={{ value: font, label: font }}
                onChange={(option) => setFont(option.value)}
                options={fonts.map((fontName) => ({
                  value: fontName,
                  label: fontName,
                }))}
                styles={selectStyles}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-medium">Preview</h2>

              <div className="flex gap-2">
                <button
                  onClick={copyOutput}
                  disabled={!output}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${
                    isDark
                      ? "border-neutral-800 bg-neutral-900 text-neutral-100 hover:bg-neutral-800"
                      : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100"
                  }`}
                >
                  Copy
                </button>

                <button
                  onClick={downloadOutput}
                  disabled={!output}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${
                    isDark
                      ? "bg-white text-neutral-900 hover:bg-neutral-200"
                      : "bg-neutral-900 text-white hover:bg-neutral-800"
                  }`}
                >
                  Download
                </button>
              </div>
            </div>

            <pre
              className={`min-h-[250px] overflow-auto rounded-xl border p-4 font-mono ${
                isDark
                  ? "border-neutral-800 bg-neutral-900 text-neutral-100"
                  : "border-neutral-200 bg-white text-neutral-900"
              }`}
            >
              {output || "Your FIGlet output will appear here..."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FigletGenerator;