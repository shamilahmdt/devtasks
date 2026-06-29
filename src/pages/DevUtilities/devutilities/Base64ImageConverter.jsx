import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { toast } from "sonner";

export default function Base64ImageConverter() {
  const { dark } = useTheme();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
    const [base64, setBase64] = useState("");
    
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
  await navigator.clipboard.writeText(base64);
  toast.success("Copied!");
};
const handleClear = () => {
  setImage(null);
  setPreview("");
  setBase64("");

  setMetadata({
    name: "",
    type: "",
    size: "",
    width: 0,
    height: 0,
  });
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
        className="max-h-80 rounded-xl border"
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

      <textarea
        value={base64}
        readOnly
        rows={12}
        className={`w-full rounded-xl border p-3 resize-none ${
          dark
            ? "bg-zinc-900 border-zinc-700 text-white"
            : "bg-white border-zinc-300 text-black"
        }`}
      />
    </div>

    <div className="flex gap-4 mt-4">
      <button
        onClick={handleCopy}
        className={`px-5 py-2 rounded-xl border transition-all ${
  dark
    ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
    : "bg-white border-zinc-300 hover:bg-zinc-100"
}`}
      >
        Copy Base64
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
    </div>
  );
}