import { useState } from "react";
import { toast } from "sonner";

export default function Base64Url() {
  const [mode, setMode] = useState("base64");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const encode = () => {
    try {
      if (mode === "base64") setOutput(btoa(input));
      else setOutput(encodeURIComponent(input));
    } catch { toast.error("Encode failed"); }
  };

  const decode = () => {
    try {
      if (mode === "base64") setOutput(atob(input));
      else setOutput(decodeURIComponent(input));
    } catch { toast.error("Decode failed"); }
  };

  return (
    <div className="p-4">
      <h1>Base64 & URL Converter</h1>
      <div>
        <button onClick={() => setMode("base64")}>Base64</button>
        <button onClick={() => setMode("url")}>URL</button>
      </div>
      <textarea rows="4" value={input} onChange={e => setInput(e.target.value)} />
      <textarea rows="4" value={output} readOnly />
      <button onClick={encode}>Encode</button>
      <button onClick={decode}>Decode</button>
      <button onClick={() => { setInput(""); setOutput(""); }}>Clear</button>
      <button onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied!"); }}>Copy</button>
    </div>
  );
}