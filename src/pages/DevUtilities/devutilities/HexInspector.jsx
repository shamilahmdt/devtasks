import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import CryptoJS from "crypto-js";
import { useTheme } from "../../../context/ThemeContext";
import { 
  FiUploadCloud, 
  FiChevronLeft, 
  FiChevronRight, 
  FiCopy, 
  FiFile, 
  FiCheck, 
  FiSettings, 
  FiDatabase
} from "react-icons/fi";

const PNG_SIGNATURE = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
const WASM_SIGNATURE = [0x00, 0x61, 0x73, 0x6D];

// Presets
const PRESETS = {
  png: {
    name: "Mock PNG Header",
    data: new Uint8Array([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x5C, 0x72, 0xA8, 0x66, 0x00, 0x00, 0x00,
      0x04, 0x67, 0x41, 0x4D, 0x41, 0x00, 0x00, 0xB1, 0x8F, 0x0B, 0xFC, 0x61,
      0x05, 0x00, 0x00, 0x00, 0x20, 0x63, 0x48, 0x52, 0x4D, 0x00, 0x00, 0x7A,
      0x26, 0x00, 0x00, 0x80, 0x84, 0x00, 0x00, 0xFA, 0x00, 0x00, 0x00, 0x80,
      0xE8, 0x00, 0x00, 0x75, 0x30, 0x00, 0x00, 0xEA, 0x60, 0x00, 0x00, 0x3A,
      0x98, 0x00, 0x00, 0x17, 0x70, 0x9C, 0xBA, 0x51, 0x3C, 0x00, 0x00, 0x00,
      0x09, 0x70, 0x48, 0x59, 0x73, 0x00, 0x00, 0x0E, 0xC4, 0x00, 0x00, 0x0E,
      0xC4, 0x01, 0x95, 0x2B, 0x0E, 0x1B, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
      0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]),
    fileName: "sample_image.png",
    mimeType: "image/png"
  },
  text: {
    name: "Plain Text Document",
    data: new TextEncoder().encode(
      "DevTasks Hex Viewer & Binary File Inspector.\n\n" +
      "This client-side utility displays files as a raw hex dump showing Offset, Hex byte pairs, and decoded ASCII.\n" +
      "Because it runs strictly in your browser (offline-ready), your data is never sent to any server.\n\n" +
      "Features:\n" +
      "- Drag & drop file support (up to 10MB)\n" +
      "- Custom row sizes (8, 16, or 32 bytes)\n" +
      "- Magic bytes file type recognition\n" +
      "- Instant client-side hashes (MD5, SHA-256)\n" +
      "- Highlight hex values and text representations synchronously by hovering!"
    ),
    fileName: "readme.txt",
    mimeType: "text/plain"
  },
  wasm: {
    name: "Mock WASM Module",
    data: new Uint8Array([
      0x00, 0x61, 0x73, 0x6D, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x60,
      0x00, 0x00, 0x60, 0x01, 0x7F, 0x00, 0x03, 0x02, 0x01, 0x00, 0x04, 0x04,
      0x01, 0x70, 0x00, 0x00, 0x05, 0x03, 0x01, 0x00, 0x01, 0x07, 0x11, 0x02,
      0x06, 0x6D, 0x65, 0x6D, 0x6F, 0x72, 0x79, 0x02, 0x00, 0x08, 0x6D, 0x61,
      0x69, 0x6E, 0x5F, 0x66, 0x75, 0x6E, 0x63, 0x00, 0x00, 0x0A, 0x09, 0x01,
      0x07, 0x00, 0x20, 0x00, 0x41, 0x02, 0x6C, 0x0B
    ]),
    fileName: "math.wasm",
    mimeType: "application/wasm"
  },
  empty: {
    name: "Empty File",
    data: new Uint8Array(0),
    fileName: "empty.bin",
    mimeType: "application/octet-stream"
  }
};

const HexInspector = () => {
  const { dark } = useTheme();
  const fileInputRef = useRef(null);

  // File states
  const [fileData, setFileData] = useState(PRESETS.text.data);
  const [fileName, setFileName] = useState(PRESETS.text.fileName);
  const [fileSize, setFileSize] = useState(PRESETS.text.data.length);
  const [fileType, setFileType] = useState(PRESETS.text.mimeType);
  const [detectedFormat, setDetectedFormat] = useState("Plain Text");
  
  // Hashing states
  const [md5Hash, setMd5Hash] = useState("");
  const [sha256Hash, setSha256Hash] = useState("");
  const [loadingHashes, setLoadingHashes] = useState(false);
  const [copiedHash, setCopiedHash] = useState({ md5: false, sha256: false });

  // Navigation & configuration states
  const [pageSize, setPageSize] = useState(1024); // 1KB
  const [currentPage, setCurrentPage] = useState(0);
  const [bytesPerRow, setBytesPerRow] = useState(16);
  const [viewTab, setViewTab] = useState("hex"); // "hex" or "text"
  const [hoveredByteIndex, setHoveredByteIndex] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Direct address jump state
  const [addressInput, setAddressInput] = useState("");

  const totalPages = Math.ceil(fileSize / pageSize) || 1;


  // Magic bytes recognition
  const detectFormat = (bytes) => {
    if (bytes.length === 0) {
      setDetectedFormat("Empty File");
      return;
    }

    const match = (signature) => {
      if (bytes.length < signature.length) return false;
      for (let i = 0; i < signature.length; i++) {
        if (bytes[i] !== signature[i]) return false;
      }
      return true;
    };

    if (match(PNG_SIGNATURE)) {
      setDetectedFormat("PNG Image");
      return;
    }
    if (match([0xFF, 0xD8, 0xFF])) {
      setDetectedFormat("JPEG Image");
      return;
    }
    if (match([0x47, 0x49, 0x46, 0x38])) {
      setDetectedFormat("GIF Image");
      return;
    }
    if (match([0x52, 0x49, 0x46, 0x46]) && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      setDetectedFormat("WebP Image");
      return;
    }
    if (match([0x25, 0x50, 0x44, 0x46])) {
      setDetectedFormat("PDF Document");
      return;
    }
    if (match([0x50, 0x4B, 0x03, 0x04])) {
      setDetectedFormat("ZIP Archive");
      return;
    }
    if (match([0x52, 0x61, 0x72, 0x21, 0x1A, 0x07])) {
      setDetectedFormat("RAR Archive");
      return;
    }
    if (bytes[0] === 0x4D && bytes[1] === 0x5A) {
      setDetectedFormat("Windows Executable (EXE/DLL)");
      return;
    }
    if (match([0x7F, 0x45, 0x4C, 0x46])) {
      setDetectedFormat("ELF Executable");
      return;
    }
    if (match(WASM_SIGNATURE)) {
      setDetectedFormat("WebAssembly Binary (WASM)");
      return;
    }
    if (match([0x1F, 0x8B])) {
      setDetectedFormat("GZIP Archive");
      return;
    }
    if (match([0x3C, 0x3F, 0x78, 0x6D, 0x6C])) {
      setDetectedFormat("XML File");
      return;
    }

    // Default heuristics for text vs binary
    let textChars = 0;
    const checkLength = Math.min(bytes.length, 256);
    for (let i = 0; i < checkLength; i++) {
      const b = bytes[i];
      if (b === 9 || b === 10 || b === 13 || (b >= 32 && b <= 126) || b >= 160) {
        textChars++;
      }
    }

    if (textChars / checkLength > 0.85) {
      setDetectedFormat("Plain Text / Source Code");
    } else {
      setDetectedFormat("Unknown Binary");
    }
  };

  // Generate hashes client-side using CryptoJS / Web Crypto
  const generateHashes = async (bytes) => {
    if (bytes.length === 0) {
      setMd5Hash("d41d8cd98f00b204e9800998ecf8427e"); // md5 hash of empty string
      setSha256Hash("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"); // sha256 of empty string
      return;
    }

    setLoadingHashes(true);

    // Yield thread to show loading state
    setTimeout(async () => {
      try {
        // CryptoJS expects WordArray. We create it from a Uint8Array
        const wordArray = CryptoJS.lib.WordArray.create(bytes);
        const md5 = CryptoJS.MD5(wordArray).toString();
        setMd5Hash(md5);

        // Compute SHA-256 using standard Web Crypto if available, falling back to CryptoJS
        if (window.crypto && window.crypto.subtle) {
          const hashBuffer = await window.crypto.subtle.digest("SHA-256", bytes.buffer || bytes);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const sha256 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          setSha256Hash(sha256);
        } else {
          const sha256 = CryptoJS.SHA256(wordArray).toString();
          setSha256Hash(sha256);
        }
      } catch (err) {
        console.error("Hash calculation failed", err);
        toast.error("Failed to calculate hashes");
      } finally {
        setLoadingHashes(false);
      }
    }, 100);
  };

  // Trigger format detection and hash generation on file data change
  useEffect(() => {
    detectFormat(fileData);
    generateHashes(fileData);
    setCurrentPage(0);
  }, [fileData]);


  // Load a file
  const handleFile = (file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size limits exceeded (max 10MB)");
      return;
    }

    const reader = new FileReader();
    setFileName(file.name);
    setFileSize(file.size);
    setFileType(file.type || "application/octet-stream");

    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      setFileData(new Uint8Array(arrayBuffer));
      toast.success(`Successfully loaded ${file.name}`);
    };

    reader.onerror = () => {
      toast.error("Failed to read file.");
    };

    reader.readAsArrayBuffer(file);
  };

  // Preset loader
  const loadPreset = (key) => {
    const preset = PRESETS[key];
    if (preset) {
      setFileName(preset.fileName);
      setFileSize(preset.data.length);
      setFileType(preset.mimeType);
      setFileData(preset.data);
      toast.success(`Loaded preset: ${preset.name}`);
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Copy helper
  const handleCopyText = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHash(prev => ({ ...prev, [key]: true }));
      toast.success("Copied to clipboard!");
      setTimeout(() => {
        setCopiedHash(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch {
      toast.error("Failed to copy text.");
    }
  };

  // Address Jumper handler
  const handleAddressJump = (e) => {
    e.preventDefault();
    if (!addressInput.trim()) return;

    const cleanInput = addressInput.trim().toLowerCase();

    const targetOffset = cleanInput.startsWith("0x")
      ? parseInt(cleanInput, 16)
      : parseInt(cleanInput, 10);


    if (isNaN(targetOffset) || targetOffset < 0 || targetOffset >= fileSize) {
      toast.error(`Invalid offset. Please choose a value between 0 and ${fileSize - 1}.`);
      return;
    }

    const targetPage = Math.floor(targetOffset / pageSize);
    setCurrentPage(targetPage);
    setAddressInput("");
    toast.success(`Jumped to offset 0x${targetOffset.toString(16).toUpperCase()}`);
  };

  // Decoded text stream for full text view mode
  const getFullTextStream = () => {
    try {
      const pageData = fileData.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
      const decoder = new TextDecoder("utf-8", { fatal: false });
      return decoder.decode(pageData);
    } catch {
      return "Unable to decode page as UTF-8 stream.";
    }
  };

  // Formatter for readable bytes size
  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Render hex table representation
  const renderHexRows = () => {
    const rows = [];
    const startOffset = currentPage * pageSize;
    const pageData = fileData.slice(startOffset, startOffset + pageSize);

    for (let i = 0; i < pageData.length; i += bytesPerRow) {
      const rowBytes = pageData.slice(i, i + bytesPerRow);
      const rowOffset = startOffset + i;
      const offsetStr = rowOffset.toString(16).padStart(8, "0");

      const hexCells = [];
      const textCells = [];

      for (let j = 0; j < bytesPerRow; j++) {
        const byteIndex = i + j;
        const hasByte = j < rowBytes.length;

        if (hasByte) {
          const byte = rowBytes[j];
          const byteHex = byte.toString(16).padStart(2, "0").toUpperCase();
          const isHovered = hoveredByteIndex === byteIndex;

          hexCells.push(
            <span
              key={`hex-${j}`}
              onMouseEnter={() => setHoveredByteIndex(byteIndex)}
              onMouseLeave={() => setHoveredByteIndex(null)}
              className={`cursor-pointer px-1 py-0.5 rounded font-mono text-[11px] sm:text-xs transition-colors duration-100 ${
                isHovered
                  ? dark
                    ? "bg-white text-black font-bold"
                    : "bg-black text-white font-bold"
                  : dark
                  ? "text-zinc-300 hover:bg-zinc-800"
                  : "text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {byteHex}
            </span>
          );

          // Standard ASCII printable heuristic (32-126)
          const isPrintable = byte >= 32 && byte <= 126;
          const char = isPrintable ? String.fromCharCode(byte) : ".";

          textCells.push(
            <span
              key={`text-${j}`}
              onMouseEnter={() => setHoveredByteIndex(byteIndex)}
              onMouseLeave={() => setHoveredByteIndex(null)}
              className={`cursor-pointer px-0.5 rounded font-mono text-[11px] sm:text-xs transition-colors duration-100 ${
                isHovered
                  ? dark
                    ? "bg-white text-black font-bold"
                    : "bg-black text-white font-bold"
                  : dark
                  ? "text-zinc-400 hover:bg-zinc-800"
                  : "text-neutral-500 hover:bg-neutral-250"
              }`}
            >
              {char}
            </span>
          );
        } else {
          // Spacer cells
          hexCells.push(
            <span key={`hex-empty-${j}`} className="px-1 text-zinc-700/30 select-none font-mono text-xs">
              --
            </span>
          );
          textCells.push(
            <span key={`text-empty-${j}`} className="px-0.5 text-zinc-750/30 select-none font-mono text-xs">
              &nbsp;
            </span>
          );
        }

        // Visual middle splitter
        const mid = bytesPerRow / 2;
        if (j === mid - 1) {
          hexCells.push(
            <span key={`hex-gap-${j}`} className="w-2.5 sm:w-4 inline-block select-none"></span>
          );
          textCells.push(
            <span key={`text-gap-${j}`} className="w-1.5 sm:w-2 inline-block select-none"></span>
          );
        }
      }

      rows.push(
        <div
          key={`row-${i}`}
          className={`flex items-center space-x-2 sm:space-x-4 py-0.5 px-2 rounded transition-colors ${
            dark ? "hover:bg-zinc-900/30" : "hover:bg-neutral-100/50"
          }`}
        >
          {/* Offset Hex Address */}
          <span className={`font-mono text-[11px] sm:text-xs select-none shrink-0 ${
            dark ? "text-zinc-500" : "text-neutral-450"
          }`}>
            {offsetStr}
          </span>

          <span className={`h-4 border-r shrink-0 ${
            dark ? "border-zinc-800" : "border-neutral-200"
          }`}></span>

          {/* Hexadecimal Values */}
          <div className="flex items-center space-x-[2px] sm:space-x-1 shrink-0">
            {hexCells}
          </div>

          <span className={`h-4 border-r shrink-0 ${
            dark ? "border-zinc-800" : "border-neutral-200"
          }`}></span>

          {/* ASCII Characters */}
          <div className="flex items-center space-x-[1px] shrink-0 font-mono">
            {textCells}
          </div>
        </div>
      );
    }

    return rows;
  };

  return (
    <div
      className={`min-h-[calc(100vh-76px)] px-4 sm:px-6 py-6 transition-colors duration-300 overflow-y-auto relative flex flex-col justify-center ${
        dark ? "bg-zinc-950" : "bg-[#F7F7F7]"
      }`}
    >
      <title>Hex Viewer & Binary File Inspector — DevTasks</title>
      <meta
        name="description"
        content="Inspect binary file headers, offsets, hex patterns, and ASCII streams client-side offline."
      />

      {/* Radial Blurs */}
      <div
        className={`absolute top-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-20 pointer-events-none transition-colors duration-500 ${
          dark ? "bg-zinc-800" : "bg-neutral-200"
        }`}
      />
      <div
        className={`absolute bottom-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full blur-[100px] opacity-20 pointer-events-none transition-colors duration-500 ${
          dark ? "bg-zinc-900" : "bg-neutral-100"
        }`}
      />

      <div
        className={`relative z-10 w-full max-w-6xl mx-auto rounded-[32px] border shadow-xl flex flex-col max-h-[90vh] md:max-h-[85vh] overflow-hidden transition-all duration-300 ${
          dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-neutral-200"
        }`}
      >
        <div className={`h-2 w-full transition-colors duration-500 ${dark ? "bg-white" : "bg-black"}`} />

        {/* Header */}
        <div className="px-5 sm:px-8 pt-5 pb-3 flex flex-wrap gap-4 items-center justify-between border-b border-transparent shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/devutilities"
              className={`p-2 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center shrink-0 ${
                dark
                  ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600"
                  : "bg-white border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-300"
              }`}
              title="Back to Workspace"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className={`text-lg sm:text-xl font-black uppercase tracking-tight min-w-0 ${dark ? "text-white" : "text-black"}`}>
              Hex Viewer & Binary Inspector
            </h1>
          </div>

          {/* Quick Presets Selection */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] uppercase tracking-widest font-black ${dark ? "text-zinc-500" : "text-neutral-500"}`}>
              Presets:
            </span>
            <button
              onClick={() => loadPreset("text")}
              className={`px-2.5 py-1 text-xs rounded-lg border font-bold transition-all duration-200 ${
                fileName === "readme.txt"
                  ? dark ? "bg-white text-black border-white" : "bg-black text-white border-black"
                  : dark ? "border-zinc-800 text-zinc-450 hover:border-zinc-700 hover:text-white" : "border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-black"
              }`}
            >
              Text
            </button>
            <button
              onClick={() => loadPreset("png")}
              className={`px-2.5 py-1 text-xs rounded-lg border font-bold transition-all duration-200 ${
                fileName === "sample_image.png"
                  ? dark ? "bg-white text-black border-white" : "bg-black text-white border-black"
                  : dark ? "border-zinc-800 text-zinc-450 hover:border-zinc-700 hover:text-white" : "border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-black"
              }`}
            >
              PNG Image
            </button>
            <button
              onClick={() => loadPreset("wasm")}
              className={`px-2.5 py-1 text-xs rounded-lg border font-bold transition-all duration-200 ${
                fileName === "math.wasm"
                  ? dark ? "bg-white text-black border-white" : "bg-black text-white border-black"
                  : dark ? "border-zinc-800 text-zinc-450 hover:border-zinc-700 hover:text-white" : "border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-black"
              }`}
            >
              WASM
            </button>
            <button
              onClick={() => loadPreset("empty")}
              className={`px-2.5 py-1 text-xs rounded-lg border font-bold transition-all duration-200 ${
                fileName === "empty.bin"
                  ? dark ? "bg-white text-black border-white" : "bg-black text-white border-black"
                  : dark ? "border-zinc-800 text-zinc-450 hover:border-zinc-700 hover:text-white" : "border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-black"
              }`}
            >
              Empty
            </button>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 flex flex-col lg:flex-row gap-6 min-h-0">
          
          {/* Left Panel: Upload, metadata and control panel */}
          <div className="w-full lg:w-96 flex flex-col space-y-4 shrink-0">
            
            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-2 group ${
                isDragOver
                  ? dark ? "border-white bg-zinc-800/30" : "border-black bg-neutral-100"
                  : dark
                  ? "border-zinc-850 hover:border-zinc-700 bg-zinc-950/40"
                  : "border-neutral-250 hover:border-neutral-400 bg-neutral-50/50"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="hidden"
              />
              <FiUploadCloud className={`w-8 h-8 transition-colors ${dark ? "text-zinc-500 group-hover:text-white" : "text-neutral-400 group-hover:text-black"}`} />
              <div className="text-xs font-bold uppercase tracking-wider">Drag & drop a file here</div>
              <div className={`text-[10px] ${dark ? "text-zinc-650" : "text-neutral-400"}`}>or click to browse filesystem (Max 10MB)</div>
            </div>

            {/* Config controls */}
            <div className={`border rounded-2xl p-4 space-y-3 ${dark ? "border-zinc-850 bg-zinc-950/20" : "border-neutral-200 bg-neutral-50/20"}`}>
              <h3 className={`text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 ${dark ? "text-zinc-400" : "text-neutral-550"}`}>
                <FiSettings /> Display Configuration
              </h3>

              {/* Bytes per row */}
              <div className="space-y-1.5">
                <label className={`text-[10px] font-bold uppercase tracking-widest ${dark ? "text-zinc-500" : "text-neutral-450"}`}>Bytes Per Row</label>
                <div className="grid grid-cols-3 gap-2">
                  {[8, 16, 32].map((size) => (
                    <button
                      key={size}
                      onClick={() => setBytesPerRow(size)}
                      className={`py-1 rounded-lg border text-xs font-bold transition-all ${
                        bytesPerRow === size
                          ? dark ? "bg-white text-black border-white" : "bg-black text-white border-black"
                          : dark ? "border-zinc-800 text-zinc-400 hover:text-white" : "border-neutral-200 text-neutral-555 hover:text-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Page size dropdown */}
              <div className="space-y-1">
                <label className={`text-[10px] font-bold uppercase tracking-widest ${dark ? "text-zinc-500" : "text-neutral-450"}`}>Buffer Page Size</label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(0);
                  }}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs font-medium outline-none transition-all ${
                    dark
                      ? "bg-zinc-950 border-zinc-850 text-white focus:border-white"
                      : "bg-neutral-50 border-neutral-250 text-black focus:border-black"
                  }`}
                >
                  <option value={512}>512 Bytes (0.5KB)</option>
                  <option value={1024}>1024 Bytes (1.0KB)</option>
                  <option value={2048}>2048 Bytes (2.0KB)</option>
                  <option value={4096}>4096 Bytes (4.0KB)</option>
                  <option value={8192}>8192 Bytes (8.0KB)</option>
                </select>
              </div>
            </div>

            {/* Metadata Box */}
            <div className={`border rounded-2xl p-4 space-y-3 flex-1 ${dark ? "border-zinc-850 bg-zinc-950/20" : "border-neutral-200 bg-neutral-50/20"}`}>
              <h3 className={`text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 ${dark ? "text-zinc-400" : "text-neutral-550"}`}>
                <FiDatabase /> File Metadata
              </h3>

              <div className="space-y-2.5 text-xs font-mono">
                <div>
                  <div className={`text-[9px] uppercase tracking-wider font-bold ${dark ? "text-zinc-500" : "text-neutral-450"}`}>File Name</div>
                  <div className={`truncate max-w-full font-bold ${dark ? "text-zinc-200" : "text-neutral-850"}`} title={fileName}>
                    {fileName}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className={`text-[9px] uppercase tracking-wider font-bold ${dark ? "text-zinc-500" : "text-neutral-450"}`}>File Size</div>
                    <div className={dark ? "text-zinc-200" : "text-neutral-850"}>{formatBytes(fileSize)}</div>
                  </div>
                  <div>
                    <div className={`text-[9px] uppercase tracking-wider font-bold ${dark ? "text-zinc-500" : "text-neutral-450"}`}>Total Bytes</div>
                    <div className={dark ? "text-zinc-200" : "text-neutral-850"}>{fileSize.toLocaleString()}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className={`text-[9px] uppercase tracking-wider font-bold ${dark ? "text-zinc-500" : "text-neutral-450"}`}>File Type</div>
                    <div className={`truncate ${dark ? "text-zinc-200" : "text-neutral-850"}`} title={fileType}>
                      {fileType}
                    </div>
                  </div>
                  <div>
                    <div className={`text-[9px] uppercase tracking-wider font-bold ${dark ? "text-zinc-500" : "text-neutral-450"}`}>Signatures</div>
                    <div className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-white font-bold font-sans">
                      {detectedFormat}
                    </div>
                  </div>
                </div>

                <span className={`block border-t ${dark ? "border-zinc-850" : "border-neutral-200"}`}></span>

                {/* Hashes section */}
                <div className="space-y-2">
                  <div className={`text-[9px] uppercase tracking-wider font-bold flex items-center justify-between ${dark ? "text-zinc-500" : "text-neutral-450"}`}>
                    <span>Client Hashes</span>
                    {loadingHashes && (
                      <span className="flex items-center gap-1 text-[9px] text-zinc-500">
                        <svg className="animate-spin h-3.5 w-3.5 text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Calculating...
                      </span>
                    )}
                  </div>

                  {/* MD5 Hash */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className={dark ? "text-zinc-400" : "text-neutral-500"}>MD5</span>
                      <button
                        onClick={() => handleCopyText(md5Hash, "md5")}
                        disabled={!md5Hash}
                        className={`p-1 rounded hover:bg-zinc-800/25 transition ${dark ? "text-zinc-400 hover:text-white" : "text-neutral-500 hover:text-black"}`}
                        title="Copy MD5"
                      >
                        {copiedHash.md5 ? <FiCheck className="text-green-500" /> : <FiCopy />}
                      </button>
                    </div>
                    <div className={`text-[11px] select-all break-all border p-1.5 rounded-lg font-mono ${
                      dark ? "bg-zinc-950 border-zinc-850 text-zinc-300" : "bg-neutral-50 border-neutral-200 text-neutral-600"
                    }`}>
                      {md5Hash || "Calculating..."}
                    </div>
                  </div>

                  {/* SHA-256 Hash */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className={dark ? "text-zinc-400" : "text-neutral-500"}>SHA-256</span>
                      <button
                        onClick={() => handleCopyText(sha256Hash, "sha256")}
                        disabled={!sha256Hash}
                        className={`p-1 rounded hover:bg-zinc-800/25 transition ${dark ? "text-zinc-400 hover:text-white" : "text-neutral-500 hover:text-black"}`}
                        title="Copy SHA-256"
                      >
                        {copiedHash.sha256 ? <FiCheck className="text-green-500" /> : <FiCopy />}
                      </button>
                    </div>
                    <div className={`text-[11px] select-all break-all border p-1.5 rounded-lg font-mono ${
                      dark ? "bg-zinc-950 border-zinc-850 text-zinc-300" : "bg-neutral-50 border-neutral-200 text-neutral-600"
                    }`}>
                      {sha256Hash || "Calculating..."}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Right Panel: Main Hex Editor view */}
          <div className="flex-1 flex flex-col min-w-0 border rounded-2xl overflow-hidden bg-zinc-950">
            
            {/* Toolbar */}
            <div className={`px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-850 bg-zinc-900`}>
              
              {/* Tab Selector */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setViewTab("hex")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    viewTab === "hex"
                      ? "bg-white text-black border-white"
                      : "border-transparent text-zinc-400 hover:text-white"
                  }`}
                >
                  Hex Dump View
                </button>
                <button
                  onClick={() => setViewTab("text")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    viewTab === "text"
                      ? "bg-white text-black border-white"
                      : "border-transparent text-zinc-400 hover:text-white"
                  }`}
                >
                  UTF-8 Text Stream
                </button>
              </div>

              {/* Jump to offset Address Form */}
              <form onSubmit={handleAddressJump} className="flex items-center space-x-1.5">
                <input
                  type="text"
                  placeholder="Offset (e.g. 0x20 or 256)"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  className={`px-2.5 py-1.5 rounded-lg border border-zinc-800 text-xs font-mono outline-none w-44 transition-all bg-zinc-950 text-white focus:border-white placeholder-zinc-700`}
                />
                <button
                  type="submit"
                  className={`px-3 py-1.5 rounded-lg border border-zinc-750 text-zinc-300 hover:bg-zinc-800 hover:text-white bg-zinc-850 transition-all`}
                >
                  Go
                </button>
              </form>
            </div>

            {/* Viewer Pane */}
            <div className="flex-1 overflow-x-auto overflow-y-auto p-4 bg-zinc-950 text-white min-h-[300px]">
              {fileSize === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 space-y-2 select-none">
                  <FiFile className="w-12 h-12" />
                  <div className="text-sm font-bold font-mono">EOF - 0 BYTES LOADED</div>
                  <div className="text-xs">This file is empty. Try loading a sample preset.</div>
                </div>
              ) : viewTab === "hex" ? (
                <div className="min-w-fit space-y-0.5 pr-4 select-text">
                  {renderHexRows()}
                </div>
              ) : (
                <pre className="font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed select-text p-2 break-all max-w-full">
                  {getFullTextStream()}
                </pre>
              )}
            </div>

            {/* Footer Navigation */}
            {fileSize > 0 && (
              <div className={`px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t shrink-0 select-none bg-zinc-900 border-zinc-850`}>
                {/* Offset range indicator */}
                <div className="font-mono text-xs font-semibold text-zinc-400">
                  Offset:{" "}
                  <span className="text-white">
                    0x{(currentPage * pageSize).toString(16).toUpperCase().padStart(4, "0")}
                  </span>
                  {" - "}
                  <span className="text-white">
                    0x{Math.min(fileSize - 1, (currentPage + 1) * pageSize - 1).toString(16).toUpperCase().padStart(4, "0")}
                  </span>{" "}
                  (of 0x{(fileSize - 1).toString(16).toUpperCase()})
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(0)}
                    className={`p-2 rounded-lg border text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-zinc-855 border-zinc-750 text-zinc-300 hover:bg-zinc-800 hover:text-white`}
                    title="First Page"
                  >
                    0x0000
                  </button>

                  <button
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    className={`p-2 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-zinc-855 border-zinc-750 text-zinc-300 hover:bg-zinc-800 hover:text-white`}
                    title="Previous Page"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-bold font-mono text-zinc-400">
                    Page {currentPage + 1} of {totalPages}
                  </span>

                  <button
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    className={`p-2 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-zinc-855 border-zinc-750 text-zinc-300 hover:bg-zinc-800 hover:text-white`}
                    title="Next Page"
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage(totalPages - 1)}
                    className={`p-2 rounded-lg border text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-zinc-855 border-zinc-750 text-zinc-300 hover:bg-zinc-800 hover:text-white`}
                    title="Last Page"
                  >
                    End
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default HexInspector;
