import { useState, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

/* ── Resize helper ──────────────────────────────────────────────── */
function resizeImage(img, size) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, size, size);
  return canvas;
}

function canvasToBlob(canvas, type = "image/png") {
  return new Promise((resolve) => canvas.toBlob(resolve, type));
}

/* ── Icon sizes to generate ─────────────────────────────────────── */
const ICON_SIZES = [
  { size: 16, name: "favicon-16x16.png" },
  { size: 32, name: "favicon-32x32.png" },
  { size: 180, name: "apple-touch-icon.png" },
  { size: 192, name: "android-chrome-192x192.png" },
  { size: 512, name: "android-chrome-512x512.png" },
];

/* ── Main Component ─────────────────────────────────────────────── */
export default function FaviconGenerator() {
  const { dark } = useTheme();

  const theme = {
    light: {
      wrapper: "bg-[#F8F9FA] text-zinc-900",
      card: "bg-white border-zinc-250/90 shadow-sm",
      headerBorder: "border-zinc-200",
      input:
        "bg-white border-zinc-250 text-zinc-900 focus:border-zinc-900 placeholder-zinc-400 focus:bg-white",
      buttonPrimary:
        "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]",
      buttonSecondary:
        "bg-white border-zinc-250 text-zinc-700 hover:bg-zinc-50 active:scale-[0.98]",
      label: "text-zinc-500",
      sectionBorder: "border-zinc-200",
      outputTextarea:
        "bg-[#F9FAFB] border-zinc-200 text-emerald-700 focus:border-zinc-300",
      dropZone:
        "border-zinc-300 bg-zinc-50 hover:border-zinc-400 hover:bg-zinc-100",
      dropZoneActive: "border-zinc-900 bg-zinc-100",
      preview: "bg-zinc-50 border-zinc-200",
    },
    dark: {
      wrapper: "bg-[#090A0F] text-zinc-100",
      card: "bg-zinc-900/50 border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.4)]",
      headerBorder: "border-zinc-800/85",
      input:
        "bg-zinc-950/60 border-zinc-800 text-white focus:border-zinc-500 placeholder-zinc-600 focus:bg-zinc-950",
      buttonPrimary:
        "bg-white text-zinc-950 hover:bg-zinc-100 active:scale-[0.98]",
      buttonSecondary:
        "bg-zinc-900 border-zinc-800/80 text-zinc-300 hover:bg-zinc-850 active:scale-[0.98]",
      label: "text-zinc-400",
      sectionBorder: "border-zinc-800/60",
      outputTextarea:
        "bg-zinc-950/80 border-zinc-800/80 text-emerald-400 focus:border-zinc-700",
      dropZone:
        "border-zinc-700 bg-zinc-900/40 hover:border-zinc-500 hover:bg-zinc-800/50",
      dropZoneActive: "border-white bg-zinc-800/60",
      preview: "bg-zinc-950/60 border-zinc-800",
    },
  };
  const t = dark ? theme.dark : theme.light;

  /* ── State ────────────────────────────────────────────────────── */
  const [imageFile, setImageFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [appShortName, setAppShortName] = useState("My App");
  const [appFullName, setAppFullName] = useState("My Application");
  const [themeColor, setThemeColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef = useRef(null);

  /* ── File handling ────────────────────────────────────────────── */
  const handleFile = useCallback((file) => {
    if (!file) return;
    const allowed = ["image/png", "image/jpeg", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      toast.error("Please upload a PNG, JPG, or SVG image.");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImageSrc(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer?.files?.[0];
      handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      handleFile(e.target.files?.[0]);
    },
    [handleFile],
  );

  const clearImage = useCallback(() => {
    setImageFile(null);
    setImageSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  /* ── Manifest JSON ────────────────────────────────────────────── */
  const manifest = useMemo(
    () => ({
      name: appFullName,
      short_name: appShortName,
      icons: [
        {
          src: "/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      theme_color: themeColor,
      background_color: bgColor,
      display: "standalone",
    }),
    [appFullName, appShortName, themeColor, bgColor],
  );

  const manifestJson = useMemo(
    () => JSON.stringify(manifest, null, 2),
    [manifest],
  );

  /* ── HTML <head> snippet ──────────────────────────────────────── */
  const headSnippet = useMemo(
    () =>
      [
        `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`,
        `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">`,
        `<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">`,
        `<link rel="manifest" href="/site.webmanifest">`,
        `<meta name="theme-color" content="${themeColor}">`,
      ].join("\n"),
    [themeColor],
  );

  /* ── Copy helpers ─────────────────────────────────────────────── */
  const copyManifest = useCallback(async () => {
    await navigator.clipboard.writeText(manifestJson);
    toast.success("Manifest JSON copied!");
  }, [manifestJson]);

  const copySnippet = useCallback(async () => {
    await navigator.clipboard.writeText(headSnippet);
    toast.success("HTML snippet copied!");
  }, [headSnippet]);

  /* ── Generate ZIP ─────────────────────────────────────────────── */
  const generateZip = useCallback(async () => {
    if (!imageSrc) {
      toast.error("Upload an image first.");
      return;
    }
    setIsGenerating(true);

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // Load master image onto an HTMLImageElement
      const img = await new Promise((resolve, reject) => {
        const el = new Image();
        el.crossOrigin = "anonymous";
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = imageSrc;
      });

      // Generate each icon size
      for (const { size, name } of ICON_SIZES) {
        const canvas = resizeImage(img, size);
        const blob = await canvasToBlob(canvas);
        zip.file(name, blob);
      }

      // Add site.webmanifest
      zip.file("site.webmanifest", manifestJson);

      // Generate & download
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "favicons.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success("Favicon bundle downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate favicon bundle.");
    } finally {
      setIsGenerating(false);
    }
  }, [imageSrc, manifestJson]);

  /* ── Reusable class-name strings ──────────────────────────────── */
  const inputCls = `w-full rounded-xl border p-3 text-xs font-bold outline-none transition-all duration-200 ${t.input}`;
  const labelCls = `text-[10px] font-black uppercase tracking-widest ${t.label}`;

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div
      className={`min-h-[calc(100vh-76px)] px-4 py-8 flex items-start justify-center transition-colors duration-300 ${t.wrapper}`}
    >
      <div
        className={`w-full max-w-7xl rounded-3xl border overflow-hidden transition-all duration-300 ${t.card}`}
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <div className={`flex items-center gap-4 p-5 border-b ${t.headerBorder}`}>
          <Link
            to="/devutilities"
            className={`w-10 h-10 border rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-200 ${t.buttonSecondary}`}
            title="Back to Utilities"
          >
            ←
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-black uppercase tracking-tight">
              Favicon Generator
            </h1>
            <p className={`text-xs font-semibold mt-0.5 ${t.label}`}>
              Upload a master image and generate a complete favicon bundle with
              web manifest.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearImage}
              className={`px-3 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${t.buttonSecondary}`}
            >
              Clear
            </button>
          </div>
        </div>

        {/* ── Two-column body ─────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-0">
          {/* ── LEFT PANEL ────────────────────────────────────── */}
          <div
            className={`p-6 flex flex-col gap-6 lg:border-r ${t.sectionBorder}`}
          >
            {/* Upload zone */}
            <div className="flex flex-col gap-4">
              <h2
                className={`text-xs font-black uppercase tracking-[0.2em] pb-2 border-b ${t.sectionBorder}`}
              >
                Master Image
              </h2>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-all duration-200 ${
                  isDragging ? t.dropZoneActive : t.dropZone
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={handleInputChange}
                  className="hidden"
                />

                {imageSrc ? (
                  <div className="flex flex-col items-center gap-3">
                    <img
                      src={imageSrc}
                      alt="Master favicon source"
                      className="w-24 h-24 rounded-xl object-contain"
                    />
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest ${t.label}`}
                    >
                      {imageFile?.name} — Click or drop to replace
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <svg
                      className="w-10 h-10 opacity-40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest ${t.label}`}
                    >
                      Drop PNG, JPG, or SVG here — or click to browse
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* App info fields */}
            <div className="flex flex-col gap-4">
              <h2
                className={`text-xs font-black uppercase tracking-[0.2em] pb-2 border-b ${t.sectionBorder}`}
              >
                App Information
              </h2>

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>App Short Name</label>
                <input
                  type="text"
                  value={appShortName}
                  onChange={(e) => setAppShortName(e.target.value)}
                  placeholder="e.g. MyApp"
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Full App Name</label>
                <input
                  type="text"
                  value={appFullName}
                  onChange={(e) => setAppFullName(e.target.value)}
                  placeholder="e.g. My Application"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Color fields */}
            <div className="flex flex-col gap-4">
              <h2
                className={`text-xs font-black uppercase tracking-[0.2em] pb-2 border-b ${t.sectionBorder}`}
              >
                Colors
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Generated icon sizes info */}
            <div className="flex flex-col gap-2">
              <h2
                className={`text-xs font-black uppercase tracking-[0.2em] pb-2 border-b ${t.sectionBorder}`}
              >
                Generated Icons
              </h2>
              <div className="flex flex-wrap gap-2">
                {ICON_SIZES.map(({ size, name }) => (
                  <span
                    key={name}
                    className={`inline-block rounded-lg border px-2.5 py-1 text-[10px] font-bold tracking-wide ${t.sectionBorder} ${t.label}`}
                  >
                    {size}×{size}
                  </span>
                ))}
              </div>
              <p className={`text-[10px] mt-1 font-semibold ${t.label}`}>
                favicon-16x16 · favicon-32x32 · apple-touch-icon (180) ·
                android-chrome-192 · android-chrome-512
              </p>
            </div>
          </div>

          {/* ── RIGHT PANEL ───────────────────────────────────── */}
          <div className="p-6 flex flex-col gap-6">
            {/* Manifest JSON preview */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2
                  className={`text-xs font-black uppercase tracking-[0.2em] pb-2 border-b flex-1 ${t.sectionBorder}`}
                >
                  site.webmanifest
                </h2>
                <button
                  onClick={copyManifest}
                  className={`px-3 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${t.buttonSecondary}`}
                >
                  Copy
                </button>
              </div>
              <textarea
                readOnly
                value={manifestJson}
                rows={14}
                className={`w-full rounded-xl border p-4 text-xs font-mono font-bold outline-none resize-none transition-all duration-200 ${t.outputTextarea}`}
              />
            </div>

            {/* HTML <head> snippet */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2
                  className={`text-xs font-black uppercase tracking-[0.2em] pb-2 border-b flex-1 ${t.sectionBorder}`}
                >
                  HTML &lt;head&gt; Snippet
                </h2>
                <button
                  onClick={copySnippet}
                  className={`px-3 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${t.buttonSecondary}`}
                >
                  Copy
                </button>
              </div>
              <textarea
                readOnly
                value={headSnippet}
                rows={6}
                className={`w-full rounded-xl border p-4 text-xs font-mono font-bold outline-none resize-none transition-all duration-200 ${t.outputTextarea}`}
              />
            </div>

            {/* Generate & Download */}
            <button
              onClick={generateZip}
              disabled={!imageSrc || isGenerating}
              className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${t.buttonPrimary}`}
            >
              {isGenerating
                ? "Generating…"
                : "Generate & Download ZIP"}
            </button>

            {!imageSrc && (
              <p
                className={`text-[10px] text-center font-bold uppercase tracking-widest ${t.label}`}
              >
                Upload an image to enable download
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
