import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

const MODES = [
  { key: "base64", label: "Base64" },
  { key: "url", label: "URL" },
];

const encodeBase64 = (str) => {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const decodeBase64 = (str) => {
  const binary = atob(str);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

const Base64Url = () => {
  const { dark } = useTheme();
  
  // Main view tab: 'text' or 'image'
  const [activeTab, setActiveTab] = useState("text");

  // --- TEXT/URL STATE ---
  const [textMode, setTextMode] = useState("base64");
  const [textInput, setTextInput] = useState("");
  const [textOutput, setTextOutput] = useState("");

  // --- IMAGE STATE ---
  const [imageMode, setImageMode] = useState("encode"); // encode | decode
  const [imgInputText, setImgInputText] = useState(""); // Base64 string for decode
  const [imgOutputText, setImgOutputText] = useState(""); // Base64 output for encode
  const [imgPreviewSrc, setImgPreviewSrc] = useState(""); // image preview
  const [imgFileInfo, setImgFileInfo] = useState(null); // { name, size, type }
  const fileInputRef = useRef(null);

  // --- GENERAL HANDLERS ---
  const resetText = () => {
    setTextInput("");
    setTextOutput("");
  };

  const resetImage = () => {
    setImgInputText("");
    setImgOutputText("");
    setImgPreviewSrc("");
    setImgFileInfo(null);
  };

  // --- TEXT/URL HANDLERS ---
  const handleTextModeChange = (newMode) => {
    setTextMode(newMode);
    setTextOutput("");
  };

  const handleTextEncode = () => {
    if (!textInput.trim()) return;
    try {
      if (textMode === "base64") {
        setTextOutput(encodeBase64(textInput));
      } else {
        setTextOutput(encodeURIComponent(textInput));
      }
    } catch (error) {
      toast.error("Failed to encode input.");
    }
  };

  const handleTextDecode = () => {
    if (!textInput.trim()) return;
    try {
      if (textMode === "base64") {
        setTextOutput(decodeBase64(textInput));
      } else {
        setTextOutput(decodeURIComponent(textInput));
      }
    } catch (error) {
      toast.error(
        textMode === "base64"
          ? "Invalid Base64 string."
          : "Invalid URL-encoded string."
      );
    }
  };

  const handleTextSample = () => {
    if (textMode === "base64") {
      setTextInput("SGVsbG8gRGV2VGFza3Mh");
    } else {
      setTextInput("Hello%20DevTasks%21");
    }
    setTextOutput("");
  };

  const handleTextCopy = async () => {
    if (!textOutput) return;
    try {
      await navigator.clipboard.writeText(textOutput);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  // --- IMAGE HANDLERS ---
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    setImgFileInfo({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setImgOutputText(base64);
      setImgPreviewSrc(base64);
      toast.success("Image encoded to Base64!");
    };
    reader.onerror = () => {
      toast.error("Failed to read the image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const syntheticEvent = { target: { files: [file] } };
      handleImageFileChange(syntheticEvent);
    }
  };

  const handleImageDragOver = (e) => {
    e.preventDefault();
  };

  const handleImageCopyOutput = async () => {
    if (!imgOutputText) return;
    try {
      await navigator.clipboard.writeText(imgOutputText);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleImageDecode = () => {
    if (!imgInputText.trim()) {
      toast.error("Please enter a Base64 string.");
      return;
    }

    let base64 = imgInputText.trim();
    if (base64.startsWith("data:image/")) {
      // Already formatted
    } else {
      const signatures = {
        "/9j/": "image/jpeg",
        "iVBORw0KGgo": "image/png",
        "R0lGOD": "image/gif",
        "UklGR": "image/webp",
        "Qk": "image/bmp",
      };
      let mime = "image/png";
      for (const [sig, m] of Object.entries(signatures)) {
        if (base64.startsWith(sig)) {
          mime = m;
          break;
        }
      }
      base64 = `data:${mime};base64,${base64}`;
    }

    setImgPreviewSrc(base64);
    setImgOutputText(base64);
    toast.success("Base64 decoded to image!");
  };

  const handleImageDownload = () => {
    if (!imgPreviewSrc) return;
    const a = document.createElement("a");
    a.href = imgPreviewSrc;
    const ext = imgPreviewSrc.includes("image/png")
      ? "png"
      : imgPreviewSrc.includes("image/jpeg")
        ? "jpg"
        : imgPreviewSrc.includes("image/gif")
          ? "gif"
          : imgPreviewSrc.includes("image/webp")
            ? "webp"
            : "png";
    a.download = `image.${ext}`;
    a.click();
    toast.success("Download started!");
  };

  const handleImageSampleBase64 = () => {
    setImgInputText(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    );
    setImgPreviewSrc("");
    setImgOutputText("");
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 font-sans antialiased transition-colors duration-300 overflow-x-hidden ${
        dark ? "bg-zinc-950" : "bg-[#FDFDFD]"
      }`}
    >
      <title>Base64 & URL Converter Suite | DevTasks</title>
      <meta
        name="description"
        content="Convert text and images to Base64, decode Base64 back, and perform URL component encoding completely offline."
      />

      <div
        className={`w-full max-w-6xl md:mx-auto rounded-3xl sm:rounded-4xl shadow-lg p-4 sm:p-8 border transition-colors duration-300 ${
          dark ? "bg-zinc-900 border-zinc-700" : "bg-white border-neutral-100"
        }`}
      >
        {/* Header Area */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-3 w-full min-w-0">
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
                Base64 & URL Converter Suite
              </h1>
            </div>

            {/* Main Tabs (Text vs Image) */}
            <div className="flex border rounded-2xl p-1 bg-zinc-100 dark:bg-zinc-800 border-neutral-200 dark:border-zinc-750 shrink-0">
              <button
                onClick={() => setActiveTab("text")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                  activeTab === "text"
                    ? dark
                      ? "bg-white text-black"
                      : "bg-black text-white"
                    : "bg-transparent text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Text & URL
              </button>
              <button
                onClick={() => setActiveTab("image")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                  activeTab === "image"
                    ? dark
                      ? "bg-white text-black"
                      : "bg-black text-white"
                    : "bg-transparent text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Image Base64
              </button>
            </div>
          </div>
        </div>

        {/* ── Tab 1: Text & URL Converter ── */}
        {activeTab === "text" && (
          <div>
            <div className="flex justify-end mb-6">
              <div
                className={`flex items-center gap-2 p-1 border rounded-2xl ${
                  dark
                    ? "border-zinc-700 bg-zinc-800"
                    : "border-neutral-200 bg-neutral-50"
                }`}
              >
                {MODES.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleTextModeChange(opt.key)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                      textMode === opt.key
                        ? dark
                          ? "bg-white text-black"
                          : "bg-black text-white"
                        : dark
                          ? "text-neutral-400 hover:text-white"
                          : "text-neutral-400 hover:text-black"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-3 h-8">
                  <label
                    className={`text-xs font-black uppercase tracking-widest ${
                      dark ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    Input Text
                  </label>
                  <button
                    type="button"
                    onClick={handleTextSample}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      dark
                        ? "bg-white text-black hover:bg-zinc-200"
                        : "bg-black text-white hover:bg-zinc-800"
                    }`}
                  >
                    Sample
                  </button>
                </div>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className={`w-full h-64 p-4 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors ${
                    dark
                      ? "bg-zinc-950 border-zinc-800 text-zinc-200"
                      : "bg-neutral-50 border-neutral-200 text-zinc-800"
                  }`}
                  placeholder={
                    textMode === "base64"
                      ? "Enter text or Base64 here"
                      : "Enter text or URL-encoded string here"
                  }
                />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center mb-3 h-8">
                  <label
                    className={`text-xs font-black uppercase tracking-widest ${
                      dark ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    Output Result
                  </label>
                </div>
                <textarea
                  value={textOutput}
                  readOnly
                  className={`w-full h-64 p-4 rounded-xl border resize-none focus:outline-none transition-colors ${
                    dark
                      ? `bg-zinc-900/50 border-zinc-800 ${textOutput ? "text-zinc-200" : "text-zinc-500"}`
                      : `bg-neutral-100 border-neutral-200 ${textOutput ? "text-zinc-800" : "text-zinc-400"}`
                  }`}
                  placeholder="Result will appear here..."
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleTextEncode}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${
                  dark
                    ? "bg-white text-black hover:bg-zinc-200 border-white"
                    : "bg-black text-white hover:bg-zinc-800 border-black"
                }`}
              >
                Encode
              </button>
              <button
                onClick={handleTextDecode}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${
                  dark
                    ? "bg-white text-black hover:bg-zinc-200 border-white"
                    : "bg-black text-white hover:bg-zinc-800 border-black"
                }`}
              >
                Decode
              </button>
              <button
                onClick={resetText}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${
                  dark
                    ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                    : "bg-white border-neutral-200 text-zinc-600 hover:text-black"
                }`}
              >
                Clear
              </button>
              <button
                onClick={handleTextCopy}
                disabled={!textOutput}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:scale-100 ${
                  dark
                    ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                    : "bg-white border-neutral-200 text-zinc-600 hover:text-black"
                }`}
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* ── Tab 2: Image to/from Base64 ── */}
        {activeTab === "image" && (
          <div>
            <div className="flex justify-end mb-6">
              <div
                className={`flex items-center gap-2 p-1 border rounded-2xl ${
                  dark
                    ? "border-zinc-700 bg-zinc-800"
                    : "border-neutral-200 bg-neutral-50"
                }`}
              >
                {[
                  { key: "encode", label: "Encode Image" },
                  { key: "decode", label: "Decode Base64" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setImageMode(opt.key);
                      resetImage();
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                      imageMode === opt.key
                        ? dark
                          ? "bg-white text-black"
                          : "bg-black text-white"
                        : dark
                          ? "text-neutral-400 hover:text-white"
                          : "text-neutral-400 hover:text-black"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {imageMode === "encode" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
                {/* Upload Section */}
                <div className="flex flex-col">
                  <label
                    className={`mb-3 text-xs font-black uppercase tracking-widest ${
                      dark ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    Upload Image
                  </label>
                  <div
                    onDrop={handleImageDrop}
                    onDragOver={handleImageDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 min-h-[256px] flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                      dark
                        ? "border-zinc-700 bg-zinc-950 hover:border-zinc-500"
                        : "border-neutral-300 bg-neutral-50 hover:border-neutral-400"
                    }`}
                  >
                    <svg
                      className={`w-10 h-10 ${dark ? "text-zinc-500" : "text-zinc-400"}`}
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
                    <span className={`text-sm font-medium ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
                      Drop an image or click to browse
                    </span>
                    <span className={`text-xs ${dark ? "text-zinc-600" : "text-zinc-400"}`}>
                      Supports PNG, JPEG, GIF, WebP, BMP, SVG
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </div>
                  {imgFileInfo && (
                    <div
                      className={`mt-3 p-3 rounded-xl text-xs border ${
                        dark
                          ? "bg-zinc-850 border-zinc-800 text-zinc-300"
                          : "bg-neutral-50 border-neutral-200 text-zinc-600"
                      }`}
                    >
                      <span className="font-bold">{imgFileInfo.name}</span> —{" "}
                      {formatBytes(imgFileInfo.size)} ({imgFileInfo.type})
                    </div>
                  )}
                </div>

                {/* Preview & String Output */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <label
                      className={`mb-3 text-xs font-black uppercase tracking-widest ${
                        dark ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      Preview
                    </label>
                    <div
                      className={`flex items-center justify-center min-h-[128px] rounded-xl border ${
                        dark
                          ? "bg-zinc-950 border-zinc-800"
                          : "bg-neutral-50 border-neutral-200"
                      }`}
                    >
                      {imgPreviewSrc ? (
                        <img
                          src={imgPreviewSrc}
                          alt="Preview"
                          className="max-w-full max-h-[256px] rounded-lg object-contain"
                        />
                      ) : (
                        <span className={`text-sm ${dark ? "text-zinc-600" : "text-zinc-400"}`}>
                          Image preview will appear here
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-center mb-3">
                      <label
                        className={`text-xs font-black uppercase tracking-widest ${
                          dark ? "text-zinc-400" : "text-zinc-500"
                        }`}
                      >
                        Base64 Output
                      </label>
                      {imgOutputText && (
                        <span className={`text-xs ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                          {formatBytes(imgOutputText.length)} chars
                        </span>
                      )}
                    </div>
                    <textarea
                      value={imgOutputText}
                      readOnly
                      className={`flex-1 min-h-[96px] p-4 rounded-xl border resize-none focus:outline-none transition-colors text-xs font-mono ${
                        dark
                          ? "bg-zinc-950 border-zinc-800 text-zinc-300"
                          : "bg-neutral-50 border-neutral-200 text-zinc-600"
                      }`}
                      placeholder="The Base64 string will appear here..."
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Decode Image Mode */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <label
                      className={`text-xs font-black uppercase tracking-widest ${
                        dark ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      Base64 Input String
                    </label>
                    <button
                      type="button"
                      onClick={handleImageSampleBase64}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        dark
                          ? "bg-white text-black hover:bg-zinc-200"
                          : "bg-black text-white hover:bg-zinc-800"
                      }`}
                    >
                      Sample
                    </button>
                  </div>
                  <textarea
                    value={imgInputText}
                    onChange={(e) => setImgInputText(e.target.value)}
                    className={`w-full h-64 p-4 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors text-xs font-mono ${
                      dark
                        ? "bg-zinc-950 border-zinc-800 text-zinc-200"
                        : "bg-neutral-50 border-neutral-200 text-zinc-800"
                    }`}
                    placeholder="Paste a Base64 image data URL or raw string here..."
                  />
                </div>

                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <label
                      className={`text-xs font-black uppercase tracking-widest ${
                        dark ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      Image Preview
                    </label>
                    {imgPreviewSrc && (
                      <button
                        type="button"
                        onClick={handleImageDownload}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          dark
                            ? "bg-zinc-800 text-zinc-300 hover:text-white"
                            : "bg-neutral-100 text-zinc-600 hover:text-black"
                        }`}
                      >
                        Download
                      </button>
                    )}
                  </div>
                  <div
                    className={`flex items-center justify-center flex-1 min-h-[256px] rounded-xl border ${
                      dark
                        ? "bg-zinc-950 border-zinc-800"
                        : "bg-neutral-50 border-neutral-200"
                    }`}
                  >
                    {imgPreviewSrc ? (
                      <img
                        src={imgPreviewSrc}
                        alt="Decoded"
                        className="max-w-full max-h-[320px] rounded-lg object-contain"
                      />
                    ) : (
                      <span className={`text-sm ${dark ? "text-zinc-600" : "text-zinc-400"}`}>
                        Image will appear here after clicking Decode
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons for Image Converter */}
            <div className="flex flex-wrap justify-center gap-4">
              {imageMode === "encode" ? (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${
                      dark
                        ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                        : "bg-white border-neutral-200 text-zinc-600 hover:text-black"
                    }`}
                  >
                    Select File
                  </button>
                  <button
                    onClick={handleImageCopyOutput}
                    disabled={!imgOutputText}
                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:scale-100 ${
                      dark
                        ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                        : "bg-white border-neutral-200 text-zinc-600 hover:text-black"
                    }`}
                  >
                    Copy Base64
                  </button>
                  <button
                    onClick={resetImage}
                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${
                      dark
                        ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                        : "bg-white border-neutral-200 text-zinc-600 hover:text-black"
                    }`}
                  >
                    Clear
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleImageDecode}
                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${
                      dark
                        ? "bg-white text-black hover:bg-zinc-200 border-white"
                        : "bg-black text-white hover:bg-zinc-800 border-black"
                    }`}
                  >
                    Decode to Image
                  </button>
                  <button
                    onClick={handleImageDownload}
                    disabled={!imgPreviewSrc}
                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:scale-100 ${
                      dark
                        ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                        : "bg-white border-neutral-200 text-zinc-600 hover:text-black"
                    }`}
                  >
                    Download
                  </button>
                  <button
                    onClick={resetImage}
                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all duration-200 hover:scale-105 ${
                      dark
                        ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white"
                        : "bg-white border-neutral-200 text-zinc-600 hover:text-black"
                    }`}
                  >
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Base64Url;
