import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { FaArrowLeft, FaCopy, FaImage, FaRedo } from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext";

const theme = {
  light: {
    wrapper: "bg-[#F8F9FA] text-zinc-900",
    heading: "text-zinc-900",
    subtext: "text-zinc-500",
    card: "bg-white border-zinc-200/85 shadow-sm",
    input: "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-400 focus:outline-none",
    buttonPrimary: "bg-zinc-900 text-white hover:bg-zinc-800 transition-all duration-200 shadow-sm",
    buttonSecondary: "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-all duration-200",
    label: "text-zinc-500 font-semibold tracking-wider text-xs uppercase",
    preview: "bg-zinc-100/70 border-zinc-200",
    codeBox: "bg-zinc-950 text-zinc-100 border-zinc-800",
    backLink: "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-350",
  },
  dark: {
    wrapper: "bg-[#090A0F] text-zinc-100",
    heading: "text-zinc-100",
    subtext: "text-zinc-400",
    card: "bg-zinc-900/50 border-zinc-800/85 backdrop-blur-md shadow-lg",
    input: "bg-zinc-950/70 border-zinc-800 text-zinc-100 focus:border-zinc-600 focus:outline-none",
    buttonPrimary: "bg-white text-zinc-950 hover:bg-zinc-200 transition-all duration-200 shadow-sm",
    buttonSecondary: "bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all duration-200",
    label: "text-zinc-400 font-semibold tracking-wider text-xs uppercase",
    preview: "bg-zinc-950/70 border-zinc-800",
    codeBox: "bg-black/40 text-emerald-400 border-zinc-800/80 font-mono",
    backLink: "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600",
  },
};

export default function CssBorderImageGenerator() {
  const { dark } = useTheme();
  const [imageUrl, setImageUrl] = useState('');
  const [slice, setSlice] = useState(30);
  const [borderImageWidth, setBorderImageWidth] = useState(24);
  const [outset, setOutset] = useState(0);
  const [repeat, setRepeat] = useState("stretch");
  const [radius, setRadius] = useState(20);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target.result);
        toast.success("Image loaded successfully");
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please upload a valid image file");
    }
  };

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") {
      setIsDragActive(true);
    } else if (event.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFile(event.dataTransfer.files[0]);
    }
  };

  const t = dark ? theme.dark : theme.light;

  const previewStyle = useMemo(
    () => ({
      borderImageSource: `url(${imageUrl})`,
      borderImageSlice: slice,
      borderImageWidth: `${borderImageWidth}px`,
      borderImageOutset: `${outset}px`,
      borderImageRepeat: repeat,
      borderRadius: `${radius}px`,
      borderWidth: `${borderImageWidth}px`,
      borderStyle: "solid",
      borderColor: dark ? 'rgba(63, 63, 70, 0.5)' : 'rgba(228, 228, 231, 0.7)',
    }),
    [borderImageWidth, dark, imageUrl, outset, radius, repeat, slice],
  );

  const cssCode = useMemo(
    () => `border-image-slice: ${slice};
border-image-width: ${borderImageWidth}px;
border-image-outset: ${outset}px;
border-image-repeat: ${repeat};
border-radius: ${radius}px;
border-image-source: url('${imageUrl ? imageUrl : '...'}');`,
    [borderImageWidth, imageUrl, outset, radius, repeat, slice],
  );

  const copyCss = async () => {
    try {
      await navigator.clipboard.writeText(cssCode);
      toast.success("Copied CSS to clipboard");
    } catch {
      toast.error("Unable to copy CSS");
    }
  };

  const resetDefaults = () => {
    setImageUrl('');
    setSlice(30);
    setBorderImageWidth(24);
    setOutset(0);
    setRepeat("stretch");
    setRadius(20);
    toast.success("Reset to defaults");
  };

  return (
    <div className={`min-h-screen ${t.wrapper} px-4 sm:px-6 py-6 sm:py-10 transition-colors duration-300`}>
      <title>CSS Border-Image Generator — DevTasks</title>
      <meta
        name="description"
        content="Design custom CSS border-image effects with live preview, tuneable slices, widths, repeats, and copy-ready CSS."
      />

      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center gap-3 sm:mb-8">
          <Link
            to="/devutilities"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 active:scale-95 ${t.backLink}`}
            title="Back to Utilities"
          >
            <FaArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className={`text-xl font-semibold tracking-tight sm:text-2xl ${t.heading}`}>
              CSS Border-Image Generator
            </h1>
            <p className={`mt-0.5 text-xs sm:text-sm ${t.subtext}`}>
              Build custom sliced image borders and export CSS instantly.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="min-w-0 space-y-6">
            <div className={`rounded-3xl border p-5 sm:p-6 ${t.card}`}>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">Border Controls</h2>
                <button
                  onClick={resetDefaults}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium ${t.buttonSecondary}`}
                >
                  <span className="flex items-center gap-2">
                    <FaRedo className="h-3.5 w-3.5" /> Reset
                  </span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  <label className={t.label}>Image Source</label>
                  
                  {/* Drag and Drop Zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload').click()}
                    className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer
                      ${isDragActive 
                        ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10' 
                        : 'border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/20'
                      }`}
                  >
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        if (event.target.files && event.target.files[0]) {
                          handleFile(event.target.files[0]);
                        }
                      }}
                    />
                    <FaImage className={`h-8 w-8 ${isDragActive ? 'text-indigo-500' : 'text-zinc-400'}`} />
                    <div className="text-sm font-medium">
                      {imageUrl && imageUrl.startsWith('data:') ? (
                        <span className="text-emerald-500">✓ Image loaded from device</span>
                      ) : (
                        <span>Drag & drop image here, or <span className="text-indigo-500 dark:text-indigo-400 underline">browse</span></span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400">Supports PNG, JPG, GIF, WebP</p>
                  </div>

                  {/* Textarea for URL fallback */}
                  <div className="mt-1 flex flex-col gap-1.5">
                    <span className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">Or enter image URL</span>
                    <div className="flex items-start gap-2">
                      <textarea
                        rows={1}
                        value={imageUrl && imageUrl.startsWith('data:') ? '' : imageUrl}
                        onChange={(event) => setImageUrl(event.target.value)}
                        placeholder={imageUrl && imageUrl.startsWith('data:') ? "Using uploaded image (clear to paste URL)" : "Paste an image URL"}
                        disabled={imageUrl && imageUrl.startsWith('data:')}
                        className={`w-full resize-none overflow-hidden rounded-xl border px-3 py-2.5 text-sm leading-relaxed ${t.input} ${
                          imageUrl && imageUrl.startsWith('data:') ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        spellCheck={false}
                      />
                      {imageUrl && (
                        <button
                          onClick={() => setImageUrl('')}
                          className={`rounded-xl border px-3 py-2 text-xs font-semibold shrink-0 ${t.buttonSecondary}`}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className={t.label}>Slice</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={slice}
                      onChange={(event) => setSlice(Number(event.target.value))}
                      className="accent-indigo-500"
                    />
                    <span className="text-sm text-zinc-400">{slice}px</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={t.label}>Width</label>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={borderImageWidth}
                      onChange={(event) => setBorderImageWidth(Number(event.target.value))}
                      className="accent-indigo-500"
                    />
                    <span className="text-sm text-zinc-400">{borderImageWidth}px</span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className={t.label}>Outset</label>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={outset}
                      onChange={(event) => setOutset(Number(event.target.value))}
                      className="accent-indigo-500"
                    />
                    <span className="text-sm text-zinc-400">{outset}px</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className={t.label}>Radius</label>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={radius}
                      onChange={(event) => setRadius(Number(event.target.value))}
                      className="accent-indigo-500"
                    />
                    <span className="text-sm text-zinc-400">{radius}px</span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className={t.label}>Repeat</label>
                    <select
                      value={repeat}
                      onChange={(event) => setRepeat(event.target.value)}
                      className={`rounded-xl border px-3 py-2.5 text-sm ${t.input}`}
                    >
                      <option value="stretch">stretch</option>
                      <option value="repeat">repeat</option>
                      <option value="round">round</option>
                      <option value="space">space</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0 space-y-6">
            <div className={`rounded-3xl border p-5 sm:p-6 ${t.card}`}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">Live Preview</h2>
                <button
                  onClick={copyCss}
                  className={`rounded-xl px-3 py-2 text-sm font-medium ${t.buttonPrimary}`}
                >
                  <span className="flex items-center gap-2">
                    <FaCopy className="h-3.5 w-3.5" /> Copy CSS
                  </span>
                </button>
              </div>

              <div className={`rounded-2xl border p-6 ${t.preview}`}>
                <div
                  className="relative mx-auto flex h-[260px] w-[280px] max-w-full items-center justify-center rounded-2xl border border-dashed border-zinc-300/70 bg-white/80 p-6 text-center text-sm font-medium text-zinc-700 shadow-inner dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200"
                  style={{ ...previewStyle, boxSizing: "border-box" }}
                >
                  {/* Onion Layer 1: Outset area (Purple - Inner Layer) */}
                  {outset > 0 && (
                    <div
                      className="pointer-events-none absolute"
                      style={{
                        top: `-${outset}px`,
                        left: `-${outset}px`,
                        right: `-${outset}px`,
                        bottom: `-${outset}px`,
                        border: `${outset}px solid ${dark ? 'rgba(129, 140, 248, 0.25)' : 'rgba(99, 102, 241, 0.15)'}`,
                        borderRadius: `${radius + outset}px`,
                      }}
                    />
                  )}

                  {/* 9-slice guide lines — show the border-image-slice boundary */}
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-0 right-0 border-t border-dashed border-indigo-400/40" style={{ top: `${slice}px` }} />
                    <div className="absolute left-0 right-0 border-t border-dashed border-indigo-400/40" style={{ bottom: `${slice}px` }} />
                    <div className="absolute top-0 bottom-0 border-l border-dashed border-indigo-400/40" style={{ left: `${slice}px` }} />
                    <div className="absolute top-0 bottom-0 border-l border-dashed border-indigo-400/40" style={{ right: `${slice}px` }} />
                  </div>
                  <div className="max-w-[80%]">
                    <p className="text-lg font-semibold">Border Image</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-400">
                      {slice}px slice • {borderImageWidth}px width • {outset}px outset • {repeat}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`rounded-3xl border p-5 sm:p-6 ${t.card}`}>
              <h2 className="mb-3 text-lg font-semibold tracking-tight">Generated CSS</h2>
              <pre className={`overflow-x-auto break-all whitespace-pre-wrap rounded-2xl border p-4 text-sm leading-6 ${t.codeBox}`}>
                {cssCode}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}