import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

const sampleUrl =
  "https://example.com:8080/products/search?category=web%20tools&redirect=https%3A%2F%2Fdevtasks.app%2Fdashboard&page=2&sort=latest#results";

const emptyParts = {
  protocol: "",
  hostname: "",
  port: "",
  pathname: "",
  hash: "",
};

const UrlParserBuilder = () => {
  const { dark } = useTheme();
  const [rawUrl, setRawUrl] = useState("");
  const [parts, setParts] = useState(emptyParts);
  const [params, setParams] = useState([]);
  const [decodeValues, setDecodeValues] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const theme = {
    wrapper: dark ? "bg-[#090A0F] text-zinc-100" : "bg-[#F8F9FA] text-zinc-900",
    panel: dark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200",
    input: dark
      ? "bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
      : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400",
    button: dark
      ? "bg-white text-black hover:bg-zinc-200"
      : "bg-black text-white hover:bg-zinc-800",
    ghost: dark
      ? "border-zinc-700 hover:bg-zinc-800"
      : "border-zinc-200 hover:bg-zinc-100",
  };

  const parseUrl = (value) => {
    setRawUrl(value);
    setCopied(false);

    if (!value.trim()) {
      setParts(emptyParts);
      setParams([]);
      setError("");
      return;
    }

    try {
      const parsed = new URL(value);

      setParts({
        protocol: parsed.protocol.replace(":", ""),
        hostname: parsed.hostname,
        port: parsed.port,
        pathname: parsed.pathname,
        hash: parsed.hash.replace("#", ""),
      });

      setParams(
        Array.from(parsed.searchParams.entries()).map(([key, value]) => ({
          id: crypto.randomUUID(),
          key,
          value,
        }))
      );

      setError("");
    } catch {
      setError("Please enter a valid absolute URL, for example https://example.com/path?name=value");
    }
  };

  const buildUrl = (nextParts = parts, nextParams = params) => {
    try {
      const protocol = nextParts.protocol || "https";
      const hostname = nextParts.hostname || "example.com";
      const base = `${protocol.replace(":", "")}://${hostname}`;

      const url = new URL(base);

      url.port = nextParts.port || "";
      url.pathname = nextParts.pathname || "/";
      url.hash = nextParts.hash ? `#${nextParts.hash.replace("#", "")}` : "";

      nextParams.forEach((param) => {
        if (param.key.trim()) {
          url.searchParams.append(param.key, param.value);
        }
      });

      setRawUrl(url.toString());
      setError("");
    } catch {
      setError("Could not rebuild URL. Please check the URL fields.");
    }
  };

  const updatePart = (field, value) => {
    const nextParts = { ...parts, [field]: value };
    setParts(nextParts);
    buildUrl(nextParts, params);
  };

  const updateParam = (id, field, value) => {
    const nextParams = params.map((param) =>
      param.id === id ? { ...param, [field]: value } : param
    );

    setParams(nextParams);
    buildUrl(parts, nextParams);
  };

  const addParam = () => {
    const nextParams = [...params, { id: crypto.randomUUID(), key: "", value: "" }];
    setParams(nextParams);
  };

  const deleteParam = (id) => {
    const nextParams = params.filter((param) => param.id !== id);
    setParams(nextParams);
    buildUrl(parts, nextParams);
  };

  const loadSample = () => {
    parseUrl(sampleUrl);
  };

  const clearUrl = () => {
    setRawUrl("");
    setParts(emptyParts);
    setParams([]);
    setError("");
    setCopied(false);
  };

  const copyUrl = async () => {
    if (!rawUrl) return;

    await navigator.clipboard.writeText(rawUrl);
    setCopied(true);
  };

  const displayParams = useMemo(() => {
    if (decodeValues) return params;

    return params.map((param) => ({
      ...param,
      value: encodeURIComponent(param.value),
    }));
  }, [params, decodeValues]);

  return (
    <div className={`${theme.wrapper} min-h-screen w-full p-4 md:p-8 transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto">
        <Link
          to="/devutilities"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-current mb-8"
        >
          ← Back to Dev Utilities
        </Link>

        <header className="mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            URL Parser & Query Builder
          </h1>
          <p className="text-zinc-500 font-medium mt-2">
            Parse, edit, rebuild, and copy URLs completely offline.
          </p>
        </header>

        <section className={`${theme.panel} border rounded-3xl p-5 md:p-6 mb-6`}>
          <label className="text-xs font-black uppercase tracking-widest text-zinc-500">
            URL Input / Output
          </label>
          <textarea
            value={rawUrl}
            onChange={(e) => parseUrl(e.target.value)}
            placeholder="Paste a full URL here..."
            className={`${theme.input} mt-3 w-full min-h-[120px] border rounded-2xl p-4 outline-none font-mono text-sm resize-y`}
          />

          {error && <p className="text-red-500 text-sm font-semibold mt-3">{error}</p>}

          <div className="flex flex-wrap gap-3 mt-5">
            <button onClick={loadSample} className={`${theme.button} px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest`}>
              Sample URL
            </button>
            <button onClick={copyUrl} className={`${theme.ghost} border px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest`}>
              {copied ? "Copied" : "Copy URL"}
            </button>
            <button onClick={clearUrl} className={`${theme.ghost} border px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest`}>
              Clear URL
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`${theme.panel} border rounded-3xl p-5 md:p-6`}>
            <h2 className="text-xl font-black uppercase tracking-tight mb-5">
              URL Breakdown
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {["protocol", "hostname", "port", "pathname", "hash"].map((field) => (
                <div key={field}>
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">
                    {field}
                  </label>
                  <input
                    value={parts[field]}
                    onChange={(e) => updatePart(field, e.target.value)}
                    className={`${theme.input} mt-2 w-full border rounded-xl px-4 py-3 outline-none font-mono text-sm`}
                    placeholder={field === "protocol" ? "https" : field}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={`${theme.panel} border rounded-3xl p-5 md:p-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <h2 className="text-xl font-black uppercase tracking-tight">
                Query Parameters
              </h2>

              <button
                onClick={() => setDecodeValues((value) => !value)}
                className={`${theme.ghost} border px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest`}
              >
                {decodeValues ? "Decoded" : "Encoded"}
              </button>
            </div>

            <div className="space-y-3">
              {displayParams.length === 0 && (
                <p className="text-sm text-zinc-500 font-medium">
                  No query parameters yet. Add one below.
                </p>
              )}

              {displayParams.map((param) => (
                <div key={param.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
                  <input
                    value={param.key}
                    onChange={(e) => updateParam(param.id, "key", e.target.value)}
                    placeholder="key"
                    className={`${theme.input} border rounded-xl px-4 py-3 outline-none font-mono text-sm`}
                  />
                  <input
                    value={param.value}
                    onChange={(e) => updateParam(param.id, "value", e.target.value)}
                    placeholder="value"
                    className={`${theme.input} border rounded-xl px-4 py-3 outline-none font-mono text-sm`}
                  />
                  <button
                    onClick={() => deleteParam(param.id)}
                    className="border border-red-500/40 text-red-500 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              ))}

              <button
                onClick={addParam}
                className={`${theme.button} w-full px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest`}
              >
                Add Parameter
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UrlParserBuilder;