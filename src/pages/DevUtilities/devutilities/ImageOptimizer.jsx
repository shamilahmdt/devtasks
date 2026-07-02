import { Link } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../../../context/ThemeContext";

function formatSize(bytes) {
  if (bytes == null) return "--";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function ImageOptimizer() {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState("image/webp");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [preview, setPreview] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [optimizedBlob, setOptimizedBlob] = useState(null);
  const [optimizedPreview, setOptimizedPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const previewUrlRef = useRef(null);
  const optimizedUrlRef = useRef(null);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (optimizedUrlRef.current) URL.revokeObjectURL(optimizedUrlRef.current);
    };
  }, []);

  const loadFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError("Please upload an image smaller than 20 MB.");
      return;
    }

    setError("");

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    if (optimizedUrlRef.current) URL.revokeObjectURL(optimizedUrlRef.current);

    setFile(selectedFile);
    setOptimizedBlob(null);
    setOptimizedPreview(null);
    optimizedUrlRef.current = null;

    const imageUrl = URL.createObjectURL(selectedFile);
    previewUrlRef.current = imageUrl;
    setPreview(imageUrl);

    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
      setWidth(img.width);
      setHeight(img.height);
    };
    img.onerror = () => setError("Could not read this image file.");
    img.src = imageUrl;
  };

  const handleFile = (e) => {
    loadFile(e.target.files[0]);
    e.target.value = ""; 
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    loadFile(dropped);
  };

  const invalidateOptimized = useCallback(() => {
    if (optimizedUrlRef.current) {
      URL.revokeObjectURL(optimizedUrlRef.current);
      optimizedUrlRef.current = null;
    }
    setOptimizedBlob(null);
    setOptimizedPreview(null);
  }, []);

  const handleWidthChange = (e) => {
    const newWidth = Math.max(1, Number(e.target.value) || 0);
    setWidth(newWidth);
    if (lockAspectRatio && dimensions.width) {
      const ratio = dimensions.height / dimensions.width;
      setHeight(Math.max(1, Math.round(newWidth * ratio)));
    }
    invalidateOptimized();
  };

  const handleHeightChange = (e) => {
    const newHeight = Math.max(1, Number(e.target.value) || 0);
    setHeight(newHeight);
    if (lockAspectRatio && dimensions.height) {
      const ratio = dimensions.width / dimensions.height;
      setWidth(Math.max(1, Math.round(newHeight * ratio)));
    }
    invalidateOptimized();
  };

  const handleFormatChange = (e) => {
    setFormat(e.target.value);
    invalidateOptimized();
  };

  const handleQualityChange = (e) => {
    setQuality(Number(e.target.value));
    invalidateOptimized();
  };

  const optimizeImage = () => {
    if (!file || !width || !height) return;
    setIsProcessing(true);
    setError("");

    const img = new Image();
    img.src = preview;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        setError("Canvas is not supported in this browser.");
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          setIsProcessing(false);
          if (!blob) {
            setError("Optimization failed. Try a different format.");
            return;
          }
          if (optimizedUrlRef.current)
            URL.revokeObjectURL(optimizedUrlRef.current);
          const url = URL.createObjectURL(blob);
          optimizedUrlRef.current = url;
          setOptimizedBlob(blob);
          setOptimizedPreview(url);
        },
        format,
        format === "image/png" ? undefined : quality / 100,
      );
    };
    img.onerror = () => {
      setIsProcessing(false);
      setError("Could not process this image.");
    };
  };

  const downloadImage = () => {
    if (!optimizedBlob || !optimizedPreview) return;

    const extension = format.split("/")[1];
    const baseName = file.name.replace(/\.[^/.]+$/, "") || "image";

    const a = document.createElement("a");
    a.href = optimizedPreview;
    a.download = `${baseName}-optimized.${extension}`;
    a.rel = "noopener";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const savedPct =
    file && optimizedBlob
      ? ((1 - optimizedBlob.size / file.size) * 100).toFixed(1)
      : null;

  const { dark } = useTheme();

  return (
    <div
      className={`relative min-h-screen p-4 sm:p-6 transition-colors duration-300 ${
        dark ? "bg-zinc-950" : "bg-[#FDFDFD]"
      }`}
    >
      <div
        className={`absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[120px] opacity-30 ${
          dark ? "bg-zinc-800" : "bg-neutral-200"
        }`}
      />
      <div
        className={`absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[120px] opacity-30 ${
          dark ? "bg-zinc-900" : "bg-neutral-100"
        }`}
      />

      <div
        className={`relative z-10 max-w-7xl mx-auto rounded-[32px] border shadow-xl overflow-hidden ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
        }`}
      >
        <div className={`h-2 ${dark ? "bg-white" : "bg-black"}`} />

        <div className="flex items-center gap-4 px-6 pt-8">
          <Link
            to="/devutilities"
            className={`p-3 rounded-xl border ${
              dark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200"
            }`}
          >
            ←
          </Link>
          <div>
            <h1 className="text-3xl font-black uppercase">Image Optimizer</h1>
            <p
              className={`mt-1 text-sm ${dark ? "text-zinc-400" : "text-zinc-500"}`}
            >
              Compress, resize and convert images completely offline.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 p-6">
          {/* LEFT PANEL */}
          <div
            className={`rounded-3xl border p-6 space-y-6 ${
              dark
                ? "bg-zinc-900/50 border-zinc-800"
                : "bg-zinc-50 border-zinc-200"
            }`}
          >
            <h2 className="text-xs font-black uppercase tracking-widest">
              Upload & Settings
            </h2>

            <label
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl h-56 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                isDragging
                  ? dark
                    ? "border-white bg-zinc-800/50"
                    : "border-black bg-zinc-100"
                  : dark
                    ? "border-zinc-700 text-zinc-400"
                    : "border-zinc-300 text-zinc-500"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
              <div className="text-5xl mb-4">🖼️</div>
              <p className="font-bold text-center px-4">
                {file ? file.name : "Drag & Drop or Click to Upload Image"}
              </p>
              <p className="text-xs mt-1 opacity-70">Max 20 MB</p>
            </label>

            {error && <p className="text-sm font-bold text-red-500">{error}</p>}

            <div>
              <label className="text-xs font-black uppercase">
                Output Format
              </label>
              <select
                value={format}
                onChange={handleFormatChange}
                className="mt-2 w-full rounded-xl border p-3 bg-transparent"
              >
                <option value="image/webp">WebP</option>
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase">
                Compression Quality {format === "image/png" && "(N/A for PNG)"}
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                disabled={format === "image/png"}
                onChange={handleQualityChange}
                className="w-full mt-3 accent-purple-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer disabled:opacity-40"
              />
              <p className="text-sm mt-1">
                {format === "image/png" ? "Lossless" : `${quality}%`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black uppercase">Width</label>
                <input
                  type="number"
                  min="1"
                  value={width}
                  onChange={handleWidthChange}
                  className="mt-2 w-full rounded-xl border p-3 bg-transparent"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase">Height</label>
                <input
                  type="number"
                  min="1"
                  value={height}
                  onChange={handleHeightChange}
                  className="mt-2 w-full rounded-xl border p-3 bg-transparent"
                />
              </div>
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={lockAspectRatio}
                onChange={(e) => setLockAspectRatio(e.target.checked)}
              />
              <span>Lock Aspect Ratio</span>
            </label>
          </div>

          {/* RIGHT PANEL */}
          <div
            className={`rounded-3xl border p-6 space-y-6 ${
              dark
                ? "bg-zinc-900/50 border-zinc-800"
                : "bg-zinc-50 border-zinc-200"
            }`}
          >
            <h2 className="text-xs font-black uppercase tracking-widest">
              Preview & Comparison
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div
                className={`rounded-2xl h-60 flex items-center justify-center border overflow-hidden ${
                  dark ? "border-zinc-800" : "border-zinc-200"
                }`}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Original"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <p>Original Image</p>
                )}
              </div>

              <div
                className={`rounded-2xl h-60 flex items-center justify-center border overflow-hidden ${
                  dark ? "border-zinc-800" : "border-zinc-200"
                }`}
              >
                {isProcessing ? (
                  <p className="text-sm animate-pulse">Optimizing…</p>
                ) : optimizedPreview ? (
                  <img
                    src={optimizedPreview}
                    alt="Optimized"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <p>Optimized Image</p>
                )}
              </div>
            </div>

            <div
              className={`rounded-2xl border p-5 ${dark ? "border-zinc-800" : "border-zinc-200"}`}
            >
              <div className="flex justify-between">
                <span>Original</span>
                <span>{file ? formatSize(file.size) : "--"}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span>Optimized</span>
                <span>
                  {optimizedBlob ? formatSize(optimizedBlob.size) : "--"}
                </span>
              </div>
              <div className="flex justify-between mt-2">
                <span>Dimensions</span>
                <span>
                  {width || 0} × {height || 0}
                </span>
              </div>
              <div className="flex justify-between mt-2 font-bold">
                <span>Saved</span>
                <span>
                  {file && optimizedBlob
                    ? `${formatSize(file.size)} → ${formatSize(optimizedBlob.size)} (-${savedPct}%)`
                    : "--"}
                </span>
              </div>
            </div>

            <button
              onClick={optimizedBlob ? downloadImage : optimizeImage}
              disabled={!file || isProcessing}
              className={`w-full rounded-2xl py-4 font-black disabled:opacity-40 disabled:cursor-not-allowed ${
                dark ? "bg-white text-black" : "bg-black text-white"
              }`}
            >
              {isProcessing
                ? "Optimizing…"
                : optimizedBlob
                  ? "Download Optimized Image"
                  : "Optimize Image"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
