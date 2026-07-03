import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

export default function RobotsTxtGenerator() {
  const { dark } = useTheme();

  const [userAgent, setUserAgent] = useState("*");
  const [allow, setAllow] = useState("/");
  const [disallow, setDisallow] = useState("/admin");
  const [crawlDelay, setCrawlDelay] = useState("");
  const [sitemap, setSitemap] = useState("");
  const [output, setOutput] = useState("");

    useEffect(() => {
    let result = `User-agent: ${userAgent}\n`;

    if (allow.trim()) {
      result += `Allow: ${allow}\n`;
    }

    if (disallow.trim()) {
      disallow
        .split("\n")
        .filter((line) => line.trim())
        .forEach((line) => {
          result += `Disallow: ${line.trim()}\n`;
        });
    }

    if (crawlDelay.trim()) {
      result += `Crawl-delay: ${crawlDelay}\n`;
    }

    if (sitemap.trim()) {
      result += `Sitemap: ${sitemap}\n`;
    }

    setOutput(result);
  }, [userAgent, allow, disallow, crawlDelay, sitemap]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    toast.success("robots.txt copied!");
  };
const handleDownload = () => {
  const blob = new Blob([output], {
    type: "text/plain;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "robots.txt";
  a.click();

  URL.revokeObjectURL(url);

  toast.success("Downloaded robots.txt");
};
  const loadSample = () => {
    setUserAgent("*");
    setAllow("/");
    setDisallow("/admin\n/private");
    setCrawlDelay("5");
    setSitemap("https://example.com/sitemap.xml");
  };

  const clearAll = () => {
    setUserAgent("*");
    setAllow("");
    setDisallow("");
    setCrawlDelay("");
    setSitemap("");
  };
  return (
  <div
    className={`min-h-screen p-6 ${
      dark ? "bg-zinc-950 text-white" : "bg-white text-black"
    }`}
  >
    <Link
      to="/devutilities"
      className="inline-block mb-6 px-4 py-2 rounded-xl border"
    >
      ← Back
    </Link>

    <h1 className="text-3xl font-bold">Robots.txt Generator</h1>

    <p className="opacity-70 mt-2">
      Generate robots.txt files instantly for your website.
    </p>

    <div className="grid lg:grid-cols-2 gap-6 mt-8">

      {/* Left Panel */}
      <div
        className={`rounded-xl border p-5 ${
          dark
            ? "bg-zinc-900 border-zinc-700"
            : "bg-white border-zinc-300"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">Configuration</h2>

        <div className="space-y-4">

          <input
            value={userAgent}
            onChange={(e) => setUserAgent(e.target.value)}
            placeholder="User-agent"
            className="w-full rounded border p-3"
          />

          <input
            value={allow}
            onChange={(e) => setAllow(e.target.value)}
            placeholder="Allow"
            className="w-full rounded border p-3"
          />

          <textarea
            value={disallow}
            onChange={(e) => setDisallow(e.target.value)}
            placeholder="Disallow (one path per line)"
            rows={4}
            className="w-full rounded border p-3"
          />

          <input
            value={crawlDelay}
            onChange={(e) => setCrawlDelay(e.target.value)}
            placeholder="Crawl Delay"
            className="w-full rounded border p-3"
          />

          <input
            value={sitemap}
            onChange={(e) => setSitemap(e.target.value)}
            placeholder="Sitemap URL"
            className="w-full rounded border p-3"
          />

          <div className="flex gap-3">

            <button
              onClick={loadSample}
              className="border rounded px-4 py-2"
            >
              Sample
            </button>

            <button
              onClick={clearAll}
              className="border rounded px-4 py-2"
            >
              Clear
            </button>

          </div>

        </div>
      </div>

      {/* Right Panel */}
      <div
        className={`rounded-xl border p-5 ${
          dark
            ? "bg-zinc-900 border-zinc-700"
            : "bg-white border-zinc-300"
        }`}
      >
        <div className="flex justify-between items-center mb-4">

          <h2 className="text-xl font-bold">
            robots.txt
          </h2>

          <div className="flex gap-2">
  <button onClick={handleCopy}>
    Copy
  </button>

  <button onClick={handleDownload}>
    Download
  </button>
</div>

        </div>

        <textarea
          readOnly
          value={output}
          className={`w-full h-96 rounded border p-4 font-mono ${
            dark
              ? "bg-zinc-950 border-zinc-700"
              : "bg-zinc-50 border-zinc-300"
          }`}
        />

      </div>

    </div>
  </div>
);
}