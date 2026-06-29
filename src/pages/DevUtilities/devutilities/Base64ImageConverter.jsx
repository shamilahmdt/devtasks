import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { toast } from "sonner";

export default function Base64ImageConverter() {
  const { dark } = useTheme();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
    const [base64, setBase64] = useState("");
    const [outputFormat, setOutputFormat] = useState("raw");
    const [copied, setCopied] = useState(false);
    const [decodeInput, setDecodeInput] = useState("");
const [decodedImage, setDecodedImage] = useState("");
const [decodeError, setDecodeError] = useState("");
const [metadata, setMetadata] = useState({
  name: "",
  type: "",
  size: "",
  width: 0,
  height: 0,
});
  const handleImage = (file) => {
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    toast.error("Image must be smaller than 5MB");
    return;
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    const dataUrl = e.target.result;

    setImage(file);
    setPreview(dataUrl);
    setBase64(dataUrl);

    const img = new Image();

    img.onload = () => {
      setMetadata({
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        width: img.width,
        height: img.height,
      });
    };

    img.src = dataUrl;
  };

  reader.readAsDataURL(file);
};
const handleCopy = async () => {
  let text = "";

  if (outputFormat === "raw") {
    text = base64;
  } else if (outputFormat === "html") {
    text = `<img src="${base64}" alt="Image" />`;
  } else {
    text = `background-image: url('${base64}');`;
  }

  await navigator.clipboard.writeText(text);

  setCopied(true);

  setTimeout(() => {
    setCopied(false);
  }, 2000);

  toast.success("Copied!");
};
const handleClear = () => {
  setImage(null);
  setPreview("");
  setBase64("");

  setDecodeInput("");
setDecodedImage("");
setDecodeError("");

  setMetadata({
    name: "",
    type: "",
    size: "",
    width: 0,
    height: 0,
  });
};
const handleDecode = () => {
  if (!decodeInput.trim()) {
    toast.error("Please paste a Base64 string");
    return;
  }

  try {
  atob(
    decodeInput.trim().replace(/^data:image\/.*;base64,/, "")
  );

  let data = decodeInput.trim();

  if (!data.startsWith("data:image")) {
    data = `data:image/png;base64,${data}`;
  }

  setDecodedImage(data);
  setDecodeError("");
  toast.success("Image decoded successfully!");
} catch {
  setDecodedImage("");
  setDecodeError("Invalid Base64 Image");
}
};
const handleDownload = () => {
  if (!decodedImage) return;

  const link = document.createElement("a");
  link.href = decodedImage;
  link.download = image
  ? `decoded-${image.name}`
  : "decoded-image.png";
  link.click();
};
const handleDownloadBase64 = () => {
  if (!base64) return;

  const blob = new Blob([base64], {
    type: "text/plain",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "image-base64.txt";
  a.click();

  URL.revokeObjectURL(url);
};
  return (
    <div
      className={`min-h-screen p-6 ${
        dark ? "bg-zinc-950 text-white" : "bg-white text-black"
      }`}
    >
      <Link
        to="/devutilities"
        className="inline-block mb-6 px-4 py-2 rounded-lg border"
      >
        ← Back
      </Link>

      <h1 className="text-3xl font-bold mb-8">
        Base64 Image Encoder & Decoder
      </h1>

      <label
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleImage(file);
  }}
  className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer ${
    dark ? "border-zinc-600" : "border-zinc-300"
  }`}
>
        <div className="text-center">
  <p className="text-lg font-bold">
    Drag & Drop an Image
  </p>

  <p className="mt-2 text-sm opacity-70">
    or click to browse
  </p>

  <p className="mt-2 text-xs opacity-50">
    PNG • JPG • JPEG • GIF • SVG • WebP (Max 5MB)
  </p>
</div>
{image && (
  <p className="mt-4 text-sm opacity-70">
    Selected: {image.name}
  </p>
)}

        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImage(e.target.files[0])}
        />
      </label>

      {preview && (
  <>
    <div className="mt-8 flex justify-center">
  <img
    src={preview}
    alt="Preview"
    className="w-auto max-w-full max-h-[450px] object-contain rounded-xl border"
  />
</div>

    <div className="mt-6 rounded-xl border p-4">
      <h3 className="text-xl font-bold mb-4">
        Image Details
      </h3>

      <p className="mb-2"><strong>Name:</strong> {metadata.name}</p>
      <p><strong>Type:</strong> {metadata.type}</p>
      <p><strong>Size:</strong> {metadata.size}</p>
      <p>
        <strong>Dimensions:</strong>{" "}
        {metadata.width} × {metadata.height}
      </p>
    </div>

    <div className="mt-6">
      <label className="font-bold block mb-2">
        Base64 Output
      </label>
<div className="flex gap-3 mb-3">
  {["raw", "html", "css"].map((type) => (
    <button
      key={type}
      onClick={() => setOutputFormat(type)}
      className={`px-4 py-2 rounded-lg border ${
        outputFormat === type
          ? dark
            ? "bg-white text-black"
            : "bg-black text-white"
          : dark
          ? "bg-zinc-800 border-zinc-700"
          : "bg-white border-zinc-300"
      }`}
    >
      {type.toUpperCase()}
    </button>
  ))}
</div>
      <textarea
  value={
    outputFormat === "raw"
      ? base64
      : outputFormat === "html"
      ? `<img src="${base64}" alt="Image" />`
      : `background-image: url('${base64}');`
  }
  readOnly
  rows={12}
  onFocus={(e) => e.target.select()}
  className={`w-full rounded-xl border p-3 resize-none ${
    dark
      ? "bg-zinc-900 border-zinc-700 text-white"
      : "bg-white border-zinc-300 text-black"
  }`}
/>
<button
  onClick={handleDecode}
  className={`mt-4 px-5 py-2 rounded-xl border transition-all ${
    dark
      ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
      : "bg-white border-zinc-300 hover:bg-zinc-100"
  }`}
>
  Decode Image
</button>
<p className="mt-2 text-sm opacity-70">
  Characters: {base64.length.toLocaleString()}
</p>
    </div>

    <div className="flex gap-4 mt-4">
  <button
  onClick={handleCopy}
  disabled={!base64}
  className={`px-5 py-2 rounded-xl border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
    dark
      ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
      : "bg-white border-zinc-300 hover:bg-zinc-100"
  }`}
>
  {copied ? "Copied ✓" : "Copy Base64"}
</button>
<button
  onClick={handleDownloadBase64}
  disabled={!base64}
  className={`px-5 py-2 rounded-xl border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
    dark
      ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
      : "bg-white border-zinc-300 hover:bg-zinc-100"
  }`}
>
  Download TXT
</button>
  <button
  onClick={handleClear}
  className={`px-5 py-2 rounded-xl border transition-all ${
    dark
      ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
      : "bg-white border-zinc-300 hover:bg-zinc-100"
  }`}
>
  Clear
</button>
</div>





</>
)}
<div className="mt-20 border rounded-2xl p-8">
  <h2 className="text-2xl font-bold mb-4">
    Base64 → Image
  </h2>

  <textarea
    rows={10}
    value={decodeInput}
    onChange={(e) => setDecodeInput(e.target.value)}
    placeholder="Paste Base64 string here..."
    className={`w-full rounded-xl border p-3 resize-none ${
      dark
        ? "bg-zinc-900 border-zinc-700 text-white"
        : "bg-white border-zinc-300 text-black"
    }`}
  />

  

  {decodeError && (
    <p className="text-red-500 mt-4">
      {decodeError}
    </p>
  )}

  {decodedImage && (
    <>
    <h3 className="mt-6 text-lg font-bold">
  Decoded Preview
</h3>
      <div className="flex justify-center mt-6">
  <img
    src={decodedImage}
    alt="Decoded"
    className="max-h-96 rounded-xl border object-contain"
  />
</div>

      <div className="flex justify-center mt-4">
  <button
  onClick={handleDownload}
  disabled={!decodedImage}
    className={`px-5 py-2 rounded-xl border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
      dark
        ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
        : "bg-white border-zinc-300 hover:bg-zinc-100"
    }`}
  >
    Download Image
  </button>
</div>
    </>
  )}
</div>

</div>
);
}