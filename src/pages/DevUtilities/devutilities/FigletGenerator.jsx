import { useEffect, useState } from "react";
import figlet from "figlet";

function FigletGenerator() {
  const [text, setText] = useState("Hello");
  const [font, setFont] = useState("Standard");
  const [output, setOutput] = useState("");
  const [fonts, setFonts] = useState([]);

  useEffect(() => {
    figlet.fonts((error, availableFonts) => {
      if (!error) {
        setFonts(availableFonts);
      }
    });
  }, []);

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
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Font
              </label>

              <select
                value={font}
                onChange={(e) => setFont(e.target.value)}
                className="w-full rounded-lg border p-3"
              >
                {fonts.map((fontName) => (
                  <option key={fontName} value={fontName}>
                    {fontName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-medium">Preview</h2>

              <div className="flex gap-2">
                <button
                  onClick={copyOutput}
                  disabled={!output}
                  className="rounded-lg border px-3 py-2 disabled:opacity-50"
                >
                  Copy
                </button>

                <button
                  onClick={downloadOutput}
                  disabled={!output}
                  className="rounded-lg border px-3 py-2 disabled:opacity-50"
                >
                  Download
                </button>
              </div>
            </div>

            <pre className="min-h-[250px] overflow-auto rounded-lg border p-4 font-mono">
              {output || "Your FIGlet output will appear here..."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FigletGenerator;