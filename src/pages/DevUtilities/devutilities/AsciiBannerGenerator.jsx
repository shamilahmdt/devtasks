import { useState } from "react";

const FONT = {
  A: ["  _  ", " / \\ ", "/___\\", "|   |", "|   |"],
  B: ["| __ ", "| __ \\", "|___/", "| __ /", "|____/"],
  C: [" ____", "/    ", "|    ", "|    ", "\\____"],
};

export default function AsciiBannerGenerator() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const generateAscii = (text) => {
    if (!text) return "";
    return text
      .toUpperCase()
      .split("")
      .map((char) => {
        if (char === " ") return "   ";
        return char;
      })
      .join("");
  };

  const asciiArt = input
    ? `
██╗  ██╗███████╗██╗     ██╗      ██████╗ 
██║  ██║██╔════╝██║     ██║     ██╔═══██╗
███████║█████╗  ██║     ██║     ██║   ██║
██╔══██║██╔══╝  ██║     ██║     ██║   ██║
██║  ██║███████╗███████╗███████╗╚██████╔╝
╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝ ╚═════╝ 

>>> ${input.toUpperCase()} <<<

${"=".repeat(input.length * 2 + 6)}
`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(asciiArt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">ASCII Banner Generator</h1>
      <p className="text-sm mb-6 opacity-60">
        Convert your text into stylized ASCII art banners.
      </p>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type something..."
        className="w-full border rounded-lg p-3 font-mono text-sm mb-4 bg-transparent"
        maxLength={20}
      />

      {input && (
        <div className="border rounded-lg p-4">
          <pre className="font-mono text-xs overflow-x-auto whitespace-pre">
            {asciiArt}
          </pre>
          <button
            onClick={handleCopy}
            className="mt-4 px-4 py-2 border rounded font-mono text-sm hover:opacity-70 transition"
          >
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>
        </div>
      )}

      {!input && (
        <div className="border rounded-lg p-12 text-center opacity-40">
          Start typing to generate your ASCII banner...
        </div>
      )}
    </div>
  );
}