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

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      card: "bg-white border-zinc-250/90 shadow-sm",
      headerBorder: "border-zinc-200",
      input: "bg-white border-zinc-250 text-zinc-900 focus:border-zinc-900 placeholder-zinc-400 focus:bg-white",
      buttonPrimary: "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]",
      buttonSecondary: "bg-white border-zinc-250 text-zinc-700 hover:bg-zinc-50 active:scale-[0.98]",
      label: "text-zinc-500",
      outputTextarea: "bg-[#F9FAFB] border-zinc-200 text-emerald-700 focus:border-zinc-300",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      card: "bg-zinc-900/50 border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.4)]",
      headerBorder: "border-zinc-800/85",
      input: "bg-zinc-950/60 border-zinc-800 text-white focus:border-zinc-500 placeholder-zinc-600 focus:bg-zinc-950",
      buttonPrimary: "bg-white text-zinc-950 hover:bg-zinc-100 active:scale-[0.98]",
      buttonSecondary: "bg-zinc-900 border-zinc-800/80 text-zinc-300 hover:bg-zinc-850 active:scale-[0.98]",
      label: "text-zinc-400",
      outputTextarea: "bg-zinc-950/80 border-zinc-800/80 text-emerald-400 focus:border-zinc-700",
    },
  };
  const t = dark ? theme.dark : theme.light;

  useEffect(() => {
    let result = `# Created with DevTasks Robots.txt Generator\nUser-agent: ${userAgent || "*"}\n`;

    if (allow.trim()) {
      allow
        .split("\n")
        .filter((line) => line.trim())
        .forEach((line) => {
          result += `Allow: ${line.trim()}\n`;
        });
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
    setDisallow("/admin\n/private\n/temp");
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
      className={`min-h-[calc(100vh-76px)] px-4 py-8 flex items-start justify-center transition-colors duration-300 ${t.wrapper}`}
    >
      <div
        className={`w-full max-w-5xl rounded-3xl border overflow-hidden transition-all duration-300 ${t.card}`}
      >
        {/* HEADER */}
        <div className={`flex items-center gap-4 p-5 border-b ${t.headerBorder}`}>
          <Link
            to="/devutilities"
            className={`w-10 h-10 border rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-200 ${t.buttonSecondary}`}
            title="Back to Utilities"
          >
            ←
          </Link>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">
              robots.txt Generator
            </h1>
            <p className={`text-xs font-semibold mt-0.5 ${t.label}`}>
              Configure user-agent crawling instructions, sitemaps, and directory restrictions.
            </p>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* CONFIGURATION COLUMN */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-xs font-black uppercase tracking-[0.2em]">
                Configuration Settings
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={loadSample}
                  className={`px-3 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${t.buttonSecondary}`}
                >
                  Load Sample
                </button>
                <button
                  onClick={clearAll}
                  className={`px-3 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${t.buttonSecondary}`}
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* User Agent */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] font-black uppercase tracking-widest ${t.label}`}>
                  User-Agent Rule
                </label>
                <input
                  type="text"
                  value={userAgent}
                  onChange={(e) => setUserAgent(e.target.value)}
                  placeholder="e.g. * (All bots), Googlebot, Bingbot"
                  className={`w-full rounded-xl border p-3 text-xs font-bold outline-none transition-all duration-200 ${t.input}`}
                />
              </div>

              {/* Allow Paths */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] font-black uppercase tracking-widest ${t.label}`}>
                  Allowed Paths (Allow)
                </label>
                <textarea
                  value={allow}
                  onChange={(e) => setAllow(e.target.value)}
                  placeholder="e.g.&#10;/&#10;/public&#10;(One path per line)"
                  rows={3}
                  className={`w-full rounded-xl border p-3 text-xs font-bold outline-none transition-all duration-200 font-mono resize-none ${t.input}`}
                />
              </div>

              {/* Disallow Paths */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] font-black uppercase tracking-widest ${t.label}`}>
                  Disallowed Paths (Disallow)
                </label>
                <textarea
                  value={disallow}
                  onChange={(e) => setDisallow(e.target.value)}
                  placeholder="e.g.&#10;/admin&#10;/private&#10;(One path per line)"
                  rows={4}
                  className={`w-full rounded-xl border p-3 text-xs font-bold outline-none transition-all duration-200 font-mono resize-none ${t.input}`}
                />
              </div>

              {/* Crawl Delay */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] font-black uppercase tracking-widest ${t.label}`}>
                  Crawl-Delay (Seconds)
                </label>
                <input
                  type="number"
                  min="0"
                  value={crawlDelay}
                  onChange={(e) => setCrawlDelay(e.target.value)}
                  placeholder="e.g. 5 (Optional)"
                  className={`w-full rounded-xl border p-3 text-xs font-bold outline-none transition-all duration-200 ${t.input}`}
                />
              </div>

              {/* Sitemap */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-[10px] font-black uppercase tracking-widest ${t.label}`}>
                  Sitemap URL location
                </label>
                <input
                  type="url"
                  value={sitemap}
                  onChange={(e) => setSitemap(e.target.value)}
                  placeholder="e.g. https://example.com/sitemap.xml"
                  className={`w-full rounded-xl border p-3 text-xs font-bold outline-none transition-all duration-200 ${t.input}`}
                />
              </div>
            </div>
          </div>

          {/* OUTPUT & PREVIEW COLUMN */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-xs font-black uppercase tracking-[0.2em]">
                File Output Preview
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`px-3 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${t.buttonSecondary}`}
                >
                  Copy
                </button>
                <button
                  onClick={handleDownload}
                  className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${t.buttonPrimary}`}
                >
                  Download
                </button>
              </div>
            </div>

            <div className="relative flex-1 flex flex-col min-h-[360px]">
              <textarea
                readOnly
                value={output}
                className={`w-full flex-1 rounded-2xl p-4 font-mono text-xs leading-relaxed resize-none outline-none border transition-colors duration-200 ${t.outputTextarea}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}